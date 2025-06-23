package models

import "time"

type Group struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name         string    `gorm:"type:varchar(30);uniqueIndex;not null" json:"name"`
	DomainStatus string    `gorm:"type:varchar(50);not null" json:"domainStatus"`
	CreatedBy    uint      `gorm:"type:bigint;null" json:"createdBy"`
	UpdatedBy    uint      `gorm:"type:bigint;null" json:"updatedBy"`
	CreatedAt    time.Time `gorm:"type:datetime;null" json:"createdAt"`
	UpdatedAt    time.Time `gorm:"type:datetime;null" json:"updatedAt"`
	Members      []Member  `gorm:"foreignKey:GroupID"`
}

type Member struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	GroupID   uint      `gorm:"not null;index;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"groupId"`
	Name      string    `gorm:"type:varchar(30);not null" json:"name"`
	Email     string    `gorm:"type:varchar(50);not null" json:"email"`
	Position  string    `gorm:"type:varchar(30);not null" json:"position"`
	Company   string    `gorm:"type:varchar(50);null" json:"company"`
	Country   string    `gorm:"type:varchar(50);null" json:"Country"`
	CreatedBy uint      `gorm:"type:bigint;null" json:"createdBy"`
	UpdatedBy uint      `gorm:"type:bigint;null" json:"updatedBy"`
	CreatedAt time.Time `gorm:"type:datetime;null" json:"createdAt"`
	UpdatedAt time.Time `gorm:"type:datetime;null" json:"updatedAt"`
}

type MemberInput struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Position string `json:"position" binding:"required"`
	Company  string `json:"company"` // Optional, or make required if needed
	Country  string `json:"country"` // Optional, or make required if needed
}

type CreateGroupInput struct {
	Name         string        `json:"groupName" binding:"required"`
	DomainStatus string        `json:"domainStatus" binding:"required"` // Assuming this is set by frontend
	Members      []MemberInput `json:"members" binding:"dive"`          // "dive" to validate each item in the slice
	CreatedBy    uint          `gorm:"null" json:"createdBy"`
}

type MemberResponse struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Position  string    `json:"position"`
	Company   string    `json:"company"`
	Country   string    `json:"Country"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type GroupResponse struct {
	ID           uint             `json:"id"`
	Name         string           `json:"name"`
	DomainStatus string           `json:"domainStatus"`
	CreatedAt    time.Time        `json:"createdAt"`
	UpdatedAt    time.Time        `json:"updatedAt"`
	Members      []MemberResponse `json:"members"`
	MemberCount  int              `json:"memberCount"` // Added this field
}
