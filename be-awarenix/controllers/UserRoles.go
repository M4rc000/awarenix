package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// READ
func GetRoles(c *gin.Context) {
	query := config.DB.Table("roles").
		Select(`roles.*, 
            created_by_user.name AS created_by_name, 
            updated_by_user.name AS updated_by_name`).
		Joins(`LEFT JOIN users AS created_by_user ON created_by_user.id = roles.created_by`).
		Joins(`LEFT JOIN users AS updated_by_user ON updated_by_user.id = roles.updated_by`)

	var total int64
	query.Count(&total)

	var data []models.GetRoleTable
	if err := query.
		Scan(&data).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to fetch user role",
			"Error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"Success": true,
		"Message": "User Role data retrieved successfully",
		"Data":    data,
		"Total":   total,
	})
}
