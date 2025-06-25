package models

import "time"

type SendingProfiles struct {
	ID            uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name          string    `gorm:"type:varchar(50);not null" json:"name"`
	InterfaceType string    `gorm:"type:varchar(30);null" json:"interfaceType"`
	SmtpFrom      string    `gorm:"type:varchar(30);null" json:"smtpFrom"`
	Host          string    `gorm:"type:varchar(20);null" json:"host"`
	CreatedAt     time.Time `gorm:"type:datetime;null" json:"createdAt"`
	CreatedBy     int       `gorm:"type:tinyint(3);null" json:"createdBy"`
	UpdatedAt     time.Time `gorm:"type:datetime;null" json:"updatedAt"`
	UpdatedBy     int       `gorm:"type:tinyint(3);null" json:"updatedBy"`
}
