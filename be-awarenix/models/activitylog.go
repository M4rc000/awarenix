package models

import (
	"time"

	"gorm.io/gorm"
)

type ActivityLog struct {
	gorm.Model
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     uint      `json:"user_id"`                    // ID pengguna yang melakukan aksi
	Action     string    `json:"action"`                     // Tipe aksi (e.g., "CREATE", "UPDATE", "DELETE")
	ModuleName string    `json:"module_name"`                // Modul yang terpengaruh (e.g., "User", "Role", "EmailTemplate")
	RecordID   string    `json:"record_id"`                  // ID dari record yang terpengaruh (string untuk fleksibilitas)
	OldValue   string    `gorm:"type:text" json:"old_value"` // Data sebelum perubahan (JSON string)
	NewValue   string    `gorm:"type:text" json:"new_value"` // Data setelah perubahan (JSON string)
	Status     string    `json:"status"`                     // Status aksi (e.g., "SUCCESS", "FAILED")
	Message    string    `gorm:"type:text" json:"message"`   // Pesan kesalahan jika aksi gagal
	IPAddress  string    `json:"ip_address"`                 // Alamat IP klien
	UserAgent  string    `json:"user_agent"`                 // User Agent klien
	Timestamp  time.Time `json:"timestamp"`                  // Waktu aksi dilakukan
}

type GetActivityLog struct {
	ActivityLog
	UserName   string `json:"userName"`
	RecordName string `json:"recordName"`
}
