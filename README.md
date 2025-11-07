# Hami MiniMarket - Shopping Cart System

## Project Purpose
This project is a fully functional e-commerce shopping cart system for Hami MiniMarket, a local shop specializing in fresh fruits and vegetables. It builds upon the existing product catalog by adding a complete cart management system with persistent storage and an advanced notification system.

This project was completed as part of the HamiSkills Web Development Internship (Week 3 Task).

## Live Demo
[![Live Demo](https://img.shields.io/badge/Vercel-Live%20Demo-black?style=for-the-badge&logo=vercel)]()

(Link to your deployed Vercel, Netlify, or GitHub Pages site)

## Features Implemented

### Core Features
- **Modular Cart System:** Clean, maintainable code architecture with separate modules for products, cart logic, storage, and UI management.
- **Add to Cart:** Each product card features a fully functional "Add to Cart" button that adds items to the shopping cart.
- **Cart Sidebar:** A sleek, animated sidebar displays cart items with product images, names, quantities, and prices.
- **Cart Counter:** The navigation bar displays a live counter showing the total number of items in the cart.
- **Update Quantities:** Users can increase or decrease item quantities directly in the cart using intuitive +/- buttons or manual input.
- **Remove Items:** Each cart item has a remove button to delete it from the cart instantly.
- **Order Summary:** A dedicated summary page displays all cart items with a clean breakdown of costs before checkout.
- **Price Calculations:** Automatic calculation of subtotal, tax (5%), and total with proper formatting.
- **Discount System:** Automatic 10% discount applied when cart subtotal exceeds $50.
- **Persistent Storage:** Cart data is saved to localStorage and automatically loads when the page refreshes.
- **Order Confirmation:** Users can confirm their order with a success message and automatic cart clearing.

### Advanced Features (Bonus)
- **Advanced Toast Notifications:** Modern, animated toast notifications with 4 different types:
  - ✅ Success (Green) - Item added to cart
  - ℹ️ Info (Blue) - Item removed from cart
  - ⚠️ Warning (Orange) - Empty cart warnings
  - ❌ Error (Red) - Error messages
- **Toast Features:**
  - Animated icon with pop-in effect
  - Progress bar showing auto-dismiss countdown
  - Manual close button
  - Smooth slide-in animation from bottom-right
  - Fully responsive design
- **Empty Cart Handling:** Graceful display when cart is empty with helpful messaging.
- **Smooth Animations:** Cart items slide in, buttons have hover effects, and page transitions are seamless.
- **Responsive Cart:** The cart sidebar adapts perfectly to mobile, tablet, and desktop screens.

### Previous Features (Week 2)
- **Dynamic Product Catalog:** Products loaded from JavaScript array
- **Real-time Search:** Filter products by name instantly
- **Category Filter:** Filter by "All", "Fruits", or "Vegetables"
- **Price Filter:** Range slider to filter by maximum price
- **Responsive Design:** Fully optimized for all devices
- **Brand Consistency:** Cohesive design matching the original landing page

## Technologies Used
- **HTML5** - Semantic markup and structure
- **CSS3** - Advanced animations, transitions, and responsive design
- **JavaScript (ES6+)** - Modular architecture with ES6 modules
- **LocalStorage API** - Persistent cart data storage
- **Font Awesome** - Icons for UI elements
- **Google Fonts** - Poppins font family

## Project Structure
```
hami-minimarket/
├── assets/
│   ├── hami-logo.jpg
│   └── store-interior-image.png
├── css/
│   └── style.css
├── js/
│   ├── main.js          # Main entry point & UI module
│   ├── cart.js          # Cart functionality
│   ├── product.js       # Product rendering & filters
│   └── storage.js       # LocalStorage management
├── index.html           # Main application
├── toast-demo.html      # Toast notification demo
└── README.md
```

## How to Run the Project

### Option 1: Direct Browser
1. Download all project files
2. Open `index.html` in your web browser
3. The website will load immediately with all features working

### Option 2: Local Web Server (Recommended)
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```
Then open: `http://localhost:8000`

## How to Test the Cart

1. **Add Items:**
   - Browse the product catalog
   - Click "Add to Cart" on any product
   - See success toast notification
   - Watch cart counter update in navbar

2. **View Cart:**
   - Click the cart icon in the navigation bar
   - Cart sidebar slides in from the right
   - View all added items with images and prices

3. **Update Quantities:**
   - Use +/- buttons to adjust quantities
   - Or type directly in the quantity input
   - Prices update automatically

4. **Remove Items:**
   - Click the trash icon on any item
   - Item is removed with info toast notification

5. **Checkout:**
   - Click "Proceed to Checkout" button
   - Review order summary page
   - See subtotal, tax, and total calculations
   - Confirm order to complete purchase

6. **Test Persistence:**
   - Add items to cart
   - Refresh the page
   - Cart items are still there (localStorage)

7. **Test Toast Notifications:**
   - Open `toast-demo.html` to see all 4 toast types
   - Test success, error, warning, and info variants

## How localStorage is Used

The cart system uses the browser's localStorage API to persist cart data:

- **Save Cart:** Every time an item is added, removed, or updated, the cart is saved to localStorage as a JSON string.
- **Load Cart:** When the page loads, the cart is automatically retrieved from localStorage and restored.
- **Key Used:** `hamiMarketCart`
- **Data Format:** Array of objects containing product ID, name, price, image, and quantity.

Example:
```javascript
// Saved in localStorage
[
  {
    "id": "1",
    "name": "Fresh Apples",
    "price": 2.99,
    "image": "...",
    "quantity": 2
  }
]
```

## Browser Compatibility
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Credits
- **Developer:** [Your Name]
- **Program:** HamiSkills Web Development Internship
- **Week:** 3 - Shopping Cart System
- **Images:** Unsplash (product images)
- **Icons:** Font Awesome
- **Fonts:** Google Fonts (Poppins)

---

**Hami MiniMarket - Fresh. Local. Trusted.** 🥬🍎🥕
