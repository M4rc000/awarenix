package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CREATE
func RegisterRole(c *gin.Context) {
	var input models.CreateRoleInput

	// BIND & VALIDASI INPUT JSON
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid input",
			"error":   err.Error(),
		})
		return
	}

	// CEK APAKAH NAMA SUDAH DIPAKAI
	var existingRole models.Role
	if err := config.DB.Where("name = ?", input.Name).First(&existingRole).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"status":  "error",
			"message": "Role with this name already exists",
			"error":   "Name already exists",
			"fields": map[string]string{
				"name": "Name is already taken",
			},
		})
		return
	}

	// BUAT USER BARU
	newRole := models.Role{
		Name:      input.Name,
		CreatedAt: time.Now(),
		CreatedBy: input.CreatedBy,
	}

	// SIMPAN KE DATABASE
	if err := config.DB.Create(&newRole).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to create role",
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

	// RESPONSE SUKSES
	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Role created successfully",
		"data":    roleResponse,
	})
}

// READ
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

	var role models.Role
	if err := config.DB.First(&role, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"Success": false,
			"Message": "Role not found",
			"Error":   err.Error(),
		})
		return
	}

	var updatedData models.UpdateRoleInput

	if err := c.ShouldBindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Success": false,
			"Message": "Invalid request",
			"Error":   err.Error(),
		})
		return
	}

	role.Name = updatedData.Name
	role.UpdatedAt = time.Now()
	role.UpdatedBy = uint(updatedData.UpdatedBy)

	if err := config.DB.Save(&role).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to update role",
			"Error":   err.Error(),
		})
		return
	}

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
	// Get user ID from URL parameter
	userID := c.Param("id")

	// Validate user ID
	id, err := strconv.ParseUint(userID, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid user ID format",
			"error":   "User ID must be a valid number",
		})
		return
	}

	// Check if role to be deleted exists
	var roleToDelete models.Role
	if err := config.DB.First(&roleToDelete, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Role not found",
				"error":   "The specified role does not exist",
			})
			return
		}
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
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to start transaction",
			"error":   tx.Error.Error(),
		})
		return
	}

	// Hard Delete user (permanently remove from database)
	if err := tx.Unscoped().Delete(&roleToDelete).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete user",
			"error":   err.Error(),
		})
		return
	}

	// Optional: Delete related data (sessions, logs, etc.) - HARD DELETE
	// Example: Delete user sessions permanently
	if err := tx.Unscoped().Where("user_id = ?", id).Delete(&models.UserSession{}).Error; err != nil {
		// Log error but don't fail the deletion
		// You might want to handle this differently based on your needs
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to commit transaction",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "User deleted successfully",
		"data": gin.H{
			"deleted_user": gin.H{
				"id":   roleToDelete.ID,
				"name": roleToDelete.Name,
			},
		},
	})
}
