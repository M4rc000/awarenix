package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// READ
func GetActivityLogs(c *gin.Context) {
	// Parameter Query untuk Pagination
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")
	search := c.DefaultQuery("search", "")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	var activityLogs []models.GetActivityLog
	var total int64

	// Membangun query dasar
	query := config.DB.Model(&models.ActivityLog{})

	// Menambahkan kondisi pencarian jika ada
	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where(
			"action LIKE ? OR module_name LIKE ? OR record_id LIKE ? OR error_message LIKE ? OR ip_address LIKE ? OR user_agent LIKE ?",
			searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern,
		)
	}

	query.Count(&total)

	if err := query.Select(`activity_logs.*, user_name.name AS user_name, record_name.name as record_name`).
		Joins(`LEFT JOIN users AS user_name ON user_name.id = activity_logs.user_id`).
		Joins(`LEFT JOIN users AS record_name ON record_name.id = activity_logs.record_id`).
		Offset(offset).
		Limit(limit).
		Order("timestamp DESC").
		Find(&activityLogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to fetch activity logs",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Activity logs retrieved successfully",
		"data":    activityLogs,
		"total":   total,
		"page":    page,
		"limit":   limit,
	})
}
