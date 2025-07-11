package controllers

import (
	"net/http"
	"strconv"
	"time"

	"be-awarenix/config"
	"be-awarenix/models"
	"be-awarenix/services"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

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

	// MULAI TRANSAKSI
	tx := config.DB.Begin()
	if tx.Error != nil {
		services.LogActivity(config.DB, c, "Create", "User Management", "", nil, input, "failed", "Failed to start transaction: "+tx.Error.Error())
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

	// CEK APAKAH EMAIL SUDAH DIPAKAI (menggunakan transaksi)
	var existingUser models.User
	if err := tx.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		tx.Rollback()
		errorMessage := "Email already exists"
		services.LogActivity(config.DB, c, "Create", "User Management", "", nil, input, "failed", errorMessage)
		c.JSON(http.StatusConflict, gin.H{
			"status":  "error",
			"message": "User with this email already registered",
			"error":   errorMessage,
			"fields": map[string]string{
				"email": "Email is already taken",
			},
		})
		return
	} else if err != gorm.ErrRecordNotFound {
		tx.Rollback()
		services.LogActivity(config.DB, c, "Create", "User Management", "", nil, input, "failed", "Failed to check existing user"+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to check existing user",
			"error":   err.Error(),
		})
		return
	}

	// HASH PASSWORD
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		tx.Rollback()
		services.LogActivity(config.DB, c, "Create", "User Management", "", nil, input, "failed", "Password hashing failed")
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

	// SIMPAN KE DATABASE (menggunakan transaksi)
	if err := tx.Create(&newUser).Error; err != nil {
		services.LogActivity(config.DB, c, "Create", "User Management", "", nil, newUser, "failed", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to create user",
			"error":   err.Error(),
		})
		return
	}

	// COMMIT TRANSAKSI jika semua operasi berhasil
	if err := tx.Commit().Error; err != nil {
		services.LogActivity(config.DB, c, "Create", "User Management", "", nil, newUser, "failed", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to commit transaction",
			"error":   err.Error(),
		})
		return
	}

	// RESPONSE DATA
	userResponse := models.UserResponse{
		ID:        newUser.ID,
		Name:      newUser.Name,
		Email:     newUser.Email,
		Position:  newUser.Position,
		CreatedAt: newUser.CreatedAt,
		UpdatedAt: newUser.UpdatedAt,
	}

	// Log aktivitas sukses
	services.LogActivity(config.DB, c, "Create", "User Management", strconv.Itoa(int(newUser.ID)), nil, newUser, "success", "User created successfully")

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
		Select(`users.*,  created_by_user.name AS created_by_name,  updated_by_user.name AS updated_by_name, roles_user.name AS role_name`).
		Joins(`LEFT JOIN users AS created_by_user ON created_by_user.id = users.created_by`).
		Joins(`LEFT JOIN users AS updated_by_user ON updated_by_user.id = users.updated_by`).
		Joins(`LEFT JOIN roles AS roles_user ON roles_user.id = users.role`)

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

	// Mulai transaksi
	tx := config.DB.Begin()
	if tx.Error != nil {
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

	var user models.User
	// Ambil data user sebelum diupdate untuk oldValue
	var oldUserValue models.User
	if err := tx.First(&user, id).Error; err != nil {
		services.LogActivity(config.DB, c, "Update", "User Management", id, nil, nil, "failed", "User not found for update: "+err.Error())
		c.JSON(http.StatusNotFound, gin.H{
			"Success": false,
			"Message": "User not found",
			"Error":   err.Error(),
		})
		return
	}
	oldUserValue = user

	var updatedData models.UpdateUserInput
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		services.LogActivity(config.DB, c, "Update", "User Management", id, oldUserValue, nil, "failed", "Invalid request for update: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"Success": false,
			"Message": "Invalid request",
			"Error":   err.Error(),
		})
		return
	}

	// Perbarui data user
	user.Name = updatedData.Name
	user.Email = updatedData.Email
	user.Position = updatedData.Position
	user.Company = updatedData.Company
	user.Role = int(updatedData.Role)
	user.IsActive = updatedData.IsActive
	user.UpdatedAt = time.Now()
	user.UpdatedBy = updatedData.UpdatedBy

	// Hash password jika diisi
	if updatedData.Password != "" {
		if len(updatedData.Password) < 6 {
			services.LogActivity(config.DB, c, "Update", "User Management", id, oldUserValue, user, "failed", "Password too short during update")
			c.JSON(http.StatusBadRequest, gin.H{
				"Success": false,
				"Message": "Password must be at least 6 characters",
			})
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(updatedData.Password), bcrypt.DefaultCost)
		if err != nil {
			services.LogActivity(config.DB, c, "Update", "User Management", id, oldUserValue, user, "failed", "Password hashing failed during update: "+err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"Success": false,
				"Message": "Password hashing failed",
				"Error":   err.Error(),
			})
			return
		}
		user.PasswordHash = string(hashedPassword)
	}

	// Simpan perubahan ke database (menggunakan transaksi)
	if err := tx.Save(&user).Error; err != nil {
		services.LogActivity(config.DB, c, "Update", "User Management", id, oldUserValue, user, "failed", "Failed to update user in DB: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to update user",
			"Error":   err.Error(),
		})
		return
	}

	// COMMIT TRANSAKSI jika semua operasi berhasil
	if err := tx.Commit().Error; err != nil {
		services.LogActivity(config.DB, c, "Update", "User Management", id, oldUserValue, user, "failed", "Failed to commit update transaction: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to commit transaction",
			"Error":   err.Error(),
		})
		return
	}

	// Log aktivitas sukses
	services.LogActivity(config.DB, c, "Update", "User Management", id, oldUserValue, user, "success", "User updated successfully")

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
		services.LogActivity(config.DB, c, "Delete", "User Management", userID, nil, nil, "failed", "Invalid user ID format for delete: "+err.Error())
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
		services.LogActivity(config.DB, c, "Delete", "User Management", userID, nil, nil, "failed", "Unauthorized access for delete")
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
		services.LogActivity(config.DB, c, "Delete", "User Management", userID, nil, nil, "failed", "Attempt to self-delete user account")
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
			services.LogActivity(config.DB, c, "Delete", "User Management", userID, nil, nil, "failed", "User not found for deletion: "+err.Error())
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "User not found",
				"error":   "The specified user does not exist",
			})
			return
		}
		services.LogActivity(config.DB, c, "Delete", "User Management", userID, nil, nil, "failed", "Database error checking user for deletion: "+err.Error())
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
		services.LogActivity(config.DB, c, "Delete", "User Management", userID, nil, nil, "failed", "Failed to start transaction for delete: "+tx.Error.Error())
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

	// Hard Delete user (permanently remove from database)
	if err := tx.Unscoped().Delete(&userToDelete).Error; err != nil {
		services.LogActivity(config.DB, c, "Delete", "User Management", userID, userToDelete, nil, "failed", "Failed to delete user from DB: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete user",
			"error":   err.Error(),
		})
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		services.LogActivity(config.DB, c, "Delete", "User Management", userID, userToDelete, nil, "failed", "Failed to commit delete transaction: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to commit transaction",
			"error":   err.Error(),
		})
		return
	}

	// Log aktivitas sukses
	services.LogActivity(config.DB, c, "Delete", "User Management", userID, userToDelete, nil, "success", "User deleted successfully")

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
