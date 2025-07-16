package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"be-awarenix/services"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func HandleOpenTracker(c *gin.Context) {
	rid := c.Query("rid")
	services.LogEventByRID(c, rid, string(models.Opened))
}

func HandleClickTracker(c *gin.Context) {
	rid := c.Query("rid")
	services.LogEventByRID(c, rid, string(models.Clicked))
}

func HandleSubmitTracker(c *gin.Context) {
	rid := c.Query("rid")
	services.LogEventByRID(c, rid, string(models.Submitted))
}

func HandleReportTracker(c *gin.Context) {
	rid := c.Query("rid")
	services.LogEventByRID(c, rid, "reported")
}

func TrackAttachment(c *gin.Context) {
	// uid := c.Query("uid")
	campaign, _ := strconv.Atoi(c.Query("campaign"))
	filename := c.Query("file")

	// Log event “attachment_clicked”
	e := models.Event{
		// UID:        uid,
		CampaignID: uint(campaign),
		Type:       "attachment_clicked",
		Timestamp:  time.Now(),
		// Metadata:   collectMetadata(c.Request),
	}
	config.DB.Create(&e)

	// Kirim file setelah logging
	c.File(fmt.Sprintf("assets/attachments/%s", filename))
}

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
	c.JSON(200, gin.H{"body": page.Body})
}
