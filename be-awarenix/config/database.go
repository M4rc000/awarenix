package config

import (
	"be-awarenix/models"
	"fmt"
	"log"
	"os"

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
	DB = db
	DB.AutoMigrate(
		&models.User{}, &models.Event{}, &models.Group{}, &models.EmailTemplate{}, &models.LandingPage{}, &models.SendingProfiles{}, &models.Menu{}, &models.Submenu{}, &models.Role{}, &models.Member{}, &models.EmailHeader{}, models.PhishSettings{}, models.ActivityLog{}, models.RoleMenuAccess{}, models.RoleSubmenuAccess{}, models.Campaign{}, models.Event{}, models.Recipient{}, models.RefreshToken{},
	)
}

func RunSeeder() {
	SeedUsers(DB)
	SeedRoles(DB)
	SeedMenus(DB)
	SeedSubmenus(DB)
	SeedEmailTemplates(DB)
	SeedLandingPages(DB)
	SeedRoleMenuAccess(DB)
	SeedRoleSubmenuAccess(DB)
}
