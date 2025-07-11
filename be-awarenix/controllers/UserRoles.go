package controllers

import (
	"net/http"
	"strconv"
	"time"

	"be-awarenix/config"
	"be-awarenix/models"
	"be-awarenix/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CREATE
func RegisterRole(c *gin.Context) {
	var input models.CreateRoleInput

	// BIND & VALIDASI INPUT JSON
	if err := c.ShouldBindJSON(&input); err != nil {
		services.LogActivity(config.DB, c, "Create", "Role", "", nil, input, "failed", "Invalid input: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid input",
			"error":   err.Error(),
		})
		return
	}

	// MULAI TRANSAKSI
	tx := config.DB.Begin()
	if tx.Error != nil {
		services.LogActivity(config.DB, c, "Create", "Role", "", nil, input, "failed", "Failed to start transaction: "+tx.Error.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to start database transaction",
			"error":   tx.Error.Error(),
		})
		return
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			panic(r)
		} else if tx.Error != nil {
			tx.Rollback()
		}
	}()

	// CEK APAKAH NAMA SUDAH DIPAKAI (menggunakan transaksi)
	var existingRole models.Role
	if err := tx.Where("name = ?", input.Name).First(&existingRole).Error; err == nil {
		// Jika role ditemukan, rollback transaksi dan kirim error
		errorMessage := "Role with this name already exists"
		services.LogActivity(config.DB, c, "Create", "Role", "", nil, input, "failed", errorMessage)
		c.JSON(http.StatusConflict, gin.H{
			"status":  "error",
			"message": errorMessage,
			"error":   "Name already exists",
			"fields": map[string]string{
				"name": "Name is already taken",
			},
		})
		return
	} else if err != gorm.ErrRecordNotFound {
		// Tangani error database selain record not found
		services.LogActivity(config.DB, c, "Create", "Role", "", nil, input, "failed", "Database error checking existing role: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to check existing role",
			"error":   err.Error(),
		})
		return
	}

	// BUAT ROLE BARU
	newRole := models.Role{
		Name:      input.Name,
		CreatedAt: time.Now(),
		CreatedBy: input.CreatedBy,
	}

	// SIMPAN KE DATABASE (menggunakan transaksi)
	if err := tx.Create(&newRole).Error; err != nil {
		services.LogActivity(config.DB, c, "Create", "Role", "", nil, newRole, "failed", "Failed to create role in DB: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to create role",
			"error":   err.Error(),
		})
		return
	}

	// COMMIT TRANSAKSI jika semua operasi berhasil
	if err := tx.Commit().Error; err != nil {
		services.LogActivity(config.DB, c, "Create", "Role", strconv.Itoa(int(newRole.ID)), nil, newRole, "failed", "Failed to commit transaction: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to commit transaction",
			"error":   err.Error(),
		})
		return
	}

	// RESPONSE DATA
	roleResponse := models.RoleResponse{
		ID:        newRole.ID,
		Name:      newRole.Name,
		CreatedAt: newRole.CreatedAt,
		CreatedBy: newRole.CreatedBy,
	}

	// Log aktivitas sukses
	services.LogActivity(config.DB, c, "Create", "Role", strconv.Itoa(int(newRole.ID)), nil, newRole, "success", "Role created successfully")

	// RESPONSE SUKSES
	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Role created successfully",
		"data":    roleResponse,
	})
}

// READ (Tidak ada perubahan karena tidak memerlukan transaksi eksplisit atau logging CUD)
func GetRoles(c *gin.Context) {
	query := config.DB.Table("roles").
		Select(`roles.*, 
			created_by_user.name AS created_by_name, 
			updated_by_user.name AS updated_by_name`).
		Joins(`LEFT JOIN users AS created_by_user ON created_by_user.id = roles.created_by`).
		Joins(`LEFT JOIN users AS updated_by_user ON updated_by_user.id = roles.updated_by`)

	var total int64
	query.Count(&total)

	var data []models.GetRoleTable
	if err := query.
		Scan(&data).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to fetch user role",
			"Error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"Success": true,
		"Message": "User Role data retrieved successfully",
		"Data":    data,
		"Total":   total,
	})
}

// UPDATE
func UpdateRole(c *gin.Context) {
	id := c.Param("id")

	// MULAI TRANSAKSI
	tx := config.DB.Begin()
	if tx.Error != nil {
		services.LogActivity(config.DB, c, "Update", "Role", id, nil, nil, "failed", "Failed to start transaction: "+tx.Error.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to start transaction",
			"Error":   tx.Error.Error(),
		})
		return
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			panic(r)
		} else if tx.Error != nil {
			tx.Rollback()
		}
	}()

	var role models.Role
	// Ambil data role sebelum diupdate untuk oldValue
	var oldRoleValue models.Role
	if err := tx.First(&role, id).Error; err != nil {
		services.LogActivity(config.DB, c, "Update", "Role", id, nil, nil, "failed", "Role not found for update: "+err.Error())
		c.JSON(http.StatusNotFound, gin.H{
			"Success": false,
			"Message": "Role not found",
			"Error":   err.Error(),
		})
		return
	}
	oldRoleValue = role // Salin nilai lama sebelum modifikasi

	var updatedData models.UpdateRoleInput
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		services.LogActivity(config.DB, c, "Update", "Role", id, oldRoleValue, nil, "failed", "Invalid request for update: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"Success": false,
			"Message": "Invalid request",
			"Error":   err.Error(),
		})
		return
	}

	// CEK APAKAH NAMA SUDAH DIPAKAI OLEH ROLE LAIN (menggunakan transaksi)
	var existingRole models.Role
	if err := tx.Where("name = ? AND id <> ?", updatedData.Name, id).First(&existingRole).Error; err == nil {
		services.LogActivity(config.DB, c, "Update", "Role", id, oldRoleValue, updatedData, "failed", "Role name already taken by another role")
		c.JSON(http.StatusConflict, gin.H{
			"status":  "error",
			"message": "Role name already exists for another role",
			"error":   "Name already taken",
			"fields": map[string]string{
				"name": "Name is already taken by another role",
			},
		})
		return
	} else if err != gorm.ErrRecordNotFound {
		services.LogActivity(config.DB, c, "Update", "Role", id, oldRoleValue, updatedData, "failed", "Database error checking duplicate role name: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to check existing role name",
			"error":   err.Error(),
		})
		return
	}

	// Perbarui data role
	role.Name = updatedData.Name
	role.UpdatedAt = time.Now()
	role.UpdatedBy = uint(updatedData.UpdatedBy)

	if err := tx.Save(&role).Error; err != nil {
		services.LogActivity(config.DB, c, "Update", "Role", id, oldRoleValue, role, "failed", "Failed to update role in DB: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to update role",
			"Error":   err.Error(),
		})
		return
	}

	// COMMIT TRANSAKSI jika semua operasi berhasil
	if err := tx.Commit().Error; err != nil {
		services.LogActivity(config.DB, c, "Update", "Role", id, oldRoleValue, role, "failed", "Failed to commit update transaction: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to commit transaction",
			"Error":   err.Error(),
		})
		return
	}

	// Log aktivitas sukses
	services.LogActivity(config.DB, c, "Update", "Role", id, oldRoleValue, role, "success", "Role updated successfully")

	c.JSON(http.StatusOK, gin.H{
		"Success": true,
		"Message": "Role updated successfully",
		"Data": gin.H{
			"id":        role.ID,
			"name":      role.Name,
			"updatedAt": role.UpdatedAt,
			"updatedBy": role.UpdatedBy,
		},
	})
}

// DELETE
func DeleteRole(c *gin.Context) {
	roleID := c.Param("id")

	// Validate role ID
	id, err := strconv.ParseUint(roleID, 10, 32)
	if err != nil {
		services.LogActivity(config.DB, c, "Delete", "Role", roleID, nil, nil, "failed", "Invalid role ID format for delete: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid role ID format",
			"error":   "Role ID must be a valid number",
		})
		return
	}

	// Check if role to be deleted exists
	var roleToDelete models.Role
	if err := config.DB.First(&roleToDelete, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			services.LogActivity(config.DB, c, "Delete", "Role", roleID, nil, nil, "failed", "Role not found for deletion: "+err.Error())
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Role not found",
				"error":   "The specified role does not exist",
			})
			return
		}
		services.LogActivity(config.DB, c, "Delete", "Role", roleID, nil, nil, "failed", "Database error checking role for deletion: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Database error",
			"error":   err.Error(),
		})
		return
	}

	// Start database transaction for safe deletion
	tx := config.DB.Begin()
	if tx.Error != nil {
		services.LogActivity(config.DB, c, "Delete", "Role", roleID, nil, nil, "failed", "Failed to start transaction for delete: "+tx.Error.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to start transaction",
			"error":   tx.Error.Error(),
		})
		return
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			panic(r)
		} else if tx.Error != nil {
			tx.Rollback()
		}
	}()

	// Hard Delete role (permanently remove from database)
	if err := tx.Unscoped().Delete(&roleToDelete).Error; err != nil {
		services.LogActivity(config.DB, c, "Delete", "Role", roleID, roleToDelete, nil, "failed", "Failed to delete role from DB: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete role",
			"error":   err.Error(),
		})
		return
	}
	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		services.LogActivity(config.DB, c, "Delete", "Role", roleID, roleToDelete, nil, "failed", "Failed to commit delete transaction: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to commit transaction",
			"error":   err.Error(),
		})
		return
	}

	// Log aktivitas sukses
	services.LogActivity(config.DB, c, "Delete", "Role", roleID, roleToDelete, nil, "success", "Role deleted successfully")

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Role deleted successfully",
		"data": gin.H{
			"deleted_role": gin.H{
				"id":   roleToDelete.ID,
				"name": roleToDelete.Name,
			},
		},
	})
}
