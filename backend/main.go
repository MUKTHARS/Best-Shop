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
		// User routes
		auth.GET("/profile", handlers.GetProfile)
		auth.GET("/users", handlers.GetUsers) 
		auth.POST("/register", handlers.Register)
		auth.PUT("/users/:id", handlers.UpdateUser)    
		auth.DELETE("/users/:id", handlers.DeleteUser) 
		auth.POST("/reset-password", handlers.ResetPassword)
		// Category routes
		auth.GET("/categories", handlers.GetCategories)
		auth.POST("/categories", handlers.CreateCategory)

		// Brand routes
		auth.GET("/brands", handlers.GetBrands)
		auth.POST("/brands", handlers.CreateBrand)

		// Subcategory routes
		auth.GET("/subcategories/category/:id", handlers.GetSubcategories)
		auth.POST("/subcategories", handlers.CreateSubcategory)

		// Product routes - Define specific routes first
		auth.PUT("/products/:id", handlers.UpdateProduct)
		auth.DELETE("/products/:id", handlers.DeleteProduct)
		auth.GET("/products", handlers.GetProducts)
		auth.POST("/products", handlers.CreateProduct)

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

// package main

// import (
// 	"log"
// 	"stock-management/config"
// 	"stock-management/database"
// 	"stock-management/handlers"
// 	"stock-management/middleware"
// 	"stock-management/utils"
// 	"github.com/gin-gonic/gin"
// )

// func main() {
// 	// Load configuration
// 	config.LoadConfig()

// 	// Initialize database
// 	database.InitDB()
// 	defer database.CloseDB()
// log.Println("🔄 Resetting all user passwords...")
// 	err := utils.ResetAllUserPasswords(database.GetDB())
// 	if err != nil {
// 		log.Printf("❌ Password reset failed: %v", err)
// 	} else {
// 		log.Println("✅ All passwords reset successfully")
// 	}
// 	// Create Gin router
// 	router := gin.Default()

// 	// Middleware
// 	router.Use(middleware.CORSMiddleware())

// 	// Static files
// 	router.Static("/uploads", "./uploads")

// 	// Public routes
// 	router.POST("/login", handlers.Login)
// 	// router.POST("/register", handlers.Register)

// 	// Protected routes
// 	auth := router.Group("/")
// 	auth.Use(middleware.AuthMiddleware())
// 	{
// 		// User routes
// 		auth.GET("/profile", handlers.GetProfile)
// 		auth.GET("/users", handlers.GetUsers) 
// 		auth.POST("/register", handlers.Register)

// 		// Category routes
// 		auth.GET("/categories", handlers.GetCategories)
// 		auth.POST("/categories", handlers.CreateCategory)

// 		// Brand routes
// 		auth.GET("/brands", handlers.GetBrands)
// 		auth.POST("/brands", handlers.CreateBrand)

// 		// Subcategory routes
// 		auth.GET("/subcategories/category/:id", handlers.GetSubcategories)
// 		auth.POST("/subcategories", handlers.CreateSubcategory)

// 		// Product routes
// 		auth.GET("/products", handlers.GetProducts)
// 		auth.POST("/products", handlers.CreateProduct)
// 		auth.PUT("/products/:id", handlers.UpdateProduct)
// 		auth.DELETE("/products/:id", handlers.DeleteProduct)

// 		// Stock routes
// 		auth.GET("/stock-entries", handlers.GetStockEntries)
// 		auth.POST("/stock-entries", handlers.CreateStockEntry)
// 		auth.POST("/upload-image", handlers.UploadImage)

// 		// Dashboard
// 		auth.GET("/dashboard-stats", handlers.GetDashboardStats)

// 		auth.GET("/suppliers", handlers.GetSuppliers)
// auth.POST("/suppliers", handlers.CreateSupplier)
// auth.GET("/suppliers/:id", handlers.GetSupplier)

// // Sales routes
// auth.GET("/sales", handlers.GetSales)
// auth.POST("/sales", handlers.CreateSale)
// auth.GET("/sales/:id", handlers.GetSaleDetails)

// // Stock routes (additional)
// // auth.POST("/stock-adjustments", handlers.AdjustStock)
// // auth.GET("/low-stock", handlers.GetLowStockItems)
// 	}

// 	// Start server
// 	serverAddr := config.GetServerAddress()
// 	log.Printf("🚀 Server running on %s", serverAddr)
// 	log.Fatal(router.Run(serverAddr))
// }