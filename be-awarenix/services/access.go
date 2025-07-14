package services

import (
	"be-awarenix/models"
	"fmt"
	"log"

	"gorm.io/gorm"
)

// getRoleIDByName adalah fungsi helper untuk mendapatkan ID Role dari namanya
func getRoleIDByName(db *gorm.DB, name string) (uint, error) {
	var role models.Role
	result := db.Where("name = ?", name).First(&role)
	if result.Error != nil {
		return 0, result.Error
	}
	return role.ID, nil
}

// GetAllowedMenusAndSubmenusByRoleName retrieves a list of allowed menu and submenu names for a given role name.
func GetAllowedMenusAndSubmenusByRoleName(db *gorm.DB, roleName string) ([]string, []string, error) {
	roleID, err := getRoleIDByName(db, roleName)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Printf("Role '%s' not found for permissions lookup.", roleName)
			return []string{}, []string{}, nil // Return empty lists if role not found
		}
		return nil, nil, fmt.Errorf("error getting role ID for '%s': %w", roleName, err)
	}

	// Dapatkan menu yang diizinkan
	allowedMenuAccesses := []models.RoleMenuAccess{}
	err = db.Preload("Menu").Where("role_id = ?", roleID).Find(&allowedMenuAccesses).Error
	if err != nil {
		return nil, nil, fmt.Errorf("error getting allowed menu accesses: %w", err)
	}

	menuNames := make([]string, 0, len(allowedMenuAccesses))
	for _, access := range allowedMenuAccesses {
		if access.Menu.Name != "" {
			menuNames = append(menuNames, access.Menu.Name)
		}
	}

	// Dapatkan submenu yang diizinkan
	allowedSubmenuAccesses := []models.RoleSubmenuAccess{}
	err = db.Preload("Submenu").Where("role_id = ?", roleID).Find(&allowedSubmenuAccesses).Error
	if err != nil {
		return nil, nil, fmt.Errorf("error getting allowed submenu accesses: %w", err)
	}

	submenuNames := make([]string, 0, len(allowedSubmenuAccesses))
	for _, access := range allowedSubmenuAccesses {
		if access.Submenu.Name != "" {
			submenuNames = append(submenuNames, access.Submenu.Name)
		}
	}

	return menuNames, submenuNames, nil
}
