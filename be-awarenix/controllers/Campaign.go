// controllers/campaigns.go
package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"be-awarenix/services"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Catatan: Semua helper response SendSuccessResponse, SendErrorResponse, SendValidationErrorResponse
// akan dihapus dari penggunaan dalam file ini, dan diganti dengan c.JSON langsung.

// RegisterCampaign handles the creation of a new campaign
func RegisterCampaign(c *gin.Context) {
	var input models.CampaignRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		validationErrors := services.ParseValidationErrors(err)
		if validationErrors != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"message": "Validasi gagal",
				"fields":  validationErrors,
			})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": err.Error(),
		})
		return
	}

	// Parsing tanggal dari string ke time.Time
	launchDate, err := time.Parse(time.RFC3339, input.LaunchDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Format Launch Date tidak valid. Gunakan format RFC3339.",
			"fields":  map[string]string{"launch_date": "Format tanggal tidak valid"},
		})
		return
	}

	var sendEmailBy *time.Time
	if input.SendEmailBy != nil && *input.SendEmailBy != "" {
		parsedSendEmailBy, err := time.Parse(time.RFC3339, *input.SendEmailBy)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"message": "Format Send Email By tidak valid. Gunakan format RFC3339.",
				"fields":  map[string]string{"send_email_by": "Format tanggal tidak valid"},
			})
			return
		}
		sendEmailBy = &parsedSendEmailBy
	} else {
		sendEmailBy = nil
	}

	// Dapatkan instance DB dari context

	// Verifikasi keberadaan Group, EmailTemplate, LandingPage, SendingProfile
	var group models.Group
	if err := config.DB.First(&group, input.GroupID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Group ID tidak ditemukan",
			"fields":  map[string]string{"group_id": "Group tidak ada"},
		})
		return
	}

	var emailTemplate models.EmailTemplate
	if err := config.DB.First(&emailTemplate, input.EmailTemplateID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Email Template ID tidak ditemukan",
			"fields":  map[string]string{"email_template_id": "Template email tidak ada"},
		})
		return
	}

	var landingPage models.LandingPage
	if err := config.DB.First(&landingPage, input.LandingPageID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Landing Page ID tidak ditemukan",
			"fields":  map[string]string{"landing_page_id": "Landing page tidak ada"},
		})
		return
	}

	var sendingProfile models.SendingProfiles
	if err := config.DB.First(&sendingProfile, input.SendingProfileID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Sending Profile ID tidak ditemukan",
			"fields":  map[string]string{"sending_profile_id": "Profil pengiriman tidak ada"},
		})
		return
	}

	campaign := models.Campaign{
		Name:             input.Name,
		LaunchDate:       launchDate,
		SendEmailBy:      sendEmailBy,
		GroupID:          input.GroupID,
		EmailTemplateID:  input.EmailTemplateID,
		LandingPageID:    input.LandingPageID,
		SendingProfileID: input.SendingProfileID,
		URL:              input.URL,
		CreatedBy:        int(input.CreatedBy),
		CreatedAt:        time.Now(),
		Status:           "draft",
	}

	if err := config.DB.Create(&campaign).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to create campaign: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Kampanye berhasil didaftarkan",
		"data": models.CampaignResponse{
			ID:          int(campaign.ID),
			Name:        campaign.Name,
			LaunchDate:  campaign.LaunchDate,
			SendEmailBy: campaign.SendEmailBy,
			URL:         campaign.URL,
			Status:      campaign.Status,
		},
	})
}

func GetCampaigns(c *gin.Context) {
	// 1. Parse query params
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")
	sortBy := c.DefaultQuery("sortBy", "created_at")
	order := c.DefaultQuery("order", "desc") // 'asc' atau 'desc'

	offset := (page - 1) * limit

	// 2. Build base query
	db := config.DB.Model(&models.Campaign{})

	// 3. Apply search filter
	if search != "" {
		// Contoh search di kolom name
		db = db.Where("name LIKE ?", "%"+search+"%")
	}

	// 4. Hitung total data (after filter)
	var total int64
	if err := db.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal menghitung total kampanye: " + err.Error(),
		})
		return
	}

	// 5. Ambil page data dengan sort, limit, offset
	var campaigns []models.Campaign
	if err := db.
		Order(fmt.Sprintf("%s %s", sortBy, order)).
		Limit(limit).
		Offset(offset).
		Find(&campaigns).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal mengambil kampanye: " + err.Error(),
		})
		return
	}

	// 6. Map ke response DTO dan tambahkan statistik
	var out []models.CampaignResponse
	for _, camp := range campaigns {
		// Inisialisasi statistik
		emailSent := 0
		emailOpened := 0
		clicks := 0
		submitted := 0
		reported := 0

		// Hitung Email Sent (dari Recipient status 'sent')
		// Asumsi status 'sent' ada di tabel Recipient
		var sentCount int64
		config.DB.Model(&models.Recipient{}).Where("campaign_id = ? AND status = ?", camp.ID, "sent").Count(&sentCount)
		emailSent = int(sentCount)

		// Hitung Event Types (opened, clicked, submitted, reported)
		var openedCount int64
		config.DB.Model(&models.Event{}).Where("campaign_id = ? AND type = ?", camp.ID, models.Opened).Count(&openedCount)
		emailOpened = int(openedCount)

		var clickedCount int64
		config.DB.Model(&models.Event{}).Where("campaign_id = ? AND type = ?", camp.ID, models.Clicked).Count(&clickedCount)
		clicks = int(clickedCount)

		var submittedCount int64
		config.DB.Model(&models.Event{}).Where("campaign_id = ? AND type = ?", camp.ID, models.Submitted).Count(&submittedCount)
		submitted = int(submittedCount)

		var reportedCount int64
		config.DB.Model(&models.Event{}).Where("campaign_id = ? AND type = ?", camp.ID, models.Reported).Count(&reportedCount)
		reported = int(reportedCount)

		out = append(out, models.CampaignResponse{
			ID:               int(camp.ID),
			Name:             camp.Name,
			LaunchDate:       camp.LaunchDate,
			SendEmailBy:      camp.SendEmailBy,
			GroupID:          int(camp.GroupID),
			EmailTemplateID:  int(camp.EmailTemplateID),
			LandingPageID:    int(camp.LandingPageID),
			SendingProfileID: int(camp.SendingProfileID),
			URL:              camp.URL,
			CreatedBy:        camp.CreatedBy,
			CreatedAt:        camp.CreatedAt,
			UpdatedAt:        camp.UpdatedAt,
			Status:           camp.Status,
			EmailSent:        emailSent,
			EmailOpened:      emailOpened,
			EmailClicks:      clicks,
			EmailSubmitted:   submitted,
			EmailReported:    reported,
		})
	}

	// 7. Kirim JSON
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Campaign data retrieved",
		"data":    out,
		"total":   total,
		"page":    page,
		"limit":   limit,
	})
}

// GetCampaignDetail retrieves a single campaign by ID
func GetCampaignDetail(c *gin.Context) {
	id := c.Param("id")

	var campaign models.Campaign
	if err := config.DB.First(&campaign, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "Kampanye tidak ditemukan",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal mengambil detail kampanye: " + err.Error(),
		})
		return
	}

	// Inisialisasi statistik untuk detail
	emailSent := 0
	emailOpened := 0
	clicks := 0
	submitted := 0
	reported := 0

	// Hitung Email Sent (dari Recipient status 'sent')
	var sentCount int64
	config.DB.Model(&models.Recipient{}).Where("campaign_id = ? AND status = ?", campaign.ID, "sent").Count(&sentCount)
	emailSent = int(sentCount)

	// Hitung Event Types (opened, clicked, submitted, reported)
	var openedCount int64
	config.DB.Model(&models.Event{}).Where("campaign_id = ? AND type = ?", campaign.ID, models.Opened).Count(&openedCount)
	emailOpened = int(openedCount)

	var clickedCount int64
	config.DB.Model(&models.Event{}).Where("campaign_id = ? AND type = ?", campaign.ID, models.Clicked).Count(&clickedCount)
	clicks = int(clickedCount)

	var submittedCount int64
	config.DB.Model(&models.Event{}).Where("campaign_id = ? AND type = ?", campaign.ID, models.Submitted).Count(&submittedCount)
	submitted = int(submittedCount)

	var reportedCount int64
	config.DB.Model(&models.Event{}).Where("campaign_id = ? AND type = ?", campaign.ID, models.Reported).Count(&reportedCount)
	reported = int(reportedCount)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Detail kampanye berhasil diambil",
		"data": models.CampaignResponse{
			ID:               int(campaign.ID),
			Name:             campaign.Name,
			LaunchDate:       campaign.LaunchDate,
			SendEmailBy:      campaign.SendEmailBy,
			GroupID:          int(campaign.GroupID),
			EmailTemplateID:  int(campaign.EmailTemplateID),
			LandingPageID:    int(campaign.LandingPageID),
			SendingProfileID: int(campaign.SendingProfileID),
			URL:              campaign.URL,
			CreatedBy:        campaign.CreatedBy,
			CreatedAt:        campaign.CreatedAt,
			UpdatedAt:        campaign.UpdatedAt,
			Status:           campaign.Status,
			EmailSent:        emailSent,
			EmailOpened:      emailOpened,
			EmailClicks:      clicks,
			EmailSubmitted:   submitted,
			EmailReported:    reported,
		},
	})
}

// UpdateCampaign updates an existing campaign
func UpdateCampaign(c *gin.Context) {
	id := c.Param("id")

	var existingCampaign models.Campaign
	if err := config.DB.First(&existingCampaign, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "Kampanye tidak ditemukan",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal menemukan kampanye: " + err.Error(),
		})
		return
	}

	var input models.CampaignRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		validationErrors := services.ParseValidationErrors(err)
		if validationErrors != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"message": "Validasi gagal",
				"fields":  validationErrors,
			})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": err.Error(),
		})
		return
	}

	// Parsing tanggal dari string ke time.Time
	launchDate, err := time.Parse(time.RFC3339, input.LaunchDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Format Launch Date tidak valid. Gunakan format RFC3339.",
			"fields":  map[string]string{"launch_date": "Format tanggal tidak valid"},
		})
		return
	}

	var sendEmailBy *time.Time
	if input.SendEmailBy != nil && *input.SendEmailBy != "" {
		parsedSendEmailBy, err := time.Parse(time.RFC3339, *input.SendEmailBy)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"message": "Format Send Email By tidak valid. Gunakan format RFC3339.",
				"fields":  map[string]string{"send_email_by": "Format tanggal tidak valid"},
			})
			return
		}
		sendEmailBy = &parsedSendEmailBy
	} else {
		sendEmailBy = nil
	}

	// Verifikasi keberadaan Group, EmailTemplate, LandingPage, SendingProfile
	var group models.Group
	if err := config.DB.First(&group, input.GroupID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Group ID tidak ditemukan",
			"fields":  map[string]string{"group_id": "Group tidak ada"},
		})
		return
	}

	var emailTemplate models.EmailTemplate
	if err := config.DB.First(&emailTemplate, input.EmailTemplateID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Email Template ID tidak ditemukan",
			"fields":  map[string]string{"email_template_id": "Template email tidak ada"},
		})
		return
	}

	var landingPage models.LandingPage
	if err := config.DB.First(&landingPage, input.LandingPageID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Landing Page ID tidak ditemukan",
			"fields":  map[string]string{"landing_page_id": "Landing page tidak ada"},
		})
		return
	}

	var sendingProfile models.SendingProfiles
	if err := config.DB.First(&sendingProfile, input.SendingProfileID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Sending Profile ID tidak ditemukan",
			"fields":  map[string]string{"sending_profile_id": "Profil pengiriman tidak ada"},
		})
		return
	}

	// Update fields
	existingCampaign.Name = input.Name
	existingCampaign.LaunchDate = launchDate
	existingCampaign.SendEmailBy = sendEmailBy
	existingCampaign.GroupID = input.GroupID
	existingCampaign.EmailTemplateID = input.EmailTemplateID
	existingCampaign.LandingPageID = input.LandingPageID
	existingCampaign.SendingProfileID = input.SendingProfileID
	existingCampaign.URL = input.URL
	existingCampaign.UpdatedAt = time.Now()
	// CreatedBy tidak diubah saat update, UpdatedBy bisa ditambahkan jika ada di struct

	if err := config.DB.Save(&existingCampaign).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal memperbarui kampanye: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Kampanye berhasil diperbarui",
		"data": models.CampaignResponse{
			ID:               int(existingCampaign.ID),
			Name:             existingCampaign.Name,
			LaunchDate:       existingCampaign.LaunchDate,
			SendEmailBy:      existingCampaign.SendEmailBy,
			GroupID:          int(existingCampaign.GroupID),
			EmailTemplateID:  int(existingCampaign.EmailTemplateID),
			LandingPageID:    int(existingCampaign.LandingPageID),
			SendingProfileID: int(existingCampaign.SendingProfileID),
			URL:              existingCampaign.URL,
			CreatedBy:        existingCampaign.CreatedBy,
			CreatedAt:        existingCampaign.CreatedAt,
			UpdatedAt:        existingCampaign.UpdatedAt,
			Status:           existingCampaign.Status,
		},
	})
}

// DeleteCampaign deletes a campaign by ID
func DeleteCampaign(c *gin.Context) {
	id := c.Param("id")

	var campaign models.Campaign
	if err := config.DB.First(&campaign, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Campaign not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to find campaign"})
		return
	}

	if campaign.Status == "in_progress" || campaign.Status == "completed" {
		c.JSON(http.StatusForbidden, gin.H{"status": "error", "message": "Campaign is running or finished"})
		return
	}

	tx := config.DB.Begin()

	// Hapus Event dan Recipient
	if err := tx.Where("campaign_id = ?", campaign.ID).Delete(&models.Event{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to delete Event"})
		return
	}

	if err := tx.Where("campaign_id = ?", campaign.ID).Delete(&models.Recipient{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal menghapus Recipient"})
		return
	}

	// Hapus Campaign
	if err := tx.Delete(&campaign).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to delete Recipient"})
		return
	}

	tx.Commit()

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Campaign and related data successfully deleted"})
}

func SendCampaign(camp models.Campaign) {
	for _, member := range camp.Group.Members {
		rid := uuid.NewString()
		rec := models.Recipient{
			UID:        rid,
			CampaignID: camp.ID,
			UserID:     member.ID,
			Email:      member.Email,
			Status:     "pending",
			CreatedAt:  time.Now(),
		}
		config.DB.Create(&rec)

		go services.SendEmailToRecipient(rec, camp)
	}

	config.DB.Model(&camp).Update("status", "sent")
}
