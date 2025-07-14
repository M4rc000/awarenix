package controllers

// func GetMenusAndSubmenus(c *gin.Context) {
// 	var menus []models.Menu
// 	// Preload Submenus untuk setiap Menu
// 	if err := config.DB.Preload("Submenus").Where("is_active = ?", 1).Find(&menus).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to fetch menus"})
// 		return
// 	}

// 	// Konversi ke format yang diharapkan frontend (MenuFromBackend)
// 	// Kita perlu menguraikan string JSON allowed_roles menjadi []int
// 	var responseData []struct {
// 		ID       uint   `json:"id"`
// 		Name     string `json:"name"`
// 		Submenus []struct {
// 			MenuID       uint   `json:"menu_id"`
// 			Name         string `json:"name"`
// 			Icon         string `json:"icon"`
// 			Url          string `json:"url"`
// 			IsActive     int    `json:"is_active"`
// 			AllowedRoles []int  `json:"allowed_roles"` // Ini akan menjadi array int
// 		} `json:"submenus"`
// 	}

// 	for _, menu := range menus {
// 		menuItem := struct {
// 			ID       uint   `json:"id"`
// 			Name     string `json:"name"`
// 			Submenus []struct {
// 				MenuID       uint   `json:"menu_id"`
// 				Name         string `json:"name"`
// 				Icon         string `json:"icon"`
// 				Url          string `json:"url"`
// 				IsActive     int    `json:"is_active"`
// 				AllowedRoles []int  `json:"allowed_roles"`
// 			} `json:"submenus"`
// 		}{
// 			ID:   menu.ID,
// 			Name: menu.Name,
// 			Submenus: []struct {
// 				MenuID       uint   `json:"menu_id"`
// 				Name         string `json:"name"`
// 				Icon         string `json:"icon"`
// 				Url          string `json:"url"`
// 				IsActive     int    `json:"is_active"`
// 				AllowedRoles []int  `json:"allowed_roles"`
// 			}{},
// 		}

// 		for _, submenu := range menu.Submenus {
// 			var roles []int
// 			// Unmarshal string JSON allowed_roles menjadi []int
// 			if err := json.Unmarshal([]byte(submenu.AllowedRoles), &roles); err != nil {
// 				log.Printf("Error unmarshalling allowed_roles for submenu %s: %v", submenu.Name, err)
// 				roles = []int{} // Default ke array kosong jika gagal
// 			}

// 			menuItem.Submenus = append(menuItem.Submenus, struct {
// 				MenuID       uint   `json:"menu_id"`
// 				Name         string `json:"name"`
// 				Icon         string `json:"icon"`
// 				Url          string `json:"url"`
// 				IsActive     int    `json:"is_active"`
// 				AllowedRoles []int  `json:"allowed_roles"`
// 			}{
// 				MenuID:       submenu.MenuID,
// 				Name:         submenu.Name,
// 				Icon:         submenu.Icon,
// 				Url:          submenu.Url,
// 				IsActive:     submenu.IsActive,
// 				AllowedRoles: roles, // Sudah berupa []int
// 			})
// 		}
// 		responseData = append(responseData, menuItem)
// 	}

// 	c.JSON(http.StatusOK, gin.H{
// 		"status":  "success",
// 		"message": "Menus and submenus fetched successfully",
// 		"data":    responseData,
// 	})
// }
