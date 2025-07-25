package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Struktur data untuk respons Dashboard (tetap sama)
type DashboardData struct {
	TotalCampaign   int              `json:"totalCampaign"`
	TotalSent       int              `json:"totalSent"`
	CampaignResults []CampaignResult `json:"campaignResults"`
	FunnelData      []FunnelStep     `json:"funnelData"`
	CTROverTimeData []CTROverTime    `json:"ctrOverTimeData"`
	TopPerformers   []TopPerformer   `json:"topPerformers"`
	BrowserData     []BrowserStats   `json:"browserData"`
}

type CampaignResult struct {
	Label      string `json:"label"`
	Value      int    `json:"value"`
	Color      string `json:"color"`
	Percentage int    `json:"percentage"`
}

type FunnelStep struct {
	Name  string `json:"name"`
	Value int    `json:"value"`
	Fill  string `json:"fill"`
}

type CTROverTime struct {
	Hour    string `json:"hour"`
	Sent    int    `json:"sent"`
	Opened  int    `json:"opened"`
	Clicked int    `json:"clicked"`
}

type TopPerformer struct {
	Email        string `json:"email"`
	CampaignName int    `json:"totalCampaign"`
	Opened       int    `json:"onOpened"`
	Clicks       int    `json:"onClicks"`
	Submits      int    `json:"onSubmits"`
	ReportLink   int    `json:"onReport"`
}

type BrowserStats struct {
	Name  string `json:"name"`
	Value int    `json:"value"`
	Color string `json:"color"`
}

// GetDashboardMetrics mengembalikan semua data yang dibutuhkan untuk dashboard
func GetDashboardMetrics(c *gin.Context) {
	db := config.DB

	// 0
	var totalCampaign int64
	errCount := db.Model(&models.Campaign{}).Count(&totalCampaign).Error
	if errCount != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "failed to count total campaign"})
		return
	}

	// --- 1. Total Email Sent ---
	var totalSent int64
	err := db.Model(&models.Recipient{}).Where("status = ?", "sent").Count(&totalSent).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "failed to count total send email"})
		return
	}

	// --- 2. Campaign Overview Metrics (Sent, Opened, Clicked, Submitted, Reported) ---
	var openedCount, clickedCount, submittedCount, reportedCount int64

	db.Model(&models.Event{}).Where("type = ?", models.Opened).Count(&openedCount)
	db.Model(&models.Event{}).Where("type = ?", models.Clicked).Count(&clickedCount)
	db.Model(&models.Event{}).Where("type = ?", models.Submitted).Count(&submittedCount)
	db.Model(&models.Event{}).Where("type = ?", models.Reported).Count(&reportedCount)

	calculatePercentage := func(value int64, total int64) int {
		if total == 0 {
			return 0
		}
		return int(float64(value) / float64(total) * 100)
	}

	campaignResults := []CampaignResult{
		{Label: "Campaign", Value: int(totalCampaign), Color: "#009ac9ff", Percentage: calculatePercentage(totalCampaign, totalCampaign)},
		{Label: "Sent", Value: int(totalSent), Color: "#10B981", Percentage: calculatePercentage(totalSent, totalSent)},
		{Label: "Opened", Value: int(openedCount), Color: "#F59E0B", Percentage: calculatePercentage(openedCount, totalSent)},
		{Label: "Clicked", Value: int(clickedCount), Color: "#9b29ff", Percentage: calculatePercentage(clickedCount, totalSent)},
		{Label: "Submitted", Value: int(submittedCount), Color: "#DC2626", Percentage: calculatePercentage(submittedCount, totalSent)},
		{Label: "Reported", Value: int(reportedCount), Color: "#2934ff", Percentage: calculatePercentage(reportedCount, totalSent)},
	}

	// --- 3. Funnel Data ---
	funnelData := []FunnelStep{
		{Name: "Email Sent", Value: int(totalSent), Fill: "#10B981"},
		{Name: "Email Opened", Value: int(openedCount), Fill: "#F59E0B"},
		{Name: "Clicked Link", Value: int(clickedCount), Fill: "#EF4444"},
		{Name: "Submitted Data", Value: int(submittedCount), Fill: "#DC2626"},
	}

	// --- 4. CTR Over Time (misalnya per jam dalam 24 jam terakhir) ---
	var ctrOverTimeData []CTROverTime
	now := time.Now()
	for i := 4; i >= 0; i-- {
		hourStart := now.Add(time.Duration(-i) * time.Hour).Truncate(time.Hour)
		hourEnd := hourStart.Add(1 * time.Hour)

		var hourlySent, hourlyOpened, hourlyClicked int64
		db.Model(&models.Recipient{}).Where("created_at >= ? AND created_at < ?", hourStart, hourEnd).Count(&hourlySent)
		db.Model(&models.Event{}).Where("timestamp >= ? AND timestamp < ? AND type = ?", hourStart, hourEnd, models.Opened).Count(&hourlyOpened)
		db.Model(&models.Event{}).Where("timestamp >= ? AND timestamp < ? AND type = ?", hourStart, hourEnd, models.Clicked).Count(&hourlyClicked)

		ctrOverTimeData = append(ctrOverTimeData, CTROverTime{
			Hour:    hourStart.Format("15:00"), // Format jam saja
			Sent:    int(hourlySent),
			Opened:  int(hourlyOpened),
			Clicked: int(hourlyClicked),
		})
	}

	// --- 5. Top Performer ---
	var topPerformers []TopPerformer
	type RecipientStats struct {
		RecipientID    uint   `gorm:"column:recipient_id"`
		Email          string `gorm:"column:email"`
		TotalClicks    int64  `gorm:"column:total_clicks"`
		TotalOpened    int64  `gorm:"column:total_opened"`
		TotalSubmits   int64  `gorm:"column:total_submits"`
		TotalReported  int64  `gorm:"column:total_reported"`
		TotalCampaigns int64  `gorm:"column:total_campaigns"`
	}

	var stats []RecipientStats
	err = db.Raw(`
		SELECT
			r.id as recipient_id, -- Ambil satu recipient_id saja, bisa sembarang
			r.email,
			COUNT(DISTINCT r.campaign_id) as total_campaigns, -- Hitung jumlah kampanye unik
			COALESCE(SUM(CASE WHEN e.type = ? THEN 1 ELSE 0 END), 0) as total_clicks,
			COALESCE(SUM(CASE WHEN e.type = ? THEN 1 ELSE 0 END), 0) as total_opened,
			COALESCE(SUM(CASE WHEN e.type = ? THEN 1 ELSE 0 END), 0) as total_submits,
			COALESCE(SUM(CASE WHEN e.type = ? THEN 1 ELSE 0 END), 0) as total_reported
		FROM
			recipients r
		LEFT JOIN
			events e ON r.id = e.recipient_id
		GROUP BY
			r.email
		ORDER BY
			total_clicks DESC
		LIMIT 5
	`, models.Clicked, models.Opened, models.Submitted, models.Reported).Scan(&stats).Error

	if err != nil && err != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "failed to get top performers",
			"data":    nil,
		})
		return
	}

	for _, s := range stats {
		topPerformers = append(topPerformers, TopPerformer{
			Email:        s.Email,
			CampaignName: int(s.TotalCampaigns),
			Opened:       int(s.TotalOpened),
			Clicks:       int(s.TotalClicks),
			Submits:      int(s.TotalSubmits),
			ReportLink:   int(s.TotalReported),
		})
	}

	// --- 6. Browser/OS Breakdown ---
	var browserData []BrowserStats

	var browserCounts []struct {
		Browser string
		Count   int64
	}
	db.Model(&models.Event{}).
		Select("browser, count(id) as count").
		Where("browser IS NOT NULL AND browser != ''").
		Group("browser").
		Order("count desc").
		Limit(5).
		Scan(&browserCounts)

	for _, bc := range browserCounts {
		color := "#9CA3AF"
		switch bc.Browser {
		case "Chrome":
			color = "#3B82F6"
		case "Firefox":
			color = "#F97316"
		case "Edge":
			color = "#0EA5E9"
		default:
			color = "#6B7280"
		}
		browserData = append(browserData, BrowserStats{Name: bc.Browser, Value: int(bc.Count), Color: color})
	}

	// Final Response
	data := DashboardData{
		TotalCampaign:   int(totalCampaign),
		TotalSent:       int(totalSent),
		CampaignResults: campaignResults,
		FunnelData:      funnelData,
		CTROverTimeData: ctrOverTimeData,
		TopPerformers:   topPerformers,
		BrowserData:     browserData,
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Dashboard metrics fetched successfully",
		"data":    data,
	})
}
