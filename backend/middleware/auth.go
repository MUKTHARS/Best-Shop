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

// package middleware

// import (
// 	"net/http"
// 	"stock-management/utils"
// 	"strings"

// 	"github.com/gin-gonic/gin"
// )

// func AuthMiddleware() gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		tokenString := c.GetHeader("Authorization")
// 		if tokenString == "" {
// 			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
// 			c.Abort()
// 			return
// 		}

// 		tokenString = strings.TrimPrefix(tokenString, "Bearer ")

// 		claims, err := utils.ValidateJWT(tokenString)
// 		if err != nil {
// 			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
// 			c.Abort()
// 			return
// 		}

// 		c.Set("user_id", claims.UserID)
// 		c.Set("role", claims.Role)
// 		c.Next()
// 	}
// }

// func RoleMiddleware(allowedRoles ...string) gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		userRole, exists := c.Get("role")
// 		if !exists {
// 			c.JSON(http.StatusUnauthorized, gin.H{"error": "User role not found"})
// 			c.Abort()
// 			return
// 		}

// 		role := userRole.(string)
// 		for _, allowedRole := range allowedRoles {
// 			if role == allowedRole {
// 				c.Next()
// 				return
// 			}
// 		}

// 		c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
// 		c.Abort()
// 	}
// }