package middlewares

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"net/http"
	"os"
	"strings"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Missing or invalid Authorization header"})
			return
		}

		tokenStr := strings.TrimPrefix(auth, "Bearer ")

		// Parse token and extract claims
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("JWT_SECRET")), nil
		})
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Invalid token"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Invalid token claims"})
			return
		}

		// Ambil user ID dari claim "sub"
		userIDFloat, ok := claims["sub"].(float64)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Invalid user ID in token"})
			return
		}
		userID := uint(userIDFloat)

		// Cari user dari DB
		var user models.User
		if err := config.DB.First(&user, userID).Error; err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"success": false, "error": "User not found"})
			return
		}

		// ⛳ Masukkan user ke context
		c.Set("user", &user)

		c.Next()
	}
}
