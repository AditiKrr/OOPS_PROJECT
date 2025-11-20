// Wholesaler Dashboard JavaScript
import { protectPage, getCurrentUser, signOutUser } from './auth.js';

// Protect this page - redirect to homepage if not logged in
protectPage();

// Load user info
const currentUser = await getCurrentUser();
if (currentUser) {
    const userName = localStorage.getItem('userName') || currentUser.email;
    document.querySelectorAll('.user-name').forEach(el => {
        el.textContent = userName;
    });
}

// Logout function
window.handleDashboardLogout = async function() {
    if (confirm('Are you sure you want to logout?')) {
        const result = await signOutUser();
        if (result.success) {
            window.location.href = 'index.html';
        }
    }
}

// Sample Inventory Data
let wholesaleInventory = [
    { id: 1, productId: 'WP-001', name: 'Wireless Mouse Bulk', category: 'electronics', stock: 500, unitPrice: 1000, minOrder: 10, status: 'active' },
    { id: 2, productId: 'WP-002', name: 'Coffee Beans 25kg', category: 'groceries', stock: 250, unitPrice: 680, minOrder: 5, status: 'active' },
    { id: 3, productId: 'WP-003', name: 'Denim Jeans Bulk', category: 'clothing', stock: 150, unitPrice: 1440, minOrder: 20, status: 'active' },
    { id: 4, productId: 'WP-004', name: 'LED Bulbs Pack', category: 'home', stock: 45, unitPrice: 1200, minOrder: 50, status: 'active' },
    { id: 5, productId: 'WP-005', name: 'Keyboard Bulk', category: 'electronics', stock: 320, unitPrice: 2800, minOrder: 10, status: 'active' },
    { id: 6, productId: 'WP-006', name: 'Industrial Tools Set', category: 'industrial', stock: 80, unitPrice: 9600, minOrder: 5, status: 'active' },
];

// Sample Retailer Orders
let retailerOrders = [
    { id: 'RO-001', retailer: 'Tech Store Inc.', date: '2025-11-18', items: 3, quantity: 150, total: 153375, status: 'delivered' },
    { id: 'RO-002', retailer: 'Grocery Mart', date: '2025-11-19', items: 2, quantity: 100, total: 69550, status: 'shipped' },
    { id: 'RO-003', retailer: 'Fashion Hub', date: '2025-11-20', items: 5, quantity: 200, total: 294600, status: 'processing' },
    { id: 'RO-004', retailer: 'Home Depot', date: '2025-11-20', items: 2, quantity: 75, total: 92025, status: 'pending' },
];

// Sample Retailers
const retailers = [
    { id: 1, name: 'Tech Store Inc.', email: 'tech@store.com', phone: '555-0101', orders: 24, totalValue: 2332950, status: 'active' },
    { id: 2, name: 'Grocery Mart', email: 'info@grocerymart.com', phone: '555-0102', orders: 18, totalValue: 1251990, status: 'active' },
    { id: 3, name: 'Fashion Hub', email: 'contact@fashionhub.com', phone: '555-0103', orders: 32, totalValue: 4714080, status: 'active' },
    { id: 4, name: 'Home Depot', email: 'orders@homedepot.com', phone: '555-0104', orders: 15, totalValue: 1380338, status: 'active' },
];

// Sample Purchase History
const purchaseHistory = [
    { orderId: 'RO-001', date: '2025-11-18', retailer: 'Tech Store Inc.', products: 'Wireless Mouse, Keyboards', quantity: 150, amount: 153375, payment: 'paid' },
    { orderId: 'RO-002', date: '2025-11-19', retailer: 'Grocery Mart', products: 'Coffee Beans', quantity: 100, amount: 69550, payment: 'paid' },
    { orderId: 'RO-003', date: '2025-11-20', retailer: 'Fashion Hub', products: 'Denim Jeans', quantity: 200, amount: 294600, payment: 'pending' },
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadOverviewStats();
    loadRecentActivity();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            switchSection(section);
        });
    });

    // Add product button
    document.getElementById('addProductBtn')?.addEventListener('click', openAddProductModal);

    // Product form
    document.getElementById('productForm')?.addEventListener('submit', saveProduct);
    document.getElementById('cancelProductBtn')?.addEventListener('click', closeModals);

    // Inventory filters
    document.getElementById('productSearch')?.addEventListener('input', filterInventory);
    document.getElementById('categoryFilter')?.addEventListener('change', filterInventory);
    document.getElementById('stockFilter')?.addEventListener('change', filterInventory);

    // Export button
    document.getElementById('exportBtn')?.addEventListener('click', () => {
        showNotification('Exporting inventory data...', 'success');
    });

    // Pricing buttons
    document.getElementById('tierPricingBtn')?.addEventListener('click', () => {
        showNotification('Tier pricing feature coming soon!', 'success');
    });
    document.getElementById('bulkDiscountBtn')?.addEventListener('click', () => {
        showNotification('Bulk discount feature coming soon!', 'success');
    });
    document.getElementById('specialOffersBtn')?.addEventListener('click', () => {
        showNotification('Special offers feature coming soon!', 'success');
    });

    // Order filters
    document.querySelectorAll('.orders-filters .filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.orders-filters .filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterOrders(e.target.dataset.status);
        });
    });

    // Retailer search
    document.getElementById('retailerSearch')?.addEventListener('input', filterRetailers);
    document.getElementById('retailerStatus')?.addEventListener('change', filterRetailers);

    // History search
    document.getElementById('searchHistoryBtn')?.addEventListener('click', searchHistory);
    document.getElementById('exportHistoryBtn')?.addEventListener('click', () => {
        showNotification('Exporting history...', 'success');
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
}

// Section Switching
function switchSection(section) {
    // Update sidebar
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`)?.classList.add('active');

    // Update content
    document.querySelectorAll('.dashboard-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(section)?.classList.add('active');

    // Load section-specific data
    switch(section) {
        case 'overview':
            loadOverviewStats();
            break;
        case 'inventory':
            loadInventory();
            break;
        case 'pricing':
            loadPricing();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'retailers':
            loadRetailers();
            break;
        case 'history':
            loadHistory();
            break;
    }
}

// Overview
function loadOverviewStats() {
    // Stats are in HTML, can be updated dynamically here
    loadRecentActivity();
}

function loadRecentActivity() {
    const list = document.getElementById('activityList');
    if (!list) return;

    const activities = [
        { icon: 'fa-shopping-cart', text: 'New order from Tech Store Inc.', time: '2 hours ago', color: 'blue' },
        { icon: 'fa-check-circle', text: 'Order RO-002 delivered successfully', time: '5 hours ago', color: 'green' },
        { icon: 'fa-box', text: 'Stock updated for 5 products', time: '1 day ago', color: 'orange' },
        { icon: 'fa-user-plus', text: 'New retailer registered', time: '2 days ago', color: 'purple' },
        { icon: 'fa-dollar-sign', text: 'Payment received: $3,600', time: '3 days ago', color: 'green' },
    ];

    list.innerHTML = activities.map(activity => `
        <div style="display: flex; gap: 1rem; padding: 1rem; border-bottom: 1px solid var(--border-color);">
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, var(--${activity.color === 'blue' ? 'primary' : activity.color === 'green' ? 'secondary' : activity.color === 'orange' ? 'accent' : 'primary'}-color), var(--secondary-color)); border-radius: 10px; display: flex; justify-content: center; align-items: center; color: white;">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div style="flex: 1;">
                <div style="color: var(--dark-color); margin-bottom: 0.25rem;">${activity.text}</div>
                <div style="font-size: 0.85rem; color: var(--text-light);">${activity.time}</div>
            </div>
        </div>
    `).join('');
}

// Inventory Management
function loadInventory(filtered = wholesaleInventory) {
    const tbody = document.getElementById('inventoryBody');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-light);">
                    <i class="fas fa-warehouse" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                    <p>No products found</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(item => {
        const stockStatus = item.stock < item.minOrder ? 'low' : item.stock < 100 ? 'medium' : 'high';
        const stockBadge = stockStatus === 'low' ? 'stock-badge low-stock' : 
                          stockStatus === 'medium' ? 'stock-badge' : 'stock-badge in-stock';
        
        return `
            <tr>
                <td style="font-weight: 600;">${item.productId}</td>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.stock}</td>
                <td>₹${item.unitPrice.toLocaleString('en-IN')}</td>
                <td>${item.minOrder}</td>
                <td><span class="${stockBadge}">${item.status}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="btn-table btn-edit" onclick="editProduct(${item.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-table btn-view" onclick="viewProduct(${item.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-table btn-delete" onclick="deleteProduct(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function filterInventory() {
    const search = document.getElementById('productSearch')?.value.toLowerCase() || '';
    const category = document.getElementById('categoryFilter')?.value || '';
    const stockLevel = document.getElementById('stockFilter')?.value || '';

    let filtered = wholesaleInventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search) || item.productId.toLowerCase().includes(search);
        const matchesCategory = !category || item.category === category;
        
        let matchesStock = true;
        if (stockLevel === 'high') matchesStock = item.stock > 100;
        else if (stockLevel === 'medium') matchesStock = item.stock >= 50 && item.stock <= 100;
        else if (stockLevel === 'low') matchesStock = item.stock > 0 && item.stock < 50;
        else if (stockLevel === 'out') matchesStock = item.stock === 0;

        return matchesSearch && matchesCategory && matchesStock;
    });

    loadInventory(filtered);
}

function openAddProductModal() {
    document.getElementById('productModalTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productForm').dataset.mode = 'add';
    document.getElementById('productModal').classList.add('active');
}

function editProduct(id) {
    const product = wholesaleInventory.find(p => p.id === id);
    if (!product) return;

    document.getElementById('productModalTitle').textContent = 'Edit Product';
    document.getElementById('productName').value = product.name;
    document.getElementById('productId').value = product.productId;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productPrice').value = product.unitPrice;
    document.getElementById('productMinOrder').value = product.minOrder;
    document.getElementById('productDescription').value = product.description || '';
    
    document.getElementById('productForm').dataset.mode = 'edit';
    document.getElementById('productForm').dataset.id = id;
    document.getElementById('productModal').classList.add('active');
}

function saveProduct(e) {
    e.preventDefault();
    
    const form = e.target;
    const mode = form.dataset.mode;
    const productData = {
        productId: document.getElementById('productId').value,
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        stock: parseInt(document.getElementById('productStock').value),
        unitPrice: parseFloat(document.getElementById('productPrice').value),
        minOrder: parseInt(document.getElementById('productMinOrder').value),
        description: document.getElementById('productDescription').value,
        status: 'active'
    };

    if (mode === 'add') {
        productData.id = wholesaleInventory.length + 1;
        wholesaleInventory.push(productData);
        showNotification('Product added successfully!', 'success');
    } else {
        const id = parseInt(form.dataset.id);
        const index = wholesaleInventory.findIndex(p => p.id === id);
        if (index !== -1) {
            wholesaleInventory[index] = { ...wholesaleInventory[index], ...productData };
            showNotification('Product updated successfully!', 'success');
        }
    }

    closeModals();
    loadInventory();
}

function viewProduct(id) {
    showNotification(`Viewing product ${id} details`, 'success');
}

function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    wholesaleInventory = wholesaleInventory.filter(p => p.id !== id);
    showNotification('Product deleted successfully!', 'success');
    loadInventory();
}

// Pricing Management
function loadPricing() {
    const tbody = document.getElementById('pricingBody');
    if (!tbody) return;

    tbody.innerHTML = wholesaleInventory.map(item => {
        return `
            <tr>
                <td>${item.name}</td>
                <td>₹${item.unitPrice.toLocaleString('en-IN')}</td>
                <td>₹${Math.round(item.unitPrice * 0.95).toLocaleString('en-IN')}</td>
                <td>₹${Math.round(item.unitPrice * 0.90).toLocaleString('en-IN')}</td>
                <td>₹${Math.round(item.unitPrice * 0.85).toLocaleString('en-IN')}</td>
                <td><span class="stock-badge in-stock">5% off 100+</span></td>
                <td>
                    <button class="btn-table btn-edit" onclick="editPricing(${item.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function editPricing(id) {
    showNotification('Pricing editor coming soon!', 'success');
}

// Orders Management
function loadOrders(status = 'all') {
    const tbody = document.getElementById('ordersBody');
    if (!tbody) return;

    const filtered = status === 'all' ? retailerOrders : retailerOrders.filter(o => o.status === status);

    tbody.innerHTML = filtered.map(order => `
        <tr>
            <td style="font-weight: 600;">${order.id}</td>
            <td>${order.retailer}</td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td>${order.items}</td>
            <td style="font-weight: 600; color: var(--primary-color);">₹${order.total.toLocaleString('en-IN')}</td>
            <td><span class="order-status ${order.status}">${order.status}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn-table btn-view" onclick="viewOrder('${order.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${order.status === 'pending' ? `
                        <button class="btn-table btn-edit" onclick="processOrder('${order.id}')">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function filterOrders(status) {
    loadOrders(status);
}

function viewOrder(id) {
    const order = retailerOrders.find(o => o.id === id);
    if (!order) return;

    const modal = document.getElementById('orderModal');
    const details = document.getElementById('orderDetails');

    details.innerHTML = `
        <div style="background: var(--light-color); padding: 1.5rem; border-radius: 10px; margin-bottom: 1.5rem;">
            <h3>${order.id}</h3>
            <p style="color: var(--text-light);">${order.retailer}</p>
        </div>
        <div style="margin-bottom: 1rem;">
            <strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}
        </div>
        <div style="margin-bottom: 1rem;">
            <strong>Items:</strong> ${order.items}
        </div>
        <div style="margin-bottom: 1rem;">
            <strong>Total Quantity:</strong> ${order.quantity}
        </div>
        <div style="margin-bottom: 1rem;">
            <strong>Total Amount:</strong> <span style="font-size: 1.25rem; color: var(--primary-color); font-weight: bold;">₹${order.total.toLocaleString('en-IN')}</span>
        </div>
        <div style="margin-bottom: 1rem;">
            <strong>Status:</strong> <span class="order-status ${order.status}">${order.status}</span>
        </div>
    `;

    modal.classList.add('active');
}

function processOrder(id) {
    showNotification(`Processing order ${id}...`, 'success');
    // Update order status
    const order = retailerOrders.find(o => o.id === id);
    if (order) {
        order.status = 'processing';
        loadOrders();
    }
}

// Retailers Management
function loadRetailers(filtered = retailers) {
    const grid = document.getElementById('retailersGrid');
    if (!grid) return;

    grid.innerHTML = filtered.map(retailer => `
        <div class="order-card">
            <div style="text-align: center; margin-bottom: 1rem;">
                <div style="width: 80px; height: 80px; margin: 0 auto 1rem; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white; font-size: 2rem;">
                    <i class="fas fa-store"></i>
                </div>
                <h3 style="color: var(--dark-color); margin-bottom: 0.5rem;">${retailer.name}</h3>
                <p style="color: var(--text-light); font-size: 0.9rem;">${retailer.email}</p>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; text-align: center;">
                <div>
                    <div style="font-weight: 600; color: var(--primary-color);">${retailer.orders}</div>
                    <div style="font-size: 0.85rem; color: var(--text-light);">Orders</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--secondary-color);">₹${(retailer.totalValue / 100000).toFixed(1)}L</div>
                    <div style="font-size: 0.85rem; color: var(--text-light);">Total Value</div>
                </div>
            </div>
            <div style="text-align: center; margin-bottom: 1rem;">
                <span class="stock-badge in-stock">${retailer.status}</span>
            </div>
            <div class="order-actions">
                <button class="btn btn-secondary" onclick="viewRetailer(${retailer.id})">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn btn-primary" onclick="contactRetailer(${retailer.id})">
                    <i class="fas fa-envelope"></i> Contact
                </button>
            </div>
        </div>
    `).join('');
}

function filterRetailers() {
    const search = document.getElementById('retailerSearch')?.value.toLowerCase() || '';
    const status = document.getElementById('retailerStatus')?.value || '';

    const filtered = retailers.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(search) || r.email.toLowerCase().includes(search);
        const matchesStatus = !status || r.status === status;
        return matchesSearch && matchesStatus;
    });

    loadRetailers(filtered);
}

function viewRetailer(id) {
    showNotification(`Viewing retailer ${id} profile`, 'success');
}

function contactRetailer(id) {
    showNotification(`Opening email to retailer ${id}`, 'success');
}

// Purchase History
function loadHistory() {
    const tbody = document.getElementById('historyBody');
    if (!tbody) return;

    tbody.innerHTML = purchaseHistory.map(record => `
        <tr>
            <td style="font-weight: 600;">${record.orderId}</td>
            <td>${new Date(record.date).toLocaleDateString()}</td>
            <td>${record.retailer}</td>
            <td>${record.products}</td>
            <td>${record.quantity}</td>
            <td style="font-weight: 600; color: var(--primary-color);">₹${record.amount.toLocaleString('en-IN')}</td>
            <td>
                <span class="stock-badge ${record.payment === 'paid' ? 'in-stock' : 'low-stock'}">
                    ${record.payment}
                </span>
            </td>
            <td>
                <button class="btn-table btn-view" onclick="viewHistoryRecord('${record.orderId}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function searchHistory() {
    const search = document.getElementById('historySearch')?.value.toLowerCase() || '';
    const dateFrom = document.getElementById('dateFrom')?.value;
    const dateTo = document.getElementById('dateTo')?.value;

    showNotification('Searching history...', 'success');
    // Filter logic here
}

function viewHistoryRecord(orderId) {
    showNotification(`Viewing history for ${orderId}`, 'success');
}

// Close Modals
function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Notification function (fallback)
if (typeof showNotification !== 'function') {
    function showNotification(message, type = 'success') {
        console.log(`${type.toUpperCase()}: ${message}`);
        alert(message);
    }
}

console.log('Wholesaler Dashboard loaded successfully! 🏭');
