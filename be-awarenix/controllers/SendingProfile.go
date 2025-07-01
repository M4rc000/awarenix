package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"be-awarenix/services"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CREATE
func RegisterSendingProfile(c *gin.Context) {
	var input models.CreateSendingProfileRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Status":  "error",
			"Message": "Invalid request body: " + err.Error(),
			"Data":    nil,
		})
		return
	}

	// CHECK DUPLICATE
	var existingSendingProfiles models.SendingProfiles
	checkDuplicate := config.DB.Where("name = ?", input.Name).First(&existingSendingProfiles)
	if checkDuplicate.Error == nil {
		c.JSON(http.StatusConflict, gin.H{
			"status":  "error",
			"message": "Sending profile with this name already exists",
			"data":    nil,
		})
		return

	}

	// HASH PASSWORD
	passwordHash, errHash := services.HashPassword(input.Password)
	if errHash != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Status":  "error",
			"Message": "Failed to hash password: " + errHash.Error(),
			"Data":    nil,
		})
		return
	}

	sendingProfile := models.SendingProfiles{
		Name:          input.Name,
		InterfaceType: input.InterfaceType,
		SmtpFrom:      input.SmtpFrom,
		Host:          input.Host,
		Username:      input.Username,
		Password:      passwordHash,
		CreatedAt:     time.Now(),
		CreatedBy:     input.CreatedBy,
	}

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		// Buat SendingProfile terlebih dahulu untuk mendapatkan ID-nya
		if result := tx.Create(&sendingProfile); result.Error != nil {
			return result.Error
		}

		// Jika ada email headers, tambahkan dan kaitkan dengan SendingProfile yang baru dibuat
		if len(input.EmailHeaders) > 0 {
			for i := range input.EmailHeaders {
				input.EmailHeaders[i].SendingProfileID = sendingProfile.ID
				input.EmailHeaders[i].CreatedAt = time.Now()
				input.EmailHeaders[i].CreatedBy = sendingProfile.CreatedBy
				input.EmailHeaders[i].UpdatedAt = time.Now()
				input.EmailHeaders[i].UpdatedBy = sendingProfile.UpdatedBy
			}
			if result := tx.Create(&input.EmailHeaders); result.Error != nil {
				return result.Error
			}
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Status":  "error",
			"Message": "Failed to create sending profile and headers: " + err.Error(),
			"Data":    nil,
		})
		return
	}

	// Untuk respons, muat ulang relasi EmailHeaders
	// Pastikan sendingProfile di-preload sebelum dikirim sebagai respons
	config.DB.Preload("EmailHeaders").First(&sendingProfile, sendingProfile.ID)

	c.JSON(http.StatusCreated, gin.H{
		"Status":  "success",
		"Message": "Sending profile created successfully",
		"Data":    sendingProfile,
	})
}

// READ
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

// DETAIL
func GetEmailHeaderDetail(c *gin.Context) {
	idParam := c.Param("id")
	sendingProfileID, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid Sending Profile ID format",
			"data":    nil,
		})
		return
	}

	var emailHeaders []models.EmailHeader
	// Cari semua EmailHeader yang memiliki SendingProfileID yang cocok
	if result := config.DB.Where("sending_profile_id = ?", sendingProfileID).Find(&emailHeaders); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "Email headers not found for the given Sending Profile ID",
				"data":    nil,
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Failed to fetch email headers: " + result.Error.Error(),
				"data":    nil,
			})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Email headers retrieved successfully",
		"data":    emailHeaders,
	})
}

// UPDATE
func UpdateSendingProfile(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "ID parameter is required",
			"data":    nil,
		})
		return
	}

	var requestBody models.UpdateSendingProfileRequest
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": err.Error(),
			"data":    nil,
		})
		return
	}

	var sendingProfile models.SendingProfiles

	result := config.DB.First(&sendingProfile, idStr)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "Sending profile not found",
				"data":    nil,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to retrieve sending profile",
			"data":    nil,
		})
		return
	}

	// UPDATE DATA
	updates := make(map[string]interface{})
	updates["name"] = requestBody.Name
	updates["interface_type"] = requestBody.InterfaceType
	updates["smtp_from"] = requestBody.SmtpFrom
	updates["host"] = requestBody.Host
	updates["username"] = requestBody.Username
	updates["updated_at"] = time.Now()

	// Logika update password: hanya update jika password baru diberikan
	if requestBody.Password != "" {
		newPassword, _ := services.HashPassword(requestBody.Password)
		updates["password"] = newPassword
	}

	// Lakukan update di database
	if result := config.DB.Model(&sendingProfile).Updates(updates); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to update sending profile",
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Sending profile updated successfully",
		"data":    sendingProfile,
	})
}

// UPDATE EMAIL HEADERS
func UpdateEmailHeadersForProfile(c *gin.Context) {
	profileIDStr := c.Param("id")
	profileID, err := strconv.ParseUint(profileIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Invalid profile ID", "data": nil})
		return
	}

	var newHeaders []models.EmailHeader
	if err := c.ShouldBindJSON(&newHeaders); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error(), "data": nil})
		return
	}

	// Hapus semua header lama untuk profile ini
	if err := config.DB.Where("sending_profile_id = ?", profileID).Delete(&models.EmailHeader{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to clear old headers", "data": nil})
		return
	}

	// Tambahkan header baru
	for i := range newHeaders {
		newHeaders[i].SendingProfileID = uint(profileID)
	}
	if err := config.DB.Create(&newHeaders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to add new headers", "data": nil})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Email headers updated successfully", "data": newHeaders})
}

// DELETE
func DeleteSendingProfile(c *gin.Context) {
	sendingProfileIDStr := c.Param("id")

	// VALIDATE Sending Profile ID
	sendingProfileID, err := strconv.ParseUint(sendingProfileIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid Sending Profile ID format. ID must be a valid number.",
			"data":    nil,
		})
		return
	}

	err = config.DB.Transaction(func(tx *gorm.DB) error {
		// 1. Hapus Email Headers terkait terlebih dahulu
		if result := tx.Unscoped().Where("sending_profile_id = ?", sendingProfileID).Delete(&models.EmailHeader{}); result.Error != nil {
			return result.Error
		}

		// 2. Hapus Sending Profile
		var sendingProfileToDelete models.SendingProfiles
		if result := tx.Unscoped().First(&sendingProfileToDelete, sendingProfileID); result.Error != nil {
			return result.Error
		}

		if result := tx.Unscoped().Delete(&sendingProfileToDelete); result.Error != nil {
			return result.Error
		}
		return nil
	})

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "Sending Profile not found. The specified profile does not exist.",
				"data":    nil,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to delete sending profile and its associated headers: " + err.Error(),
			"data":    nil,
		})
		return
	}

	// SUCCESS RESPONSE
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Sending profile and associated headers deleted successfully.",
		"data": gin.H{
			"deleted_id": sendingProfileID,
		},
	})
}
