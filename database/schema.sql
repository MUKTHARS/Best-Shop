-- Database: stock_management
CREATE DATABASE IF NOT EXISTS stock_management;
USE stock_management;

-- Users table with roles
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'employee') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Brands table
CREATE TABLE brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subcategories table
CREATE TABLE subcategories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id INT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id VARCHAR(50) UNIQUE NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    category_id INT,
    subcategory_id INT,
    brand_id INT,
    model VARCHAR(100),
    color VARCHAR(50),
    size VARCHAR(50),
    mrp DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    image_url VARCHAR(500),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    low_stock_threshold INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
);

-- Stock entries table
CREATE TABLE stock_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    bill_number VARCHAR(100),
    purchase_quantity INT NOT NULL,
    current_quantity INT NOT NULL,
    purchase_price DECIMAL(10,2),
    mrp DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    supplier_name VARCHAR(255),
    supplier_contact VARCHAR(100),
    entry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    added_by INT,
    notes TEXT,
    status ENUM('active', 'returned', 'damaged') DEFAULT 'active',
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Stock adjustments table (for manual stock corrections)
CREATE TABLE stock_adjustments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    previous_quantity INT NOT NULL,
    new_quantity INT NOT NULL,
    adjustment_type ENUM('add', 'remove', 'correction') NOT NULL,
    reason TEXT,
    adjusted_by INT,
    adjusted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (adjusted_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Sales table
CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_number VARCHAR(100) UNIQUE NOT NULL,
    customer_name VARCHAR(255),
    customer_contact VARCHAR(100),
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'upi', 'credit') DEFAULT 'cash',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'paid',
    sold_by INT,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (sold_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Sale items table
CREATE TABLE sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT,
    product_id INT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    stock_entry_id INT,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (stock_entry_id) REFERENCES stock_entries(id) ON DELETE SET NULL
);

-- Suppliers table
CREATE TABLE suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    gst_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product images table (for multiple images per product)
CREATE TABLE product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    image_url VARCHAR(500) NOT NULL,
    image_type ENUM('main', 'thumbnail', 'gallery') DEFAULT 'gallery',
    display_order INT DEFAULT 0,
    uploaded_by INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Audit log table
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- User sessions table
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default categories including new ones
INSERT INTO categories (name, description) VALUES 
('Footwear', 'All types of footwear'),
('Luggage', 'Bags, suitcases, travel accessories'),
('Sports', 'Sports equipment and accessories'),
('General Goods', 'General merchandise items'),
('Baby World', 'Baby products and accessories');

-- Insert default brands
INSERT INTO brands (name, description) VALUES 
('Nike', 'Sports shoes and apparel'),
('Adidas', 'Sports shoes and apparel'),
('Puma', 'Sports shoes and apparel'),
('Skybags', 'Luggage and travel bags'),
('American Tourister', 'Luggage and travel bags'),
('Generic', 'General goods brand');

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@store.com', '$2a$10$8K1p/a0dRa1B0Z2QaK1sE.O4.7b8Q2aK1sE.O4.7b8Q2aK1sE.O4', 'admin'),
('manager', 'manager@store.com', '$2a$10$8K1p/a0dRa1B0Z2QaK1sE.O4.7b8Q2aK1sE.O4.7b8Q2aK1sE.O4', 'manager'),
('employee', 'employee@store.com', '$2a$10$8K1p/a0dRa1B0Z2QaK1sE.O4.7b8Q2aK1sE.O4.7b8Q2aK1sE.O4', 'employee');

-- Insert default subcategories
INSERT INTO subcategories (name, category_id, description) VALUES 
('Sports Shoes', 1, 'Athletic and sports footwear'),
('Casual Shoes', 1, 'Everyday casual footwear'),
('Formal Shoes', 1, 'Formal and office footwear'),
('Sneakers', 1, 'Casual sneakers'),
('Backpacks', 2, 'School and travel backpacks'),
('Suitcases', 2, 'Travel suitcases and luggage'),
('Sports Equipment', 3, 'Sports gear and equipment'),
('Fitness', 3, 'Fitness and exercise equipment'),
('Stationery', 4, 'Office and school stationery'),
('Home Goods', 4, 'Household items'),
('Baby Clothing', 5, 'Clothes for babies'),
('Baby Toys', 5, 'Toys for babies');

-- Insert sample suppliers
INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES 
('ABC Distributors', 'John Doe', 'john@abcdist.com', '+91-9876543210', '123 Business Park, Mumbai'),
('XYZ Imports', 'Jane Smith', 'jane@xyzimports.com', '+91-9876543211', '456 Trade Center, Delhi'),
('Local Wholesale', 'Raj Kumar', 'raj@localwhole.com', '+91-9876543212', '789 Market Street, Chennai');