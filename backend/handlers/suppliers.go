package handlers

import (
	"database/sql"
	"net/http"
	"stock-management/database"

	"github.com/gin-gonic/gin"
)

func GetSuppliers(c *gin.Context) {
	db := database.GetDB()
	
	rows, err := db.Query(`
		SELECT id, name, contact_person, email, phone, address, gst_number, is_active, created_at 
		FROM suppliers 
		WHERE is_active = true 
		ORDER BY name`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var suppliers []map[string]interface{}
	for rows.Next() {
		var supplier struct {
			ID           int    `json:"id"`
			Name         string `json:"name"`
			ContactPerson string `json:"contact_person"`
			Email        string `json:"email"`
			Phone        string `json:"phone"`
			Address      string `json:"address"`
			GSTNumber    string `json:"gst_number"`
			IsActive     bool   `json:"is_active"`
			CreatedAt    string `json:"created_at"`
		}
		
		if err := rows.Scan(
			&supplier.ID, &supplier.Name, &supplier.ContactPerson, &supplier.Email,
			&supplier.Phone, &supplier.Address, &supplier.GSTNumber, &supplier.IsActive,
			&supplier.CreatedAt,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		suppliers = append(suppliers, map[string]interface{}{
			"id":            supplier.ID,
			"name":          supplier.Name,
			"contact_person": supplier.ContactPerson,
			"email":         supplier.Email,
			"phone":         supplier.Phone,
			"address":       supplier.Address,
			"gst_number":    supplier.GSTNumber,
			"is_active":     supplier.IsActive,
			"created_at":    supplier.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, suppliers)
}

func CreateSupplier(c *gin.Context) {
	var supplier struct {
		Name         string `json:"name"`
		ContactPerson string `json:"contact_person"`
		Email        string `json:"email"`
		Phone        string `json:"phone"`
		Address      string `json:"address"`
		GSTNumber    string `json:"gst_number"`
	}
	
	if err := c.BindJSON(&supplier); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	db := database.GetDB()
	
	result, err := db.Exec(`
		INSERT INTO suppliers (name, contact_person, email, phone, address, gst_number) 
		VALUES (?, ?, ?, ?, ?, ?)`,
		supplier.Name, supplier.ContactPerson, supplier.Email, supplier.Phone, 
		supplier.Address, supplier.GSTNumber)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	id, _ := result.LastInsertId()
	
	// Get the created supplier
	var createdSupplier struct {
		ID           int    `json:"id"`
		Name         string `json:"name"`
		ContactPerson string `json:"contact_person"`
		Email        string `json:"email"`
		Phone        string `json:"phone"`
		Address      string `json:"address"`
		GSTNumber    string `json:"gst_number"`
		IsActive     bool   `json:"is_active"`
		CreatedAt    string `json:"created_at"`
	}
	
	err = db.QueryRow(`
		SELECT id, name, contact_person, email, phone, address, gst_number, is_active, created_at 
		FROM suppliers WHERE id = ?`, id).Scan(
		&createdSupplier.ID, &createdSupplier.Name, &createdSupplier.ContactPerson,
		&createdSupplier.Email, &createdSupplier.Phone, &createdSupplier.Address,
		&createdSupplier.GSTNumber, &createdSupplier.IsActive, &createdSupplier.CreatedAt,
	)
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve created supplier"})
		return
	}

	c.JSON(http.StatusCreated, createdSupplier)
}

func GetSupplier(c *gin.Context) {
	supplierID := c.Param("id")
	
	db := database.GetDB()
	
	var supplier struct {
		ID           int    `json:"id"`
		Name         string `json:"name"`
		ContactPerson string `json:"contact_person"`
		Email        string `json:"email"`
		Phone        string `json:"phone"`
		Address      string `json:"address"`
		GSTNumber    string `json:"gst_number"`
		IsActive     bool   `json:"is_active"`
		CreatedAt    string `json:"created_at"`
	}
	
	err := db.QueryRow(`
		SELECT id, name, contact_person, email, phone, address, gst_number, is_active, created_at 
		FROM suppliers 
		WHERE id = ? AND is_active = true`, supplierID).Scan(
		&supplier.ID, &supplier.Name, &supplier.ContactPerson, &supplier.Email,
		&supplier.Phone, &supplier.Address, &supplier.GSTNumber, &supplier.IsActive,
		&supplier.CreatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Supplier not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, supplier)
}