package models

import "time"

type LandingPage struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name      string    `gorm:"not null" json:"name"`
	Body      string    `gorm:"null" json:"body"`
	CreatedBy uint      `gorm:"null" json:"createdBy"`
	UpdatedBy uint      `gorm:"null" json:"updatedBy"`
	CreatedAt time.Time `gorm:"null" json:"createdAt"`
	UpdatedAt time.Time `gorm:"null" json:"updatedAt"`
}
