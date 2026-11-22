import type { APIRequestContext } from '@playwright/test';
import { ApiClient } from '../src/api/core/ApiClient.js';

export class UserService extends ApiClient {
  private token: string;

  constructor(request: APIRequestContext, token: string) {
    super(request, 'https://dummyjson.com');
    this.token = token;
  }

  async getProfile() {
    return super.get('/auth/me', {
      Authorization: 'Bearer ' + this.token,
    });
  }
}
