import { test, expect } from 'playwright-test-coverage';


test('updateUser', async ({ page }) => {
    const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
    await page.goto('/');
    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
    await page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill('diner');
    await page.getByRole('button', { name: 'Register' }).click();

    await page.getByRole('link', { name: 'pd' }).click();

    await expect(page.getByRole('main')).toContainText('pizza diner');
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.locator('h3')).toContainText('Edit user');
    await page.getByRole('textbox').first().fill('pizza dinerx');
    await page.getByRole('button', { name: 'Update' }).click();

    await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

    await expect(page.getByRole('main')).toContainText('pizza dinerx');
    await page.getByRole('link', { name: 'Logout' }).click();
    await page.getByRole('link', { name: 'Login' }).click();

    await page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill('diner');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.getByRole('link', { name: 'pd' }).click();

    await expect(page.getByRole('main')).toContainText('pizza dinerx');
});

test('admin dashboard list', async ({ page }) => {
    await page.route('*/**/api/auth', async (route) => {
        const loginReq = { email: 'testa@jwt.com', password: 'admin' };
        const loginRes = {
        user: {
            id: 1,
            name: 'Admin User',
            email: 'testa@jwt.com',
            roles: [{ role: 'admin' }],
        },
        token: 'mnopqrs',
        };
        expect(route.request().method()).toBe('PUT');
        expect(route.request().postDataJSON()).toMatchObject(loginReq);
        await route.fulfill({ json: loginRes });
    });

    await page.route('**/api/user**', async (route) => {
        const mockUserList = {
            users: [
                {
                    id: 2,
                    name: 'Franchisee Bob',
                    email: 'bob@jwt.com',
                    roles: [{ role: 'franchisee' }],
                },
                {
                    id: 3,
                    name: 'Employee Alice',
                    email: 'alice@jwt.com',
                    roles: [{ role: 'diner' }],
                },
            ],
            more: false, 
        };
        // console.log('--- API MOCK HIT: /api/user ---'); 
        // console.log('Sending mock body:', JSON.stringify(mockUserList, null, 2));
        expect(route.request().method()).toBe('GET');
        await route.fulfill({ json: mockUserList });
    });

    await page.route(/\/api\/user\/\d+/, async (route) => {
        if (route.request().method() === 'DELETE') {
            //console.log('--- MOCK: DELETE user request hit ---');
            await route.fulfill({ status: 204 }); 
        }
    });

    await page.goto('/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByPlaceholder('Email address').click();
    await page.getByPlaceholder('Email address').fill('testa@jwt.com');
    await page.getByPlaceholder('Password').fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page.getByText('Users')).toBeVisible();
    await expect(page.getByText('Franchisee Bob')).toBeVisible();
    await expect(page.getByText('Employee Alice')).toBeVisible();

    // Delete Franchise Bob FOREVER!!!!! just kidding
    //const userRow = page.locator('tr', { hasText: 'Franchisee Bob' });
    //const deleteRequestPromise = page.waitForRequest((request) => request.method() === 'DELETE');
    //await userRow.getByRole('button', { name: 'Delete' }).click();
    //await deleteRequestPromise;
});