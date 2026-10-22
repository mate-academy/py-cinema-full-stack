import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';

const require = createRequire(import.meta.url);

function component (path, values = {}) {
  const source = readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8');
  const script = source.match(/<script>([\s\S]*?)<\/script>/)[1]
    .replace(/^import (\w+) from '([^']+)';$/gm, (_, name, specifier) => {
      values[name] = specifier.endsWith('.vue') ? {} : require(specifier);
      return '';
    })
    .replace(/^import \{ api as axios \} from '..\/api';$/gm, '')
    .replaceAll('import.meta.env.VITE_API_URL', "''")
    .replace('export default', 'result =');
  const context = vm.createContext({ console, ...values, result: null });
  vm.runInContext(script, context);
  return context.result;
}

function storage (entries = {}) {
  const items = new Map(Object.entries(entries));
  return {
    getItem: key => items.get(key) ?? null,
    setItem: (key, value) => items.set(key, String(value)),
    removeItem: key => items.delete(key)
  };
}

test('login submits to the Django token endpoint with its trailing slash', async () => {
  let request;
  const screen = component('views/SignIn.vue', { localStorage: storage() });
  await screen.methods.signIn.call({
    email: 'customer@example.com',
    password: 'test-password',
    axios: { post: async (url, body) => {
      request = { url, body };
      return { data: { access: 'access', refresh: 'refresh' } };
    } },
    $emit: () => {}
  });
  assert.equal(request.url, '/api/user/token/');
  assert.equal(request.body.email, 'customer@example.com');
});

test('movie details request the real resource endpoint', async () => {
  let requestedUrl;
  const screen = component('views/MovieDetailsScreen.vue');
  const instance = {
    token: 'access',
    axios: { get: async url => {
      requestedUrl = url;
      return { data: { id: 7 } };
    } }
  };
  await screen.methods.fetchMovie.call(instance, 7);
  assert.equal(requestedUrl, '/api/cinema/movies/7/');
  assert.equal(instance.movie.id, 7);
});

test('refresh preserves the refresh token when the API returns only access', async () => {
  const localStorage = storage({ refresh: 'original-refresh' });
  const app = component('App.vue', { localStorage });
  await app.methods.refreshToken.call({
    axios: { post: async () => ({ data: { access: 'new-access' } }) },
    logIn: async () => {}
  });
  assert.equal(localStorage.getItem('refresh'), 'original-refresh');
  assert.equal(localStorage.getItem('access'), 'new-access');
});

test('signed-out clients do not send refresh requests', async () => {
  let requests = 0;
  const app = component('App.vue', { localStorage: storage() });
  await app.methods.refreshToken.call({
    axios: { post: async () => {
      requests++;
      return { data: { access: 'unexpected' } };
    } },
    logIn: async () => {}
  });
  assert.equal(requests, 0);
});

test('invalid refresh clears the session', async () => {
  const localStorage = storage({ access: 'expired', refresh: 'expired-refresh' });
  let signedOut = false;
  const app = component('App.vue', { localStorage, console: { error: () => {} } });
  await app.methods.refreshToken.call({
    axios: { post: async () => { throw { response: { data: {}, status: 401 } }; } },
    logOut: () => {
      signedOut = true;
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
    }
  });
  assert.equal(signedOut, true);
  assert.equal(localStorage.getItem('refresh'), null);
});

test('grouped screening times retain their session IDs without mutating API data', () => {
  const screen = component('views/MovieSessionListScreen.vue');
  const sessions = [
    { id: 11, movie_title: 'Cinema', show_time: '2026-10-22T12:00:00' },
    { id: 12, movie_title: 'Cinema', show_time: '2026-10-22T18:00:00' }
  ];
  const before = JSON.stringify(sessions);
  const groups = screen.computed.movieSessionsGroupedByTime.call({ movieSessions: sessions });
  assert.equal(groups[0].times[1].id, 12);
  assert.equal(JSON.stringify(sessions), before);
});

test('clicking a screening time opens that exact session', () => {
  const screen = component('comps/MovieCard.vue');
  const times = [{ id: 11, show_time: '2026-10-22T12:00:00' },
    { id: 12, show_time: '2026-10-22T18:00:00' }];
  const formatted = screen.computed.formattedTime.call({ times });
  assert.equal(formatted[1].id, 12);
  assert.equal(formatted[1].label, '18:00');
});

test('creating a session preserves the local wall-clock time used by Django', async () => {
  let body;
  const axios = { post: async (_url, data) => { body = data; } };
  const screen = component('views/MovieSessionAddScreen.vue', { axios, location: {} });
  await screen.methods.addMovieSession.call({
    date: new Date(2026, 9, 22),
    time: new Date(2026, 9, 22, 18, 30),
    selectedMovieId: 1,
    selectedHallId: 1,
    token: 'access'
  });
  assert.equal(body.show_time, '2026-10-22T18:30:00');
});

test('selecting or clearing a select option always closes its menu', () => {
  const screen = component('comps/CustomSelect.vue');
  const selected = [];
  const instance = {
    selectedOption: {},
    shownOptions: true,
    $emit: (_event, value) => selected.push(value)
  };
  instance.toggleOptions = screen.methods.toggleOptions.bind(instance);
  screen.methods.handleOptionSelect.call(instance, { id: 4, name: 'Main' });
  assert.equal(instance.shownOptions, false);
  screen.methods.handleOptionSelect.call(instance, { id: 4, name: 'Main' });
  assert.equal(instance.shownOptions, false);
  assert.deepEqual(selected, [4, null]);
});
