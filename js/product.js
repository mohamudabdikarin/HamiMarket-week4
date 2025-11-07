import { debounce } from './main.js';

// --- State (local to this module) ---
let currentFilters = { searchTerm: '', category: 'all', maxPrice: 10 };

/**
 * MODULE: ProductModule (This is your Task 2 code, organized)
 * Handles product data and rendering the product list.
 */
export const ProductModule = {
    allProducts: [
        { id: 1, name: "Fresh Apples", description: "Crisp and juicy apples", price: 2.99, unit: "lb", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80", category: "fruit" },
        { id: 2, name: "Organic Carrots", description: "Sweet and crunchy", price: 1.99, unit: "lb", image: "https://images.unsplash.com/photo-1445282768818-728615cc910a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80", category: "vegetable" },
        { id: 3, name: "Fresh Lemons", description: "Zesty lemons", price: 3.49, unit: "lb", image: "https://images.unsplash.com/photo-1568569350062-ebfa3cb195df?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2670", category: "fruit" },
        { id: 4, name: "Bell Peppers", description: "Colorful bell peppers", price: 2.49, unit: "lb", image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80", category: "vegetable" },
        { id: 5, name: "Fresh Lettuce", description: "Crisp salad leaves", price: 1.79, unit: "head", image: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80", category: "vegetable" },
        { id: 6, name: "Sweet Grapes", description: "Bursting with flavor", price: 4.99, unit: "lb", image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80", category: "fruit" },
        { id: 7, name: "Tomatoes", description: "Ripe and juicy", price: 2.99, unit: "lb", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80", category: "vegetable" },
        { id: 8, name: "Fresh Spinach", description: "Nutrient-rich", price: 2.29, unit: "bunch", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80", category: "vegetable" },
        { id: 9, name: "Fresh Bananas", description: "Sweet and nutritious", price: 1.49, unit: "lb", image: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80", category: "fruit" },
        { id: 10, name: "Organic Broccoli", description: "Packed with vitamins", price: 3.99, unit: "lb", image: "https://images.unsplash.com/photo-1604296707566-e12dd0d7f938?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1632", category: "vegetable" },
        { id: 11, name: "Strawberries", description: "Sweet and juicy", price: 5.49, unit: "pint", image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170", category: "fruit" },
        { id: 12, name: "Avocado", description: "Rich and creamy", price: 2.19, unit: "each", image: "https://plus.unsplash.com/premium_photo-1675715402461-9ac75a5b400e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687", category: "fruit" }
    ],

    init() {
        this.initFilters();
        this.filterAndRender();
    },

    // Renders products to the grid
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
            card.innerHTML = `
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
                        data-image="${product.image}">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            `;
            
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            productsGrid.appendChild(card);
            observer.observe(card);
        });
    },

    // Sets up filter event listeners
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
    
    // Filters products based on state
    filterAndRender() {
        let filteredProducts = this.allProducts.filter(product => {
            const nameMatch = product.name.toLowerCase().includes(currentFilters.searchTerm);
            const categoryMatch = (currentFilters.category === 'all') || (product.category === currentFilters.category);
            const priceMatch = product.price <= currentFilters.maxPrice;
            return nameMatch && categoryMatch && priceMatch;
        });
        this.renderProducts(filteredProducts);
    },
    
    // Debounced version for slider
    debouncedFilter: debounce(function() {
        ProductModule.filterAndRender();
    }, 200),
    
    // Get a product by its ID
    getProductById(id) {
        return this.allProducts.find(p => p.id === parseInt(id));
    }
};