package repository

import (
	"github.com/google/uuid"
	"github.com/maintenance-system/api/internal/domain"
	"gorm.io/gorm"
)

type TicketLogRepository interface {
	Create(log *domain.TicketLog) error
	FindByTicketID(ticketID uuid.UUID) ([]domain.TicketLog, error)
}

type ticketLogRepository struct {
	db *gorm.DB
}

func NewTicketLogRepository(db *gorm.DB) TicketLogRepository {
	return &ticketLogRepository{db: db}
}

func (r *ticketLogRepository) Create(log *domain.TicketLog) error {
	return r.db.Create(log).Error
}

func (r *ticketLogRepository) FindByTicketID(ticketID uuid.UUID) ([]domain.TicketLog, error) {
	var logs []domain.TicketLog
	err := r.db.Where("ticket_id = ?", ticketID).
		Preload("User").
		Order("created_at DESC").
		Find(&logs).Error
	return logs, err
}
