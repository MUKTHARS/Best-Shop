package middleware

import (
	"net/http"
	"stock-management/utils"
	"strings"
	"log"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Printf("🔐 AuthMiddleware - Request: %s %s", c.Request.Method, c.Request.URL.Path)
		
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			log.Printf("❌ No authorization header")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		tokenString = strings.TrimPrefix(tokenString, "Bearer ")

		claims, err := utils.ValidateJWT(tokenString)
		if err != nil {
			log.Printf("❌ Invalid token: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		log.Printf("✅ Token validated for user %d, role: %s", claims.UserID, claims.Role)
		c.Set("user_id", claims.UserID)
		c.Set("role", claims.Role)
		c.Next()
	}
}

// RoleMiddleware checks if user has required role
func RoleMiddleware(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole := c.GetString("role")
		
		// Check if user role is in allowed roles
		hasAccess := false
		for _, role := range allowedRoles {
			if userRole == role {
				hasAccess = true
				break
			}
		}

		if !hasAccess {
			log.Printf("❌ Access denied for role: %s, required: %v", userRole, allowedRoles)
			c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			c.Abort()
			return
		}

		log.Printf("✅ Role access granted: %s for roles: %v", userRole, allowedRoles)
		c.Next()
	}
}

// ProductAccessMiddleware allows admin, manager, and employees with product access
func ProductAccessMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole := c.GetString("role")
		
		// Admin and manager always have access
		if userRole == "admin" || userRole == "manager" {
			c.Next()
			return
		}
		
		// For employees, we need to check if they have product edit permissions
		// This would require checking a permissions table in the database
		// For now, we'll assume employees don't have access by default
		// You can implement this later based on your business logic
		
		log.Printf("❌ Product access denied for role: %s", userRole)
		c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions for product operations"})
		c.Abort()
	}
}