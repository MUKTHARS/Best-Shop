package main

import (
	"log"
	"stock-management/config"
	"stock-management/database"
	"stock-management/handlers"
	"stock-management/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	config.LoadConfig()

	// Initialize database
	database.InitDB()
	defer database.CloseDB()

	// Create Gin router
	router := gin.Default()

	// Middleware
	router.Use(middleware.CORSMiddleware())

	// Static files
	router.Static("/uploads", "./uploads")

	// Public routes
	router.POST("/login", handlers.Login)

	// Protected routes
	auth := router.Group("/")
	auth.Use(middleware.AuthMiddleware())
	{
		// User routes - Admin only
		auth.GET("/profile", handlers.GetProfile)
		auth.POST("/reset-password", handlers.ResetPassword)
		
		// User management - Admin only
		userManagement := auth.Group("/")
		userManagement.Use(middleware.RoleMiddleware("admin"))
		{
			userManagement.GET("/users", handlers.GetUsers)
			userManagement.POST("/register", handlers.Register)
			userManagement.PUT("/users/:id", handlers.UpdateUser)
			userManagement.DELETE("/users/:id", handlers.DeleteUser)
		}

		// Product routes - Read access for all authenticated users
		auth.GET("/products", handlers.GetProducts)
		auth.GET("/categories", handlers.GetCategories)
		auth.GET("/brands", handlers.GetBrands)
		auth.GET("/subcategories/category/:id", handlers.GetSubcategories)
		
		// Product write operations - Admin and Manager only
		productWrite := auth.Group("/")
		productWrite.Use(middleware.RoleMiddleware("admin", "manager"))
		{
			productWrite.POST("/products", handlers.CreateProduct)
			productWrite.PUT("/products/:id", handlers.UpdateProduct)
			productWrite.DELETE("/products/:id", handlers.DeleteProduct)
			productWrite.POST("/categories", handlers.CreateCategory)
			productWrite.POST("/brands", handlers.CreateBrand)
			productWrite.POST("/subcategories", handlers.CreateSubcategory)
		}

		// Stock routes
		auth.GET("/stock-entries", handlers.GetStockEntries)
		auth.POST("/stock-entries", handlers.CreateStockEntry)
		auth.POST("/upload-image", handlers.UploadImage)

		// Dashboard
		auth.GET("/dashboard-stats", handlers.GetDashboardStats)

		// Supplier routes
		auth.GET("/suppliers", handlers.GetSuppliers)
		auth.POST("/suppliers", handlers.CreateSupplier)
		auth.GET("/suppliers/:id", handlers.GetSupplier)

		// Sales routes
		auth.GET("/sales", handlers.GetSales)
		auth.POST("/sales", handlers.CreateSale)
		auth.GET("/sales/:id", handlers.GetSaleDetails)
	}

	// Debug: Print all registered routes
	log.Println("📋 Registered routes:")
	for _, route := range router.Routes() {
		log.Printf("  %s %s", route.Method, route.Path)
	}

	// Start server
	serverAddr := config.GetServerAddress()
	log.Printf("🚀 Server running on %s", serverAddr)
	log.Fatal(router.Run(serverAddr))
}


	