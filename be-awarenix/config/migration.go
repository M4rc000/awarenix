package config

import "be-awarenix/models"

func Migrations() {
	// Auto-migrate models
	DB.AutoMigrate(
		&models.User{}, &models.Event{}, &models.Group{}, &models.EmailTemplate{}, &models.LandingPage{}, &models.SendingProfiles{}, &models.Menu{}, &models.Submenu{}, &models.Role{}, &models.Member{}, &models.EmailHeader{}, models.PhishSettings{}, models.ActivityLog{}, models.RoleMenuAccess{}, models.RoleSubmenuAccess{}, models.Campaign{}, models.Event{}, models.Recipient{},
	)
}
