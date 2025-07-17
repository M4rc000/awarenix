package controllers

import (
	"be-awarenix/config" // Asumsi Anda memiliki konfigurasi database di sini
	"be-awarenix/models" // Import models Anda
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
	Name         string `json:"name"`
	CampaignName string `json:"campaignName"`
	Clicks       int    `json:"clicks"`
	Submits      int    `json:"submits"`
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
	// Hitung total email yang dikirim (berdasarkan Recipients yang dibuat)
	var totalSent int64
	// Asumsi status 'sent' untuk Recipient menandakan email telah dikirim.
	// Jika status 'pending' juga dihitung, Anda bisa menghapusnya.
	err := db.Model(&models.Recipient{}).Where("status = ?", "sent").Count(&totalSent).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "failed to count total send email"})
		return
	}

	// --- 2. Campaign Overview Metrics (Sent, Opened, Clicked, Submitted, Reported) ---
	// Ini bisa dihitung dari tabel Event.
	var openedCount, clickedCount, submittedCount, reportedCount int64

	// Count Opened Events
	db.Model(&models.Event{}).Where("type = ?", models.Opened).Count(&openedCount)
	// Count Clicked Events
	db.Model(&models.Event{}).Where("type = ?", models.Clicked).Count(&clickedCount)
	// Count Submitted Events
	db.Model(&models.Event{}).Where("type = ?", models.Submitted).Count(&submittedCount)
	// Count Reported Events
	db.Model(&models.Event{}).Where("type = ?", models.Reported).Count(&reportedCount)

	// Hitung persentase
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
	// Ini akan lebih kompleks karena membutuhkan agregasi berdasarkan waktu.
	// Untuk demo, kita akan mengambil 5 jam terakhir dan menghitung event.
	// Dalam aplikasi nyata, Anda mungkin ingin mengambil data per hari, per jam, dll.
	// sesuai kebutuhan dan efisiensi query.
	var ctrOverTimeData []CTROverTime
	now := time.Now()
	// Loop untuk 5 jam terakhir (atau rentang waktu yang relevan)
	for i := 4; i >= 0; i-- {
		// Mengambil data per jam (contoh sederhana)
		// Anda mungkin perlu menyesuaikan ini untuk zona waktu atau rentang waktu yang lebih spesifik
		hourStart := now.Add(time.Duration(-i) * time.Hour).Truncate(time.Hour)
		hourEnd := hourStart.Add(1 * time.Hour)

		var hourlySent, hourlyOpened, hourlyClicked int64
		// Recipients created within this hour
		db.Model(&models.Recipient{}).Where("created_at >= ? AND created_at < ?", hourStart, hourEnd).Count(&hourlySent)
		// Events within this hour
		db.Model(&models.Event{}).Where("timestamp >= ? AND timestamp < ? AND type = ?", hourStart, hourEnd, models.Opened).Count(&hourlyOpened)
		db.Model(&models.Event{}).Where("timestamp >= ? AND timestamp < ? AND type = ?", hourStart, hourEnd, models.Clicked).Count(&hourlyClicked)

		ctrOverTimeData = append(ctrOverTimeData, CTROverTime{
			Hour:    hourStart.Format("15:00"), // Format jam saja
			Sent:    int(hourlySent),
			Opened:  int(hourlyOpened),
			Clicked: int(hourlyClicked),
		})
	}

	// --- 5. Top Performing Targets ---
	// Agregasi event berdasarkan RecipientID
	var topPerformers []TopPerformer
	// Contoh: 5 pengguna teratas berdasarkan jumlah klik
	var topClicks []struct {
		RecipientID uint  `gorm:"column:recipient_id"`
		Clicks      int64 `gorm:"column:clicks"`
	}
	db.Model(&models.Event{}).
		Select("recipient_id, count(id) as clicks").
		Where("type = ?", models.Clicked).
		Group("recipient_id").
		Order("clicks desc").
		Limit(5).
		Scan(&topClicks)

	for _, tc := range topClicks {
		var submits int64
		var recipient models.Recipient
		db.Where("id = ?", tc.RecipientID).First(&recipient)

		var campaign models.Campaign
		db.Model(&models.Campaign{}).Where("id = ?", recipient.CampaignID).First(&campaign, recipient.CampaignID)

		db.Model(&models.Event{}).
			Where("recipient_id = ? AND type = ?", tc.RecipientID, models.Submitted).
			Count(&submits)

		// Mengambil nama pengguna atau email dari Recipient atau User terkait
		// Asumsi Recipient memiliki email yang bisa digunakan sebagai "nama"
		// Jika Anda memiliki relasi Recipient ke User dan User memiliki nama, gunakan itu.
		performerName := recipient.Email
		if performerName == "" {
			performerName = "Unknown Target"
		}

		topPerformers = append(topPerformers, TopPerformer{
			Name:         performerName,
			CampaignName: campaign.Name,
			Clicks:       int(tc.Clicks),
			Submits:      int(submits),
		})
	}

	// --- 6. Browser/OS Breakdown ---
	var browserData []BrowserStats

	// Agregasi Browser
	var browserCounts []struct {
		Browser string
		Count   int64
	}
	db.Model(&models.Event{}).
		Select("browser, count(id) as count").
		Where("browser IS NOT NULL AND browser != ''").
		Group("browser").
		Order("count desc").
		Limit(5). // Batasi jumlah browser yang ditampilkan
		Scan(&browserCounts)

	for _, bc := range browserCounts {
		// Asumsi warna statis atau Anda memiliki logika untuk menetapkan warna
		color := "#9CA3AF" // Warna default
		switch bc.Browser {
		case "Chrome":
			color = "#3B82F6"
		case "Firefox":
			color = "#F97316"
		case "Edge":
			color = "#0EA5E9"
		default:
			color = "#6B7280" // Gray for others
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
