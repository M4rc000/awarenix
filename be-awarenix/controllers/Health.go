package controllers

import (
	"be-awarenix/config"
	"net/http"

	"github.com/gin-gonic/gin"
)

func HealthCheck(c *gin.Context) {
	// Inisialisasi status awal
	apiStatus := "Running"
	dbStatus := "Running"
	message := "API is healthy and operational"
	statusCode := http.StatusOK

	// Cek koneksi database
	// Asumsi: config.DB adalah instance *gorm.DB yang sudah terinisialisasi
	// Jika Anda menggunakan cara lain untuk mengakses DB, sesuaikan di sini.
	sqlDB, err := config.DB.DB() // Mendapatkan underlying *sql.DB dari GORM
	if err != nil {
		dbStatus = "Stop"
		apiStatus = "Stop"
		message = "Database connection not available"
		statusCode = http.StatusServiceUnavailable
	} else {
		err = sqlDB.Ping() // Melakukan ping ke database
		if err != nil {
			dbStatus = "Stop"
			apiStatus = "Stop"
			message = "Database connection failed: " + err.Error()
			statusCode = http.StatusServiceUnavailable
		}
	}

	// Kirim respons JSON
	c.JSON(statusCode, gin.H{
		"status":          apiStatus,
		"database_status": dbStatus,
		"message":         message,
	})
}
