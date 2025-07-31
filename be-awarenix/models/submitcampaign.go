package models

import "time"

type SubmitCampaign struct {
	ID           uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	RecipientUID string `gorm:"type:varchar(36);not null" json:"rid"`
	CampaignID   uint   `gorm:"type:int;not null" json:"campaign_id"`

	Username string `gorm:"type:varchar(50);not null" json:"username"`
	Email    string `gorm:"type:varchar(100);not null" json:"email"`
	Password string `gorm:"type:varchar(255);not null" json:"password"`

	CreatedAt time.Time `gorm:"type:datetime;null" json:"createdAt"`
}
