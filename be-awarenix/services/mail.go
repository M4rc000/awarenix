package services

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"net"
	"net/smtp"
	"strings"
	"text/template"

	"be-awarenix/config"
	"be-awarenix/models"

	"github.com/gophish/gomail"
)

func SendTestEmail(profile *models.SendingProfiles, recipientEmail, body, subject string) error {
	// Pastikan profil dan email tujuan valid
	if profile == nil || profile.SmtpFrom == "" || profile.Host == "" {
		return fmt.Errorf("invalid sending profile configuration")
	}
	if recipientEmail == "" {
		return fmt.Errorf("recipient email cannot be empty")
	}

	// from := profile.SmtpFrom
	from := profile.SmtpFrom
	password := profile.Password
	smtpHost := profile.Host
	smtpPort := "587" // **Menggunakan port 587 untuk STARTTLS**

	// Jika host memiliki port, pisahkan
	if strings.Contains(smtpHost, ":") {
		parts := strings.Split(smtpHost, ":")
		smtpHost = parts[0]
		smtpPort = parts[1]
	}

	// Authentication
	auth := smtp.PlainAuth("", from, password, smtpHost)

	// TLS config (tetap diperlukan untuk StartTLS)
	tlsconfig := &tls.Config{
		InsecureSkipVerify: false, // Set false untuk keamanan produksi, pastikan sertifikat valid
		ServerName:         smtpHost,
	}

	// --- BAGIAN YANG DIUBAH UNTUK PORT 587 (STARTTLS) ---
	// 1. Dial koneksi TCP biasa terlebih dahulu
	conn, err := net.Dial("tcp", smtpHost+":"+smtpPort)
	if err != nil {
		return fmt.Errorf("failed to dial SMTP server: %w", err)
	}

	// 2. Buat klien SMTP dari koneksi TCP
	client, err := smtp.NewClient(conn, smtpHost)
	if err != nil {
		return fmt.Errorf("failed to create SMTP client: %w", err)
	}
	defer client.Close() // Pastikan klien ditutup

	// 3. Lakukan STARTTLS untuk meng-upgrade koneksi ke TLS
	if err = client.StartTLS(tlsconfig); err != nil {
		return fmt.Errorf("failed to start TLS: %w", err)
	}
	// --- AKHIR BAGIAN YANG DIUBAH ---

	if err = client.Auth(auth); err != nil {
		return fmt.Errorf("failed to authenticate with SMTP server: %w", err)
	}

	// Setup message
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n"
	msg := []byte(
		"From: " + from + "\r\n" +
			"To: " + recipientEmail + "\r\n" +
			"Subject: " + subject + "\r\n" +
			mime + "\r\n" +
			body,
	)

	// Send email
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
	_, err = writer.Write(msg)
	if err != nil {
		return fmt.Errorf("failed to write email body: %w", err)
	}
	err = writer.Close()
	if err != nil {
		return fmt.Errorf("failed to close writer: %w", err)
	}

	client.Quit() // Penting untuk mengakhiri sesi SMTP

	return nil
}

func SendEmailToRecipient(rec models.Recipient, camp models.Campaign) {
	// Domains
	// backendBase := os.Getenv("APP_URL")
	// log.Println(backendBase)
	// if backendBase == "" {
	backendBase := "localhost:3000"
	// }
	// frontendDomain := os.Getenv("FRONTEND_URL")
	// log.Println(frontendDomain)
	// if frontendDomain == "" {
	frontendDomain := "localhost:5173"
	// }

	// 1. Render email body
	tpl, _ := template.New("email").Parse(camp.EmailTemplate.Body)
	var buf bytes.Buffer
	data := map[string]interface{}{
		"Name": rec.Email,
		"LandingURL": fmt.Sprintf(
			"http://%s/lander?rid=%s&campaign=%d&page=%d",
			frontendDomain, rec.UID, camp.ID, camp.LandingPageID,
		),
	}
	tpl.Execute(&buf, data)
	body := buf.String()

	// 2. Sisipkan tracking pixel (opened)
	pixel := fmt.Sprintf(
		`<img src="http://%s/track/open?rid=%s&campaign=%d" style="display:none"/>`,
		backendBase, rec.UID, camp.ID,
	)
	body += pixel

	// 3. Tambahkan tombol “Laporkan Email Ini”
	reportLink := fmt.Sprintf(`
      <div style="text-align:center; margin:24px 0;">
        <a href="http://%s/track/report?rid=%s&campaign=%d"
           style="
             display:inline-block;
             padding:10px 20px;
             background-color:#e74c3c;
             color:#ffffff;
             text-decoration:none;
             border-radius:4px;
             font-family:Arial, sans-serif;
             font-size:14px;
           ">
          Laporkan Email Ini
        </a>
      </div>`,
		backendBase, rec.UID, camp.ID,
	)
	body += reportLink

	// 4. Rewrite click links
	body = RewriteLinks(body, rec.UID, camp.ID, camp.LandingPageID, frontendDomain)

	// 5. SMTP send
	m := gomail.NewMessage()
	m.SetHeader("From", camp.SendingProfile.SmtpFrom)
	m.SetHeader("To", rec.Email)
	m.SetHeader("Subject", camp.EmailTemplate.Subject)
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
