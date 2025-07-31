package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"be-awarenix/services"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UploadAttachment handles the file upload and saves its metadata to the database.
func UploadAttachment(c *gin.Context) {
	var attachmentsStoragePath = os.Getenv("UPLOAD_ATTACHMENT")
	log.Println("attachmentsStoragePath: ", attachmentsStoragePath)
	// Parse multipart form data
	file, err := c.FormFile("attachment") // "attachment" is the field name from frontend FormData
	if err != nil {
		services.LogActivity(config.DB, c, "Upload Attachments", "Email Template", "", nil, nil, "error", "Failed to get file from form: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Failed to get file from form",
			"error":   err.Error(),
		})
		return
	}

	// Create the attachments directory if it doesn't exist
	if _, err := os.Stat(attachmentsStoragePath); os.IsNotExist(err) {
		err = os.MkdirAll(attachmentsStoragePath, 0755) // 0755 for read/write/execute for owner, read/execute for others
		if err != nil {
			services.LogActivity(config.DB, c, "Upload Attachment", "Email Template", "", nil, nil, "error", "Failed to create storage directory: "+err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Failed to create storage directory",
				"error":   err.Error(),
			})
			return
		}
	}

	// Generate a unique filename to prevent conflicts
	fileExtension := filepath.Ext(file.Filename)
	uniqueFilename := uuid.New().String() + fileExtension
	filePath := filepath.Join(attachmentsStoragePath, uniqueFilename)

	// Save the file to disk
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		services.LogActivity(config.DB, c, "Upload Attachment", "Email Template", "", nil, nil, "error", "Failed to save file: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to save file",
			"error":   err.Error(),
		})
		return
	}

	// Get file size and MIME type
	fileInfo, err := os.Stat(filePath)
	if err != nil {
		services.LogActivity(config.DB, c, "Upload Attachment", "Email Template", "", nil, nil, "error", "Failed to get file info: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to get file info after saving",
			"error":   err.Error(),
		})
		return
	}
	fileSize := fileInfo.Size()
	mimeType := file.Header.Get("Content-Type")

	// Create attachment record in database
	newAttachment := models.Attachment{
		OriginalFilename: file.Filename,
		StoredFilename:   uniqueFilename,
		FilePath:         filePath,
		FileSize:         fileSize,
		MimeType:         mimeType,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	if err := config.DB.Create(&newAttachment).Error; err != nil {
		// If DB creation fails, attempt to delete the uploaded file to prevent orphans
		os.Remove(filePath)
		services.LogActivity(config.DB, c, "Upload Attachment", "Email Template", "", nil, nil, "error", "Failed to save attachment metadata: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to save attachment metadata",
			"error":   err.Error(),
		})
		return
	}

	services.LogActivity(config.DB, c, "Upload Attachment", "Email Template", strconv.FormatUint(uint64(newAttachment.ID), 10), nil, newAttachment, "success", "Attachment uploaded successfully")
	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Attachment uploaded successfully",
		"data": models.AttachmentResponse{
			ID:               newAttachment.ID,
			OriginalFilename: newAttachment.OriginalFilename,
			StoredFilename:   newAttachment.StoredFilename,
			FilePath:         newAttachment.FilePath,
			FileSize:         newAttachment.FileSize,
			MimeType:         newAttachment.MimeType,
		},
	})
}

// DownloadAttachment serves the attachment file for download.
func DownloadAttachment(c *gin.Context) {
	attachmentID := c.Param("id")
	id, err := strconv.ParseUint(attachmentID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid attachment ID format",
		})
		return
	}

	var attachment models.Attachment
	if err := config.DB.First(&attachment, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "Attachment not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to retrieve attachment from database",
			"error":   err.Error(),
		})
		return
	}

	// Check if file exists
	if _, err := os.Stat(attachment.FilePath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "File not found on server storage",
		})
		return
	}

	// Set headers for file download
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", attachment.OriginalFilename))
	c.Header("Content-Type", attachment.MimeType)
	c.File(attachment.FilePath)
}

// DeleteAttachment handles the deletion of an attachment record and its physical file.
func DeleteAttachment(c *gin.Context) {
	attachmentID := c.Param("id")
	id, err := strconv.ParseUint(attachmentID, 10, 64)
	if err != nil {
		services.LogActivity(config.DB, c, "Delete Attachment", "Email Template", attachmentID, nil, nil, "failed", "Invalid attachment ID format: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid attachment ID format",
		})
		return
	}

	var attachment models.Attachment
	if err := config.DB.First(&attachment, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			services.LogActivity(config.DB, c, "Delete Attachment", "Email Template", attachmentID, nil, nil, "failed", "Attachment not found.")
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "Attachment not found",
			})
			return
		}
		services.LogActivity(config.DB, c, "Delete Attachment", "Email Template", attachmentID, nil, nil, "failed", "Failed to retrieve attachment: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to retrieve attachment",
			"error":   err.Error(),
		})
		return
	}

	// Start a database transaction
	tx := config.DB.Begin()
	if tx.Error != nil {
		services.LogActivity(config.DB, c, "Delete Attachment", "Email Template", attachmentID, nil, nil, "failed", "Failed to start transaction: "+tx.Error.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to start transaction",
			"error":   tx.Error.Error(),
		})
		return
	}

	// Delete the database record (soft delete due to gorm.DeletedAt)
	if err := tx.Delete(&attachment).Error; err != nil {
		tx.Rollback()
		services.LogActivity(config.DB, c, "Delete Attachment", "Email Template", attachmentID, nil, nil, "failed", "Failed to delete attachment record: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to delete attachment record",
			"error":   err.Error(),
		})
		return
	}

	// Attempt to delete the physical file
	if err := os.Remove(attachment.FilePath); err != nil {
		// Log the error but don't rollback the DB transaction, as the DB record is already soft-deleted.
		// You might want a more robust cleanup mechanism for orphaned files.
		services.LogActivity(config.DB, c, "Delete Attachment", "Email Template", attachmentID, nil, nil, "warning", "Failed to delete physical file, but DB record deleted: "+err.Error())
		fmt.Printf("Warning: Could not delete physical file %s: %v\n", attachment.FilePath, err)
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		services.LogActivity(config.DB, c, "Delete Attachment", "Email Template", attachmentID, nil, nil, "failed", "Failed to commit transaction: "+tx.Error.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to commit transaction",
			"error":   tx.Error.Error(),
		})
		return
	}

	services.LogActivity(config.DB, c, "Delete Attachment", "Email Template", attachmentID, nil, nil, "success", "Attachment deleted successfully")
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Attachment deleted successfully",
		"data":    gin.H{"id": id},
	})
}
