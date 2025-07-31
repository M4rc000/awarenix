package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"be-awarenix/services"
	"fmt"
	"log"
	"net/http"
	"net/url" // Import net/url for URL parsing
	"os"
	"path/filepath"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Define attachmentsStoragePath consistently
const attachmentsStoragePath = "./uploads/attachments"

// HandleOpenTracker handles tracking of email open events.
func HandleOpenTracker(c *gin.Context) {
	rid := c.Query("rid")
	campaignIDStr := c.Query("campaign")
	campaignID, err := strconv.ParseUint(campaignIDStr, 10, 64)
	if err != nil {
		log.Printf("ERROR: Invalid campaign ID format for open tracker: %s", campaignIDStr)
		c.Status(http.StatusBadRequest)
		return
	}

	// Log the event using the service function
	services.LogEventByRID(c, rid, string(models.Opened), "", uint(campaignID))

	// Response logic for Opened event
	c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
	c.File("pixel.gif") // Serve a transparent pixel
}

// HandleClickTracker handles tracking of link click events.
func HandleClickTracker(c *gin.Context) {
	rid := c.Query("rid")
	campaignIDStr := c.Query("campaign")
	campaignID, err := strconv.ParseUint(campaignIDStr, 10, 64)
	if err != nil {
		log.Printf("ERROR: Invalid campaign ID format for click tracker: %s", campaignIDStr)
		c.Status(http.StatusBadRequest)
		return
	}
	target, _ := url.QueryUnescape(c.Query("url")) // Get target URL from query parameter

	// Log the event using the service function
	services.LogEventByRID(c, rid, string(models.Clicked), "", uint(campaignID))

	// Response logic for Clicked event
	c.Redirect(http.StatusFound, target) // Redirect to target URL
}

func HandleSubmitTracker(c *gin.Context) {
	rid := c.Query("rid")
	campaignIDStr := c.Query("campaign")

	if rid == "" || campaignIDStr == "" {
		log.Printf("ERROR: Missing 'rid' or 'campaign' parameters for submit tracker")
		c.Status(http.StatusBadRequest)
		return
	}

	campaignID, err := strconv.ParseUint(campaignIDStr, 10, 64)
	if err != nil {
		log.Printf("ERROR: Invalid campaign ID format for submit tracker: %s", campaignIDStr)
		c.Status(http.StatusBadRequest)
		return
	}

	// Tangani data yang dikirim dari formulir
	var formData models.SubmitCampaign
	if err := c.ShouldBind(&formData); err != nil {
		log.Printf("ERROR: Failed to bind form data for rid %s: %v", rid, err)
		c.Status(http.StatusBadRequest)
		return
	}

	services.LogEventByRID(c, rid, string(models.Submitted), "", uint(campaignID))

	// Log event dan simpan data formulir menggunakan service function baru
	err = services.LogSubmitEvent(rid, uint(campaignID), formData)
	if err != nil {
		log.Printf("ERROR: Failed to log submit event for rid %s: %v", rid, err)
		c.Status(http.StatusInternalServerError)
		return
	}

	// Redirect setelah berhasil
	frontendDomain := os.Getenv("FRONTEND_URL")
	if frontendDomain == "" {
		frontendDomain = "localhost:5173"
	}
	c.Redirect(http.StatusFound, fmt.Sprintf("http://%s", frontendDomain))
}

// HandleReportTracker handles tracking of email report events.
func HandleReportTracker(c *gin.Context) {
	rid := c.Query("rid")

	// 1. Cari Recipient
	var rec models.Recipient
	if err := config.DB.Where("uid = ?", rid).First(&rec).Error; err != nil {
		log.Printf("WARNING: Recipient not found for report tracker: %s", rid)
		c.Status(http.StatusBadRequest)
		return
	}

	// 2. Cari Campaign dan pre-load EmailTemplate
	var camp models.Campaign
	if err := config.DB.Preload("EmailTemplate").Where("id = ?", rec.CampaignID).First(&camp).Error; err != nil {
		log.Printf("WARNING: Campaign or EmailTemplate not found for report tracker (CampaignID: %d): %v", rec.CampaignID, err)
		c.Status(http.StatusBadRequest)
		return
	}

	// 3. Ambil bahasa dari EmailTemplate
	campaignLanguage := camp.EmailTemplate.Language
	if campaignLanguage == "" {
		campaignLanguage = "English" // Fallback ke bahasa default jika tidak ada bahasa yang disetel di template
	} else if campaignLanguage == "indonesia" {
		campaignLanguage = "ID" // Sesuaikan jika Anda ingin "ID" bukan "Indonesia"
	}

	// Log the event using the service function
	services.LogEventByRID(c, rid, string(models.Reported), campaignLanguage, camp.ID)

	// Response logic for Reported event
	frontendDomain := os.Getenv("FRONTEND_URL") // Get frontend URL from env
	if frontendDomain == "" {
		frontendDomain = "localhost:5173" // Fallback
	}
	c.Redirect(http.StatusFound, fmt.Sprintf("http://%s/report-thanks?lang=%s", frontendDomain, campaignLanguage)) // Redirect to report thanks page
}

// HandleAttachmentOpenTracker handles tracking of attachment open events and serves the file.
func HandleAttachmentOpenTracker(c *gin.Context) {
	rid := c.Query("rid")
	campaignIDStr := c.Query("campaign")
	attachmentIDStr := c.Param("id") // Assuming attachment ID is part of the URL path (e.g., /track/attachment/open/:id)

	campaignID, err := strconv.ParseUint(campaignIDStr, 10, 64)
	if err != nil {
		log.Printf("ERROR: Invalid campaign ID format for attachment open tracker: %s", campaignIDStr)
		c.Status(http.StatusBadRequest)
		return
	}
	attachmentID, err := strconv.ParseUint(attachmentIDStr, 10, 64)
	if err != nil {
		log.Printf("ERROR: Invalid attachment ID format for attachment open tracker: %s", attachmentIDStr)
		c.Status(http.StatusBadRequest)
		return
	}

	// 1. Log event “attachment_opened”
	var rec models.Recipient
	if err := config.DB.Where("uid = ?", rid).First(&rec).Error; err != nil {
		log.Printf("WARNING: Recipient not found for attachment open tracker (RID: %s)", rid)
		c.Status(http.StatusBadRequest)
		return
	}

	// Log the event using the service function
	services.LogEventByRID(c, rid, string(models.AttachmentOpened), "", uint(campaignID))

	// 2. Retrieve attachment details from DB using attachmentID
	var attachment models.Attachment
	if err := config.DB.First(&attachment, attachmentID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Printf("WARNING: Attachment not found in DB for ID: %d", attachmentID)
			c.Status(http.StatusNotFound)
			return
		}
		log.Printf("ERROR: Failed to retrieve attachment from DB for ID: %d: %v", attachmentID, err)
		c.Status(http.StatusInternalServerError)
		return
	}

	// 3. Serve the file after logging
	storagePath := os.Getenv("UPLOAD_ATTACHMENT")
	if storagePath == "" {
		log.Printf("ERROR: UPLOAD_ATTACHMENT environment variable not set for serving attachment %s", attachment.OriginalFilename)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Server configuration error: Attachment storage path not set.",
		})
		return
	}
	fullFilePath := filepath.Join(storagePath, attachment.StoredFilename)

	if _, err := os.Stat(fullFilePath); os.IsNotExist(err) {
		log.Printf("WARNING: Physical attachment file not found on server for %s (path: %s)", attachment.OriginalFilename, fullFilePath)
		c.Status(http.StatusNotFound)
		return
	}

	// Set headers for file download and serve the file
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", attachment.OriginalFilename))
	c.Header("Content-Type", attachment.MimeType)
	c.File(fullFilePath)
}

// TrackAttachment handles tracking of attachment clicks and serving the file.
// Note: This function name might be confusing as it handles "clicks" but also serves the file.
// Consider renaming to something like HandleAttachmentDownloadTracker or similar if "clicked" is not the primary event.
// For now, I'll keep the name as is but ensure it logs AttachmentClicked.
func TrackAttachment(c *gin.Context) {
	rid := c.Query("rid")
	campaignIDStr := c.Query("campaign")
	attachmentIDStr := c.Param("id")

	campaignID, err := strconv.ParseUint(campaignIDStr, 10, 64)
	if err != nil {
		log.Printf("ERROR: Invalid campaign ID format for attachment tracker: %s", campaignIDStr)
		c.Status(http.StatusBadRequest)
		return
	}
	attachmentID, err := strconv.ParseUint(attachmentIDStr, 10, 64)
	if err != nil {
		log.Printf("ERROR: Invalid attachment ID format for attachment tracker: %s", attachmentIDStr)
		c.Status(http.StatusBadRequest)
		return
	}

	// 1. Log event “attachment_clicked”
	var rec models.Recipient
	if err := config.DB.Where("uid = ?", rid).First(&rec).Error; err != nil {
		log.Printf("WARNING: Recipient not found for attachment tracker (RID: %s)", rid)
		c.Status(http.StatusBadRequest)
		return
	}

	// Log the event using the service function
	services.LogEventByRID(c, rid, string(models.AttachmentClicked), "", uint(campaignID))

	// 2. Retrieve attachment details from DB using attachmentID
	var attachment models.Attachment
	if err := config.DB.First(&attachment, attachmentID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Printf("WARNING: Attachment not found in DB for ID: %d", attachmentID)
			c.Status(http.StatusNotFound)
			return
		}
		log.Printf("ERROR: Failed to retrieve attachment from DB for ID: %d: %v", attachmentID, err)
		c.Status(http.StatusInternalServerError)
		return
	}

	// 3. Serve the file after logging
	storagePath := os.Getenv("UPLOAD_ATTACHMENT")
	if storagePath == "" {
		log.Printf("ERROR: UPLOAD_ATTACHMENT environment variable not set for serving attachment %s", attachment.OriginalFilename)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Server configuration error: Attachment storage path not set.",
		})
		return
	}
	fullFilePath := filepath.Join(storagePath, attachment.StoredFilename)

	if _, err := os.Stat(fullFilePath); os.IsNotExist(err) {
		log.Printf("WARNING: Physical attachment file not found on server for %s (path: %s)", attachment.OriginalFilename, fullFilePath)
		c.Status(http.StatusNotFound)
		return
	}

	// Set headers for file download and serve the file
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", attachment.OriginalFilename))
	c.Header("Content-Type", attachment.MimeType)
	c.File(fullFilePath)
}

// GetLandingPageBody serves the body of a landing page.
func GetLandingPageBody(c *gin.Context) {
	ridStr := c.Query("rid")
	campStr := c.Query("campaign")
	pageID, _ := strconv.Atoi(c.Param("id"))
	campID, _ := strconv.Atoi(campStr)

	// 1. Lookup recipient
	var rec models.Recipient
	if err := config.DB.
		Where("uid = ? AND campaign_id = ?", ridStr, campID).
		First(&rec).Error; err != nil {
		c.Status(http.StatusNotFound)
		return
	}

	// 2. Pastikan landing page cocok dengan campaign
	var camp models.Campaign
	config.DB.First(&camp, campID)
	if camp.LandingPageID != uint(pageID) {
		c.Status(http.StatusForbidden)
		return
	}

	// 3. Fetch dan return body
	var page models.LandingPage
	if err := config.DB.First(&page, pageID).Error; err != nil {
		c.Status(http.StatusNotFound)
		return
	}
	c.JSON(http.StatusOK, gin.H{"body": page.Body})
}
