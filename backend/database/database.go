package database

import (
	"database/sql"
	"fmt"
	"log"
	"stock-management/config"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func InitDB() {
	var err error
	connectionString := config.GetDBConnectionString()
	
	DB, err = sql.Open("mysql", connectionString)
	if err != nil {
		log.Fatal("Error opening database:", err)
	}

	err = DB.Ping()
	if err != nil {
		log.Fatal("Error connecting to database:", err)
	}

	// Set connection pool settings
	DB.SetMaxOpenConns(25)
	DB.SetMaxIdleConns(25)
	DB.SetConnMaxLifetime(5 * 60) // 5 minutes

	fmt.Println("✅ Connected to MySQL database")
}

func GetDB() *sql.DB {
	return DB
}

func CloseDB() {
	if DB != nil {
		DB.Close()
		fmt.Println("✅ Database connection closed")
	}
}