package repository

import (
	"github.com/google/uuid"
	"github.com/maintenance-system/api/internal/domain"
)

type UserRepository interface {
	Create(user *domain.User) error
	FindByID(id uuid.UUID) (*domain.User, error)
	FindByEmail(email string) (*domain.User, error)
	FindAll(page, limit int) ([]domain.User, int64, error)
	Update(user *domain.User) error
	Delete(id uuid.UUID) error
}

type TicketRepository interface {
	Create(ticket *domain.Ticket) error
	FindByID(id uuid.UUID) (*domain.Ticket, error)
	FindAll(filter TicketFilter) ([]domain.Ticket, int64, error)
	Update(ticket *domain.Ticket) error
	Delete(id uuid.UUID) error
	GetStats() (map[string]int64, error)
}

type TicketFilter struct {
	Status       string
	Priority     string
	Category     string
	AssignedToID *uuid.UUID
	CreatedByID  *uuid.UUID
	Search       string
	Page         int
	Limit        int
}

type CommentRepository interface {
	Create(comment *domain.Comment) error
	FindByTicketID(ticketID uuid.UUID) ([]domain.Comment, error)
	Delete(id uuid.UUID) error
}

type AttachmentRepository interface {
	Create(attachment *domain.Attachment) error
	FindByTicketID(ticketID uuid.UUID) ([]domain.Attachment, error)
	Delete(id uuid.UUID) error
}

type NotificationRepository interface {
	Create(notification *domain.Notification) error
	FindByUserID(userID uuid.UUID) ([]domain.Notification, error)
	MarkAsRead(id uuid.UUID) error
	MarkAllAsRead(userID uuid.UUID) error
}
