package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"be-awarenix/services"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AuthLogin(c *gin.Context) {
	var input models.LoginInput
	var user models.User
	var fullUserData models.FullUserLoginData
	var userResp models.UserLoginResponse

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid input",
			"error":   err.Error(),
		})
		return
	}

	err := config.DB.Table("users").
		Select(`users.*, roles.name AS role_name`).
		Joins(`LEFT JOIN roles ON roles.id = users.role`).
		Where("users.email = ?", input.Email).
		First(&userResp).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{
				"status":  "error",
				"message": "Account haven't registered yet",
				"error":   "User not found",
			})
		} else {
			log.Printf("Database error during login: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Failed to process login",
				"error":   err.Error(),
			})
		}
		return
	}

	user.ID = userResp.ID
	user.Email = userResp.Email

	var userWithHash models.User
	err = config.DB.Where("email = ?", input.Email).First(&userWithHash).Error
	if err != nil {
		log.Printf("Error fetching user hash: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to retrieve user data",
			"error":   err.Error(),
		})
		return
	}
	user.PasswordHash = userWithHash.PasswordHash

	err = config.DB.Table("users").
		Select(`users.*, roles.name AS role_name`).
		Joins(`LEFT JOIN roles ON roles.id = users.role`).
		Where("users.email = ?", input.Email).
		First(&fullUserData).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{
				"status":  "error",
				"message": "Account haven't registered yet",
				"error":   "User not found",
			})
		} else {
			log.Printf("Database error during login: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Failed to process login",
				"error":   err.Error(),
			})
		}
		return
	}

	if fullUserData.IsActive == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  "error",
			"message": "Account is not active",
			"error":   "Account is inactive",
		})
		return
	}

	if err := services.ComparePassword(fullUserData.PasswordHash, input.Password); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  "error",
			"message": "Invalid credentials",
			"error":   "Password mismatch",
		})
		return
	}

	token, exp, err := services.GenerateJWT(fullUserData.ID, fullUserData.Email, input.Status)
	if err != nil {
		log.Printf("JWT generation error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Could not create token",
			"error":   err.Error(),
		})
		return
	}

	fullUserData.LastLogin = time.Now()
	if err := config.DB.Save(&fullUserData.User).Error; err != nil {
		log.Printf("Failed to update last_login: %v", err)
	}

	// Siapkan data untuk response
	userdata := map[string]interface{}{
		"id":         fullUserData.ID,
		"name":       fullUserData.Name,
		"email":      fullUserData.Email,
		"position":   fullUserData.Position,
		"role":       fullUserData.Role,
		"role_name":  fullUserData.RoleName,
		"company":    fullUserData.Company,
		"country":    fullUserData.Country,
		"last_login": fullUserData.LastLogin,
	}

	c.JSON(http.StatusOK, gin.H{
		"status":     "success",
		"message":    "Login successful",
		"token":      token,
		"user":       userdata,
		"expires_at": exp,
	})
}

func AuthLogout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully logged out",
	})
}

func GetUserSession(c *gin.Context) {
	var input models.GetUserSession

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Success": false,
			"Message": "Invalid request body",
			"Error":   err.Error(),
		})
		return
	}

	var user models.User
	if err := config.DB.Select("id", "name", "email", "position", "role").First(&user, input.ID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"Success": false,
			"Message": "User not found",
			"Error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"Success": true,
		"Message": "User session retrieved successfully",
		"Data": gin.H{
			"id":       user.ID,
			"name":     user.Name,
			"email":    user.Email,
			"position": user.Position,
			"role":     user.Role,
		},
	})
}
