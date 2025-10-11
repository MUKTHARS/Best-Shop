package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	ServerPort string
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	JWTSecret  string
	JWTExpiry  string
}

var AppConfig *Config

func LoadConfig() {
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	AppConfig = &Config{
		ServerPort: getEnv("SERVER_PORT", "8080"),
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "3306"),
		DBUser:     getEnv("DB_USER", "root"),
		DBPassword: getEnv("DB_PASSWORD", "1234"),
		DBName:     getEnv("DB_NAME", "stock_management"),
		JWTSecret:  getEnv("JWT_SECRET", "1a2b3c4d5e"),
		JWTExpiry:  getEnv("JWT_EXPIRY", "24h"),
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func GetDBConnectionString() string {
	return AppConfig.DBUser + ":" + AppConfig.DBPassword + "@tcp(" + AppConfig.DBHost + ":" + AppConfig.DBPort + ")/" + AppConfig.DBName + "?parseTime=true"
}

func GetServerAddress() string {
	return ":" + AppConfig.ServerPort
}

func GetJWTSecret() []byte {
	return []byte(AppConfig.JWTSecret)
}

func GetMaxFileSize() int64 {
	if size, err := strconv.ParseInt(getEnv("MAX_FILE_SIZE", "10485760"), 10, 64); err == nil {
		return size
	}
	return 10 * 1024 * 1024 // 10MB default
}
