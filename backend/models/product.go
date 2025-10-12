package models

import (
	"database/sql"
	// "image/color"
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
	CategoryID       *int      `json:"category_id,omitempty"`
	SubcategoryID    *int      `json:"subcategory_id,omitempty"`
	BrandID          *int      `json:"brand_id,omitempty"`
	Model            string    `json:"model"`
	Color 			string    `json:"color"`
	Size 			string    `json:"size"`
	Description      string    `json:"description"`
	IsActive         bool      `json:"is_active"`
	LowStockThreshold int      `json:"low_stock_threshold"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type ProductVariant struct {
	ID           int     `json:"id"`
	ProductID    int     `json:"product_id"`
	Gender       string  `json:"gender"`
	Size         string  `json:"size"`
	Color        string  `json:"color"`
	MRP          float64 `json:"mrp"`
	SellingPrice float64 `json:"selling_price"`
	CostPrice    float64 `json:"cost_price"`
	SKU          string  `json:"sku"`
	Barcode      string  `json:"barcode"`
	CurrentStock int     `json:"current_stock"`
	ImageURL     string  `json:"image_url"`
	IsActive     bool    `json:"is_active"`
}

type ProductWithVariants struct {
	Product
	Variants []ProductVariant `json:"variants"`
}
func UpdateProductVariantTx(tx *sql.Tx, variant *ProductVariant) error {
	_, err := tx.Exec(`
		UPDATE product_variants 
		SET gender=?, size=?, color=?, mrp=?, selling_price=?, cost_price=?, sku=?, barcode=?, current_stock=?, image_url=?
		WHERE id=?`,
		variant.Gender, variant.Size, variant.Color, variant.MRP, variant.SellingPrice,
		variant.CostPrice, variant.SKU, variant.Barcode, variant.CurrentStock, variant.ImageURL, // Add ImageURL
		variant.ID)
	return err
}
func CreateProductTx(tx *sql.Tx, product *Product) error {
	result, err := tx.Exec(`
		INSERT INTO products (item_id, item_name, category_id, subcategory_id, brand_id, model, description, low_stock_threshold)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		product.ItemID, product.ItemName, product.CategoryID, product.SubcategoryID, product.BrandID,
		product.Model, product.Description, product.LowStockThreshold)
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

func CreateProductVariantTx(tx *sql.Tx, variant *ProductVariant) error {
	result, err := tx.Exec(`
		INSERT INTO product_variants (product_id, gender, size, color, mrp, selling_price, cost_price, sku, barcode, current_stock, image_url)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		variant.ProductID, variant.Gender, variant.Size, variant.Color, variant.MRP, variant.SellingPrice,
		variant.CostPrice, variant.SKU, variant.Barcode, variant.CurrentStock, variant.ImageURL) // Add ImageURL
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	variant.ID = int(id)
	variant.IsActive = true
	return nil
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

// Updated CreateProduct function for variants
func CreateProduct(db *sql.DB, product *Product) error {
	result, err := db.Exec(`
		INSERT INTO products (item_id, item_name, category_id, subcategory_id, brand_id, model, description, low_stock_threshold)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		product.ItemID, product.ItemName, product.CategoryID, product.SubcategoryID, product.BrandID,
		product.Model, product.Description, product.LowStockThreshold)
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

// Create product variant
func CreateProductVariant(db *sql.DB, variant *ProductVariant) error {
	result, err := db.Exec(`
		INSERT INTO product_variants (product_id, gender, size, color, mrp, selling_price, cost_price, sku, barcode, current_stock)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		variant.ProductID, variant.Gender, variant.Size, variant.Color, variant.MRP, variant.SellingPrice,
		variant.CostPrice, variant.SKU, variant.Barcode, variant.CurrentStock)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	variant.ID = int(id)
	variant.IsActive = true
	return nil
}

func GetVariantsByProductID(db *sql.DB, productID int) ([]ProductVariant, error) {
    rows, err := db.Query(`
        SELECT id, product_id, gender, size, color, mrp, selling_price, cost_price, sku, barcode, current_stock, is_active, image_url
        FROM product_variants 
        WHERE product_id = ? AND is_active = true 
        ORDER BY gender, size, color`, productID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var variants []ProductVariant
    for rows.Next() {
        var variant ProductVariant
        if err := rows.Scan(
            &variant.ID, &variant.ProductID, &variant.Gender, &variant.Size, &variant.Color,
            &variant.MRP, &variant.SellingPrice, &variant.CostPrice,
            &variant.SKU, &variant.Barcode, &variant.CurrentStock, &variant.IsActive, &variant.ImageURL,
        ); err != nil {
            return nil, err
        }
        variants = append(variants, variant)
    }
    
    // Check for errors during iteration
    if err = rows.Err(); err != nil {
        return nil, err
    }
    
    return variants, nil
}

func GetAllProducts(db *sql.DB) ([]ProductWithVariants, error) {
    rows, err := db.Query(`
        SELECT id, item_id, item_name, category_id, subcategory_id, brand_id, model, 
               description, is_active, low_stock_threshold, created_at, updated_at
        FROM products WHERE is_active = true ORDER BY item_name`)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var products []ProductWithVariants
    for rows.Next() {
        var p ProductWithVariants
        var categoryID, subcategoryID, brandID sql.NullInt64
        
        if err := rows.Scan(
            &p.ID, &p.ItemID, &p.ItemName, &categoryID, &subcategoryID, &brandID,
            &p.Model, &p.Description, &p.IsActive, &p.LowStockThreshold, 
            &p.CreatedAt, &p.UpdatedAt,
        ); err != nil {
            return nil, err
        }
        
        // Handle nullable foreign keys properly
        if categoryID.Valid {
            catID := int(categoryID.Int64)
            p.CategoryID = &catID
        }
        if subcategoryID.Valid {
            subcatID := int(subcategoryID.Int64)
            p.SubcategoryID = &subcatID
        }
        if brandID.Valid {
            brID := int(brandID.Int64)
            p.BrandID = &brID
        }
        
        // Get variants for this product
        variants, err := GetVariantsByProductID(db, p.ID)
        if err != nil {
            // Instead of returning error, continue with empty variants
            p.Variants = []ProductVariant{}
        } else {
            p.Variants = variants
        }
        
        products = append(products, p)
    }
    
    // Check for errors during iteration
    if err = rows.Err(); err != nil {
        return nil, err
    }
    
    return products, nil
}

// Get product by ID with variants
func GetProductByID(db *sql.DB, id int) (*ProductWithVariants, error) {
	var p ProductWithVariants
	var categoryID, subcategoryID, brandID sql.NullInt64
	
	err := db.QueryRow(`
		SELECT id, item_id, item_name, category_id, subcategory_id, brand_id, model, 
		       description, is_active, low_stock_threshold, created_at, updated_at
		FROM products WHERE id = ? AND is_active = true`, id).Scan(
		&p.ID, &p.ItemID, &p.ItemName, &categoryID, &subcategoryID, &brandID,
		&p.Model, &p.Description, &p.IsActive, &p.LowStockThreshold, 
		&p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	
	// Handle nullable foreign keys
	if categoryID.Valid {
		p.CategoryID = &[]int{int(categoryID.Int64)}[0]
	}
	if subcategoryID.Valid {
		p.SubcategoryID = &[]int{int(subcategoryID.Int64)}[0]
	}
	if brandID.Valid {
		p.BrandID = &[]int{int(brandID.Int64)}[0]
	}
	
	// Get variants
	variants, err := GetVariantsByProductID(db, p.ID)
	if err != nil {
		return nil, err
	}
	p.Variants = variants
	
	return &p, nil
}

// Update product variant
func UpdateProductVariant(db *sql.DB, variant *ProductVariant) error {
	_, err := db.Exec(`
		UPDATE product_variants 
		SET gender=?, size=?, color=?, mrp=?, selling_price=?, cost_price=?, sku=?, barcode=?, current_stock=?
		WHERE id=?`,
		variant.Gender, variant.Size, variant.Color, variant.MRP, variant.SellingPrice,
		variant.CostPrice, variant.SKU, variant.Barcode, variant.CurrentStock,
		variant.ID)
	return err
}
func DeleteProduct(db *sql.DB, productID int) error {
	_, err := db.Exec("UPDATE products SET is_active = false WHERE id = ?", productID)
	return err
}


// package models

// import (
// 	"database/sql"
// 	"time"
// )

// type Category struct {
// 	ID          int       `json:"id"`
// 	Name        string    `json:"name"`
// 	Description string    `json:"description"`
// 	IsActive    bool      `json:"is_active"`
// 	CreatedAt   time.Time `json:"created_at"`
// }
// type ProductVariant struct {
// 	ID           int     `json:"id"`
// 	ProductID    int     `json:"product_id"`
// 	Size         string  `json:"size"`
// 	Color        string  `json:"color"`
// 	MRP          float64 `json:"mrp"`
// 	SellingPrice float64 `json:"selling_price"`
// 	CostPrice    float64 `json:"cost_price"`
// 	SKU          string  `json:"sku"`
// 	Barcode      string  `json:"barcode"`
// 	CurrentStock int     `json:"current_stock"`
// 	IsActive     bool    `json:"is_active"`
// }
// type ProductWithVariants struct {
// 	Product
// 	Variants []ProductVariant `json:"variants"`
// }
// type Brand struct {
// 	ID          int       `json:"id"`
// 	Name        string    `json:"name"`
// 	Description string    `json:"description"`
// 	IsActive    bool      `json:"is_active"`
// 	CreatedAt   time.Time `json:"created_at"`
// }

// type Subcategory struct {
// 	ID          int       `json:"id"`
// 	Name        string    `json:"name"`
// 	CategoryID  int       `json:"category_id"`
// 	Description string    `json:"description"`
// 	IsActive    bool      `json:"is_active"`
// 	CreatedAt   time.Time `json:"created_at"`
// }

// type Product struct {
// 	ID               int       `json:"id"`
// 	ItemID           string    `json:"item_id"`
// 	ItemName         string    `json:"item_name"`
// 	CategoryID       int       `json:"category_id"`
// 	SubcategoryID    int       `json:"subcategory_id"`
// 	BrandID          int       `json:"brand_id"`
// 	Model            string    `json:"model"`
// 	Gender           string  `json:"gender"`
// 	Color            string    `json:"color"`
// 	Size             string    `json:"size"`
// 	MRP              float64   `json:"mrp"`
// 	SellingPrice     float64   `json:"selling_price"`
// 	CostPrice        float64   `json:"cost_price"`
// 	SKU              string    `json:"sku"`
// 	Barcode          string    `json:"barcode"`
// 	ImageURL         string    `json:"image_url"`
// 	Description      string    `json:"description"`
// 	IsActive         bool      `json:"is_active"`
// 	LowStockThreshold int      `json:"low_stock_threshold"`
// 	CreatedAt        time.Time `json:"created_at"`
// 	UpdatedAt        time.Time `json:"updated_at"`
// }

// func GetAllCategories(db *sql.DB) ([]Category, error) {
// 	rows, err := db.Query("SELECT id, name, description, is_active, created_at FROM categories WHERE is_active = true ORDER BY name")
// 	if err != nil {
// 		return nil, err
// 	}
// 	defer rows.Close()

// 	var categories []Category
// 	for rows.Next() {
// 		var cat Category
// 		if err := rows.Scan(&cat.ID, &cat.Name, &cat.Description, &cat.IsActive, &cat.CreatedAt); err != nil {
// 			return nil, err
// 		}
// 		categories = append(categories, cat)
// 	}
// 	return categories, nil
// }

// func CreateCategory(db *sql.DB, category *Category) error {
// 	result, err := db.Exec("INSERT INTO categories (name, description) VALUES (?, ?)", category.Name, category.Description)
// 	if err != nil {
// 		return err
// 	}

// 	id, err := result.LastInsertId()
// 	if err != nil {
// 		return err
// 	}

// 	category.ID = int(id)
// 	category.IsActive = true
// 	return nil
// }

// func GetAllBrands(db *sql.DB) ([]Brand, error) {
// 	rows, err := db.Query("SELECT id, name, description, is_active, created_at FROM brands WHERE is_active = true ORDER BY name")
// 	if err != nil {
// 		return nil, err
// 	}
// 	defer rows.Close()

// 	var brands []Brand
// 	for rows.Next() {
// 		var brand Brand
// 		if err := rows.Scan(&brand.ID, &brand.Name, &brand.Description, &brand.IsActive, &brand.CreatedAt); err != nil {
// 			return nil, err
// 		}
// 		brands = append(brands, brand)
// 	}
// 	return brands, nil
// }

// func CreateBrand(db *sql.DB, brand *Brand) error {
// 	result, err := db.Exec("INSERT INTO brands (name, description) VALUES (?, ?)", brand.Name, brand.Description)
// 	if err != nil {
// 		return err
// 	}

// 	id, err := result.LastInsertId()
// 	if err != nil {
// 		return err
// 	}

// 	brand.ID = int(id)
// 	brand.IsActive = true
// 	return nil
// }

// func GetSubcategoriesByCategory(db *sql.DB, categoryID int) ([]Subcategory, error) {
// 	rows, err := db.Query("SELECT id, name, category_id, description, is_active, created_at FROM subcategories WHERE category_id = ? AND is_active = true ORDER BY name", categoryID)
// 	if err != nil {
// 		return nil, err
// 	}
// 	defer rows.Close()

// 	var subcategories []Subcategory
// 	for rows.Next() {
// 		var sub Subcategory
// 		if err := rows.Scan(&sub.ID, &sub.Name, &sub.CategoryID, &sub.Description, &sub.IsActive, &sub.CreatedAt); err != nil {
// 			return nil, err
// 		}
// 		subcategories = append(subcategories, sub)
// 	}
// 	return subcategories, nil
// }

// func CreateSubcategory(db *sql.DB, subcategory *Subcategory) error {
// 	result, err := db.Exec("INSERT INTO subcategories (name, category_id, description) VALUES (?, ?, ?)", 
// 		subcategory.Name, subcategory.CategoryID, subcategory.Description)
// 	if err != nil {
// 		return err
// 	}

// 	id, err := result.LastInsertId()
// 	if err != nil {
// 		return err
// 	}

// 	subcategory.ID = int(id)
// 	subcategory.IsActive = true
// 	return nil
// }

// func CreateProduct(db *sql.DB, product *Product) error {
// 	result, err := db.Exec(`
// 		INSERT INTO products (item_id, item_name, category_id, subcategory_id, brand_id, model, gender, image_url, description, low_stock_threshold)
// 		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
// 		product.ItemID, product.ItemName, product.CategoryID, product.SubcategoryID, product.BrandID,
// 		product.Model, product.Gender, product.ImageURL, product.Description, product.LowStockThreshold)
// 	if err != nil {
// 		return err
// 	}

// 	id, err := result.LastInsertId()
// 	if err != nil {
// 		return err
// 	}

// 	product.ID = int(id)
// 	product.IsActive = true
// 	return nil
// }


// func UpdateProduct(db *sql.DB, product *Product) error {
// 	_, err := db.Exec(`
// 		UPDATE products 
// 		SET item_id=?, item_name=?, category_id=?, subcategory_id=?, brand_id=?, 
// 		    model=?, gender=?, image_url=?, description=?, low_stock_threshold=?
// 		WHERE id=?`,
// 		product.ItemID, product.ItemName, product.CategoryID, product.SubcategoryID, product.BrandID,
// 		product.Model, product.Gender, product.ImageURL, product.Description, product.LowStockThreshold,
// 		product.ID)
// 	return err
// }

// func DeleteProduct(db *sql.DB, productID int) error {
// 	_, err := db.Exec("UPDATE products SET is_active = false WHERE id = ?", productID)
// 	return err
// }

// func GetAllProducts(db *sql.DB) ([]ProductWithVariants, error) {
// 	// First get all products
// 	rows, err := db.Query(`
// 		SELECT id, item_id, item_name, category_id, subcategory_id, brand_id, model, gender, 
// 		       image_url, description, is_active, low_stock_threshold, created_at, updated_at
// 		FROM products WHERE is_active = true ORDER BY item_name`)
// 	if err != nil {
// 		return nil, err
// 	}
// 	defer rows.Close()

// 	var products []ProductWithVariants
// 	for rows.Next() {
// 		var p ProductWithVariants
// 		if err := rows.Scan(
// 			&p.ID, &p.ItemID, &p.ItemName, &p.CategoryID, &p.SubcategoryID, &p.BrandID,
// 			&p.Model, &p.Gender, &p.ImageURL, &p.Description, &p.IsActive,
// 			&p.LowStockThreshold, &p.CreatedAt, &p.UpdatedAt,
// 		); err != nil {
// 			return nil, err
// 		}
		
// 		// Get variants for this product
// 		variants, err := GetVariantsByProductID(db, p.ID)
// 		if err != nil {
// 			return nil, err
// 		}
// 		p.Variants = variants
		
// 		products = append(products, p)
// 	}
// 	return products, nil
// }
// func CreateProductVariant(db *sql.DB, variant *ProductVariant) error {
// 	result, err := db.Exec(`
// 		INSERT INTO product_variants (product_id, size, color, mrp, selling_price, cost_price, sku, barcode, current_stock)
// 		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
// 		variant.ProductID, variant.Size, variant.Color, variant.MRP, variant.SellingPrice,
// 		variant.CostPrice, variant.SKU, variant.Barcode, variant.CurrentStock)
// 	if err != nil {
// 		return err
// 	}

// 	id, err := result.LastInsertId()
// 	if err != nil {
// 		return err
// 	}

// 	variant.ID = int(id)
// 	variant.IsActive = true
// 	return nil
// }

// func GetVariantsByProductID(db *sql.DB, productID int) ([]ProductVariant, error) {
// 	rows, err := db.Query(`
// 		SELECT id, product_id, size, color, mrp, selling_price, cost_price, sku, barcode, current_stock, is_active
// 		FROM product_variants 
// 		WHERE product_id = ? AND is_active = true 
// 		ORDER BY size, color`, productID)
// 	if err != nil {
// 		return nil, err
// 	}
// 	defer rows.Close()

// 	var variants []ProductVariant
// 	for rows.Next() {
// 		var variant ProductVariant
// 		if err := rows.Scan(
// 			&variant.ID, &variant.ProductID, &variant.Size, &variant.Color,
// 			&variant.MRP, &variant.SellingPrice, &variant.CostPrice,
// 			&variant.SKU, &variant.Barcode, &variant.CurrentStock, &variant.IsActive,
// 		); err != nil {
// 			return nil, err
// 		}
// 		variants = append(variants, variant)
// 	}
// 	return variants, nil
// }

// func UpdateProductVariant(db *sql.DB, variant *ProductVariant) error {
// 	_, err := db.Exec(`
// 		UPDATE product_variants 
// 		SET size=?, color=?, mrp=?, selling_price=?, cost_price=?, sku=?, barcode=?, current_stock=?
// 		WHERE id=?`,
// 		variant.Size, variant.Color, variant.MRP, variant.SellingPrice,
// 		variant.CostPrice, variant.SKU, variant.Barcode, variant.CurrentStock,
// 		variant.ID)
// 	return err
// }

// func DeleteProductVariant(db *sql.DB, variantID int) error {
// 	_, err := db.Exec("UPDATE product_variants SET is_active = false WHERE id = ?", variantID)
// 	return err
// }
// func GetProductByID(db *sql.DB, id int) (*ProductWithVariants, error) {
// 	var p ProductWithVariants
// 	err := db.QueryRow(`
// 		SELECT id, item_id, item_name, category_id, subcategory_id, brand_id, model, gender, 
// 		       image_url, description, is_active, low_stock_threshold, created_at, updated_at
// 		FROM products WHERE id = ? AND is_active = true`, id).Scan(
// 		&p.ID, &p.ItemID, &p.ItemName, &p.CategoryID, &p.SubcategoryID, &p.BrandID,
// 		&p.Model, &p.Gender, &p.ImageURL, &p.Description, &p.IsActive,
// 		&p.LowStockThreshold, &p.CreatedAt, &p.UpdatedAt,
// 	)
// 	if err != nil {
// 		return nil, err
// 	}
	
// 	// Get variants
// 	variants, err := GetVariantsByProductID(db, p.ID)
// 	if err != nil {
// 		return nil, err
// 	}
// 	p.Variants = variants
	
// 	return &p, nil
// }