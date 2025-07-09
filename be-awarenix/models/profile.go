package models

import "time"

type UpdateProfileInput struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"     binding:"required"`
	Position  string    `json:"position"`
	Company   string    `json:"company"`
	Country   string    `json:"country"`
	UpdatedAt time.Time `gorm:"null" json:"updatedAt"`
	UpdatedBy int       `gorm:"null" json:"updatedBy"`
}

type UpdatePhishSettingPayload struct {
	PhishingRedirectAction int     `json:"phishingRedirectAction"`
	CustomEducationURL     *string `json:"customEducationUrl"`
}
