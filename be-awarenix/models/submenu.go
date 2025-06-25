package models

import "time"

type Submenu struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	MenuID    uint      `gorm:"not null" json:"menuId"`
	Menu      Menu      `gorm:"foreignKey:MenuID" json:"-"`
	Name      string    `gorm:"type:varchar(50);not null" json:"name"`
	Icon      string    `gorm:"type:varchar(20);not null" json:"icon"`
	Url       string    `gorm:"type:varchar(30);not null" json:"url"`
	IsActive  int       `gorm:"type:tinyint(1);default:1" json:"isActive"`
	CreatedAt time.Time `gorm:"type:datetime;null" json:"createdAt"`
	CreatedBy int       `gorm:"type:tinyint(3);null" json:"createdBy"`
	UpdatedAt time.Time `gorm:"type:datetime;null" json:"updatedAt"`
	UpdatedBy int       `gorm:"type:tinyint(3);null" json:"updatedBy"`
}
