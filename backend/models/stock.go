package models

import (
	"database/sql"
	"time"
)

type StockEntry struct {
	ID              int       `json:"id"`
	ProductID       int       `json:"product_id"`
	BillNumber      string    `json:"bill_number"`
	PurchaseQuantity int      `json:"purchase_quantity"`
	CurrentQuantity int      `json:"current_quantity"`
	PurchasePrice   float64   `json:"purchase_price"`
	MRP             float64   `json:"mrp"`
	SellingPrice    float64   `json:"selling_price"`
	SupplierName    string    `json:"supplier_name"`
	SupplierContact string    `json:"supplier_contact"`
	EntryDate       time.Time `json:"entry_date"`
	AddedBy         int       `json:"added_by"`
	Notes           string    `json:"notes"`
	Status          string    `json:"status"`
	Product         Product   `json:"product"`
}

type StockAdjustment struct {
	ID               int       `json:"id"`
	ProductID        int       `json:"product_id"`
	PreviousQuantity int       `json:"previous_quantity"`
	NewQuantity      int       `json:"new_quantity"`
	AdjustmentType   string    `json:"adjustment_type"`
	Reason           string    `json:"reason"`
	AdjustedBy       int       `json:"adjusted_by"`
	AdjustedAt       time.Time `json:"adjusted_at"`
}

func CreateStockEntry(db *sql.DB, entry *StockEntry) error {
	result, err := db.Exec(`
		INSERT INTO stock_entries (product_id, bill_number, purchase_quantity, current_quantity, purchase_price, mrp, selling_price, supplier_name, supplier_contact, added_by, notes)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		entry.ProductID, entry.BillNumber, entry.PurchaseQuantity, entry.PurchaseQuantity,
		entry.PurchasePrice, entry.MRP, entry.SellingPrice, entry.SupplierName,
		entry.SupplierContact, entry.AddedBy, entry.Notes)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	entry.ID = int(id)
	entry.Status = "active"
	return nil
}

func GetAllStockEntries(db *sql.DB) ([]StockEntry, error) {
	rows, err := db.Query(`
		SELECT se.id, se.product_id, se.bill_number, se.purchase_quantity, se.current_quantity,
		       se.purchase_price, se.mrp, se.selling_price, se.supplier_name, se.supplier_contact,
		       se.entry_date, se.added_by, se.notes, se.status,
		       p.item_id, p.item_name, p.model, p.color, p.size
		FROM stock_entries se
		JOIN products p ON se.product_id = p.id
		ORDER BY se.entry_date DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []StockEntry
	for rows.Next() {
		var se StockEntry
		if err := rows.Scan(
			&se.ID, &se.ProductID, &se.BillNumber, &se.PurchaseQuantity, &se.CurrentQuantity,
			&se.PurchasePrice, &se.MRP, &se.SellingPrice, &se.SupplierName, &se.SupplierContact,
			&se.EntryDate, &se.AddedBy, &se.Notes, &se.Status,
			&se.Product.ItemID, &se.Product.ItemName, &se.Product.Model, &se.Product.Color, &se.Product.Size,
		); err != nil {
			return nil, err
		}
		entries = append(entries, se)
	}
	return entries, nil
}