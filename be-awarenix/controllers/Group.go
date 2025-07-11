package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"be-awarenix/services"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const moduleName = "Group"

func GetGroups(c *gin.Context) {
	query := config.DB.Model(&models.Group{}).Preload("Members")

	var total int64
	if err := query.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to count group",
			"Error":   err.Error(),
		})
		return
	}

	query = config.DB.Table("groups").
		Select("groups.*, created_by_user.name AS created_by_name, updated_by_user.name AS updated_by_name").
		Joins("LEFT JOIN users AS created_by_user ON created_by_user.id = groups.created_by").
		Joins("LEFT JOIN users AS updated_by_user ON updated_by_user.id = groups.updated_by").
		Preload("Members")

	var groupsWithUserNames []models.GroupWithUserNames
	if err := query.Find(&groupsWithUserNames).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to fetch group",
			"Error":   err.Error(),
		})
		return
	}

	var groupsResponse []models.GroupResponse
	for _, groupData := range groupsWithUserNames { // Iterasi melalui struct gabungan
		var membersResponse []models.MemberResponse
		for _, member := range groupData.Members { // Members di-preload ke groupData.Group.Members
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

		groupsResponse = append(groupsResponse, models.GroupResponse{
			ID:            groupData.ID,
			Name:          groupData.Name,
			DomainStatus:  groupData.DomainStatus,
			CreatedAt:     groupData.CreatedAt,
			UpdatedAt:     groupData.UpdatedAt,
			MemberCount:   len(groupData.Members),
			Members:       membersResponse,
			CreatedByName: groupData.CreatedByName,
			UpdatedByName: groupData.UpdatedByName,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"Success": true,
		"Message": "Grup retrieved successfully",
		"Data":    groupsResponse,
		"Total":   total,
	})
}

func GetMembers(c *gin.Context) {
	query := config.DB.Model(&models.Member{})

	var total int64
	if err := query.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to count groups",
			"Error":   err.Error(),
		})
		return
	}

	var members []models.Member
	if err := query.Find(&members).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to fetch members",
			"Error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"Success": true,
		"Message": "Members retrieved successfully",
		"Data":    members,
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

// CREATE
func RegisterGroup(c *gin.Context) {
	var input models.CreateGroupInput

	// BIND VALIDATE INPUT JSON
	if err := c.ShouldBindJSON(&input); err != nil {
		services.LogActivity(config.DB, c, "Create", moduleName, "", nil, input, "error", "Validation failed: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Validation failed",
			"data":    err.Error(),
		})
		return
	}

	// Start a database transaction
	tx := config.DB.Begin()
	if tx.Error != nil {
		services.LogActivity(config.DB, c, "Create", moduleName, "", nil, input, "error", "Failed to start transaction: "+tx.Error.Error())
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

	// CREATE NEW GROUP
	newGroup := models.Group{
		Name:         input.Name,
		DomainStatus: input.DomainStatus,
		CreatedBy:    input.CreatedBy,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	var existingGroup models.Group
	if err := tx.Where("name = ?", input.Name).First(&existingGroup).Error; err == nil {
		tx.Rollback()
		errorMessage := "Group Name already exists"
		services.LogActivity(config.DB, c, "Create", moduleName, "", nil, input, "error", errorMessage)
		c.JSON(http.StatusConflict, gin.H{
			"status":  "error",
			"message": errorMessage,
			"data":    nil,
		})
		return
	}

	if err := tx.Create(&newGroup).Error; err != nil {
		tx.Rollback()
		errorMessage := "Failed to create group"
		services.LogActivity(config.DB, c, "Create", moduleName, "", nil, input, "error", errorMessage+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": errorMessage,
			"data":    err.Error(),
		})
		return
	}

	// Create Members and associate them with the Group
	var createdMembers []models.Member
	var memberResponses []models.MemberResponse

	for _, memberInput := range input.Members {
		var existingMember models.Member
		if err := tx.Where("email = ? AND group_id = ?", memberInput.Email, newGroup.ID).First(&existingMember).Error; err == nil {
			tx.Rollback()
			errorMessage := "Member with email '" + memberInput.Email + "' already exists in group '" + input.Name + "'"
			services.LogActivity(config.DB, c, "Create", moduleName, "", nil, input, "error", errorMessage)
			c.JSON(http.StatusConflict, gin.H{
				"status":  "error",
				"message": errorMessage,
				"data":    nil,
			})
			return
		} else if err != gorm.ErrRecordNotFound {
			tx.Rollback()
			errorMessage := "Failed to check existing member email: " + err.Error()
			services.LogActivity(config.DB, c, "Create", moduleName, "", nil, input, "error", errorMessage)
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Failed to check existing member email",
				"data":    err.Error(),
			})
			return
		}

		newMember := models.Member{
			GroupID:   newGroup.ID,
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
			errorMessage := "Failed to create member: " + memberInput.Email
			services.LogActivity(config.DB, c, "Create", moduleName, "", nil, input, "error", errorMessage+err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": errorMessage,
				"data":    err.Error(),
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
		errorMessage := "Failed to commit transaction"
		services.LogActivity(config.DB, c, "Create", moduleName, "", nil, input, "error", errorMessage+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": errorMessage,
			"data":    err.Error(),
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

	services.LogActivity(config.DB, c, "Create", moduleName, strconv.FormatUint(uint64(newGroup.ID), 10), nil, groupResponse, "success", "Group and members created successfully")
	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Group and members created successfully",
		"data":    groupResponse,
	})
}

// UPDATE
func UpdateGroup(c *gin.Context) {
	idParam := c.Param("id")
	groupID, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		services.LogActivity(config.DB, c, "Update", moduleName, idParam, nil, nil, "error", "Invalid group ID format: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid group ID format. Please provide a valid numeric ID.",
			"data":    err.Error(),
		})
		return
	}

	var req models.UpdateGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		services.LogActivity(config.DB, c, "Update", moduleName, idParam, nil, req, "error", "Invalid request payload: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid request payload. Please check your input.",
			"data":    err.Error(),
		})
		return
	}

	var updatedBy = int(req.UpdatedBy)

	// Start a database transaction
	tx := config.DB.Begin()
	if tx.Error != nil {
		services.LogActivity(config.DB, c, "Update", moduleName, idParam, nil, req, "error", "Failed to begin database transaction: "+tx.Error.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to begin database transaction. Please try again.",
			"data":    tx.Error.Error(),
		})
		return
	}

	var existingGroup models.Group
	// Find the group to update
	if err := tx.First(&existingGroup, groupID).Error; err != nil {
		tx.Rollback()
		if err == gorm.ErrRecordNotFound {
			services.LogActivity(config.DB, c, "Update", moduleName, idParam, nil, req, "error", "Group not found")
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "Group not found. It may have been deleted or never existed.",
				"data":    nil,
			})
			return
		}
		services.LogActivity(config.DB, c, "Update", moduleName, idParam, nil, req, "error", "Failed to retrieve group for update: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to retrieve group for update. Please try again.",
			"data":    err.Error(),
		})
		return
	}

	oldGroupValue := existingGroup // Salin sebelum perubahan untuk log
	oldMembersValue := []models.Member{}
	tx.Where("group_id = ?", groupID).Find(&oldMembersValue) // Ambil anggota lama untuk log

	// Update group details
	existingGroup.Name = req.GroupName
	existingGroup.DomainStatus = req.DomainStatus
	existingGroup.UpdatedAt = time.Now()
	existingGroup.UpdatedBy = updatedBy

	if err := tx.Save(&existingGroup).Error; err != nil {
		tx.Rollback()
		services.LogActivity(config.DB, c, "Update", moduleName, idParam, oldGroupValue, req, "error", "Failed to update group details: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to update group details. Please try again.",
			"data":    err.Error(),
		})
		return
	}

	// --- Handle Members ---
	// 1. Delete existing members for this group
	if err := tx.Where("group_id = ?", groupID).Delete(&models.Member{}).Error; err != nil {
		tx.Rollback()
		services.LogActivity(config.DB, c, "Update", moduleName, idParam, oldMembersValue, req.Members, "error", "Failed to clear existing members for the group: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to clear existing members for the group. Please try again.",
			"data":    err.Error(),
		})
		return
	}

	// 2. Create new members from the request payload
	if len(req.Members) > 0 {
		newMembers := make([]models.Member, len(req.Members))
		for i, m := range req.Members {
			// Check for duplicate emails for *new* members within the request
			for j, checkM := range req.Members {
				if i != j && m.Email == checkM.Email {
					tx.Rollback()
					services.LogActivity(config.DB, c, "Update", moduleName, idParam, oldMembersValue, req.Members, "error", "Duplicate email found in the new members list: "+m.Email)
					c.JSON(http.StatusBadRequest, gin.H{
						"status":  "error",
						"message": "Duplicate email found in the new members list: " + m.Email,
						"data":    nil,
					})
					return
				}
			}

			newMembers[i] = models.Member{
				GroupID:   uint(groupID),
				Name:      m.Name,
				Email:     m.Email,
				Position:  m.Position,
				Company:   m.Company,
				Country:   m.Country,
				UpdatedBy: updatedBy,
				CreatedAt: time.Now(), // Set CreatedAt for new members
				UpdatedAt: time.Now(), // Set UpdatedAt for new members
			}
		}

		if err := tx.Create(&newMembers).Error; err != nil {
			tx.Rollback()
			services.LogActivity(config.DB, c, "Update", moduleName, idParam, oldMembersValue, req.Members, "error", "Failed to add new members to the group: "+err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Failed to add new members to the group. Please check member data.",
				"data":    err.Error(),
			})
			return
		}
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		services.LogActivity(config.DB, c, "Update", moduleName, idParam, oldGroupValue, req, "error", "Failed to commit transaction after update: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to commit transaction. Please try again.",
			"data":    err.Error(),
		})
		return
	}

	// Ambil data group dan member terbaru untuk respons success
	var updatedGroup models.Group
	config.DB.Preload("Members").First(&updatedGroup, groupID) // Pastikan untuk memuat anggota
	var updatedMembersResponse []models.MemberResponse
	for _, member := range updatedGroup.Members {
		updatedMembersResponse = append(updatedMembersResponse, models.MemberResponse{
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
	updatedGroupResponse := models.GroupResponse{
		ID:           updatedGroup.ID,
		Name:         updatedGroup.Name,
		DomainStatus: updatedGroup.DomainStatus,
		CreatedAt:    updatedGroup.CreatedAt,
		UpdatedAt:    updatedGroup.UpdatedAt,
		Members:      updatedMembersResponse,
	}

	services.LogActivity(config.DB, c, "Update", moduleName, idParam, oldGroupValue, updatedGroupResponse, "success", "Group and its members updated successfully")
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Group and its members updated successfully!",
		"data":    updatedGroupResponse,
	})
}

// DELETE
func DeleteGroup(c *gin.Context) {
	idParam := c.Param("id")
	groupID, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		services.LogActivity(config.DB, c, "Delete", moduleName, idParam, nil, nil, "error", "Invalid group ID format: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid group ID format",
			"data":    err.Error(),
		})
		return
	}

	// Mulai transaksi database untuk memastikan atomicity
	// Artinya, jika ada langkah yang gagal, semua perubahan akan di-rollback
	tx := config.DB.Begin()
	if tx.Error != nil {
		services.LogActivity(config.DB, c, "Delete", moduleName, idParam, nil, nil, "error", "Failed to begin database transaction: "+tx.Error.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to begin database transaction",
			"data":    tx.Error.Error(),
		})
		return
	}

	var group models.Group
	// Periksa apakah grup ada sebelum menghapus
	if err := tx.First(&group, groupID).Error; err != nil {
		tx.Rollback() // Rollback jika grup tidak ditemukan atau error
		if err == gorm.ErrRecordNotFound {
			services.LogActivity(config.DB, c, "Delete", moduleName, idParam, nil, nil, "error", "Group not found")
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "Group not found",
				"data":    nil,
			})
			return
		}
		services.LogActivity(config.DB, c, "Delete", moduleName, idParam, nil, nil, "error", "Failed to retrieve group: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to retrieve group",
			"data":    err.Error(),
		})
		return
	}

	// Simpan salinan grup dan anggota sebelum dihapus untuk logging OldValue
	oldGroupData := group
	var oldMembersData []models.Member
	tx.Where("group_id = ?", groupID).Find(&oldMembersData)

	// --- Hapus semua anggota terkait dengan groupID ini ---
	if err := tx.Where("group_id = ?", groupID).Delete(&models.Member{}).Error; err != nil {
		tx.Rollback() // Rollback jika gagal menghapus anggota
		services.LogActivity(config.DB, c, "Delete", moduleName, idParam, oldMembersData, nil, "error", "Failed to delete group members: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to delete group members",
			"data":    err.Error(),
		})
		return
	}

	// --- Kemudian, hapus grup itu sendiri ---
	if err := tx.Delete(&group).Error; err != nil {
		tx.Rollback() // Rollback jika gagal menghapus grup
		services.LogActivity(config.DB, c, "Delete", moduleName, idParam, oldGroupData, nil, "error", "Failed to delete group: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to delete group",
			"data":    err.Error(),
		})
		return
	}

	// Commit transaksi jika semua operasi berhasil
	if err := tx.Commit().Error; err != nil {
		services.LogActivity(config.DB, c, "Delete", moduleName, idParam, oldGroupData, nil, "error", "Failed to commit transaction after deletion: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to commit transaction",
			"data":    err.Error(),
		})
		return
	}

	services.LogActivity(config.DB, c, "Delete", moduleName, idParam, oldGroupData, nil, "success", "Group and its members deleted successfully")
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Group and its members deleted successfully",
		"data":    nil,
	})
}
