
import { test, expect } from '@playwright/test';
import { z } from 'zod';

// Step 1: Define expected API response schema
const UserSchema = z.object({
    id: z.number(),
    name: z.string(),
    username: z.string(),
    email: z.string(),
    address: z.object({
        street: z.string(),
        suite: z.string(),
        city: z.string(),
        zipcode: z.string()
    }),
    phone: z.string(),
    website: z.string()
});

// Step 2: Write API test
test('API Schema Validation', async ({ request }) => {

    // Step 3: Send GET request
    const response = await request.get(
        'https://jsonplaceholder.typicode.com/users/1'
    );

    // Step 4: Validate status code
    expect(response.status()).toBe(200);

    // Step 5: Get API response body
    const responseBody = await response.json();

    // Step 6: Validate response against schema
    const validationResult = UserSchema.safeParse(responseBody);

    // Step 7: Check schema validation result
    expect(
        validationResult.success,
        JSON.stringify(validationResult.success ? {} : validationResult.error.format())
    ).toBe(true);

    console.log('API Schema Validation Passed!');
});
