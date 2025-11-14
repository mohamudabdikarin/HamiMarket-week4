import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

//  CONFIGURATION 
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({
    origin: ['https://hami-market-week4.vercel.app', 'http://localhost:8000', 'http://127.0.0.1:8000', 'http://localhost:5500'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
})); // Allow requests from your frontend

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

//  MONGODB CONNECTION 
mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB connected successfully."))
    .catch(err => console.error("MongoDB connection error:", err));

//  MONGOOSE SCHEMAS 

const productSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
});
const Product = mongoose.model('Product', productSchema);

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
});
userSchema.virtual('id').get(function() { return this._id.toHexString(); });
userSchema.set('toJSON', { virtuals: true });
const User = mongoose.model('User', userSchema);

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        id: { type: String },
        name: { type: String },
        price: { type: Number },
        quantity: { type: Number },
        image: { type: String }
    }],
    total: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});
orderSchema.virtual('id').get(function() { return this._id.toHexString(); });
orderSchema.set('toJSON', { virtuals: true });
const Order = mongoose.model('Order', orderSchema);

//  AUTH MIDDLEWARE 
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token, authorization denied.' });
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Adds { id, name, email } to the request
        next();
    } catch (e) {
        res.status(400).json({ message: 'Token is not valid.' });
    }
};

//  API ROUTES 

// [PUBLIC] Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
});

// [PUBLIC] User Signup
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Please enter all fields.' });
    
    if (name.length < 2) return res.status(400).json({ message: 'Name must be at least 2 characters.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists.' });
        
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        user = new User({ email, passwordHash, name, isAdmin: false });
        await user.save();
        
        const payload = { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '3h' });
        
        res.status(201).json({ token, user: payload });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error during signup', error });
    }
});

// [PUBLIC] User Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Please enter all fields.' });
    
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials.' });
        
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });
        
        const payload = { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '3h' });
        
        res.status(200).json({ token, user: payload });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error during login', error });
    }
});

// [PROTECTED] Get user's order history
app.get('/api/orders', authMiddleware, async (req, res) => {
    try {
        // Find orders for the user ID from the token and sort newest first
        const orders = await Order.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
});

// [PROTECTED] Create a new order
app.post('/api/orders', authMiddleware, async (req, res) => {
    const { items, total } = req.body;
    if (!items || items.length === 0 || !total) {
        return res.status(400).json({ message: 'Invalid order data.' });
    }
    
    try {
        const newOrder = new Order({
            userId: req.user.id,
            items: items,
            total: total,
        });
        
        const savedOrder = await newOrder.save();
        
        // TODO: Update product stock levels here
        
        res.status(201).json(savedOrder);
        
    } catch (error) {
        res.status(500).json({ message: 'Server error creating order', error });
    }
});


//  ADMIN ROUTES 

// [ADMIN] Get dashboard stats
app.get('/api/admin/stats', async (req, res) => {
    try {
        const orders = await Order.find({});
        const products = await Product.find({});
        // Exclude admin users from customer count
        const customers = await User.find({ isAdmin: { $ne: true } });
        
        const revenue = orders.reduce((sum, order) => sum + order.total, 0);
        
        res.json({
            revenue,
            orders: orders.length,
            products: products.length,
            customers: customers.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error });
    }
});

// [ADMIN] Get recent orders
app.get('/api/admin/orders/recent', async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ date: -1 }).limit(5);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recent orders', error });
    }
});

// [ADMIN] Get all orders
app.get('/api/admin/orders', async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ date: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
});

// [ADMIN] Get customers with stats
app.get('/api/admin/customers', async (req, res) => {
    try {
        // Exclude admin users from customer list
        const users = await User.find({ isAdmin: { $ne: true } });
        const orders = await Order.find({});
        
        const customersWithStats = users.map(user => {
            const userOrders = orders.filter(o => o.userId.toString() === user._id.toString());
            const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
            
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                orderCount: userOrders.length,
                totalSpent
            };
        });
        
        res.json(customersWithStats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error });
    }
});

// [ADMIN] Create product
app.post('/api/admin/products', async (req, res) => {
    try {
        const { name, description, price, unit, category, stock, image } = req.body;
        
        // Get the highest ID and increment
        const lastProduct = await Product.findOne().sort({ id: -1 });
        const newId = lastProduct ? lastProduct.id + 1 : 1;
        
        const product = new Product({
            id: newId,
            name,
            description,
            price,
            unit,
            category,
            stock,
            image
        });
        
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error });
    }
});

// [ADMIN] Update product
app.put('/api/admin/products/:id', async (req, res) => {
    try {
        const { name, description, price, unit, category, stock, image } = req.body;
        
        const product = await Product.findOneAndUpdate(
            { id: parseInt(req.params.id) },
            { name, description, price, unit, category, stock, image },
            { new: true }
        );
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error });
    }
});

// [ADMIN] Delete product
app.delete('/api/admin/products/:id', async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ id: parseInt(req.params.id) });
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error });
    }
});

// Start server (Railway needs this, Vercel doesn't)
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

export default app;