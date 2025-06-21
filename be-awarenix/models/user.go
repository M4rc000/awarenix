package models

import "time"

type User struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name         string    `gorm:"not null" json:"name"`
	Email        string    `gorm:"uniqueIndex;not null" json:"email"`
	Position     string    `gorm:"not null" json:"position"`
	PasswordHash string    `gorm:"not null" json:"password"`
	IsActive     int       `gorm:"default:1" json:"isActive"`
	Role         string    `gorm:"null" json:"role"`
	Company      string    `gorm:"null" json:"company"`
	Country      string    `gorm:"null" json:"country"`
	LastLogin    time.Time `gorm:"null" json:"lastLogin"`
	CreatedBy    uint      `gorm:"null" json:"createdBy"`
	UpdatedBy    uint      `gorm:"null" json:"updatedBy"`
	CreatedAt    time.Time `gorm:"null" json:"createdAt"`
	UpdatedAt    time.Time `gorm:"null" json:"updatedAt"`
}

type GetUserTable struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Position  string    `json:"position"`
	IsActive  bool      `json:"isActive"`
	Role      string    `json:"role"`
	Company   string    `json:"company"`
	Country   string    `json:"country"`
	LastLogin time.Time `json:"lastLogin"`
	CreatedBy uint      `json:"createdBy"`
	UpdatedBy uint      `json:"updatedBy"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type CreateUserInput struct {
	Name      string    `json:"name"     binding:"required"`
	Email     string    `json:"email"    binding:"required,email"`
	Position  string    `json:"position" binding:"required"`
	Company   string    `json:"company"`
	Role      string    `json:"role"`
	Password  string    `json:"password" binding:"required,min=6"`
	CreatedAt time.Time `gorm:"null" json:"createdAt"`
	CreatedBy uint      `gorm:"null" json:"createdBy"`
}
type UpdateUserInput struct {
	Name      string    `json:"name"     binding:"required"`
	Email     string    `json:"email"    binding:"required,email"`
	Position  string    `json:"position" binding:"required"`
	Role      string    `json:"role"`
	Company   string    `json:"company"`
	IsActive  int       `json:"isActive"`
	Password  string    `json:"password"`
	UpdatedAt time.Time `gorm:"null"`
	UpdatedBy uint      `gorm:"null" json:"updatedBy"`
}

type UserSession struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Token     string    `json:"token" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `json:"expires_at"`
}

type GetUserSession struct {
	ID uint `json:"user_id" gorm:"primaryKey"`
}
