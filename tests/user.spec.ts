import { test, expect } from '../fixtures/apiFixture.js';

test('Validate user profile', async ({ userService }) => {
  const response = await userService.getProfile();

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body.username).toBe('emilys');
});
