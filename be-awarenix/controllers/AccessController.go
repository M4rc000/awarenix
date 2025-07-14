package controllers

import (
	"be-awarenix/config"
	"be-awarenix/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetUserAccessPermissions handles API request to get allowed menus and submenus for a role.
func GetUserAccessPermissions(c *gin.Context) {
	// Ambil role_name dari body request atau query parameter
	// Untuk kesederhanaan, kita akan ambil dari query parameter `role_name`
	// Anda juga bisa mengambilnya dari JWT token di middleware autentikasi dan menyimpannya di c.Set()
	roleName := c.Query("role_name")
	if roleName == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Role name is required",
		})
		return
	}

	allowedMenus, allowedSubmenus, err := services.GetAllowedMenusAndSubmenusByRoleName(config.DB, roleName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to retrieve permissions",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Permissions retrieved successfully",
		"data": gin.H{
			"allowed_menus":    allowedMenus,
			"allowed_submenus": allowedSubmenus,
		},
	})
}
