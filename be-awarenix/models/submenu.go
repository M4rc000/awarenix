package models

import "time"

type Submenu struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name      string    `gorm:"not null" json:"name"`
	Icon      string    `gorm:"not null" json:"icon"`
	Url       string    `gorm:"not null" json:"url"`
	IsActive  string    `gorm:"not null" json:"isActive"`
	CreatedBy uint      `gorm:"null" json:"createdBy"`
	UpdatedBy uint      `gorm:"null" json:"updatedBy"`
	CreatedAt time.Time `gorm:"null" json:"createdAt"`
	UpdatedAt time.Time `gorm:"null" json:"updatedAt"`
}
