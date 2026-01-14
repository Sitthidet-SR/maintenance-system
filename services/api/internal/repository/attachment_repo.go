package repository

import (
	"github.com/google/uuid"
	"github.com/maintenance-system/api/internal/domain"
	"gorm.io/gorm"
)

type attachmentRepository struct {
	db *gorm.DB
}

func NewAttachmentRepository(db *gorm.DB) AttachmentRepository {
	return &attachmentRepository{db: db}
}

func (r *attachmentRepository) Create(attachment *domain.Attachment) error {
	return r.db.Create(attachment).Error
}

func (r *attachmentRepository) FindByTicketID(ticketID uuid.UUID) ([]domain.Attachment, error) {
	var attachments []domain.Attachment
	err := r.db.Where("ticket_id = ?", ticketID).Order("created_at DESC").Find(&attachments).Error
	return attachments, err
}

func (r *attachmentRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&domain.Attachment{}, id).Error
}
