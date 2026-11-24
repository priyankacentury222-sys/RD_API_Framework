import { test, expect, Route } from '@playwright/test';

// Defines the structure of one fruit item returned by the mocked API.
interface Fruit {
  name: string;
  id: number;
}

// The API URL that Playwright will intercept in every test.
const API_ENDPOINT = 'https://example.com';

// A self-contained test page that calls the API and renders the response.
// The page is loaded using page.setContent(), so no real web server is required.
const TEST_PAGE_HTML = `
  <!DOCTYPE html>
  <html>
    <body>
      <h1>Fruit Store</h1>
      <!-- Renders one list item for every fruit returned by the API. -->
      <ul id="fruit-list"></ul>
      <!-- Renders an error message when the API request fails. -->
      <p id="error-msg" style="color: red;"></p>
      <script>
        // Call the API endpoint. Playwright intercepts this request.
        fetch('${API_ENDPOINT}')
          .then(async (res) => {
            // Throw an error for unsuccessful HTTP responses such as 500.
            if (!res.ok) throw new Error('Failed to load fruits: ' + res.status);
            // Convert the successful response body into a JavaScript array.
            return res.json();
          })
          .then((fruits) => {
            // Find the list element and create a list item for each fruit.
            const ul = document.getElementById('fruit-list');
            fruits.forEach((f) => {
              const li = document.createElement('li');
              // Display the fruit name in the browser.
              li.textContent = f.name;
              ul.appendChild(li);
            });
          })
          .catch((err) => {
            // Display the fetch error when the mocked API returns a failure.
            document.getElementById('error-msg').textContent = err.message;
          });
      </script>
    </body>
  </html>
`;

test.describe('API Mocking Practice Scenarios', () => {

  // SCENARIO 1: Replace the API response with completely custom data (happy path).
  test('1. Replaces API response with custom mocked items', async ({ page }) => {
    // Intercept requests to API_ENDPOINT before they reach the real website.
    await page.route(API_ENDPOINT, async (route: Route) => {
      // Create a mock array that matches the Fruit[] structure.
      const mockFruits: Fruit[] = [
        { name: 'Alphonso Mango (Mocked)', id: 101 },
        { name: 'Kesar Mango (Mocked)', id: 102 },
      ];
      // Return the mock array as JSON instead of forwarding the real request.
      await route.fulfill({ json: mockFruits });
    });

    // Load the test HTML in the Playwright browser page.
    await page.setContent(TEST_PAGE_HTML);

    // Locate all list items rendered from the mocked API response.
    const items = page.locator('#fruit-list li');
    // Verify that exactly two fruits are rendered.
    await expect(items).toHaveCount(2);
    // Verify that both mocked fruit names are visible.
    await expect(page.getByText('Alphonso Mango (Mocked)')).toBeVisible();
    await expect(page.getByText('Kesar Mango (Mocked)')).toBeVisible();
  });

  // SCENARIO 2: Start with one data item and dynamically inject another item.
  test('2. Modifies an API payload dynamically before rendering', async ({ page }) => {
    // Intercept the API request and provide a custom response.
    await page.route(API_ENDPOINT, async (route: Route) => {
      // Define the original mock data.
      const baseFruits: Fruit[] = [{ name: 'Banana', id: 1 }];

      // Add an extra fruit dynamically before sending the response.
      baseFruits.push({ name: 'Dragonfruit (Injected)', id: 999 });

      // Return the modified array as JSON.
      await route.fulfill({ json: baseFruits });
    });

    // Load the test HTML and trigger the mocked API call.
    await page.setContent(TEST_PAGE_HTML);

    // Locate the rendered fruit list items.
    const items = page.locator('#fruit-list li');
    // Verify that two items are displayed after the injected item is added.
    await expect(items).toHaveCount(2);
    // Verify the original and injected fruit names.
    await expect(page.getByText('Banana')).toBeVisible();
    await expect(page.getByText('Dragonfruit (Injected)')).toBeVisible();
  });

  // SCENARIO 3: Simulate a 500 server error for negative testing.
  test('3. Simulates a 500 Internal Server Error', async ({ page }) => {
    // Intercept the API request and return an HTTP error response.
    await page.route(API_ENDPOINT, async (route: Route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        // Serialize the JSON error object into the response body.
        body: JSON.stringify({ error: 'Database connection failed' }),
      });
    });

    // Load the test HTML, which calls the intercepted API endpoint.
    await page.setContent(TEST_PAGE_HTML);

    // The error prevents any fruit list items from being created.
    await expect(page.locator('#fruit-list li')).toHaveCount(0);
    // The fetch catch block should display the HTTP status in the error element.
    await expect(page.locator('#error-msg')).toHaveText('Failed to load fruits: 500');
  });

});
