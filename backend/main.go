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
	// router.POST("/register", handlers.Register)

	// Protected routes
	auth := router.Group("/")
	auth.Use(middleware.AuthMiddleware())
	{
		// User routes
		auth.GET("/profile", handlers.GetProfile)

		// Category routes
		auth.GET("/categories", handlers.GetCategories)
		auth.POST("/categories", handlers.CreateCategory)

		// Brand routes
		auth.GET("/brands", handlers.GetBrands)
		auth.POST("/brands", handlers.CreateBrand)

		// Subcategory routes
		auth.GET("/subcategories/category/:id", handlers.GetSubcategories)
		auth.POST("/subcategories", handlers.CreateSubcategory)

		// Product routes
		auth.GET("/products", handlers.GetProducts)
		auth.POST("/products", handlers.CreateProduct)

		// Stock routes
		auth.GET("/stock-entries", handlers.GetStockEntries)
		auth.POST("/stock-entries", handlers.CreateStockEntry)
		auth.POST("/upload-image", handlers.UploadImage)

		// Dashboard
		auth.GET("/dashboard-stats", handlers.GetDashboardStats)

		auth.GET("/suppliers", handlers.GetSuppliers)
auth.POST("/suppliers", handlers.CreateSupplier)
auth.GET("/suppliers/:id", handlers.GetSupplier)

// Sales routes
auth.GET("/sales", handlers.GetSales)
auth.POST("/sales", handlers.CreateSale)
auth.GET("/sales/:id", handlers.GetSaleDetails)

// Stock routes (additional)
// auth.POST("/stock-adjustments", handlers.AdjustStock)
// auth.GET("/low-stock", handlers.GetLowStockItems)
	}

	// Start server
	serverAddr := config.GetServerAddress()
	log.Printf("🚀 Server running on %s", serverAddr)
	log.Fatal(router.Run(serverAddr))
}