// Retailer Dashboard JavaScript
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
let inventory = [
    { id: 1, name: 'Wireless Mouse', sku: 'WM-001', category: 'electronics', stock: 45, costPrice: 1200, sellingPrice: 2399, status: 'active' },
    { id: 2, name: 'Coffee Beans 1kg', sku: 'CF-002', category: 'groceries', stock: 120, costPrice: 950, sellingPrice: 1999, status: 'active' },
    { id: 3, name: 'Denim Jeans', sku: 'DJ-003', category: 'clothing', stock: 8, costPrice: 2000, sellingPrice: 3999, status: 'active' },
    { id: 4, name: 'LED Desk Lamp', sku: 'DL-004', category: 'home', stock: 0, costPrice: 1450, sellingPrice: 3199, status: 'inactive' },
    { id: 5, name: 'Keyboard Mechanical', sku: 'KB-005', category: 'electronics', stock: 32, costPrice: 3600, sellingPrice: 7199, status: 'active' },
];

// Sample Customer Data
const customers = [
    { id: 1, name: 'Alice Johnson', email: 'alice@email.com', orders: 12, totalSpent: 101850, lastOrder: '2025-11-18' },
    { id: 2, name: 'Bob Smith', email: 'bob@email.com', orders: 8, totalSpent: 72790, lastOrder: '2025-11-17' },
    { id: 3, name: 'Carol White', email: 'carol@email.com', orders: 15, totalSpent: 171860, lastOrder: '2025-11-19' },
];

// Sample Wholesale Orders
const wholesaleOrders = [
    { id: 'WO-001', supplier: 'Mega Wholesale Co.', date: '2025-11-15', items: 5, total: 102250, status: 'delivered' },
    { id: 'WO-002', supplier: 'Supply Chain Inc.', date: '2025-11-18', items: 3, total: 63841, status: 'shipped' },
    { id: 'WO-003', supplier: 'Bulk Suppliers Ltd.', date: '2025-11-20', items: 8, total: 171800, status: 'pending' },
];

// Sample Customer Queries
const queries = [
    { id: 1, customer: 'Alice Johnson', subject: 'Product availability', message: 'When will LED Desk Lamp be back in stock?', status: 'open', date: '2025-11-19' },
    { id: 2, customer: 'Bob Smith', subject: 'Order delay', message: 'My order is delayed by 2 days', status: 'pending', date: '2025-11-18' },
    { id: 3, customer: 'Carol White', subject: 'Product quality', message: 'Very satisfied with the keyboard!', status: 'resolved', date: '2025-11-17' },
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadOverviewStats();
    loadTopProducts();
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

    // Add item button
    document.getElementById('addItemBtn')?.addEventListener('click', openAddItemModal);

    // Item form
    document.getElementById('itemForm')?.addEventListener('submit', saveItem);
    document.getElementById('cancelBtn')?.addEventListener('click', closeModals);

    // Inventory filters
    document.getElementById('inventorySearch')?.addEventListener('input', filterInventory);
    document.getElementById('inventoryCategory')?.addEventListener('change', filterInventory);
    document.getElementById('inventoryStock')?.addEventListener('change', filterInventory);

    // Pricing buttons
    document.getElementById('bulkPricingBtn')?.addEventListener('click', () => showNotification('Bulk pricing feature coming soon!', 'success'));
    document.getElementById('discountBtn')?.addEventListener('click', () => showNotification('Discount feature coming soon!', 'success'));

    // Customer search
    document.getElementById('customerSearch')?.addEventListener('input', filterCustomers);

    // Wholesale order tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterWholesaleOrders(e.target.dataset.tab);
        });
    });

    // New wholesale order
    document.getElementById('newWholesaleOrderBtn')?.addEventListener('click', () => {
        showNotification('New order form opening...', 'success');
    });

    // Queries filters
    document.querySelectorAll('#queries .filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#queries .filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterQueries(e.target.dataset.status);
        });
    });

    // Query response form
    document.getElementById('queryResponseForm')?.addEventListener('submit', submitQueryResponse);

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
        case 'customers':
            loadCustomers();
            break;
        case 'wholesale-orders':
            loadWholesaleOrders();
            break;
        case 'queries':
            loadQueries();
            break;
    }
}

// Overview
function loadOverviewStats() {
    // Stats are already in HTML, can be updated dynamically
    loadTopProducts();
}

function loadTopProducts() {
    const list = document.getElementById('topProductsList');
    if (!list) return;

    const topProducts = [...inventory]
        .sort((a, b) => (b.sellingPrice * b.stock) - (a.sellingPrice * a.stock))
        .slice(0, 5);

    list.innerHTML = topProducts.map((product, index) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid var(--border-color);">
            <div>
                <div style="font-weight: 600; color: var(--dark-color);">${index + 1}. ${product.name}</div>
                <div style="color: var(--text-light); font-size: 0.9rem;">${product.stock} in stock</div>
            </div>
            <div style="font-weight: 600; color: var(--primary-color);">₹${product.sellingPrice.toLocaleString('en-IN')}</div>
        </div>
    `).join('');
}

// Inventory Management
function loadInventory(filtered = inventory) {
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-light);">
                    <i class="fas fa-box" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                    <p>No items found</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(item => {
        const stockStatus = item.stock === 0 ? 'out-of-stock' : item.stock < 20 ? 'low-stock' : 'in-stock';
        const stockLabel = item.stock === 0 ? 'Out of Stock' : item.stock < 20 ? 'Low Stock' : 'In Stock';
        
        return `
            <tr>
                <td>
                    <div style="font-weight: 600;">${item.name}</div>
                    <div style="font-size: 0.85rem; color: var(--text-light);">${item.sku}</div>
                </td>
                <td>${item.sku}</td>
                <td>${item.category}</td>
                <td>${item.stock}</td>
                <td>₹${item.sellingPrice.toLocaleString('en-IN')}</td>
                <td><span class="stock-badge ${stockStatus}">${stockLabel}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="btn-table btn-edit" onclick="editItem(${item.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-table btn-delete" onclick="deleteItem(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function filterInventory() {
    const search = document.getElementById('inventorySearch')?.value.toLowerCase() || '';
    const category = document.getElementById('inventoryCategory')?.value || '';
    const stockLevel = document.getElementById('inventoryStock')?.value || '';

    let filtered = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search) || item.sku.toLowerCase().includes(search);
        const matchesCategory = !category || item.category === category;
        
        let matchesStock = true;
        if (stockLevel === 'in-stock') matchesStock = item.stock > 20;
        else if (stockLevel === 'low-stock') matchesStock = item.stock > 0 && item.stock <= 20;
        else if (stockLevel === 'out-of-stock') matchesStock = item.stock === 0;

        return matchesSearch && matchesCategory && matchesStock;
    });

    loadInventory(filtered);
}

function openAddItemModal() {
    document.getElementById('modalTitle').textContent = 'Add New Item';
    document.getElementById('itemForm').reset();
    document.getElementById('itemForm').dataset.mode = 'add';
    document.getElementById('itemModal').classList.add('active');
}

function editItem(id) {
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    document.getElementById('modalTitle').textContent = 'Edit Item';
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemSku').value = item.sku;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemStock').value = item.stock;
    document.getElementById('itemCost').value = item.costPrice;
    document.getElementById('itemPrice').value = item.sellingPrice;
    document.getElementById('itemDescription').value = item.description || '';
    
    document.getElementById('itemForm').dataset.mode = 'edit';
    document.getElementById('itemForm').dataset.id = id;
    document.getElementById('itemModal').classList.add('active');
}

function saveItem(e) {
    e.preventDefault();
    
    const form = e.target;
    const mode = form.dataset.mode;
    const itemData = {
        name: document.getElementById('itemName').value,
        sku: document.getElementById('itemSku').value,
        category: document.getElementById('itemCategory').value,
        stock: parseInt(document.getElementById('itemStock').value),
        costPrice: parseFloat(document.getElementById('itemCost').value),
        sellingPrice: parseFloat(document.getElementById('itemPrice').value),
        description: document.getElementById('itemDescription').value,
        status: 'active'
    };

    if (mode === 'add') {
        itemData.id = inventory.length + 1;
        inventory.push(itemData);
        showNotification('Item added successfully!', 'success');
    } else {
        const id = parseInt(form.dataset.id);
        const index = inventory.findIndex(i => i.id === id);
        if (index !== -1) {
            inventory[index] = { ...inventory[index], ...itemData };
            showNotification('Item updated successfully!', 'success');
        }
    }

    closeModals();
    loadInventory();
    loadTopProducts();
}

function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    inventory = inventory.filter(i => i.id !== id);
    showNotification('Item deleted successfully!', 'success');
    loadInventory();
}

// Pricing Management
function loadPricing() {
    const tbody = document.getElementById('pricingTableBody');
    if (!tbody) return;

    tbody.innerHTML = inventory.map(item => {
        const margin = ((item.sellingPrice - item.costPrice) / item.costPrice * 100).toFixed(1);
        const discount = 0; // Placeholder
        const finalPrice = item.sellingPrice;

        return `
            <tr>
                <td>${item.name}</td>
                <td>₹${item.costPrice.toLocaleString('en-IN')}</td>
                <td>₹${item.sellingPrice.toLocaleString('en-IN')}</td>
                <td style="color: var(--secondary-color); font-weight: 600;">${margin}%</td>
                <td>${discount}%</td>
                <td style="font-weight: 600; color: var(--primary-color);">₹${finalPrice.toLocaleString('en-IN')}</td>
                <td>
                    <button class="btn-table btn-edit" onclick="editPrice(${item.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function editPrice(id) {
    showNotification('Price editing feature coming soon!', 'success');
}

// Customer Management
function loadCustomers(filtered = customers) {
    const list = document.getElementById('customersList');
    if (!list) return;

    list.innerHTML = filtered.map(customer => `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <div class="order-id">${customer.name}</div>
                    <div class="order-date">${customer.email}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 600; color: var(--primary-color);">₹${customer.totalSpent.toLocaleString('en-IN')}</div>
                    <div style="font-size: 0.9rem; color: var(--text-light);">${customer.orders} orders</div>
                </div>
            </div>
            <div style="margin-top: 1rem; color: var(--text-light); font-size: 0.9rem;">
                Last order: ${new Date(customer.lastOrder).toLocaleDateString()}
            </div>
            <div class="order-actions" style="margin-top: 1rem;">
                <button class="btn btn-secondary" onclick="viewCustomerDetails(${customer.id})">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button class="btn btn-primary" onclick="contactCustomer(${customer.id})">
                    <i class="fas fa-envelope"></i> Contact
                </button>
            </div>
        </div>
    `).join('');
}

function filterCustomers() {
    const search = document.getElementById('customerSearch')?.value.toLowerCase() || '';
    const filtered = customers.filter(c => 
        c.name.toLowerCase().includes(search) || 
        c.email.toLowerCase().includes(search)
    );
    loadCustomers(filtered);
}

function viewCustomerDetails(id) {
    showNotification(`Viewing customer ${id} details`, 'success');
}

function contactCustomer(id) {
    showNotification(`Opening email to customer ${id}`, 'success');
}

// Wholesale Orders
function loadWholesaleOrders(status = 'pending') {
    const list = document.getElementById('wholesaleOrdersList');
    if (!list) return;

    const filtered = wholesaleOrders.filter(o => status === 'all' || o.status === status);

    list.innerHTML = filtered.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <div class="order-id">${order.id}</div>
                    <div class="order-date">${order.supplier}</div>
                </div>
                <span class="order-status ${order.status}">${order.status}</span>
            </div>
            <div style="margin: 1rem 0;">
                <div style="color: var(--text-light); margin-bottom: 0.5rem;">
                    ${order.items} items • ${new Date(order.date).toLocaleDateString()}
                </div>
                <div class="order-total">Total: ₹${order.total.toLocaleString('en-IN')}</div>
            </div>
            <div class="order-actions">
                <button class="btn btn-secondary" onclick="viewWholesaleOrder('${order.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                ${order.status === 'pending' ? `
                    <button class="btn btn-primary" onclick="confirmWholesaleOrder('${order.id}')">
                        <i class="fas fa-check"></i> Confirm
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function filterWholesaleOrders(status) {
    loadWholesaleOrders(status);
}

function viewWholesaleOrder(id) {
    showNotification(`Viewing order ${id}`, 'success');
}

function confirmWholesaleOrder(id) {
    showNotification(`Order ${id} confirmed!`, 'success');
}

// Customer Queries
function loadQueries(status = 'all') {
    const list = document.getElementById('queriesList');
    if (!list) return;

    const filtered = status === 'all' ? queries : queries.filter(q => q.status === status);

    list.innerHTML = filtered.map(query => `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <div class="order-id">${query.customer}</div>
                    <div class="order-date">${query.subject}</div>
                </div>
                <span class="order-status ${query.status}">${query.status}</span>
            </div>
            <div style="margin: 1rem 0; color: var(--text-color);">
                ${query.message}
            </div>
            <div style="color: var(--text-light); font-size: 0.9rem; margin-bottom: 1rem;">
                ${new Date(query.date).toLocaleDateString()}
            </div>
            <button class="btn btn-primary" onclick="respondToQuery(${query.id})">
                <i class="fas fa-reply"></i> Respond
            </button>
        </div>
    `).join('');
}

function filterQueries(status) {
    loadQueries(status);
}

function respondToQuery(id) {
    const query = queries.find(q => q.id === id);
    if (!query) return;

    const modal = document.getElementById('queryModal');
    const details = document.getElementById('queryDetails');

    details.innerHTML = `
        <div style="background: var(--light-color); padding: 1rem; border-radius: 10px; margin-bottom: 1.5rem;">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">${query.customer}</div>
            <div style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 1rem;">${query.subject}</div>
            <div style="color: var(--text-color);">${query.message}</div>
        </div>
    `;

    modal.classList.add('active');
}

function submitQueryResponse(e) {
    e.preventDefault();
    showNotification('Response sent successfully!', 'success');
    closeModals();
    loadQueries();
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

console.log('Retailer Dashboard loaded successfully! 🏪');
