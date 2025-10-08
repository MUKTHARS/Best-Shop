package models

import (
	"database/sql"
	"time"
)

type User struct {
	ID        int       `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Password  string    `json:"-"`
	Role      string    `json:"role"`
	IsActive  bool      `json:"is_active"`
	LastLogin time.Time `json:"last_login,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type Claims struct {
	UserID int    `json:"user_id"`
	Role   string `json:"role"`
}

func GetUserByUsername(db *sql.DB, username string) (*User, error) {
	var user User
	err := db.QueryRow(`
		SELECT id, username, email, password, role, is_active, last_login, created_at, updated_at 
		FROM users WHERE username = ? AND is_active = true`,
		username).Scan(
		&user.ID, &user.Username, &user.Email, &user.Password, &user.Role,
		&user.IsActive, &user.LastLogin, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func GetUserByID(db *sql.DB, id int) (*User, error) {
	var user User
	err := db.QueryRow(`
		SELECT id, username, email, role, is_active, last_login, created_at, updated_at 
		FROM users WHERE id = ? AND is_active = true`,
		id).Scan(
		&user.ID, &user.Username, &user.Email, &user.Role,
		&user.IsActive, &user.LastLogin, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func CreateUser(db *sql.DB, user *User) error {
	result, err := db.Exec(`
		INSERT INTO users (username, email, password, role) 
		VALUES (?, ?, ?, ?)`,
		user.Username, user.Email, user.Password, user.Role)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	user.ID = int(id)
	return nil
}

func UpdateUserLastLogin(db *sql.DB, userID int) error {
	_, err := db.Exec("UPDATE users SET last_login = NOW() WHERE id = ?", userID)
	return err
}