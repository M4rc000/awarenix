package middlewares

import (
	"be-awarenix/config"
	"be-awarenix/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AuthMiddleware(c *gin.Context) {
	// 1. Ambil token JWT dari header
	// 2. Validasi token dan ekstrak UserID dan RoleID
	userID := getUserIDFromToken(c)         // Asumsi fungsi ini sudah ada
	userRoleID := getUserRoleIDFromToken(c) // Asumsi fungsi ini sudah ada

	if userID == 0 || userRoleID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		c.Abort()
		return
	}

	// 3. Tentukan menu/submenu yang terkait dengan rute saat ini menggunakan query database
	path := c.Request.URL.Path
	// Hapus '/api' prefix jika ada, untuk mencocokkan URL di tabel Submenu
	cleanedPath := strings.TrimPrefix(path, "/api")

	var menuID uint
	var submenuID uint
	var isMenuOrSubmenuFound bool = false

	// Coba cari di tabel Submenu terlebih dahulu, karena submenus memiliki URL spesifik
	submenuID = getSubmenuIDByUrl(config.DB, cleanedPath)
	if submenuID != 0 {
		// Jika ditemukan di submenu, ambil juga MenuID induknya jika perlu untuk logging/debugging
		var submenu models.Submenu
		config.DB.First(&submenu, submenuID)
		menuID = submenu.MenuID
		isMenuOrSubmenuFound = true
	} else {
		// Jika tidak ditemukan di submenu, coba cari di tabel Menu berdasarkan URL-nya
		// Asumsi: Menu juga bisa memiliki URL langsung jika tidak punya submenu, atau
		// kita bisa melakukan mapping manual jika URL menu tidak sama persis dengan nama menu.
		// Untuk kesederhanaan, kita bisa mencoba mendapatkan menu ID dari path jika path adalah root dari menu tsb.
		// Contoh: /dashboard -> Dashboard
		// Ini akan sedikit tricky karena path API mungkin tidak langsung cocok dengan path menu di frontend.
		// Solusi yang lebih robust adalah dengan menyimpan field 'api_path' di tabel Menu/Submenu
		// atau membuat map URL API ke nama menu/submenu yang disimpan di database.
		// Untuk saat ini, kita akan coba map langsung ke nama menu yang ada di RBAC.txt
		menuName := ""
		switch cleanedPath {
		case "/dashboard":
			menuName = "Dashboard"
		case "/campaigns":
			menuName = "Campaigns"
		case "/role-management":
			menuName = "Role Management"
		case "/user-management":
			menuName = "User Management"
		case "/groups-members":
			menuName = "Groups and Members"
		case "/email-templates":
			menuName = "Email Templates"
		case "/landing-pages":
			menuName = "Landing Pages"
		case "/sending-profiles":
			menuName = "Sending Profiles"
			// Tambahkan case untuk submenu jika URL-nya unik dan tidak tercakup oleh getSubmenuIDByUrl
			// Misalnya: case "/phishing-emails": menuName = "Phishing Emails" // Jika ini adalah menu utama
			// Atau jika Anda ingin tetap menggunakan getMenuIDByName untuk ini.
		}

		if menuName != "" {
			menuID = getMenuIDByName(config.DB, menuName)
			if menuID != 0 {
				isMenuOrSubmenuFound = true
			}
		}
	}

	if !isMenuOrSubmenuFound {
		// Jika rute tidak memerlukan otorisasi menu/submenu, atau tidak ditemukan di mapping
		c.Next()
		return
	}

	// 4. Periksa izin akses di database
	var hasAccess bool
	if submenuID != 0 { // Jika yang diakses adalah submenu
		var roleSubmenuAccess models.RoleSubmenuAccess
		result := config.DB.Where("role_id = ? AND submenu_id = ?", userRoleID, submenuID).First(&roleSubmenuAccess)
		hasAccess = result.Error == nil
	} else if menuID != 0 { // Jika yang diakses adalah menu utama
		var roleMenuAccess models.RoleMenuAccess
		result := config.DB.Where("role_id = ? AND menu_id = ?", userRoleID, menuID).First(&roleMenuAccess)
		hasAccess = result.Error == nil
	} else {
		// Ini seharusnya tidak tercapai jika isMenuOrSubmenuFound sudah true
		hasAccess = false
	}

	if !hasAccess {
		c.JSON(http.StatusForbidden, gin.H{"status": "error", "message": "Access Denied: You do not have permission to access this resource."})
		c.Abort()
		return
	}

	// Simpan UserID di context untuk digunakan di controller (misal untuk created_by/updated_by)
	c.Set("currentUserID", userID)

	c.Next() // Lanjutkan ke handler berikutnya
}

func getMenuIDByName(db *gorm.DB, name string) uint {
	var menu models.Menu
	result := db.Where("name = ?", name).First(&menu)
	if result.Error != nil {
		return 0 // Menu tidak ditemukan
	}
	return menu.ID
}

// getSubmenuIDByUrl adalah fungsi helper untuk mendapatkan ID submenu dari URL-nya
// Menggunakan URL submenu yang tersimpan di database
func getSubmenuIDByUrl(db *gorm.DB, url string) uint {
	var submenu models.Submenu
	result := db.Where("url = ?", url).First(&submenu)
	if result.Error != nil {
		return 0 // Submenu tidak ditemukan
	}
	return submenu.ID
}

// Fungsi placeholder untuk mendapatkan UserID dan RoleID dari token JWT
// Anda harus mengganti ini dengan implementasi parsing JWT yang sebenarnya
func getUserIDFromToken(c *gin.Context) uint {
	// Implementasi ekstraksi UserID dari JWT
	// Contoh:
	// claims, exists := c.Get("claims")
	// if !exists { return 0 }
	// return claims.(*jwt.MyCustomClaims).UserID // Sesuaikan dengan struktur claims Anda
	return 1 // Placeholder untuk testing
}

func getUserRoleIDFromToken(c *gin.Context) uint {
	// Implementasi ekstraksi RoleID dari JWT
	// Contoh:
	// claims, exists := c.Get("claims")
	// if !exists { return 0 }
	// return claims.(*jwt.MyCustomClaims).RoleID // Sesuaikan dengan struktur claims Anda
	return 1 // Placeholder untuk testing
}
