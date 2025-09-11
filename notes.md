# Learning notes

## JWT Pizza code study and debugging

As part of `Deliverable ⓵ Development deployment: JWT Pizza`, start up the application and debug through the code until you understand how it works. During the learning process fill out the following required pieces of information in order to demonstrate that you have successfully completed the deliverable.

| User activity                                       | Frontend component | Backend endpoints | Database SQL |
| --------------------------------------------------- | ------------------ | ----------------- | ------------ |
| View home page                                      |  home.jsx          |  none             | none             |
| Register new user<br/>(t@jwt.com, pw: test)         |  register.jsx      |  [POST] /api/auth |`INSERT INTO user (name, email, password) VALUES (?, ?, ?)` <br/>`INSERT INTO userRole (userId, role, objectId) VALUES (?, ?, ?)`|
| Login new user<br/>(t@jwt.com, pw: test)            |  login.jsx             | [PUT] /api/auth   | `SELECT * FROM user WHERE email=?` <br/>`SELECT * FROM userRole WHERE userId=?`  |
| Order pizza                                         |  menu.jsx              | [POST] /api/order |`INSERT INTO dinerOrder (dinerId, franchiseId, storeId, date) VALUES (?, ?, ?, now())` <br/>`INSERT INTO orderItem (orderId, menuId, description, price) VALUES (?, ?, ?, ?)`             |
| Verify pizza                                        |  payment.jsx           | [GET] /api/order  |`SELECT id, franchiseId, storeId, date FROM dinerOrder WHERE dinerId=? LIMIT ${offset},${config.db.listPerPage}` <br/> `SELECT id, menuId, description, price FROM orderItem WHERE orderId=?`|
| View profile page                                   |  dinerDashboard.jsx    | [GET] /api/user/me| none         |
| View franchise<br/>(as diner)                       |  franchiseDashboard.jsx| none (it redirects to whyFranchise())| none (it redirects to whyFranchise())|
| Logout                                              |  logout.jsx            | [DELETE] /api/auth|`DELETE FROM auth WHERE token=?`|
| View About page                                     |  about.jsx             | none              | none         |
| View History page                                   |  history.jsx           | none              | none         |
| Login as franchisee<br/>(f@jwt.com, pw: franchisee) |  login.jsx             | [PUT] /api/auth |`SELECT * FROM user WHERE email=?` <br/>`SELECT * FROM userRole WHERE userId=?`|
| View franchise<br/>(as franchisee)                  |  franchiseDashboard.jsx| none   |`SELECT * FROM user WHERE email=?` <br/>`SELECT s.id, s.name, COALESCE(SUM(oi.price), 0) AS totalRevenue FROM dinerOrder AS do JOIN orderItem AS oi ON do.id=oi.orderId RIGHT JOIN store AS s ON s.id=do.storeId WHERE s.franchiseId=? GROUP BY s.id`|
| Create a store                                      |  createStore.jsx   | [POST] /:franchiseId/store |`INSERT INTO store (franchiseId, name) VALUES (?, ?)`|
| Close a store                                       |  closeStore.jsx        | [DELETE] /:franchiseId/store/:storeId|`DELETE FROM store WHERE franchiseId=? AND id=?`|
| Login as admin<br/>(a@jwt.com, pw: admin)           |  login.jsx             | [PUT] /api/auth | `SELECT * FROM user WHERE email=?` <br/>`SELECT * FROM userRole WHERE userId=?` |
| View Admin page                                     |  adminDashboard.jsx    | none  |`SELECT id, name FROM franchise WHERE name LIKE ? LIMIT ${limit + 1} OFFSET ${offset}` <br/> `SELECT id, name FROM store WHERE franchiseId=?`|
| Create a franchise for t@jwt.com                    |  createFranchise.jsx (/admin-dashboard/create-franchise)  | [POST] /api/franchise |`SELECT id, name FROM user WHERE email=?` <br/> `INSERT INTO franchise (name) VALUES (?)` <br/> `INSERT INTO userRole (userId, role, objectId) VALUES (?, ?, ?)`|
| Close the franchise for t@jwt.com                   |  closeFranchise.jsx  (/admin-dashboard/close-franchise) | [DELETE]  /api/franchise/:franchiseId |`DELETE FROM store WHERE franchiseId=?` <br/> `DELETE FROM userRole WHERE objectId=?` <br/> `DELETE FROM franchise WHERE id=?`|
