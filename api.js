// api.js
const API_KEY = '0e55ab01-f559-4713-9470-81feb98eb9b7';
const BASE_URL = 'https://webdev-exam.std-900.ist.mospolytech.ru/exam-2024-1/api';

export async function fetchGoods(params = {}) {
    const url = new URL(`${BASE_URL}/goods`);
    Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach(v => url.searchParams.append(key, v));
        } else if (value !== null && value !== undefined) {
            url.searchParams.append(key, value);
        }
    });

    const response = await fetch(url.toString(), {
        headers: { 'X-API-KEY': API_KEY }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
}

export async function fetchGoodById(id) {
    const response = await fetch(`${BASE_URL}/goods/${id}`, {
        headers: { 'X-API-KEY': API_KEY }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
}

export async function fetchOrders() {
    const response = await fetch(`${BASE_URL}/orders`, {
        headers: { 'X-API-KEY': API_KEY }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
}

export async function createOrder(orderData) {
    const response = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: {
            'X-API-KEY': API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
}

export async function updateOrder(id, orderData) {
    const response = await fetch(`${BASE_URL}/orders/${id}`, {
        method: 'PUT',
        headers: {
            'X-API-KEY': API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
}

export async function deleteOrder(id) {
    const response = await fetch(`${BASE_URL}/orders/${id}`, {
        method: 'DELETE',
        headers: { 'X-API-KEY': API_KEY }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
}