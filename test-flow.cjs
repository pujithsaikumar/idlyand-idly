const http = require('http');

function makeRequest(url, options, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runComprehensiveTests() {
  console.log('====================================================');
  console.log('TESTING ALL ORDER AND STAFF FLOWS (A TO Z)');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log('  [PASS] ' + message);
      passed++;
    } else {
      console.error('  [FAIL] ' + message);
      failed++;
    }
  }

  // ----------------------------------------------------
  // SECTION 1: AUTHENTICATION TESTS
  // ----------------------------------------------------
  console.log('1. Testing Staff & Admin Authentication...');
  
  // 1.1 Admin Login
  const adminLogin = await makeRequest('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@idlyandidly.com', password: 'Admin@123' });
  assert(adminLogin.status === 200 && adminLogin.body.user && adminLogin.body.user.role === 'admin', 'Admin login successful with role admin');
  const adminToken = adminLogin.body?.token;

  // 1.2 Staff 1 Login
  const staff1Login = await makeRequest('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'staff1@idlyandidly.com', password: 'Staff1@123' });
  assert(staff1Login.status === 200 && staff1Login.body.user && staff1Login.body.user.role === 'staff', 'Staff 1 login successful with role staff');
  const staff1Token = staff1Login.body?.token;

  // 1.3 Staff 2 Login
  const staff2Login = await makeRequest('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'staff2@idlyandidly.com', password: 'Staff2@123' });
  assert(staff2Login.status === 200 && staff2Login.body.user && staff2Login.body.user.role === 'staff', 'Staff 2 login successful with role staff');

  // 1.4 Invalid credentials check
  const badLogin = await makeRequest('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@idlyandidly.com', password: 'WrongPassword' });
  assert(badLogin.status === 401, 'Unauthorized 401 returned for invalid password');

  // 1.5 Missing token protection
  const unauthOrders = await makeRequest('http://localhost:5000/api/orders', { method: 'GET' });
  assert(unauthOrders.status === 401, 'Protected /api/orders blocked with 401 when missing token');

  // ----------------------------------------------------
  // SECTION 2: CUSTOMER ORDER PLACEMENT & PRICING RULES
  // ----------------------------------------------------
  console.log('\n2. Testing Customer Order Placement & Pricing Calculations...');

  // 2.1 Order with 2-pcs half portion pairing (< 100 subtotal)
  const orderA = await makeRequest('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    customer_name: 'Test Customer A',
    phone: '9876543210',
    hostel: 'Leaders Hostel',
    payment_method: 'cod',
    items: [
      { name: 'Mysore Bonda (2 pcs)', price: 25, quantity: 1 },
      { name: 'Medu Vada (2 pcs)', price: 30, quantity: 1 }
    ]
  });
  assert(orderA.status === 201, 'Order A placed successfully (Status 201)');
  const orderAData = orderA.body.order;
  assert(orderAData.subtotal === 55, 'Subtotal correctly calculated: Rs 55');
  assert(orderAData.parcel_fee === 5, 'Smart 2-pcs half portion pairing parcel fee: Rs 5 (paired into 1 container)');
  assert(orderAData.delivery_fee === 10, 'Delivery fee for Leaders Hostel (< Rs 100): Rs 10');
  assert(orderAData.total === 70, 'Total bill calculated correctly: Rs 70');

  // 2.2 Order for VVH Hostel (< 100 subtotal => Rs 20 delivery fee)
  const orderB = await makeRequest('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    customer_name: 'Test Customer B',
    phone: '9123456780',
    hostel: 'VVH Hostel',
    payment_method: 'upi',
    upi_utr: '123456789012',
    items: [
      { name: 'Ghee Sambar Idly (2 pcs)', price: 35, quantity: 1 }
    ]
  });
  assert(orderB.status === 201, 'Order B for VVH Hostel placed');
  assert(orderB.body.order.delivery_fee === 20, 'VVH Hostel delivery fee (< Rs 100) is Rs 20');

  // 2.3 Order with Subtotal >= 100 => FREE Delivery (Rs 0)
  const orderC = await makeRequest('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    customer_name: 'Test Customer C',
    phone: '9988776655',
    hostel: 'IGH Hostel',
    payment_method: 'cod',
    items: [
      { name: 'Hyderabadi Chicken Dum Biryani', price: 200, quantity: 1 }
    ]
  });
  assert(orderC.status === 201, 'Order C (Biryani) placed');
  assert(orderC.body.order.delivery_fee === 0, 'Free delivery applied on subtotal >= Rs 100 for IGH Hostel (Rs 0)');
  assert(orderC.body.order.parcel_fee === 10, 'Biryani parcel fee: Rs 10');

  // ----------------------------------------------------
  // SECTION 3: 3-MINUTE WINDOW (EDIT & CANCEL)
  // ----------------------------------------------------
  console.log('\n3. Testing 3-Minute Customer Live Tracker Operations...');

  // 3.1 Order tracking polling
  const trackRes = await makeRequest('http://localhost:5000/api/orders/' + orderAData.id, { method: 'GET' });
  assert(trackRes.status === 200 && trackRes.body.order.id === orderAData.id, 'Live order status polled successfully');

  // 3.2 Modify Order within 3 minutes (Add any dish from menu)
  const modifyRes = await makeRequest('http://localhost:5000/api/orders/' + orderAData.id + '/modify', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  }, {
    customer_name: 'Test Customer A (Edited)',
    phone: '9876543210',
    hostel: 'Leaders Hostel',
    items: [
      { name: 'Mysore Bonda (2 pcs)', price: 25, quantity: 1 },
      { name: 'Medu Vada (2 pcs)', price: 30, quantity: 1 },
      { name: 'Ghee Karam Dosa', price: 60, quantity: 1 }
    ]
  });
  assert(modifyRes.status === 200, 'Customer modified order within 3 mins (Added Dosa)');
  assert(modifyRes.body.order.subtotal === 115, 'New subtotal updated to Rs 115');
  assert(modifyRes.body.order.delivery_fee === 0, 'Delivery fee automatically became FREE (subtotal >= Rs 100)');

  // 3.3 Customer Cancel Order within 3 minutes
  const cancelRes = await makeRequest('http://localhost:5000/api/orders/' + orderB.body.order.id + '/cancel', {
    method: 'PATCH'
  });
  assert(cancelRes.status === 200 && cancelRes.body.order.order_status === 'cancelled', 'Customer cancelled Order B within 3 minutes');

  // ----------------------------------------------------
  // SECTION 4: STAFF LIVE ORDERS STREAM & DISPATCH
  // ----------------------------------------------------
  console.log('\n4. Testing Staff Live Orders Stream & Status Transitions...');

  // 4.1 Staff fetch stream
  const staffStream = await makeRequest('http://localhost:5000/api/orders', {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + staff1Token }
  });
  assert(staffStream.status === 200 && Array.isArray(staffStream.body.orders), 'Staff retrieved live orders list');

  // 4.2 Status Transition: pending -> preparing
  const prepRes = await makeRequest('http://localhost:5000/api/orders/' + orderAData.id + '/status', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + staff1Token }
  }, { order_status: 'preparing' });
  assert(prepRes.status === 200 && prepRes.body.order.order_status === 'preparing', 'Staff updated status to preparing');

  // 4.3 Cancel after cooking started should fail
  const lateCancel = await makeRequest('http://localhost:5000/api/orders/' + orderAData.id + '/cancel', { method: 'PATCH' });
  assert(lateCancel.status === 400, 'Customer cancellation blocked after kitchen started preparation');

  // 4.4 Status Transition: preparing -> en_route
  const enRouteRes = await makeRequest('http://localhost:5000/api/orders/' + orderAData.id + '/status', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + staff1Token }
  }, { order_status: 'en_route' });
  assert(enRouteRes.status === 200 && enRouteRes.body.order.order_status === 'en_route', 'Staff updated status to en_route');

  // 4.5 Status Transition: en_route -> delivered (auto verify payment)
  const deliveredRes = await makeRequest('http://localhost:5000/api/orders/' + orderAData.id + '/status', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + staff1Token }
  }, { order_status: 'delivered' });
  assert(deliveredRes.status === 200 && deliveredRes.body.order.order_status === 'delivered', 'Staff updated status to delivered');
  assert(deliveredRes.body.order.payment_status === 'paid', 'Payment automatically marked as paid upon delivery');

  // 4.6 Manual Payment Verification
  const verifyPayRes = await makeRequest('http://localhost:5000/api/orders/' + orderC.body.order.id + '/verify-payment', {
    method: 'PATCH',
    headers: { 'Authorization': 'Bearer ' + adminToken }
  });
  assert(verifyPayRes.status === 200 && verifyPayRes.body.order.payment_status === 'paid', 'Staff manually verified payment');

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log('RESULTS: ' + passed + ' PASSED | ' + failed + ' FAILED');
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('\n>>> ALL 20 FLOW CHECKS PASSED WITH 100% HEALTH! READY TO DEPLOY. <<<');
  }
}

runComprehensiveTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
