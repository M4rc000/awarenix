package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
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

// SAVE NEW DATA LANDING PAGE
func RegisterLandingPage(c *gin.Context) {
	var input models.LandingPageInput

	// Bind dan validasi input JSON
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Validation failed",
			"message": err.Error(),
		})
		return
	}

	// CEK DUPLIKASI LANDING PAGE
	var existingLandingPage models.LandingPage
	if err := config.DB.
		Where("name = ? ", input.Name).
		First(&existingLandingPage).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"error":   "Landing Page already exists",
			"message": "Landing Page with this name already registered",
		})
		return
	}

	// BUAT LANDING PAGE BARU
	newLandingPage := models.LandingPage{
		Name:      input.Name,
		Body:      input.Body,
		CreatedAt: time.Now(),
		CreatedBy: input.CreatedBy,
	}

	// SIMPAN KE DATABASE
	if err := config.DB.Create(&newLandingPage).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": "Failed to create landing page template",
		})
		return
	}

	// RESPONSE SUKSES
	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Landing Page created successfully",
	})
}

// READ
func GetLandingPages(c *gin.Context) {
	query := config.DB.Table("landing_pages").
		Select(`landing_pages.*, 
            created_by_user.name AS created_by_name, 
            updated_by_user.name AS updated_by_name`).
		Joins(`LEFT JOIN users AS created_by_user ON created_by_user.id = landing_pages.created_by`).
		Joins(`LEFT JOIN users AS updated_by_user ON updated_by_user.id = landing_pages.updated_by`)

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

// EDIT DATA LANDING
func UpdateLandingPage(c *gin.Context) {
	id := c.Param("id")

	var landingPage models.LandingPage
	if err := config.DB.First(&landingPage, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"Success": false,
			"Message": "Landing Page not found",
			"Error":   err.Error(),
		})
		return
	}

	var updatedData models.UpdateLandingPage

	if err := c.ShouldBindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Success": false,
			"Message": "Invalid request",
			"Error":   err.Error(),
		})
		return
	}

	landingPage.Name = updatedData.Name
	landingPage.Body = updatedData.Body
	landingPage.UpdatedBy = int(updatedData.UpdatedBy)
	landingPage.UpdatedAt = time.Now()

	if err := config.DB.Save(&landingPage).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to update landing page",
			"Error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"Success": true,
		"Message": "Landing Page updated successfully",
		"Data":    landingPage,
	})
}

// DELETE DATA LANDING PAGE
func DeleteLandingPage(c *gin.Context) {
	landingPageID := c.Param("id")

	// VALIDATE LANDING PAGE ID
	id, err := strconv.ParseUint(landingPageID, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid Landing Page ID format",
			"error":   "Landing Page ID must be a valid number",
		})
		return
	}

	// CHECK IF LANDING PAGE THAT WANT TO BE DELETE EXIST
	var landingPageDelete models.LandingPage
	if err := config.DB.First(&landingPageDelete, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Landing Page not found",
				"error":   "The specified landing page does not exist",
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

	// START DB TRANSACTION FOR SAFE DELETION
	tx := config.DB.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to start transaction",
			"error":   tx.Error.Error(),
		})
		return
	}

	// Hard Delete Landing Page (permanently remove from database)
	if err := tx.Unscoped().Delete(&landingPageDelete).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete landing page template",
			"error":   err.Error(),
		})
		return
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
		"message": "Landing Page deleted successfully",
		"data": gin.H{
			"delete_landingPage": gin.H{
				"id":   landingPageDelete.ID,
				"name": landingPageDelete.Name,
			},
		},
	})
}
