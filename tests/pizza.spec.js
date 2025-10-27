import { test, expect } from 'playwright-test-coverage';

test('home page', async ({ page }) => {
  await page.goto('/');

  expect(await page.title()).toBe('JWT Pizza');
});

// test('buy pizza with login as admin, verify, and order more', async ({ page }) => {
//     await page.goto('http://localhost:5173/');
//     await page.getByRole('link', { name: 'Login' }).click();
//     await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
//     await page.getByRole('textbox', { name: 'Password' }).click();
//     await page.getByRole('textbox', { name: 'Password' }).fill('admin');
//     await page.getByRole('button', { name: 'Login' }).click();
//     await page.getByRole('link', { name: 'Order' }).click();
//     await page.getByRole('combobox').selectOption('3');
//     await page.getByRole('link', { name: 'Image Description Veggie A' }).first().click();
//     await page.getByRole('button', { name: 'Checkout' }).click();
//     await page.getByRole('button', { name: 'Pay now' }).click();
//     await page.getByRole('button', { name: 'Verify' }).click();
//     await page.getByRole('button').filter({ hasText: /^$/ }).click();
//     await page.getByRole('button', { name: 'Order more' }).click();
// });

test('purchase with login', async ({ page }) => {
  await page.route('*/**/api/user/me', async (route) => {
    const meRes = {
      id: 3,
      name: 'Kai Chen',
      email: 'd@jwt.com',
      roles: [{ role: 'diner' }],
    };
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: meRes });
  });

  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      {
        id: 1,
        title: 'Veggie',
        image: 'pizza1.png',
        price: 0.0038,
        description: 'A garden of delight',
      },
      {
        id: 2,
        title: 'Pepperoni',
        image: 'pizza2.png',
        price: 0.0042,
        description: 'Spicy treat',
      },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    const franchiseRes = {
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
      ],
    };
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'd@jwt.com', password: 'a' };
    const loginRes = {
      user: {
        id: 3,
        name: 'Kai Chen',
        email: 'd@jwt.com',
        roles: [{ role: 'diner' }],
      },
      token: 'abcdef',
    };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.route('*/**/api/order', async (route) => {
    const orderReq = {
      items: [
        { menuId: 1, description: 'Veggie', price: 0.0038 },
        { menuId: 2, description: 'Pepperoni', price: 0.0042 },
      ],
      storeId: '4',
      franchiseId: 2,
    };
    const orderRes = {
      order: {
        items: [
          { menuId: 1, description: 'Veggie', price: 0.0038 },
          { menuId: 2, description: 'Pepperoni', price: 0.0042 },
        ],
        storeId: '4',
        franchiseId: 2,
        id: 23,
      },
      jwt: 'eyJpYXQ',
    };
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject(orderReq);
    await route.fulfill({ json: orderRes });
  });

  await page.goto('/');

  // Go to order page
  await page.getByRole('button', { name: 'Order now' }).click();

  // Create order
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();

  // Login
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  // Pay
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();

  // Check balance
  await expect(page.getByText('0.008')).toBeVisible();
});

test('register new user', async ({ page }) => {
  await page.route('*/**/api/auth', async (route) => {
    const registerReq = { name: 'New User', email: 'newuser@email.com', password: 'nu' };
    const registerRes = {
      user: {
        id: 20,
        name: 'New User',
        email: 'newuser@email.com',
        roles: [{ role: 'diner' }],
      },
      token: 'ghijkl',
    };
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject(registerReq);
    await route.fulfill({ json: registerRes });
  });

  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByPlaceholder('Name').click();
  await page.getByPlaceholder('Name').fill('New User');
  await page.getByPlaceholder('Email address').fill('newuser@email.com');
  await page.getByPlaceholder('Password').fill('nu');
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.getByRole('button', { name: 'Order now' })).toBeVisible();
});

test('admin dashboard create and delete franchise', async ({ page }) => {
  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'testa@jwt.com', password: 'admin' };
    const loginRes = {
      user: {
        id: 1,
        name: 'Admin User',
        email: 'testa@jwt.com',
        roles: [{ role: 'admin' }],
      },
      token: 'mnopqr',
    };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    const franchiseRes = {
      franchises: [
        {
          id: 10,
          name: 'newFranchise',
          stores: [
            { id: 4, name: 'Lehi' },
            { id: 5, name: 'Springville' },
            { id: 6, name: 'American Fork' },
          ],
        },
        { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
        { id: 4, name: 'topSpot', stores: [] },
      ],
    };
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });


  await page.route('*/**/api/franchise', async (route) => {
    const createFranchiseReq = { name: 'newFranchise', admins: [{ email: 'testa@jwt.com' }] };
    const createFranchiseRes = { id: 10, name: 'newFranchise', admins: [{ id: 1, name: 'Admin User', email: 'testa@jwt.com' }] };
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject(createFranchiseReq);
    await route.fulfill({ json: createFranchiseRes });
  });

  await page.route('*/**/api/franchise/10', async (route) => {
    expect(route.request().method()).toBe('DELETE');
    await route.fulfill({ json: { message: 'franchise deleted' } });
  });

  await page.route('**/api/store/4', async (route) => {
    expect(route.request().method()).toBe('DELETE');
    await route.fulfill({ status: 200, json: { message: 'store deleted' } });
  });

  // Login as admin and go to admin dashboard
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('testa@jwt.com');
  await page.getByPlaceholder('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByText('Franchises')).toBeVisible();
  await expect(page.getByText('Add Franchise')).toBeVisible();

  // Create new franchise
  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).fill('newFranchise');
  await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
  await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('testa@jwt.com');
  await page.getByRole('button', { name: 'Create' }).click();
  await page.getByRole('link', { name: 'Admin', exact: true }).click();

  // Almost delete one of the new stores
  await expect(page.getByText('Lehi')).toBeVisible();
  await page.getByRole('row', { name: 'Lehi' }).getByRole('button', { name: 'Close' }).click();
  await expect(page.getByText('Are you sure you want to close the newFranchise store Lehi')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Are you sure you want to close the newFranchise store Lehi')).not.toBeVisible();

  // Delete the new franchise
  await expect(page.getByText('newFranchise')).toBeVisible();
  await page.getByRole('row', { name: 'newFranchise Close' }).getByRole('button').click();
  await expect(page.getByText('Are you sure you want to close the newFranchise franchise?')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByText('Are you sure you want to close the newFranchise franchise?')).not.toBeVisible();
});

test('franchise create store and close store', async ({ page }) => {
  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'testfranchise@jwt.com', password: 'testfranchise' };
    const loginRes = {
      user: {
        id: 2,
        name: 'Franchise User',
        email: 'testfranchise@jwt.com',
        roles: [{ role: 'franchisee' }],
        franchiseId: 2,
      },
      token: 'mnopqr',
    };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.route(/\/api\/franchise\/\d+$/, async (route) => {
        const franchiseRes = [
            { 
                id: 2, 
                name: 'pizzaPocket', 
                admins: [{ id: 2, name: 'pizza franchisee', email: 'testfranchise@jwt.com' }], 
                stores: [{ id: 4, name: 'SLC', totalRevenue: 0 }] 
            }
        ];
        expect(route.request().method()).toBe('GET');
        await route.fulfill({ json: franchiseRes });
  });

  await page.route('**/api/franchise/2/store', async (route) => {
    const createStoreReq = { name: 'Orem' };
    const createStoreRes = { 
        id: 11,
        name: 'Orem', 
        totalRevenue: 0 
    };
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject(createStoreReq);
    await route.fulfill({ json: createStoreRes, status: 201 });
  });

  await page.route('*/**/api/franchise/2/store/4', async (route) => {
    expect(route.request().method()).toBe('DELETE');
    await route.fulfill({ json: { message: 'store deleted' } });
  });



  // await page.route('*/**/api/franchise/2', async (route) => {
  //   const getUserFranchises = { franchiseId: 2, name: 'Orem' };
  //   const getUserFranchisesRes = { id: 11, name: 'Orem', totalRevenue: 0 };
  //   expect(route.request().method()).toBe('GET');
  //   expect(route.request().postDataJSON()).toMatchObject(getUserFranchises);
  //   await route.fulfill({ json: getUserFranchisesRes });
  // });

  // Login as franchisee and go to franchise dashboard
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('testfranchise@jwt.com');
  await page.getByPlaceholder('Password').fill('testfranchise');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Franchise' }).first().click();
  await expect(page.getByText('pizzaPocket')).toBeVisible();
  await expect(page.getByText('Create store')).toBeVisible();

  // Create new store
  await page.getByRole('button', { name: 'Create store' }).click();
  await page.getByRole('textbox', { name: 'store name' }).click();
  await page.getByRole('textbox', { name: 'store name' }).fill('Orem');
  await page.getByRole('button', { name: 'Create' }).click();
  await page.getByRole('link', { name: 'Franchise' }).first().click();

  // Close the old store
  await expect(page.getByText('SLC')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).first().click();
  await expect(page.getByText('Are you sure you want to close the pizzaPocket store SLC ?')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).first().click();
  await expect(page.getByText('Are you sure you want to close the pizzaPocket store SLC ?')).not.toBeVisible();
});

test('diner open dashboard', async ({ page }) => {
  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'testdiner@jwt.com', password: 'testdiner' };
    const loginRes = {
      user: {
        id: 5,
        name: 'Diner User',
        email: 'testdiner@jwt.com',
        roles: [{ role: 'diner' }]
      },
      token: 'asdfasdfasdf',
    };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  // Login as diner and go to diner dashboard
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('testdiner@jwt.com');
  await page.getByPlaceholder('Password').fill('testdiner');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'DU' }).click();
  await expect(page.getByText('diner-dashboard')).toBeVisible();
  await expect(page.getByText('Your pizza kitchen')).toBeVisible();
});

