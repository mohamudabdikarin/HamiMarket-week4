import { StorageModule } from './storage.js';
import { UIModule } from './main.js'; // Import UIModule from main.js

// --- Constants ---
const DISCOUNT_THRESHOLD = 50.00;
const DISCOUNT_RATE = 0.10;

/**
 * MODULE: CartModule (Task 3)
 * Handles all cart logic (add, remove, update, totals).
 */
export const CartModule = {
    // Initialize the cart logic, accepting the global cart state
    init(cart) { 
        // Event delegation for Add to Cart buttons
        const productsGrid = document.getElementById('products-grid');
        if (productsGrid) {
            productsGrid.addEventListener('click', (e) => {
                if (e.target.classList.contains('add-to-cart-btn')) {
                    const btn = e.target;
                    this.addToCart(cart, {
                        id: btn.dataset.id,
                        name: btn.dataset.name,
                        price: parseFloat(btn.dataset.price),
                        image: btn.dataset.image
                    });
                    
                    // Button feedback
                    btn.innerHTML = 'Added!';
                    btn.style.background = "var(--secondary-green)";
                    setTimeout(() => {
                       btn.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
                       btn.style.background = "var(--primary-green)";
                    }, 1000);
                }
            });
        }
        
        // Event delegation for cart controls
        const cartItemsContainer = document.getElementById('cart-items-container');
        if (cartItemsContainer) {
            cartItemsContainer.addEventListener('click', (e) => {
                const target = e.target;
                const cartItem = target.closest('.cart-item');
                if (!cartItem) return;
                
                const id = cartItem.dataset.id;
                
                // Remove button
                if(target.closest('.remove-item-btn')) {
                    this.removeFromCart(cart, id);
                }
                
                // Decrease quantity
                if(target.matches('[data-action="decrease"]')) {
                    this.updateQuantity(cart, id, 'decrease');
                }
                
                // Increase quantity
                if(target.matches('[data-action="increase"]')) {
                    this.updateQuantity(cart, id, 'increase');
                }
            });
            
            // Manual quantity input
            cartItemsContainer.addEventListener('change', (e) => {
                 if (e.target.classList.contains('item-quantity')) {
                    const id = e.target.closest('.cart-item').dataset.id;
                    let newQuantity = parseInt(e.target.value);
                    if (isNaN(newQuantity) || newQuantity < 1) {
                        newQuantity = 1;
                    }
                    this.updateQuantity(cart, id, newQuantity, true); // true = set absolute value
                 }
            });
        }
    },
    
    addToCart(cart, product) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
            UIModule.showToast(`${product.name} quantity updated in cart!`, 'success');
        } else {
            cart.push({ ...product, quantity: 1 });
            UIModule.showToast(`${product.name} added to cart!`, 'success');
        }
        StorageModule.saveCart(cart);
        UIModule.updateCart(cart); // Pass cart to updateUI
    },
    
    removeFromCart(cart, id) {
        const item = cart.find(item => item.id === id);
        const itemName = item ? item.name : 'Item';
        const newCart = cart.filter(item => item.id !== id);
        cart.length = 0; // Clear the original array
        Array.prototype.push.apply(cart, newCart); // Push new items back
        StorageModule.saveCart(cart);
        UIModule.updateCart(cart); // Pass cart to updateUI
        UIModule.showToast(`${itemName} removed from cart`, 'info');
    },
    
    updateQuantity(cart, id, action, isAbsolute = false) {
        const item = cart.find(item => item.id === id);
        if (!item) return;
        
        if (isAbsolute) {
            item.quantity = action;
        } else if (action === 'increase') {
            item.quantity++;
        } else if (action === 'decrease') {
            item.quantity--;
        }
        
        if (item.quantity <= 0) {
            this.removeFromCart(cart, id);
        } else {
            StorageModule.saveCart(cart);
            UIModule.updateCart(cart); // Pass cart to updateUI
        }
    },
    
    getCartTotals(cart) {
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const discount = subtotal > DISCOUNT_THRESHOLD ? subtotal * DISCOUNT_RATE : 0;
        const subtotalAfterDiscount = subtotal - discount;
        const tax = subtotalAfterDiscount * (window.TAX_RATE || 0.05); // Use global TAX_RATE
        const total = subtotalAfterDiscount + tax;
        
        return {
            subtotal: subtotal,
            discount: discount,
            tax: tax,
            total: total
        };
    },
    
    clearCart(cart) {
        cart.length = 0; // Clear the original array
        StorageModule.saveCart(cart);
        UIModule.updateCart(cart); // Pass cart to updateUI
    }
};