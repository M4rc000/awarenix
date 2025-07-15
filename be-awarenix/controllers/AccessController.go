package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetUserAccessPermissions(c *gin.Context) {
	roleID, exists := c.Get("roleID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized: Role ID not found", "data": nil})
		return
	}

	var allowedMenus []models.Menu
	err := config.DB.Table("menus").
		Joins("JOIN role_menu_accesses rma ON menus.id = rma.menu_id").
		Where("rma.role_id = ?", roleID).
		Find(&allowedMenus).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to get allowed menus: " + err.Error(), "data": nil})
		return
	}

	var allowedSubmenus []models.Submenu
	err = config.DB.Table("submenus").
		Joins("JOIN role_submenu_accesses rsa ON submenus.id = rsa.submenu_id").
		Where("rsa.role_id = ?", roleID).
		Find(&allowedSubmenus).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to get allowed submenus: " + err.Error(), "data": nil})
		return
	}

	var allowedSubmenuUrls []string
	for _, sm := range allowedSubmenus {
		allowedSubmenuUrls = append(allowedSubmenuUrls, sm.Url)
	}

	var allowedMenuNames []string
	for _, m := range allowedMenus {
		allowedMenuNames = append(allowedMenuNames, m.Name)
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "User access permissions fetched successfully",
		"data": gin.H{
			"allowed_menus":    allowedMenuNames,
			"allowed_submenus": allowedSubmenuUrls,
		},
	})
}
