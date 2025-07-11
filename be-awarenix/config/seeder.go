package config

import (
	"be-awarenix/models"
	"be-awarenix/services"
	"log"
	"time"

	"gorm.io/gorm"
)

func SeedUsers(db *gorm.DB) {
	usersToSeed := []models.User{
		{
			Name:         "Marco Antonio",
			Email:        "marco@gmail.com",
			PasswordHash: "123456",
			Position:     "Security Consultant",
			IsActive:     1,
			Role:         2,
		},
		{
			Name:         "Jane Doe",
			Email:        "jane.doe@example.com",
			PasswordHash: "password_jane",
			Position:     "Developer",
			IsActive:     1,
			Role:         3,
		},
	}

	// 2. Lakukan perulangan untuk setiap user dalam slice di atas.
	for _, userData := range usersToSeed {
		// 3. Cek apakah user dengan email tersebut sudah ada di database.
		var existingUser models.User
		err := db.Where("email = ?", userData.Email).First(&existingUser).Error

		// Jika user tidak ditemukan (ini yang kita harapkan), maka buat user baru.
		if err != nil && err == gorm.ErrRecordNotFound {
			log.Printf("Seeding user '%s'...", userData.Name)

			// Hash password mentah dari data slice
			hashedPassword, hashErr := services.HashPassword(userData.PasswordHash)
			if hashErr != nil {
				log.Fatalf("Failed to hash password for seeder: %v", hashErr)
			}
			// Update field PasswordHash dengan hasil hash
			userData.PasswordHash = hashedPassword

			// Buat user di database
			if err := db.Create(&userData).Error; err != nil {
				log.Fatalf("Failed to seed user '%s': %v", userData.Name, err)
			}
			log.Printf("User '%s' seeded successfully.", userData.Name)

		} else if err != nil {
			// Handle error lain selain record not found
			log.Fatalf("Error checking for user '%s': %v", userData.Name, err)
		} else {
			// Jika tidak ada error, berarti user sudah ada
			log.Printf("User with email '%s' already exists. Seeder skipped.", userData.Email)
		}
	}
}

func SeedRoles(db *gorm.DB) {
	rolesToSeed := []models.Role{
		{
			Name:      "Super Admin",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
		{
			Name:      "Admin",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
		{
			Name:      "Engineer",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
	}

	for _, roleData := range rolesToSeed {
		var existingRole models.Role
		err := db.Where("name = ?", roleData.Name).First(&existingRole).Error

		if err != nil && err == gorm.ErrRecordNotFound {
			log.Printf("Seeding role '%s'...", roleData.Name)

			// Buat role di database
			if err := db.Create(&roleData).Error; err != nil {
				log.Fatalf("Failed to seed role '%s': %v", roleData.Name, err)
			}
			log.Printf("Role '%s' seeded successfully.", roleData.Name)

		} else if err != nil {
			log.Fatalf("Error checking for role '%s': %v", roleData.Name, err)
		} else {
			log.Printf("Role with name '%s' already exists. Seeder skipped.", roleData.Name)
		}
	}
}

func SeedMenus(db *gorm.DB) {
	rolesToMenu := []models.Menu{
		{
			Name:      "Admin",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
		{
			Name:      "Phishing Simulation",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
		{
			Name:      "User",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
		{
			Name:      "Logging & Monitoring",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
	}

	for _, menuData := range rolesToMenu {
		var existingRole models.Menu
		err := db.Where("name = ?", menuData.Name).First(&existingRole).Error

		if err != nil && err == gorm.ErrRecordNotFound {
			log.Printf("Seeding role '%s'...", menuData.Name)

			// Buat role di database
			if err := db.Create(&menuData).Error; err != nil {
				log.Fatalf("Failed to seed role '%s': %v", menuData.Name, err)
			}
			log.Printf("Role '%s' seeded successfully.", menuData.Name)

		} else if err != nil {
			log.Fatalf("Error checking for role '%s': %v", menuData.Name, err)
		} else {
			log.Printf("Role with name '%s' already exists. Seeder skipped.", menuData.Name)
		}
	}
}

func SeedSubmenus(db *gorm.DB) {
	rolesToMenu := []models.Submenu{
		{
			MenuID:    1,
			Name:      "Dashboard",
			Icon:      "GridIcon",
			Url:       "/admin/dashboard",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
		{
			MenuID:    1,
			Name:      "Campaign",
			Icon:      "CalenderIcon",
			Url:       "/admin/campaign",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
		{
			MenuID:    1,
			Name:      "Role Management",
			Icon:      "FaUserCog",
			Url:       "/admin/role-management",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
		{
			MenuID:    1,
			Name:      "Role Management",
			Icon:      "FaUserCog",
			Url:       "/admin/role-management",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
		{
			MenuID:    1,
			Name:      "User Management",
			Icon:      "User",
			Url:       "/admin/user-management",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
		{
			MenuID:    1,
			Name:      "Groups & Members",
			Icon:      "GroupIcon",
			Url:       "/admin/groups-members",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
		{
			MenuID:    1,
			Name:      "Email Templates",
			Icon:      "MailIcon",
			Url:       "/admin/email-templates",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
		{
			MenuID:    1,
			Name:      "Landing Pages",
			Icon:      "TableIcon",
			Url:       "/admin/landing-pages",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
		{
			MenuID:    1,
			Name:      "Sending Profiles",
			Icon:      "UserIcon",
			Url:       "/admin/sending-profiles",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
		{
			MenuID:    2,
			Name:      "Phishing Emails",
			Icon:      "MdOutlineAttachEmail",
			Url:       "/phishing-simulation/phishing-emails",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
		{
			MenuID:    2,
			Name:      "Phishing Websites",
			Icon:      "CgWebsite",
			Url:       "/phishing-simulation/phishing-websites",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
		{
			MenuID:    2,
			Name:      "Training Modules",
			Icon:      "IoIosBookmarks",
			Url:       "/phishing-simulation/training-modules",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
		{
			MenuID:    3,
			Name:      "Account Settings",
			Icon:      "IoSettingsOutline",
			Url:       "/user/account-settings",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
		{
			MenuID:    3,
			Name:      "Subscription & Billing",
			Icon:      "FaMoneyCheckAlt",
			Url:       "/user/subscription-billing",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
		{
			MenuID:    4,
			Name:      "Logging Activity",
			Icon:      "IoFootstepsOutline",
			Url:       "/logging-monitoring/logging-activity",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
		{
			MenuID:    4,
			Name:      "Environtment Check",
			Icon:      "DiEnvato",
			Url:       "/logging-monitoring/environment-check",
			IsActive:  1,
			CreatedAt: time.Now(),
			CreatedBy: 0,
			UpdatedAt: time.Now(),
			UpdatedBy: 0,
		},
	}

	for _, submenuData := range rolesToMenu {
		var existingRole models.Submenu
		err := db.Where("name = ?", submenuData.Name).First(&existingRole).Error

		if err != nil && err == gorm.ErrRecordNotFound {
			log.Printf("Seeding role '%s'...", submenuData.Name)

			// Buat role di database
			if err := db.Create(&submenuData).Error; err != nil {
				log.Fatalf("Failed to seed role '%s': %v", submenuData.Name, err)
			}
			log.Printf("Role '%s' seeded successfully.", submenuData.Name)

		} else if err != nil {
			log.Fatalf("Error checking for role '%s': %v", submenuData.Name, err)
		} else {
			log.Printf("Role with name '%s' already exists. Seeder skipped.", submenuData.Name)
		}
	}
}

func SeedEmailTemplates(db *gorm.DB) {
	emailTemplates := []models.EmailTemplate{
		{
			Name:           "Google Meet Invitation",
			EnvelopeSender: "noreply@yourdomain.com",
			Subject:        "Invitation: General Meeting @ {{.MeetingTime}}",
			Body: `<!DOCTYPE html>
					<html lang="en">
					<head>
						<meta charset="UTF-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<title>Google Calendar Invitation</title>
						<style>
							body {
								font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
								background-color: #f5f5f5;
								margin: 0;
								padding: 20px;
								font-size: 14px;
								line-height: 1.4;
							}

							.container {
								max-width: 600px;
								margin: 0 auto;
								background-color: white;
								padding: 24px;
								border-radius: 8px;
								box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
							}

							.section {
								margin-bottom: 24px;
							}

							.section-title {
								font-weight: 600;
								color: #333;
								margin-bottom: 8px;
								font-size: 14px;
							}

							.when-info {
								color: #666;
								font-size: 13px;
								line-height: 1.5;
							}

							.guest-info {
								margin-bottom: 4px;
							}

							.guest-name {
								color: #333;
								font-weight: 500;
							}

							.guest-role {
								color: #666;
								font-size: 13px;
							}

							.guest-email {
								color: #666;
								font-size: 13px;
							}

							.view-all-link {
								color: #1a73e8;
								text-decoration: none;
								font-size: 13px;
								cursor: pointer;
							}

							.view-all-link:hover {
								text-decoration: underline;
							}

							.reply-section {
								margin-top: 16px;
							}

							.reply-text {
								color: #666;
								font-size: 13px;
								margin-bottom: 12px;
							}

							.reply-buttons {
								display: flex;
								gap: 8px;
								flex-wrap: wrap;
							}

							.reply-button {
								padding: 8px 16px;
								border: 1px solid #dadce0;
								background-color: #f8f9fa;
								color: #3c4043;
								border-radius: 4px;
								font-size: 13px;
								cursor: pointer;
								transition: all 0.2s ease;
							}

							.reply-button:hover {
								background-color: #e8eaed;
								border-color: #c4c7ca;
							}

							.join-button {
								background-color: #1a73e8;
								color: white;
								border: none;
								padding: 12px 24px;
								border-radius: 4px;
								font-size: 14px;
								font-weight: 500;
								cursor: pointer;
								float: right;
								margin-top: -40px;
								transition: background-color 0.2s ease;
							}

							.join-button:hover {
								background-color: #1557b0;
							}

							.meeting-link-section {
								margin-top: 20px;
								clear: both;
							}

							.meeting-link-title {
								color: #666;
								font-size: 13px;
								margin-bottom: 4px;
							}

							.meeting-link {
								color: #666;
								font-size: 13px;
							}

							.footer {
								margin-top: 40px;
								padding-top: 20px;
								border-top: 1px solid #e0e0e0;
								font-size: 12px;
								color: #666;
								line-height: 1.5;
							}

							.footer-text {
								margin-bottom: 12px;
							}

							.footer-link {
								color: #1a73e8;
								text-decoration: none;
							}

							.footer-link:hover {
								text-decoration: underline;
							}

							.google-calendar-link {
								color: #1a73e8;
								text-decoration: none;
							}

							.google-calendar-link:hover {
								text-decoration: underline;
							}
						</style>
					</head>
					<body>
						<div class="container">
							<div class="section">
								<div class="section-title">When</div>
								<div class="when-info">Wednesday Jul 9, 2025 · 1pm – 2pm (Western Indonesia Time - Jakarta)</div>
							</div>

							<div class="section">
								<div class="section-title">Guests</div>
								<div class="guest-info">
									<div class="guest-name">Marco Antonio <span class="guest-role">- organizer</span></div>
									<div class="guest-email">marcoantoniomadigaskar90@gmail.com</div>
								</div>
								<a href="#" class="view-all-link">View all guest info</a>
							</div>

							<div class="reply-section">
								<div class="reply-text">Reply for marcoantoniomadigaskar90@gmail.com</div>
								<div class="reply-buttons">
									<button class="reply-button">Yes</button>
									<button class="reply-button">No</button>
									<button class="reply-button">Maybe</button>
									<button class="reply-button">More options</button>
								</div>
							</div>

							<button class="join-button">Join with Google Meet</button>

							<div class="meeting-link-section">
								<div class="meeting-link-title">Meeting link</div>
								<div class="meeting-link">meet.google.com/znd-xjey-isd</div>
							</div>

							<div class="footer">
								<div class="footer-text">
									Invitation from <a href="#" class="google-calendar-link">Google Calendar</a>
								</div>
								<div class="footer-text">
									You are receiving this email because you are subscribed to calendar notifications. To stop receiving these emails, go to <a href="#" class="footer-link">Calendar settings</a>, select this calendar, and change "Other notifications".
								</div>
								<div class="footer-text">
									Forwarding this invitation could allow any recipient to send a response to the organizer, be added to the guest list, invite others regardless of their own invitation status, or modify your RSVP. <a href="#" class="footer-link">Learn more</a>
								</div>
							</div>
						</div>
					</body>
					</html>`,
			TrackerImage: 1,
			CreatedAt:    time.Now(),
			CreatedBy:    0,
		},
		{
			Name:           "LinkedIn Password Reset",
			EnvelopeSender: "security-noreply@linkedin.com",
			Subject:        "LinkedIn Password Reset Request",
			Body: `<!DOCTYPE html>
					<html lang="en">
					<head>
						<meta charset="UTF-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<title>Reset your LinkedIn password</title>
						<style>
							body {
								font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
								line-height: 1.4;
								color: #000000;
								margin: 0;
								padding: 0;
								background-color: #f5f5f5;
							}
							.container {
								max-width: 600px;
								margin: 0 auto;
								padding: 20px;
								background-color: #ffffff;
							}
							.header {
								border-bottom: 1px solid #e6e9ec;
								padding-bottom: 20px;
								margin-bottom: 20px;
							}
							.logo {
								width: 120px;
								height: auto;
							}
							.content {
								padding: 0 20px;
							}
							.title {
								font-size: 24px;
								font-weight: 600;
								color: #000000;
								margin-bottom: 24px;
							}
							.body-text {
								font-size: 16px;
								margin-bottom: 24px;
								color: #666666;
							}
							.button-container {
								margin: 30px 0;
								text-align: center;
							}
							.button {
								display: inline-block;
								background-color: #0a66c2;
								color: #ffffff;
								text-decoration: none;
								font-weight: 600;
								font-size: 16px;
								padding: 12px 24px;
								border-radius: 28px;
							}
							.footer {
								border-top: 1px solid #e6e9ec;
								padding-top: 20px;
								margin-top: 20px;
								text-align: center;
								font-size: 12px;
								color: #666666;
							}
							.security-notice {
								background-color: #f3f6f8;
								padding: 16px;
								border-radius: 4px;
								margin: 24px 0;
								font-size: 14px;
							}
							.security-title {
								font-weight: 600;
								margin-bottom: 8px;
							}
							.unsubscribe {
								margin-top: 24px;
								font-size: 12px;
								color: #666666;
							}
							.info-item {
								margin-bottom: 8px;
							}
						</style>
					</head>
					<body>
						<div class="container">
							<div class="header">
								<img src="https://ci3.googleusercontent.com/meips/ADKq_NaZS80lJKKLmNWJbywLi3-jL3P8kFjdgCFzkf0a8q_y3PqMIkP33vZjoMOTXpjrwVWBEkCT00SFqqw25LqKDg26-N7T-ACNc2svYj3RVaPB2cBiRYM=s0-d-e1-ft#https://static.licdn.com/aero-v1/sc/h/9ehe6n39fa07dc5edzv0rla4e" alt="LinkedIn logo in blue with white text" class="logo">
							</div>

							<div class="content">
								<div class="title">Reset your LinkedIn password</div>

								<div class="body-text">Hi [First Name],</div>

								<div class="body-text">We received a request to reset the password for your LinkedIn account associated with [email address].</div>

								<div class="body-text">If you made this request, please click below to reset your password:</div>

								<div class="button-container">
									<a href="[password-reset-link]" class="button">Reset password</a>
								</div>

								<div class="body-text">This link will expire in 24 hours. If you didn't request a password reset, you can ignore this message or let us know. Someone else might have entered your email address by mistake.</div>

								<div class="security-notice">
									<div class="security-title">Security tips:</div>
									<div class="info-item">• Never share your password</div>
									<div class="info-item">• Change your password regularly</div>
									<div class="info-item">• Use a unique password for each account</div>
								</div>

								<div class="body-text">The LinkedIn team</div>
							</div>

							<div class="footer">
								<div>This is a mandatory service email from LinkedIn.</div>
								<div class="info-item">LinkedIn Corporation, 1000 West Maude Avenue, Sunnyvale, CA 94085</div>
								<div class="info-item">LinkedIn and the LinkedIn logo are registered trademarks of LinkedIn Corporation.</div>
								<div class="unsubscribe">
									<a href="#" style="color: #666666; text-decoration: none;">Privacy Policy</a> |
									<a href="#" style="color: #666666; text-decoration: none;">User Agreement</a> |
									<a href="#" style="color: #666666; text-decoration: none;">Cookie Policy</a> |
									<a href="#" style="color: #666666; text-decoration: none;">Copyright Policy</a>
								</div>
							</div>
						</div>
					</body>
					</html>`,
			TrackerImage: 1,
			CreatedAt:    time.Now(),
			CreatedBy:    0,
		},
		{
			Name:           "Netflix Password Reset",
			EnvelopeSender: "info@account.netflix.com",
			Subject:        "Netflix Password Reset Request",
			Body: `<!DOCTYPE html>
					<html lang="en">
					<head>
						<meta charset="UTF-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<title>Reset your Netflix password</title>
						<style>
							body {
								font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
								line-height: 1.4;
								color: #000000;
								margin: 0;
								padding: 0;
								background-color: #f5f5f5;
							}
							.container {
								max-width: 600px;
								margin: 0 auto;
								padding: 20px;
								background-color: #ffffff;
							}
							.header {
								border-bottom: 1px solid #e6e9ec;
								padding-bottom: 20px;
								margin-bottom: 20px;
							}
							.logo {
								width: 120px;
								height: auto;
							}
							.content {
								padding: 0 20px;
							}
							.title {
								font-size: 24px;
								font-weight: 600;
								color: #000000;
								margin-bottom: 24px;
							}
							.body-text {
								font-size: 16px;
								margin-bottom: 24px;
								color: #666666;
							}
							.button-container {
								margin: 30px 0;
								text-align: center;
							}
							.button {
								display: inline-block;
								background-color: #E50914;
								color: #ffffff;
								text-decoration: none;
								font-weight: 600;
								font-size: 16px;
								padding: 12px 24px;
								border-radius: 28px;
							}
							.footer {
								border-top: 1px solid #e6e9ec;
								padding-top: 20px;
								margin-top: 20px;
								text-align: center;
								font-size: 12px;
								color: #666666;
							}
							.security-notice {
								background-color: #f3f6f8;
								padding: 16px;
								border-radius: 4px;
								margin: 24px 0;
								font-size: 14px;
							}
							.security-title {
								font-weight: 600;
								margin-bottom: 8px;
							}
							.unsubscribe {
								margin-top: 24px;
								font-size: 12px;
								color: #666666;
							}
							.info-item {
								margin-bottom: 8px;
							}
						</style>
					</head>
					<body>
						<div class="container">
							<div class="header">
							<img src="https://ci3.googleusercontent.com/meips/ADKq_NanW4CgGwRjEPu6W145C0FAUPkNSUfK2Qk70Sk3Zn2ekP6aADG4-gVTyNoqEz-XDsiJ_6ZWMnkWI3bZTOwiLtj2anEZ2dc=s0-d-e1-ft#https://assets.nflxext.com/us/email/gem/nflx.png" alt="Netflix" width="24" border="0" style="border:none;outline:none;border-collapse:collapse;display:block;border-style:none" class="CToWUd" data-bit="iit">
							</div>

							<div class="content">
								<div class="title">Reset your Netflix password</div>

								<div class="body-text">Hi,</div>

								<div class="body-text">We received a request to reset the password for your Netflix account associated with [email address].</div>

								<div class="body-text">If you made this request, please click below to reset your password:</div>

								<div class="button-container">
									<a href="[password-reset-link]" class="button">Reset password</a>
								</div>

								<div class="body-text">This link will expire in 24 hours. If you didn't request a password reset, you can ignore this message or let us know. Someone else might have entered your email address by mistake.</div>

								<div class="security-notice">
									<div class="security-title">Security tips:</div>
									<div class="info-item">• Never share your password</div>
									<div class="info-item">• Change your password regularly</div>
									<div class="info-item">• Use a unique password for each account</div>
								</div>

								<div class="body-text">The Netflix team</div>
					<img src="https://ci3.googleusercontent.com/meips/ADKq_NanW4CgGwRjEPu6W145C0FAUPkNSUfK2Qk70Sk3Zn2ekP6aADG4-gVTyNoqEz-XDsiJ_6ZWMnkWI3bZTOwiLtj2anEZ2dc=s0-d-e1-ft#https://assets.nflxext.com/us/email/gem/nflx.png" alt="Netflix" width="24" border="0" style="border:none;outline:none;border-collapse:collapse;display:block;border-style:none" class="CToWUd" data-bit="iit">
							</div>

							<div class="footer">
								<div>You received this email because a password reset was requested for your Netflix account.</div>
								<div class="info-item">Netflix, Inc., 100 Winchester Circle, Los Gatos, CA 95032</div>
								<div class="info-item">Netflix and the Netflix logo are registered trademarks of Netflix, Inc.</div>
								<div class="unsubscribe">
									<a href="#" style="color: #666666; text-decoration: none;">Privacy Policy</a> |
									<a href="#" style="color: #666666; text-decoration: none;">User Agreement</a> |
									<a href="#" style="color: #666666; text-decoration: none;">Cookie Policy</a> |
									<a href="#" style="color: #666666; text-decoration: none;">Copyright Policy</a>
								</div>
							</div>
						</div>
					</body>
					</html>`,
			TrackerImage: 1,
			CreatedAt:    time.Now(),
			CreatedBy:    0,
		},
		{
			Name:           "Zoom Meeting Invitation",
			EnvelopeSender: "support@zoom.com",
			Subject:        "Zoom Meeting Invitation",
			Body: `<!DOCTYPE html>
						<html lang="en">
						<head>
							<meta charset="UTF-8">
							<meta name="viewport" content="width=device-width, initial-scale=1.0">
							<title>Zoom Meeting Invitation</title>
							<style>
								body {
									font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
									line-height: 1.4;
									color: #000000;
									margin: 0;
									padding: 0;
									background-color: #f5f5f5;
								}
								.container {
									max-width: 600px;
									margin: 0 auto;
									padding: 20px;
									background-color: #ffffff;
								}
								.header {
									border-bottom: 1px solid #e6e9ec;
									padding-bottom: 20px;
									margin-bottom: 20px;
								}
								.logo {
									width: 120px;
									height: auto;
								}
								.content {
									padding: 0 20px;
								}
								.title {
									font-size: 24px;
									font-weight: 600;
									color: #000000;
									margin-bottom: 24px;
								}
								.body-text {
									font-size: 16px;
									margin-bottom: 24px;
									color: #666666;
								}
								.button-container {
									margin: 30px 0;
									text-align: center;
								}
								.button {
									display: inline-block;
									background-color: #2D8CFF;
									color: #ffffff;
									text-decoration: none;
									font-weight: 600;
									font-size: 16px;
									padding: 12px 24px;
									border-radius: 28px;
								}
								.footer {
									border-top: 1px solid #e6e9ec;
									padding-top: 20px;
									margin-top: 20px;
									text-align: center;
									font-size: 12px;
									color: #666666;
								}
								.security-notice {
									background-color: #f3f6f8;
									padding: 16px;
									border-radius: 4px;
									margin: 24px 0;
									font-size: 14px;
								}
								.security-title {
									font-weight: 600;
									margin-bottom: 8px;
								}
								.unsubscribe {
									margin-top: 24px;
									font-size: 12px;
									color: #666666;
								}
								.info-item {
									margin-bottom: 8px;
								}
							</style>
						</head>
						<body>
							<div class="container">
								<div class="header">
									<img src="https://st1.zoom.us/fe-static/fe-signup-login-active/img/ZoomNewLogo.b2fd5c95.png" alt="Zoom logo in blue with white text" class="logo">
								</div>

								<div class="content">
									<div class="title">You're invited to a Zoom Meeting</div>

									<div class="body-text">Hi [Recipient],</div>

									<div class="body-text">[Host Name] has invited you to a Zoom meeting.</div>

									<div class="body-text"><strong>Topic:</strong> [Meeting Topic]</div>
									<div class="body-text"><strong>Time:</strong> [Date and Time]</div>

									<div class="button-container">
										<a href="[Zoom Join Link]" class="button">Join Meeting</a>
									</div>

									<div class="body-text">Meeting ID: [ID]<br>Password: [Password]</div>

									<div class="security-notice">
										<div class="security-title">Security tips:</div>
										<div class="info-item">• Never share your password</div>
										<div class="info-item">• Change your password regularly</div>
										<div class="info-item">• Use a unique password for each account</div>
									</div>

									<div class="body-text">Zoom Team</div>
								</div>

								<div class="footer">
									<div>This invitation was sent by [Host Email] via Zoom.</div>
									<div class="info-item">Zoom Video Communications, Inc., 55 Almaden Blvd, Suite 600, San Jose, CA 95113</div>
									<div class="info-item">Zoom and the Zoom logo are registered trademarks of Zoom Video Communications, Inc.</div>
									<div class="unsubscribe">
										<a href="#" style="color: #666666; text-decoration: none;">Privacy Policy</a> |
										<a href="#" style="color: #666666; text-decoration: none;">User Agreement</a> |
										<a href="#" style="color: #666666; text-decoration: none;">Cookie Policy</a> |
										<a href="#" style="color: #666666; text-decoration: none;">Copyright Policy</a>
									</div>
								</div>
							</div>
						</body>
						</html>`,
			TrackerImage: 1,
			CreatedAt:    time.Now(),
			CreatedBy:    0,
		},
		{
			Name:           "Trello Invitation",
			EnvelopeSender: "support@trello.com",
			Subject:        "Trello Invitation",
			Body: `<!DOCTYPE html>
					<html lang="en">
					<head>
						<meta charset="UTF-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<title>Invitation Email</title>
						<style>
							body {
								font-family: Arial, sans-serif;
								background-color: #f6f6f6;
								margin: 0;
								padding: 20px;
							}
							.container {
								background-color: #ffffff;
								border-radius: 8px;
								max-width: 600px;
								margin: auto;
								padding: 20px;
								box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
							}
							.header {
								background-color: #0079bf;
								padding: 10px;
								color: #ffffff;
								text-align: center;
								border-top-left-radius: 8px;
								border-top-right-radius: 8px;
							}
							.message {
								margin: 20px 0;
								line-height: 1.6;
							}
							.button {
								display: block;
								width: 150px;
								margin: 20px auto;
								padding: 10px;
								background-color: #5aac44;
								color: #ffffff;
								text-align: center;
								text-decoration: none;
								border-radius: 5px;
								font-weight: bold;
							}
							.footer {
								text-align: center;
								color: #777777;
								margin-top: 20px;
							}
							.footer a {
								color: #0079bf;
								text-decoration: none;
							}
						</style>
					</head>
					<body>

						<div class="container">
							<div class="header">
								Trello
							</div>
							<p class="message">
								Hey there! Sarah Jonas from Design team has invited you to their team on Trello.
								<br><br>
								"I'd like to invite you to join Design team on Trello. We use Trello to organize tasks, projects, due dates, and much more."
							</p>
							<a href="#" class="button">Join the Team</a>
							<p class="footer">
								Trello boards help you put your plans into action and achieve your goals.
								<a href="#">Learn more</a>
								<br>
								<a href="#">Unsubscribe from these emails</a>
							</p>
						</div>

					</body>
					</html>`,
			TrackerImage: 1,
			CreatedAt:    time.Now(),
			CreatedBy:    0,
		},
	}

	for _, emailTemplateData := range emailTemplates {
		var existingEmailTemplate models.EmailTemplate
		err := db.Where("name = ?", emailTemplateData.Name).First(&existingEmailTemplate).Error

		if err != nil && err == gorm.ErrRecordNotFound {
			log.Printf("Seeding email template '%s'...", emailTemplateData.Name)

			// Buat email template di database
			if err := db.Create(&emailTemplateData).Error; err != nil {
				log.Fatalf("Failed to seed email template '%s': %v", emailTemplateData.Name, err)
			}
			log.Printf("Email template '%s' seeded successfully.", emailTemplateData.Name)

		} else if err != nil {
			log.Fatalf("Error checking for email template '%s': %v", emailTemplateData.Name, err)
		} else {
			log.Printf("Email template with name '%s' already exists. Seeder skipped.", emailTemplateData.Name)
		}
	}
}

func SeedLandingPages(db *gorm.DB) {
	landingPages := []models.LandingPage{
		{
			Name: "Linkedin Password Reset",
			Body: `<!DOCTYPE html>
							<html lang="id-ID" class="artdeco ">
							<head>

								<meta http-equiv="X-UA-Compatible" content="IE=EDGE">
								<meta charset="UTF-8">
								<meta name="viewport" content="width=device-width, initial-scale=1">
								<meta name="asset-url" id="artdeco/static/images/icons.svg" content="https://static.licdn.com/sc/h/6bja66gymvrvqrp5m6btz3vkz">
								<title>
								Login LinkedIn, Login | LinkedIn
								</title>
								<link rel="shortcut icon" href="https://static.licdn.com/sc/h/9lb1g1kp916tat669q9r5g2kz">
								<link rel="apple-touch-icon" href="https://static.licdn.com/sc/h/1exdo4axa6eaw1jioxh1vu4fj">
								<link rel="apple-touch-icon-precomposed" href="https://static.licdn.com/sc/h/55ggxxse8uyjdh2x78ht3j40q">
								<link rel="apple-touch-icon-precomposed" sizes="57x57" href="https://static.licdn.com/sc/h/1exdo4axa6eaw1jioxh1vu4fj">
								<link rel="apple-touch-icon-precomposed" sizes="144x144" href="https://static.licdn.com/sc/h/55ggxxse8uyjdh2x78ht3j40q">
								<meta name="treeID" content="AAY4YTA8k+b+ortHQvoVlw==">
								<meta name="pageKey" content="d_checkpoint_lg_consumerLogin">
								<meta name="pageInstance" content="urn:li:page:checkpoint_lg_login_default;3x7Kza0aSXWLxLqUx0Ug3Q==">
								<meta id="heartbeat_config" data-enable-page-view-heartbeat-tracking>
								<meta name="appName" content="checkpoint-frontend">
						<!----><!---->

								<meta name="description" content="Login ke LinkedIn untuk menjalin relasi dengan orang yang Anda kenal, bertukar ide, dan membina karier Anda.">
								<meta name="robots" content="noarchive">
								<meta property="og:site_name" content="LinkedIn">
								<meta property="og:title" content="Login LinkedIn, Login | LinkedIn">
								<meta property="og:description" content="Login ke LinkedIn untuk menjalin relasi dengan orang yang Anda kenal, bertukar ide, dan membina karier Anda.">
								<meta property="og:type" content="website">
								<meta property="og:url" content="https://www.linkedin.com">
								<meta property="og:image" content="https://static.licdn.com/scds/common/u/images/logos/favicons/v1/favicon.ico">
								<meta name="twitter:card" content="summary">
								<meta name="twitter:site" content="@linkedin">
								<meta name="twitter:title" content="Login LinkedIn, Login | LinkedIn">
								<meta name="twitter:description" content="Login ke LinkedIn untuk menjalin relasi dengan orang yang Anda kenal, bertukar ide, dan membina karier Anda.">

								<meta property="al:android:url" content="https://www.linkedin.com/login/id">
								<meta property="al:android:package" content="com.linkedin.android">
								<meta property="al:android:app_name" content="LinkedIn">
								<meta property="al:ios:app_store_id" content="288429040">
								<meta property="al:ios:app_name" content="LinkedIn">

								<link rel="stylesheet" href="https://static.licdn.com/sc/h/aqyadolt0wu7chazdqaa989fi">

							<link rel="canonical" href="https://www.linkedin.com/login/id">

							<link rel="alternate" hreflang="ar" href="https://www.linkedin.com/login/ar">
							<link rel="alternate" hreflang="cs" href="https://www.linkedin.com/login/cs">
							<link rel="alternate" hreflang="da" href="https://www.linkedin.com/login/da">
							<link rel="alternate" hreflang="de" href="https://www.linkedin.com/login/de">
							<link rel="alternate" hreflang="en" href="https://www.linkedin.com/login">
							<link rel="alternate" hreflang="es" href="https://www.linkedin.com/login/es">
							<link rel="alternate" hreflang="fr" href="https://www.linkedin.com/login/fr">
							<link rel="alternate" hreflang="hi" href="https://www.linkedin.com/login/hi">
							<link rel="alternate" hreflang="id" href="https://www.linkedin.com/login/id">
							<link rel="alternate" hreflang="it" href="https://www.linkedin.com/login/it">
							<link rel="alternate" hreflang="ja" href="https://www.linkedin.com/login/ja">
							<link rel="alternate" hreflang="ko" href="https://www.linkedin.com/login/ko">
							<link rel="alternate" hreflang="ms" href="https://www.linkedin.com/login/ms">
							<link rel="alternate" hreflang="nl" href="https://www.linkedin.com/login/nl">
							<link rel="alternate" hreflang="no" href="https://www.linkedin.com/login/no">
							<link rel="alternate" hreflang="pl" href="https://www.linkedin.com/login/pl">
							<link rel="alternate" hreflang="pt" href="https://www.linkedin.com/login/pt">
							<link rel="alternate" hreflang="ro" href="https://www.linkedin.com/login/ro">
							<link rel="alternate" hreflang="ru" href="https://www.linkedin.com/login/ru">
							<link rel="alternate" hreflang="sv" href="https://www.linkedin.com/login/sv">
							<link rel="alternate" hreflang="th" href="https://www.linkedin.com/login/th">
							<link rel="alternate" hreflang="tl" href="https://www.linkedin.com/login/tl">
							<link rel="alternate" hreflang="tr" href="https://www.linkedin.com/login/tr">
							<link rel="alternate" hreflang="zh" href="https://www.linkedin.com/login/zh">
							<link rel="alternate" hreflang="zh-cn" href="https://www.linkedin.com/login/zh">
							<link rel="alternate" hreflang="zh-tw" href="https://www.linkedin.com/login/zh-tw">
							<link rel="alternate" hreflang="x-default" href="https://www.linkedin.com/login">

								<link rel="preload" href="https://static.licdn.com/sc/h/ax9fa8qn7acaw8v5zs7uo0oba">
								<link rel="preload" href="https://static.licdn.com/sc/h/2nrnip1h2vmblu8dissh3ni93">
								<link rel="preload" href="https://static.licdn.com/sc/h/ce1b60o9xz87bra38gauijdx4">
								<link rel="preload" href="https://static.licdn.com/sc/h/zf50zdwg8datnmpgmdbkdc4r">

								<link rel="preload" href="https://static.licdn.com/sc/h/dj0ev57o38hav3gip4fdd172h">
								<link rel="preload" href="https://static.licdn.com/sc/h/3tcbd8fu71yh12nuw2hgnoxzf">

							</head>
							<body class="system-fonts ">

							<div id="app__container" class="glimmer">
							<header>

							<a class="linkedin-logo" href="/" aria-label="LinkedIn">

								<li-icon aria-label="LinkedIn" size="28dp" alt="LinkedIn" color="brand" type="linkedin-logo">
									<svg width="102" height="26" viewbox="0 0 102 26" fill="none" xmlns="http://www.w3.org/2000/svg" id="linkedin-logo" preserveaspectratio="xMinYMin meet" focusable="false">
										<path d="M13 10H17V22H13V10ZM15 3.8C14.5671 3.80984 14.1468 3.94718 13.7917 4.19483C13.4365 4.44247 13.1623 4.7894 13.0035 5.19217C12.8446 5.59493 12.8081 6.03562 12.8985 6.45903C12.989 6.88244 13.2024 7.26975 13.5119 7.57245C13.8215 7.87514 14.2135 8.07976 14.6389 8.16067C15.0642 8.24159 15.504 8.1952 15.903 8.02732C16.3021 7.85943 16.6428 7.57752 16.8824 7.2169C17.122 6.85627 17.2499 6.43297 17.25 6C17.2515 5.70645 17.1939 5.4156 17.0807 5.14474C16.9675 4.87388 16.801 4.62854 16.5911 4.42331C16.3812 4.21808 16.1322 4.05714 15.8589 3.95006C15.5855 3.84299 15.2934 3.79195 15 3.8ZM4 4H0V22H11V18H4V4ZM57.9 16.2C57.9 16.61 57.9 16.86 57.9 17H48.9C48.9021 17.169 48.9256 17.337 48.97 17.5C49.1765 18.0933 49.5745 18.6011 50.1014 18.9433C50.6282 19.2855 51.254 19.4427 51.88 19.39C52.4142 19.4129 52.9468 19.3171 53.4396 19.1096C53.9324 18.9021 54.3731 18.5881 54.73 18.19L57.45 19.87C56.7533 20.6812 55.88 21.322 54.8971 21.7433C53.9142 22.1645 52.8479 22.3549 51.78 22.3C48.19 22.3 45.12 20.25 45.12 16.11C45.091 15.2506 45.2411 14.3946 45.5608 13.5963C45.8804 12.798 46.3626 12.075 46.9767 11.4731C47.5908 10.8712 48.3234 10.4037 49.128 10.1001C49.9325 9.7966 50.7914 9.66374 51.65 9.71C55.08 9.71 57.9 12 57.9 16.2ZM54.15 14.69C54.16 14.3669 54.0997 14.0455 53.9731 13.748C53.8466 13.4506 53.6569 13.1842 53.4172 12.9673C53.1775 12.7504 52.8935 12.5883 52.5849 12.492C52.2763 12.3958 51.9505 12.3678 51.63 12.41C50.9638 12.3515 50.3013 12.558 49.7865 12.9849C49.2716 13.4118 48.9459 14.0245 48.88 14.69H54.15ZM68 4H72V22H68.61V20.57C68.1486 21.1444 67.5541 21.5977 66.878 21.8904C66.2019 22.1832 65.4646 22.3066 64.73 22.25C62.22 22.25 59.18 20.39 59.18 16C59.18 12.08 61.87 9.75 64.68 9.75C65.299 9.72159 65.9167 9.82856 66.4902 10.0634C67.0636 10.2983 67.5788 10.6555 68 11.11V4ZM68.3 16C68.3 14.12 67.13 12.87 65.64 12.87C65.2366 12.8697 64.8373 12.9508 64.466 13.1084C64.0946 13.266 63.7589 13.4969 63.4788 13.7872C63.1988 14.0775 62.9801 14.4214 62.836 14.7981C62.6919 15.1749 62.6252 15.5769 62.64 15.98C62.6279 16.3815 62.6966 16.7813 62.842 17.1557C62.9874 17.5301 63.2064 17.8716 63.4862 18.1597C63.766 18.4479 64.1008 18.677 64.4708 18.8333C64.8407 18.9897 65.2383 19.0702 65.64 19.07C66.0201 19.0542 66.393 18.9609 66.7357 18.7957C67.0785 18.6305 67.3838 18.3969 67.6329 18.1094C67.8821 17.8219 68.0698 17.4864 68.1845 17.1236C68.2992 16.7609 68.3385 16.3785 68.3 16ZM45.76 10H41L37.07 14.9H37V4H33V22H37V16.27H37.07L41.07 22H46L41 15.48L45.76 10ZM26.53 9.7C25.7825 9.68818 25.0441 9.8653 24.3833 10.2149C23.7226 10.5645 23.1607 11.0754 22.75 11.7H22.7V10H19V22H23V15.47C22.956 15.1525 22.9801 14.8292 23.0706 14.5216C23.1611 14.2141 23.316 13.9294 23.525 13.6863C23.7341 13.4432 23.9924 13.2474 24.2829 13.1118C24.5734 12.9763 24.8894 12.9041 25.21 12.9C26.31 12.9 27 13.49 27 15.42V22H31V14.56C31 10.91 28.71 9.7 26.53 9.7ZM102 2V24C102 24.5304 101.789 25.0391 101.414 25.4142C101.039 25.7893 100.53 26 100 26H78C77.4696 26 76.9609 25.7893 76.5858 25.4142C76.2107 25.0391 76 24.5304 76 24V2C76 1.46957 76.2107 0.960859 76.5858 0.585786C76.9609 0.210714 77.4696 0 78 0L100 0C100.53 0 101.039 0.210714 101.414 0.585786C101.789 0.960859 102 1.46957 102 2ZM84 10H80V22H84V10ZM84.25 6C84.2599 5.553 84.1365 5.11317 83.8954 4.73664C83.6542 4.36011 83.3064 4.06396 82.8962 3.88597C82.4861 3.70798 82.0322 3.65622 81.5925 3.73731C81.1528 3.8184 80.7472 4.02865 80.4275 4.34124C80.1079 4.65382 79.8885 5.05456 79.7976 5.49233C79.7066 5.9301 79.7482 6.38503 79.9169 6.79909C80.0856 7.21314 80.3739 7.56754 80.7449 7.81706C81.1159 8.06657 81.5529 8.19989 82 8.2C82.2934 8.20805 82.5855 8.15701 82.8588 8.04994C83.1322 7.94286 83.3812 7.78192 83.5911 7.57669C83.801 7.37146 83.9675 7.12612 84.0807 6.85526C84.1939 6.5844 84.2514 6.29355 84.25 6ZM98 14.56C98 10.91 95.71 9.66 93.53 9.66C92.7782 9.65542 92.0375 9.84096 91.3766 10.1994C90.7158 10.5578 90.1562 11.0774 89.75 11.71V10H86V22H90V15.47C89.956 15.1525 89.9801 14.8292 90.0706 14.5216C90.1611 14.2141 90.316 13.9294 90.525 13.6863C90.7341 13.4432 90.9924 13.2474 91.2829 13.1118C91.5734 12.9763 91.8894 12.9041 92.21 12.9C93.31 12.9 94 13.49 94 15.42V22H98V14.56Z" fill="#0A66C2"></path>
									</svg>
								</li-icon>

							</a>

							</header>

							<main class="app__content" role="main">

						<!----><!---->

							<form method="post" id="otp-generation" class="hidden__imp">

							<input name="csrfToken" value="ajax:7801759608768218721" type="hidden">

							<input name="resendUrl" id="input-resend-otp-url" type="hidden">
							<input name="midToken" type="hidden">
							<input name="session_redirect" type="hidden">
							<input name="parentPageKey" value="d_checkpoint_lg_consumerLogin" type="hidden">
							<input name="pageInstance" value="urn:li:page:checkpoint_lg_login_default;3x7Kza0aSXWLxLqUx0Ug3Q==" type="hidden">
							<input name="controlId" value="d_checkpoint_lg_consumerLogin-SignInUsingOneTimeSignInLink" type="hidden">
							<input name="session_redirect" type="hidden">
							<input name="trk" type="hidden">
							<input name="authUUID" type="hidden">
							<input name="encrypted_session_key" type="hidden">
						<!---->    </form>
							<code id="i18nOtpSuccessMessage" style="display: none"><!--"Kami telah mengirimkan link sekali pakai ke alamat email Anda. Tidak menemukannya? Periksa folder spam Anda."--></code>
							<code id="i18nOtpErrorMessage" style="display: none"><!--"Terjadi kesalahan. Coba lagi."--></code>
							<code id="i18nOtpRestrictedMessage" style="display: none"><!--"Untuk keamanan akun, sebaiknya hubungi kami agar Anda dapat login dengan kata sandi sekali pakai dari <a href="/help/linkedin/ask/MPRRF">Pusat Bantuan LinkedIn.</a>"--></code>
						<!----><!---->

							<div data-litms-pageview="true"></div>

								<div class="card-layout">
								<div id="organic-div">

							<div class="header__content ">
							<h1 class="header__content__heading ">
								Password Reset
							</h1>
							<p class="header__content__subheading ">
						<!---->          </p>
						</div>

									<div class="alternate-signin-container">

						<!---->

						<!---->      <div class="alternate-signin__btn--google invisible__imp  margin-top-12"></div>

						<!---->

							<div class="microsoft-auth-button w-full">
						<!---->      <div class="microsoft-auth-button__placeholder" data-text="signin_with"></div>
							</div>

						<!---->

							<button class="sign-in-with-apple-button hidden__imp" aria-label="Login dengan Apple" type="button">

								<svg width="24" height="24" viewbox="0 2 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<rect width="24" height="24" fill="transparent"></rect>
									<path d="M17.569 12.6254C17.597 15.652 20.2179 16.6592 20.247 16.672C20.2248 16.743 19.8282 18.1073 18.8662 19.5166C18.0345 20.735 17.1714 21.9488 15.8117 21.974C14.4756 21.9986 14.046 21.1799 12.5185 21.1799C10.9915 21.1799 10.5142 21.9489 9.2495 21.9987C7.93704 22.0485 6.93758 20.6812 6.09906 19.4673C4.38557 16.9842 3.0761 12.4508 4.83438 9.39061C5.70786 7.87092 7.26882 6.90859 8.96311 6.88391C10.2519 6.85927 11.4683 7.753 12.2562 7.753C13.0436 7.753 14.5219 6.67821 16.0759 6.83605C16.7265 6.8632 18.5527 7.09947 19.7253 8.81993C19.6309 8.87864 17.5463 10.095 17.569 12.6254ZM15.058 5.1933C15.7548 4.34789 16.2238 3.171 16.0959 2C15.0915 2.04046 13.877 2.67085 13.1566 3.5158C12.5109 4.26404 11.9455 5.46164 12.0981 6.60946C13.2176 6.69628 14.3612 6.03925 15.058 5.1933Z" fill="black"></path>
								</svg>

							<span class="sign-in-with-apple-button__text">
								Login dengan Apple
							</span>
							</button>
							<code id="appleSignInLibScriptPath" style="display: none"><!--"https://static.licdn.com/sc/h/1gpe377m8n1eq73qveizv5onv"--></code>
							<code id="i18nErrorAppleSignInGeneralErrorMessage" style="display: none"><!--"Terjadi kesalahan. Coba gunakan nama pengguna dan kata sandi."--></code>
							<code id="lix_checkpoint_auth_nexus_apple_flow" style="display: none"><!--true--></code>

						<!---->
						<!----><!----><!---->
						<!---->
						<!---->

							<a aria-label="Login dengan kunci sandi" class="alternate-signin__btn margin-top-12" role="button" id="sign-in-with-passkey-btn" style="display:none">
							<span class="btn-text">
								Login dengan kunci sandi
							</span>
							</a>

						<!---->
							<form class="microsoft-auth" action="/uas/login-submit" method="post" onlyshowonwindows>
							<input name="loginCsrfParam" value="e91fb616-884d-4835-80f4-e6a688f421ee" type="hidden">

						<!---->
							<input name="trk" value="d_checkpoint_lg_consumerLogin_microsoft-auth-submit" type="hidden">

							<div class="loader loader--full-screen">
							<div class="loader__container mb-2 overflow-hidden">
								<icon class="loader__icon inline-block loader__icon--default text-color-progress-loading" data-delayed-url="https://static.licdn.com/sc/h/bzquwuxc79kqghdtn2kktfn5c" data-svg-class-name="loader__icon-svg--large fill-currentColor h-[60px] min-h-[60px] w-[60px] min-w-[60px]"></icon>
							</div>
							</div>

							</form>

							<script data-delayed-url="https://static.licdn.com/sc/h/7kewwbk0p2dthzs10jar2ce0z" data-module-id="microsoft-auth-lib"></script>
							<code id="isMicrosoftTermsAndConditionsSkipEnabled" style="display: none"><!--false--></code>
							<code id="microsoftAuthLibraryPath" style="display: none"><!--"https://static.licdn.com/sc/h/7kewwbk0p2dthzs10jar2ce0z"--></code>
							<code id="microsoftShowOneTap" style="display: none"><!--false--></code>
							<code id="microsoftLocale" style="display: none"><!--"in_ID"--></code>

						<!---->

							<div id="or-separator" class="or-separator margin-top-24 snapple-seperator hidden__imp">
							<span class="or-text">atau</span>
							</div>

							<code id="googleGSILibPath" style="display: none"><!--"https://static.licdn.com/sc/h/aofke6z5sqc44bjlvj6yr05c8"--></code>
							<code id="useGoogleGSILibraryTreatment" style="display: none"><!--"middle"--></code>
							<code id="usePasskeyLogin" style="display: none"><!--"support"--></code>

									</div>

							<form method="post" class="login__form" action="/checkpoint/lg/login-submit" novalidate>

							<input name="csrfToken" value="ajax:7801759608768218721" type="hidden">

							<code id="login_form_validation_error_username" style="display: none"><!--"Masukkan nama pengguna yang valid."--></code>
							<code id="consumer_login__text_plain__large_username" style="display: none"><!--"Email atau nomor telepon harus terdiri dari 3 hingga 128 karakter."--></code>
							<code id="consumer_login__text_plain__no_username" style="display: none"><!--"Masukkan alamat email atau nomor telepon."--></code>

							<code id="domainSuggestion" style="display: none"><!--false--></code>

						<!---->        <input name="ac" value="0" type="hidden">
								<input name="loginFailureCount" value="0" type="hidden">
							<input name="sIdString" value="7c17a5ed-80db-4721-bc47-25b9fea9aa5e" type="hidden">

							<input id="pkSupported" name="pkSupported" value="false" type="hidden">

							<input name="parentPageKey" value="d_checkpoint_lg_consumerLogin" type="hidden">
							<input name="pageInstance" value="urn:li:page:checkpoint_lg_login_default;3x7Kza0aSXWLxLqUx0Ug3Q==" type="hidden">
							<input name="trk" type="hidden">
							<input name="authUUID" type="hidden">
							<input name="session_redirect" type="hidden">
							<input name="loginCsrfParam" value="e91fb616-884d-4835-80f4-e6a688f421ee" type="hidden">
							<input name="fp_data" value="default" id="fp_data_login" type="hidden">
							<input name="apfc" value="{}" id="apfc-login" type="hidden">

							<input name="_d" value="d" type="hidden">
						<!----><!---->        <input name="showGoogleOneTapLogin" value="true" type="hidden">
								<input name="showAppleLogin" value="true" type="hidden">
								<input name="showMicrosoftLogin" value="true" type="hidden">
								<code id="i18nShow" style="display: none"><!--"Tampilkan"--></code>
								<code id="i18nHide" style="display: none"><!--"Sembunyikan"--></code>
								<input name="controlId" value="d_checkpoint_lg_consumerLogin-login_submit_button" type="hidden">

							<code id="consumer_login__text_plain__empty_password" style="display: none"><!--"Masukkan kata sandi."--></code>
							<code id="consumer_login__text_plain__small_password" style="display: none"><!--"Kata sandi yang Anda masukkan harus terdiri dari minimum 6 karakter."--></code>
							<code id="consumer_login__text_plain__large_password" style="display: none"><!--"Kata sandi yang Anda masukkan harus terdiri dari maksimum 400 karakter."--></code>
							<code id="consumer_login__text_plain__wrong_password" style="display: none"><!--"Kata sandi yang Anda masukkan salah. Silakan coba lagi"--></code>
							<code id="consumer_login__text_plain__large_password_200_chars" style="display: none"><!--"Kata sandi yang Anda masukkan harus terdiri dari maksimum 200 karakter."--></code>

							<div class="form__input--floating margin-top-24">
						<!---->      <input id="password" aria-describedby="error-for-password" name="session_password" required validation="password" autocomplete="current-password" aria-label="Kata sandi" type="password">
								<label for="password" class="form__label--floating" aria-hidden="true">
									Kata sandi Lama
								</label>
							<span id="password-visibility-toggle" class="button__password-visibility" role="button" tabindex="0">
								Tampilkan
							</span>
							<div error-for="password" id="error-for-password" class="form__label--error  hidden__imp" role="alert" aria-live="assertive">
						<!---->      </div>
							</div>

							<div class="form__input--floating margin-top-24">
						<!---->      <input id="password" aria-describedby="error-for-password" name="session_password" required validation="password" autocomplete="current-password" aria-label="Kata sandi" type="password">
								<label for="password" class="form__label--floating" aria-hidden="true">
									Kata sandi Baru
								</label>
							<span id="password-visibility-toggle" class="button__password-visibility" role="button" tabindex="0">
								Tampilkan
							</span>
							<div error-for="password" id="error-for-password" class="form__label--error  hidden__imp" role="alert" aria-live="assertive">
						<!---->      </div>
							</div>

							<div class="form__input--floating margin-top-24">
						<!---->      <input id="password" aria-describedby="error-for-password" name="session_password" required validation="password" autocomplete="current-password" aria-label="Kata sandi" type="password">
								<label for="password" class="form__label--floating" aria-hidden="true">
								Confirm Kata sandi
								</label>
							<span id="password-visibility-toggle" class="button__password-visibility" role="button" tabindex="0">
								Tampilkan
							</span>
							<div error-for="password" id="error-for-password" class="form__label--error  hidden__imp" role="alert" aria-live="assertive">
						<!---->      </div>
							</div>

						<!---->
								<div class="login__form_action_container ">
						<!---->          <button class="btn__primary--large from__button--floating" data-litms-control-urn="login-submit" aria-label="Login" type="submit">
									Reset Password
								</button>
								</div>

							</form>
							<script src="https://static.licdn.com/sc/h/b4wm5m9prmznzyqy5g7fxos4u" defer></script>
							<code id="lix_checkpoint_reset_password_username_autofill" style="display: none"><!--true--></code>

						<!---->          </div>
								<div id="otp-div" class="hidden__imp">

							<div class="otp-success-container">
								<h2 class="otp__header__content">
									Kami telah mengirimkan link sekali pakai ke alamat email utama Anda
								</h2>
								<p class="medium_text subheader__content">Klik link untuk login langsung ke akun LinkedIn Anda.</p>
								<div class="mailbox__logo" aria-hidden="true">

								<svg width="64" height="64" viewbox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M1 11H63V54H1V11Z" fill="#95ABC1"></path>
									<path d="M1 54L23.1 33.2C24.3 32.1 25.8 31.5 27.5 31.5H36.6C38.2 31.5 39.8 32.1 41 33.2L63 54H1Z" fill="#B4C6D8"></path>
									<path d="M63 11L36.5 36.8C34 39.2 29.9 39.2 27.4 36.8L1 11H63Z" fill="#D1DDE9"></path>
								</svg>

								</div>
								<p class="medium_text footer__content">Jika Anda tidak menemukan email tersebut di kotak pesan, periksa folder spam.</p>
								<button class="resend-button margin-top-12" id="btn-resend-otp" aria-label="Kirim ulang email" type="button">
								Kirim ulang email
								</button>
								<button class="otp-back-button" id="otp-cancel-button" aria-label="Kembali">
								Kembali
								</button>
							</div>
						<!---->
								</div>
								</div>
								<div class="join-now">

							Baru mengenal LinkedIn? <a href="/signup/cold-join" class="btn__tertiary--medium" id="join_now" data-litms-control-urn="login_join_now" data-cie-control-urn="join-now-btn">Bergabung sekarang</a>

								</div>
								<div id="checkpointGoogleOneTapContainerId" class="googleOneTapContainer global-alert-offset">

								</div>

							</main>

						<!---->    <footer class="footer__base" role="contentinfo">
								<div class="footer__base__wrapper">
								<p class="copyright">

									<li-icon size="14dp" alt="LinkedIn" aria-hidden="true" type="linkedin-logo"><svg preserveaspectratio="xMinYMin meet" focusable="false">
											<g class="scaling-icon" style="fill-opacity: 1">
												<defs>
												</defs>
												<g class="logo-14dp">
													<g class="dpi-1">
														<g class="inbug" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
															<path d="M14,1.25 L14,12.75 C14,13.44 13.44,14 12.75,14 L1.25,14 C0.56,14 0,13.44 0,12.75 L0,1.25 C0,0.56 0.56,0 1.25,0 L12.75,0 C13.44,0 14,0.56 14,1.25" class="bug-text-color" fill="#FFFFFF" transform="translate(42.000000, 0.000000)">
															</path>
															<path d="M56,1.25 L56,12.75 C56,13.44 55.44,14 54.75,14 L43.25,14 C42.56,14 42,13.44 42,12.75 L42,1.25 C42,0.56 42.56,0 43.25,0 L54.75,0 C55.44,0 56,0.56 56,1.25 Z M47,5 L48.85,5 L48.85,6.016 L48.893,6.016 C49.259,5.541 50.018,4.938 51.25,4.938 C53.125,4.938 54,5.808 54,8 L54,12 L52,12 L52,8.75 C52,7.313 51.672,6.875 50.632,6.875 C49.5,6.875 49,7.75 49,9 L49,12 L47,12 L47,5 Z M44,12 L46,12 L46,5 L44,5 L44,12 Z M46.335,3 C46.335,3.737 45.737,4.335 45,4.335 C44.263,4.335 43.665,3.737 43.665,3 C43.665,2.263 44.263,1.665 45,1.665 C45.737,1.665 46.335,2.263 46.335,3 Z" class="background" fill="#0073B0"></path>
														</g>
														<g class="linkedin-text">
															<path d="M40,12 L38.107,12 L38.107,11.1 L38.077,11.1 C37.847,11.518 37.125,12.062 36.167,12.062 C34.174,12.062 33,10.521 33,8.5 C33,6.479 34.291,4.938 36.2,4.938 C36.971,4.938 37.687,5.332 37.97,5.698 L38,5.698 L38,2 L40,2 L40,12 Z M36.475,6.75 C35.517,6.75 34.875,7.49 34.875,8.5 C34.875,9.51 35.529,10.25 36.475,10.25 C37.422,10.25 38.125,9.609 38.125,8.5 C38.125,7.406 37.433,6.75 36.475,6.75 L36.475,6.75 Z" fill="#000000"></path>
															<path d="M31.7628,10.8217 C31.0968,11.5887 29.9308,12.0627 28.4998,12.0627 C26.3388,12.0627 24.9998,10.6867 24.9998,8.4477 C24.9998,6.3937 26.4328,4.9377 28.6578,4.9377 C30.6758,4.9377 31.9998,6.3497 31.9998,8.6527 C31.9998,8.8457 31.9708,8.9997 31.9708,8.9997 L26.8228,8.9997 L26.8348,9.1487 C26.9538,9.8197 27.6008,10.5797 28.6358,10.5797 C29.6528,10.5797 30.2068,10.1567 30.4718,9.8587 L31.7628,10.8217 Z M30.2268,7.9047 C30.2268,7.0627 29.5848,6.4297 28.6508,6.4297 C27.6058,6.4297 26.9368,7.0597 26.8728,7.9047 L30.2268,7.9047 Z" fill="#000000"></path>
															<polygon fill="#000000" points="18 2 20 2 20 7.882 22.546 5 25 5 21.9 8.199 24.889 12 22.546 12 20 8.515 20 12 18 12">
															</polygon>
															<path d="M10,5 L11.85,5 L11.85,5.906 L11.893,5.906 C12.283,5.434 13.031,4.938 14.14,4.938 C16.266,4.938 17,6.094 17,8.285 L17,12 L15,12 L15,8.73 C15,7.943 14.821,6.75 13.659,6.75 C12.482,6.75 12,7.844 12,8.73 L12,12 L10,12 L10,5 Z" fill="#000000"></path>
															<path d="M7,12 L9,12 L9,5 L7,5 L7,12 Z M8,1.75 C8.659,1.75 9.25,2.341 9.25,3 C9.25,3.659 8.659,4.25 8,4.25 C7.34,4.25 6.75,3.659 6.75,3 C6.75,2.341 7.34,1.75 8,1.75 L8,1.75 Z" fill="#000000"></path>
															<polygon fill="#000000" points="0 2 2 2 2 10 6 10 6 12 0 12"></polygon>
														</g>
													</g>
													<g class="dpi-gt1" transform="scale(0.2917)">
														<g class="inbug" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
															<path d="M44.5235,0 L3.6185,0 C1.6625,0 0.0005,1.547 0.0005,3.454 L0.0005,44.545 C0.0005,46.452 1.6625,48 3.6185,48 L44.5235,48 C46.4825,48 48.0005,46.452 48.0005,44.545 L48.0005,3.454 C48.0005,1.547 46.4825,0 44.5235,0" class="bug-text-color" fill="#FFFFFF" transform="translate(143.000000, 0.000000)">
															</path>
															<path d="M187.5235,0 L146.6185,0 C144.6625,0 143.0005,1.547 143.0005,3.454 L143.0005,44.545 C143.0005,46.452 144.6625,48 146.6185,48 L187.5235,48 C189.4825,48 191.0005,46.452 191.0005,44.545 L191.0005,3.454 C191.0005,1.547 189.4825,0 187.5235,0 Z M162,18 L168.5,18 L168.5,21.266 C169.437,19.388 171.838,17.7 175.445,17.7 C182.359,17.7 184,21.438 184,28.297 L184,41 L177,41 L177,29.859 C177,25.953 176.063,23.75 173.68,23.75 C170.375,23.75 169,26.125 169,29.859 L169,41 L162,41 L162,18 Z M150,41 L157,41 L157,18 L150,18 L150,41 Z M158,10.5 C158,12.985 155.985,15 153.5,15 C151.015,15 149,12.985 149,10.5 C149,8.015 151.015,6 153.5,6 C155.985,6 158,8.015 158,10.5 Z" class="background" fill="#0073B0"></path>
														</g>
														<g class="linkedin-text">
															<path d="M136,41 L130,41 L130,37.5 C128.908,39.162 125.727,41.3 122.5,41.3 C115.668,41.3 111.2,36.975 111.2,30 C111.2,23.594 114.951,17.7 121.5,17.7 C124.441,17.7 127.388,18.272 129,20.5 L129,7 L136,7 L136,41 Z M123.25,23.9 C119.691,23.9 117.9,26.037 117.9,29.5 C117.9,32.964 119.691,35.2 123.25,35.2 C126.81,35.2 129.1,32.964 129.1,29.5 C129.1,26.037 126.81,23.9 123.25,23.9 L123.25,23.9 Z" fill="#000000"></path>
															<path d="M108,37.125 C105.722,40.02 101.156,41.3 96.75,41.3 C89.633,41.3 85.2,36.354 85.2,29 C85.2,21.645 90.5,17.7 97.75,17.7 C103.75,17.7 108.8,21.917 108.8,30 C108.8,31.25 108.6,32 108.6,32 L92,32 L92.111,32.67 C92.51,34.873 94.873,36 97.625,36 C99.949,36 101.689,34.988 102.875,33.375 L108,37.125 Z M101.75,27 C101.797,24.627 99.89,22.7 97.328,22.7 C94.195,22.7 92.189,24.77 92,27 L101.75,27 Z" fill="#000000"></path>
															<polygon fill="#000000" points="63 7 70 7 70 27 78 18 86.75 18 77 28.5 86.375 41 78 41 70 30 70 41 63 41">
															</polygon>
															<path d="M37,18 L43,18 L43,21.375 C43.947,19.572 47.037,17.7 50.5,17.7 C57.713,17.7 59,21.957 59,28.125 L59,41 L52,41 L52,29.625 C52,26.969 52.152,23.8 48.5,23.8 C44.8,23.8 44,26.636 44,29.625 L44,41 L37,41 L37,18 Z" fill="#000000"></path>
															<path d="M29.5,6.125 C31.813,6.125 33.875,8.189 33.875,10.5 C33.875,12.811 31.813,14.875 29.5,14.875 C27.19,14.875 25.125,12.811 25.125,10.5 C25.125,8.189 27.19,6.125 29.5,6.125 L29.5,6.125 Z M26,41 L33,41 L33,18 L26,18 L26,41 Z" fill="#000000"></path>
															<polygon fill="#000000" points="0 7 7 7 7 34 22 34 22 41 0 41"></polygon>
														</g>
													</g>
												</g>
											</g>
										</svg></li-icon>

									<em>
									<span class="a11y__label">
										LinkedIn
									</span>
									© <script>new Date().getFullYear();</script>
									</em>
								</p>
								<div>
									<ul class="footer__base__nav-list" aria-label="Footer Legal Menu">
									<li>
										<a href="/legal/user-agreement?trk=d_checkpoint_lg_consumerLogin_ft_user_agreement">
											Perjanjian Pengguna
										</a>
									</li>
									<li>
										<a href="/legal/privacy-policy?trk=d_checkpoint_lg_consumerLogin_ft_privacy_policy">
										Kebijakan Privasi
										</a>
									</li>
									<li>
										<a href="/help/linkedin/answer/34593?lang=en&amp;trk=d_checkpoint_lg_consumerLogin_ft_community_guidelines">
										Panduan Komunitas
										</a>
									</li>
									<li>
										<a href="/legal/cookie-policy?trk=d_checkpoint_lg_consumerLogin_ft_cookie_policy">
										Kebijakan Cookie
										</a>
									</li>
									<li>
										<a href="/legal/copyright-policy?trk=d_checkpoint_lg_consumerLogin_ft_copyright_policy">
										Kebijakan Hak Cipta
										</a>
									</li>
									<li id="feedback-request">
										<a href="/help/linkedin?trk=d_checkpoint_lg_consumerLogin_ft_send_feedback&amp;lang=en" target="_blank" rel="nofollow noreferrer noopener">
										Kirim Feedback
										</a>
									</li>

							<li>
								<div class="language-selector">
								<button class="language-selector__button" aria-expanded="false">
									<span class="language-selector__label-text">Bahasa</span>
									<i class="language-selector__label-icon">

								<svg viewbox="0 0 16 16" width="16" height="16" preserveaspectratio="xMinYMin meet" xmlns="http://www.w3.org/2000/svg">
									<path d="M8 9l5.93-4L15 6.54l-6.15 4.2a1.5 1.5 0 01-1.69 0L1 6.54 2.07 5z" fill="currentColor"></path>
								</svg>

									</i>
								</button>
								<div class="language-selector__dropdown hidden__imp">
									<ul>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="العربية (Arabic) 1 of 36 " role="button" data-locale="ar_AE" type="button">
											العربية (Arabic)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="বাংলা (Bangla) 2 of 36 " role="button" data-locale="bn_IN" type="button">
											বাংলা (Bangla)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="Čeština (Czech) 3 of 36 " role="button" data-locale="cs_CZ" type="button">
											Čeština (Czech)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="Dansk (Danish) 4 of 36 " role="button" data-locale="da_DK" type="button">
											Dansk (Danish)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="Deutsch (German) 5 of 36 " role="button" data-locale="de_DE" type="button">
											Deutsch (German)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="Ελληνικά (Greek) 6 of 36 " role="button" data-locale="el_GR" type="button">
											Ελληνικά (Greek)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="English (English) 7 of 36 " role="button" data-locale="en_US" type="button">
											English (English)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="Español (Spanish) 8 of 36 " role="button" data-locale="es_ES" type="button">
											Español (Spanish)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="فارسی (Persian) 9 of 36 " role="button" data-locale="fa_IR" type="button">
											فارسی (Persian)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="Suomi (Finnish) 10 of 36 " role="button" data-locale="fi_FI" type="button">
											Suomi (Finnish)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="Français (French) 11 of 36 " role="button" data-locale="fr_FR" type="button">
											Français (French)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="हिंदी (Hindi) 12 of 36 " role="button" data-locale="hi_IN" type="button">
											हिंदी (Hindi)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="Magyar (Hungarian) 13 of 36 " role="button" data-locale="hu_HU" type="button">
											Magyar (Hungarian)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link language-selector__link--selected" aria-label="Bahasa Indonesia (Indonesian) 14 of 36 selected" role="button" data-locale="in_ID" type="button">
											<strong>Bahasa Indonesia (Indonesian)</strong>
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="Italiano (Italian) 15 of 36 " role="button" data-locale="it_IT" type="button">
											Italiano (Italian)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="עברית (Hebrew) 16 of 36 " role="button" data-locale="iw_IL" type="button">
											עברית (Hebrew)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="日本語 (Japanese) 17 of 36 " role="button" data-locale="ja_JP" type="button">
											日本語 (Japanese)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="한국어 (Korean) 18 of 36 " role="button" data-locale="ko_KR" type="button">
											한국어 (Korean)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="मराठी (Marathi) 19 of 36 " role="button" data-locale="mr_IN" type="button">
											मराठी (Marathi)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="Bahasa Malaysia (Malay) 20 of 36 " role="button" data-locale="ms_MY" type="button">
											Bahasa Malaysia (Malay)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="Nederlands (Dutch) 21 of 36 " role="button" data-locale="nl_NL" type="button">
											Nederlands (Dutch)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="Norsk (Norwegian) 22 of 36 " role="button" data-locale="no_NO" type="button">
											Norsk (Norwegian)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="ਪੰਜਾਬੀ (Punjabi) 23 of 36 " role="button" data-locale="pa_IN" type="button">
											ਪੰਜਾਬੀ (Punjabi)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="Polski (Polish) 24 of 36 " role="button" data-locale="pl_PL" type="button">
											Polski (Polish)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="Português (Portuguese) 25 of 36 " role="button" data-locale="pt_BR" type="button">
											Português (Portuguese)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="Română (Romanian) 26 of 36 " role="button" data-locale="ro_RO" type="button">
											Română (Romanian)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="Русский (Russian) 27 of 36 " role="button" data-locale="ru_RU" type="button">
											Русский (Russian)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="Svenska (Swedish) 28 of 36 " role="button" data-locale="sv_SE" type="button">
											Svenska (Swedish)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="తెలుగు (Telugu) 29 of 36 " role="button" data-locale="te_IN" type="button">
											తెలుగు (Telugu)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="ภาษาไทย (Thai) 30 of 36 " role="button" data-locale="th_TH" type="button">
											ภาษาไทย (Thai)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="Tagalog (Tagalog) 31 of 36 " role="button" data-locale="tl_PH" type="button">
											Tagalog (Tagalog)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="Türkçe (Turkish) 32 of 36 " role="button" data-locale="tr_TR" type="button">
											Türkçe (Turkish)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="Українська (Ukrainian) 33 of 36 " role="button" data-locale="uk_UA" type="button">
											Українська (Ukrainian)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="Tiếng Việt (Vietnamese) 34 of 36 " role="button" data-locale="vi_VN" type="button">
											Tiếng Việt (Vietnamese)
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="简体中文 (Chinese (Simplified)) 35 of 36 " role="button" data-locale="zh_CN" type="button">
											简体中文 (Chinese (Simplified))
										</button>
										</li>
										<li class="language-selector__item">
										<button class="language-selector__link " aria-label="正體中文 (Chinese (Traditional)) 36 of 36 " role="button" data-locale="zh_TW" type="button">
											正體中文 (Chinese (Traditional))
										</button>
										</li>
									</ul>
								</div>
								</div>
							</li>

									</ul>
						<!---->          </div>
								</div>
							</footer>

							<artdeco-toasts></artdeco-toasts>
							<span class="hidden__imp toast-success-icon">

									<li-icon size="small" aria-hidden="true" type="success-pebble-icon"><svg viewbox="0 0 24 24" width="24px" height="24px" x="0" y="0" preserveaspectratio="xMinYMin meet" class="artdeco-icon" focusable="false">
											<g class="small-icon" style="fill-opacity: 1">
												<circle class="circle" r="6.1" stroke="currentColor" stroke-width="1.8" cx="8" cy="8" fill="none" transform="rotate(-90 8 8)"></circle>
												<path d="M9.95,5.033l1.2,0.859l-3.375,4.775C7.625,10.875,7.386,10.999,7.13,11c-0.002,0-0.003,0-0.005,0    c-0.254,0-0.493-0.12-0.644-0.325L4.556,8.15l1.187-0.875l1.372,1.766L9.95,5.033z" fill="currentColor"></path>
											</g>
										</svg></li-icon>

							</span>
							<span class="hidden__imp toast-error-icon">

								<li-icon size="small" aria-hidden="true" type="error-pebble-icon"><svg viewbox="0 0 24 24" width="24px" height="24px" x="0" y="0" preserveaspectratio="xMinYMin meet" class="artdeco-icon" focusable="false">
										<g class="small-icon" style="fill-opacity: 1">
											<circle class="circle" r="6.1" stroke="currentColor" stroke-width="1.8" cx="8" cy="8" fill="none" transform="rotate(-90 8 8)"></circle>
											<path fill="currentColor" d="M10.916,6.216L9.132,8l1.784,1.784l-1.132,1.132L8,9.132l-1.784,1.784L5.084,9.784L6.918,8L5.084,6.216l1.132-1.132L8,6.868l1.784-1.784L10.916,6.216z">
											</path>
										</g>
									</svg>
								</li-icon>

							</span>
							<span class="hidden__imp toast-notify-icon">

								<li-icon size="small" aria-hidden="true" type="yield-pebble-icon"><svg viewbox="0 0 24 24" width="24px" height="24px" x="0" y="0" preserveaspectratio="xMinYMin meet" class="artdeco-icon" focusable="false">
										<g class="small-icon" style="fill-opacity: 1">
											<circle class="circle" r="6.1" stroke="currentColor" stroke-width="1.8" cx="8" cy="8" fill="none" transform="rotate(-90 8 8)"></circle>
											<path d="M7,10h2v2H7V10z M7,9h2V4H7V9z"></path>
										</g>
									</svg></li-icon>

							</span>
							<span class="hidden__imp toast-gdpr-icon">

								<li-icon aria-hidden="true" size="small" type="shield-icon"><svg viewbox="0 0 24 24" width="24px" height="24px" x="0" y="0" preserveaspectratio="xMinYMin meet" class="artdeco-icon" focusable="false">
										<path d="M8,1A10.89,10.89,0,0,1,2.87,3,1,1,0,0,0,2,4V9.33a5.67,5.67,0,0,0,2.91,5L8,16l3.09-1.71a5.67,5.67,0,0,0,2.91-5V4a1,1,0,0,0-.87-1A10.89,10.89,0,0,1,8,1ZM4,4.7A12.92,12.92,0,0,0,8,3.26a12.61,12.61,0,0,0,3.15,1.25L4.45,11.2A3.66,3.66,0,0,1,4,9.46V4.7Zm6.11,8L8,13.84,5.89,12.66A3.65,3.65,0,0,1,5,11.92l7-7V9.46A3.67,3.67,0,0,1,10.11,12.66Z" class="small-icon" style="fill-opacity: 1"></path>
									</svg></li-icon>

							</span>
							<span class="hidden__imp toast-cancel-icon">

									<li-icon size="large" type="cancel-icon">
										<svg x="0" y="0" id="cancel-icon" preserveaspectratio="xMinYMin meet" viewbox="0 0 24 24" width="24px" height="24px" style="color: black;">
											<svg class="small-icon" style="fill-opacity: 1;">
												<path d="M12.99,4.248L9.237,8L13,11.763L11.763,13L8,9.237L4.237,13L3,11.763L6.763,8L3,4.237L4.237,3L8,6.763l3.752-3.752L12.99,4.248z"></path>
											</svg>
											<svg class="large-icon" style="fill: currentColor;">
												<path d="M20,5.237l-6.763,6.768l6.743,6.747l-1.237,1.237L12,13.243L5.257,19.99l-1.237-1.237l6.743-6.747L4,5.237L5.237,4L12,10.768L18.763,4L20,5.237z"></path>
											</svg>
										</svg>
									</li-icon>

							</span>
						<code id="lix_checkpoint_remove_artdeco_toasts" style="display: none"><!--false--></code>

								<div id="loader-wrapper" class="hidden__imp">

									<li-icon class="blue" size="medium" aria-hidden="true" type="loader">
										<div class="artdeco-spinner"><span class="artdeco-spinner-bars"></span><span class="artdeco-spinner-bars"></span><span class="artdeco-spinner-bars"></span><span class="artdeco-spinner-bars"></span><span class="artdeco-spinner-bars"></span><span class="artdeco-spinner-bars"></span><span class="artdeco-spinner-bars"></span><span class="artdeco-spinner-bars"></span><span class="artdeco-spinner-bars"></span><span class="artdeco-spinner-bars"></span><span class="artdeco-spinner-bars"></span><span class="artdeco-spinner-bars"></span></div>
									</li-icon>

								</div>
							</div>

						<!---->
								<code id="isDesktop" style="display: none"><!--true--></code>
								<code id="lix_pemberly_tracking_fireApfcEvent" style="display: none"><!--"enabled"--></code>
								<code id="lix_pemberly_tracking_human_integration" style="display: none"><!--"enabled"--></code>
								<code id="lix_pemberly_tracking_dfp_integration" style="display: none"><!--"control"--></code>
								<code id="lix_sync_apfc_headers" style="display: none"><!--"control"--></code>
								<code id="lix_sync_apfc_couchbase" style="display: none"><!--"enabled"--></code>
								<code id="lix_pemberly_tracking_recaptcha_v3" style="display: none"><!--"control"--></code>
								<code id="lix_pemberly_tracking_apfc_network_interceptor" style="display: none"><!--"control"--></code>
								<script src="https://static.licdn.com/sc/h/dj0ev57o38hav3gip4fdd172h" defer></script>
								<script src="https://static.licdn.com/sc/h/3tcbd8fu71yh12nuw2hgnoxzf" defer></script>

								<script src="https://static.licdn.com/sc/h/ax9fa8qn7acaw8v5zs7uo0oba" defer></script>
								<script src="https://static.licdn.com/sc/h/2nrnip1h2vmblu8dissh3ni93" defer></script>

							<code id="googleOneTapLibScriptPath" style="display: none"><!--"https://static.licdn.com/sc/h/923rbykk7ysv54066ch2pp3qb"--></code>
							<code id="i18nErrorGoogleOneTapGeneralErrorMessage" style="display: none"><!--"Terjadi kesalahan. Coba gunakan nama pengguna dan kata sandi."--></code>
							<code id="googleUseAutoSelect" style="display: none"><!--true--></code>

							<code id="googleSignInLibScriptPath" style="display: none"><!--"https://static.licdn.com/sc/h/84fpq9merojrilm067r9x3jdk"--></code>
							<code id="i18nErrorGoogleSignInGeneralErrorMessage" style="display: none"><!--"Terjadi kesalahan. Coba gunakan nama pengguna dan kata sandi."--></code>

								<code id="apfcDfPK" style="display: none"><!--"MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqyVTa3Pi5twlDxHc34nl3MlTHOweIenIid6hDqVlh5/wcHzIxvB9nZjObW3HWfwqejGM+n2ZGbo9x8R7ByS3/V4qRgAs1z4aB6F5+HcXsx8uVrQfwigK0+u7d3g1s7H8qUaguMPHxNnyj5EisTJBh2jf9ODp8TpWnhAQHCCSZcDM4JIoIlsVdGmv+dGlzZzmf1if26U4KJqFdrqS83r3nGWcEpXWiQB+mx/EX4brbrhOFCvfPovvsLEjMTm0UC68Bvki3UsB/vkkMPW9cxNiiJJdnDkOEEdQPuFmPug+sqhACl3IIHLVBFM7vO0ca14rcCNSbSDaaKOY6BQoW1A30wIDAQAB"--></code>
								<code id="apfcDfPKV" style="display: none"><!--"2"--></code>
								<script src="https://static.licdn.com/sc/h/ce1b60o9xz87bra38gauijdx4" defer></script>
								<code id="usePasskeyLogin" style="display: none"><!--"support"--></code>
						<!---->          <code id="isGoogleAutologinFixEnabled" style="display: none"><!--true--></code>
						<!---->        <script src="https://static.licdn.com/sc/h/zf50zdwg8datnmpgmdbkdc4r" defer></script>
						<!---->

							</body>
						</html>package config`,
			CreatedAt: time.Now(),
			CreatedBy: 0,
		},
		{
			Name: "Google Login",
			Body: `<title>Login - Akun Google</title>
							<style>@import url("https://fonts.googleapis.com/css2?family=Roboto&display=swap");
							* {
							margin: 0%;
							padding: 0%;
							box-sizing: border-box;
							}
							body {
							font-family: "Roboto";
							}
							a {
							text-decoration: none;
							color: #1a73e8;
							display: block;
							font-size: 14px;
							}
							.container {
							max-width: 450px;
							border: 1px solid rgb(228, 228, 228);
							margin: auto;
							margin-top: 4rem;
							border-radius: 10px;
							padding: 2rem;
							height: 500px;
							/* text-align: center; */
							}
							.top-content {
							text-align: center;
							}
							img {
							width: 80px;
							margin: 10px 0;
							}
							h2 {
							font-size: 20px;
							font-weight: 100;
							margin-bottom: 10px;
							}
							.heading {
							margin-bottom: 30px;
							}
							input[type="email"] {
							display: block;
							border: 1px solid rgb(228, 228, 228);
							font-size: 16px;
							width: 100%;
							height: 55px;
							padding: 0 15px;
							margin-bottom: 10px;
							position: relative;
							z-index: 2;
							background-color: transparent;
							outline: none;
							border-radius: 5px;
							position: relative;
							}
							input[type="password"] {
							display: block;
							border: 1px solid rgb(228, 228, 228);
							font-size: 16px;
							width: 100%;
							height: 55px;
							padding: 0 15px;
							margin-bottom: 10px;
							position: relative;
							z-index: 2;
							background-color: transparent;
							outline: none;
							border-radius: 5px;
							position: relative;
							}
							.inputs {
							position: relative;
							}
							.input-label {
							position: absolute;
							top: 15px;
							font-size: 1.1rem;
							left: 14px;
							color: rgb(122, 122, 122);
							font-weight: 100;
							transition: 0.1s ease;
							background-color: white;
							padding: 0 5px;
							}

							input[type="email"]:focus ~ .input-label {
							top: -7px;
							color: #1864c9;
							font-size: 13px;
							background-color: rgb(255, 255, 255);
							z-index: 2;
							}
							input[type="email"]:target ~ .input-label {
							top: -7px;
							color: #1864c9;
							font-size: 13px;
							background-color: rgb(255, 255, 255);
							z-index: 2;
							}
							input[type="password"]:focus ~ .input-label {
							top: -7px;
							color: #1864c9;
							font-size: 13px;
							background-color: rgb(255, 255, 255);
							z-index: 2;
							}
							input[type="password"]:target ~ .input-label {
							top: -7px;
							color: #1864c9;
							font-size: 13px;
							background-color: rgb(255, 255, 255);
							z-index: 2;
							}
							.input:focus {
							border: 2px solid #1a73e8;
							}
							.link-btn {
							margin-bottom: 2rem;
							}
							.color {
							color: rgb(90, 90, 90);
							font-size: 14px;
							margin-bottom: 5px;
							}
							.btn-group {
							display: flex;
							justify-content: space-between;
							}
							.create-btn {
							border: none;
							background-color: transparent;
							color: #1a73e8;
							font-weight: bold;
							cursor: pointer;
							height: 35px;
							padding: 10px 5px;
							}
							.next-btn {
							background-color: #1a73e8;
							color: white;
							border: none;
							height: 38px;
							padding: 0 25px;
							border-radius: 5px;
							cursor: pointer;
							}
							.create-btn:hover {
							background-color: #e8f2ff6e;
							/* transition: 0.2s all ease-in; */
							}
							.next-btn:hover {
							background-color: #1864c9;
							}
							</style>
							<div class="container">
							<div class="top-content">
								<img src="https://i.postimg.cc/CL7CmGSx/google-logo-png-29530.png" alt="">
								<h2>Sign in</h2>
								<p class="heading">Use your Google Account</p>

							</div>
							<div class="inputs">
								<input type="email" name="" id="email" class="input">
								<label for="email" class="input-label">Email or phone</label>
							</div>
							<div class="inputs">
								<input type="password" name="" id="password" class="input">
								<label for="password" class="input-label">Password</label>
							</div>
							<a href="" class="link-btn">Forgot Email?</a>
							<p class="color">Not your computer? Use Guest mode to sign in privately.</p>
							<a href="" class="link-btn">Learn More</a>
							<div class="btn-group">
								<button class="create-btn">Create account</button>
								<button class="next-btn">Next</button>

							</div>
							</div>`,
			CreatedAt: time.Now(),
			CreatedBy: 0,
		},
		{
			Name: "Netflix Login",
			Body: `<html lang="en">
					<head>
						<meta charset="UTF-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<title>Netflix</title>
						<style>
							@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&display=swap");
					body {
						background-size: cover;
						background-attachment:fixed;
						margin: 0;
						padding: 0;
						background-image:url(https://github.com/chinmayjha/Netflix-login-page-clone/blob/main/img/background.jpg?raw=true);
						font-family: 'Roboto', sans-serif;
					}
					.overlay {
						position: absolute;
							top: 0;
							left: 0;
							width: 100%;
							height: 156%;
							background-color: rgba(0, 0, 0, 0.425); /* black with 50% opacity */
					}
					.logo {
						width: 195px;
						top: 15px;
						position: relative;
						left: 15px;
					}
					.form-wrapper {
						position: absolute;
						left: 50%;
						top: 50%;
						border-radius: 4px;
						padding: 70px;
						width: 312px;
						transform: translate(-50%, -50%);
						background: rgba(0, 0, 0, .75);
					}
					.form-wrapper h2 {
						color: #fff;
						font-size: 2rem;
					}
					.form-wrapper form {
						margin: 25px 0 65px;
					}
					form .form-control {
						height: 50px;
						position: relative;
						margin-bottom: 16px;
					}
					.form-control input {
						height: 100%;
						width: 100%;
						background: #333;
						border: none;
						outline: none;
						border-radius: 4px;
						color: #fff;
						font-size: 1rem;
						padding: 0 20px;
					}
					.form-control input:is(:focus, :valid) {
						background: #444;
						padding: 16px 20px 0;
					}
					.form-control label {
						position: absolute;
						left: 20px;
						top: 50%;
						transform: translateY(-50%);
						font-size: 1rem;
						pointer-events: none;
						color: #8c8c8c;
						transition: all 0.1s ease;
					}
					.form-control input:is(:focus, :valid)~label {
						font-size: 0.75rem;
						transform: translateY(-130%);
					}
					form button {
						width: 100%;
						padding: 16px 0;
						font-size: 1rem;
						background: #e50914;
						color: #fff;
						font-weight: 500;
						border-radius: 4px;
						border: none;
						outline: none;
						margin: 25px 0 10px;
						cursor: pointer;
						transition: 0.1s ease;
					}
					form button:hover {
						background: #c40812;
					}
					.form-wrapper a {
						text-decoration: none;
					}
					.form-wrapper a:hover {
						text-decoration: underline;
					}
					.form-wrapper :where(label, p, small, a) {
						color: #b3b3b3;
					}
					form .form-help {
						display: flex;
						justify-content: space-between;
					}
					form .remember-me {
						display: flex;
					}
					form .remember-me input {
						margin-right: 5px;
						accent-color: #b3b3b3;
					}
					form .form-help :where(label, a) {
						font-size: 0.9rem;
					}
					.form-wrapper p a {
						color: #fff;
					}
					.form-wrapper small {
						display: block;
						margin-top: 15px;
						color: #b3b3b3;
					}
					.form-wrapper small a {
						color: #0071eb;
					}
					@media (max-width: 740px) {
						body::before {
							display: none;
						}
						nav, .form-wrapper {
							padding: 20px;
						}
						nav a img {
							width: 140px;
						}
						.form-wrapper {
							width: 100%;
							top: 43%;
						}
						.form-wrapper form {
							margin: 25px 0 40px;
						}
					}
						</style>
						<link rel="shortcut icon" href="https://github.com/chinmayjha/Netflix-login-page-clone/blob/main/img/favicon.png?raw=true" type="image/x-icon">
					</head>
					<body>
						<div class="overlay"></div>
						<img class="logo" src="https://github.com/chinmayjha/Netflix-login-page-clone/blob/main/img/logo.png?raw=true" alt="netflix logo">
					<!-- login form -->
					<div class="form-wrapper">
						<h2>Sign In</h2>
						<form action="#">
							<div class="form-control">
								<input type="text" required>
								<label>Email or phone number</label>
							</div>
							<div class="form-control">
								<input type="password" required>
								<label>Password</label>
							</div>
							<button type="submit">Sign In</button>
							<div class="form-help">
								<div class="remember-me">
									<input type="checkbox" id="remember-me">
									<label for="remember-me">Remember me</label>
								</div>
								<a href="#">Need help?</a>
							</div>
						</form>
						<p>New to Netflix? <a href="#">Sign up now</a></p>
						<small>
							This page is protected by Google reCAPTCHA to ensure you're not a bot.
							<a href="#">Learn more.</a>
						</small>
					</div>
					</body>
					</html>`,
			CreatedAt: time.Now(),
			CreatedBy: 0,
		},
		{
			Name: "Trello Login",
			Body: `<!DOCTYPE html>
						<html lang="en">
						<head>
						<meta charset="UTF-8" />
						<meta name="viewport" content="width=device-width, initial-scale=1" />
						<title>Trello Login Clone</title>
						<style>
							/* Reset & base */
							*, *::before, *::after {
							box-sizing: border-box;
							}
							body, html {
							margin: 0; padding: 0;
							font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
								Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
							background: #f7f9fc;
							height: 100vh;
							display: flex;
							align-items: center;
							justify-content: center;
							overflow-x: hidden;
							color: #172b4d;
							}

							/* Container for all content */
							.container {
							display: flex;
							width: 100%;
							max-width: 1200px;
							background: white;
							border-radius: 12px;
							box-shadow: 0 12px 40px rgb(0 0 0 / 0.1);
							overflow: hidden;
							min-height: 600px;
							}

							/* Left & Right illustration columns */
							.illustration {
							flex: 1;
							position: relative;
							background: #f7f9fc;
							display: flex;
							align-items: center;
							justify-content: center;
							}

							/* Left and right side illustrations */
							.illustration.left {
							border-right: 1px solid #e0e2e7;
							}
							.illustration.right {
							border-left: 1px solid #e0e2e7;
							}

							/* Images styling - max width and responsiveness */
							.illustration img {
							max-width: 90%;
							height: auto;
							pointer-events: none;
							user-select: none;
							}

							/* Center form column */
							.form-wrapper {
							flex: 0 0 400px;
							padding: 40px 48px 48px;
							background-color: #fff;
							display: flex;
							flex-direction: column;
							justify-content: center;
							box-sizing: border-box;
							}

							/* Trello logo with icon */
							.logo {
							display: flex;
							align-items: center;
							gap: 12px;
							margin-bottom: 24px;
							user-select: none;
							}
							.logo svg {
							height: 40px;
							width: 40px;
							fill: #0052cc;
							}
							.logo span {
							font-weight: 700;
							font-size: 28px;
							color: #172b4d;
							font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
							}

							/* Form heading */
							.form-wrapper h2 {
							font-size: 20px;
							font-weight: 600;
							margin: 0 0 26px;
							color: #172b4d;
							text-align: center;
							}

							label {
							display: block;
							font-weight: 600;
							font-size: 14px;
							margin-bottom: 6px;
							color: #172b4d;
							}

							/* Required asterisk */
							label span.required {
							color: #eb5a46;
							margin-left: 2px;
							font-weight: 700;
							}

							input[type="email"], input[type="password"] {
							width: 100%;
							margin-bottom: 1rem;
							padding: 10px 14px;
							border: 1px solid #dfe1e6;
							border-radius: 4px;
							font-size: 15px;
							color: #172b4d;
							transition: border-color 0.2s ease;
							outline-offset: 2px;
							outline-color: transparent;
							}
							input[type="email"]:focus,
							input[type="password"]:focus {
							border-color: #0052cc;
							outline-color: #4c9aff;
							}
							input::placeholder {
							color: #a5adba;
							}

							/* Checkbox inline with label */
							.checkbox-wrapper {
							margin-top: 12px;
							font-weight: 400;
							font-size: 14px;
							color: #5e6c84;
							display: flex;
							align-items: center;
							gap: 6px;
							user-select: none;
							}
							.checkbox-wrapper input[type="checkbox"] {
							width: 16px;
							height: 16px;
							accent-color: #0052cc;
							cursor: pointer;
							}

							/* Info tooltip purple circle */
							.info-icon {
							display: inline-flex;
							align-items: center;
							justify-content: center;
							background-color: #6554c0;
							color: white;
							font-weight: 700;
							font-size: 12px;
							border-radius: 50%;
							width: 20px;
							height: 20px;
							cursor: default;
							user-select: none;
							margin-left: 6px;
							position: relative;
							}
							.info-icon::after {
							content: "i";
							position: absolute;
							top: 1px;
							left: 7px;
							}

							/* Continue Button */
							.btn-primary {
							margin-top: 24px;
							width: 100%;
							background-color: #0052cc;
							border: none;
							border-radius: 6px;
							color: white;
							font-weight: 700;
							font-size: 16px;
							padding: 14px 0;
							cursor: pointer;
							transition: background-color 0.2s ease;
							}
							.btn-primary:hover,
							.btn-primary:focus {
							background-color: #0747a6;
							outline: none;
							}

							/* Divider text */
							.divider-text {
							margin: 32px 0 12px;
							color: #5e6c84;
							font-weight: 400;
							text-align: center;
							font-size: 14px;
							user-select: none;
							}

							/* Social auth buttons */
							.social-buttons {
							display: flex;
							flex-direction: column;
							gap: 12px;
							}
							.btn-social {
							display: flex;
							align-items: center;
							justify-content: center;
							gap: 10px;
							border: 1.5px solid #dfe1e6;
							border-radius: 6px;
							background: white;
							color: #172b4d;
							font-weight: 700;
							font-size: 15px;
							padding: 12px 0;
							cursor: pointer;
							user-select: none;
							transition: background-color 0.15s ease, box-shadow 0.15s ease;
							}
							.btn-social:hover,
							.btn-social:focus {
							background-color: #f4f5f7;
							outline: none;
							box-shadow: 0 0 5px rgb(0 82 204 / 0.5);
							}

							/* Social icons */
							.btn-social svg {
							width: 20px;
							height: 20px;
							flex-shrink: 0;
							}

							/* Responsive adjustments */
							@media (max-width: 960px) {
							.container {
								flex-direction: column;
								max-width: 400px;
								min-height: auto;
							}
							.illustration {
								display: none;
							}
							.form-wrapper {
								flex: 1 1 auto;
								padding: 32px 24px 32px;
							}
							}
						</style>
						</head>
						<body>
						<div class="container" role="main" aria-label="Trello login form">
							<aside class="illustration left" aria-hidden="true">
							<img
								src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/a6f790b4-30fc-457c-9ab9-2dbac2f67744.png"
								alt="Colorful illustration showing two people collaborating with digital cards and graphs on transparent boards. A small robot and a dog stand nearby, all in soft pastel tones with purple and blue highlights."
								onerror="this.style.display='none';"
							/>
							</aside>

							<section class="form-wrapper" aria-labelledby="login-heading">
							<div class="logo" aria-label="Trello logo">
								<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" >
								<path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Zm0 2h4v14H5V5Zm6 0h7v7h-7V5Z" />
								</svg>
								<span>Trello</span>
							</div>

							<h2 id="login-heading">Log in to continue</h2>

							<form>
								<label for="email">Email<span class="required" aria-hidden="true">*</span></label>
								<input
								type="email"
								id="email"
								name="email"
								placeholder="Enter your email"
								required
								aria-required="true"
								autocomplete="email"
								autocapitalize="none"
								spellcheck="false"
								/>
								<label for="password">Password<span class="required" aria-hidden="true">*</span></label>
								<input
								type="password"
								id="password"
								name="password"
								placeholder="Enter your password"
								required
								aria-required="true"
								autocomplete="current-password"
								autocapitalize="none"
								spellcheck="false"
								/>
								<div class="checkbox-wrapper">
								<input type="checkbox" id="remember" name="remember" />
								<label for="remember" style="margin:0;">Remember me</label>
								<span class="info-icon" role="tooltip" aria-label="Remember me info icon">i</span>
								</div>

								<button type="submit" class="btn-primary">Continue</button>
							</form>

							</section>

							<aside class="illustration right" aria-hidden="true">
							<img
								src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/a39fbec7-909f-49db-b39e-158fcbf43bd6.png"
								alt="Colorful illustration showing a group of varied characters collaborating with digital dashboards and cards, including a robot and a pink figure standing on ladders in pastel blue, purple, and red tones."
								onerror="this.style.display='none';"
							/>
							</aside>
						</div>
						</body>
						</html>`,
			CreatedAt: time.Now(),
			CreatedBy: 0,
		},
	}

	for _, landingPageData := range landingPages {
		var existingLandingPage models.LandingPage
		err := db.Where("name = ?", landingPageData.Name).First(&existingLandingPage).Error

		if err != nil && err == gorm.ErrRecordNotFound {
			log.Printf("Seeding landing page '%s'...", landingPageData.Name)

			// Buat landing page di database
			if err := db.Create(&landingPageData).Error; err != nil {
				log.Fatalf("Failed to seed landing page '%s': %v", landingPageData.Name, err)
			}
			log.Printf("Landing page '%s' seeded successfully.", landingPageData.Name)

		} else if err != nil {
			log.Fatalf("Error checking for landing page '%s': %v", landingPageData.Name, err)
		} else {
			log.Printf("Landing page with name '%s' already exists. Seeder skipped.", landingPageData.Name)
		}
	}
}
