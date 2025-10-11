package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"stock-management/database"
	"stock-management/models"
	"stock-management/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

func Register(c *gin.Context) {
    var req struct {
        Username string `json:"username" binding:"required"`
        Email    string `json:"email" binding:"required"`
        Password string `json:"password" binding:"required"`
        Role     string `json:"role" binding:"required"`
    }

    if err := c.BindJSON(&req); err != nil {
        log.Printf("❌ Register request bind error: %v", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
        return
    }

    db := database.GetDB()

    // Check if user already exists
    existingUser, _ := models.GetUserByUsername(db, req.Username)
    if existingUser != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Username already exists"})
        return
    }

    // Store plain text password (no hashing)
    plainPassword := req.Password

    // Create user
    query := `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`
    result, err := db.Exec(query, req.Username, req.Email, plainPassword, req.Role)
    if err != nil {
        log.Printf("❌ User creation error: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
        return
    }

    userID, _ := result.LastInsertId()

    c.JSON(http.StatusCreated, gin.H{
        "message": "User created successfully",
        "user_id": userID,
    })
}

func GetUsers(c *gin.Context) {
	db := database.GetDB()

	query := `SELECT id, username, email, role, is_active, last_login, created_at, updated_at 
	          FROM users WHERE is_active = true ORDER BY created_at DESC`
	
	rows, err := db.Query(query)
	if err != nil {
		log.Printf("❌ Get users error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch users"})
		return
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		var lastLogin sql.NullTime
		
		err := rows.Scan(
			&user.ID,
			&user.Username,
			&user.Email,
			&user.Role,
			&user.IsActive,
			&lastLogin,
			&user.CreatedAt,
			&user.UpdatedAt,
		)
		if err != nil {
			log.Printf("❌ User scan error: %v", err)
			continue
		}

		if lastLogin.Valid {
			user.LastLogin = &lastLogin.Time
		}

		users = append(users, user)
	}

	c.JSON(http.StatusOK, users)
}

func UpdateUser(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req struct {
		Email    string `json:"email"`
		Role     string `json:"role"`
		IsActive *bool  `json:"is_active"`
		Password string `json:"password"` // New password field
	}

	if err := c.BindJSON(&req); err != nil {
		log.Printf("❌ Update user request bind error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	db := database.GetDB()
	
	// Build update query dynamically based on provided fields
	query := "UPDATE users SET "
	var args []interface{}
	
	if req.Email != "" {
		query += "email = ?, "
		args = append(args, req.Email)
	}
	
	if req.Role != "" {
		query += "role = ?, "
		args = append(args, req.Role)
	}
	
	if req.IsActive != nil {
		query += "is_active = ?, "
		args = append(args, *req.IsActive)
	}
	
	// Handle password update separately if provided
	if req.Password != "" {
		log.Printf("🔄 Updating password for user ID: %d", userID)
		err := utils.UpdateUserPassword(userID, req.Password)
		if err != nil {
			log.Printf("❌ Password update failed: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
			return
		}
	}
	
	// Remove trailing comma and space, add WHERE clause
	if len(args) > 0 {
		query = query[:len(query)-2] + " WHERE id = ?"
		args = append(args, userID)

		_, err = db.Exec(query, args...)
		if err != nil {
			log.Printf("❌ User update error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
			return
		}
	}

	log.Printf("✅ User updated successfully: ID %d", userID)
	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
}


// func UpdateUser(c *gin.Context) {
// 	userIDStr := c.Param("id")
// 	userID, err := strconv.Atoi(userIDStr)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
// 		return
// 	}

// 	var req struct {
// 		Role     string `json:"role"`
// 		IsActive *bool  `json:"is_active"`
// 	}

// 	if err := c.BindJSON(&req); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
// 		return
// 	}

// 	db := database.GetDB()
	
// 	// Build update query dynamically based on provided fields
// 	query := "UPDATE users SET "
// 	var args []interface{}
	
// 	if req.Role != "" {
// 		query += "role = ?, "
// 		args = append(args, req.Role)
// 	}
	
// 	if req.IsActive != nil {
// 		query += "is_active = ?, "
// 		args = append(args, *req.IsActive)
// 	}
	
// 	// Remove trailing comma and space, add WHERE clause
// 	query = query[:len(query)-2] + " WHERE id = ?"
// 	args = append(args, userID)

// 	_, err = db.Exec(query, args...)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
// }

func DeleteUser(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	db := database.GetDB()
	
	// Soft delete by setting is_active to false
	_, err = db.Exec("UPDATE users SET is_active = false WHERE id = ?", userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}