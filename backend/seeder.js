import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get __dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load Config
dotenv.config({ path: resolve(__dirname, '.env') });

// Mongoose Schemas (must match server.js)
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

// Load JSON Data
const products = JSON.parse(
  fs.readFileSync(resolve(__dirname, 'data/products.json'), 'utf-8')
);

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected for seeder..."))
  .catch(err => console.error("MongoDB connection error:", err));

// Import Data
const importData = async () => {
  try {
    // Import products
    await Product.deleteMany();
    await Product.insertMany(products);
    console.log('✅ Products imported!');
    
    // Create admin user if doesn't exist
    const existingAdmin = await User.findOne({ email: 'admin@hamimarket.com' });
    
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin123', salt);
      
      const adminUser = new User({
        email: 'admin@hamimarket.com',
        passwordHash,
        name: 'Admin',
        isAdmin: true
      });
      
      await adminUser.save();
      console.log('✅ Admin user created!');
      console.log('   Email: admin@hamimarket.com');
      console.log('   Password: admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
    
    console.log('✅ Data import complete!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

// Destroy Data
const destroyData = async () => {
  try {
    await Product.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

// Run Seeder
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}