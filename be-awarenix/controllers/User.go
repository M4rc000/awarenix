package controllers

import (
	"net/http"
	"strconv"
	"time"

	"be-awarenix/config"
	"be-awarenix/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// UserResponse untuk response ke frontend (tanpa password)
type UserResponse struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Position  string    `json:"position"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// CREATE
func RegisterUser(c *gin.Context) {
	var input models.CreateUserInput

	// BIND & VALIDASI INPUT JSON
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid input",
			"error":   err.Error(),
		})
		return
	}

	// CEK APAKAH EMAIL SUDAH DIPAKAI
	var existingUser models.User
	if err := config.DB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"status":  "error",
			"message": "User with this email already registered",
			"error":   "Email already exists",
			"fields": map[string]string{
				"email": "Email is already taken",
			},
		})
		return
	}

	// HASH PASSWORD
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to process password",
			"error":   "Password hashing failed",
		})
		return
	}

	// BUAT USER BARU
	newUser := models.User{
		Name:         input.Name,
		Email:        input.Email,
		Position:     input.Position,
		Role:         input.Role,
		Company:      input.Company,
		PasswordHash: string(hashedPassword),
		CreatedAt:    time.Now(),
		CreatedBy:    input.CreatedBy,
	}

	// SIMPAN KE DATABASE
	if err := config.DB.Create(&newUser).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to create user",
			"error":   err.Error(),
		})
		return
	}

	// RESPONSE DATA
	userResponse := UserResponse{
		ID:        newUser.ID,
		Name:      newUser.Name,
		Email:     newUser.Email,
		Position:  newUser.Position,
		CreatedAt: newUser.CreatedAt,
		UpdatedAt: newUser.UpdatedAt,
	}

	// RESPONSE SUKSES
	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "User created successfully",
		"data":    userResponse,
	})
}

// READ
func GetUsers(c *gin.Context) {
	query := config.DB.Table("users").
		Select(`users.*, 
            created_by_user.name AS created_by_name, 
            updated_by_user.name AS updated_by_name`).
		Joins(`LEFT JOIN users AS created_by_user ON created_by_user.id = users.created_by`).
		Joins(`LEFT JOIN users AS updated_by_user ON updated_by_user.id = users.updated_by`)

	var total int64
	query.Count(&total)

	var data []models.GetUserTable
	if err := query.
		Scan(&data).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to fetch user data",
			"Error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"Success": true,
		"Message": "User data retrieved successfully",
		"Data":    data,
		"Total":   total,
	})
}

// UPDATE
func UpdateUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"Success": false,
			"Message": "User not found",
			"Error":   err.Error(),
		})
		return
	}

	var updatedData models.UpdateUserInput

	if err := c.ShouldBindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Success": false,
			"Message": "Invalid request",
			"Error":   err.Error(),
		})
		return
	}

	user.Name = updatedData.Name
	user.Email = updatedData.Email
	user.Position = updatedData.Position
	user.Company = updatedData.Company
	user.Role = updatedData.Role
	user.IsActive = updatedData.IsActive
	user.UpdatedAt = time.Now()
	user.UpdatedBy = updatedData.UpdatedBy
	user.UpdatedBy = updatedData.UpdatedBy

	// Hash password
	// Cek apakah password diisi
	if updatedData.Password != "" {
		if len(updatedData.Password) < 6 {
			c.JSON(http.StatusBadRequest, gin.H{
				"Success": false,
				"Message": "Password must be at least 6 characters",
			})
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(updatedData.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"Success": false,
				"Message": "Password hashing failed",
				"Error":   err.Error(),
			})
			return
		}
		user.PasswordHash = string(hashedPassword)
	}

	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to update user",
			"Error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"Success": true,
		"Message": "User updated successfully",
		"Data": gin.H{
			"id":       user.ID,
			"name":     user.Name,
			"email":    user.Email,
			"position": user.Position,
			"role":     user.Role,
		},
	})
}

// DELETE
func DeleteUser(c *gin.Context) {
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

	// Get current user from JWT token (from middleware)
	currentUser, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized access",
			"error":   "User session not found",
		})
		return
	}

	// Type assertion to get user data
	user := currentUser.(*models.User)

	// Prevent user from deleting themselves
	if user.ID == uint(id) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Cannot delete your own account",
			"error":   "Self-deletion is not allowed",
		})
		return
	}

	// Check if user to be deleted exists
	var userToDelete models.User
	if err := config.DB.First(&userToDelete, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "User not found",
				"error":   "The specified user does not exist",
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
	if err := tx.Unscoped().Delete(&userToDelete).Error; err != nil {
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
				"id":       userToDelete.ID,
				"name":     userToDelete.Name,
				"email":    userToDelete.Email,
				"position": userToDelete.Position,
			},
		},
	})
}
