package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GET ALL DATA EMAIL TEMPLATE
func GetEmailTemplates(c *gin.Context) {
	query := config.DB.Table("email_templates").
		Select(`email_templates.*, 
            created_by_user.name AS created_by_name, 
            updated_by_user.name AS updated_by_name`).
		Joins(`LEFT JOIN users AS created_by_user ON created_by_user.id = email_templates.created_by`).
		Joins(`LEFT JOIN users AS updated_by_user ON updated_by_user.id = email_templates.updated_by`)

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

// SAVE NEW DATA EMAIL TEMPLATE
func RegisterEmailTemplate(c *gin.Context) {
	var input models.EmailTemplateInput

	// Bind dan validasi input JSON
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Validation failed",
			"message": err.Error(),
		})
		return
	}

	// CEK DUPLIKASI EMAIL TEMPLATE
	var existingEmailTemplate models.EmailTemplate
	if err := config.DB.
		Where("subject = ? AND envelope_sender = ?", input.Subject, input.EnvelopeSender).
		First(&existingEmailTemplate).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"error":   "Email Template already exists",
			"message": "Email Template with this Subject and Envelope Sender already registered",
		})
		return
	}

	// BUAT EMAIL TEMPLATE BARU
	newEmailTemplate := models.EmailTemplate{
		Name:           input.Name,
		EnvelopeSender: input.EnvelopeSender,
		Subject:        input.Subject,
		Body:           input.Body,
		TrackerImage:   input.TrackerImage,
		CreatedAt:      time.Now(),
		CreatedBy:      input.CreatedBy,
	}

	// SIMPAN KE DATABASE
	if err := config.DB.Create(&newEmailTemplate).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": "Failed to create email template",
		})
		return
	}

	// RESPONSE SUKSES
	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Email Template created successfully",
	})
}

// EDIT DATA EMAIL TEMPLATE
func UpdateEmailTemplate(c *gin.Context) {
	id := c.Param("id")

	var emailTemplate models.EmailTemplate
	if err := config.DB.First(&emailTemplate, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"Success": false,
			"Message": "Email template not found",
			"Error":   err.Error(),
		})
		return
	}

	var updatedData models.EmailTemplateUpdate

	if err := c.ShouldBindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Success": false,
			"Message": "Invalid request",
			"Error":   err.Error(),
		})
		return
	}

	emailTemplate.Name = updatedData.Name
	emailTemplate.EnvelopeSender = updatedData.EnvelopSender
	emailTemplate.Subject = updatedData.Subject
	emailTemplate.Body = updatedData.Body
	emailTemplate.TrackerImage = updatedData.TrackerImage
	emailTemplate.UpdatedBy = int(updatedData.UpdatedBy)
	emailTemplate.UpdatedAt = time.Now()

	if err := config.DB.Save(&emailTemplate).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to update email template",
			"Error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"Success": true,
		"Message": "Email template updated successfully",
		"Data":    emailTemplate,
	})
}

// DELETE DATA EMAIL TEMPLATE
func DeleteEmailTemplate(c *gin.Context) {
	emailTemplateID := c.Param("id")

	// VALIDATE EMAIL TEMPLATE ID
	id, err := strconv.ParseUint(emailTemplateID, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid Email Template ID format",
			"error":   "Email Template ID must be a valid number",
		})
		return
	}

	// CHECK IF EMAIL TEMPLATE THAT WANT TO BE DELETE EXIST
	var emailTemplateDelete models.EmailTemplate
	if err := config.DB.First(&emailTemplateDelete, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Email Template not found",
				"error":   "The specified user does not exist",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Database error",
			"error":   err.Error(),
		})
		return
	}

	// START DB TRANSACTION FOR SAFE DELETION
	tx := config.DB.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to start transaction",
			"error":   tx.Error.Error(),
		})
		return
	}

	// Hard Delete Email Template (permanently remove from database)
	if err := tx.Unscoped().Delete(&emailTemplateDelete).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete email template",
			"error":   err.Error(),
		})
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to commit transaction",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Email template deleted successfully",
		"data": gin.H{
			"deleted_user": gin.H{
				"id":            emailTemplateDelete.ID,
				"name":          emailTemplateDelete.Name,
				"envelopSender": emailTemplateDelete.EnvelopeSender,
				"subject":       emailTemplateDelete.Subject,
			},
		},
	})
}
