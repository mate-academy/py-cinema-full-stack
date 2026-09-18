const test = require('node:test');
const assert = require('node:assert/strict');
const { groupSessionsByMovie } = require('../src/utils/sessionGrouping');

test('groups sessions without losing the session id for each show time', () => {
  const sessions = [
    { id: 11, movie_title: 'Titanic', show_time: '2026-09-18T18:00:00Z' },
    { id: 12, movie_title: 'Titanic', show_time: '2026-09-18T21:00:00Z' },
    { id: 13, movie_title: 'Ace Ventura', show_time: '2026-09-18T19:00:00Z' }
  ];

  assert.deepEqual(groupSessionsByMovie(sessions), [
    {
      id: 11,
      movie_title: 'Titanic',
      times: [
        { id: 11, show_time: '2026-09-18T18:00:00Z' },
        { id: 12, show_time: '2026-09-18T21:00:00Z' }
      ]
    },
    {
      id: 13,
      movie_title: 'Ace Ventura',
      times: [{ id: 13, show_time: '2026-09-18T19:00:00Z' }]
    }
  ]);

  assert.equal(sessions[0].show_time, '2026-09-18T18:00:00Z');
});
