import { test, expect } from 'playwright-test-coverage';

test('updateUser', async ({ page }) => {
    const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
    const originalName = 'pizza diner';
    const updatedName = 'pizza dinerx';
    await page.route('*/**/api/auth', async (route) => {
        const req = route.request();
        if (req.method() === 'POST') {
            const registerReq = { name: originalName, email: email, password: 'diner' };
            const registerRes = {
                user: { id: 20, name: originalName, email: email, roles: [{ role: 'diner' }] },
                token: 'ghijkl',
            };
            expect(req.postDataJSON()).toMatchObject(registerReq);
            await route.fulfill({ json: registerRes, status: 200 });
        } else if (req.method() === 'PUT') {
            const loginReq = { email: email, password: 'diner' };
            const loginRes = {
                user: { id: 20, name: updatedName, email: email, roles: [{ role: 'diner' }] },
                token: 'abcdef',
            };
            expect(req.postDataJSON()).toMatchObject(loginReq);
            await route.fulfill({ json: loginRes, status: 200 });
        } else {
            await route.continue();
        }
    });
    let getUserCallCount = 0;
    await page.route('*/**/api/user/**/*', async (route) => {
        const req = route.request();
        if (req.method() === 'GET' && req.url().includes('/me')) {
            getUserCallCount++;
            
            const nameToReturn = getUserCallCount < 2 ? originalName : updatedName;
            
            const meRes = {
                id: 20,
                name: nameToReturn,
                email: email,
                roles: [{ role: 'diner' }],
            };

            await route.fulfill({ json: meRes, status: 200 });
            
        } else if (req.method() === 'PUT' || req.method() === 'PATCH') {
            
            const updateReq = { name: updatedName }; 
            const updateRes = { 
                user: { id: 20, name: updatedName, email: email, roles: [{ role: 'diner' }] }, 
                token: 'new-token', 
            };
            expect(req.postDataJSON()).toMatchObject(updateReq);
            
            await route.fulfill({ json: updateRes, status: 200 });
            
        } else {
            await route.continue();
        }
    });
    
    await page.goto('/');
    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByRole('textbox', { name: 'Full name' }).fill(originalName);
    await page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill('diner');
    await page.getByRole('button', { name: 'Register' }).click();

    await page.getByRole('link', { name: 'pd' }).click(); 

    await expect(page.getByRole('main')).toContainText(originalName);
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.locator('h3')).toContainText('Edit user');
    await page.getByRole('textbox').first().fill(updatedName);
    
    await page.getByRole('button', { name: 'Update' }).click(); 

    await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

    await expect(page.getByRole('main')).toContainText(updatedName);
    await page.getByRole('link', { name: 'Logout' }).click();
    await page.getByRole('link', { name: 'Login' }).click();

    await page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill('diner');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.getByRole('link', { name: 'pd' }).click();

    await expect(page.getByRole('main')).toContainText(updatedName);
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

    // ahhh I need to mock this as well
    await page.route(/\/api\/franchise/, async (route) => {
        if (route.request().method() === 'GET') {
            const mockFranchiseList = {
                    franchises: [
                    {
                        id: 2,
                        name: 'LotaPizza',
                        stores: [
                            { id: 4, name: 'Lehi' },
                            { id: 5, name: 'Springville' },
                            { id: 6, name: 'American Fork' },
                        ],
                    },
                    { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
                    { id: 4, name: 'topSpot', stores: [] },
                ], // Don't need real franchise data for the 'Franchisee Bob' test
                more: false,
            };
            await route.fulfill({ json: mockFranchiseList, status: 200 });
        } else {
            await route.continue();
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
    const userRow = page.locator('tr', { hasText: 'Franchisee Bob' });
    const deleteRequestPromise = page.waitForRequest((request) => request.method() === 'DELETE');
    await userRow.getByRole('button', { name: 'Delete' }).click();
    await deleteRequestPromise;

    // Search Tests
    const searchText = "randomInvalidSearch"
    const franchiseInput = page.getByPlaceholder('Filter franchises');
    await franchiseInput.fill(searchText);
    await page.getByRole('button', { name: 'Submit' }).click();
    const userInput = page.getByPlaceholder('Name', { exact: true });
    await userInput.fill(searchText);
    await page.getByRole('button', { name: 'Search' }).click();
});