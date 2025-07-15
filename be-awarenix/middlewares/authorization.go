package middlewares

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// AuthorizeRoles adalah middleware yang memeriksa apakah user memiliki salah satu dari role yang diizinkan.
func AuthorizeRoles(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRoleName, exists := c.Get("roleName") // Ambil roleName dari JWTAuth middleware
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"status":  "error",
				"message": "Unauthorized: Role information not found in context",
				"data":    nil,
			})
			c.Abort()
			return
		}

		currentRole := userRoleName.(string)
		for _, role := range allowedRoles {
			if currentRole == role {
				c.Next() // Role diizinkan, lanjutkan ke handler berikutnya
				return
			}
		}

		// Jika tidak ada role yang cocok
		c.JSON(http.StatusForbidden, gin.H{
			"status":  "error",
			"message": "Forbidden: Insufficient permissions for this action",
			"data":    nil,
		})
		c.Abort()
	}
}

// AuthorizeSubmenuAccess adalah middleware yang memeriksa apakah user memiliki akses ke submenu tertentu berdasarkan URL-nya.
// Ini mungkin lebih kompleks jika Anda perlu memetakan URL API ke URL Submenu frontend.
// Namun, disarankan otorisasi API berbasis role, dan otorisasi submenu di frontend.
// Jika Anda ingin otorisasi berdasarkan URL Submenu di BE, Anda perlu mem-passing URL Submenu yang relevan
// atau memetakan endpoint API ke submenu.
/*
func AuthorizeSubmenuAccess(submenuURL string) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Ambil daftar allowed_submenus dari JWT claims atau dari database
        allowedSubmenus, exists := c.Get("allowedSubmenus").([]string) // Jika disimpan di token
        if !exists {
            // Fetch dari DB jika tidak ada di token
            // ...
        }

        for _, url := range allowedSubmenus {
            if url == submenuURL {
                c.Next()
                return
            }
        }
        c.JSON(http.StatusForbidden, gin.H{
            "status": "error",
            "message": "Forbidden: Access to this feature (via submenu) is denied",
            "data": nil,
        })
        c.Abort()
    }
}
*/
