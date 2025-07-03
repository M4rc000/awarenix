package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"be-awarenix/services"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type loginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
	Status   string `json:"status"`
}

func AuthLogin(c *gin.Context) {
	var input loginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	// Check if the user exists with email
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Account haven't registered yet"})
		return
	}

	// Check if the user is active
	if err := config.DB.Where("is_active = ?", true).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Account is not active"})
		return
	}

	if err := services.ComparePassword(user.PasswordHash, input.Password); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, exp, err := services.GenerateJWT(user.ID, user.Email, input.Status)
	if err != nil {
		log.Printf("JWT generation error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create token"})
		return
	}

	user.LastLogin = time.Now()
	log.Printf("User %s logged in at %s", user.Email, user.LastLogin)
	if err := config.DB.Save(&user).Error; err != nil {
		log.Printf("Failed to update last_login: %v", err)
	}

	userdata := map[string]interface{}{
		"id":         user.ID,
		"name":       user.Name,
		"email":      user.Email,
		"position":   user.Position,
		"role":       user.Role,
		"last_login": user.LastLogin,
	}

	c.JSON(http.StatusOK, gin.H{"token": token, "user": userdata, "expires_at": exp})
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
