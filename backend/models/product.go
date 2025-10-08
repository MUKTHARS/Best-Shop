package models

import (
	"database/sql"
	"time"
)

type Category struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
}

type Brand struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
}

type Subcategory struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	CategoryID  int       `json:"category_id"`
	Description string    `json:"description"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
}

type Product struct {
	ID               int       `json:"id"`
	ItemID           string    `json:"item_id"`
	ItemName         string    `json:"item_name"`
	CategoryID       int       `json:"category_id"`
	SubcategoryID    int       `json:"subcategory_id"`
	BrandID          int       `json:"brand_id"`
	Model            string    `json:"model"`
	Color            string    `json:"color"`
	Size             string    `json:"size"`
	MRP              float64   `json:"mrp"`
	SellingPrice     float64   `json:"selling_price"`
	CostPrice        float64   `json:"cost_price"`
	SKU              string    `json:"sku"`
	Barcode          string    `json:"barcode"`
	ImageURL         string    `json:"image_url"`
	Description      string    `json:"description"`
	IsActive         bool      `json:"is_active"`
	LowStockThreshold int      `json:"low_stock_threshold"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

func GetAllCategories(db *sql.DB) ([]Category, error) {
	rows, err := db.Query("SELECT id, name, description, is_active, created_at FROM categories WHERE is_active = true ORDER BY name")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []Category
	for rows.Next() {
		var cat Category
		if err := rows.Scan(&cat.ID, &cat.Name, &cat.Description, &cat.IsActive, &cat.CreatedAt); err != nil {
			return nil, err
		}
		categories = append(categories, cat)
	}
	return categories, nil
}

func CreateCategory(db *sql.DB, category *Category) error {
	result, err := db.Exec("INSERT INTO categories (name, description) VALUES (?, ?)", category.Name, category.Description)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	category.ID = int(id)
	category.IsActive = true
	return nil
}

func GetAllBrands(db *sql.DB) ([]Brand, error) {
	rows, err := db.Query("SELECT id, name, description, is_active, created_at FROM brands WHERE is_active = true ORDER BY name")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var brands []Brand
	for rows.Next() {
		var brand Brand
		if err := rows.Scan(&brand.ID, &brand.Name, &brand.Description, &brand.IsActive, &brand.CreatedAt); err != nil {
			return nil, err
		}
		brands = append(brands, brand)
	}
	return brands, nil
}

func CreateBrand(db *sql.DB, brand *Brand) error {
	result, err := db.Exec("INSERT INTO brands (name, description) VALUES (?, ?)", brand.Name, brand.Description)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	brand.ID = int(id)
	brand.IsActive = true
	return nil
}

func GetSubcategoriesByCategory(db *sql.DB, categoryID int) ([]Subcategory, error) {
	rows, err := db.Query("SELECT id, name, category_id, description, is_active, created_at FROM subcategories WHERE category_id = ? AND is_active = true ORDER BY name", categoryID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var subcategories []Subcategory
	for rows.Next() {
		var sub Subcategory
		if err := rows.Scan(&sub.ID, &sub.Name, &sub.CategoryID, &sub.Description, &sub.IsActive, &sub.CreatedAt); err != nil {
			return nil, err
		}
		subcategories = append(subcategories, sub)
	}
	return subcategories, nil
}

func CreateSubcategory(db *sql.DB, subcategory *Subcategory) error {
	result, err := db.Exec("INSERT INTO subcategories (name, category_id, description) VALUES (?, ?, ?)", 
		subcategory.Name, subcategory.CategoryID, subcategory.Description)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	subcategory.ID = int(id)
	subcategory.IsActive = true
	return nil
}

func CreateProduct(db *sql.DB, product *Product) error {
	result, err := db.Exec(`
		INSERT INTO products (item_id, item_name, category_id, subcategory_id, brand_id, model, color, size, mrp, selling_price, cost_price, sku, barcode, image_url, description, low_stock_threshold)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		product.ItemID, product.ItemName, product.CategoryID, product.SubcategoryID, product.BrandID,
		product.Model, product.Color, product.Size, product.MRP, product.SellingPrice, product.CostPrice,
		product.SKU, product.Barcode, product.ImageURL, product.Description, product.LowStockThreshold)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	product.ID = int(id)
	product.IsActive = true
	return nil
}

func GetAllProducts(db *sql.DB) ([]Product, error) {
	rows, err := db.Query(`
		SELECT id, item_id, item_name, category_id, subcategory_id, brand_id, model, color, size, 
		       mrp, selling_price, cost_price, sku, barcode, image_url, description, is_active, 
		       low_stock_threshold, created_at, updated_at
		FROM products WHERE is_active = true ORDER BY item_name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		if err := rows.Scan(
			&p.ID, &p.ItemID, &p.ItemName, &p.CategoryID, &p.SubcategoryID, &p.BrandID,
			&p.Model, &p.Color, &p.Size, &p.MRP, &p.SellingPrice, &p.CostPrice,
			&p.SKU, &p.Barcode, &p.ImageURL, &p.Description, &p.IsActive,
			&p.LowStockThreshold, &p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	return products, nil
}