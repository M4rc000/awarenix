package models

import "time"

type Group struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	Name         string    `gorm:"not null" json:"name"`
	DomainStatus string    `gorm:"not null" json:"domainStatus"`
	CreatedBy    uint      `gorm:"null" json:"createdBy"`
	UpdatedBy    uint      `gorm:"null" json:"updatedBy"`
	CreatedAt    time.Time `gorm:"null" json:"createdAt"`
	UpdatedAt    time.Time `gorm:"null" json:"updatedAt"`
	// Add Members field for GORM relationship
	Members []Member `gorm:"foreignKey:GroupID"`
}

type Member struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	GroupID   uint      `json:"groupId" gorm:"not null;index;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Name      string    `gorm:"not null" json:"name"`
	Email     string    `gorm:"not null" json:"email"`
	Position  string    `gorm:"not null" json:"position"`
	Company   string    `gorm:"not null" json:"company"`
	Country   string    `gorm:"not null" json:"Country"`
	CreatedBy uint      `gorm:"null" json:"createdBy"`
	UpdatedBy uint      `gorm:"null" json:"updatedBy"`
	CreatedAt time.Time `gorm:"null" json:"createdAt"`
	UpdatedAt time.Time `gorm:"null" json:"updatedAt"`
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
