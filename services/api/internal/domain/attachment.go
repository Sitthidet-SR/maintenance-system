package domain

import (
	"time"

	"github.com/google/uuid"
)

type Attachment struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Filename  string    `gorm:"not null" json:"filename"`
	URL       string    `gorm:"not null" json:"url"`
	Type      string    `json:"type"`
	Size      int64     `json:"size"`
	TicketID  uuid.UUID `gorm:"type:uuid;not null" json:"ticketId"`
	CreatedAt time.Time `json:"createdAt"`
}

func (Attachment) TableName() string {
	return "attachments"
}

type Notification struct {
	ID        uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Type      string     `gorm:"not null" json:"type"` // info, success, warning, error
	Title     string     `gorm:"not null" json:"title"`
	Message   string     `gorm:"type:text" json:"message"`
	Read      bool       `gorm:"default:false" json:"read"`
	UserID    uuid.UUID  `gorm:"type:uuid;not null" json:"userId"`
	TicketID  *uuid.UUID `gorm:"type:uuid" json:"ticketId,omitempty"`
	CreatedAt time.Time  `json:"createdAt"`
}

func (Notification) TableName() string {
	return "notifications"
}
