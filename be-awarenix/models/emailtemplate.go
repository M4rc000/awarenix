package models

import "time"

type EmailTemplate struct {
	ID             uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name           string    `gorm:"not null" json:"name"`
	EnvelopeSender string    `gorm:"not null" json:"envelopeSender"`
	Subject        string    `gorm:"not null" json:"subject"`
	Body           string    `gorm:"null;type=longtext" json:"bodyEmail"`
	CreatedBy      uint      `gorm:"null" json:"createdBy"`
	UpdatedBy      uint      `gorm:"null" json:"updatedBy"`
	CreatedAt      time.Time `gorm:"null" json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

type EmailTemplateInput struct {
	Name           string    `gorm:"not null" json:"templateName"`
	EnvelopeSender string    `gorm:"not null" json:"envelopeSender"`
	Subject        string    `gorm:"not null" json:"subject"`
	Body           string    `gorm:"null" json:"bodyEmail"`
	CreatedBy      uint      `gorm:"null" json:"createdBy"`
	CreatedAt      time.Time `gorm:"null" json:"createdAt"`
}
