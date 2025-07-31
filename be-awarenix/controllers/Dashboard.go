package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"be-awarenix/services"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
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

func GetDashboardMetrics(c *gin.Context) {
	// 1. Ambil currentUser dari Context
	userIDScope, roleScope, userCreatedBy, errorStatus := services.GetRoleScopeDashboard(c)
	if !errorStatus {
		return
	}

	db := config.DB

	// 2. Build subquery campaignSub: pilih hanya kolom id
	campaignSub := db.
		Model(&models.Campaign{}).
		Select("id")

	//    Jika bukan admin (role != 1), batasi ke self dan parent
	if roleScope != 1 {
		scopeIDs := []int{userIDScope}
		if userCreatedBy > 0 {
			scopeIDs = append(scopeIDs, int(userCreatedBy))
		}

		campaignSub = campaignSub.
			Where("created_by IN (?)", scopeIDs)
	}

	// 3. Hitung total campaign
	var totalCampaign int64
	if err := db.
		Model(&models.Campaign{}).
		Where("id IN (?)", campaignSub). // campaignSub digunakan di sini
		Count(&totalCampaign).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "failed to count campaigns"})
		return
	}

	// 4. Total emails sent
	var totalSent int64
	if err := db.
		Model(&models.Recipient{}).
		Where("campaign_id IN (?)", campaignSub). // campaignSub digunakan di sini
		Where("status = ?", "sent").
		Count(&totalSent).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "failed to count sent emails"})
		return
	}

	// 5. Hitung event opened, clicked, submitted, reported
	var openedCount, clickedCount, submittedCount, reportedCount int64

	// PERBAIKAN: Buat instance kueri baru dari db.Model untuk setiap penghitungan event
	// Ini mencegah kondisi WHERE saling menumpuk dan menyebabkan error SQL.
	db.Model(&models.Event{}).Where("campaign_id IN (?)", campaignSub).Where("type = ?", models.Opened).Count(&openedCount)
	db.Model(&models.Event{}).Where("campaign_id IN (?)", campaignSub).Where("type = ?", models.Clicked).Count(&clickedCount)
	db.Model(&models.Event{}).Where("campaign_id IN (?)", campaignSub).Where("type = ?", models.Submitted).Count(&submittedCount)
	db.Model(&models.Event{}).Where("campaign_id IN (?)", campaignSub).Where("type = ?", models.Reported).Count(&reportedCount)

	// helper percentage
	pct := func(val, tot int64) int {
		if tot == 0 {
			return 0
		}
		return int(float64(val) / float64(tot) * 100)
	}

	campaignResults := []CampaignResult{
		{"Campaign", int(totalCampaign), "#009ac9ff", pct(totalCampaign, totalCampaign)},
		{"Sent", int(totalSent), "#10B981", pct(totalSent, totalSent)},
		{"Opened", int(openedCount), "#F59E0B", pct(openedCount, totalSent)},
		{"Clicked", int(clickedCount), "#9b29ff", pct(clickedCount, totalSent)},
		{"Submitted", int(submittedCount), "#DC2626", pct(submittedCount, totalSent)},
		{"Reported", int(reportedCount), "#2934ff", pct(reportedCount, totalSent)},
	}

	// 6. Funnel steps
	funnelData := []FunnelStep{
		{"Email Sent", int(totalSent), "#10B981"},
		{"Email Opened", int(openedCount), "#F59E0B"},
		{"Clicked Link", int(clickedCount), "#EF4444"},
		{"Submitted", int(submittedCount), "#DC2626"},
	}

	// 7. CTR over last 5 hours
	var ctrOverTime []CTROverTime
	now := time.Now()
	for i := 4; i >= 0; i-- {
		start := now.Add(-time.Duration(i) * time.Hour).Truncate(time.Hour)
		end := start.Add(time.Hour)

		var hSent, hOpened, hClicked int64
		db.Model(&models.Recipient{}).
			Where("campaign_id IN (?)", campaignSub). // campaignSub digunakan di sini
			Where("created_at >= ? AND created_at < ?", start, end).
			Count(&hSent)
		db.Model(&models.Event{}).
			Where("campaign_id IN (?)", campaignSub). // campaignSub digunakan di sini
			Where("timestamp >= ? AND timestamp < ? AND type = ?", start, end, models.Opened).
			Count(&hOpened)
		db.Model(&models.Event{}).
			Where("campaign_id IN (?)", campaignSub). // campaignSub digunakan di sini
			Where("timestamp >= ? AND timestamp < ? AND type = ?", start, end, models.Clicked).
			Count(&hClicked)

		ctrOverTime = append(ctrOverTime, CTROverTime{
			Hour:    start.Format("15:00"),
			Sent:    int(hSent),
			Opened:  int(hOpened),
			Clicked: int(hClicked),
		})
	}

	// 8. Top performers (5 teratas)
	type recStats struct {
		Email          string
		TotalCampaigns int64
		TotalClicks    int64
		TotalOpened    int64
		TotalSubmits   int64
		TotalReported  int64
	}
	var stats []recStats
	rawSQL := `
		SELECT
			r.email,
			COUNT(DISTINCT r.campaign_id) AS total_campaigns,
			SUM(CASE WHEN e.type = ? THEN 1 ELSE 0 END) AS total_clicks,
			SUM(CASE WHEN e.type = ? THEN 1 ELSE 0 END) AS total_opened,
			SUM(CASE WHEN e.type = ? THEN 1 ELSE 0 END) AS total_submits,
			SUM(CASE WHEN e.type = ? THEN 1 ELSE 0 END) AS total_reported
		FROM recipients r
		JOIN campaigns c ON c.id = r.campaign_id
		LEFT JOIN events e ON e.recipient_id = r.id
		WHERE c.id IN (?) -- campaignSub akan dieksekusi di sini
		GROUP BY r.email
		ORDER BY total_clicks DESC
		LIMIT 5
	`
	if err := db.Raw(
		rawSQL,
		models.Clicked, models.Opened, models.Submitted, models.Reported,
		campaignSub, // campaignSub digunakan di sini
	).Scan(&stats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "failed to get top performers"})
		return
	}

	topPerformers := make([]TopPerformer, len(stats))
	for i, s := range stats {
		topPerformers[i] = TopPerformer{
			Email:        s.Email,
			CampaignName: int(s.TotalCampaigns),
			Opened:       int(s.TotalOpened),
			Clicks:       int(s.TotalClicks),
			Submits:      int(s.TotalSubmits),
			ReportLink:   int(s.TotalReported),
		}
	}

	// 9. Browser breakdown (5 teratas)
	var bcounts []struct {
		Browser string
		Count   int64
	}
	db.Model(&models.Event{}).
		Select("browser, count(id) AS count").
		Where("campaign_id IN (?)", campaignSub). // campaignSub digunakan di sini
		Where("browser != ''").
		Group("browser").
		Order("count DESC").
		Limit(5).
		Scan(&bcounts)

	browserData := make([]BrowserStats, len(bcounts))
	for i, bc := range bcounts {
		col := "#6B7280"
		switch bc.Browser {
		case "Chrome":
			col = "#3B82F6"
		case "Firefox":
			col = "#F97316"
		case "Edge":
			col = "#0EA5E9"
		}
		browserData[i] = BrowserStats{Name: bc.Browser, Value: int(bc.Count), Color: col}
	}

	// 10. Return JSON
	dashboard := DashboardData{
		TotalCampaign:   int(totalCampaign),
		TotalSent:       int(totalSent),
		CampaignResults: campaignResults,
		FunnelData:      funnelData,
		CTROverTimeData: ctrOverTime,
		TopPerformers:   topPerformers,
		BrowserData:     browserData,
	}
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "dashboard metrics fetched successfully",
		"data":    dashboard,
	})
}
