package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func UpdateProfile(c *gin.Context) {
	var inputUpdateProfile models.UpdateProfileInput
	if err := c.ShouldBindJSON(&inputUpdateProfile); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": err.Error(),
			"data":    nil,
		})
		return
	}

	// 1. Cari user terlebih dahulu untuk memastikan user dengan ID tersebut ada
	var userToUpdate models.User
	if err := config.DB.First(&userToUpdate, inputUpdateProfile.ID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "User not found",
				"data":    nil,
			})
		}
		return
	}

	userToUpdate.Name = inputUpdateProfile.Name
	userToUpdate.Position = inputUpdateProfile.Position
	userToUpdate.Company = inputUpdateProfile.Company
	userToUpdate.Country = inputUpdateProfile.Country
	userToUpdate.UpdatedAt = time.Now()
	userToUpdate.UpdatedBy = inputUpdateProfile.UpdatedBy

	if err := config.DB.Save(&userToUpdate).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to update profile in database: " + err.Error(),
			"data":    nil,
		})
		return
	}

	// 4. Kirim respons sukses dengan data user yang sudah diperbarui
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Profile updated successfully",
		"data":    userToUpdate,
	})
}
