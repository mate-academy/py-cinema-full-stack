import { test, expect } from '@playwright/test';

async function login (page, email = 'admin@example.com') {
  await page.goto('/#/sign-in');
  await page.locator('.sign-in input').nth(0).fill(email);
  await page.locator('.sign-in input').nth(1).fill('Cinema-demo-2026!');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByText(email, { exact: true })).toBeVisible();
  await expect(page.locator('.movie-card').first()).toBeVisible();
}

async function capture (page, name, testInfo) {
  await page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: true });
}

test('customer registration, profile, correct screening, seats, history and logout', async ({ page }, testInfo) => {
  const failures = [];
  page.on('pageerror', error => failures.push(error.message));
  await page.goto('/#/sign-up');
  await capture(page, 'sign-up', testInfo);
  const email = `customer-${Date.now()}@example.com`;
  await page.locator('.sign-up input').nth(0).fill(email);
  await page.locator('.sign-up input').nth(1).fill('Customer-password-2026!');
  await page.getByRole('button', { name: 'Sign up', exact: true }).click();
  await expect(page.getByText(email, { exact: true })).toBeVisible();
  await expect(page.locator('.movie-card').first()).toBeVisible();
  await capture(page, 'movies', testInfo);
  await page.locator('.movie-card').first().click();
  await expect(page.locator('.modal-wrapper')).toBeVisible();
  await expect(page.locator('.modal-wrapper')).toContainText('Beyond the Stars');
  await capture(page, 'movie-details', testInfo);
  await page.goto('/#/movie-sessions');
  await expect(page.locator('.time')).toHaveCount(6);
  await capture(page, 'sessions', testInfo);
  const secondTime = page.locator('.time').nth(1);
  const chosenTime = await secondTime.innerText();
  await secondTime.click();
  await expect(page.locator('.session-details')).toBeVisible();
  await expect(page.locator('.info')).toContainText(`Time: ${chosenTime}`);
  await page.locator('.seat:not(.booked)').first().click();
  await page.getByRole('button', { name: 'Make order' }).click();
  await expect(page.locator('.seat.booked')).toHaveCount(1);
  await expect(page.locator('.seat.reserved')).toHaveCount(0);
  await capture(page, 'booked-session', testInfo);
  await page.goto('/#/my-orders');
  await expect(page.locator('.order')).toHaveCount(1);
  await capture(page, 'orders', testInfo);
  await page.goto('/#/my-profile');
  const updated = `updated-${Date.now()}@example.com`;
  await page.locator('.profile input').first().fill(updated);
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('Updated', { exact: true })).toBeVisible();
  await expect(page.locator('.username')).toHaveText(updated);
  await capture(page, 'profile', testInfo);
  await page.reload();
  await expect(page.locator('.username')).toHaveText(updated);
  await page.getByRole('button', { name: 'Log Out' }).click();
  await expect(page.locator('.sign-in')).toBeVisible();
  expect(failures).toEqual([]);
});

test('staff catalogue screens create genre, actor, hall, movie with image and session', async ({ page }, testInfo) => {
  await login(page);
  await page.goto('/#/genres');
  await expect(page.locator('.genres')).toContainText('Adventure');
  await capture(page, 'genres', testInfo);
  await page.locator('.add').click();
  await page.locator('.add-genre input').fill('Sci-Fi');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.locator('.genres')).toContainText('Sci-Fi');
  await page.goto('/#/actors');
  await expect(page.locator('.actor-container')).toBeVisible();
  await capture(page, 'actors', testInfo);
  await page.locator('.add').click();
  await page.locator('.add-actor input').nth(0).fill('Jamie');
  await page.locator('.add-actor input').nth(1).fill('Stone');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.locator('.actor-container')).toContainText('Jamie Stone');
  await page.goto('/#/cinema-halls');
  await expect(page.locator('.cinema-halls')).toBeVisible();
  await capture(page, 'halls', testInfo);
  await page.goto('/#/cinema-halls?add=true');
  await page.locator('.hall-container input').nth(0).fill('Studio');
  await page.locator('.hall-container input').nth(1).fill('3');
  await page.locator('.hall-container input').nth(2).fill('4');
  await capture(page, 'add-hall', testInfo);
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page).toHaveURL(/#\/cinema-halls$/);
  await page.goto('/#/movies?add=true');
  await page.locator('.movie-container input[type=text]').nth(0).fill('Integration premiere');
  await page.locator('.movie-container input[type=text]').nth(1).fill('95');
  await page.locator('textarea').fill('A movie created through the connected UI.');
  await page.getByText('Actors', { exact: true }).last().click();
  await page.getByText('Alex Rivera', { exact: true }).click();
  await page.getByText('Genres', { exact: true }).last().click();
  await page.getByText('Adventure', { exact: true }).click();
  await page.locator('input[type=file]').setInputFiles({
    name: 'poster.png', mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAFElEQVR4nGNkYPjPgA0wYRUdtBIAy0MBD1YkjLoAAAAASUVORK5CYII=', 'base64')
  });
  await capture(page, 'add-movie', testInfo);
  const uploaded = page.waitForResponse(response => response.url().includes('/upload-image/'));
  await page.getByRole('button', { name: 'Submit' }).click();
  expect((await uploaded).status()).toBe(200);
  await expect(page).toHaveURL(/#\/movies$/);
  await page.getByText('Integration premiere', { exact: true }).click();
  await expect(page.locator('.modal-wrapper')).toContainText('Integration premiere');
  await page.goto('/#/movie-sessions?add=true');
  await page.getByText('Movie', { exact: true }).click();
  await page.getByText('Integration premiere', { exact: true }).click();
  await page.getByText('Cinema Hall', { exact: true }).click();
  await page.getByText('Studio', { exact: true }).click();
  await capture(page, 'add-session', testInfo);
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page).toHaveURL(/#\/movie-sessions$/);
});

test('expired access refreshes once, keeps refresh token and retries protected request', async ({ page }) => {
  await login(page);
  const refreshBefore = await page.evaluate(() => localStorage.getItem('refresh'));
  await page.evaluate(() => localStorage.setItem('access', 'expired-access-token'));
  await page.reload();
  await expect(page.locator('.username')).toHaveText('admin@example.com');
  expect(await page.evaluate(() => localStorage.getItem('refresh'))).toBe(refreshBefore);
  await page.evaluate(() => {
    localStorage.setItem('access', 'expired-access-token');
    localStorage.setItem('refresh', 'invalid-refresh-token');
  });
  await page.reload();
  await expect(page.locator('.sign-in')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('refresh'))).toBeNull();
});
