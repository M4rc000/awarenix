package models

import "time"

type EmailTemplate struct {
	ID             uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name           string    `gorm:"type:varchar(30);not null" json:"name"`
	EnvelopeSender string    `gorm:"type:varchar(30);not null" json:"envelopeSender"`
	Subject        string    `gorm:"type:varchar(30);not null" json:"subject"`
	Body           string    `gorm:"null;type=longtext" json:"bodyEmail"`
	CreatedAt      time.Time `gorm:"type:datetime;null" json:"createdAt"`
	CreatedBy      int       `gorm:"type:tinyint(3);null" json:"createdBy"`
	UpdatedAt      time.Time `gorm:"type:datetime;null" json:"updatedAt"`
	UpdatedBy      int       `gorm:"type:tinyint(3);null" json:"updatedBy"`
}

type EmailTemplateInput struct {
	Name           string    `gorm:"not null" json:"templateName"`
	EnvelopeSender string    `gorm:"not null" json:"envelopeSender"`
	Subject        string    `gorm:"not null" json:"subject"`
	Body           string    `gorm:"null" json:"bodyEmail"`
	CreatedBy      int       `gorm:"null" json:"createdBy"`
	CreatedAt      time.Time `gorm:"null" json:"createdAt"`
}
