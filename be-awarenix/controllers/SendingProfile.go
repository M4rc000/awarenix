package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetSendingProfiles(c *gin.Context) {
	query := config.DB.Table("sending_profiles").
		Select(`sending_profiles.*, 
            created_by_user.name AS created_by_name, 
            updated_by_user.name AS updated_by_name`).
		Joins(`LEFT JOIN users AS created_by_user ON created_by_user.id = sending_profiles.created_by`).
		Joins(`LEFT JOIN users AS updated_by_user ON updated_by_user.id = sending_profiles.updated_by`)

	var total int64
	query.Count(&total)

	var data []models.GetSendingProfile
	if err := query.
		Scan(&data).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to fetch sending profile data",
			"Error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"Success": true,
		"Message": "Sending Profile data retrieved successfully",
		"Data":    data,
		"Total":   total,
	})
}
