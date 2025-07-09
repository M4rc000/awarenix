package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func UpdateProfile(c *gin.Context) {
	var inputUpdateProfile models.UpdateProfileInput
	if err := c.ShouldBindJSON(&inputUpdateProfile); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": err.Error(),
			"data":    nil,
		})
		return
	}

	// 1. Cari user terlebih dahulu untuk memastikan user dengan ID tersebut ada
	var userToUpdate models.User
	if err := config.DB.First(&userToUpdate, inputUpdateProfile.ID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "User not found",
				"data":    nil,
			})
		}
		return
	}

	userToUpdate.Name = inputUpdateProfile.Name
	userToUpdate.Position = inputUpdateProfile.Position
	userToUpdate.Company = inputUpdateProfile.Company
	userToUpdate.Country = inputUpdateProfile.Country
	userToUpdate.UpdatedAt = time.Now()
	userToUpdate.UpdatedBy = inputUpdateProfile.UpdatedBy

	if err := config.DB.Save(&userToUpdate).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to update profile in database: " + err.Error(),
			"data":    nil,
		})
		return
	}

	// 4. Kirim respons sukses dengan data user yang sudah diperbarui
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Profile updated successfully",
		"data":    userToUpdate,
	})
}

func UpdatePhishSettings(c *gin.Context) {
	var payload models.UpdatePhishSettingPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid request payload",
			"error":   err.Error(),
		})
		return
	}

	userAny, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  "error",
			"message": "User not found in context (auth middleware issue)",
		})
		return
	}
	loggedInUser, ok := userAny.(*models.User)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  "error",
			"message": "Invalid user type in context",
		})
		return
	}
	loggedInUserID := loggedInUser.ID

	var setting models.PhishSettings
	// Mencari pengaturan yang terkait dengan userID yang sedang login
	result := config.DB.Where("user_id = ?", loggedInUserID).First(&setting)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			// Jika pengaturan untuk user ini belum ada, buat yang baru
			newSetting := models.PhishSettings{
				UserID:                 loggedInUserID,
				PhishingRedirectAction: payload.PhishingRedirectAction,
				CustomEducationURL:     "",
				CreatedAt:              time.Now(),
				CreatedBy:              int(loggedInUserID),
				UpdatedAt:              time.Now(),
				UpdatedBy:              int(loggedInUserID),
			}
			if err := config.DB.Create(&newSetting).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"status":  "error",
					"message": "Failed to create new educational settings",
					"error":   err.Error(),
				})
				return
			}
			c.JSON(http.StatusOK, gin.H{
				"status":  "success",
				"message": "Educational arrangements were successfully created",
				"data":    newSetting,
			})
			return
		}
		// Jika ada error lain selain ErrRecordNotFound
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to take educational settings",
			"error":   result.Error.Error(),
		})
		return
	}

	// Jika pengaturan sudah ada, perbarui
	setting.PhishingRedirectAction = payload.PhishingRedirectAction
	if payload.CustomEducationURL != nil {
		setting.CustomEducationURL = *payload.CustomEducationURL
	} else {
		setting.CustomEducationURL = ""
	}
	setting.UpdatedAt = time.Now()
	setting.UpdatedBy = int(loggedInUserID) // Menggunakan ID pengguna yang login

	if err := config.DB.Save(&setting).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to update education settings",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Education settings updated successfully",
		"data":    setting,
	})
}

func GetPhishSettings(c *gin.Context) {
	userAny, exists := c.Get("user") // Ambil dengan key "user"
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  "error",
			"message": "User not found in context (auth middleware issue)", // Pesan lebih jelas
		})
		return
	}
	loggedInUser, ok := userAny.(*models.User) // Type assertion ke *models.User
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  "error",
			"message": "Invalid user type in context",
		})
		return
	}
	loggedInUserID := loggedInUser.ID

	var setting models.PhishSettings
	result := config.DB.Where("user_id = ?", loggedInUserID).First(&setting)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusOK, gin.H{"status": "success", "message": "No education settings found for this user", "data": nil}) // Kembalikan null data jika tidak ditemukan
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to retrieve education settings", "error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Education settings retrieved successfully", "data": setting})
}
