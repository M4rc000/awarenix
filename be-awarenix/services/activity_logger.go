package services

import (
	"be-awarenix/models"
	"encoding/json"
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// LogActivity mencatat aktivitas pengguna ke tabel activity_logs.
// Menambahkan parameter 'db *gorm.DB' untuk menerima instance database.
func LogActivity(db *gorm.DB, c *gin.Context, action, moduleName, recordID string, oldValue, newValue interface{}, status, errorMessage string) {
	// Mendapatkan ID pengguna dari konteks Gin (diasumsikan disetel oleh middleware JWTAuth)
	var userID uint
	if user, exists := c.Get("user"); exists {
		if u, ok := user.(*models.User); ok {
			userID = u.ID
		}
	}

	// Mendapatkan IP Address dan User Agent
	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	// Mengonversi oldValue dan newValue ke JSON string
	oldValueJSON, err := json.Marshal(oldValue)
	if err != nil {
		log.Printf("Error marshalling old value for activity log: %v", err)
		oldValueJSON = []byte("{}") // Default ke objek JSON kosong jika gagal
	}

	newValueJSON, err := json.Marshal(newValue)
	if err != nil {
		log.Printf("Error marshalling new value for activity log: %v", err)
		newValueJSON = []byte("{}") // Default ke objek JSON kosong jika gagal
	}

	logEntry := models.ActivityLog{
		UserID:       userID,
		Action:       action,
		ModuleName:   moduleName,
		RecordID:     recordID,
		OldValue:     string(oldValueJSON),
		NewValue:     string(newValueJSON),
		Status:       status,       // Set status aksi
		ErrorMessage: errorMessage, // Set pesan kesalahan
		IPAddress:    ipAddress,
		UserAgent:    userAgent,
		Timestamp:    time.Now(),
	}

	// Simpan log ke database
	if err := db.Create(&logEntry).Error; err != nil {
		log.Printf("Failed to save activity log: %v", err)
		// Anda bisa menambahkan metrik atau notifikasi di sini jika logging sangat kritis
	}
}
