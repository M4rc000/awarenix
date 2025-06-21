package models

import "time"

type Group struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	Name         string    `gorm:"not null" json:"name"`
	DomainStatus string    `gorm:"not null" json:"domainStatus"`
	CreatedBy    uint      `gorm:"null" json:"createdBy"`
	UpdatedBy    uint      `gorm:"null" json:"updatedBy"`
	CreatedAt    time.Time `gorm:"null" json:"createdAt"`
	UpdatedAt    time.Time `gorm:"null" json:"updatedAt"`
}
