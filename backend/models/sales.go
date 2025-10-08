package models

import (
	"database/sql"
	"time"
)

type Sale struct {
	ID             int       `json:"id"`
	SaleNumber     string    `json:"sale_number"`
	CustomerName   string    `json:"customer_name"`
	CustomerContact string   `json:"customer_contact"`
	TotalAmount    float64   `json:"total_amount"`
	DiscountAmount float64   `json:"discount_amount"`
	TaxAmount      float64   `json:"tax_amount"`
	FinalAmount    float64   `json:"final_amount"`
	PaymentMethod  string    `json:"payment_method"`
	PaymentStatus  string    `json:"payment_status"`
	SoldBy         int       `json:"sold_by"`
	SaleDate       time.Time `json:"sale_date"`
	Notes          string    `json:"notes"`
}

type SaleItem struct {
	ID           int     `json:"id"`
	SaleID       int     `json:"sale_id"`
	ProductID    int     `json:"product_id"`
	Quantity     int     `json:"quantity"`
	UnitPrice    float64 `json:"unit_price"`
	TotalPrice   float64 `json:"total_price"`
	StockEntryID int     `json:"stock_entry_id"`
}

type Supplier struct {
	ID           int       `json:"id"`
	Name         string    `json:"name"`
	ContactPerson string   `json:"contact_person"`
	Email        string    `json:"email"`
	Phone        string    `json:"phone"`
	Address      string    `json:"address"`
	GSTNumber    string    `json:"gst_number"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
}

func GetAllSuppliers(db *sql.DB) ([]Supplier, error) {
	rows, err := db.Query(`
		SELECT id, name, contact_person, email, phone, address, gst_number, is_active, created_at 
		FROM suppliers 
		WHERE is_active = true 
		ORDER BY name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var suppliers []Supplier
	for rows.Next() {
		var supplier Supplier
		if err := rows.Scan(
			&supplier.ID, &supplier.Name, &supplier.ContactPerson, &supplier.Email,
			&supplier.Phone, &supplier.Address, &supplier.GSTNumber, &supplier.IsActive,
			&supplier.CreatedAt,
		); err != nil {
			return nil, err
		}
		suppliers = append(suppliers, supplier)
	}
	return suppliers, nil
}

func CreateSupplier(db *sql.DB, supplier *Supplier) error {
	result, err := db.Exec(`
		INSERT INTO suppliers (name, contact_person, email, phone, address, gst_number) 
		VALUES (?, ?, ?, ?, ?, ?)`,
		supplier.Name, supplier.ContactPerson, supplier.Email, supplier.Phone, 
		supplier.Address, supplier.GSTNumber)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	supplier.ID = int(id)
	supplier.IsActive = true
	return nil
}

func GetSalesByDateRange(db *sql.DB, startDate, endDate time.Time) ([]Sale, error) {
	rows, err := db.Query(`
		SELECT id, sale_number, customer_name, customer_contact, total_amount, 
		       discount_amount, tax_amount, final_amount, payment_method, 
		       payment_status, sold_by, sale_date, notes
		FROM sales 
		WHERE sale_date BETWEEN ? AND ?
		ORDER BY sale_date DESC`, startDate, endDate)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sales []Sale
	for rows.Next() {
		var sale Sale
		if err := rows.Scan(
			&sale.ID, &sale.SaleNumber, &sale.CustomerName, &sale.CustomerContact,
			&sale.TotalAmount, &sale.DiscountAmount, &sale.TaxAmount, &sale.FinalAmount,
			&sale.PaymentMethod, &sale.PaymentStatus, &sale.SoldBy, &sale.SaleDate, &sale.Notes,
		); err != nil {
			return nil, err
		}
		sales = append(sales, sale)
	}
	return sales, nil
}

func GetSaleItems(db *sql.DB, saleID int) ([]SaleItem, error) {
	rows, err := db.Query(`
		SELECT id, sale_id, product_id, quantity, unit_price, total_price, stock_entry_id
		FROM sale_items 
		WHERE sale_id = ?`, saleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []SaleItem
	for rows.Next() {
		var item SaleItem
		if err := rows.Scan(
			&item.ID, &item.SaleID, &item.ProductID, &item.Quantity, 
			&item.UnitPrice, &item.TotalPrice, &item.StockEntryID,
		); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}