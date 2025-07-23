package models

import "time"

type EmailHeader struct {
	ID               uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	SendingProfileID uint      `json:"sendingProfileId"`
	Header           string    `json:"header"`
	Value            string    `json:"value"`
	CreatedAt        time.Time `gorm:"type:datetime;null" json:"createdAt"`
	CreatedBy        int       `gorm:"type:tinyint(3);null" json:"createdBy"`
	UpdatedAt        time.Time `gorm:"type:datetime;null" json:"updatedAt"`
	UpdatedBy        int       `gorm:"type:tinyint(3);null" json:"updatedBy"`
}

type SendingProfiles struct {
	ID            uint          `gorm:"primaryKey;autoIncrement" json:"id"`
	Name          string        `gorm:"type:varchar(50);not null" json:"name"`
	InterfaceType string        `gorm:"type:varchar(30);null" json:"interfaceType"`
	SmtpFrom      string        `gorm:"type:varchar(50);null" json:"smtpFrom"`
	Username      string        `gorm:"type:varchar(50);null" json:"username"`
	Password      string        `gorm:"type:varchar(128);null" json:"-"`
	Host          string        `gorm:"type:varchar(50);null" json:"host"`
	Port          int           `gorm:"type:int;not null;default:587"   json:"port"`
	EmailHeaders  []EmailHeader `gorm:"foreignKey:SendingProfileID;references:ID" json:"emailHeaders"`
	CreatedAt     time.Time     `gorm:"type:datetime;null" json:"createdAt"`
	CreatedBy     int           `gorm:"type:tinyint(3);null" json:"createdBy"`
	UpdatedAt     time.Time     `gorm:"type:datetime;null" json:"updatedAt"`
	UpdatedBy     int           `gorm:"type:tinyint(3);null" json:"updatedBy"`
}

type UpdateSendingProfileRequest struct {
	Name          string `json:"name" binding:"required"`
	InterfaceType string `json:"interfaceType"`
	SmtpFrom      string `json:"smtpFrom" binding:"required,email"`
	Host          string `json:"host" binding:"required"`
	Username      string `json:"username" binding:"required"`
	Password      string `json:"password"`
	UpdatedBy     int    `gorm:"type:tinyint(3);null" json:"updatedBy"`
}

type CreateSendingProfileRequest struct {
	Name          string        `json:"name" binding:"required"`
	InterfaceType string        `json:"interfaceType"`
	SmtpFrom      string        `json:"smtpFrom" binding:"required"`
	Host          string        `json:"host" binding:"required"`
	Port          int           `json:"port"`
	Username      string        `json:"username" binding:"required"`
	Password      string        `json:"password" binding:"required"`
	EmailHeaders  []EmailHeader `json:"emailHeaders"`
	CreatedBy     int           `json:"createdBy"`
}

type GetSendingProfile struct {
	SendingProfiles
	CreatedByName string `json:"createdByName"`
	UpdatedByName string `json:"updatedByName"`
}

type TestRecipient struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Position string `json:"position"`
}

type SendTestEmailRequest struct {
	SendingProfile struct {
		ID            uint          `json:"id"`
		Name          string        `json:"name" binding:"required"`
		InterfaceType string        `json:"interfaceType" binding:"required"`
		Port          int           `json:"port"`
		SmtpFrom      string        `json:"smtpFrom" binding:"required,email"`
		Username      string        `json:"username"`
		Password      string        `json:"password"`
		Host          string        `json:"host"`
		EmailHeaders  []EmailHeader `json:"emailHeaders"`
	} `json:"sendingProfile" binding:"required"`
	Recipient TestRecipient `json:"recipient" binding:"required"`
	EmailBody string        `json:"emailBody" binding:"required"`
}
