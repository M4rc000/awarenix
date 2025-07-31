package models

import (
	"time"

	"gorm.io/gorm"
)

// Attachment represents the database model for an email attachment.
type Attachment struct {
	ID uint `gorm:"primaryKey;autoIncrement" json:"id"`
	// PERBAIKAN: Ubah tipe gorm untuk EmailTemplateID agar cocok dengan tipe ID di EmailTemplate (uint -> unsigned integer di DB)
	EmailTemplateID  *uint          `gorm:"type:int unsigned;null" json:"emailTemplateId"` // Foreign key to EmailTemplate, can be null initially
	OriginalFilename string         `gorm:"type:varchar(255);not null" json:"originalFilename"`
	StoredFilename   string         `gorm:"type:varchar(255);not null;unique" json:"storedFilename"` // Unique name on disk
	FilePath         string         `gorm:"type:varchar(255);not null" json:"filePath"`              // Path relative to storage root
	FileSize         int64          `gorm:"type:bigint;not null" json:"fileSize"`
	MimeType         string         `gorm:"type:varchar(100);not null" json:"mimeType"`
	CreatedAt        time.Time      `gorm:"type:datetime;null" json:"createdAt"`
	UpdatedAt        time.Time      `gorm:"type:datetime;null" json:"updatedAt"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"` // For soft delete
}

// AttachmentInput defines the structure for receiving attachment data from the frontend during upload.
type AttachmentInput struct {
	// No direct input fields for file content here, as it's handled by multipart form data.
	// This struct is more for the *metadata* we might expect if not handling direct file upload
	// in a single JSON payload. For multipart, Gin handles the file directly.
}

// AttachmentResponse defines the structure for sending attachment metadata back to the frontend after upload.
type AttachmentResponse struct {
	ID               uint   `json:"id"`
	OriginalFilename string `json:"originalFilename"`
	StoredFilename   string `json:"storedFilename"`
	FilePath         string `json:"filePath"`
	FileSize         int64  `json:"fileSize"`
	MimeType         string `json:"mimeType"`
}

// AttachmentMetadata defines the structure for receiving pre-uploaded attachment IDs from the frontend
// when creating/updating an email template.
type AttachmentMetadata struct {
	ID uint `json:"id"` // The ID of the already uploaded attachment
}
