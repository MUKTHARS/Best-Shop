package utils

import (
	"log"
	"golang.org/x/crypto/bcrypt"
	"database/sql"
	"stock-management/database"
	"stock-management/models"
)

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	log.Printf("🔐 Password check - Input: %s, Hash: %s", password, hash)
	
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	if err != nil {
		log.Printf("❌ BCrypt comparison failed: %v", err)
		return false
	}
	
	log.Printf("✅ BCrypt password check successful")
	return true
}

func EnhancedLoginCheck(identifier, password string) (*models.User, error) {
	db := database.GetDB()
	
	log.Printf("🔍 Enhanced login check for identifier: %s", identifier)
	
	// Try multiple lookup methods
	var user *models.User
	var err error
	
	// Method 1: Try username first
	user, err = models.GetUserByUsername(db, identifier)
	if err == nil && user != nil {
		log.Printf("✅ User found by username: %s, role: %s", user.Username, user.Role)
		if CheckPasswordHash(password, user.Password) {
			return user, nil
		}
		log.Printf("❌ Password mismatch for username: %s", identifier)
		return nil, sql.ErrNoRows
	} else {
		log.Printf("⚠️ User not found by username: %s, trying email...", identifier)
	}
	
	// Method 2: Try email
	user, err = models.GetUserByEmail(db, identifier)
	if err == nil && user != nil {
		log.Printf("✅ User found by email: %s, role: %s", user.Username, user.Role)
		if CheckPasswordHash(password, user.Password) {
			return user, nil
		}
		log.Printf("❌ Password mismatch for email: %s", identifier)
		return nil, sql.ErrNoRows
	} else {
		log.Printf("⚠️ User not found by email: %s", identifier)
	}
	
	// Method 3: Try case-insensitive search (for edge cases)
	user, err = findUserByAnyIdentifier(db, identifier)
	if err == nil && user != nil {
		log.Printf("✅ User found by any identifier: %s, actual username: %s", identifier, user.Username)
		if CheckPasswordHash(password, user.Password) {
			return user, nil
		}
		log.Printf("❌ Password mismatch for any identifier: %s", identifier)
		return nil, sql.ErrNoRows
	}
	
	log.Printf("❌ All login methods failed for identifier: %s", identifier)
	return nil, sql.ErrNoRows
}

// findUserByAnyIdentifier performs a broader search for the user
func findUserByAnyIdentifier(db *sql.DB, identifier string) (*models.User, error) {
	// Try case-insensitive username search
	query := `SELECT id, username, email, password, role, is_active, last_login, created_at, updated_at 
	          FROM users WHERE (LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)) AND is_active = true`
	
	var user models.User
	var lastLogin sql.NullTime
	
	err := db.QueryRow(query, identifier, identifier).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.IsActive,
		&lastLogin,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	
	if err != nil {
		return nil, err
	}
	
	if lastLogin.Valid {
		user.LastLogin = &lastLogin.Time
	}
	
	return &user, nil
}

// ResetUserPassword ensures password changes are properly handled
func ResetUserPassword(userID int, newPassword string) error {
	db := database.GetDB()
	
	log.Printf("🔄 Resetting password for user ID: %d", userID)
	
	hashedPassword, err := HashPassword(newPassword)
	if err != nil {
		log.Printf("❌ Password hashing error: %v", err)
		return err
	}
	
	query := `UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?`
	result, err := db.Exec(query, hashedPassword, userID)
	if err != nil {
		log.Printf("❌ Password update error: %v", err)
		return err
	}
	
	rowsAffected, _ := result.RowsAffected()
	log.Printf("✅ Password reset successfully for user ID: %d, rows affected: %d", userID, rowsAffected)
	
	return nil
}

// UpdateUserPassword - Use this for updating passwords in user management
func UpdateUserPassword(userID int, newPassword string) error {
	return ResetUserPassword(userID, newPassword)
}