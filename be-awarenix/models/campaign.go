// models/campaign.go
package models

import (
	"time"
)

type Campaign struct {
	ID               uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	Name             string     `gorm:"type:varchar(100);not null"   json:"name"`
	LaunchDate       time.Time  `gorm:"type:datetime;not null"       json:"launchDate"`
	SendEmailBy      *time.Time `gorm:"type:datetime"                json:"sendEmailBy,omitempty"`
	GroupID          uint       `gorm:"not null;index"               json:"groupId"`
	EmailTemplateID  uint       `gorm:"not null;index"               json:"emailTemplateId"`
	LandingPageID    uint       `gorm:"not null;index"               json:"landingPageId"`
	SendingProfileID uint       `gorm:"not null;index"               json:"sendingProfileId"`
	URL              string     `gorm:"type:varchar(255);not null"   json:"url"`
	Status           string     `gorm:"type:varchar(20);default:'draft'" json:"status"`
	CreatedAt        time.Time  `gorm:"type:datetime;null" json:"createdAt"`
	CreatedBy        int        `gorm:"type:tinyint(3);null" json:"createdBy"`
	UpdatedAt        time.Time  `gorm:"type:datetime;null" json:"updatedAt"`
	UpdatedBy        int        `gorm:"type:tinyint(3);null" json:"updatedBy"`

	// Relasi untuk preload
	Group          Group           `gorm:"foreignKey:GroupID" json:"group"`
	EmailTemplate  EmailTemplate   `gorm:"foreignKey:EmailTemplateID" json:"emailTemplate"`
	LandingPage    LandingPage     `gorm:"foreignKey:LandingPageID" json:"landingPage"`
	SendingProfile SendingProfiles `gorm:"foreignKey:SendingProfileID" json:"sendingProfile"`
}

type CampaignRequest struct {
	Name             string  `json:"name" binding:"required"`
	LaunchDate       string  `json:"launch_date" binding:"required"` // String untuk JSON dari frontend
	SendEmailBy      *string `json:"send_email_by,omitempty"`
	GroupID          uint    `json:"group_id" binding:"required"`
	EmailTemplateID  uint    `json:"email_template_id" binding:"required"`
	LandingPageID    uint    `json:"landing_page_id" binding:"required"`
	SendingProfileID uint    `json:"sending_profile_id" binding:"required"`
	URL              string  `json:"url" binding:"required,url"`
	CreatedBy        uint    `json:"created_by"`
	UpdatedBy        uint    `json:"updated_by"`
}

type CampaignResponse struct {
	ID                 int        `json:"id"`
	Name               string     `json:"name"`
	LaunchDate         time.Time  `json:"launch_date"`
	SendEmailBy        *time.Time `json:"send_email_by,omitempty"`
	GroupID            int        `json:"group_id"`
	EmailTemplateID    int        `json:"email_template_id"`
	LandingPageID      int        `json:"landing_page_id"`
	SendingProfileID   int        `json:"sending_profile_id"`
	URL                string     `json:"url"`
	CreatedAt          time.Time  `json:"createdAt"`
	CreatedBy          int        `json:"createdBy"`
	CreatedByName      string     `json:"createdByName"`
	UpdatedAt          time.Time  `json:"updatedAt"`
	UpdatedBy          int        `json:"updatedBy"`
	UpdatedByName      string     `json:"updatedByName"`
	Status             string     `json:"status"`
	GroupName          string     `json:"groupName"`
	EmailTemplateName  string     `json:"emailTemplateName"`
	LandingPageName    string     `json:"landingPageName"`
	SendingProfileName string     `json:"sendingProfileName"`
	CompletedDate      *time.Time `json:"completed_date,omitempty"`
	// Tambahan field untuk statistik kampanye
	EmailSent      int `json:"email_sent"`
	EmailOpened    int `json:"email_opened"`
	EmailClicks    int `json:"email_clicks"`
	EmailSubmitted int `json:"email_submitted"`
	EmailReported  int `json:"email_reported"`
}

type NewCampaignResponse struct {
	Status  string            `json:"status"`
	Message string            `json:"message"`
	Data    interface{}       `json:"data,omitempty"`
	Fields  map[string]string `json:"fields,omitempty"`
}
