package models

import "time"

type Group struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name         string    `gorm:"type:varchar(30);uniqueIndex;not null" json:"name"`
	DomainStatus string    `gorm:"type:varchar(50);not null" json:"domainStatus"`
	CreatedAt    time.Time `gorm:"type:datetime;null" json:"createdAt"`
	CreatedBy    int       `gorm:"type:tinyint(3);null" json:"createdBy"`
	UpdatedAt    time.Time `gorm:"type:datetime;null" json:"updatedAt"`
	UpdatedBy    int       `gorm:"type:tinyint(3);null" json:"updatedBy"`
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
	CreatedAt time.Time `gorm:"type:datetime;null" json:"createdAt"`
	CreatedBy int       `gorm:"type:tinyint(3);null" json:"createdBy"`
	UpdatedAt time.Time `gorm:"type:datetime;null" json:"updatedAt"`
	UpdatedBy int       `gorm:"type:tinyint(3);null" json:"updatedBy"`
}

type MemberInput struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Position string `json:"position" binding:"required"`
	Company  string `json:"company"`
	Country  string `json:"country"`
}

type CreateGroupInput struct {
	Name         string        `json:"groupName" binding:"required"`
	DomainStatus string        `json:"domainStatus" binding:"required"`
	Members      []MemberInput `json:"members" binding:"dive"`
	CreatedBy    int           `gorm:"null" json:"createdBy"`
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
	ID            uint             `json:"id"`
	Name          string           `json:"name"`
	DomainStatus  string           `json:"domainStatus"`
	CreatedAt     time.Time        `json:"createdAt"`
	UpdatedAt     time.Time        `json:"updatedAt"`
	Members       []MemberResponse `json:"members"`
	MemberCount   int              `json:"memberCount"`
	CreatedByName string           `json:"createdByName"`
	UpdatedByName string           `json:"updatedByName"`
}

type UpdateGroupRequest struct {
	GroupName    string      `json:"groupName" binding:"required"`
	DomainStatus string      `json:"domainStatus" binding:"required"`
	UpdatedBy    uint        `json:"updatedBy"`
	Members      []NewMember `json:"members" binding:"required"`
}

type NewMember struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Position string `json:"position" binding:"required"`
	Company  string `json:"company"`
	Country  string `json:"country"`
}

type GroupWithUserNames struct {
	Group
	CreatedByName string `json:"createdByName"`
	UpdatedByName string `json:"updatedByName"`
}
