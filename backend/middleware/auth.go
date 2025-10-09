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

