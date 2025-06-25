package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"io"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/gin-gonic/gin"
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

// SAVE NEW DATA EMAIL TEMPLATE
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

	// CEK DUPLIKASI EMAIL TEMPLATE
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
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	search := c.Query("search")
	sortBy := c.DefaultQuery("sortBy", "id")
	sortOrder := c.DefaultQuery("sortOrder", "asc")

	offset := (page - 1) * pageSize

	query := config.DB.Model(&models.LandingPage{})

	if search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		query = query.Where(
			"LOWER(name) LIKE ?",
			searchPattern, searchPattern, searchPattern,
		)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to count landing page",
			"Error":   err.Error(),
		})
		return
	}

	orderClause := sortBy
	if sortOrder == "desc" {
		orderClause += " DESC"
	} else {
		orderClause += " ASC"
	}

	var templates []models.LandingPage
	if err := query.Order(orderClause).Offset(offset).Limit(pageSize).Find(&templates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Success": false,
			"Message": "Failed to fetch landing page",
			"Error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"Success": true,
		"Message": "Landing pages retrieved successfully",
		"Data":    templates,
		"Total":   total,
	})
}
