package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"be-awarenix/services"
	"io"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const moduleNameLandingPage = "Landing Page"

// IMPORT SITE
type FetchURLRequest struct {
	URL string `json:"url" binding:"required,url"`
}

func CloneSite(c *gin.Context) {
	var req FetchURLRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL provided"})
		return
	}

	targetURL, err := url.Parse(req.URL)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot parse URL"})
		return
	}

	// 1. Fetch HTML dari URL target
	res, err := http.Get(req.URL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch content from URL"})
		return
	}
	defer res.Body.Close()

	// 2. Parse HTML menggunakan goquery
	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse HTML document"})
		return
	}

	// 3. Cari semua stylesheet, fetch, dan inline-kan
	doc.Find("link[rel='stylesheet']").Each(func(i int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if !exists {
			return
		}

		// Buat URL absolut dari href
		stylesheetURL, err := url.Parse(href)
		if err != nil {
			return
		}
		absoluteStylesheetURL := targetURL.ResolveReference(stylesheetURL).String()

		// Fetch konten CSS
		cssRes, err := http.Get(absoluteStylesheetURL)
		if err != nil {
			log.Printf("Failed to fetch stylesheet %s: %v", absoluteStylesheetURL, err)
			return
		}
		defer cssRes.Body.Close()

		cssBody, err := io.ReadAll(cssRes.Body)
		if err != nil {
			log.Printf("Failed to read stylesheet body %s: %v", absoluteStylesheetURL, err)
			return
		}

		// Ganti tag <link> dengan tag <style>
		styleTag := "<style>" + string(cssBody) + "</style>"
		s.ReplaceWithHtml(styleTag)
	})

	// 4. Ubah base href untuk gambar dan link lain agar tetap berfungsi
	doc.Find("head").AppendHtml(`<base href="` + targetURL.String() + `">`)

	// 5. Dapatkan HTML final
	finalHTML, err := doc.Html()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate final HTML"})
		return
	}

	// 6. Kirim kembali ke frontend
	c.JSON(http.StatusOK, gin.H{"html": finalHTML})
}

// CREATE
func RegisterLandingPage(c *gin.Context) {
	var input models.LandingPageInput

	// Bind dan validasi input JSON
	if err := c.ShouldBindJSON(&input); err != nil {
		services.LogActivity(config.DB, c, "Create", moduleNameLandingPage, "", nil, input, "error", "Validation failed: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Validation failed",
			"data":    err.Error(),
		})
		return
	}

	// CEK DUPLIKASI LANDING PAGE
	var existingLandingPage models.LandingPage
	if err := config.DB.
		Where("name = ? AND created_by = ?", input.Name, input.CreatedBy).
		First(&existingLandingPage).Error; err == nil {
		services.LogActivity(config.DB, c, "Create", moduleNameLandingPage, "", nil, input, "error", "Landing Page with this name already registered.")
		c.JSON(http.StatusConflict, gin.H{
			"status":  "error",
			"message": "Landing Page with this name already registered",
			"data":    nil,
		})
		return
	}

	// BUAT LANDING PAGE BARU
	newLandingPage := models.LandingPage{
		Name:             input.Name,
		Body:             input.Body,
		IsSystemTemplate: input.IsSystemTemplate,
		CreatedAt:        time.Now(),
		CreatedBy:        input.CreatedBy,
	}

	// SIMPAN KE DATABASE
	if err := config.DB.Create(&newLandingPage).Error; err != nil {
		services.LogActivity(config.DB, c, "Create", moduleNameLandingPage, "", nil, newLandingPage, "error", "Failed to create landing page template: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to create landing page template",
			"data":    err.Error(),
		})
		return
	}

	// RESPONSE SUKSES
	services.LogActivity(config.DB, c, "Create", moduleNameLandingPage, strconv.FormatUint(uint64(newLandingPage.ID), 10), nil, newLandingPage, "success", "Landing Page created successfully")
	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Landing Page created successfully",
		"data":    newLandingPage,
	})
}

// READ
func GetLandingPages(c *gin.Context) {
	userIDScope, roleScope, errorStatus := services.GetRoleScope(c)
	if !errorStatus {
		return
	}

	var query *gorm.DB
	if roleScope == 1 {
		query = config.DB.Table("landing_pages").
			Select(`landing_pages.*, 
				created_by_user.name AS created_by_name, 
				updated_by_user.name AS updated_by_name`).
			Joins(`LEFT JOIN users AS created_by_user ON created_by_user.id = landing_pages.created_by`).
			Joins(`LEFT JOIN users AS updated_by_user ON updated_by_user.id = landing_pages.updated_by`)
	} else {
		query = config.DB.Table("landing_pages").
			Select(`landing_pages.*, 
				created_by_user.name AS created_by_name, 
				updated_by_user.name AS updated_by_name`).
			Joins(`LEFT JOIN users AS created_by_user ON created_by_user.id = landing_pages.created_by`).
			Joins(`LEFT JOIN users AS updated_by_user ON updated_by_user.id = landing_pages.updated_by`).Where("landing_pages.created_by = ? OR landing_pages.is_system_template = ?", userIDScope, 1)
	}

	var total int64
	query.Count(&total)

	var data []models.GetLandingPage
	if err := query.
		Scan(&data).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to fetch landing page data",
			"Error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"Success": true,
		"Message": "Landing page data retrieved successfully",
		"Data":    data,
		"Total":   total,
	})
}

// GET ALL DEFAULT EMAIL TEMPLATES
func GetDefaultLandingPages(c *gin.Context) {
	var templates []models.DefaultLandingPage

	// Membangun query: Select dulu, baru Where dan Find
	if err := config.DB.Model(&models.LandingPage{}).
		Select("name, body").
		Where("is_system_template = ?", 1).
		Find(&templates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to fetch system default landing page template",
			"error":   err.Error(),
		})
		return
	}

	if len(templates) == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "No default landing page templates were found.",
			"data":    []models.DefaultLandingPage{},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Default landing page template successfully fetched",
		"data":    templates,
	})
}

// EDIT
func UpdateLandingPage(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 64) // Parse ke uint64 untuk konsistensi
	if err != nil {
		services.LogActivity(config.DB, c, "Update", moduleNameLandingPage, idParam, nil, nil, "error", "Invalid Landing Page ID format: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid Landing Page ID format",
			"data":    err.Error(),
		})
		return
	}

	var landingPage models.LandingPage
	if err := config.DB.First(&landingPage, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			services.LogActivity(config.DB, c, "Update", moduleNameLandingPage, idParam, nil, nil, "error", "Landing Page not found.")
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "Landing Page not found",
				"data":    nil,
			})
			return
		}
		services.LogActivity(config.DB, c, "Update", moduleNameLandingPage, idParam, nil, nil, "error", "Failed to retrieve landing page: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to retrieve landing page",
			"data":    err.Error(),
		})
		return
	}

	oldLandingPage := landingPage // Salin data lama untuk logging

	var updatedData models.UpdateLandingPage

	if err := c.ShouldBindJSON(&updatedData); err != nil {
		services.LogActivity(config.DB, c, "Update", moduleNameLandingPage, idParam, oldLandingPage, updatedData, "error", "Invalid request payload: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid request",
			"data":    err.Error(),
		})
		return
	}

	landingPage.Name = updatedData.Name
	landingPage.Body = updatedData.Body
	landingPage.IsSystemTemplate = int(updatedData.IsSystemTemplate)
	landingPage.UpdatedBy = int(updatedData.UpdatedBy)
	landingPage.UpdatedAt = time.Now()

	if err := config.DB.Save(&landingPage).Error; err != nil {
		services.LogActivity(config.DB, c, "Update", moduleNameLandingPage, idParam, oldLandingPage, landingPage, "error", "Failed to update landing page: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to update landing page",
			"data":    err.Error(),
		})
		return
	}

	services.LogActivity(config.DB, c, "Update", moduleNameLandingPage, idParam, oldLandingPage, landingPage, "success", "Landing Page updated successfully")
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Landing Page updated successfully",
		"data":    landingPage,
	})
}

// DELETE
func DeleteLandingPage(c *gin.Context) {
	landingPageIDParam := c.Param("id")

	// VALIDATE LANDING PAGE ID
	id, err := strconv.ParseUint(landingPageIDParam, 10, 32)
	if err != nil {
		services.LogActivity(config.DB, c, "Delete", moduleNameLandingPage, landingPageIDParam, nil, nil, "error", "Invalid Landing Page ID format: "+err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid Landing Page ID format",
			"data":    "Landing Page ID must be a valid number",
		})
		return
	}

	// CHECK IF LANDING PAGE THAT WANT TO BE DELETE EXIST
	var landingPageDelete models.LandingPage
	if err := config.DB.First(&landingPageDelete, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			services.LogActivity(config.DB, c, "Delete", moduleNameLandingPage, landingPageIDParam, nil, nil, "error", "Landing Page not found.")
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "Landing Page not found",
				"data":    "The specified landing page does not exist",
			})
			return
		}
		services.LogActivity(config.DB, c, "Delete", moduleNameLandingPage, landingPageIDParam, nil, nil, "error", "Database error when retrieving landing page: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Database error",
			"data":    err.Error(),
		})
		return
	}

	oldLandingPageData := landingPageDelete // Salin data lama untuk logging

	// START DB TRANSACTION FOR SAFE DELETION
	tx := config.DB.Begin()
	if tx.Error != nil {
		services.LogActivity(config.DB, c, "Delete", moduleNameLandingPage, landingPageIDParam, oldLandingPageData, nil, "error", "Failed to start transaction: "+tx.Error.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to start transaction",
			"data":    tx.Error.Error(),
		})
		return
	}

	// Hard Delete Landing Page (permanently remove from database)
	if err := tx.Unscoped().Delete(&landingPageDelete).Error; err != nil {
		tx.Rollback()
		services.LogActivity(config.DB, c, "Delete", moduleNameLandingPage, landingPageIDParam, oldLandingPageData, nil, "error", "Failed to delete landing page template: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to delete landing page template",
			"data":    err.Error(),
		})
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		services.LogActivity(config.DB, c, "Delete", moduleNameLandingPage, landingPageIDParam, oldLandingPageData, nil, "error", "Failed to commit transaction: "+err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to commit transaction",
			"data":    err.Error(),
		})
		return
	}

	services.LogActivity(config.DB, c, "Delete", moduleNameLandingPage, landingPageIDParam, oldLandingPageData, nil, "success", "Landing Page deleted successfully")
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Landing Page deleted successfully",
		"data": gin.H{ // Mengembalikan data yang dihapus untuk konfirmasi
			"deleted_landingPage": gin.H{
				"id":   landingPageDelete.ID,
				"name": landingPageDelete.Name,
			},
		},
	})
}
