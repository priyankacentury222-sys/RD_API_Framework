import { test as base } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { AuthService } from '../services/AuthService.js';
import { UserService } from '../services/UserService.js';

type MyFixtures = {
  userService: UserService;
};

export const test = base.extend<MyFixtures>({
  userService: async (
    { request }: { request: APIRequestContext },
    use: (value: UserService) => Promise<void>,
  ) => {
    const authService = new AuthService(request);
    const token = await authService.login('emilys', 'emilyspass');

    const userService = new UserService(request, token);
    await use(userService);
  },
});

export { expect } from '@playwright/test';
