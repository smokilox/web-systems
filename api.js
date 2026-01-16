// api.js
const API_KEY = '0e55ab01-f559-4713-9470-81feb98eb9b7';

export async function fetchGoodsPage(page = 1, per_page = 10, sort_order = 'rating_desc') {
  const url = new URL('https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods');
  url.searchParams.append('api_key', API_KEY);
  url.searchParams.append('page', page);
  url.searchParams.append('per_page', per_page);
  url.searchParams.append('sort_order', sort_order);

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json(); // { _pagination, goods }
}

export async function fetchGoodById(id) {
  const url = `https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods/${id}?api_key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}

export async function fetchOrders() {
  const url = `https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders?api_key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}

export async function createOrder(orderData) {
  const url = `https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders?api_key=${API_KEY}`;
  const preparedData = {
    full_name: orderData.name,
    email: orderData.email,
    phone: orderData.phone,
    subscribe: orderData.subscribe || false,
    delivery_address: orderData.address,
    delivery_date: orderData.deliveryDate,
    delivery_interval: orderData.deliveryTime,
    comment: orderData.comment || '',
    good_ids: orderData.items
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preparedData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }
  return await response.json();
}

export async function updateOrder(orderId, orderData) {
  const url = `https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders/${orderId}?api_key=${API_KEY}`;
  const preparedData = {};
  if (orderData.name !== undefined) preparedData.full_name = orderData.name;
  if (orderData.email !== undefined) preparedData.email = orderData.email;
  if (orderData.phone !== undefined) preparedData.phone = orderData.phone;
  if (orderData.address !== undefined) preparedData.delivery_address = orderData.address;
  if (orderData.deliveryDate !== undefined) preparedData.delivery_date = orderData.deliveryDate;
  if (orderData.deliveryTime !== undefined) preparedData.delivery_interval = orderData.deliveryTime;
  if (orderData.comment !== undefined) preparedData.comment = orderData.comment;
  if (orderData.subscribe !== undefined) preparedData.subscribe = orderData.subscribe;

  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preparedData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }
  return await response.json();
}

export async function deleteOrder(orderId) {
  const url = `https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders/${orderId}?api_key=${API_KEY}`;
  const response = await fetch(url, { method: 'DELETE' });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }
  return await response.json();
}