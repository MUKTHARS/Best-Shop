package models

import (
	"database/sql"
	"time"
)

type User struct {
	ID        int        `json:"id"`
	Username  string     `json:"username"`
	Email     string     `json:"email"`
	Password  string     `json:"-"`
	Role      string     `json:"role"`
	IsActive  bool       `json:"is_active"`
	LastLogin *time.Time `json:"last_login,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func GetUserByUsername(db *sql.DB, username string) (*User, error) {
	var user User
	var lastLogin sql.NullTime
	
	query := `SELECT id, username, email, password, role, is_active, last_login, created_at, updated_at 
	          FROM users WHERE username = ? AND is_active = true`
	
	err := db.QueryRow(query, username).Scan(
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
	
	// Convert sql.NullTime to *time.Time
	if lastLogin.Valid {
		user.LastLogin = &lastLogin.Time
	}
	
	return &user, nil
}

func GetUserByID(db *sql.DB, id int) (*User, error) {
	var user User
	var lastLogin sql.NullTime
	
	query := `SELECT id, username, email, password, role, is_active, last_login, created_at, updated_at 
	          FROM users WHERE id = ? AND is_active = true`
	
	err := db.QueryRow(query, id).Scan(
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
	
	// Convert sql.NullTime to *time.Time
	if lastLogin.Valid {
		user.LastLogin = &lastLogin.Time
	}
	
	return &user, nil
}

func UpdateUserLastLogin(db *sql.DB, userID int) error {
	query := `UPDATE users SET last_login = NOW() WHERE id = ?`
	_, err := db.Exec(query, userID)
	return err
}

func GetUserByEmail(db *sql.DB, email string) (*User, error) {
	var user User
	var lastLogin sql.NullTime
	
	query := `SELECT id, username, email, password, role, is_active, last_login, created_at, updated_at 
	          FROM users WHERE email = ? AND is_active = true`
	
	err := db.QueryRow(query, email).Scan(
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
	
	// Convert sql.NullTime to *time.Time
	if lastLogin.Valid {
		user.LastLogin = &lastLogin.Time
	}
	
	return &user, nil
}