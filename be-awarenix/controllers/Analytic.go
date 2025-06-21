package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Response struct untuk growth percentage
type GrowthResponse struct {
	CurrentMonth     int     `json:"current_month"`
	PreviousMonth    int     `json:"previous_month"`
	GrowthPercentage float64 `json:"growth_percentage"`
	GrowthType       string  `json:"growth_type"` // "increase", "decrease", "no_change"
}

type MonthlyStatsResponse struct {
	Month      string `json:"month"`
	Year       int    `json:"year"`
	TotalUsers int    `json:"total_users"`
	NewUsers   int    `json:"new_users"`
}

func GetGrowthPercentage(c *gin.Context) {
	dataType := c.DefaultQuery("type", "users")

	now := time.Now()

	// Tanggal awal dan akhir bulan ini
	currentMonthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	currentMonthEnd := currentMonthStart.AddDate(0, 1, 0).Add(-time.Second)

	// Tanggal awal dan akhir bulan lalu
	previousMonthStart := currentMonthStart.AddDate(0, -1, 0)
	previousMonthEnd := currentMonthStart.Add(-time.Second)

	var currentCount, previousCount int64
	var err error

	// Pilih tabel berdasarkan type
	switch dataType {
	case "users":
		// Hitung user bulan ini
		err = config.DB.Model(&models.User{}).Where("created_at BETWEEN ? AND ?", currentMonthStart, currentMonthEnd).Count(&currentCount).Error
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count current month users"})
			return
		}

		// Hitung user bulan lalu
		err = config.DB.Model(&models.User{}).Where("created_at BETWEEN ? AND ?", previousMonthStart, previousMonthEnd).Count(&previousCount).Error
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count previous month users"})
			return
		}

	case "groups":
		// Hitung group bulan ini
		err = config.DB.Model(&models.Group{}).Where("created_at BETWEEN ? AND ?", currentMonthStart, currentMonthEnd).Count(&currentCount).Error
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count current month groups"})
			return
		}

		// Hitung group bulan lalu
		err = config.DB.Model(&models.Group{}).Where("created_at BETWEEN ? AND ?", previousMonthStart, previousMonthEnd).Count(&previousCount).Error
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count previous month groups"})
			return
		}

	case "emailtemplates":
		// Hitung email template bulan ini
		err = config.DB.Model(&models.EmailTemplate{}).Where("created_at BETWEEN ? AND ?", currentMonthStart, currentMonthEnd).Count(&currentCount).Error
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count current month email templates"})
			return
		}

		// Hitung email template bulan lalu
		err = config.DB.Model(&models.EmailTemplate{}).Where("created_at BETWEEN ? AND ?", previousMonthStart, previousMonthEnd).Count(&previousCount).Error
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count previous month email templates"})
			return
		}

	case "landingpages":
		// Hitung landing page bulan ini
		err = config.DB.Model(&models.LandingPage{}).Where("created_at BETWEEN ? AND ?", currentMonthStart, currentMonthEnd).Count(&currentCount).Error
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count current month email templates"})
			return
		}

		// Hitung landing page bulan lalu
		err = config.DB.Model(&models.LandingPage{}).Where("created_at BETWEEN ? AND ?", previousMonthStart, previousMonthEnd).Count(&previousCount).Error
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count previous month email templates"})
			return
		}

	case "sendingprofiles":
		// Hitung landing page bulan ini
		err = config.DB.Model(&models.SendingProfiles{}).Where("created_at BETWEEN ? AND ?", currentMonthStart, currentMonthEnd).Count(&currentCount).Error
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count current month email templates"})
			return
		}

		// Hitung landing page bulan lalu
		err = config.DB.Model(&models.SendingProfiles{}).Where("created_at BETWEEN ? AND ?", previousMonthStart, previousMonthEnd).Count(&previousCount).Error
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count previous month email templates"})
			return
		}

	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid type parameter."})
		return
	}

	// Hitung persentase pertumbuhan
	var growthPercentage float64
	var growthType string

	if previousCount == 0 {
		if currentCount > 0 {
			growthPercentage = 100.0 // 100% pertumbuhan dari 0
			growthType = "increase"
		} else {
			growthPercentage = 0.0
			growthType = "no_change"
		}
	} else {
		growthPercentage = ((float64(currentCount) - float64(previousCount)) / float64(previousCount)) * 100

		if growthPercentage > 0 {
			growthType = "increase"
		} else if growthPercentage < 0 {
			growthType = "decrease"
			growthPercentage = -growthPercentage // Buat positif untuk display
		} else {
			growthType = "no_change"
		}
	}

	response := GrowthResponse{
		CurrentMonth:     int(currentCount),
		PreviousMonth:    int(previousCount),
		GrowthPercentage: growthPercentage,
		GrowthType:       growthType,
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    response,
		"debug": gin.H{
			"current_month_count":  currentCount,
			"previous_month_count": previousCount,
			"current_start":        currentMonthStart,
			"current_end":          currentMonthEnd,
			"previous_start":       previousMonthStart,
			"previous_end":         previousMonthEnd,
		},
	})
}
