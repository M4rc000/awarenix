package controllers

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// IMPORT SITE
// CloneSiteRequest represents the request structure for cloning a site
type CloneSiteRequest struct {
	URL              string `json:"url" form:"url" binding:"required"`
	IncludeResources bool   `json:"include_resources" form:"include_resources"`
}

// CloneSiteResponse represents the response structure
type CloneSiteResponse struct {
	HTML string `json:"html"`
	URL  string `json:"url"`
}

func CloneSiteHTML(c *gin.Context) {
	var req CloneSiteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validasi URL
	parsedURL, err := url.ParseRequestURI(req.URL)
	if err != nil || (parsedURL.Scheme != "http" && parsedURL.Scheme != "https") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL provided"})
		return
	}

	// Lakukan permintaan HTTP GET ke URL eksternal
	resp, err := http.Get(req.URL)
	if err != nil {
		log.Printf("Failed to fetch URL %s: %v", req.URL, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch external site", "details": err.Error()})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("External site returned non-OK status %d for URL %s", resp.StatusCode, req.URL)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "External site returned non-OK status", "status": resp.StatusCode})
		return
	}

	// Baca body respons
	htmlBytes, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Failed to read response body from %s: %v", req.URL, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response body", "details": err.Error()})
		return
	}

	htmlContent := string(htmlBytes)

	// TODO: Implementasi logika untuk memproses atau menyimpan HTML jika diperlukan.
	// Untuk saat ini, kita langsung kembalikan HTML-nya.
	// Jika Anda memiliki model untuk LandingPage, Anda bisa menyimpannya di sini.
	// Contoh:
	// landingPage := models.LandingPage{
	//     Name:        "Imported Landing Page", // Atau ambil dari input lain
	//     HTMLContent: htmlContent,
	// }
	// if err := models.DB.Create(&landingPage).Error; err != nil {
	//     c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save landing page"})
	//     return
	// }

	// MENGEMBALIKAN HTML SEBAGAI JSON
	c.JSON(http.StatusOK, gin.H{"html": htmlContent}) // Mengembalikan objek JSON dengan kunci "html"
}

// sanitizeHTML removes potentially dangerous script tags
func sanitizeHTML(html string) string {
	// Remove script tags (case insensitive)
	html = strings.ReplaceAll(strings.ToLower(html), "<script", "<!--script")
	html = strings.ReplaceAll(html, "</script>", "</script-->")

	// You can add more sanitization rules here as needed
	// For example, removing onclick handlers, etc.

	return html
}

// convertRelativeURLs converts relative URLs to absolute URLs
func convertRelativeURLs(html, baseURL string) string {
	parsedBase, err := url.Parse(baseURL)
	if err != nil {
		return html
	}

	// Simple replacements for common relative URL patterns
	// This is a basic implementation - you might want to use a proper HTML parser
	// for more comprehensive URL conversion

	baseSchemeHost := fmt.Sprintf("%s://%s", parsedBase.Scheme, parsedBase.Host)

	// Convert relative URLs starting with /
	html = strings.ReplaceAll(html, `src="/`, fmt.Sprintf(`src="%s/`, baseSchemeHost))
	html = strings.ReplaceAll(html, `href="/`, fmt.Sprintf(`href="%s/`, baseSchemeHost))

	// Convert relative URLs starting with ./
	html = strings.ReplaceAll(html, `src="./`, fmt.Sprintf(`src="%s/`, baseSchemeHost))
	html = strings.ReplaceAll(html, `href="./`, fmt.Sprintf(`href="%s/`, baseSchemeHost))

	return html
}

// Alternative version with more comprehensive URL handling
func CloneSiteHTMLAdvanced(c *gin.Context) {
	// Get URL from query parameter
	targetURL := c.Query("url")
	includeResources := c.Query("include_resources") == "true"

	if targetURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Bad Request",
			"message": "URL parameter is required",
		})
		return
	}

	// Validate URL format
	parsedURL, err := url.Parse(targetURL)
	if err != nil || (parsedURL.Scheme != "http" && parsedURL.Scheme != "https") {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Bad Request",
			"message": "Invalid URL format. URL must start with http:// or https://",
		})
		return
	}

	// Create HTTP client with timeout and custom transport for better control
	client := &http.Client{
		Timeout: 30 * time.Second,
		Transport: &http.Transport{
			MaxIdleConns:    10,
			IdleConnTimeout: 30 * time.Second,
		},
	}

	// Fetch HTML content
	htmlContent, err := fetchHTMLContent(client, targetURL)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Bad Request",
			"message": err.Error(),
		})
		return
	}

	// Process the HTML content
	processedHTML := processHTML(htmlContent, targetURL, includeResources)

	// Return the processed HTML content
	c.JSON(http.StatusOK, gin.H{
		"html":              processedHTML,
		"url":               targetURL,
		"include_resources": includeResources,
	})
}

// fetchHTMLContent fetches HTML content from the given URL
func fetchHTMLContent(client *http.Client, targetURL string) (string, error) {
	req, err := http.NewRequest("GET", targetURL, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %v", err)
	}

	// Set headers to mimic a real browser
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
	req.Header.Set("Accept-Language", "en-US,en;q=0.5")
	req.Header.Set("Accept-Encoding", "gzip, deflate, br")
	req.Header.Set("Connection", "keep-alive")
	req.Header.Set("Upgrade-Insecure-Requests", "1")

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to fetch URL: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to fetch URL. Status: %d %s", resp.StatusCode, resp.Status)
	}

	// Check content type
	contentType := resp.Header.Get("Content-Type")
	if !strings.Contains(strings.ToLower(contentType), "text/html") {
		return "", fmt.Errorf("URL does not return HTML content. Content-Type: %s", contentType)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %v", err)
	}

	return string(body), nil
}

// processHTML processes the HTML content (sanitization, URL conversion, etc.)
func processHTML(html, baseURL string, includeResources bool) string {
	// Basic sanitization
	html = sanitizeHTML(html)

	// Convert relative URLs to absolute URLs
	if includeResources {
		html = convertRelativeURLs(html, baseURL)
	}

	return html
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
