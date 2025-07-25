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

// Create
func RegisterCampaign(c *gin.Context) {
	var input models.CampaignRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		validationErrors := services.ParseValidationErrors(err)
		if validationErrors != nil {
			services.LogActivity(config.DB, c, "Create", "Campaign", "", input, nil, "error", "Validation failed") // Log Error
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"message": "Validation failed",
				"fields":  validationErrors,
			})
			return
		}
		services.LogActivity(config.DB, c, "Create", "Campaign", "", input, nil, "error", err.Error()) // Log Error
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": err.Error(),
		})
		return
	}

	// Parsing tanggal dari string ke time.Time
	launchDate, err := time.Parse(time.RFC3339, input.LaunchDate)
	if err != nil {
		services.LogActivity(config.DB, c, "Create", "Campaign", "", input, nil, "error", "Format Launch Date not valid") // Log Error
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Format Launch Date tidak valid. Gunakan format RFC3339.",
			"fields":  map[string]string{"launch_date": "Format Launch Date not valid"},
		})
		return
	}

	var sendEmailBy *time.Time
	if input.SendEmailBy != nil && *input.SendEmailBy != "" {
		parsedSendEmailBy, err := time.Parse(time.RFC3339, *input.SendEmailBy)
		if err != nil {
			services.LogActivity(config.DB, c, "Create", "Campaign", "", input, nil, "error", "Format Send Email By not valid") // Log Error
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
		services.LogActivity(config.DB, c, "Create", "Campaign", "", input, nil, "error", "Group ID not found") // Log Error
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Group ID tidak ditemukan",
			"fields":  map[string]string{"group_id": "Group ID not found"},
		})
		return
	}

	var emailTemplate models.EmailTemplate
	if err := config.DB.First(&emailTemplate, input.EmailTemplateID).Error; err != nil {
		services.LogActivity(config.DB, c, "Create", "Campaign", "", input, nil, "error", "Email Template ID not found") // Log Error
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Email Template ID tidak ditemukan",
			"fields":  map[string]string{"email_template_id": "Email Template ID not found"},
		})
		return
	}

	var landingPage models.LandingPage
	if err := config.DB.First(&landingPage, input.LandingPageID).Error; err != nil {
		services.LogActivity(config.DB, c, "Create", "Campaign", "", input, nil, "error", "Landing Page ID not found") // Log Error
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Landing Page ID tidak ditemukan",
			"fields":  map[string]string{"landing_page_id": "Landing Page not found"},
		})
		return
	}

	var sendingProfile models.SendingProfiles
	if err := config.DB.First(&sendingProfile, input.SendingProfileID).Error; err != nil {
		services.LogActivity(config.DB, c, "Create", "Campaign", "", input, nil, "error", "Sending Profile ID not found") // Log Error
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Sending Profile ID tidak ditemukan",
			"fields":  map[string]string{"sending_profile_id": "Sending Profile not found"},
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
		Status:           "pending",
	}

	if err := config.DB.Create(&campaign).Error; err != nil {
		services.LogActivity(config.DB, c, "Create", "Campaign", "", input, nil, "error", "Failed to create campaign: "+err.Error()) // Log Error
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to create campaign: " + err.Error(),
		})
		return
	}

	services.LogActivity(config.DB, c, "Create", "Campaign", strconv.Itoa(int(campaign.ID)), nil, campaign, "success", "Campaign successfully added") // Log Success
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Campaign successfully added",
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

	userIDScope, roleScope, errorStatus := services.GetRoleScope(c)
	if !errorStatus {
		// services.GetRoleScope seharusnya sudah menangani respons error
		return
	}

	if roleScope != 1 { // Asumsi role 1 adalah admin yang bisa melihat semua
		db = db.Where("created_by = ?", userIDScope)
	}

	// 4. Hitung total data (after filter)
	var total int64
	if err := db.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to count total campaign: " + err.Error(),
		})
		return
	}

	// 5. Ambil page data dengan sort, limit, offset
	var campaigns []models.Campaign
	// Preload relasi yang diperlukan untuk daftar (jika GroupName, dll. dibutuhkan)
	// Jika hanya ID dan Name yang dibutuhkan, Preload tidak perlu di sini untuk efisiensi.
	// Namun, karena CampaignResponse membutuhkan GroupName, EmailTemplateName, dll.,
	// maka Preload diperlukan.
	if err := db.
		Preload("Group").          // Memuat data Group
		Preload("EmailTemplate").  // Memuat data EmailTemplate
		Preload("LandingPage").    // Memuat data LandingPage
		Preload("SendingProfile"). // Memuat data SendingProfile
		Order(fmt.Sprintf("%s %s", sortBy, order)).
		Limit(limit).
		Offset(offset).
		Find(&campaigns).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to get campaign data: " + err.Error(),
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

		CampaignUID := services.EncodeID(int(camp.ID))

		// Ambil createdByName dan updatedByName
		createdByName := ""
		updatedByName := ""

		if camp.CreatedBy != 0 {
			var createdByUser models.User
			if err := config.DB.Select("name").First(&createdByUser, camp.CreatedBy).Error; err == nil {
				createdByName = createdByUser.Name
			}
		}

		if camp.UpdatedBy != 0 {
			var updatedByUser models.User
			if err := config.DB.Select("name").First(&updatedByUser, camp.UpdatedBy).Error; err == nil {
				updatedByName = updatedByUser.Name
			}
		}

		out = append(out, models.CampaignResponse{
			ID:                 int(camp.ID),
			UID:                CampaignUID,
			Name:               camp.Name,
			LaunchDate:         camp.LaunchDate,
			SendEmailBy:        camp.SendEmailBy,
			GroupID:            int(camp.GroupID),
			GroupName:          camp.Group.Name, // Pastikan Group di-Preload
			EmailTemplateID:    int(camp.EmailTemplateID),
			EmailTemplateName:  camp.EmailTemplate.Name, // Pastikan EmailTemplate di-Preload
			LandingPageID:      int(camp.LandingPageID),
			LandingPageName:    camp.LandingPage.Name, // Pastikan LandingPage di-Preload
			SendingProfileID:   int(camp.SendingProfileID),
			SendingProfileName: camp.SendingProfile.Name, // Pastikan SendingProfile di-Preload
			URL:                camp.URL,
			CreatedAt:          camp.CreatedAt,
			CreatedBy:          int(camp.CreatedBy),
			CreatedByName:      createdByName,
			UpdatedAt:          camp.UpdatedAt,
			UpdatedBy:          int(camp.UpdatedBy),
			UpdatedByName:      updatedByName,
			Status:             camp.Status,
			EmailSent:          emailSent,
			EmailOpened:        emailOpened,
			EmailClicks:        clicks,
			EmailSubmitted:     submitted,
			EmailReported:      reported,
			Participants:       nil,
			TimelineEvents:     nil,
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

// Read Detail
func GetCampaignDetail(c *gin.Context) {
	id := c.Param("id")
	idCampaign, _ := services.DecodeID(id)

	var campaign models.Campaign
	// Gunakan Preload untuk memuat data relasi Group, EmailTemplate, LandingPage, dan SendingProfile
	if err := config.DB.Preload("Group").Preload("EmailTemplate").Preload("LandingPage").Preload("SendingProfile").First(&campaign, idCampaign).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "Campaign not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "failed to fetch campaign detail: " + err.Error(),
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

	var totalParticipants int64
	config.DB.Model(&models.Member{}).Where("group_id = ?", campaign.GroupID).Count(&totalParticipants)

	createdByName := ""
	updatedByName := ""

	if campaign.CreatedBy != 0 {
		var createdByUser models.User
		if err := config.DB.Select("name").First(&createdByUser, campaign.CreatedBy).Error; err == nil {
			createdByName = createdByUser.Name
		}
	}

	if campaign.UpdatedBy != 0 {
		var updatedByUser models.User
		if err := config.DB.Select("name").First(&updatedByUser, campaign.UpdatedBy).Error; err == nil {
			updatedByName = updatedByUser.Name
		}
	}

	var participants []models.Member
	config.DB.Where("group_id = ?", campaign.GroupID).Find(&participants)

	var participantsData []models.ParticipantDetail
	for _, p := range participants {
		memberStatus := ""
		position := p.Position

		var recipient models.Recipient
		if err := config.DB.Where("campaign_id = ? AND email = ?", campaign.ID, p.Email).First(&recipient).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				memberStatus = "-"
			} else {
				memberStatus = "error_fetching_status"
			}
		} else {
			memberStatus = recipient.Status
		}

		participantsData = append(participantsData, models.ParticipantDetail{
			ID:       p.ID,
			Name:     p.Name,
			Email:    p.Email,
			Status:   memberStatus,
			Position: position,
		})
	}

	var timelineEvents []models.TimelineEvent

	// Event: Kampanye dibuat
	timelineEvents = append(timelineEvents, models.TimelineEvent{
		Timestamp: campaign.CreatedAt,
		Type:      "campaign_created",
		Message:   "Kampanye dibuat oleh " + createdByName,
	})

	// Event: Kampanye diluncurkan (jika LaunchDate ada)
	if !campaign.LaunchDate.IsZero() {
		timelineEvents = append(timelineEvents, models.TimelineEvent{
			Timestamp: campaign.LaunchDate,
			Type:      "campaign_launched",
			Message:   "Kampanye diluncurkan",
		})
	}
	response := models.CampaignResponse{
		ID:                 int(campaign.ID),
		UID:                services.EncodeID(int(campaign.ID)),
		Name:               campaign.Name,
		LaunchDate:         campaign.LaunchDate,
		SendEmailBy:        campaign.SendEmailBy,
		GroupID:            int(campaign.GroupID),
		GroupName:          campaign.Group.Name,
		EmailTemplateID:    int(campaign.EmailTemplateID),
		EmailTemplateName:  campaign.EmailTemplate.Name,
		LandingPageID:      int(campaign.LandingPageID),
		LandingPageName:    campaign.LandingPage.Name,
		SendingProfileID:   int(campaign.SendingProfileID),
		SendingProfileName: campaign.SendingProfile.Name,
		URL:                campaign.URL,
		Status:             campaign.Status,
		CreatedAt:          campaign.CreatedAt,
		CreatedBy:          int(campaign.CreatedBy),
		CreatedByName:      createdByName,
		UpdatedAt:          campaign.UpdatedAt,
		UpdatedBy:          int(campaign.UpdatedBy),
		UpdatedByName:      updatedByName,
		EmailSent:          emailSent,
		EmailOpened:        emailOpened,
		EmailClicks:        clicks,
		EmailSubmitted:     submitted,
		EmailReported:      reported,
		TotalParticipants:  int(totalParticipants),
		Participants:       participantsData,
		TimelineEvents:     timelineEvents,
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Detail campaign successfully retrieved",
		"data":    response,
	})
}

// Update
func UpdateCampaign(c *gin.Context) {
	id := c.Param("id")

	var existingCampaign models.Campaign
	if err := config.DB.First(&existingCampaign, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			services.LogActivity(config.DB, c, "Update", "Campaign", id, nil, nil, "error", "Kampanye tidak ditemukan") // Log Error
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "Kampanye tidak ditemukan",
			})
			return
		}
		services.LogActivity(config.DB, c, "Update", "Campaign", id, nil, nil, "error", "Gagal menemukan kampanye: "+err.Error()) // Log Error
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
			services.LogActivity(config.DB, c, "Update", "Campaign", id, existingCampaign, input, "error", "Validasi gagal") // Log Error
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"message": "Validasi gagal",
				"fields":  validationErrors,
			})
			return
		}
		services.LogActivity(config.DB, c, "Update", "Campaign", id, existingCampaign, input, "error", err.Error()) // Log Error
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": err.Error(),
		})
		return
	}

	// Parsing tanggal dari string ke time.Time
	launchDate, err := time.Parse(time.RFC3339, input.LaunchDate)
	if err != nil {
		services.LogActivity(config.DB, c, "Update", "Campaign", id, existingCampaign, input, "error", "Format Launch Date tidak valid") // Log Error
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
			services.LogActivity(config.DB, c, "Update", "Campaign", id, existingCampaign, input, "error", "Format Send Email By tidak valid") // Log Error
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
		services.LogActivity(config.DB, c, "Update", "Campaign", id, existingCampaign, input, "error", "Group ID tidak ditemukan") // Log Error
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Group ID tidak ditemukan",
			"fields":  map[string]string{"group_id": "Group tidak ada"},
		})
		return
	}

	var emailTemplate models.EmailTemplate
	if err := config.DB.First(&emailTemplate, input.EmailTemplateID).Error; err != nil {
		services.LogActivity(config.DB, c, "Update", "Campaign", id, existingCampaign, input, "error", "Email Template ID tidak ditemukan") // Log Error
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Email Template ID tidak ditemukan",
			"fields":  map[string]string{"email_template_id": "Template email tidak ada"},
		})
		return
	}

	var landingPage models.LandingPage
	if err := config.DB.First(&landingPage, input.LandingPageID).Error; err != nil {
		services.LogActivity(config.DB, c, "Update", "Campaign", id, existingCampaign, input, "error", "Landing Page ID tidak ditemukan") // Log Error
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Landing Page ID tidak ditemukan",
			"fields":  map[string]string{"landing_page_id": "Landing page tidak ada"},
		})
		return
	}

	var sendingProfile models.SendingProfiles
	if err := config.DB.First(&sendingProfile, input.SendingProfileID).Error; err != nil {
		services.LogActivity(config.DB, c, "Update", "Campaign", id, existingCampaign, input, "error", "Sending Profile ID tidak ditemukan") // Log Error
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Sending Profile ID tidak ditemukan",
			"fields":  map[string]string{"sending_profile_id": "Profil pengiriman tidak ada"},
		})
		return
	}

	// Simpan nilai lama sebelum diupdate
	oldCampaign := existingCampaign

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
	existingCampaign.UpdatedBy = int(input.UpdatedBy)

	if err := config.DB.Save(&existingCampaign).Error; err != nil {
		services.LogActivity(config.DB, c, "Update", "Campaign", id, oldCampaign, existingCampaign, "error", "Gagal memperbarui kampanye: "+err.Error()) // Log Error
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal memperbarui kampanye: " + err.Error(),
		})
		return
	}

	services.LogActivity(config.DB, c, "Update", "Campaign", id, oldCampaign, existingCampaign, "success", "Kampanye berhasil diperbarui") // Log Success
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

// Delete
func DeleteCampaign(c *gin.Context) {
	id := c.Param("id")

	var campaign models.Campaign
	if err := config.DB.First(&campaign, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			services.LogActivity(config.DB, c, "Delete", "Campaign", id, nil, nil, "error", "Campaign not found")
			c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Campaign not found"})
			return
		}
		services.LogActivity(config.DB, c, "Delete", "Campaign", id, nil, nil, "error", "Failed to find campaign")
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to find campaign"})
		return
	}

	if campaign.Status == "in progress" || campaign.Status == "pending" {
		services.LogActivity(config.DB, c, "Delete", "Campaign", id, campaign, nil, "error", "Campaign is running or pending")
		c.JSON(http.StatusForbidden, gin.H{"status": "error", "message": "Campaign is running or finished"})
		return
	}

	tx := config.DB.Begin()

	// Hapus Event dan Recipient
	if err := tx.Where("campaign_id = ?", campaign.ID).Delete(&models.Event{}).Error; err != nil {
		tx.Rollback()
		services.LogActivity(config.DB, c, "Delete", "Campaign", id, campaign, nil, "error", "Failed to delete Event") // Log Error
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to delete Event"})
		return
	}

	if err := tx.Where("campaign_id = ?", campaign.ID).Delete(&models.Recipient{}).Error; err != nil {
		tx.Rollback()
		services.LogActivity(config.DB, c, "Delete", "Campaign", id, campaign, nil, "error", "failed to delete Recipient") // Log Error
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "failed to delete Recipient"})
		return
	}

	// Hapus Campaign
	if err := tx.Delete(&campaign).Error; err != nil {
		tx.Rollback()
		services.LogActivity(config.DB, c, "Delete", "Campaign", id, campaign, nil, "error", "Failed to delete Campaign") // Log Error
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to delete Recipient"})         // Pesan error ini sepertinya typo, seharusnya "Failed to delete Campaign"
		return
	}

	tx.Commit()

	services.LogActivity(config.DB, c, "Delete", "Campaign", id, campaign, nil, "success", "Campaign and related data successfully deleted") // Log Success
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

		// kirim async
		go services.SendEmailToRecipient(rec, camp)
	}
}
