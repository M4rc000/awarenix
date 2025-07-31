package models

import "time"

type EmailTemplate struct {
	ID               uint         `gorm:"primaryKey;autoIncrement" json:"id"`
	Name             string       `gorm:"type:varchar(30);not null" json:"name"`
	Icon             string       `gorm:"type:varchar(30);null" json:"icon"`
	EnvelopeSender   string       `gorm:"type:varchar(50);not null" json:"envelopeSender"`
	Subject          string       `gorm:"type:varchar(100);not null" json:"subject"`
	Body             string       `gorm:"null;type=longtext" json:"bodyEmail"`
	IsSystemTemplate int          `gorm:"type:tinyint(1);default:0" json:"isSystemTemplate"`
	Language         string       `gorm:"type:varchar(20);default:indonesia" json:"language"`
	CreatedAt        time.Time    `gorm:"type:datetime;null" json:"createdAt"`
	CreatedBy        int          `gorm:"type:tinyint(3);null" json:"createdBy"`
	UpdatedAt        time.Time    `gorm:"type:datetime;null" json:"updatedAt"`
	UpdatedBy        int          `gorm:"type:tinyint(3);null" json:"updatedBy"`
	Attachments      []Attachment `gorm:"foreignKey:EmailTemplateID" json:"attachments,omitempty"`
}

type EmailTemplateWithUsers struct {
	EmailTemplate
	CreatedByName string `json:"createdByName"`
	UpdatedByName string `json:"updatedByName"`
}

type DefaultEmailTemplate struct {
	Name string `json:"name"`
	Body string `json:"body"`
}

// CREATE
type EmailTemplateInput struct {
	Name             string               `json:"templateName" binding:"required"`
	EnvelopeSender   string               `json:"envelopeSender" binding:"required,email"`
	Subject          string               `json:"subject" binding:"required"`
	Body             string               `json:"bodyEmail"`
	IsSystemTemplate int                  `json:"isSystemTemplate"`
	Language         string               `json:"language"`
	CreatedBy        int                  `json:"createdBy"`
	Attachments      []AttachmentMetadata `json:"attachments"`
}

// UPDATE
type EmailTemplateUpdate struct {
	Name             string               `json:"templateName" binding:"required"`
	EnvelopSender    string               `json:"envelopeSender" binding:"required,email"`
	Subject          string               `json:"subject" binding:"required"`
	Body             string               `json:"bodyEmail"`
	IsSystemTemplate int32                `json:"isSystemTemplate"`
	Language         string               `json:"language"`
	UpdatedBy        int32                `json:"updatedBy"`
	Attachments      []AttachmentMetadata `json:"attachments"`
}
