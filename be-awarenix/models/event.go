package models

import (
	"time"

	"gorm.io/datatypes"
)

type EventType string

const (
	Opened    EventType = "opened"
	Clicked   EventType = "clicked"
	Submitted EventType = "submitted"
	Reported  EventType = "reported"
)

type Event struct {
	ID           uint           `gorm:"primaryKey;autoIncrement;type:bigint unsigned" json:"id"`
	RecipientID  uint           `gorm:"column:recipient_id;not null;index;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"recipientId"`
	RecipientRID string         `gorm:"column:recipient_rid;type:char(36);not null;index"   json:"recipientRid"`
	CampaignID   uint           `gorm:"column:campaign_id;not null;index;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"campaignId"`
	Type         EventType      `gorm:"type:enum('opened','clicked','submitted', 'reported');not null;index" json:"type"`
	Timestamp    time.Time      `gorm:"type:datetime(3);not null;default:CURRENT_TIMESTAMP(3)"  json:"timestamp"`
	IP           string         `gorm:"type:varchar(45);index"           json:"ip,omitempty"`
	UserAgent    string         `gorm:"type:text"                        json:"userAgent,omitempty"`
	Browser      string         `gorm:"type:varchar(100)"                json:"browser,omitempty"`
	OS           string         `gorm:"type:varchar(100)"                json:"os,omitempty"`
	Metadata     datatypes.JSON `gorm:"type:json;comment:'raw GET/POST payload'" json:"metadata,omitempty"`
}
