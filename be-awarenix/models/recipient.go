package models

import "time"

type Recipient struct {
	ID         uint      `gorm:"primaryKey"                     json:"id"`
	UID        string    `gorm:"type:char(36);uniqueIndex;not null" json:"uid"`
	CampaignID uint      `gorm:"not null;index"                 json:"campaignId"`
	UserID     uint      `gorm:"not null;index"                 json:"userId"`
	Email      string    `gorm:"type:varchar(100);not null"     json:"email"`
	Status     string    `gorm:"type:varchar(30);not null;default:'pending'" json:"status"`
	Error      string    `gorm:"type:text"                      json:"error,omitempty"`
	CreatedAt  time.Time `gorm:"autoCreateTime"                 json:"createdAt"`
	UpdatedAt  time.Time `gorm:"type:datetime;null"            json:"updatedAt"`
	Events     []Event   `gorm:"foreignKey:RecipientID"`
}
