package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func GetSendingProfiles(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	search := c.Query("search")
	sortBy := c.DefaultQuery("sortBy", "id")
	sortOrder := c.DefaultQuery("sortOrder", "asc")

	offset := (page - 1) * pageSize

	query := config.DB.Model(&models.SendingProfiles{})

	if search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		query = query.Where(
			"LOWER(name) LIKE ? OR LOWER(subjecy) LIKE ?",
			searchPattern, searchPattern, searchPattern,
		)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to count sending profile templates",
			"Error":   err.Error(),
		})
		return
	}

	orderClause := sortBy
	if sortOrder == "desc" {
		orderClause += " DESC"
	} else {
		orderClause += " ASC"
	}

	var templates []models.SendingProfiles
	if err := query.Order(orderClause).Offset(offset).Limit(pageSize).Find(&templates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to fetch sending profiles templates",
			"Error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"Success": true,
		"Message": "Sending profiles templates retrieved successfully",
		"Data":    templates,
		"Total":   total,
	})
}
