package models

import "time"

type PhishSettings struct {
	ID                     uint `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID                 uint `gorm:"not null;uniqueIndex" json:"userId"`
	User                   User `gorm:"foreignKey:UserID"`
	PhishingRedirectAction int  `gorm:"type:tinyint(1);default:0;not null" json:"phishingRedirectAction"`
	// 0: Redirect to Awarenix education website
	// 1: Redirect to my own education website
	// 2: Don't do anything

	// Opsional: URL Kustom jika PhishingRedirectAction adalah "Redirect to my own education website"
	CustomEducationURL string `gorm:"type:varchar(255);null" json:"customEducationUrl"`

	CreatedAt time.Time `gorm:"type:datetime;null" json:"createdAt"`
	CreatedBy int       `gorm:"type:tinyint(3);null" json:"createdBy"`
	UpdatedAt time.Time `gorm:"type:datetime;null" json:"updatedAt"`
	UpdatedBy int       `gorm:"type:tinyint(3);null" json:"updatedBy"`
}
