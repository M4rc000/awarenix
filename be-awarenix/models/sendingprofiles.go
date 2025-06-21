package models

import "time"

type SendingProfiles struct {
	ID            uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name          string    `gorm:"not null" json:"name"`
	InterfaceType string    `gorm:"null" json:"body"`
	SmtpFrom      string    `gorm:"null" json:"body"`
	Host          string    `gorm:"null" json:"body"`
	Username      string    `gorm:"null" json:"body"`
	CreatedBy     uint      `gorm:"null" json:"createdBy"`
	UpdatedBy     uint      `gorm:"null" json:"updatedBy"`
	CreatedAt     time.Time `gorm:"null" json:"createdAt"`
	UpdatedAt     time.Time `gorm:"null" json:"updatedAt"`
}
