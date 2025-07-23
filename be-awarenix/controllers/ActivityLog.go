package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"be-awarenix/services"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// READ
func GetActivityLogs(c *gin.Context) {
	userIDScope, _, errorStatus := services.GetRoleScope(c)
	if !errorStatus {
		return
	}

	loggedInUserRole := userIDScope

	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")
	search := c.DefaultQuery("search", "")
	actionFilter := c.DefaultQuery("action", "all")
	userFilter := c.DefaultQuery("user", "all")
	timeRangeFilter := c.DefaultQuery("time_range", "all")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 100000000
	}
	offset := (page - 1) * limit

	var activityLogs []models.GetActivityLog
	var total int64

	// Build the base query
	query := config.DB.Model(&models.ActivityLog{})

	// Alias the primary users join to avoid conflicts and allow filtering
	query = query.Joins("LEFT JOIN users AS users_for_name ON users_for_name.id = activity_logs.user_id")
	query = query.Joins("LEFT JOIN users AS record_users ON record_users.id = activity_logs.record_id")

	// Conditional filtering based on user role
	if loggedInUserRole != 1 { // If the logged-in user is not admin
		// Filter activity logs only for users whose role is NOT 1
		query = query.Where("users_for_name.role != ?", 1)
	}

	// Add search condition if provided
	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where(
			"activity_logs.action LIKE ? OR activity_logs.module_name LIKE ? OR activity_logs.record_id LIKE ? OR activity_logs.message LIKE ? OR activity_logs.ip_address LIKE ? OR activity_logs.user_agent LIKE ?",
			searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern,
		)
	}

	// Add Action filter
	if actionFilter != "all" {
		query = query.Where("activity_logs.action = ?", actionFilter)
	}

	// Add User filter
	if userFilter != "all" {
		query = query.Where("activity_logs.user_id = ?", userFilter)
	}

	// Add Time Range filter
	if timeRangeFilter != "all" {
		now := time.Now()
		var startTime time.Time
		switch timeRangeFilter {
		case "24h":
			startTime = now.Add(-24 * time.Hour)
		case "7d":
			startTime = now.Add(-7 * 24 * 60 * 60 * 1000)
		case "30d":
			startTime = now.Add(-30 * 24 * 60 * 60 * 1000)
		}
		query = query.Where("activity_logs.timestamp >= ?", startTime)
	}

	// Count total before applying offset and limit
	query.Count(&total)

	// Fetch activity logs
	if err := query.Select(`activity_logs.*, users_for_name.name AS user_name, record_users.name as record_name`).
		Offset(offset).
		Limit(limit).
		Order("activity_logs.timestamp DESC").
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
