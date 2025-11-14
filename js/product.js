import { debounce } from './main.js';

//  State (local to this module) 
let currentFilters = { searchTerm: '', category: 'all', maxPrice: 10 };
// Automatically detect if we're in production or development
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001/api'
    : 'https://hamimarket-week4-production.up.railway.app/api';

/**
 * Handles fetching, storing, and rendering the product list.
 */
export const ProductModule = {
    // This array will be populated by fetchProducts()
    allProducts: [],

    // (NEW) Fetches products from the backend
    async fetchProducts() {
        try {
            const response = await fetch(`${API_URL}/products`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.allProducts = await response.json();
            console.log("Products loaded from backend:", this.allProducts);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            this.allProducts = []; 
            const productsGrid = document.getElementById('products-grid');
            if (productsGrid) {
                productsGrid.innerHTML = `<p id="no-products-message" style="color: var(--error-red);">Error loading products. Please try again later.</p>`;
            }
        }
    },

    
    async init() {
        await this.fetchProducts(); 
        
        if (this.allProducts.length > 0) {
            this.initFilters();
            this.filterAndRender();
        }
    },

    // (UPDATED) Renders products, now includes stock logic
    renderProducts(productsToRender) {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) return;
        productsGrid.innerHTML = '';
        
        if (productsToRender.length === 0) {
            productsGrid.innerHTML = `<p id="no-products-message">No products match your filters. Try adjusting your search!</p>`;
            return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        productsToRender.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            //  (NEW) Stock Logic 
            let stockBadge = '';
            let isOutOfStock = false;
            if (product.stock <= 0) {
                stockBadge = `<div class="stock-badge out-of-stock">Out of Stock</div>`;
                isOutOfStock = true;
            } else if (product.stock < 10) {
                stockBadge = `<div class="stock-badge">Low Stock (${product.stock} left)</div>`;
            }
            //  End Stock Logic 

            card.innerHTML = `
                ${stockBadge}
                <div class="product-card-content">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" class="product-img" onerror="this.src='https://placehold.co/300x200/F5F5DC/2C3E50?text=${product.name.replace(' ','+')}'; this.onerror=null;">
                    </div>
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="price">$${product.price.toFixed(2)}/${product.unit}</div>
                </div>
                <button class="add-to-cart-btn" 
                        data-id="${product.id}" 
                        data-name="${product.name}" 
                        data-price="${product.price}" 
                        data-image="${product.image}"
                        ${isOutOfStock ? 'disabled' : ''}> <!-- (NEW) Disable button -->
                    ${isOutOfStock ? 'Out of Stock' : '<i class="fas fa-cart-plus"></i> Add to Cart'}
                </button>
            `;
            
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            productsGrid.appendChild(card);
            observer.observe(card);
        });
    },

    // (UPDATED) Sets max price from fetched products
    initFilters() {
        const searchInput = document.getElementById('search-input');
        const categoryFilters = document.getElementById('category-filters');
        const priceSlider = document.getElementById('price-slider');
        const priceValue = document.getElementById('price-value');
        
        if (!searchInput || !categoryFilters || !priceSlider || !priceValue) return;

        // Set max price on slider
        const maxPrice = Math.ceil(Math.max(...this.allProducts.map(p => p.price)));
        priceSlider.max = maxPrice;
        priceSlider.value = maxPrice;
        priceValue.textContent = `$${Number(maxPrice).toFixed(2)}`;
        currentFilters.maxPrice = maxPrice;

        searchInput.addEventListener('input', () => {
            currentFilters.searchTerm = searchInput.value.toLowerCase();
            this.filterAndRender();
        });

        categoryFilters.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-btn')) {
                categoryFilters.querySelector('.active').classList.remove('active');
                e.target.classList.add('active');
                currentFilters.category = e.target.dataset.category;
                this.filterAndRender();
            }
        });

        priceSlider.addEventListener('input', () => {
            const price = Number(priceSlider.value);
            currentFilters.maxPrice = price;
            priceValue.textContent = `$${price.toFixed(2)}`;
            this.debouncedFilter();
        });
    },
    
    // Filters products based on state (No changes needed)
    filterAndRender() {
        let filteredProducts = this.allProducts.filter(product => {
            const nameMatch = product.name.toLowerCase().includes(currentFilters.searchTerm.toLowerCase());
            const categoryMatch = (currentFilters.category === 'all') || (product.category === currentFilters.category);
            const priceMatch = product.price <= currentFilters.maxPrice;
            return nameMatch && categoryMatch && priceMatch;
        });
        this.renderProducts(filteredProducts);
    },
    
    // Debounced version for slider (No changes needed)
    debouncedFilter: debounce(function() {
        ProductModule.filterAndRender();
    }, 200),
    
    // Get a product by its ID
    getProductById(id) {
        // Use '==' for loose comparison as data-id is string, product.id is number
        return this.allProducts.find(p => p.id == id);
    }
};