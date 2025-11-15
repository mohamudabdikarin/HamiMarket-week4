# 🛒 Hami MiniMarket - Full-Stack E-Commerce Platform

A modern, production-ready e-commerce web application for a mini market with customer store and admin dashboard.

![Project Status](https://img.shields.io/badge/Status-Complete-success)
![License](https://img.shields.io/badge/License-MIT-blue)

🔗 **Live Demo**: [https://hami-market-week4.vercel.app/](https://hami-market-week4.vercel.app/)

---

## ✨ Features

### Customer Features
- 🛍️ Product browsing with advanced filtering (search, category, price)
- 🛒 Shopping cart with real-time calculations
- 💰 Automatic discounts (10% on orders over $50) and tax (5%)
- 🏷️ Stock indicators (low stock/out of stock badges)
- 👤 User authentication with JWT tokens
- 📜 Order history tracking
- 📱 Fully responsive design
- 🔔 Toast notifications

### Admin Features
- 📊 Real-time dashboard (revenue, orders, products, customers)
- 📦 Product management (CRUD operations)
- 🛒 Order management and tracking
- 👥 Customer analytics
- 🌙 Dark mode support
- 📱 Mobile-optimized interface
- 🔐 Role-based access control

---

## 🛠️ Tech Stack

**Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)  
**Backend**: Node.js, Express.js, MongoDB, Mongoose  
**Auth**: JWT, bcryptjs  
**Deployment**: Vercel (Frontend), Render (Backend)

---

## 📁 Project Structure

```
hami-minimarket/
├── assets/           # Images and media
├── backend/          # Express server
│   ├── server.js    # Main server file
│   ├── seeder.js    # Database seeder
│   └── .env         # Environment variables
├── css/             # Stylesheets
│   ├── style.css    # Customer site styles
│   └── admin.css    # Admin dashboard styles
├── js/              # JavaScript modules
│   ├── main.js      # Main app logic
│   ├── product.js   # Product module
│   ├── cart.js      # Cart module
│   ├── storage.js   # LocalStorage module
│   └── admin.js     # Admin logic
├── index.html       # Customer store
└── admin.html       # Admin dashboard
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/hami-minimarket.git
cd hami-minimarket
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Configure environment variables**  
Create `.env` in the `backend` directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5001
```

4. **Seed the database**
```bash
node seeder.js
```

5. **Start the backend server**
```bash
node server.js
```

6. **Open the application**  
Open `index.html` in your browser or use a local server:
```bash
npx http-server
```

---

## 🔑 Default Admin Credentials

- **Email**: `admin@hamimarket.com`
- **Password**: `admin123`

⚠️ Change these in production!

---

## 🔌 API Endpoints

### Public
- `GET /api/products` - Get all products
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Protected (Requires JWT)
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/orders` - All orders
- `GET /api/admin/customers` - Customer list
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

---

## 🎨 Design

**Color Palette**:
- Primary Green: #2D5016
- Secondary Green: #4CAF50
- Accent Orange: #FF8C00
- Accent Yellow: #FFD700
- Neutral Beige: #F5F5DC

**Typography**: Poppins (Google Fonts)

---

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import repository to Vercel
3. Deploy (no build configuration needed)

### Backend (Render)
1. Create new Web Service on Render
2. Connect GitHub repository
3. Set environment variables (MONGO_URI, JWT_SECRET)
4. Deploy
5. Run seeder: `node seeder.js`

---

## 🔐 Security

- Password hashing with bcryptjs
- JWT token authentication
- Protected API routes
- Role-based access control
- CORS configuration
- Input validation

---

## 📝 Future Enhancements

- Payment gateway integration (Stripe, PayPal)
- Email notifications
- Product reviews and ratings
- Wishlist feature
- Advanced analytics
- Multi-language support

---

## 👨‍💻 Author

**Mohamud Abdikarin**
- GitHub: [@mohamudabdikarin](https://github.com/mohamudabdikarin)
- Email: maxamuud632@gmail.com

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

**Built with ❤️ for Hami MiniMarket**
