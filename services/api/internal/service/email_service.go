package service

import (
	"fmt"
	"log"

	"github.com/maintenance-system/api/internal/config"
	"gopkg.in/gomail.v2"
)

type EmailService interface {
	SendTicketCreated(toEmail, toName, ticketTitle, ticketID string) error
	SendTicketAssigned(toEmail, toName, ticketTitle, ticketID string) error
	SendTicketUpdated(toEmail, toName, ticketTitle, ticketID, oldStatus, newStatus string) error
}

type emailService struct {
	cfg    *config.Config
	dialer *gomail.Dialer
}

func NewEmailService(cfg *config.Config) EmailService {
	if cfg.SMTPHost == "" {
		log.Println("SMTP not configured - email notifications disabled")
		return &emailService{cfg: cfg, dialer: nil}
	}

	dialer := gomail.NewDialer(cfg.SMTPHost, cfg.SMTPPort, cfg.SMTPUser, cfg.SMTPPassword)
	return &emailService{
		cfg:    cfg,
		dialer: dialer,
	}
}

func (s *emailService) send(to, subject, body string) error {
	if s.dialer == nil {
		log.Printf("[Email Disabled] To: %s, Subject: %s", to, subject)
		return nil
	}

	m := gomail.NewMessage()
	m.SetHeader("From", s.cfg.SMTPFrom)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", body)

	if err := s.dialer.DialAndSend(m); err != nil {
		log.Printf("Failed to send email: %v", err)
		return err
	}

	log.Printf("Email sent to %s: %s", to, subject)
	return nil
}

func (s *emailService) SendTicketCreated(toEmail, toName, ticketTitle, ticketID string) error {
	subject := fmt.Sprintf("แจ้งซ่อมใหม่: %s", ticketTitle)
	body := fmt.Sprintf(`
		<h2>สวัสดี %s</h2>
		<p>มีรายการแจ้งซ่อมใหม่ถูกสร้างขึ้น:</p>
		<p><strong>หัวข้อ:</strong> %s</p>
		<p><strong>รหัส:</strong> %s</p>
		<hr>
		<p>เข้าสู่ระบบเพื่อดูรายละเอียด</p>
	`, toName, ticketTitle, ticketID[:8])

	return s.send(toEmail, subject, body)
}

func (s *emailService) SendTicketAssigned(toEmail, toName, ticketTitle, ticketID string) error {
	subject := fmt.Sprintf("คุณได้รับมอบหมายงาน: %s", ticketTitle)
	body := fmt.Sprintf(`
		<h2>สวัสดี %s</h2>
		<p>คุณได้รับมอบหมายงานแจ้งซ่อมใหม่:</p>
		<p><strong>หัวข้อ:</strong> %s</p>
		<p><strong>รหัส:</strong> %s</p>
		<hr>
		<p>เข้าสู่ระบบเพื่อดำเนินการ</p>
	`, toName, ticketTitle, ticketID[:8])

	return s.send(toEmail, subject, body)
}

func (s *emailService) SendTicketUpdated(toEmail, toName, ticketTitle, ticketID, oldStatus, newStatus string) error {
	subject := fmt.Sprintf("อัปเดตสถานะ: %s", ticketTitle)
	body := fmt.Sprintf(`
		<h2>สวัสดี %s</h2>
		<p>สถานะรายการแจ้งซ่อมของคุณได้รับการอัปเดต:</p>
		<p><strong>หัวข้อ:</strong> %s</p>
		<p><strong>รหัส:</strong> %s</p>
		<p><strong>สถานะเดิม:</strong> %s</p>
		<p><strong>สถานะใหม่:</strong> %s</p>
		<hr>
		<p>เข้าสู่ระบบเพื่อดูรายละเอียด</p>
	`, toName, ticketTitle, ticketID[:8], oldStatus, newStatus)

	return s.send(toEmail, subject, body)
}
