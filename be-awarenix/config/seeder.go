package config

import (
	"log"
	"time"

	"be-awarenix/models"
	"be-awarenix/services"

	"gorm.io/gorm"
)

func SeedUsers(db *gorm.DB) {
	usersToSeed := []models.User{
		{
			Name:         "Marco Antonio",
			Email:        "marco@gmail.com",
			PasswordHash: "123456",
			Position:     "Security Consultant",
			IsActive:     1,
			Role:         "Admin",
		},
		{
			Name:         "Jane Doe",
			Email:        "jane.doe@example.com",
			PasswordHash: "password_jane",
			Position:     "Developer",
			IsActive:     1,
			Role:         "User",
		},
	}

	// 2. Lakukan perulangan untuk setiap user dalam slice di atas.
	for _, userData := range usersToSeed {
		// 3. Cek apakah user dengan email tersebut sudah ada di database.
		var existingUser models.User
		err := db.Where("email = ?", userData.Email).First(&existingUser).Error

		// Jika user tidak ditemukan (ini yang kita harapkan), maka buat user baru.
		if err != nil && err == gorm.ErrRecordNotFound {
			log.Printf("Seeding user '%s'...", userData.Name)

			// Hash password mentah dari data slice
			hashedPassword, hashErr := services.HashPassword(userData.PasswordHash)
			if hashErr != nil {
				log.Fatalf("Failed to hash password for seeder: %v", hashErr)
			}
			// Update field PasswordHash dengan hasil hash
			userData.PasswordHash = hashedPassword

			// Buat user di database
			if err := db.Create(&userData).Error; err != nil {
				log.Fatalf("Failed to seed user '%s': %v", userData.Name, err)
			}
			log.Printf("User '%s' seeded successfully.", userData.Name)

		} else if err != nil {
			// Handle error lain selain record not found
			log.Fatalf("Error checking for user '%s': %v", userData.Name, err)
		} else {
			// Jika tidak ada error, berarti user sudah ada
			log.Printf("User with email '%s' already exists. Seeder skipped.", userData.Email)
		}
	}
}

func SeedRoles(db *gorm.DB) {
	rolesToSeed := []models.Role{
		{
			Name:      "Super Admin",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
		{
			Name:      "Admin",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
		{
			Name:      "Engineer",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
	}

	for _, roleData := range rolesToSeed {
		var existingRole models.Role
		err := db.Where("name = ?", roleData.Name).First(&existingRole).Error

		if err != nil && err == gorm.ErrRecordNotFound {
			log.Printf("Seeding role '%s'...", roleData.Name)

			// Buat role di database
			if err := db.Create(&roleData).Error; err != nil {
				log.Fatalf("Failed to seed role '%s': %v", roleData.Name, err)
			}
			log.Printf("Role '%s' seeded successfully.", roleData.Name)

		} else if err != nil {
			log.Fatalf("Error checking for role '%s': %v", roleData.Name, err)
		} else {
			log.Printf("Role with name '%s' already exists. Seeder skipped.", roleData.Name)
		}
	}
}

func SeedMenus(db *gorm.DB) {
	rolesToMenu := []models.Menu{
		{
			Name:      "Admin",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
		{
			Name:      "User",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
		{
			Name:      "Logging & Monitoring",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
	}

	for _, menuData := range rolesToMenu {
		var existingRole models.Menu
		err := db.Where("name = ?", menuData.Name).First(&existingRole).Error

		if err != nil && err == gorm.ErrRecordNotFound {
			log.Printf("Seeding role '%s'...", menuData.Name)

			// Buat role di database
			if err := db.Create(&menuData).Error; err != nil {
				log.Fatalf("Failed to seed role '%s': %v", menuData.Name, err)
			}
			log.Printf("Role '%s' seeded successfully.", menuData.Name)

		} else if err != nil {
			log.Fatalf("Error checking for role '%s': %v", menuData.Name, err)
		} else {
			log.Printf("Role with name '%s' already exists. Seeder skipped.", menuData.Name)
		}
	}
}
