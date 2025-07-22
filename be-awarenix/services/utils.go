package services

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/mssola/user_agent"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/net/html"
	"gorm.io/datatypes"
)

func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

// LogEventByRID mencatat event berbasis rid (string UUID)
func LogEventByRID(c *gin.Context, rid string, eventType string) {
	// 1. Cari Recipient
	var rec models.Recipient
	if err := config.DB.
		Where("uid = ?", rid).
		First(&rec).Error; err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	// 2. Kumpulkan metadata umum
	uaString := c.Request.UserAgent()
	ua := user_agent.New(uaString)
	browserName, browserVersion := ua.Browser()
	osName := ua.OS()

	// 3. Siapkan map untuk detail payload
	metaMap := map[string]interface{}{
		"query":     c.Request.URL.Query(),
		"referrer":  c.Request.Referer(),
		"userAgent": uaString,
	}

	// 4. Bila metode POST, tambahkan seluruh form fields
	if c.Request.Method == "POST" {
		c.Request.ParseForm()
		formCopy := make(map[string][]string)
		for k, v := range c.Request.PostForm {
			formCopy[k] = v
		}
		metaMap["form"] = formCopy
	}

	// 5. Marshal ke JSON untuk kolom Metadata
	metaJSON, _ := json.Marshal(metaMap)

	// 6. Buat object Event
	evType := models.EventType(eventType)
	e := models.Event{
		RecipientID:  rec.ID,
		RecipientRID: rid,
		CampaignID:   rec.CampaignID,
		Type:         evType,
		Timestamp:    time.Now(),
		IP:           c.ClientIP(),
		UserAgent:    uaString,
		Browser:      browserName + " " + browserVersion,
		OS:           osName,
		Metadata:     datatypes.JSON(metaJSON),
	}

	// 7. Duplicate check: cari count dengan recipient_id, campaign_id, type yang sama
	var cnt int64
	config.DB.Model(&models.Event{}).
		Where("recipient_id = ? AND campaign_id = ? AND type = ?", rec.ID, rec.CampaignID, evType).
		Count(&cnt)

	// 8. Simpan hanya jika belum ada
	if cnt == 0 {
		config.DB.Create(&e)
	}

	// 9. Response: serve pixel / redirect / text
	switch eventType {
	case string(models.Opened):
		c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
		c.File("pixel.gif")
	case string(models.Clicked):
		target, _ := url.QueryUnescape(c.Query("url"))
		c.Redirect(302, target)
	case string(models.Submitted):
		c.Redirect(302, "http://localhost:5173/dashboard")
	case string(models.Reported):
		frontendDomain := "localhost:5173"
		c.Redirect(302, fmt.Sprintf("http://%s/report-thanks", frontendDomain))
	default:
		c.Status(204)
	}
}

func RewriteLinks(
	htmlStr string,
	uid string,
	campaignID uint,
	pageID uint,
	frontendDomain string,
	name string,
	email string,
) string {
	doc, _ := html.Parse(strings.NewReader(htmlStr))
	var rewrite func(*html.Node)
	rewrite = func(n *html.Node) {
		if n.Type == html.ElementNode && n.Data == "a" {
			skip := false
			for _, attr := range n.Attr {
				if attr.Key == "href" && strings.Contains(attr.Val, "/track/report") {
					skip = true
					break
				}
				if attr.Key == "data-no-track" {
					skip = true
					break
				}
			}
			if !skip {
				for i, attr := range n.Attr {
					if attr.Key == "href" {
						orig := attr.Val
						enc := url.QueryEscape(orig)
						n.Attr[i].Val = fmt.Sprintf(
							"http://%s/lander?rid=%s&campaign=%d&page=%d&url=%s",
							frontendDomain, uid, campaignID, pageID, enc,
						)
					}
				}
			}
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			rewrite(c)
		}
	}
	rewrite(doc)

	// Ambil hasil render link-tracking
	var buf bytes.Buffer
	html.Render(&buf, doc)
	result := buf.String()

	// Ganti placeholder templating jika ada
	result = strings.ReplaceAll(result, "{{.Name}}", name)
	result = strings.ReplaceAll(result, "{{.Email}}", email)

	return result
}

func GetRoleScope(c *gin.Context) (int, int, bool) {
	userScope, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "User not authenticated"})
		return 0, 0, false
	}

	user, ok := userScope.(*models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to parse user data: invalid user object in context"})
		return 0, 0, false
	}

	userID := int(user.ID)
	role := user.Role

	return userID, role, true
}
