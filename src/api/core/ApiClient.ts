import type { APIRequestContext } from '@playwright/test';

export class ApiClient {
  protected request: APIRequestContext;
  protected baseUrl: string;

  constructor(request: APIRequestContext, baseUrl: string) {
    this.request = request;
    this.baseUrl = baseUrl;
  }

  async get(endpoint: string, headers?: Record<string, string>) {
    return this.request.get(`${this.baseUrl}${endpoint}`, {
      ...(headers ? { headers } : {}),
    });
  }

  async post(endpoint: string, data?: Record<string, unknown>, headers?: Record<string, string>) {
    return this.request.post(`${this.baseUrl}${endpoint}`, {
      ...(data ? { data } : {}),
      ...(headers ? { headers } : {}),
    });
  }
}
