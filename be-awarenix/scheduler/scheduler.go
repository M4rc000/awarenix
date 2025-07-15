package scheduler

import (
	"be-awarenix/config"
	"be-awarenix/controllers"
	"be-awarenix/models"
	"log"
	"time"
)

func StartCampaignDispatcher() {
	log.Println("Starting Campaign Watcher...")
	ticker := time.NewTicker(1 * time.Minute)
	go func() {
		for range ticker.C {
			now := time.Now()
			var campaigns []models.Campaign

			// Preload semua relasi penting
			config.DB.
				Preload("Group.Members").
				Preload("EmailTemplate").
				Preload("LandingPage").
				Preload("SendingProfile").
				Where("status = ? AND launch_date <= ?", "draft", now).
				Find(&campaigns)

			for _, camp := range campaigns {
				// Tandai sebagai scheduled untuk menghindari duplikat
				config.DB.Model(&camp).Update("status", "scheduled")

				// Mulai pengiriman asinkron
				go controllers.SendCampaign(camp)
			}
		}
	}()
}
