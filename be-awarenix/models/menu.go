package models

import "time"

type Menu struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name      string    `gorm:"type:varchar(50);not null" json:"name"`
	IsActive  int       `gorm:"type:tinyint(1);default:1" json:"isActive"`
	CreatedAt time.Time `gorm:"type:datetime;null" json:"createdAt"`
	CreatedBy int       `gorm:"type:tinyint(3);null" json:"createdBy"`
	UpdatedAt time.Time `gorm:"type:datetime;null" json:"updatedAt"`
	UpdatedBy int       `gorm:"type:tinyint(3);null" json:"updatedBy"`
	Submenus  []Submenu `gorm:"foreignKey:MenuID" json:"submenus,omitempty"`
}
