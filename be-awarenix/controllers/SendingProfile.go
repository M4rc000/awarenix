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

const moduleNameSendingProfile = "Sending Profile"

// CREATE
func RegisterSendingProfile(c *gin.Context) {
	var input models.CreateSendingProfileRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		services.LogActivity(config.DB, c, "Create", moduleNameSendingProfile, "", nil, input, "failed", "Invalid request body: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid request body: " + err.Error(),
			"data":    nil,
		})
		return
	}

	// CHECK DUPLICATE
	var existingSendingProfiles models.SendingProfiles
	checkDuplicate := config.DB.Where("name = ?", input.Name).First(&existingSendingProfiles)
	if checkDuplicate.Error == nil {
		services.LogActivity(config.DB, c, "Create", moduleNameSendingProfile, "", nil, input, "failed", "Sending profile with this name already exists.")
		c.JSON(http.StatusConflict, gin.H{
			"status":  "error",
			"message": "Sending profile with this name already exists",
			"data":    nil,
		})
		return
	}

	sendingProfile := models.SendingProfiles{
		Name:          input.Name,
		InterfaceType: input.InterfaceType,
		SmtpFrom:      input.SmtpFrom,
		Host:          input.Host,
		Username:      input.Username,
		Password:      input.Password,
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
		services.LogActivity(config.DB, c, "Create", moduleNameSendingProfile, "", nil, sendingProfile, "failed", "Failed to create sending profile and headers: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to create sending profile and headers: " + err.Error(),
			"data":    nil,
		})
		return
	}

	// Untuk respons, muat ulang relasi EmailHeaders
	// Pastikan sendingProfile di-preload sebelum dikirim sebagai respons
	config.DB.Preload("EmailHeaders").First(&sendingProfile, sendingProfile.ID)

	services.LogActivity(config.DB, c, "Create", moduleNameSendingProfile, strconv.FormatUint(uint64(sendingProfile.ID), 10), nil, sendingProfile, "success", "Sending profile created successfully")
	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Sending profile created successfully",
		"data":    sendingProfile,
	})
}

// READ
func GetSendingProfiles(c *gin.Context) {
	userIDScope, roleScope, errorStatus := services.GetRoleScope(c)
	if !errorStatus {
		return
	}

	var query *gorm.DB
	if roleScope == 1 {
		query = config.DB.Table("sending_profiles").
			Select(`sending_profiles.*, 
				created_by_user.name AS created_by_name, 
				updated_by_user.name AS updated_by_name`).
			Joins(`LEFT JOIN users AS created_by_user ON created_by_user.id = sending_profiles.created_by`).
			Joins(`LEFT JOIN users AS updated_by_user ON updated_by_user.id = sending_profiles.updated_by`)
	} else {
		query = config.DB.Table("sending_profiles").
			Select(`sending_profiles.*, 
				created_by_user.name AS created_by_name, 
				updated_by_user.name AS updated_by_name`).
			Joins(`LEFT JOIN users AS created_by_user ON created_by_user.id = sending_profiles.created_by`).
			Joins(`LEFT JOIN users AS updated_by_user ON updated_by_user.id = sending_profiles.updated_by`).Where("sending_profiles.created_by = ?", userIDScope)
	}

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

func UpdateSendingProfile(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		services.LogActivity(config.DB, c, "Update", moduleNameSendingProfile, "", nil, nil, "failed", "ID parameter is required for update.")
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "ID parameter is required",
			"data":    nil,
		})
		return
	}

	var requestBody models.UpdateSendingProfileRequest
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		services.LogActivity(config.DB, c, "Update", moduleNameSendingProfile, idStr, nil, requestBody, "failed", "Invalid request payload: "+err.Error())
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
			services.LogActivity(config.DB, c, "Update", moduleNameSendingProfile, idStr, nil, requestBody, "failed", "Sending profile not found.")
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "Sending profile not found",
				"data":    nil,
			})
			return
		}
		services.LogActivity(config.DB, c, "Update", moduleNameSendingProfile, idStr, nil, requestBody, "failed", "Failed to retrieve sending profile: "+result.Error.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to retrieve sending profile",
			"data":    nil,
		})
		return
	}

	oldSendingProfile := sendingProfile // Salin data lama untuk logging

	// UPDATE DATA
	updates := make(map[string]interface{})
	updates["name"] = requestBody.Name
	updates["interface_type"] = requestBody.InterfaceType
	updates["smtp_from"] = requestBody.SmtpFrom
	updates["host"] = requestBody.Host
	updates["username"] = requestBody.Username
	updates["updated_at"] = time.Now()
	updates["updated_by"] = requestBody.UpdatedBy

	// Logika update password: hanya update jika password baru diberikan
	if requestBody.Password != "" {
		updates["password"] = requestBody.Password
	}

	// Lakukan update di database
	if result := config.DB.Model(&sendingProfile).Updates(updates); result.Error != nil {
		services.LogActivity(config.DB, c, "Update", moduleNameSendingProfile, idStr, oldSendingProfile, updates, "failed", "Failed to update sending profile details: "+result.Error.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to update sending profile",
			"data":    nil,
		})
		return
	}

	// Muat ulang sendingProfile untuk mendapatkan data terbaru setelah update
	config.DB.First(&sendingProfile, idStr)

	services.LogActivity(config.DB, c, "Update", moduleNameSendingProfile, idStr, oldSendingProfile, sendingProfile, "success", "Sending profile updated successfully")
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Sending profile updated successfully",
		"data":    sendingProfile,
	})
}

// UPDATE
func UpdateEmailHeadersForProfile(c *gin.Context) {
	profileIDStr := c.Param("id")
	profileID, err := strconv.ParseUint(profileIDStr, 10, 32)
	if err != nil {
		services.LogActivity(config.DB, c, "Update", moduleNameSendingProfile, profileIDStr, nil, nil, "failed", "Invalid profile ID format: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Invalid profile ID", "data": nil})
		return
	}

	var newHeaders []models.EmailHeader
	if err := c.ShouldBindJSON(&newHeaders); err != nil {
		services.LogActivity(config.DB, c, "Update", moduleNameSendingProfile, profileIDStr, nil, newHeaders, "failed", "Invalid request payload: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error(), "data": nil})
		return
	}

	var oldHeaders []models.EmailHeader
	config.DB.Where("sending_profile_id = ?", profileID).Find(&oldHeaders) // Ambil header lama untuk logging

	// Hapus semua header lama untuk profile ini
	if err := config.DB.Where("sending_profile_id = ?", profileID).Delete(&models.EmailHeader{}).Error; err != nil {
		services.LogActivity(config.DB, c, "Update", moduleNameSendingProfile, profileIDStr, oldHeaders, newHeaders, "failed", "Failed to clear old headers: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to clear old headers", "data": nil})
		return
	}

	// Tambahkan header baru
	if len(newHeaders) > 0 { // <-- Tambahkan cek ini
		for i := range newHeaders {
			newHeaders[i].SendingProfileID = uint(profileID)
			newHeaders[i].CreatedAt = time.Now()
			newHeaders[i].UpdatedAt = time.Now()
			// Jika UpdatedBy tidak disediakan di input, gunakan CreatedBy dari SendingProfile atau default
			// newHeaders[i].UpdatedBy = someUserDefinedID // Perlu diisi jika ada
		}
		if err := config.DB.Create(&newHeaders).Error; err != nil {
			services.LogActivity(config.DB, c, "Update", moduleNameSendingProfile, profileIDStr, oldHeaders, newHeaders, "failed", "Failed to add new headers: "+err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to add new headers: " + err.Error(), "data": nil})
			return
		}
	}

	services.LogActivity(config.DB, c, "Update", moduleNameSendingProfile, profileIDStr, oldHeaders, newHeaders, "success", "Email headers updated successfully")
	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Email headers updated successfully", "data": newHeaders})
}

// DELETE
func DeleteSendingProfile(c *gin.Context) {
	sendingProfileIDStr := c.Param("id")

	// VALIDATE Sending Profile ID
	sendingProfileID, err := strconv.ParseUint(sendingProfileIDStr, 10, 32)
	if err != nil {
		services.LogActivity(config.DB, c, "Delete", moduleNameSendingProfile, sendingProfileIDStr, nil, nil, "failed", "Invalid Sending Profile ID format: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid Sending Profile ID format. ID must be a valid number.",
			"data":    nil,
		})
		return
	}

	var sendingProfileToDelete models.SendingProfiles
	// Ambil data sending profile dan headers terkait sebelum dihapus untuk logging
	if err := config.DB.Preload("EmailHeaders").First(&sendingProfileToDelete, sendingProfileID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			services.LogActivity(config.DB, c, "Delete", moduleNameSendingProfile, sendingProfileIDStr, nil, nil, "failed", "Sending Profile not found for deletion.")
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "Sending Profile not found. The specified profile does not exist.",
				"data":    nil,
			})
			return
		}
		services.LogActivity(config.DB, c, "Delete", moduleNameSendingProfile, sendingProfileIDStr, nil, nil, "failed", "Failed to retrieve sending profile for deletion: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to retrieve sending profile for deletion.",
			"data":    nil,
		})
		return
	}

	oldSendingProfileData := sendingProfileToDelete // Salin data lama untuk logging

	err = config.DB.Transaction(func(tx *gorm.DB) error {
		// 1. Hapus Email Headers terkait terlebih dahulu
		if result := tx.Unscoped().Where("sending_profile_id = ?", sendingProfileID).Delete(&models.EmailHeader{}); result.Error != nil {
			return result.Error
		}

		// 2. Hapus Sending Profile
		if result := tx.Unscoped().Delete(&sendingProfileToDelete); result.Error != nil {
			return result.Error
		}
		return nil
	})

	if err != nil {
		services.LogActivity(config.DB, c, "Delete", moduleNameSendingProfile, sendingProfileIDStr, oldSendingProfileData, nil, "failed", "Failed to delete sending profile and its associated headers: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to delete sending profile and its associated headers: " + err.Error(),
			"data":    nil,
		})
		return
	}

	// SUCCESS RESPONSE
	services.LogActivity(config.DB, c, "Delete", moduleNameSendingProfile, sendingProfileIDStr, oldSendingProfileData, nil, "success", "Sending profile and associated headers deleted successfully.")
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Sending profile and associated headers deleted successfully.",
		"data": gin.H{
			"deleted_id": sendingProfileID,
		},
	})
}

// SEND TEST EMAIL
func SendTestEmail(c *gin.Context) {
	var req models.SendTestEmailRequest
	var existingSendingProfiles models.SendingProfiles

	// Log activity for initial request binding
	if err := c.ShouldBindJSON(&req); err != nil {
		services.LogActivity(config.DB, c, "Send Test Email", moduleNameSendingProfile, "", nil, req, "failed", "Invalid request body: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": err.Error(),
			"data":    nil,
		})
		return
	}

	// If password is not provided in request, retrieve it from existing profile
	if req.SendingProfile.Password == "" {
		result := config.DB.Where("id = ?", req.SendingProfile.ID).First(&existingSendingProfiles)
		if result.Error != nil {
			logMessage := "Sending profile not found for test email: " + result.Error.Error()
			services.LogActivity(config.DB, c, "Send Test Email", moduleNameSendingProfile, strconv.FormatUint(uint64(req.SendingProfile.ID), 10), nil, req, "failed", logMessage)
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "Sending profile not found",
				"data":    nil,
			})
			return
		}
		req.SendingProfile.Password = existingSendingProfiles.Password
	}

	sendingProfile := models.SendingProfiles{
		Name:          req.SendingProfile.Name,
		InterfaceType: req.SendingProfile.InterfaceType,
		SmtpFrom:      req.SendingProfile.SmtpFrom,
		Username:      req.SendingProfile.Username,
		Password:      req.SendingProfile.Password,
		Host:          req.SendingProfile.Host,
		EmailHeaders:  req.SendingProfile.EmailHeaders,
	}

	// Call the service to send the email
	err := services.SendTestEmail(
		&sendingProfile,
		req.Recipient.Email,
		req.EmailBody,
		"Test Email from Awarenix",
	)

	if err != nil {
		logMessage := "Failed to send test email: " + err.Error()
		services.LogActivity(config.DB, c, "Send Test Email", moduleNameSendingProfile, strconv.FormatUint(uint64(req.SendingProfile.ID), 10), req, nil, "failed", logMessage)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": logMessage,
			"data":    nil,
		})
		return
	}

	// Log activity for successful test email send
	services.LogActivity(config.DB, c, "Send Test Email", moduleNameSendingProfile, strconv.FormatUint(uint64(req.SendingProfile.ID), 10), req, nil, "success", "Test email sent successfully to "+req.Recipient.Email)
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Test email sent successfully!",
		"data":    nil,
	})
}
