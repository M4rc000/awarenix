package models

import "time"

type EmailTemplate struct {
	ID               uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name             string    `gorm:"type:varchar(30);not null" json:"name"`
	Icon             string    `gorm:"type:varchar(30);null" json:"icon"`
	EnvelopeSender   string    `gorm:"type:varchar(30);not null" json:"envelopeSender"`
	Subject          string    `gorm:"type:varchar(30);not null" json:"subject"`
	Body             string    `gorm:"null;type=longtext" json:"bodyEmail"`
	TrackerImage     int       `gorm:"type:tinyint(1)" json:"trackerImage"`
	IsSystemTemplate int       `gorm:"type:tinyint(1);default:0" json:"isSystemTemplate"`
	CreatedAt        time.Time `gorm:"type:datetime;null" json:"createdAt"`
	CreatedBy        int       `gorm:"type:tinyint(3);null" json:"createdBy"`
	UpdatedAt        time.Time `gorm:"type:datetime;null" json:"updatedAt"`
	UpdatedBy        int       `gorm:"type:tinyint(3);null" json:"updatedBy"`
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
	Name             string    `gorm:"not null" json:"templateName"`
	EnvelopeSender   string    `gorm:"not null" json:"envelopeSender"`
	Subject          string    `gorm:"not null" json:"subject"`
	Body             string    `gorm:"null" json:"bodyEmail"`
	TrackerImage     int       `gorm:"not null" json:"trackerImage"`
	IsSystemTemplate int       `gorm:"null" json:"isSystemTemplate"`
	CreatedBy        int       `gorm:"null" json:"createdBy"`
	CreatedAt        time.Time `gorm:"null" json:"createdAt"`
}

// UPDATE

type EmailTemplateUpdate struct {
	Name             string `json:"templateName"`
	EnvelopSender    string `json:"envelopeSender"`
	Subject          string `json:"subject"`
	Body             string `json:"bodyEmail"`
	TrackerImage     int    `json:"trackerImage"`
	IsSystemTemplate int    `gorm:"null" json:"isSystemTemplate"`
	UpdatedAt        string `json:"updatedAt"`
	UpdatedBy        int8   `json:"updatedBy"`
}
