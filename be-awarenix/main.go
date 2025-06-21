package main

import (
	"fmt"
	"log"
	"os"

	"be-awarenix/config"
	"be-awarenix/middlewares"
	"be-awarenix/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env: %v", err)
	}

	err = os.Setenv("TZ", "Asia/Jakarta")
	if err != nil {
		log.Fatalf("Failed to set timezone: %v", err)
	}

	// Init DB
	config.InitDatabase()

	// Setup Gin engine
	app := gin.Default()
	app.Use(middlewares.CORSMiddleware())
	// app.Use(cors.Default())

	// Load routes
	routes.SetupRoutes(app)

	// Start server
	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "3000"
	}

	// app.Run(fmt.Sprintf(":%s", port))
	app.Run(fmt.Sprintf("0.0.0.0:%s", port))
}
