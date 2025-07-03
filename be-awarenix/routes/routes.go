package routes

import (
	"be-awarenix/controllers"
	"be-awarenix/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	// Middleware global
	router.Use(gin.Logger(), gin.Recovery())

	// Public routes
	router.POST("/api/v1/auth/login", controllers.AuthLogin)
	router.POST("/api/v1/auth/logout", middlewares.JWTAuth(), controllers.AuthLogout)

	// Protected API routes (dengan JWT middleware,)
	api := router.Group("/api/v1")
	api.Use(middlewares.JWTAuth())
	{
		groups := api.Group("/groups")
		{
			groups.POST("/register", controllers.RegisterGroup) // CREATE
			groups.GET("/all", controllers.GetGroups)           // READ
			groups.GET("/members/all", controllers.GetMembers)  // READ
			groups.GET("/:id", controllers.GetGroupDetail)      // DETAIL
			groups.PUT("/:id", controllers.UpdateGroup)         // UPATE
			groups.DELETE("/:id", controllers.DeleteGroup)      // DELETE
		}

		users := api.Group("/users")
		{
			users.POST("/session", controllers.GetUserSession)
			users.POST("/register", controllers.RegisterUser) // CREATE
			users.GET("/all", controllers.GetUsers)           // READ
			users.PUT("/:id", controllers.UpdateUser)         // UPDATE
			users.DELETE("/:id", controllers.DeleteUser)      // DELETE
		}

		roles := api.Group("/user-roles")
		{
			roles.GET("/all", controllers.GetRoles)         // READ
			roles.POST("/create", controllers.RegisterRole) // CREATE
			roles.PUT("/:id", controllers.UpdateRole)       // UPDATE
			roles.DELETE("/:id", controllers.DeleteRole)    // DELETE
		}

		emailTemplate := api.Group("/email-template")
		{
			emailTemplate.POST("/create", controllers.RegisterEmailTemplate) // CREATE
			emailTemplate.GET("/all", controllers.GetEmailTemplates)         // READ
			emailTemplate.PUT("/:id", controllers.UpdateEmailTemplate)       // UPDATE
			emailTemplate.DELETE("/:id", controllers.DeleteEmailTemplate)    // DELETE
		}

		landingPage := api.Group("/landing-page")
		{
			landingPage.POST("/create", controllers.RegisterLandingPage) // CREATE
			landingPage.GET("/all", controllers.GetLandingPages)         // READ
			landingPage.PUT("/:id", controllers.UpdateLandingPage)       // UPDATE
			landingPage.DELETE("/:id", controllers.DeleteLandingPage)    // DELETE
			landingPage.POST("/clone-site", controllers.CloneSite)       // CLONE SITE
		}

		sendingprofiles := api.Group("/sending-profile")
		{
			sendingprofiles.POST("/create", controllers.RegisterSendingProfile)                // CREATE
			sendingprofiles.GET("/all", controllers.GetSendingProfiles)                        // READ
			sendingprofiles.PUT("/:id", controllers.UpdateSendingProfile)                      // UPDATE
			sendingprofiles.PUT("/email-header/:id", controllers.UpdateEmailHeadersForProfile) // UPDATE
			sendingprofiles.GET("/email-header/:id", controllers.GetEmailHeaderDetail)         // DETAIL
			sendingprofiles.DELETE("/:id", controllers.DeleteSendingProfile)                   // DELETE

		}

		analytics := api.Group("/analytics")
		{
			analytics.GET("/growth-percentage", controllers.GetGrowthPercentage)
		}
	}
}
