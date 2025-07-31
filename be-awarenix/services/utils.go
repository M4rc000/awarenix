package services

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/mssola/user_agent"
	"github.com/speps/go-hashids"
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
func LogEventByRID(c *gin.Context, rid string, eventType string, campaignLanguage string, campaignID uint) {
	if campaignLanguage == "" {
		campaignLanguage = "English" // Default fallback language
	}

	// 1. Cari Recipient
	var rec models.Recipient
	if err := config.DB.
		Where("uid = ?", rid).
		First(&rec).Error; err != nil {
		log.Printf("ERROR: Recipient not found for event logging (RID: %s, Type: %s): %v", rid, eventType, err)
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
	metaJSON, err := json.Marshal(metaMap)
	if err != nil {
		log.Printf("ERROR: Failed to marshal metadata to JSON for event (RID: %s, Type: %s): %v", rid, eventType, err)
		metaJSON = []byte("{}")
	}

	// 6. Buat object Event
	evType := models.EventType(eventType)
	e := models.Event{
		RecipientID:  rec.ID,
		RecipientRID: rid,
		CampaignID:   campaignID,
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
		Where("recipient_id = ? AND campaign_id = ? AND type = ?", rec.ID, campaignID, evType).
		Count(&cnt)

	// 8. Simpan hanya jika belum ada (atau jika eventType adalah click/submit/attachment_clicked yang bisa berulang)
	isDuplicate := false
	if evType == models.Opened || evType == models.Reported {
		if cnt > 0 {
			isDuplicate = true
			log.Printf("INFO: Skipping duplicate event: Recipient %s, Campaign %d, Type %s", rid, campaignID, eventType)
		}
	}

	if !isDuplicate {
		if err := config.DB.Create(&e).Error; err != nil {
			log.Printf("ERROR: Failed to create event record (RID: %s, Type: %s): %v", rid, eventType, err)
		} else {
			log.Printf("INFO: Event logged: Recipient %s, Campaign %d, Type %s, ID: %d", rid, campaignID, eventType, e.ID)
		}
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

func GetRoleScopeDashboard(c *gin.Context) (int, int, int, bool) {
	userScope, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "User not authenticated"})
		return 0, 0, 0, false
	}

	user, ok := userScope.(*models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to parse user data: invalid user object in context"})
		return 0, 0, 0, false
	}

	userID := int(user.ID)
	role := user.Role

	return userID, role, user.CreatedBy, true
}

func EncodeID(id int) string {
	hd := hashids.NewData()
	hd.Salt = os.Getenv("SALT_SECRET")
	hd.MinLength = 6
	h, _ := hashids.NewWithData(hd)

	e, _ := h.Encode([]int{id})
	return e
}

func DecodeID(encoded string) (int, error) {
	hd := hashids.NewData()
	hd.Salt = os.Getenv("SALT_SECRET")
	hd.MinLength = 6
	h, _ := hashids.NewWithData(hd)

	ids, err := h.DecodeWithError(encoded)
	if err != nil || len(ids) == 0 {
		return 0, fmt.Errorf("invalid ID")
	}

	return ids[0], nil
}

func LogSubmitEvent(rid string, campaignID uint, formData models.SubmitCampaign) error {
	// Tambahkan data dari parameter ke struct
	formData.RecipientUID = rid
	formData.CampaignID = campaignID
	formData.CreatedAt = time.Now()

	// Simpan data submit ke database
	if err := config.DB.Create(&formData).Error; err != nil {
		return fmt.Errorf("failed to save submitted form data: %w", err)
	}

	// Perbarui status recipient menjadi "submitted"
	if err := config.DB.Model(&models.Recipient{}).
		Where("uid = ? AND campaign_id = ?", rid, campaignID).
		Update("status", "submitted").Error; err != nil {
		return fmt.Errorf("failed to update recipient status: %w", err)
	}

	return nil
}
