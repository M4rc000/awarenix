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

const moduleNameUser = "User"

// sanitizeUserForLog membuat salinan User dan menghapus PasswordHash
func sanitizeUserForLog(user models.User) models.User {
	user.PasswordHash = "[REDACTED]"
	return user
}

// sanitizeCreateUserInputForLog membuat salinan CreateUserInput dan menghapus Password
func sanitizeCreateUserInputForLog(input models.CreateUserInput) models.CreateUserInput {
	input.Password = "[REDACTED]"
	return input
}

// sanitizeUpdateUserInputForLog membuat salinan UpdateUserInput dan menghapus Password
func sanitizeUpdateUserInputForLog(input models.UpdateUserInput) models.UpdateUserInput {
	input.Password = "[REDACTED]"
	return input
}

// CREATE
func RegisterUser(c *gin.Context) {
	var input models.CreateUserInput

	// BIND & VALIDASI INPUT JSON
	if err := c.ShouldBindJSON(&input); err != nil {
		services.LogActivity(config.DB, c, "Create", moduleNameUser, "", nil, input, "error", "Invalid input: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid input",
			"data":    err.Error(),
		})
		return
	}

	sanitizedInput := sanitizeCreateUserInputForLog(input)

	// MULAI TRANSAKSI
	tx := config.DB.Begin()
	if tx.Error != nil {
		services.LogActivity(config.DB, c, "Create", moduleNameUser, "", nil, sanitizedInput, "error", "Failed to start transaction: "+tx.Error.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to start database transaction",
			"data":    tx.Error.Error(),
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
		services.LogActivity(config.DB, c, "Create", moduleNameUser, "", nil, sanitizedInput, "error", errorMessage)
		c.JSON(http.StatusConflict, gin.H{
			"status":  "error",
			"message": "User with this email already registered",
			"data":    errorMessage,
			"fields": map[string]string{
				"email": "Email is already taken",
			},
		})
		return
	} else if err != gorm.ErrRecordNotFound {
		tx.Rollback()
		services.LogActivity(config.DB, c, "Create", moduleNameUser, "", nil, sanitizedInput, "error", "Failed to check existing user: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to check existing user",
			"data":    err.Error(),
		})
		return
	}

	// HASH PASSWORD
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		tx.Rollback()
		services.LogActivity(config.DB, c, "Create", moduleNameUser, "", nil, sanitizedInput, "error", "Password hashing failed: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to process password",
			"data":    "Password hashing failed",
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
		sanitizedNewUser := sanitizeUserForLog(newUser) // Sanitasi user baru untuk logging
		services.LogActivity(config.DB, c, "Create", moduleNameUser, "", nil, sanitizedNewUser, "error", "Failed to create user: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to create user",
			"data":    err.Error(),
		})
		return
	}

	// COMMIT TRANSAKSI jika semua operasi berhasil
	if err := tx.Commit().Error; err != nil {
		sanitizedNewUser := sanitizeUserForLog(newUser) // Sanitasi user baru untuk logging
		services.LogActivity(config.DB, c, "Create", moduleNameUser, "", nil, sanitizedNewUser, "error", "Failed to commit transaction: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to commit transaction",
			"data":    err.Error(),
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
	services.LogActivity(config.DB, c, "Create", moduleNameUser, strconv.Itoa(int(newUser.ID)), nil, sanitizeUserForLog(newUser), "success", "User created successfully")

	// RESPONSE SUKSES
	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "User created successfully",
		"data":    userResponse,
	})
}

// READ
func GetUsers(c *gin.Context) {
	userIDScope, roleScope, errorStatus := services.GetRoleScope(c)
	if !errorStatus {
		return
	}

	var query *gorm.DB
	if roleScope == 1 {
		query = config.DB.Table("users").
			Select(`users.*, created_by_user.name AS created_by_name, updated_by_user.name AS updated_by_name, roles_user.name AS role_name`).
			Joins(`LEFT JOIN users AS created_by_user ON created_by_user.id = users.created_by`).
			Joins(`LEFT JOIN users AS updated_by_user ON updated_by_user.id = users.updated_by`).
			Joins(`LEFT JOIN roles AS roles_user ON roles_user.id = users.role`)
	} else {
		query = config.DB.Table("users").
			Select(`users.*, created_by_user.name AS created_by_name, updated_by_user.name AS updated_by_name, roles_user.name AS role_name`).
			Joins(`LEFT JOIN users AS created_by_user ON created_by_user.id = users.created_by`).
			Joins(`LEFT JOIN users AS updated_by_user ON updated_by_user.id = users.updated_by`).
			Joins(`LEFT JOIN roles AS roles_user ON roles_user.id = users.role`).
			Where(`users.created_by = ?`, userIDScope)
	}

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
	// Ambil ID pengguna dari parameter URL
	idParam := c.Param("id")
	userID, err := strconv.ParseUint(idParam, 10, 64) // Konversi string ID ke uint64
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Invalid user ID format"})
		return
	}

	// Mulai transaksi
	tx := config.DB.Begin()
	if tx.Error != nil {
		services.LogActivity(config.DB, c, "Update", moduleNameUser, idParam, nil, nil, "error", "Failed to start transaction: "+tx.Error.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to start transaction",
			"data":    tx.Error.Error(),
		})
		return
	}
	// Defer rollback, akan di-override oleh commit jika berhasil
	defer func() {
		if r := recover(); r != nil { // Tangani panic
			tx.Rollback()
			panic(r)
		} else if tx.Error != nil { // Rollback jika ada error GORM yang tidak ditangani
			tx.Rollback()
		}
	}()

	var user models.User
	// Ambil data user sebelum diupdate untuk oldValue
	// Menggunakan userID (uint64) untuk query Find
	if err := tx.First(&user, userID).Error; err != nil {
		tx.Rollback() // Rollback karena user tidak ditemukan
		services.LogActivity(config.DB, c, "Update", moduleNameUser, idParam, nil, nil, "error", "User not found for update: "+err.Error())
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "User not found",
			"data":    err.Error(),
		})
		return
	}
	oldUserValue := sanitizeUserForLog(user)

	var updatedData models.UpdateUserInput
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		logInput := sanitizeUpdateUserInputForLog(updatedData) // Gunakan fungsi sanitize yang benar
		services.LogActivity(config.DB, c, "Update", moduleNameUser, idParam, oldUserValue, logInput, "error", "Invalid request for update: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid request",
			"data":    err.Error(),
		})
		return
	}

	var existingUserWithSameEmail models.User
	err = tx.Where("email = ? AND id != ?", updatedData.Email, userID).First(&existingUserWithSameEmail).Error

	if err == nil {
		tx.Rollback()
		errorMessage := "Email is already taken by another user"
		logInput := sanitizeUpdateUserInputForLog(updatedData)
		services.LogActivity(config.DB, c, "Update", moduleNameUser, idParam, oldUserValue, logInput, "error", errorMessage) // Log sebagai 'Update'
		c.JSON(http.StatusConflict, gin.H{
			"status":  "error",
			"message": errorMessage,
			"data":    nil,
			"fields": map[string]string{
				"email": "Email is already taken by another user",
			},
		})
		return
	}
	// Jika err != nil DAN err BUKAN gorm.ErrRecordNotFound, berarti ada error database lain
	if err != nil && err != gorm.ErrRecordNotFound {
		tx.Rollback()
		errorMessage := "Database error during email duplication check: " + err.Error()
		logInput := sanitizeUpdateUserInputForLog(updatedData)
		services.LogActivity(config.DB, c, "Update", moduleNameUser, idParam, oldUserValue, logInput, "error", errorMessage)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to check email duplication",
			"data":    errorMessage,
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
			tx.Rollback()
			logInput := sanitizeUpdateUserInputForLog(updatedData)
			services.LogActivity(config.DB, c, "Update", moduleNameUser, idParam, oldUserValue, logInput, "error", "Password too short during update")
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"message": "Password must be at least 6 characters",
				"data":    nil,
			})
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(updatedData.Password), bcrypt.DefaultCost)
		if err != nil {
			tx.Rollback()
			logInput := sanitizeUpdateUserInputForLog(updatedData)
			services.LogActivity(config.DB, c, "Update", moduleNameUser, idParam, oldUserValue, logInput, "error", "Password hashing failed during update: "+err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Password hashing failed",
				"data":    err.Error(),
			})
			return
		}
		user.PasswordHash = string(hashedPassword)
	}

	// Simpan perubahan ke database (menggunakan transaksi)
	if err := tx.Save(&user).Error; err != nil {
		tx.Rollback()
		logInput := sanitizeUpdateUserInputForLog(updatedData)
		services.LogActivity(config.DB, c, "Update", moduleNameUser, idParam, oldUserValue, logInput, "error", "Failed to update user in DB: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to update user",
			"data":    err.Error(),
		})
		return
	}

	// COMMIT TRANSAKSI jika semua operasi berhasil
	if err := tx.Commit().Error; err != nil {
		logInput := sanitizeUpdateUserInputForLog(updatedData)
		services.LogActivity(config.DB, c, "Update", moduleNameUser, idParam, oldUserValue, logInput, "error", "Failed to commit update transaction: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to commit transaction",
			"data":    err.Error(),
		})
		return
	}

	// Log aktivitas sukses
	// Pastikan user di sini adalah user yang sudah terupdate
	services.LogActivity(config.DB, c, "Update", moduleNameUser, idParam, oldUserValue, sanitizeUserForLog(user), "success", "User updated successfully")

	// Kirim respons sukses
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "User updated successfully",
		"data": gin.H{
			"id":       user.ID,
			"name":     user.Name,
			"email":    user.Email,
			"position": user.Position,
			"role":     user.Role,
			"company":  user.Company,
			"isActive": user.IsActive,
		},
	})
}

// DELETE
func DeleteUser(c *gin.Context) {
	// Get user ID from URL parameter
	userIDParam := c.Param("id")

	// Validate user ID
	id, err := strconv.ParseUint(userIDParam, 10, 32)
	if err != nil {
		services.LogActivity(config.DB, c, "Delete", moduleNameUser, userIDParam, nil, nil, "error", "Invalid user ID format for delete: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid user ID format",
			"data":    "User ID must be a valid number",
		})
		return
	}

	// Get current user from JWT token (from middleware)
	currentUser, exists := c.Get("user")
	if !exists {
		services.LogActivity(config.DB, c, "Delete", moduleNameUser, userIDParam, nil, nil, "error", "Unauthorized access for delete: User session not found")
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  "error",
			"message": "Unauthorized access",
			"data":    "User session not found",
		})
		return
	}

	// Type assertion to get user data
	user := currentUser.(*models.User)

	// Prevent user from deleting themselves
	if user.ID == uint(id) {
		services.LogActivity(config.DB, c, "Delete", moduleNameUser, userIDParam, nil, nil, "error", "Attempt to self-delete user account.")
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Cannot delete your own account",
			"data":    "Self-deletion is not allowed",
		})
		return
	}

	// Check if user to be deleted exists
	var userToDelete models.User
	if err := config.DB.First(&userToDelete, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			services.LogActivity(config.DB, c, "Delete", moduleNameUser, userIDParam, nil, nil, "error", "User not found for deletion: "+err.Error())
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "User not found",
				"data":    "The specified user does not exist",
			})
			return
		}
		services.LogActivity(config.DB, c, "Delete", moduleNameUser, userIDParam, nil, nil, "error", "Database error checking user for deletion: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Database error",
			"data":    err.Error(),
		})
		return
	}

	oldUserToDeleteValue := sanitizeUserForLog(userToDelete) // Sanitasi data lama untuk logging

	// Start database transaction for safe deletion
	tx := config.DB.Begin()
	if tx.Error != nil {
		services.LogActivity(config.DB, c, "Delete", moduleNameUser, userIDParam, oldUserToDeleteValue, nil, "error", "Failed to start transaction for delete: "+tx.Error.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to start transaction",
			"data":    tx.Error.Error(),
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
		tx.Rollback()
		services.LogActivity(config.DB, c, "Delete", moduleNameUser, userIDParam, oldUserToDeleteValue, nil, "error", "Failed to delete user from DB: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to delete user",
			"data":    err.Error(),
		})
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		services.LogActivity(config.DB, c, "Delete", moduleNameUser, userIDParam, oldUserToDeleteValue, nil, "error", "Failed to commit delete transaction: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to commit transaction",
			"data":    err.Error(),
		})
		return
	}

	// Log aktivitas sukses
	services.LogActivity(config.DB, c, "Delete", moduleNameUser, userIDParam, oldUserToDeleteValue, nil, "success", "User deleted successfully")

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
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
