package middlewares

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	return cors.New(cors.Config{

		AllowOrigins:     []string{"http://localhost:5173", "http://127.0.0.1:5173", "http://192.168.1.9:5173", "http://127.0.0.1:5500", "http://localhost:5174", "http://127.0.0.1:5174", "http://192.168.1.9:5174"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	})
}
