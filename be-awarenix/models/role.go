package models

import "time"

type Role struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name      string    `gorm:"type:varchar(50);uniqueIndex;not null" json:"name"`
	IsActive  int       `gorm:"type:tinyint(1);default:1" json:"isActive"`
	CreatedAt time.Time `gorm:"type:datetime;null" json:"createdAt"`
	CreatedBy uint      `gorm:"type:bigint;null" json:"createdBy"`
	UpdatedBy uint      `gorm:"type:bigint;null" json:"updatedBy"`
	UpdatedAt time.Time `gorm:"type:datetime;null" json:"updatedAt"`
}
