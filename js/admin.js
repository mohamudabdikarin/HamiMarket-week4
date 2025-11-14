// Admin Dashboard JavaScript
// Automatically detect if we're in production or development
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001/api'
    : 'https://hami-market-week4.vercel.app/api';
let currentEditingProduct = null;

// Check if user is logged in and is admin
const token = localStorage.getItem('hamiToken');
const userStr = localStorage.getItem('hamiUser');

if (!token || !userStr) {
    alert('Please login first');
    window.location.href = 'index.html';
}

const currentUser = JSON.parse(userStr);

if (!currentUser.isAdmin) {
    alert('Access denied. Admin privileges required.');
    window.location.href = 'index.html';
}

// Display admin name
document.getElementById('admin-username').textContent = currentUser.name;

// Navigation
document.querySelectorAll('.admin-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        
        // Update active link
        document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Update active section
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        document.getElementById(`${section}-section`).classList.add('active');
        
        // Update title
        const titles = {
            dashboard: 'Dashboard',
            products: 'Manage Products',
            orders: 'All Orders',
            customers: 'Customer List'
        };
        document.getElementById('section-title').textContent = titles[section];
        
        // Load section data
        loadSectionData(section);
    });
});

// Load section data
async function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'products':
            await loadProducts();
            break;
        case 'orders':
            await loadOrders();
            break;
        case 'customers':
            await loadCustomers();
            break;
    }
}

// Dashboard
async function loadDashboard() {
    try {
        const [stats, orders] = await Promise.all([
            fetch(`${API_URL}/admin/stats`).then(r => r.json()),
            fetch(`${API_URL}/admin/orders/recent`).then(r => r.json())
        ]);
        
        document.getElementById('total-revenue').textContent = `$${stats.revenue.toFixed(2)}`;
        document.getElementById('total-orders').textContent = stats.orders;
        document.getElementById('total-products').textContent = stats.products;
        document.getElementById('total-customers').textContent = stats.customers;
        
        renderRecentOrders(orders);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Error loading dashboard data', 'error');
    }
}

function renderRecentOrders(orders) {
    const container = document.getElementById('recent-orders-list');
    if (orders.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light);">No recent orders</p>';
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-id">Order #${order.id.slice(-6)}</span>
                <span class="order-total">$${order.total.toFixed(2)}</span>
            </div>
            <div style="font-size: 0.9rem; color: var(--text-light);">
                ${new Date(order.date).toLocaleDateString()} - ${order.items.length} items
            </div>
        </div>
    `).join('');
}

// Products
async function loadProducts() {
    try {
        const products = await fetch(`${API_URL}/products`).then(r => r.json());
        renderProductsTable(products);
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Error loading products', 'error');
    }
}

function renderProductsTable(products) {
    const tbody = document.getElementById('products-tbody');
    const mobileContainer = document.getElementById('products-mobile');
    const isMobile = window.innerWidth <= 480;
    
    if (isMobile) {
        // Mobile card view
        tbody.innerHTML = ''; // Clear table
        mobileContainer.innerHTML = products.map(product => {
            let stockClass = 'stock-high';
            let stockText = 'In Stock';
            if (product.stock === 0) {
                stockClass = 'stock-out';
                stockText = 'Out of Stock';
            } else if (product.stock < 10) {
                stockClass = 'stock-low';
                stockText = `Low (${product.stock})`;
            } else {
                stockText = product.stock;
            }
            
            return `
                <div class="product-mobile-card">
                    <div class="product-mobile-header">
                        <img src="${product.image}" alt="${product.name}">
                        <div class="product-mobile-info">
                            <div class="product-mobile-name">${product.name}</div>
                            <div class="product-mobile-category">${product.category}</div>
                        </div>
                    </div>
                    <div class="product-mobile-details">
                        <div class="product-mobile-detail">
                            <span class="product-mobile-label">Price</span>
                            <span class="product-mobile-value">$${product.price.toFixed(2)}/${product.unit}</span>
                        </div>
                        <div class="product-mobile-detail">
                            <span class="product-mobile-label">Stock</span>
                            <span class="product-mobile-value">
                                <span class="stock-badge ${stockClass}">${stockText}</span>
                            </span>
                        </div>
                    </div>
                    <div class="product-mobile-actions">
                        <button class="btn-edit" onclick="editProduct(${product.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-delete" onclick="deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        // Desktop table view
        mobileContainer.innerHTML = ''; // Clear mobile view
        tbody.innerHTML = products.map(product => {
            let stockClass = 'stock-high';
            if (product.stock === 0) stockClass = 'stock-out';
            else if (product.stock < 10) stockClass = 'stock-low';
            
            return `
                <tr>
                    <td><img src="${product.image}" class="product-img-small" alt="${product.name}"></td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>$${product.price.toFixed(2)}/${product.unit}</td>
                    <td><span class="stock-badge ${stockClass}">${product.stock}</span></td>
                    <td>
                        <button class="btn-edit" onclick="editProduct(${product.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

// Re-render on window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (document.getElementById('products-section').classList.contains('active')) {
            loadProducts();
        }
    }, 250);
});

// Add Product Button
document.getElementById('add-product-btn').addEventListener('click', () => {
    currentEditingProduct = null;
    document.getElementById('modal-title').textContent = 'Add Product';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-modal').classList.add('active');
});

// Edit Product
window.editProduct = async function(id) {
    try {
        const products = await fetch(`${API_URL}/products`).then(r => r.json());
        const product = products.find(p => p.id === id);
        
        if (!product) return;
        
        currentEditingProduct = product;
        document.getElementById('modal-title').textContent = 'Edit Product';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-unit').value = product.unit;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-image').value = product.image;
        
        document.getElementById('product-modal').classList.add('active');
    } catch (error) {
        console.error('Error loading product:', error);
        showToast('Error loading product', 'error');
    }
};

// Delete Product
window.deleteProduct = async function(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/products/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Product deleted successfully', 'success');
            loadProducts();
        } else {
            throw new Error('Failed to delete product');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Error deleting product', 'error');
    }
};

// Product Form Submit
document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        unit: document.getElementById('product-unit').value,
        category: document.getElementById('product-category').value,
        stock: parseInt(document.getElementById('product-stock').value),
        image: document.getElementById('product-image').value
    };
    
    try {
        let response;
        if (currentEditingProduct) {
            // Update existing product
            response = await fetch(`${API_URL}/admin/products/${currentEditingProduct.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        } else {
            // Create new product
            response = await fetch(`${API_URL}/admin/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        }
        
        if (response.ok) {
            showToast(`Product ${currentEditingProduct ? 'updated' : 'created'} successfully`, 'success');
            document.getElementById('product-modal').classList.remove('active');
            loadProducts();
        } else {
            throw new Error('Failed to save product');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('Error saving product', 'error');
    }
});

// Close Modal
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('product-modal').classList.remove('active');
    });
});

// Orders
async function loadOrders() {
    try {
        const orders = await fetch(`${API_URL}/admin/orders`).then(r => r.json());
        renderOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
        showToast('Error loading orders', 'error');
    }
}

function renderOrders(orders) {
    const container = document.getElementById('orders-list');
    if (orders.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light);">No orders yet</p>';
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <span class="order-id">Order #${order.id.slice(-6)}</span>
                    <span style="margin-left: 1rem; color: var(--text-light);">
                        ${new Date(order.date).toLocaleDateString()}
                    </span>
                </div>
                <span class="order-total">$${order.total.toFixed(2)}</span>
            </div>
            <div style="margin-top: 0.5rem;">
                ${order.items.map(item => `
                    <div style="font-size: 0.9rem; color: var(--text-dark); margin-top: 0.25rem;">
                        ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Customers
async function loadCustomers() {
    try {
        const customers = await fetch(`${API_URL}/admin/customers`).then(r => r.json());
        renderCustomers(customers);
    } catch (error) {
        console.error('Error loading customers:', error);
        showToast('Error loading customers', 'error');
    }
}

function renderCustomers(customers) {
    const tbody = document.getElementById('customers-tbody');
    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.orderCount}</td>
            <td>$${customer.totalSpent.toFixed(2)}</td>
        </tr>
    `).join('');
}

// Toast Notification
function showToast(message, type = 'success', duration = 3000) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    
    toast.classList.remove('success', 'error');
    toast.classList.add(type);
    
    const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle'
    };
    
    const titleMap = {
        success: 'Success!',
        error: 'Error!'
    };
    
    toast.querySelector('.toast-icon i').className = `fas ${iconMap[type]}`;
    toast.querySelector('.toast-title').textContent = titleMap[type];
    toast.querySelector('.toast-description').textContent = message;
    
    const oldProgress = toast.querySelector('.toast-progress');
    if (oldProgress) oldProgress.remove();
    
    const newProgress = document.createElement('div');
    newProgress.className = 'toast-progress';
    newProgress.style.animation = `progressBar ${duration}ms linear forwards`;
    toast.appendChild(newProgress);
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
    
    toast.querySelector('.toast-close').onclick = () => {
        toast.classList.remove('show');
    };
}

// Logout
document.getElementById('admin-logout-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('hamiToken');
        localStorage.removeItem('hamiUser');
        window.location.href = 'index.html';
    }
});

// Mobile Menu Toggle
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const sidebar = document.querySelector('.admin-sidebar');

mobileMenuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('mobile-open');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            sidebar.classList.remove('mobile-open');
        }
    }
});

// Close mobile menu when clicking a nav link
document.querySelectorAll('.admin-nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('mobile-open');
        }
    });
});

// Dark Mode Toggle
const darkModeToggle = document.getElementById('dark-mode-toggle');
const htmlElement = document.documentElement;

// Load saved theme
const savedTheme = localStorage.getItem('adminTheme') || 'light';
htmlElement.setAttribute('data-theme', savedTheme);
updateDarkModeIcon(savedTheme);

darkModeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('adminTheme', newTheme);
    updateDarkModeIcon(newTheme);
});

function updateDarkModeIcon(theme) {
    const icon = darkModeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// Initialize
loadDashboard();
