package config

import (
	"fmt"
	"log"
	"os"

	"be-awarenix/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDatabase() {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true",
		os.Getenv("DB_USER"), os.Getenv("DB_PASS"),
		os.Getenv("DB_HOST"), os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"))

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto-migrate models
	db.AutoMigrate(
		&models.User{}, &models.Event{}, &models.Group{}, &models.EmailTemplate{}, &models.LandingPage{}, &models.SendingProfiles{}, &models.Menu{}, &models.Submenu{}, &models.Role{}, &models.Member{},
	)

	SeedUsers(db)
	SeedRoles(db)

	DB = db
}
