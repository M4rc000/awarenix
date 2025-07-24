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

	// Membangun query: Select dulu, baru Where dan Find
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

func RegisterEmailTemplate(c *gin.Context) {
	var input models.EmailTemplateInput

	// Bind dan validasi input JSON
	if err := c.ShouldBindJSON(&input); err != nil {
		services.LogActivity(config.DB, c, "Create", moduleNameEmailTemplate, "", nil, input, "error", "Validation failed: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Validation failed",
			"data":    err.Error(),
		})
		return
	}

	// CEK DUPLIKASI EMAIL TEMPLATE
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

	// BUAT EMAIL TEMPLATE BARU
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

	// SIMPAN KE DATABASE
	if err := config.DB.Create(&newEmailTemplate).Error; err != nil {
		services.LogActivity(config.DB, c, "Create", moduleNameEmailTemplate, "", nil, newEmailTemplate, "error", "Failed to create email template: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to create email template",
			"data":    err.Error(),
		})
		return
	}

	// RESPONSE SUKSES
	services.LogActivity(config.DB, c, "Create", moduleNameEmailTemplate, strconv.FormatUint(uint64(newEmailTemplate.ID), 10), nil, newEmailTemplate, "success", "Email Template created successfully")
	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Email Template created successfully",
		"data":    newEmailTemplate,
	})
}

// EDIT
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

	// Convert IsSystemTemplate from int32 to int
	isSystemTemplateInt := int(updatedData.IsSystemTemplate)

	emailTemplate.Name = updatedData.Name
	emailTemplate.EnvelopeSender = updatedData.EnvelopSender
	emailTemplate.Subject = updatedData.Subject
	emailTemplate.Body = updatedData.Body
	emailTemplate.UpdatedBy = int(updatedData.UpdatedBy)
	emailTemplate.IsSystemTemplate = isSystemTemplateInt
	emailTemplate.UpdatedAt = time.Now()

	if err := config.DB.Save(&emailTemplate).Error; err != nil {
		services.LogActivity(config.DB, c, "Update", moduleNameEmailTemplate, idParam, oldEmailTemplate, emailTemplate, "error", "Failed to update email template: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to update email template",
			"data":    err.Error(),
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

	// VALIDATE EMAIL TEMPLATE ID
	id, err := strconv.ParseUint(emailTemplateIDParam, 10, 32)
	if err != nil {
		services.LogActivity(config.DB, c, "Delete", moduleNameEmailTemplate, emailTemplateIDParam, nil, nil, "failed", "Invalid Email Template ID format: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid Email Template ID format",
			"data":    "Email Template ID must be a valid number",
		})
		return
	}

	// CHECK IF EMAIL TEMPLATE THAT WANT TO BE DELETE EXIST
	var emailTemplateDelete models.EmailTemplate
	if err := config.DB.First(&emailTemplateDelete, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			services.LogActivity(config.DB, c, "Delete", moduleNameEmailTemplate, emailTemplateIDParam, nil, nil, "failed", "Email Template not found.")
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "Email Template not found",
				"data":    "The specified email template does not exist",
			})
			return
		}
		services.LogActivity(config.DB, c, "Delete", moduleNameEmailTemplate, emailTemplateIDParam, nil, nil, "failed", "Database error when retrieving email template: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Database error",
			"data":    err.Error(),
		})
		return
	}

	oldEmailTemplateData := emailTemplateDelete // Salin data lama untuk logging

	// START DB TRANSACTION FOR SAFE DELETION
	tx := config.DB.Begin()
	if tx.Error != nil {
		services.LogActivity(config.DB, c, "Delete", moduleNameEmailTemplate, emailTemplateIDParam, oldEmailTemplateData, nil, "failed", "Failed to start transaction: "+tx.Error.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to start transaction",
			"data":    tx.Error.Error(),
		})
		return
	}

	// Hard Delete Email Template (permanently remove from database)
	if err := tx.Unscoped().Delete(&emailTemplateDelete).Error; err != nil {
		tx.Rollback()
		services.LogActivity(config.DB, c, "Delete", moduleNameEmailTemplate, emailTemplateIDParam, oldEmailTemplateData, nil, "failed", "Failed to delete email template: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to delete email template",
			"data":    err.Error(),
		})
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		services.LogActivity(config.DB, c, "Delete", moduleNameEmailTemplate, emailTemplateIDParam, oldEmailTemplateData, nil, "failed", "Failed to commit transaction: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to commit transaction",
			"data":    err.Error(),
		})
		return
	}

	services.LogActivity(config.DB, c, "Delete", moduleNameEmailTemplate, emailTemplateIDParam, oldEmailTemplateData, nil, "success", "Email template deleted successfully")
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Email template deleted successfully",
		"data": gin.H{ // Mengembalikan data yang dihapus untuk konfirmasi
			"deleted_template": gin.H{
				"id":             emailTemplateDelete.ID,
				"name":           emailTemplateDelete.Name,
				"envelopeSender": emailTemplateDelete.EnvelopeSender,
				"subject":        emailTemplateDelete.Subject,
			},
		},
	})
}
