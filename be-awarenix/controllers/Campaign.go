// controllers/campaigns.go
package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"be-awarenix/services"
	"net/http"
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

// GetCampaigns retrieves all campaigns
func GetCampaigns(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	var campaigns []models.Campaign
	if err := db.Find(&campaigns).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal mengambil kampanye: " + err.Error(),
		})
		return
	}

	var campaignResponses []models.CampaignResponse
	for _, campaign := range campaigns {
		campaignResponses = append(campaignResponses, models.CampaignResponse{
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
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Kampanye berhasil diambil",
		"data":    campaignResponses,
	})
}

// GetCampaignDetail retrieves a single campaign by ID
func GetCampaignDetail(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	id := c.Param("id")

	var campaign models.Campaign
	if err := db.First(&campaign, id).Error; err != nil {
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
		},
	})
}

// UpdateCampaign updates an existing campaign
func UpdateCampaign(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	id := c.Param("id")

	var existingCampaign models.Campaign
	if err := db.First(&existingCampaign, id).Error; err != nil {
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
	if err := db.First(&group, input.GroupID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Group ID tidak ditemukan",
			"fields":  map[string]string{"group_id": "Group tidak ada"},
		})
		return
	}

	var emailTemplate models.EmailTemplate
	if err := db.First(&emailTemplate, input.EmailTemplateID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Email Template ID tidak ditemukan",
			"fields":  map[string]string{"email_template_id": "Template email tidak ada"},
		})
		return
	}

	var landingPage models.LandingPage
	if err := db.First(&landingPage, input.LandingPageID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Landing Page ID tidak ditemukan",
			"fields":  map[string]string{"landing_page_id": "Landing page tidak ada"},
		})
		return
	}

	var sendingProfile models.SendingProfiles
	if err := db.First(&sendingProfile, input.SendingProfileID).Error; err != nil {
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

	if err := db.Save(&existingCampaign).Error; err != nil {
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

	// Tidak boleh menghapus kampanye yang sedang berjalan/selesai
	if campaign.Status == "in_progress" || campaign.Status == "completed" {
		c.JSON(http.StatusForbidden, gin.H{
			"status":  "error",
			"message": "Tidak dapat menghapus kampanye yang sedang berjalan atau sudah selesai",
		})
		return
	}

	if err := config.DB.Delete(&campaign).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal menghapus kampanye: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Kampanye berhasil dihapus",
		"data":    nil, // Data null jika tidak ada yang dikembalikan
	})
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
