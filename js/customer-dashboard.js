// Customer Dashboard JavaScript
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

// Sample Product Data with shop locations
const products = [
    { id: 1, name: 'Wireless Headphones', category: 'electronics', price: 6499, stock: 45, availability: 'in-stock', image: '🎧', 
      shop: { name: 'Tech Hub', location: { lat: 28.6139, lon: 77.2090, city: 'New Delhi', area: 'Connaught Place' } } },
    { id: 2, name: 'Organic Coffee Beans', category: 'groceries', price: 1999, stock: 120, availability: 'in-stock', image: '☕',
      shop: { name: 'Fresh Mart', location: { lat: 28.6200, lon: 77.2100, city: 'New Delhi', area: 'Rajiv Chowk' } } },
    { id: 3, name: 'Cotton T-Shirt', category: 'clothing', price: 1599, stock: 8, availability: 'low-stock', image: '👕',
      shop: { name: 'Fashion Store', location: { lat: 28.6100, lon: 77.2050, city: 'New Delhi', area: 'Janpath' } } },
    { id: 4, name: 'Garden Hose', category: 'home', price: 2799, stock: 0, availability: 'out-of-stock', image: '🌿',
      shop: { name: 'Home Depot', location: { lat: 28.6150, lon: 77.2120, city: 'New Delhi', area: 'Barakhamba Road' } } },
    { id: 5, name: 'Bluetooth Speaker', category: 'electronics', price: 4899, stock: 32, availability: 'in-stock', image: '🔊',
      shop: { name: 'Tech Hub', location: { lat: 28.6139, lon: 77.2090, city: 'New Delhi', area: 'Connaught Place' } } },
    { id: 6, name: 'Yoga Mat', category: 'home', price: 2399, stock: 15, availability: 'in-stock', image: '🧘',
      shop: { name: 'Fitness World', location: { lat: 28.5355, lon: 77.3910, city: 'Noida', area: 'Sector 18' } } },
    { id: 7, name: 'Laptop Stand', category: 'electronics', price: 3699, stock: 22, availability: 'in-stock', image: '💻',
      shop: { name: 'Office Supplies', location: { lat: 28.4595, lon: 77.0266, city: 'Gurugram', area: 'Cyber City' } } },
    { id: 8, name: 'Green Tea Pack', category: 'groceries', price: 1299, stock: 88, availability: 'in-stock', image: '🍵',
      shop: { name: 'Fresh Mart', location: { lat: 28.6200, lon: 77.2100, city: 'New Delhi', area: 'Rajiv Chowk' } } },
    { id: 9, name: 'Running Shoes', category: 'clothing', price: 4999, stock: 25, availability: 'in-stock', image: '👟',
      shop: { name: 'Sports Zone', location: { lat: 19.0760, lon: 72.8777, city: 'Mumbai', area: 'Andheri' } } },
    { id: 10, name: 'Smart Watch', category: 'electronics', price: 12999, stock: 18, availability: 'in-stock', image: '⌚',
      shop: { name: 'Gadget Store', location: { lat: 12.9716, lon: 77.5946, city: 'Bangalore', area: 'Indiranagar' } } },
    { id: 11, name: 'Rice Bag 10kg', category: 'groceries', price: 899, stock: 200, availability: 'in-stock', image: '🌾',
      shop: { name: 'Grocery Plus', location: { lat: 28.6139, lon: 77.2090, city: 'New Delhi', area: 'Connaught Place' } } },
    { id: 12, name: 'LED Bulbs Pack', category: 'home', price: 599, stock: 150, availability: 'in-stock', image: '💡',
      shop: { name: 'Home Essentials', location: { lat: 28.6100, lon: 77.2300, city: 'New Delhi', area: 'Lajpat Nagar' } } },
];

// Sample Orders Data
const orders = [
    { id: 'ORD-001', date: '2025-11-18', items: 3, total: 15097, status: 'delivered' },
    { id: 'ORD-002', date: '2025-11-19', items: 2, total: 8598, status: 'shipped' },
    { id: 'ORD-003', date: '2025-11-20', items: 1, total: 6499, status: 'processing' },
];

// Cart State
let cart = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadLocationBasedProducts();
    updateCartCount();
    setupEventListeners();
    loadOrders();
    loadFeedbackHistory();
});

// Listen for location updates
window.addEventListener('locationUpdated', () => {
    loadLocationBasedProducts();
});

// Load products based on user location
function loadLocationBasedProducts() {
    const userLocation = window.locationService?.getStoredLocation();
    const userAddress = window.locationService?.getStoredAddress();
    
    if (userLocation && userAddress) {
        // Filter products within 50km radius
        const maxDistance = 50; // km
        const nearbyProducts = products.filter(product => {
            const distance = window.locationService.calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                product.shop.location.lat,
                product.shop.location.lon
            );
            product.distance = parseFloat(distance);
            return product.distance <= maxDistance;
        });
        
        // Sort by distance (nearest first)
        nearbyProducts.sort((a, b) => a.distance - b.distance);
        
        // Update UI with location info
        updateLocationDisplay(userAddress, nearbyProducts.length);
        
        // Load nearby products
        loadProducts(nearbyProducts);
        
        console.log(`📍 Showing ${nearbyProducts.length} products near ${userAddress.city}`);
    } else {
        // No location - show all products with message
        showLocationPrompt();
        loadProducts(products);
    }
}

// Update location display in UI
function updateLocationDisplay(address, productsCount) {
    const locationDisplay = document.querySelector('.dashboard-stats');
    if (locationDisplay) {
        const locationInfo = document.createElement('div');
        locationInfo.className = 'stat-card location-stat';
        locationInfo.innerHTML = `
            <i class="fas fa-map-marker-alt"></i>
            <div class="stat-details">
                <h3>Your Location</h3>
                <p>${address.city}, ${address.state}</p>
                <small>${productsCount} shops nearby</small>
            </div>
        `;
        
        // Insert at the beginning
        if (!locationDisplay.querySelector('.location-stat')) {
            locationDisplay.insertBefore(locationInfo, locationDisplay.firstChild);
        }
    }
}

// Show location prompt
function showLocationPrompt() {
    const grid = document.getElementById('productsGrid');
    if (grid && grid.previousElementSibling) {
        const prompt = document.createElement('div');
        prompt.className = 'location-prompt';
        prompt.innerHTML = `
            <i class="fas fa-map-marker-alt"></i>
            <p>Enable location to see shops near you</p>
            <button onclick="enableLocation()" class="btn btn-primary">
                <i class="fas fa-location-arrow"></i> Enable Location
            </button>
        `;
        grid.parentElement.insertBefore(prompt, grid);
    }
}

// Enable location button handler
window.enableLocation = async function() {
    const result = await window.locationService.requestLocationPermission();
    if (result.success) {
        showNotification('Location enabled! Showing nearby shops...', 'success');
        loadLocationBasedProducts();
        // Remove prompt
        document.querySelector('.location-prompt')?.remove();
    } else {
        showNotification('Could not access location: ' + result.error, 'error');
    }
}

// Event Listeners
function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            switchSection(section);
        });
    });

    // Search and filters
    document.getElementById('searchInput')?.addEventListener('input', filterProducts);
    document.getElementById('categoryFilter')?.addEventListener('change', filterProducts);
    document.getElementById('priceFilter')?.addEventListener('change', filterProducts);
    document.getElementById('availabilityFilter')?.addEventListener('change', filterProducts);
    document.getElementById('sortBtn')?.addEventListener('click', sortProducts);

    // Checkout
    document.getElementById('checkoutBtn')?.addEventListener('click', openCheckoutModal);

    // Order tracking
    document.getElementById('trackBtn')?.addEventListener('click', trackOrder);

    // Feedback form
    document.getElementById('feedbackForm')?.addEventListener('submit', submitFeedback);

    // Rating stars
    document.querySelectorAll('.rating-input i').forEach(star => {
        star.addEventListener('click', (e) => {
            const rating = e.target.dataset.rating;
            updateRating(rating);
        });
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    // Order filters
    document.querySelectorAll('.orders-filter .filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.orders-filter .filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterOrders(e.target.dataset.status);
        });
    });

    // Checkout form
    document.getElementById('checkoutForm')?.addEventListener('submit', processCheckout);

    // Payment method toggle
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', toggleCardDetails);
    });
}

// Section Switching
function switchSection(section) {
    // Update sidebar
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.dashboard-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(section)?.classList.add('active');

    // Load section-specific data
    if (section === 'cart') {
        loadCart();
    } else if (section === 'orders') {
        loadOrders();
    }
}

// Load Products
function loadProducts(filteredProducts = products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your filters or enable location</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">${product.image}</div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="shop-info">
                    <i class="fas fa-store"></i> ${product.shop.name}
                    ${product.distance ? `<span class="distance">• ${product.distance} km</span>` : ''}
                </div>
                <div class="product-price">₹${product.price.toLocaleString('en-IN')}</div>
                <div class="product-stock">
                    <span class="stock-badge ${product.availability}">
                        ${product.availability === 'in-stock' ? 'In Stock' : 
                          product.availability === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                    <span>${product.stock} available</span>
                </div>
                <div class="product-actions">
                    <button class="btn-icon btn-secondary" onclick="viewProductDetail(${product.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn-icon btn-primary" onclick="addToCart(${product.id})" 
                        ${product.availability === 'out-of-stock' ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus"></i> Add
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Filter Products
function filterProducts() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const category = document.getElementById('categoryFilter')?.value || '';
    const priceRange = document.getElementById('priceFilter')?.value || '';
    const availability = document.getElementById('availabilityFilter')?.value || '';

    let filtered = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || product.category === category;
        const matchesAvailability = !availability || product.availability === availability;
        
        let matchesPrice = true;
        if (priceRange) {
            if (priceRange === '0-50') matchesPrice = product.price < 50;
            else if (priceRange === '50-100') matchesPrice = product.price >= 50 && product.price < 100;
            else if (priceRange === '100-500') matchesPrice = product.price >= 100 && product.price < 500;
            else if (priceRange === '500+') matchesPrice = product.price >= 500;
        }

        return matchesSearch && matchesCategory && matchesPrice && matchesAvailability;
    });

    loadProducts(filtered);
}

// Sort Products
let sortAscending = true;
function sortProducts() {
    const sorted = [...products].sort((a, b) => {
        return sortAscending ? a.price - b.price : b.price - a.price;
    });
    sortAscending = !sortAscending;
    loadProducts(sorted);
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || product.availability === 'out-of-stock') return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartCount();
    showNotification('Item added to cart!', 'success');
}

// Update Cart Count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cartCount');
    if (badge) badge.textContent = count;
}

// Load Cart
function loadCart() {
    const cartItems = document.getElementById('cartItems');
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Start shopping to add items</p>
            </div>
        `;
        updateCartSummary();
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">${item.image}</div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</div>
                <div class="cart-item-controls">
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="btn-remove" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    updateCartSummary();
}

// Update Quantity
function updateQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        loadCart();
        updateCartCount();
    }
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    loadCart();
    updateCartCount();
    showNotification('Item removed from cart', 'success');
}

// Update Cart Summary
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = cart.length > 0 ? 50 : 0;
    const tax = subtotal * 0.18;
    const total = subtotal + shipping + tax;

    document.getElementById('subtotal').textContent = `₹${Math.round(subtotal).toLocaleString('en-IN')}`;
    document.getElementById('shipping').textContent = `₹${Math.round(shipping).toLocaleString('en-IN')}`;
    document.getElementById('tax').textContent = `₹${Math.round(tax).toLocaleString('en-IN')}`;
    document.getElementById('total').textContent = `₹${Math.round(total).toLocaleString('en-IN')}`;
}

// View Product Detail
function viewProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('itemModal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 8rem; margin-bottom: 1rem;">${product.image}</div>
            <h2>${product.name}</h2>
            <p style="color: var(--text-light); text-transform: uppercase; margin-bottom: 1rem;">${product.category}</p>
            <div style="font-size: 2rem; color: var(--primary-color); font-weight: bold; margin-bottom: 1rem;">
                ₹${product.price.toLocaleString('en-IN')}
            </div>
            <div style="margin-bottom: 1.5rem;">
                <span class="stock-badge ${product.availability}">
                    ${product.availability === 'in-stock' ? 'In Stock' : 
                      product.availability === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                </span>
                <p style="margin-top: 0.5rem; color: var(--text-light);">${product.stock} units available</p>
            </div>
            <p style="color: var(--text-color); line-height: 1.6; margin-bottom: 1.5rem;">
                High-quality ${product.name.toLowerCase()} perfect for your needs. 
                Fast shipping available. 100% satisfaction guaranteed.
            </p>
            <button class="btn btn-primary btn-block" onclick="addToCart(${product.id}); closeModals();"
                ${product.availability === 'out-of-stock' ? 'disabled' : ''}>
                <i class="fas fa-cart-plus"></i> Add to Cart
            </button>
        </div>
    `;

    modal.classList.add('active');
}

// Checkout
function openCheckoutModal() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    document.getElementById('checkoutModal').classList.add('active');
}

function toggleCardDetails() {
    const cardDetails = document.getElementById('cardDetails');
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    cardDetails.style.display = paymentMethod === 'card' ? 'block' : 'none';
    
    // Show UPI details if UPI is selected
    const upiDetails = document.getElementById('upiDetails');
    if (upiDetails) {
        upiDetails.style.display = paymentMethod === 'upi' ? 'block' : 'none';
    }
}

function processCheckout(e) {
    e.preventDefault();
    closeModals();
    showNotification('Order placed successfully! Order ID: ORD-' + Math.floor(Math.random() * 1000), 'success');
    cart = [];
    updateCartCount();
    loadCart();
}

// Load Orders
function loadOrders(status = 'all') {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;

    const filtered = status === 'all' ? orders : orders.filter(o => o.status === status);

    if (filtered.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box"></i>
                <h3>No orders found</h3>
                <p>Start shopping to place your first order</p>
            </div>
        `;
        return;
    }

    ordersList.innerHTML = filtered.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <div class="order-id">${order.id}</div>
                    <div class="order-date">${new Date(order.date).toLocaleDateString()}</div>
                </div>
                <span class="order-status ${order.status}">${order.status}</span>
            </div>
            <div class="order-items">
                <div class="order-item">
                    <span>${order.items} items</span>
                </div>
            </div>
            <div class="order-total">Total: ₹${order.total.toLocaleString('en-IN')}</div>
            <div class="order-actions">
                <button class="btn btn-secondary" onclick="trackOrderById('${order.id}')">
                    <i class="fas fa-map-marker-alt"></i> Track
                </button>
                <button class="btn btn-primary" onclick="viewOrderDetails('${order.id}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
            </div>
        </div>
    `).join('');
}

function filterOrders(status) {
    loadOrders(status);
}

function viewOrderDetails(orderId) {
    showNotification(`Viewing details for ${orderId}`, 'success');
}

// Track Order
function trackOrder() {
    const trackingInput = document.getElementById('trackingInput').value;
    if (!trackingInput) {
        showNotification('Please enter an order ID', 'error');
        return;
    }
    trackOrderById(trackingInput);
}

function trackOrderById(orderId) {
    const trackingResult = document.getElementById('trackingResult');
    
    trackingResult.innerHTML = `
        <h3>Tracking: ${orderId}</h3>
        <div class="tracking-timeline">
            <div class="tracking-step active">
                <div class="tracking-info">
                    <h4>Order Placed</h4>
                    <p>Nov 18, 2025 - 10:30 AM</p>
                </div>
            </div>
            <div class="tracking-step active">
                <div class="tracking-info">
                    <h4>Order Confirmed</h4>
                    <p>Nov 18, 2025 - 11:00 AM</p>
                </div>
            </div>
            <div class="tracking-step active">
                <div class="tracking-info">
                    <h4>Shipped</h4>
                    <p>Nov 19, 2025 - 09:15 AM</p>
                </div>
            </div>
            <div class="tracking-step">
                <div class="tracking-info">
                    <h4>Out for Delivery</h4>
                    <p>Expected: Nov 20, 2025</p>
                </div>
            </div>
            <div class="tracking-step">
                <div class="tracking-info">
                    <h4>Delivered</h4>
                    <p>Pending</p>
                </div>
            </div>
        </div>
    `;

    // Switch to track section
    switchSection('track');
}

// Feedback
function submitFeedback(e) {
    e.preventDefault();
    
    const type = document.getElementById('feedbackType').value;
    const subject = document.getElementById('feedbackSubject').value;
    
    showNotification('Feedback submitted successfully!', 'success');
    e.target.reset();
    
    // Reset rating stars
    document.querySelectorAll('.rating-input i').forEach(star => {
        star.classList.remove('active', 'fas');
        star.classList.add('far');
    });
}

function updateRating(rating) {
    document.querySelectorAll('.rating-input i').forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('far');
            star.classList.add('fas', 'active');
        } else {
            star.classList.remove('fas', 'active');
            star.classList.add('far');
        }
    });
}

function loadFeedbackHistory() {
    const history = document.getElementById('feedbackHistory');
    if (!history) return;

    history.innerHTML = `
        <div class="feedback-item">
            <h4>Product Quality Issue</h4>
            <p style="color: var(--text-light); font-size: 0.9rem;">Nov 15, 2025</p>
            <p style="color: var(--secondary-color); font-weight: 600; margin-top: 0.5rem;">Status: Resolved</p>
        </div>
        <div class="feedback-item">
            <h4>Delivery Time Query</h4>
            <p style="color: var(--text-light); font-size: 0.9rem;">Nov 10, 2025</p>
            <p style="color: var(--accent-color); font-weight: 600; margin-top: 0.5rem;">Status: Pending</p>
        </div>
    `;
}

// Close Modals
function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Notification (using existing function from script.js)
// If not available, define it here
if (typeof showNotification !== 'function') {
    function showNotification(message, type = 'success') {
        console.log(`${type.toUpperCase()}: ${message}`);
        alert(message);
    }
}

console.log('Customer Dashboard loaded successfully! 🛒');
