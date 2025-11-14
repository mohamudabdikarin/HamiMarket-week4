import { StorageModule } from './storage.js';
import { UIModule } from './main.js';
import { ProductModule } from './product.js';

// --- Constants ---
const DISCOUNT_THRESHOLD = 50.00;
const DISCOUNT_RATE = 0.10;

/**

 * Handles all cart logic with stock checking.
 */
export const CartModule = {
    init(cart) { 
        // Event delegation for Add to Cart buttons
        const productsGrid = document.getElementById('products-grid');
        if (productsGrid) {
            productsGrid.addEventListener('click', (e) => {
                const btn = e.target.closest('.add-to-cart-btn');
                if (btn) {
                    this.addToCart(cart, {
                        id: btn.dataset.id,
                        name: btn.dataset.name,
                        price: parseFloat(btn.dataset.price),
                        image: btn.dataset.image
                    });
                    
                    // Button feedback (no change)
                    btn.innerHTML = 'Added!';
                    btn.style.background = "var(--secondary-green)";
                    setTimeout(() => {
                       btn.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
                       btn.style.background = "var(--primary-green)";
                    }, 1000);
                }
            });
        }
        
        // Event delegation for cart controls (no change)
        const cartItemsContainer = document.getElementById('cart-items-container');
        if (cartItemsContainer) {
            cartItemsContainer.addEventListener('click', (e) => {
                const target = e.target;
                const cartItem = target.closest('.cart-item');
                if (!cartItem) return;
                
                const id = cartItem.dataset.id;
                
                if(target.closest('.remove-item-btn')) {
                    this.removeFromCart(cart, id);
                }
                if(target.matches('[data-action="decrease"]')) {
                    this.updateQuantity(cart, id, 'decrease');
                }
                if(target.matches('[data-action="increase"]')) {
                    this.updateQuantity(cart, id, 'increase');
                }
            });
            
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
    
    // (UPDATED) Add to cart with stock check
    addToCart(cart, product) {
        // (NEW) Check stock
        const productData = ProductModule.getProductById(product.id);
        if (!productData) return UIModule.showToast("Product not found.", "error");
        
        const availableStock = productData.stock;
        const existingItem = cart.find(item => item.id === product.id);
        const quantityInCart = existingItem ? existingItem.quantity : 0;

        if (quantityInCart >= availableStock) {
            UIModule.showToast("You've already added all available stock!", "warning");
            return;
        }
        // --- End stock check ---

        if (existingItem) {
            existingItem.quantity++;
            UIModule.showToast(`${product.name} quantity updated in cart!`, 'success');
        } else {
            cart.push({ ...product, quantity: 1 });
            UIModule.showToast(`${product.name} added to cart!`, 'success');
        }
        StorageModule.saveCart(cart);
        UIModule.updateCart(cart);
    },
    
    // No changes needed
    removeFromCart(cart, id) {
        const item = cart.find(item => item.id === id);
        const itemName = item ? item.name : 'Item';
        const newCart = cart.filter(item => item.id !== id);
        cart.length = 0; 
        Array.prototype.push.apply(cart, newCart);
        StorageModule.saveCart(cart);
        UIModule.updateCart(cart);
        UIModule.showToast(`${itemName} removed from cart`, 'info');
    },
    
    // (UPDATED) Update quantity with stock check
    updateQuantity(cart, id, action, isAbsolute = false) {
        const item = cart.find(item => item.id === id);
        if (!item) return;

        // (NEW) Check stock
        const productData = ProductModule.getProductById(id);
        if (!productData) return UIModule.showToast("Product not found.", "error");
        const availableStock = productData.stock;
        // --- End stock check ---
        
        let newQuantity = item.quantity;

        if (isAbsolute) {
            newQuantity = action;
        } else if (action === 'increase') {
            newQuantity++;
        } else if (action === 'decrease') {
            newQuantity--;
        }

        // (NEW) Validate against stock
        if (newQuantity > availableStock) {
            newQuantity = availableStock;
            UIModule.showToast(`Only ${availableStock} in stock!`, "warning");
        }
        // --- End validation ---
        
        if (newQuantity <= 0) {
            this.removeFromCart(cart, id);
        } else {
            item.quantity = newQuantity; // Set the validated quantity
            StorageModule.saveCart(cart);
            UIModule.updateCart(cart);
        }
    },
    
    // No changes needed
    getCartTotals(cart) {
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const discount = subtotal > DISCOUNT_THRESHOLD ? subtotal * DISCOUNT_RATE : 0;
        const subtotalAfterDiscount = subtotal - discount;
        const tax = subtotalAfterDiscount * (window.TAX_RATE || 0.05);
        const total = subtotalAfterDiscount + tax;
        
        return {
            subtotal: subtotal,
            discount: discount,
            tax: tax,
            total: total
        };
    },
    
    
    clearCart(cart) {
        cart.length = 0;
        StorageModule.saveCart(cart);
        UIModule.updateCart(cart);
    }
};