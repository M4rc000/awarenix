package models

import "time"

type Role struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name      string    `gorm:"type:varchar(50);uniqueIndex;not null" json:"name"`
	IsActive  int       `gorm:"type:tinyint(1);default:1" json:"isActive"`
	CreatedAt time.Time `gorm:"type:datetime;null" json:"createdAt"`
	CreatedBy uint      `gorm:"type:bigint;null" json:"createdBy"`
	UpdatedBy uint      `gorm:"type:bigint;null" json:"updatedBy"`
	UpdatedAt time.Time `gorm:"type:datetime;null" json:"updatedAt"`
}

type RoleMenuAccess struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	RoleID    uint      `gorm:"not null" json:"roleId"`
	Role      Role      `gorm:"foreignKey:RoleID" json:"-"`
	MenuID    uint      `gorm:"not null" json:"menuId"`
	Menu      Menu      `gorm:"foreignKey:MenuID" json:"-"`
	CreatedAt time.Time `gorm:"type:datetime;null" json:"createdAt"`
	UpdatedAt time.Time `gorm:"type:datetime;null" json:"updatedAt"`
}

type RoleSubmenuAccess struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	RoleID    uint      `gorm:"not null" json:"roleId"`
	Role      Role      `gorm:"foreignKey:RoleID" json:"-"`
	SubmenuID uint      `gorm:"not null" json:"submenuId"`
	Submenu   Submenu   `gorm:"foreignKey:SubmenuID" json:"-"`
	CreatedAt time.Time `gorm:"type:datetime;null" json:"createdAt"`
	UpdatedAt time.Time `gorm:"type:datetime;null" json:"updatedAt"` // Perbaiki tag gorm di sini, dari updatedBy menjadi updatedAt
}

type RoleResponse struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	CreatedBy uint      `json:"created_by"`
}

type CreateRoleInput struct {
	Name      string    `json:"name"     binding:"required"`
	CreatedAt time.Time `gorm:"null" json:"createdAt"`
	CreatedBy uint      `gorm:"null" json:"createdBy"`
}
type GetRoleTable struct {
	Role
	CreatedByName string `json:"createdByName"`
	UpdatedByName string `json:"updatedByName"`
}

type UpdateRoleInput struct {
	Name      string    `json:"name"     binding:"required"`
	UpdatedAt time.Time `gorm:"null"`
	UpdatedBy int       `gorm:"null" json:"updatedBy"`
}
