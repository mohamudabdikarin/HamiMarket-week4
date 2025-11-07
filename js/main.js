// --- IMPORT MODULES ---
import { StorageModule } from './storage.js';
import { ProductModule } from './product.js';
import { CartModule } from './cart.js';

// --- GLOBAL CONSTANTS & STATE ---
// These are needed by imported modules
const TAX_RATE = 0.05;
const DISCOUNT_THRESHOLD = 50.00;
const DISCOUNT_RATE = 0.10;
window.TAX_RATE = TAX_RATE; // Expose to CartModule via window

// Main cart state
let cart = [];

/**
 * MODULE: UIModule (Task 3)
 * Handles all DOM updates, showing/hiding elements, and page navigation.
 * Exported so CartModule can import it.
 */
export const UIModule = {
    init() {
        // Cart sidebar listeners
        document.getElementById('cart-icon')?.addEventListener('click', this.toggleCart);
        document.getElementById('close-cart-btn')?.addEventListener('click', this.toggleCart);
        document.getElementById('cart-overlay')?.addEventListener('click', this.toggleCart);
        
        // Page navigation listeners
        document.getElementById('cart-checkout-btn')?.addEventListener('click', () => {
            // *** FIX for Bug 2: Check if cart has items ***
            if (cart.length > 0) {
                this.showPage('summary-page');
                this.toggleCart(); // Close cart
            } else {
                this.showToast("Your cart is empty! Add some items first.", 'warning');
            }
        });
        
        document.getElementById('back-to-shop-btn')?.addEventListener('click', () => {
            this.showPage('shop-page');
        });
        
        // Confirm order
        document.getElementById('confirm-order-btn')?.addEventListener('click', () => {
            showSuccessMessage('order-success', 'Order Confirmed!', 'Thank you for your purchase. We are preparing your items.');
            CartModule.clearCart(cart); // Pass cart
            setTimeout(() => {
                this.showPage('shop-page');
            }, 3000);
        });
    },
    
    // Toggles the cart sidebar
    toggleCart() {
        document.getElementById('cart-sidebar')?.classList.toggle('active');
        document.getElementById('cart-overlay')?.classList.toggle('active');
    },
    
    // The main function to update all cart-related UI
    updateCart(cart) { // Now accepts cart as an argument
        const cartItemsContainer = document.getElementById('cart-items-container');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const cartFooter = document.getElementById('cart-footer');
        
        if (!cartItemsContainer || !emptyCartMessage || !cartFooter) return;

        // *** FIX for Bug 1: Clear only cart items, not the empty message div ***
        const itemsToRemove = Array.from(cartItemsContainer.children).filter(child => child.id !== 'empty-cart-message');
        itemsToRemove.forEach(child => cartItemsContainer.removeChild(child));
        
        if (cart.length === 0) {
            emptyCartMessage.classList.add('active'); // Use CSS class to show
            cartFooter.classList.remove('active'); // Use CSS class to hide
        } else {
            emptyCartMessage.classList.remove('active'); // Use CSS class to hide
            cartFooter.classList.add('active'); // Use CSS class to show
            
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
        
        // Update totals
        const totals = CartModule.getCartTotals(cart); // Pass cart
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
        
        // Update navbar cart count
        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cart-count').textContent = totalQuantity;
    },
    
    // Shows an advanced toast notification
    showToast(message, type = 'success', duration = 3000) {
        const toast = document.getElementById('toast-notification');
        if (!toast) return;
        
        // Clear any existing timeout
        if (toast.timeoutId) {
            clearTimeout(toast.timeoutId);
        }
        
        // Remove any existing type classes
        toast.classList.remove('success', 'error', 'warning', 'info');
        
        // Add the new type class
        toast.classList.add(type);
        
        // Update content based on type
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
        
        const icon = toast.querySelector('.toast-icon i');
        const title = toast.querySelector('.toast-title');
        const description = toast.querySelector('.toast-description');
        
        if (icon) icon.className = `fas ${iconMap[type] || iconMap.success}`;
        if (title) title.textContent = titleMap[type] || titleMap.success;
        if (description) description.textContent = message;
        
        // Remove and re-add progress bar for animation restart
        const oldProgress = toast.querySelector('.toast-progress');
        if (oldProgress) oldProgress.remove();
        
        const newProgress = document.createElement('div');
        newProgress.className = 'toast-progress';
        newProgress.style.animation = `progressBar ${duration}ms linear forwards`;
        toast.appendChild(newProgress);
        
        // Show toast
        toast.classList.add('show');
        
        // Auto-hide after duration
        toast.timeoutId = setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
        
        // Close button handler
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                clearTimeout(toast.timeoutId);
                toast.classList.remove('show');
            };
        }
    },
    
    // Handles switching between "pages"
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
        
        window.scrollTo(0, 0); // Scroll to top on page change
    },
    
    // Renders the order summary page
    renderSummaryPage() {
        const summaryList = document.getElementById('summary-list');
        const summaryTotals = document.getElementById('summary-totals');
        if (!summaryList || !summaryTotals) return;

        summaryList.innerHTML = '';
        
        if (cart.length === 0) {
            summaryList.innerHTML = '<p>Your cart is empty.</p>';
            summaryTotals.innerHTML = '';
            document.getElementById('confirm-order-btn').style.display = 'none';
            return;
        }
        
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
        
        const totals = CartModule.getCartTotals(cart); // Pass cart
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
};


// --- START OF ORIGINAL SCRIPT (WEEK 1) ---

// --- General Page UI ---

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
            // Updated to prevent closing when cart icon is clicked
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
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === "#") return; 

            const targetSection = document.querySelector(targetId);
            if (!targetSection) return; 

            if (document.getElementById('summary-page') && !document.getElementById('summary-page').classList.contains('hidden')) {
                UIModule.showPage('shop-page');
                setTimeout(() => {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }, 50);
            } else {
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
    
    const animatedElements = document.querySelectorAll('.feature, .info-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Export this function so ProductModule can import it
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
    const backToTopButton = document.getElementById('backToTop');
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
    
    if (backToTopButton) {
        if (scrollY > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    }
}, 10);

window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    setTimeout(() => { document.body.style.opacity = '1'; }, 100);
});

window.addEventListener('scroll', optimizedScrollHandler);

// --- Contact Form Validation (Task 1) ---

function initFormValidation() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateAllFields()) {
            showSuccessMessage('contactSuccess', 'Message sent successfully!', 'Your message has been sent. We\'ll get back to you soon!');
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

// Exported so UIModule can use it
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

// --- END OF ORIGINAL SCRIPT ---


/**
 * APP INITIALIZATION
 * This is the main entry point for the application.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Init original UI functions (Task 1)
    initMobileMenu();
    initBackToTop();
    initFormValidation();
    initSmoothScrolling();
    initScrollAnimations();
    
    // Init Product module (Task 2)
    ProductModule.init();
    
    // Load cart from storage (Task 3)
    cart = StorageModule.loadCart();
    
    // Init Cart logic (Task 3)
    CartModule.init(cart); // Pass the loaded cart
    
    // Init UI (Task 3)
    UIModule.init();
    UIModule.updateCart(cart); // Render initial cart
});