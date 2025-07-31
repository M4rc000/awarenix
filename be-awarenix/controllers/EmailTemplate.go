package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"be-awarenix/services"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const moduleNameEmailTemplate = "Email Template"

// GET ALL DATA EMAIL TEMPLATE
func GetEmailTemplates(c *gin.Context) {
	userIDScope, roleScope, errorStatus := services.GetRoleScope(c)
	if !errorStatus {
		return
	}

	var query *gorm.DB
	if roleScope == 1 {
		query = config.DB.Table("email_templates").
			Select(`email_templates.*, 
				created_by_user.name AS created_by_name, 
				updated_by_user.name AS updated_by_name`).
			Joins(`LEFT JOIN users AS created_by_user ON created_by_user.id = email_templates.created_by`).
			Joins(`LEFT JOIN users AS updated_by_user ON updated_by_user.id = email_templates.updated_by`)
	} else {
		query = config.DB.Table("email_templates").
			Select(`email_templates.*, 
				created_by_user.name AS created_by_name, 
				updated_by_user.name AS updated_by_name`).
			Joins(`LEFT JOIN users AS created_by_user ON created_by_user.id = email_templates.created_by`).
			Joins(`LEFT JOIN users AS updated_by_user ON updated_by_user.id = email_templates.updated_by`).Where("email_templates.created_by = ? OR email_templates.is_system_template = ?", userIDScope, 1)
	}

	var total int64
	query.Count(&total)

	var templates []models.EmailTemplateWithUsers
	if err := query.
		Scan(&templates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to fetch email templates",
			"Error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"Success": true,
		"Message": "Email templates retrieved successfully",
		"Data":    templates,
		"Total":   total,
	})
}

// GET ALL DEFAULT EMAIL TEMPLATES
func GetDefaultEmailTemplates(c *gin.Context) {
	var templates []models.DefaultEmailTemplate

	if err := config.DB.Model(&models.EmailTemplate{}).
		Select("name, body").
		Where("is_system_template = ?", 1).
		Find(&templates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to fetch system default email template",
			"error":   err.Error(),
		})
		return
	}

	if len(templates) == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "No default email templates found",
			"data":    []models.DefaultEmailTemplate{},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Default email template successfully retrieved",
		"data":    templates,
	})
}

func GetEmailTemplateByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Invalid ID format"})
		return
	}

	var emailTemplate models.EmailTemplate
	// Use Preload to load associated attachments
	if err := config.DB.Preload("Attachments").First(&emailTemplate, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Email template not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to retrieve email template", "error": err.Error()})
		return
	}

	log.Println("Email Template: ", emailTemplate)
	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Email template retrieved successfully", "data": emailTemplate})
}

// RegisterEmailTemplate handles the creation of a new email template.
func RegisterEmailTemplate(c *gin.Context) {
	var input models.EmailTemplateInput

	if err := c.ShouldBindJSON(&input); err != nil {
		services.LogActivity(config.DB, c, "Create", moduleNameEmailTemplate, "", nil, input, "error", "Validation failed: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Validation failed",
			"data":    err.Error(),
		})
		return
	}

	var existingEmailTemplate models.EmailTemplate
	if err := config.DB.
		Where("name = ? AND subject = ? AND envelope_sender = ? AND created_by = ?", input.Name, input.Subject, input.EnvelopeSender, input.CreatedBy).
		First(&existingEmailTemplate).Error; err == nil {
		services.LogActivity(config.DB, c, "Create", moduleNameEmailTemplate, "", nil, input, "error", "Email Template already exists with this Subject and Envelope Sender.")
		c.JSON(http.StatusConflict, gin.H{
			"status":  "error",
			"message": "Email Template with this Name, Subject and Envelope Sender already registered",
			"data":    nil,
		})
		return
	}

	newEmailTemplate := models.EmailTemplate{
		Name:             input.Name,
		EnvelopeSender:   input.EnvelopeSender,
		Subject:          input.Subject,
		Body:             input.Body,
		Language:         input.Language,
		IsSystemTemplate: input.IsSystemTemplate,
		CreatedAt:        time.Now(),
		CreatedBy:        input.CreatedBy,
	}

	tx := config.DB.Begin()
	if tx.Error != nil {
		services.LogActivity(config.DB, c, "Create", moduleNameEmailTemplate, "", nil, newEmailTemplate, "error", "Failed to start transaction: "+tx.Error.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to start transaction",
			"data":    tx.Error.Error(),
		})
		return
	}

	if err := tx.Create(&newEmailTemplate).Error; err != nil {
		tx.Rollback()
		services.LogActivity(config.DB, c, "Create", moduleNameEmailTemplate, "", nil, newEmailTemplate, "error", "Failed to create email template: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to create email template",
			"data":    err.Error(),
		})
		return
	}

	// Link attachments to the new email template
	if len(input.Attachments) > 0 {
		var attachmentIDs []uint
		for _, attachMeta := range input.Attachments {
			attachmentIDs = append(attachmentIDs, attachMeta.ID)
		}

		// Update the EmailTemplateID for the pre-uploaded attachments
		if err := tx.Model(&models.Attachment{}).
			Where("id IN (?)", attachmentIDs).
			Update("email_template_id", newEmailTemplate.ID).Error; err != nil {
			tx.Rollback()
			services.LogActivity(config.DB, c, "Create", moduleNameEmailTemplate, strconv.FormatUint(uint64(newEmailTemplate.ID), 10), nil, input, "error", "Failed to link attachments: "+err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Failed to link attachments to email template",
				"data":    err.Error(),
			})
			return
		}
	}

	if err := tx.Commit().Error; err != nil {
		services.LogActivity(config.DB, c, "Create", moduleNameEmailTemplate, strconv.FormatUint(uint64(newEmailTemplate.ID), 10), nil, newEmailTemplate, "error", "Failed to commit transaction: "+tx.Error.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to commit transaction",
			"data":    tx.Error.Error(),
		})
		return
	}

	services.LogActivity(config.DB, c, "Create", moduleNameEmailTemplate, strconv.FormatUint(uint64(newEmailTemplate.ID), 10), nil, newEmailTemplate, "success", "Email Template created successfully")
	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Email Template created successfully",
		"data":    newEmailTemplate,
	})
}

// UPDATE
func UpdateEmailTemplate(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		services.LogActivity(config.DB, c, "Update", moduleNameEmailTemplate, idParam, nil, nil, "failed", "Invalid Email Template ID format: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid Email Template ID format",
			"data":    err.Error(),
		})
		return
	}

	var emailTemplate models.EmailTemplate
	if err := config.DB.First(&emailTemplate, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			services.LogActivity(config.DB, c, "Update", moduleNameEmailTemplate, idParam, nil, nil, "failed", "Email template not found.")
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "Email template not found",
				"data":    nil,
			})
			return
		}
		services.LogActivity(config.DB, c, "Update", moduleNameEmailTemplate, idParam, nil, nil, "failed", "Failed to retrieve email template: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to retrieve email template",
			"data":    err.Error(),
		})
		return
	}

	oldEmailTemplate := emailTemplate

	var updatedData models.EmailTemplateUpdate

	if err := c.ShouldBindJSON(&updatedData); err != nil {
		services.LogActivity(config.DB, c, "Update", moduleNameEmailTemplate, idParam, oldEmailTemplate, updatedData, "error", "Invalid request payload: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid request",
			"data":    err.Error(),
		})
		return
	}

	tx := config.DB.Begin()
	if tx.Error != nil {
		services.LogActivity(config.DB, c, "Update", moduleNameEmailTemplate, idParam, oldEmailTemplate, updatedData, "error", "Failed to start transaction: "+tx.Error.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to start transaction",
			"data":    tx.Error.Error(),
		})
		return
	}

	// Update email template fields
	emailTemplate.Name = updatedData.Name
	emailTemplate.EnvelopeSender = updatedData.EnvelopSender
	emailTemplate.Subject = updatedData.Subject
	emailTemplate.Body = updatedData.Body
	emailTemplate.Language = updatedData.Language
	emailTemplate.IsSystemTemplate = int(updatedData.IsSystemTemplate)
	emailTemplate.UpdatedBy = int(updatedData.UpdatedBy)
	emailTemplate.UpdatedAt = time.Now()

	if err := tx.Save(&emailTemplate).Error; err != nil {
		tx.Rollback()
		services.LogActivity(config.DB, c, "Update", moduleNameEmailTemplate, idParam, oldEmailTemplate, emailTemplate, "error", "Failed to update email template: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to update email template",
			"data":    err.Error(),
		})
		return
	}

	// Handle existing attachments: If an attachment is no longer in updatedData.Attachments,
	// it means it was removed from the frontend. Detach it (set EmailTemplateID to NULL)
	// or soft delete it, depending on your business logic.
	// For simplicity, let's assume if an attachment is NOT sent in `updatedData.Attachments`,
	// it should be detached from this template.
	var currentAttachments []models.Attachment
	tx.Where("email_template_id = ?", emailTemplate.ID).Find(&currentAttachments)

	// Create a map for quick lookup of incoming attachment IDs
	incomingAttachmentMap := make(map[uint]bool)
	for _, attachMeta := range updatedData.Attachments {
		incomingAttachmentMap[attachMeta.ID] = true
	}

	for _, currentAttach := range currentAttachments {
		if _, exists := incomingAttachmentMap[currentAttach.ID]; !exists {
			// This attachment was previously linked but is no longer in the incoming list.
			// Detach it by setting EmailTemplateID to NULL.
			if err := tx.Model(&models.Attachment{}).Where("id = ?", currentAttach.ID).Update("email_template_id", nil).Error; err != nil {
				tx.Rollback()
				services.LogActivity(config.DB, c, "Update", moduleNameEmailTemplate, idParam, oldEmailTemplate, updatedData, "error", "Failed to detach old attachment: "+err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{
					"status":  "error",
					"message": "Failed to detach old attachment",
					"data":    err.Error(),
				})
				return
			}
		}
	}

	// Link new or remaining attachments to the email template
	if len(updatedData.Attachments) > 0 {
		var attachmentIDs []uint
		for _, attachMeta := range updatedData.Attachments {
			attachmentIDs = append(attachmentIDs, attachMeta.ID)
		}

		// Update the EmailTemplateID for the pre-uploaded attachments
		// Ensure attachments are not already linked to another template if that's a constraint
		if err := tx.Model(&models.Attachment{}).
			Where("id IN (?)", attachmentIDs).
			Update("email_template_id", emailTemplate.ID).Error; err != nil {
			tx.Rollback()
			services.LogActivity(config.DB, c, "Update", moduleNameEmailTemplate, idParam, oldEmailTemplate, updatedData, "error", "Failed to link new attachments: "+err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Failed to link new attachments to email template",
				"data":    err.Error(),
			})
			return
		}
	}

	if err := tx.Commit().Error; err != nil {
		services.LogActivity(config.DB, c, "Update", moduleNameEmailTemplate, idParam, oldEmailTemplate, emailTemplate, "error", "Failed to commit transaction: "+tx.Error.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to commit transaction",
			"data":    tx.Error.Error(),
		})
		return
	}

	services.LogActivity(config.DB, c, "Update", moduleNameEmailTemplate, idParam, oldEmailTemplate, emailTemplate, "success", "Email template updated successfully")
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Email template updated successfully",
		"data":    emailTemplate,
	})
}

// DELETE
func DeleteEmailTemplate(c *gin.Context) {
	emailTemplateIDParam := c.Param("id")

	// Parse ID template email dari parameter URL
	id, err := strconv.ParseUint(emailTemplateIDParam, 10, 32)
	if err != nil {
		// Log aktivitas untuk format ID yang tidak valid
		services.LogActivity(config.DB, c, "Delete", moduleNameEmailTemplate, emailTemplateIDParam, nil, nil, "failed", "Invalid Email Template ID format: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid Email Template ID format",
			"data":    "Email Template ID must be a valid number",
		})
		return
	}

	var emailTemplateDelete models.EmailTemplate
	// Ambil template email dengan lampirannya yang sudah dimuat sebelumnya
	if err := config.DB.Preload("Attachments").First(&emailTemplateDelete, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Log aktivitas jika template email tidak ditemukan
			services.LogActivity(config.DB, c, "Delete", moduleNameEmailTemplate, emailTemplateIDParam, nil, nil, "failed", "Email Template not found.")
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "Email Template not found",
				"data":    "The specified email template does not exist",
			})
			return
		}
		// Log aktivitas untuk error pengambilan database lainnya
		services.LogActivity(config.DB, c, "Delete", moduleNameEmailTemplate, emailTemplateIDParam, nil, nil, "failed", "Database error when retrieving email template: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Database error",
			"data":    err.Error(),
		})
		return
	}

	// Periksa apakah template email terkait dengan kampanye apa pun
	var campaignCount int64
	// Diasumsikan `models.Campaign` ada dan memiliki field `EmailTemplateID`
	if err := config.DB.Model(&models.Campaign{}).Where("email_template_id = ?", id).Count(&campaignCount).Error; err != nil {
		// Log aktivitas untuk error database selama pemeriksaan kampanye
		services.LogActivity(config.DB, c, "Delete", moduleNameEmailTemplate, emailTemplateIDParam, nil, nil, "failed", "Database error when checking for associated campaigns: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Database error",
			"data":    "Failed to check for associated campaigns: " + err.Error(),
		})
		return
	}

	// Jika kampanye ditemukan, cegah penghapusan dan kembalikan error konflik
	if campaignCount > 0 {
		// Log aktivitas untuk template yang sedang digunakan
		services.LogActivity(config.DB, c, "Delete", moduleNameEmailTemplate, emailTemplateIDParam, nil, nil, "failed", fmt.Sprintf("Email template is associated with %d campaign(s) and cannot be deleted.", campaignCount))
		c.JSON(http.StatusConflict, gin.H{
			"status":  "error",
			"message": "This email template is used in a campaign",
			"data":    fmt.Sprintf("Email template is currently associated with %d campaign(s) and cannot be deleted. Please disassociate or delete the campaigns first.", campaignCount),
		})
		return
	}

	oldEmailTemplateData := emailTemplateDelete // Simpan data lama untuk logging

	// Mulai transaksi database untuk memastikan atomisitas penghapusan
	tx := config.DB.Begin()
	if tx.Error != nil {
		// Log aktivitas jika transaksi gagal dimulai
		services.LogActivity(config.DB, c, "Delete", moduleNameEmailTemplate, emailTemplateIDParam, oldEmailTemplateData, nil, "failed", "Failed to start transaction: "+tx.Error.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to start transaction",
			"data":    tx.Error.Error(),
		})
		return
	}

	// 1. Hapus lampiran terkait (record dari DB dan file fisik)
	for _, attachment := range emailTemplateDelete.Attachments {
		// Coba hapus file fisik. Log peringatan jika gagal tetapi lanjutkan.
		if err := os.Remove(attachment.FilePath); err != nil {
			services.LogActivity(config.DB, c, "Delete", "Attachment", strconv.FormatUint(uint64(attachment.ID), 10), nil, nil, "warning", "Failed to delete physical attachment file: "+attachment.FilePath+" error: "+err.Error())
		}

		// Hapus permanen record lampiran dari database dalam transaksi
		if err := tx.Unscoped().Delete(&attachment).Error; err != nil {
			tx.Rollback() // Rollback transaksi jika terjadi error
			services.LogActivity(config.DB, c, "Delete", "Attachment", strconv.FormatUint(uint64(attachment.ID), 10), nil, nil, "error", "Failed to delete attachment record: "+err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Failed to delete attachment record",
				"data":    err.Error(),
			})
			return
		}
	}

	// 2. Hapus Permanen Template Email (hapus permanen dari database) dalam transaksi
	if err := tx.Unscoped().Delete(&emailTemplateDelete).Error; err != nil {
		tx.Rollback() // Rollback transaksi jika terjadi error
		services.LogActivity(config.DB, c, "Delete", moduleNameEmailTemplate, emailTemplateIDParam, oldEmailTemplateData, nil, "failed", "Failed to delete email template: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to delete email template",
			"data":    err.Error(),
		})
		return
	}

	// Commit transaksi jika semua penghapusan berhasil
	if err := tx.Commit().Error; err != nil {
		services.LogActivity(config.DB, c, "Delete", moduleNameEmailTemplate, emailTemplateIDParam, oldEmailTemplateData, nil, "failed", "Failed to commit transaction: "+tx.Error.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to commit transaction",
			"data":    tx.Error.Error(),
		})
		return
	}

	// Log aktivitas untuk penghapusan yang berhasil
	services.LogActivity(config.DB, c, "Delete", moduleNameEmailTemplate, emailTemplateIDParam, oldEmailTemplateData, nil, "success", "Email template deleted successfully")
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Email template deleted successfully",
		"data": gin.H{
			"id":             emailTemplateDelete.ID,
			"name":           emailTemplateDelete.Name,
			"envelopeSender": emailTemplateDelete.EnvelopeSender,
			"subject":        emailTemplateDelete.Subject,
		},
	})
}
