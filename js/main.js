// --- IMPORT MODULES ---
import { StorageModule } from './storage.js';
import { ProductModule } from './product.js';
import { CartModule } from './cart.js';

// --- GLOBAL CONSTANTS & STATE ---
const TAX_RATE = 0.05;
const DISCOUNT_THRESHOLD = 50.00;
const DISCOUNT_RATE = 0.10;
window.TAX_RATE = TAX_RATE;

// Automatically detect if we're in production or development
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001/api'
    : 'https://hamimarket-week4-production.up.railway.app/api';

let cart = [];
let currentUser = null; // Will be fetched
let orderHistory = []; // Will be fetched

/**
 *  MODULE: AuthModule
 * Handles REAL login, logout, signup, and order history via API.
 */
const AuthModule = {
    init() {
        //  Load token and user
        const token = StorageModule.loadToken();
        currentUser = StorageModule.loadUser();
        
        if (token && currentUser) {
            this.updateNavUI();
            this.fetchOrderHistory(); // Fetch real history
        }
        this.addListeners();
    },
    
    addListeners() {
        // Form tabs
        document.getElementById('auth-tab-login')?.addEventListener('click', () => this.toggleAuthTabs('login'));
        document.getElementById('auth-tab-signup')?.addEventListener('click', () => this.toggleAuthTabs('signup'));
        
        // Form submits
        document.getElementById('login-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.elements.email.value;
            const password = e.target.elements.password.value;
            this.login(email, password);
        });
        document.getElementById('signup-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = e.target.elements.name.value;
            const email = e.target.elements.email.value;
            const password = e.target.elements.password.value;
            this.signup(name, email, password);
        });
        
        // Nav links
        document.getElementById('nav-login-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            UIModule.showPage('account-page');
        });
        document.getElementById('nav-account-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            UIModule.showPage('account-page');
        });
        
        // Logout buttons
        document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
        document.getElementById('account-logout-btn')?.addEventListener('click', () => this.logout());
        document.getElementById('account-logout-btn-mobile')?.addEventListener('click', () => this.logout());
    },

    toggleAuthTabs(activeTab) {
        const loginTab = document.getElementById('auth-tab-login');
        const signupTab = document.getElementById('auth-tab-signup');
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        
        if (activeTab === 'login') {
            loginTab.classList.add('active');
            signupTab.classList.remove('active');
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
        } else {
            loginTab.classList.remove('active');
            signupTab.classList.add('active');
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
        }
    },

    // () Real Login
    async login(email, password) {
        if (!email || !password) {
            UIModule.showToast("Please enter email and password", "error");
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.message || 'Login failed');

            currentUser = data.user;
            StorageModule.saveUser(currentUser);
            StorageModule.saveToken(data.token);
            
            console.log('Logged in user:', currentUser);
            console.log('Is admin?', currentUser.isAdmin);
            
            // Check if user is admin
            if (currentUser.isAdmin === true) {
                // Redirect to admin dashboard
                console.log('Redirecting to admin dashboard...');
                UIModule.showToast(`Welcome Admin!`, 'success');
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);
                return;
            }
            
            await this.fetchOrderHistory(); // Fetch real orders
            
            this.updateNavUI();
            UIModule.showPage('shop-page');
            UIModule.showToast(`Welcome back, ${currentUser.name}!`, 'success');

        } catch (error) {
            console.error("Login Error:", error);
            UIModule.showToast(error.message, "error");
        }
    },
    
    // () Real Signup
    async signup(name, email, password) {
        if (!name || !email || !password) {
            UIModule.showToast("Please fill in all fields", "error");
            return;
        }

        if (name.length < 2) {
            UIModule.showToast("Name must be at least 2 characters", "error");
            return;
        }

        if (password.length < 6) {
            UIModule.showToast("Password must be at least 6 characters", "error");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.message || 'Signup failed');

            currentUser = data.user;
            StorageModule.saveUser(currentUser);
            StorageModule.saveToken(data.token);
            
            orderHistory = []; // New user, no history
            
            this.updateNavUI();
            UIModule.showPage('shop-page');
            UIModule.showToast(`Welcome, ${currentUser.name}! Account created.`, 'success');

        } catch (error) {
            console.error("Signup Error:", error);
            UIModule.showToast(error.message, "error");
        }
    },
    
    // () Real Logout
    logout() {
        if (currentUser) {
            UIModule.showToast(`Goodbye, ${currentUser.name}!`, 'info');
        }
        currentUser = null;
        orderHistory = [];
        StorageModule.clearUser();
        StorageModule.clearToken(); // (NEW) Clear the token
        this.updateNavUI();
        UIModule.showPage('shop-page');
    },
    
    // (No change) Updates nav bar based on `currentUser`
    updateNavUI() {
        const userInfo = document.getElementById('nav-user-info');
        const authLinks = document.getElementById('nav-auth-links');
        const footerAccountLink = document.getElementById('footer-account-link');

        if (currentUser) {
            userInfo.classList.remove('hidden');
            authLinks.classList.add('hidden');
            document.getElementById('nav-username').textContent = currentUser.name;
            footerAccountLink.textContent = 'My Account';
        } else {
            userInfo.classList.add('hidden');
            authLinks.classList.remove('hidden');
            footerAccountLink.textContent = 'Login / Sign Up';
        }
    },
    
    // (No change) Renders EITHER auth forms or account info
    renderAccountPage() {
        const authContainer = document.getElementById('auth-forms-container');
        const accountInfo = document.getElementById('account-info-container');
        
        if (currentUser) {
            authContainer.classList.add('hidden');
            accountInfo.classList.remove('hidden');
            document.getElementById('account-username').textContent = currentUser.name;
            document.getElementById('account-email').textContent = currentUser.email;
            this.renderOrderHistory();
        } else {
            authContainer.classList.remove('hidden');
            accountInfo.classList.add('hidden');
            this.toggleAuthTabs('login'); // Default to login
        }
    },
    
    // (NEW) Fetches real order history
    async fetchOrderHistory() {
        const token = StorageModule.loadToken();
        if (!token) {
            console.log('No token found, cannot fetch order history');
            return; // Not logged in
        }
        
        console.log('Fetching order history...');
        
        try {
            const response = await fetch(`${API_URL}/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to fetch orders');
            }
            
            orderHistory = await response.json();
            console.log('Order history fetched:', orderHistory);
            this.renderOrderHistory(); // Re-render with fetched data

        } catch (error) {
            console.error("Fetch History Error:", error);
            if (error.message.includes('Token')) this.logout(); // Token is bad, log out
        }
    },

    // () Renders order history from `orderHistory` array
    renderOrderHistory() {
        const listEl = document.getElementById('order-history-list');
        const noOrdersEl = document.getElementById('no-orders-message');

        if (!listEl || !noOrdersEl) {
            console.log('Order history elements not found');
            return;
        }
        
        listEl.innerHTML = ''; // Clear old list
        
        console.log('Rendering order history, count:', orderHistory.length);
        
        if (orderHistory.length === 0) {
            noOrdersEl.classList.remove('hidden');
        } else {
            noOrdersEl.classList.add('hidden');
            orderHistory.forEach(order => {
                const orderEl = document.createElement('div');
                orderEl.className = 'order-item';
                
                // Format date
                const orderDate = new Date(order.date).toLocaleDateString();
                
                // Create list of items
                const itemsHtml = order.items.map(item => `
                    <div class="order-product">
                        <img src="${item.image}" alt="${item.name}" class="order-product-img">
                        <div class="order-product-info">
                            <div class="name">${item.name}</div>
                            <div class="qty">Qty: ${item.quantity}</div>
                        </div>
                        <span class="order-product-price">$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('');
                
                // Note: We use order._id from MongoDB, but the virtual 'id' works too
                orderEl.innerHTML = `
                    <div class="order-item-header">
                        <div>
                            <h4>Order #${order.id.slice(-6)}</h4> 
                            <span>${orderDate}</span>
                        </div>
                        <span class="order-total">$${order.total.toFixed(2)}</span>
                    </div>
                    <div class="order-item-body">
                        ${itemsHtml}
                    </div>
                `;
                listEl.appendChild(orderEl);
            });
        }
    },
};

/**
 * MODULE: UIModule
 */
export const UIModule = {
    init() {
        // Cart sidebar listeners
        document.getElementById('cart-icon')?.addEventListener('click', this.toggleCart);
        document.getElementById('close-cart-btn')?.addEventListener('click', this.toggleCart);
        document.getElementById('cart-overlay')?.addEventListener('click', this.toggleCart);
        
        // () Page navigation listeners
        document.getElementById('cart-checkout-btn')?.addEventListener('click', () => {
            if (cart.length === 0) {
                this.showToast("Your cart is empty! Add some items first.", 'warning');
                return;
            }
            if (!currentUser) { // Check for real user
                this.showToast("Please log in to proceed to checkout.", 'info');
                this.showPage('account-page');
                this.toggleCart(); 
            } else {
                this.showPage('summary-page');
                this.toggleCart();
            }
        });
        
        document.getElementById('back-to-shop-btn')?.addEventListener('click', () => {
            this.showPage('shop-page');
        });
        
        // () Confirm order
        document.getElementById('confirm-order-btn')?.addEventListener('click', async () => {
            const token = StorageModule.loadToken();
            if (!token || !currentUser) {
                UIModule.showToast("You are not logged in.", "error");
                AuthModule.logout();
                return;
            }
            
            const totals = CartModule.getCartTotals(cart); 
            
            try {
                // (NEW) Save order to backend
                const response = await fetch(`${API_URL}/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        items: cart,
                        total: totals.total
                    })
                });
                
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || "Failed to save order");
                }
                
                // Order saved successfully
                showSuccessMessage('order-success', 'Order Confirmed!', 'Thank you! Your order is now in your history.');
                CartModule.clearCart(cart);
                
                // Fetch updated order history
                await AuthModule.fetchOrderHistory();
                
                setTimeout(() => {
                    this.showPage('shop-page');
                }, 3000);

            } catch (error) {
                console.error("Order Confirm Error:", error);
                UIModule.showToast(error.message, "error");
            }
        });
    },
    
    // (No change)
    toggleCart() {
        document.getElementById('cart-sidebar')?.classList.toggle('active');
        document.getElementById('cart-overlay')?.classList.toggle('active');
    },
    
    // (No change)
    updateCart(cart) {
        const cartItemsContainer = document.getElementById('cart-items-container');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const cartFooter = document.getElementById('cart-footer');
        
        if (!cartItemsContainer || !emptyCartMessage || !cartFooter) return;

        const itemsToRemove = Array.from(cartItemsContainer.children).filter(child => child.id !== 'empty-cart-message');
        itemsToRemove.forEach(child => cartItemsContainer.removeChild(child));
        
        if (cart.length === 0) {
            emptyCartMessage.classList.add('active');
            cartFooter.classList.remove('active');
        } else {
            emptyCartMessage.classList.remove('active');
            cartFooter.classList.add('active'); 
            
            cart.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.dataset.id = item.id;
                itemEl.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-details">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <div class="cart-item-controls">
                            <div class="quantity-control">
                                <button class="quantity-btn" data-action="decrease" aria-label="Decrease quantity">-</button>
                                <input type="number" class="item-quantity" value="${item.quantity}" min="1" aria-label="Item quantity">
                                <button class="quantity-btn" data-action="increase" aria-label="Increase quantity">+</button>
                            </div>
                            <button class="remove-item-btn" aria-label="Remove item"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
        }
        
        // Update totals (no change)
        const totals = CartModule.getCartTotals(cart);
        document.getElementById('cart-subtotal').textContent = `$${totals.subtotal.toFixed(2)}`;
        const discountRow = document.getElementById('cart-discount-row');
        if (totals.discount > 0) {
            document.getElementById('cart-discount').textContent = `-$${totals.discount.toFixed(2)}`;
            discountRow.style.display = 'flex';
        } else {
            discountRow.style.display = 'none';
        }
        document.getElementById('cart-tax').textContent = `$${totals.tax.toFixed(2)}`;
        document.getElementById('cart-total').textContent = `$${totals.total.toFixed(2)}`;
        
        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cart-count').textContent = totalQuantity;
    },
    
    // (No change)
    showToast(message, type = 'success', duration = 3000) {
        const toast = document.getElementById('toast-notification');
        if (!toast) return;
        
        if (toast.timeoutId) clearTimeout(toast.timeoutId);
        
        toast.classList.remove('success', 'error', 'warning', 'info');
        toast.classList.add(type);
        
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        const titleMap = {
            success: 'Success!',
            error: 'Error!',
            warning: 'Warning!',
            info: 'Info'
        };
        
        toast.querySelector('.toast-icon i').className = `fas ${iconMap[type] || iconMap.success}`;
        toast.querySelector('.toast-title').textContent = titleMap[type] || titleMap.success;
        toast.querySelector('.toast-description').textContent = message;
        
        const oldProgress = toast.querySelector('.toast-progress');
        if (oldProgress) oldProgress.remove();
        
        const newProgress = document.createElement('div');
        newProgress.className = 'toast-progress';
        newProgress.style.animation = `progressBar ${duration}ms linear forwards`;
        toast.appendChild(newProgress);
        
        toast.classList.add('show');
        
        toast.timeoutId = setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
        
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                clearTimeout(toast.timeoutId);
                toast.classList.remove('show');
            };
        }
    },
    
    // () showPage
    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.add('hidden');
        });
        
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.remove('hidden');
        }
        
        if (pageId === 'summary-page') {
            this.renderSummaryPage();
        }
        
        // (NEW) Render account page
        if (pageId === 'account-page') {
            AuthModule.renderAccountPage();
        }
        
        window.scrollTo(0, 0);
    },
    
    // () renderSummaryPage
    renderSummaryPage() {
        const summaryList = document.getElementById('summary-list');
        const summaryTotals = document.getElementById('summary-totals');
        const greeting = document.getElementById('summary-user-greeting');

        if (!summaryList || !summaryTotals || !greeting) return;

        summaryList.innerHTML = '';
        
        if (cart.length === 0) {
            summaryList.innerHTML = '<p>Your cart is empty.</p>';
            summaryTotals.innerHTML = '';
            document.getElementById('confirm-order-btn').style.display = 'none';
        } else {
             document.getElementById('confirm-order-btn').style.display = 'block';
             cart.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'summary-item';
                itemEl.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="summary-item-img">
                    <div class="summary-item-info">
                        <h4>${item.name}</h4>
                        <p>Quantity: ${item.quantity}</p>
                    </div>
                    <span class="summary-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                `;
                summaryList.appendChild(itemEl);
            });
            
            const totals = CartModule.getCartTotals(cart);
            summaryTotals.innerHTML = `
                <div class="cart-summary-row">
                    <span>Subtotal</span>
                    <span>$${totals.subtotal.toFixed(2)}</span>
                </div>
                ${totals.discount > 0 ? `
                <div class="cart-summary-row discount">
                    <span>Discount (10%)</span>
                    <span>-$${totals.discount.toFixed(2)}</span>
                </div>` : ''}
                <div class="cart-summary-row">
                    <span>Tax (5%)</span>
                    <span>$${totals.tax.toFixed(2)}</span>
                </div>
                <div class="cart-summary-row total">
                    <span>Total</span>
                    <span>$${totals.total.toFixed(2)}</span>
                </div>
            `;
        }

        // (NEW) Greet the user
        if (currentUser) {
            greeting.textContent = `You are checking out as ${currentUser.name}.`;
        } else {
            greeting.textContent = `Please review your items.`;
        }
    }
};

// --- (All your original script functions: initMobileMenu, etc.) ---
// ... (Copy/paste all of them here, unchanged) ...
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-list');
    const cartIcon = document.getElementById('cart-icon');
    
    if (hamburger && navList) {
        hamburger.addEventListener('click', () => {
            navList.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navList.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
        
        document.addEventListener('click', (e) => {
            if (cartIcon && !hamburger.contains(e.target) && !navList.contains(e.target) && !cartIcon.contains(e.target) && !e.target.closest('.cart-icon-wrapper')) {
                navList.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }
}

function initBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });
        
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Skip if it's just "#" or "#account"
            if (targetId === "#" || targetId === "#account") return;
            
            e.preventDefault();

            const targetSection = document.querySelector(targetId);
            if (!targetSection) return; 

            // Check if we're on summary or account page
            const summaryPage = document.getElementById('summary-page');
            const accountPage = document.getElementById('account-page');
            const isOnSummaryPage = summaryPage && !summaryPage.classList.contains('hidden');
            const isOnAccountPage = accountPage && !accountPage.classList.contains('hidden');

            if (isOnSummaryPage || isOnAccountPage) {
                // Switch to shop page first, then scroll
                UIModule.showPage('shop-page');
                setTimeout(() => {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }, 50);
            } else {
                // Already on shop page, just scroll
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            const productsSection = document.getElementById('products');
            if (productsSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = productsSection.offsetTop - headerHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    }

    // Handle logo click to return to home
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            UIModule.showPage('shop-page');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}


function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const animatedElements = document.querySelectorAll('.feature, .info-item, .product-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const optimizedScrollHandler = debounce(() => {
    const header = document.querySelector('.header');
    const scrollY = window.scrollY;

    if (header) {
        if (scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            if (header.style.backdropFilter !== 'blur(10px)') {
                header.style.backdropFilter = 'blur(10px)';
            }
        } else {
            header.style.background = 'var(--neutral-white)';
            if (header.style.backdropFilter !== 'none') {
                header.style.backdropFilter = 'none';
            }
        }
    }
}, 10);

window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    setTimeout(() => { document.body.style.opacity = '1'; }, 100);
});

window.addEventListener('scroll', optimizedScrollHandler);

// --- Contact Form Validation ---
function initFormValidation() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateAllFields()) {
            showSuccessMessage('contactSuccess', 'Message sent successfully!', 'We\'ll get back to you soon!');
            contactForm.reset();
        }
    });

    const inputs = contactForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
}

function validateAllFields() {
    let isValid = true;
    const fields = ['name', 'email', 'message'];
    fields.forEach(id => {
        const field = document.getElementById(id);
        if (field && !validateField(field)) {
            isValid = false;
        }
    });
    return isValid;
}

function validateField(field) {
    if (!field) return false;
    const fieldValue = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch (field.name) {
        case 'name':
            isValid = fieldValue.length >= 2 && /^[a-zA-Z\s]+$/.test(fieldValue);
            errorMessage = 'Please enter a valid name (at least 2 characters)';
            break;
        case 'email':
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue);
            errorMessage = 'Please enter a valid email address';
            break;
        case 'message':
            isValid = fieldValue.length >= 10;
            errorMessage = 'Please enter a message (at least 10 characters)';
            break;
    }
    
    if (!isValid) {
        showError(field.name + 'Error', errorMessage);
    } else {
        clearFieldError(field);
    }
    return isValid;
}

function showError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearFieldError(field) {
    const errorId = field.name + 'Error';
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

export function showSuccessMessage(id, title, text) {
    let existingModal = document.getElementById(id);
    if (existingModal) existingModal.remove();

    const successMessage = document.createElement('div');
    successMessage.id = id;
    successMessage.innerHTML = `
        <div style="
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: linear-gradient(45deg, var(--secondary-green), var(--primary-green));
            color: white; padding: 2rem 3rem; border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3); text-align: center;
            z-index: 10000; animation: fadeInScale 0.5s ease;
        ">
            <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 1rem; color: var(--accent-yellow);"></i>
            <h3 style="margin-bottom: 1rem; font-size: 1.5rem;">${title}</h3>
            <p style="margin-bottom: 0; opacity: 0.9;">${text}</p>
        </div>
        <style>
            @keyframes fadeInScale {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
        </style>
    `;
    
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
        if (document.body.contains(successMessage)) {
             document.body.removeChild(successMessage);
        }
    }, 3000);
}


/**
 * () APP INITIALIZATION
 */
document.addEventListener('DOMContentLoaded', async () => {
    // (NEW) Init Auth first to load user
    AuthModule.init(); 

    // Init original UI functions (Task 1)
    initMobileMenu();
    initBackToTop();
    initFormValidation();
    initSmoothScrolling();
    // initScrollAnimations(); // Note: ProductModule now handles its own animations

    // () Await product module initialization
    await ProductModule.init();
    
    // Load cart from storage (Task 3)
    cart = StorageModule.loadCart();
    
    // Init Cart logic (Task 3)
    CartModule.init(cart);
    
    // Init UI (Task 3)
    UIModule.init();
    UIModule.updateCart(cart); // Render initial cart
});