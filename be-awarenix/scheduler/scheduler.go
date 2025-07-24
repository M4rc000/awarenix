package scheduler

import (
	"be-awarenix/config"
	"be-awarenix/controllers"
	"be-awarenix/models"
	"be-awarenix/services"
	"log"
	"time"
)

func StartCampaignDispatcher() {
	log.Println("Starting Campaign Watcher...")
	ticker := time.NewTicker(1 * time.Minute)
	go func() {
		for range ticker.C {
			now := time.Now()

			// Cari campaign yang ready to start: status pending,
			// launch_date ≤ now ≤ send_email_by
			var campaigns []models.Campaign
			config.DB.
				Preload("Group.Members").
				Preload("EmailTemplate").
				Preload("LandingPage").
				Preload("SendingProfile").
				Where("status = ? AND launch_date <= ? AND (send_email_by IS NULL OR send_email_by >= ?)", "pending", now, now).Find(&campaigns)

			for _, camp := range campaigns {
				// tandai in_progress agar tidak di-pick lagi
				config.DB.Model(&camp).Update("status", "in progress")

				// launch sending + monitor status
				go func(c models.Campaign) {
					controllers.SendCampaign(c)
					services.MonitorCampaignStatus(c.ID)
				}(camp)
			}
		}
	}()
}
