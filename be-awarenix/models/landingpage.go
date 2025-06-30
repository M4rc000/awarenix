package models

import "time"

type LandingPage struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name      string    `gorm:"type:varchar(30);not null" json:"name"`
	Body      string    `gorm:"type=longtext;null" json:"body"`
	CreatedAt time.Time `gorm:"type:datetime;null" json:"createdAt"`
	CreatedBy int       `gorm:"type:tinyint(3);null" json:"createdBy"`
	UpdatedAt time.Time `gorm:"type:datetime;null" json:"updatedAt"`
	UpdatedBy int       `gorm:"type:tinyint(3);null" json:"updatedBy"`
}
type LandingPageInput struct {
	Name      string    `gorm:"not null" json:"name"`
	Body      string    `gorm:"not null" json:"body"`
	CreatedBy int       `gorm:"null" json:"createdBy"`
	CreatedAt time.Time `gorm:"null" json:"createdAt"`
}

type GetLandingPage struct {
	LandingPage
	CreatedByName string `json:"createdByName"`
	UpdatedByName string `json:"updatedByName"`
}

type UpdateLandingPage struct {
	Name      string `json:"name"`
	Body      string `json:"body"`
	UpdatedAt string `json:"updatedAt"`
	UpdatedBy int8   `json:"updatedBy"`
}
