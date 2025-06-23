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

func GetGroups(c *gin.Context) {
	// Ini akan memuat semua anggota untuk setiap grup.
	query := config.DB.Model(&models.Group{}).Preload("Members")

	var total int64
	if err := query.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to count groups",
			"Error":   err.Error(),
		})
		return
	}

	var groups []models.Group // Ini akan berisi grup dengan anggota yang sudah di-preload
	if err := query.Find(&groups).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to fetch groups",
			"Error":   err.Error(),
		})
		return
	}

	var groupsWithFullDataResponse []models.GroupResponse // Ganti nama variabel agar lebih jelas
	for _, group := range groups {
		var membersResponse []models.MemberResponse
		for _, member := range group.Members {
			membersResponse = append(membersResponse, models.MemberResponse{
				ID:        member.ID,
				Name:      member.Name,
				Email:     member.Email,
				Position:  member.Position,
				Company:   member.Company,
				Country:   member.Country,
				CreatedAt: member.CreatedAt,
				UpdatedAt: member.UpdatedAt,
			})
		}

		groupsWithFullDataResponse = append(groupsWithFullDataResponse, models.GroupResponse{
			ID:           group.ID,
			Name:         group.Name,
			DomainStatus: group.DomainStatus,
			CreatedAt:    group.CreatedAt,
			UpdatedAt:    group.UpdatedAt,
			MemberCount:  len(group.Members),
			Members:      membersResponse, // <--- DETAIL ANGGOTA LENGKAP DIKIRIM DI SINI
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"Success": true,
		"Message": "Groups retrieved successfully",
		"Data":    groupsWithFullDataResponse,
		"Total":   total,
	})
}

func GetGroupDetail(c *gin.Context) {
	groupID := c.Param("id") // Ambil ID grup dari URL parameter

	var group models.Group
	// Gunakan Preload("Members") untuk memuat anggota terkait
	// Pastikan GroupID di model Member sudah benar dan Group memiliki `Members []Member` tag GORM
	if err := config.DB.Preload("Members").First(&group, groupID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"Success": false,
				"Message": "Group not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to fetch group details",
			"Error":   err.Error(),
		})
		return
	}

	// Siapkan response untuk grup dan anggotanya
	var membersResponse []models.MemberResponse
	for _, member := range group.Members {
		membersResponse = append(membersResponse, models.MemberResponse{
			ID:        member.ID,
			Name:      member.Name,
			Email:     member.Email,
			Position:  member.Position,
			Company:   member.Company,
			Country:   member.Country,
			CreatedAt: member.CreatedAt,
			UpdatedAt: member.UpdatedAt,
		})
	}

	groupResponse := models.GroupResponse{
		ID:           group.ID,
		Name:         group.Name,
		DomainStatus: group.DomainStatus,
		CreatedAt:    group.CreatedAt,
		UpdatedAt:    group.UpdatedAt,
		MemberCount:  len(group.Members),
		Members:      membersResponse,
	}

	c.JSON(http.StatusOK, gin.H{
		"Success": true,
		"Message": "Group details retrieved successfully",
		"Data":    groupResponse, // Mengembalikan objek grup tunggal dengan anggota
	})
}

func RegisterGroup(c *gin.Context) {
	var input models.CreateGroupInput

	// BIND VALIDATE INPUT JSON
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Validation failed",
			"message": err.Error(),
		})
		return
	}

	// Start a database transaction
	tx := config.DB.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": "Failed to start transaction",
		})
		return
	}

	// CREATE NEW GROUP
	newGroup := models.Group{
		Name:         input.Name,
		DomainStatus: input.DomainStatus,
		CreatedBy:    input.CreatedBy,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := tx.Create(&newGroup).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": "Failed to create group",
		})
		return
	}

	// Create Members and associate them with the Group
	var createdMembers []models.Member
	var memberResponses []models.MemberResponse

	for _, memberInput := range input.Members {
		// Check if member email already exists in any group (optional, depends on your business logic)
		// Or, if email must be unique within *this* group only, check against newGroup.ID
		var existingMember models.Member
		if err := tx.Where("email = ? AND group_id = ?", memberInput.Email, newGroup.ID).First(&existingMember).Error; err == nil {
			tx.Rollback()
			c.JSON(http.StatusConflict, gin.H{
				"error":   "Member email already exists in this group",
				"message": "Member with email '" + memberInput.Email + "' already exists in group '" + input.Name + "'",
			})
			return
		} else if err != gorm.ErrRecordNotFound {
			// Some other database error
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Database error",
				"message": "Failed to check existing member email",
			})
			return
		}

		newMember := models.Member{
			GroupID:   newGroup.ID, // Link to the newly created group
			Name:      memberInput.Name,
			Email:     memberInput.Email,
			Position:  memberInput.Position,
			Company:   memberInput.Company,
			Country:   memberInput.Country,
			CreatedBy: input.CreatedBy,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		if err := tx.Create(&newMember).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Database error",
				"message": "Failed to create member: " + memberInput.Email,
			})
			return
		}
		createdMembers = append(createdMembers, newMember)
		memberResponses = append(memberResponses, models.MemberResponse{
			ID:        newMember.ID,
			Name:      newMember.Name,
			Email:     newMember.Email,
			Position:  newMember.Position,
			Company:   newMember.Company,
			Country:   newMember.Country,
			CreatedAt: newMember.CreatedAt,
			UpdatedAt: newMember.UpdatedAt,
		})
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": "Failed to commit transaction",
		})
		return
	}

	// Prepare success response
	groupResponse := models.GroupResponse{
		ID:           newGroup.ID,
		Name:         newGroup.Name,
		DomainStatus: newGroup.DomainStatus,
		CreatedAt:    newGroup.CreatedAt,
		UpdatedAt:    newGroup.UpdatedAt,
		Members:      memberResponses,
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Group and members created successfully",
		"data":    groupResponse,
	})
}

func DeleteGroup(c *gin.Context) {
	// Ambil ID grup dari URL parameter
	idParam := c.Param("id")
	groupID, err := strconv.ParseUint(idParam, 10, 64) // Konversi string ID ke uint
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Success": false,
			"Message": "Invalid group ID format",
			"Error":   err.Error(),
		})
		return
	}

	var group models.Group
	// Periksa apakah grup ada sebelum menghapus
	if err := config.DB.First(&group, groupID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"Success": false,
				"Message": "Group not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to retrieve group",
			"Error":   err.Error(),
		})
		return
	}

	if err := config.DB.Delete(&group).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to delete group",
			"Error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"Success": true,
		"Message": "Group deleted successfully",
	})
}
