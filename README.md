# 🛒 Hami MiniMarket - Full-Stack E-Commerce Platform

A complete, production-ready e-commerce web application for a mini market, built with modern web technologies. Features a customer-facing store and a comprehensive admin dashboard with dark mode support.

![Project Status](https://img.shields.io/badge/Status-Complete-success)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Admin Dashboard](#-admin-dashboard)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Customer Features
- 🛍️ **Product Browsing** - Browse fresh fruits and vegetables with beautiful product cards
- 🔍 **Advanced Filtering** - Search by name, filter by category, and price range
- 🛒 **Shopping Cart** - Add/remove items, adjust quantities, real-time total calculation
- 💰 **Smart Discounts** - Automatic 10% discount on orders over $50
- 📊 **Tax Calculation** - Automatic 5% tax calculation
- 🏷️ **Stock Indicators** - Low stock and out-of-stock badges
- 👤 **User Authentication** - Secure signup and login with JWT tokens
- 📜 **Order History** - View past orders with detailed information
- 📱 **Fully Responsive** - Optimized for desktop, tablet, and mobile devices
- 🎨 **Modern UI** - Clean, professional design with smooth animations
- 🔔 **Toast Notifications** - Beautiful animated notifications for user actions

### Admin Features
- 📊 **Dashboard** - Real-time statistics (revenue, orders, products, customers)
- 📦 **Product Management** - Full CRUD operations for products
- 🛒 **Order Management** - View all customer orders with details
- 👥 **Customer Management** - View customer list with order statistics
- 🌙 **Dark Mode** - Complete dark theme support with toggle
- 📱 **Responsive Design** - Mobile-optimized with hamburger menu
- 🔐 **Role-Based Access** - Admin-only access with authentication
- 🎨 **Professional UI** - Modern dashboard with intuitive navigation
- 📈 **Analytics** - Track revenue, orders, and customer spending

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables, flexbox, and grid
- **JavaScript (ES6+)** - Modular architecture with ES6 modules
- **Font Awesome** - Icon library
- **Google Fonts** - Poppins font family

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variable management
- **CORS** - Cross-origin resource sharing

---

## 📁 Project Structure

```
hami-minimarket/
├── assets/                    # Images and media files
│   ├── hami-logo.jpg         # Store logo
│   └── our-store.png         # Store image
├── backend/                   # Backend server
│   ├── data/
│   │   └── products.json     # Product seed data
│   ├── node_modules/         # Dependencies
│   ├── .env                  # Environment variables
│   ├── checkAdmin.js         # Admin verification script
│   ├── package.json          # Backend dependencies
│   ├── seeder.js            # Database seeder
│   ├── seedUsers.js         # User seeder
│   └── server.js            # Express server
├── css/                      # Stylesheets
│   ├── admin.css            # Admin dashboard styles
│   └── style.css            # Customer site styles
├── js/                       # JavaScript modules
│   ├── admin.js             # Admin dashboard logic
│   ├── cart.js              # Shopping cart module
│   ├── main.js              # Main application logic
│   ├── product.js           # Product module
│   └── storage.js           # LocalStorage module
├── admin.html               # Admin dashboard page
├── index.html               # Customer store page
```

---

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/hami-minimarket.git
cd hami-minimarket
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the `backend` directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
PORT=5001
```

### Step 4: Seed the Database
```bash
# This will create products and admin user
node seeder.js
```

You should see:
```
✅ Products imported!
✅ Admin user created!
   Email: admin@hamimarketsword: admin123
✅ Data import complete!
 Step 5: Start the Backend Server
```bash
node server.js
```

Server will run on `http://localhost:5001`

### Step 6: Open the Application
Open `index.html` in your browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js http-server
npx http-server
```

---

## ⚙️ Configuration

### MongoDB Setup
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Add it to `.env` file

### Admin Credentials
Default admin account (created by seeder):
- **Email**: `admin@hamimarket.com`
- **Password**: `admin123`

⚠️ **Important**: Change these credentials in production!

---

## 📖 Usage

### Customer Site

#### Browse Products
1. Open `index.html`
2. Browse products on the home page
3. Use filters to search by name, category, or price

#### Shopping
1. Click "Add to Cart" on any product
2. View cart by clicking the cart icon
3. Adjust quantities or remove items
4. Click "Proceed to Checkout"

#### Create Account
1. Click "Login" in navigation
2. Click "Sign Up" tab
3. Enter your name, email, and password
4. Click "Sign Up"

#### Place Order
1. Add items to cart
2. Login or create account
3. Proceed to checkout
4. Review order summary
5. Click "Confirm Order"

#### View Order History
1. Login to your account
2. Click on your username or "My Account"
3. Scroll to "Your Order History"

### Admin Dashboard

#### Access Admin Panel
1. Go to `index.html`
2. Click "Login"
3. Enter admin credentials:
   - Email: `admin@hamimarket.com`
   - Password: `admin123`
4. You'll be automatically redirected to admin dashboard

#### Manage Products
1. Click "Products" in sidebar
2. Click "Add Product" to create new product
3. Click edit icon to modify existing product
4. Click delete icon to remove product

#### View Orders
1. Click "Orders" in sidebar
2. View all customer orders
3. See order details, items, and totals

#### View Customers
1. Click "Customers" in sidebar
2. See customer list with statistics
3. View order count and total spending per customer

#### Toggle Dark Mode
1. Click the moon/sun icon in the header
2. Theme switches instantly
3. Preference is saved automatically

---

## 🎛️ Admin Dashboard

### Dashboard Statistics
- **Total Revenue** - Sum of all orders
- **Total Orders** - Number of orders placed
- **Total Products** - Number of products in inventory
- **Total Customers** - Number of registered customers (excluding admin)

### Product Management
- Add new products with image, price, stock, category
- Edit existing products
- Delete products
- View stock levels with color-coded badges
- Mobile-optimized card view on small screens

### Order Management
- View all orders with customer information
- See order items, quantities, and totals
- Sort by date (newest first)
- View recent orders on dashboard

### Customer Management
- View all registered customers
- See order count per customer
- Track total spending per customer
- Admin users excluded from customer list

### Dark Mode
- Toggle between light and dark themes
- Smooth transitions
- Persists across sessions
- All components fully styled for both modes

### Responsive Design
- **Desktop**: Full sidebar with all features
- **Tablet**: Collapsed sidebar with icon tooltips
- **Mobile**: Hidden sidebar with hamburger menu
- Touch-friendly interface
- Optimized layouts for all screen sizes

---

## 🔌 API Documentation

### Base URL
```
http://localhost:5001/api
```

### Public Endpoints

#### Get All Products
```http
GET /products
```

#### User Signup
```http
POST /auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### User Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Protected Endpoints (Require JWT Token)

#### Get User Orders
```http
GET /orders
Authorization: Bearer <token>
```

#### Create Order
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "id": "1",
      "name": "Fresh Apples",
      "price": 2.99,
      "quantity": 2,
      "image": "url"
    }
  ],
  "total": 5.98
}
```

### Admin Endpoints

#### Get Dashboard Stats
```http
GET /admin/stats
```

#### Get All Orders
```http
GET /admin/orders
```

#### Get Recent Orders
```http
GET /admin/orders/recent
```

#### Get Customers
```http
GET /admin/customers
```

#### Create Product
```http
POST /admin/products
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Description",
  "price": 2.99,
  "unit": "lb",
  "category": "fruit",
  "stock": 50,
  "image": "url"
}
```

#### Update Product
```http
PUT /admin/products/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 3.99,
  "stock": 30
}
```

#### Delete Product
```http
DELETE /admin/products/:id
```

---

## 📸 Screenshots

### Customer Site
- **Home Page**: Hero section with featured products
- **Products**: Grid layout with filters
- **Shopping Cart**: Sidebar with cart items
- **Order Summary**: Checkout page with totals
- **My Account**: User profile and order history

### Admin Dashboard
- **Dashboard**: Statistics cards and recent orders
- **Products**: Table view with CRUD operations
- **Orders**: List of all customer orders
- **Customers**: Customer list with statistics
- **Dark Mode**: Complete dark theme

---

## 🎨 Design Features

### Color Palette
- **Primary Green**: #2D5016 (Deep forest green)
- **Secondary Green**: #4CAF50 (Fresh green)
- **Accent Orange**: #FF8C00 (Vibrant orange)
- **Accent Yellow**: #FFD700 (Golden yellow)
- **Neutral Beige**: #F5F5DC (Cream beige)

### Typography
- **Font Family**: Poppins (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Animations
- Smooth page transitions
- Hover effects on buttons and cards
- Toast notification animations
- Cart sidebar slide-in
- Product card fade-in on scroll

---

## 🔐 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Protected Routes**: Admin and user route protection
- **Input Validation**: Server-side validation
- **XSS Protection**: Sanitized inputs
- **CORS Configuration**: Controlled cross-origin requests
- **Role-Based Access**: Admin vs customer permissions

---

## 🧪 Testing

### Manual Testing Checklist

#### Customer Site
- [ ] Browse products
- [ ] Search and filter products
- [ ] Add items to cart
- [ ] Adjust cart quantities
- [ ] Remove items from cart
- [ ] Create account
- [ ] Login
- [ ] Place order
- [ ] View order history
- [ ] Logout

#### Admin Dashboard
- [ ] Login as admin
- [ ] View dashboard statistics
- [ ] Add new product
- [ ] Edit product
- [ ] Delete product
- [ ] View orders
- [ ] View customers
- [ ] Toggle dark mode
- [ ] Test on mobile
- [ ] Logout

---

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)
1. Push code to GitHub
2. Connect repository to Netlify/Vercel
3. Set build command: None (static site)
4. Set publish directory: `/`
5. Deploy

### Backend Deployment (Heroku/Railway)
1. Create new app
2. Add MongoDB connection string to environment variables
3. Add JWT secret to environment variables
4. Deploy from GitHub
5. Run seeder: `node seeder.js`

### Environment Variables for Production
```env
MONGO_URI=your_production_mongodb_uri
JWT_SECRET=your_production_secret
PORT=5001
NODE_ENV=production
```

---

## 📝 Future Enhancements

- [ ] Payment gateway integration (Evc, Zaad)
- [ ] Email notifications for orders
- [ ] Product reviews and ratings
- [ ] Wishlist feature
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Product categories expansion
- [ ] Inventory alerts
- [ ] Customer messaging system
- [ ] Export reports (PDF/CSV)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Mohamud**
- GitHub: [@mohamud](https://github.com/mohamudabdikarin/mohamud)
- Email: maxamuud632@gmail.com

---

## 🙏 Acknowledgments

- **Unsplash** - Product images
- **Font Awesome** - Icons
- **Google Fonts** - Poppins font
- **MongoDB** - Database
- **Express.js** - Backend framework

---

## 📞 Support

For support, email maxamuud632@gmail.com or open an issue on GitHub.

---

## 🎓 Project Status

This project was created as an internship project and is now **complete** with all planned features implemented.

**Key Achievements:**
- ✅ Full-stack e-commerce platform
- ✅ User authentication and authorization
- ✅ Shopping cart with discounts
- ✅ Order management system
- ✅ Admin dashboard with CRUD operations
- ✅ Dark mode support
- ✅ Fully responsive design
- ✅ Production-ready code

---

**Built with ❤️ for Hami MiniMarket**