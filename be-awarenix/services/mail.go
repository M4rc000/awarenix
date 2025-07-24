package services

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"log"
	"net"
	"net/smtp"
	"strconv"
	"strings"
	"text/template"
	"time"

	"be-awarenix/config"
	"be-awarenix/models"

	"github.com/gophish/gomail"
)

// SendTestEmail
func SendTestEmail(profile *models.SendingProfiles, recipientEmail, body, subject string) error {
	// 1. Validasi awal profil dan email penerima
	if profile == nil {
		return fmt.Errorf("invalid sending profile: profile is nil")
	}
	if recipientEmail == "" {
		return fmt.Errorf("recipient email cannot be empty")
	}
	if profile.SmtpFrom == "" {
		return fmt.Errorf("invalid sending profile: 'from' email (SmtpFrom) cannot be empty")
	}
	if profile.Host == "" {
		return fmt.Errorf("invalid sending profile: host cannot be empty")
	}

	// 2. Ambil kredensial dari profil
	from := profile.SmtpFrom
	password := profile.Password
	username := profile.Username
	smtpHost := profile.Host
	var smtpPort string

	// 3. Prioritaskan profile.Port. Jika tidak ada, coba parse dari Host, atau fallback ke default.
	// Pastikan profile.Port adalah int atau string. Jika int, gunakan strconv.Itoa.
	// Jika profile.Port adalah int, Anda harus mengkonversinya ke string.
	// Asumsi profile.Port di models.SendingProfiles sekarang adalah int.
	if profile.Port != 0 { // Jika Port adalah int, cek apakah 0 (nilai default)
		smtpPort = strconv.Itoa(profile.Port)
	} else if strings.Contains(smtpHost, ":") { // Jika port tidak ada di profile.Port, coba parse dari Host
		parts := strings.Split(smtpHost, ":")
		smtpHost = parts[0]
		smtpPort = parts[1]
	} else {
		// Fallback ke port standar jika tidak ada port yang ditemukan
		smtpPort = "587" // Default jika tidak ada port yang ditemukan
	}

	// 4. Authentication
	var authUsername string
	if username != "" {
		authUsername = username
	} else {
		authUsername = from
	}
	auth := smtp.PlainAuth("", authUsername, password, smtpHost)

	// 5. TLS config (penting untuk keamanan)
	tlsconfig := &tls.Config{
		InsecureSkipVerify: false, // Jaga tetap false di produksi. Pertimbangkan sertifikat CA.
		ServerName:         smtpHost,
	}

	// 6. Dial koneksi TCP biasa terlebih dahulu
	conn, err := net.Dial("tcp", net.JoinHostPort(smtpHost, smtpPort))
	if err != nil {
		return fmt.Errorf("failed to dial SMTP server at %s:%s: %w", smtpHost, smtpPort, err)
	}
	defer conn.Close() // Pastikan koneksi ditutup

	// 7. Buat klien SMTP dari koneksi TCP
	client, err := smtp.NewClient(conn, smtpHost)
	if err != nil {
		return fmt.Errorf("failed to create SMTP client: %w", err)
	}
	defer client.Close() // Pastikan klien ditutup

	// 8. Lakukan STARTTLS untuk meng-upgrade koneksi ke TLS (hanya jika server mendukung EHLO)
	if ok, _ := client.Extension("STARTTLS"); ok {
		if err = client.StartTLS(tlsconfig); err != nil {
			return fmt.Errorf("failed to start TLS: %w", err)
		}
	} else {
		log.Println("STARTTLS not supported by server, attempting to proceed without TLS upgrade.")
	}

	// 9. Autentikasi setelah STARTTLS
	if err = client.Auth(auth); err != nil {
		return fmt.Errorf("failed to authenticate with SMTP server (user: %s): %w", authUsername, err)
	}

	// 10. Setup message (termasuk headers email kustom jika ada)
	var msgHeaders []string
	msgHeaders = append(msgHeaders, fmt.Sprintf("From: %s", from))
	msgHeaders = append(msgHeaders, fmt.Sprintf("To: %s", recipientEmail))
	msgHeaders = append(msgHeaders, fmt.Sprintf("Subject: %s", subject))
	msgHeaders = append(msgHeaders, "MIME-version: 1.0;")
	msgHeaders = append(msgHeaders, "Content-Type: text/html; charset=\"UTF-8\";")

	// Tambahkan EmailHeaders kustom dari profile jika ada
	// Sekarang profile.EmailHeaders sudah berupa []models.EmailHeader, tidak perlu unmarshal
	if profile.EmailHeaders != nil { // Cek apakah slice tidak nil
		for _, header := range profile.EmailHeaders {
			msgHeaders = append(msgHeaders, fmt.Sprintf("%s: %s", header.Header, header.Value))
		}
	}

	fullMessage := strings.Join(msgHeaders, "\r\n") + "\r\n\r\n" + body

	// 11. Send email
	if err = client.Mail(from); err != nil {
		return fmt.Errorf("failed to set sender: %w", err)
	}
	if err = client.Rcpt(recipientEmail); err != nil {
		return fmt.Errorf("failed to set recipient: %w", err)
	}
	writer, err := client.Data()
	if err != nil {
		return fmt.Errorf("failed to get data writer: %w", err)
	}
	_, err = writer.Write([]byte(fullMessage))
	if err != nil {
		return fmt.Errorf("failed to write email body: %w", err)
	}
	err = writer.Close()
	if err != nil {
		return fmt.Errorf("failed to close writer: %w", err)
	}

	// 12. Akhiri sesi SMTP
	err = client.Quit()
	if err != nil {
		log.Printf("Warning: Failed to gracefully quit SMTP session: %v", err)
	}

	return nil
}

// SendEmail
func SendEmailToRecipient(rec models.Recipient, camp models.Campaign) {
	// Domains
	backendBase := "localhost:3000"
	frontendDomain := "localhost:5173"

	// --- AMBIL NAMA RECIPIENT DARI GROUP MEMBER ---
	var recipientName string
	var gm models.Member
	err := config.DB.
		Where("group_id = ? AND email = ?", camp.GroupID, rec.Email).
		First(&gm).Error
	if err != nil {
		// fallback ke email jika nama tidak ditemukan
		recipientName = rec.Email
	} else {
		recipientName = gm.Name
	}

	// Data untuk template (body dan subject)
	templateData := map[string]interface{}{
		"Name":  recipientName,
		"Email": rec.Email,
		"LandingURL": fmt.Sprintf(
			"http://%s/lander?rid=%s&campaign=%d&page=%d",
			frontendDomain, rec.UID, camp.ID, camp.LandingPageID,
		),
	}

	// 1. Render email body
	tplBody, _ := template.New("emailBody").Parse(camp.EmailTemplate.Body)
	var bufBody bytes.Buffer
	tplBody.Execute(&bufBody, templateData)
	body := bufBody.String()

	// 2. Render email subject
	tplSubject, _ := template.New("emailSubject").Parse(camp.EmailTemplate.Subject)
	var bufSubject bytes.Buffer
	tplSubject.Execute(&bufSubject, templateData)
	subject := bufSubject.String()

	// 3. Sisipkan tracking pixel (opened)
	pixel := fmt.Sprintf(
		`<img src="http://%s/track/open?rid=%s&campaign=%d" style="display:none"/>`,
		backendBase, rec.UID, camp.ID,
	)
	body += pixel

	// Ambil bahasa dari template email
	emailLanguage := camp.EmailTemplate.Language
	var reportButtonText string
	var reportIntroText string
	switch emailLanguage {
	case "Indonesia":
		reportButtonText = "Laporkan Email Ini"
		reportIntroText = "Jika Anda yakin email ini adalah phishing, silakan"
	case "English":
		reportButtonText = "Report This Email"
		reportIntroText = "If you believe this email is phishing, please"
	default:
		reportButtonText = "Report This Email"
		reportIntroText = "If you believe this email is phishing, please"
	}

	// 4. Tambahkan tombol “Laporkan Email Ini” dengan styling mirip Gmail
	// Menggunakan gaya yang lebih subtle dan teks yang disesuaikan bahasa
	reportLink := fmt.Sprintf(`
      <div style="text-align:center; margin-top:20px; font-family:Arial, sans-serif; font-size:12px; color:#999;">
        %s <a href="http://%s/track/report?rid=%s&campaign=%d"
           style="
             color:#1a73e8; /* Warna biru mirip Gmail */
             text-decoration:none;
           ">
          %s
        </a>.
      </div>`,
		reportIntroText, // Menggunakan variabel teks pengantar
		backendBase, rec.UID, camp.ID,
		reportButtonText,
	)
	body += reportLink

	// 5. Rewrite click links (termasuk placeholder {{.Name}} & {{.Email}})
	body = RewriteLinks( // Asumsi RewriteLinks sudah didefinisikan
		body,
		rec.UID,
		camp.ID,
		camp.LandingPageID,
		frontendDomain,
		recipientName,
		rec.Email,
	)

	// 6. SMTP send
	m := gomail.NewMessage()
	m.SetHeader("From", camp.SendingProfile.SmtpFrom)
	m.SetHeader("To", rec.Email)
	m.SetHeader("Subject", subject) // Gunakan subject yang sudah di-render
	m.SetBody("text/html", body)

	d := gomail.NewDialer(
		camp.SendingProfile.Host,
		camp.SendingProfile.Port,
		camp.SendingProfile.Username,
		camp.SendingProfile.Password,
	)

	if err := d.DialAndSend(m); err != nil {
		config.DB.Model(&rec).Updates(models.Recipient{Status: "failed", Error: err.Error()})
		return
	}
	config.DB.Model(&rec).Update("status", "sent")
}

func MonitorCampaignStatus(campaignID uint) {
	log.Printf("🔍 Monitoring campaign %d…", campaignID)

	for {
		// 1. Load campaign untuk ambil SendEmailBy
		var camp models.Campaign
		err := config.DB.
			Select("send_email_by").
			First(&camp, campaignID).Error
		if err != nil {
			log.Printf("‼️ Campaign %d not found: %v", campaignID, err)
			return
		}
		now := time.Now()

		// 2. Hitung total recipient dan yang sudah selesai
		var total, done int64
		config.DB.
			Model(&models.Recipient{}).
			Where("campaign_id = ?", campaignID).
			Count(&total)

		config.DB.
			Model(&models.Recipient{}).
			Where("campaign_id = ? AND status IN ?", campaignID, []string{"sent", "failed"}).
			Count(&done)

		// 3. Penanganan deadline SendEmailBy
		if camp.SendEmailBy != nil {
			// --- Jika ada deadline ---
			if now.After(*camp.SendEmailBy) {
				status := "completed"
				if done < total {
					status = "expired"
				}

				config.DB.
					Model(&models.Campaign{}).
					Where("id = ?", campaignID).
					Update("status", status)

				log.Printf("🚦 Campaign %d finished as '%s' (done %d of %d, deadline %s).",
					campaignID, status, done, total, camp.SendEmailBy.Format(time.RFC3339))
				return
			}
		} else {
			// --- Jika SendEmailBy kosong ---
			if total > 0 && done == total {
				config.DB.
					Model(&models.Campaign{}).
					Where("id = ?", campaignID).
					Update("status", "completed")

				log.Printf("✅ Campaign %d completed (no deadline, all %d recipients processed).", campaignID, total)
				return
			}
		}

		// 4. Tunggu polling selanjutnya
		time.Sleep(15 * time.Second)
	}
}
