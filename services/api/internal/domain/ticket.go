package domain

import (
	"time"

	"github.com/google/uuid"
)

type TicketStatus string

const (
	StatusOpen       TicketStatus = "OPEN"
	StatusInProgress TicketStatus = "IN_PROGRESS"
	StatusPending    TicketStatus = "PENDING"
	StatusResolved   TicketStatus = "RESOLVED"
	StatusClosed     TicketStatus = "CLOSED"
)

type TicketPriority string

const (
	PriorityLow      TicketPriority = "LOW"
	PriorityMedium   TicketPriority = "MEDIUM"
	PriorityHigh     TicketPriority = "HIGH"
	PriorityCritical TicketPriority = "CRITICAL"
)

type TicketCategory string

const (
	CategoryElectrical TicketCategory = "ELECTRICAL"
	CategoryPlumbing   TicketCategory = "PLUMBING"
	CategoryHVAC       TicketCategory = "HVAC"
	CategoryIT         TicketCategory = "IT"
	CategoryGeneral    TicketCategory = "GENERAL"
	CategoryOther      TicketCategory = "OTHER"
)

type Ticket struct {
	ID           uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Title        string         `gorm:"not null" json:"title"`
	Description  string         `gorm:"type:text" json:"description"`
	Status       TicketStatus   `gorm:"type:varchar(20);default:'OPEN'" json:"status"`
	Priority     TicketPriority `gorm:"type:varchar(20);default:'MEDIUM'" json:"priority"`
	Category     TicketCategory `gorm:"type:varchar(20);default:'GENERAL'" json:"category"`
	Location     string         `json:"location,omitempty"`
	CreatedByID  uuid.UUID      `gorm:"type:uuid;not null" json:"createdById"`
	AssignedToID *uuid.UUID     `gorm:"type:uuid" json:"assignedToId,omitempty"`
	DueDate      *time.Time     `json:"dueDate,omitempty"`
	ResolvedAt   *time.Time     `json:"resolvedAt,omitempty"`
	CreatedAt    time.Time      `json:"createdAt"`
	UpdatedAt    time.Time      `json:"updatedAt"`

	// Relations
	CreatedBy   *User        `gorm:"foreignKey:CreatedByID" json:"createdBy,omitempty"`
	AssignedTo  *User        `gorm:"foreignKey:AssignedToID" json:"assignedTo,omitempty"`
	Comments    []Comment    `gorm:"foreignKey:TicketID" json:"comments,omitempty"`
	Attachments []Attachment `gorm:"foreignKey:TicketID" json:"attachments,omitempty"`
	Logs        []TicketLog  `gorm:"foreignKey:TicketID" json:"logs,omitempty"`
}

func (Ticket) TableName() string {
	return "tickets"
}

type Comment struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Content   string    `gorm:"type:text;not null" json:"content"`
	TicketID  uuid.UUID `gorm:"type:uuid;not null" json:"ticketId"`
	UserID    uuid.UUID `gorm:"type:uuid;not null" json:"userId"`
	CreatedAt time.Time `json:"createdAt"`

	// Relations
	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (Comment) TableName() string {
	return "comments"
}

type TicketLog struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	TicketID  uuid.UUID `gorm:"type:uuid;not null" json:"ticketId"`
	Action    string    `gorm:"not null" json:"action"`
	OldValue  string    `json:"oldValue,omitempty"`
	NewValue  string    `json:"newValue,omitempty"`
	UserID    uuid.UUID `gorm:"type:uuid;not null" json:"userId"`
	CreatedAt time.Time `json:"createdAt"`

	// Relations
	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (TicketLog) TableName() string {
	return "ticket_logs"
}
