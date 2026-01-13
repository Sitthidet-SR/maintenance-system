package repository

import (
	"github.com/google/uuid"
	"github.com/maintenance-system/api/internal/domain"
	"gorm.io/gorm"
)

type ticketRepository struct {
	db *gorm.DB
}

func NewTicketRepository(db *gorm.DB) TicketRepository {
	return &ticketRepository{db: db}
}

func (r *ticketRepository) Create(ticket *domain.Ticket) error {
	return r.db.Create(ticket).Error
}

func (r *ticketRepository) FindByID(id uuid.UUID) (*domain.Ticket, error) {
	var ticket domain.Ticket
	if err := r.db.
		Preload("CreatedBy").
		Preload("AssignedTo").
		Preload("Comments.User").
		Preload("Attachments").
		First(&ticket, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &ticket, nil
}

func (r *ticketRepository) FindAll(filter TicketFilter) ([]domain.Ticket, int64, error) {
	var tickets []domain.Ticket
	var total int64

	query := r.db.Model(&domain.Ticket{})

	// Apply filters
	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}
	if filter.Priority != "" {
		query = query.Where("priority = ?", filter.Priority)
	}
	if filter.Category != "" {
		query = query.Where("category = ?", filter.Category)
	}
	if filter.AssignedToID != nil {
		query = query.Where("assigned_to_id = ?", filter.AssignedToID)
	}
	if filter.CreatedByID != nil {
		query = query.Where("created_by_id = ?", filter.CreatedByID)
	}
	if filter.Search != "" {
		search := "%" + filter.Search + "%"
		query = query.Where("title ILIKE ? OR description ILIKE ?", search, search)
	}

	query.Count(&total)

	// Pagination
	if filter.Limit <= 0 {
		filter.Limit = 10
	}
	if filter.Page <= 0 {
		filter.Page = 1
	}
	offset := (filter.Page - 1) * filter.Limit

	if err := query.
		Preload("CreatedBy").
		Preload("AssignedTo").
		Offset(offset).
		Limit(filter.Limit).
		Order("created_at DESC").
		Find(&tickets).Error; err != nil {
		return nil, 0, err
	}

	return tickets, total, nil
}

func (r *ticketRepository) Update(ticket *domain.Ticket) error {
	return r.db.Save(ticket).Error
}

func (r *ticketRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&domain.Ticket{}, "id = ?", id).Error
}

func (r *ticketRepository) GetStats() (map[string]int64, error) {
	var total, open, inProgress, resolved int64

	if err := r.db.Model(&domain.Ticket{}).Count(&total).Error; err != nil {
		return nil, err
	}
	if err := r.db.Model(&domain.Ticket{}).Where("status = ?", "OPEN").Count(&open).Error; err != nil {
		return nil, err
	}
	if err := r.db.Model(&domain.Ticket{}).Where("status = ?", "IN_PROGRESS").Count(&inProgress).Error; err != nil {
		return nil, err
	}
	if err := r.db.Model(&domain.Ticket{}).Where("status = ?", "RESOLVED").Count(&resolved).Error; err != nil {
		return nil, err
	}

	return map[string]int64{
		"total":      total,
		"open":       open,
		"inProgress": inProgress,
		"resolved":   resolved,
	}, nil
}

// Comment Repository
type commentRepository struct {
	db *gorm.DB
}

func NewCommentRepository(db *gorm.DB) CommentRepository {
	return &commentRepository{db: db}
}

func (r *commentRepository) Create(comment *domain.Comment) error {
	return r.db.Create(comment).Error
}

func (r *commentRepository) FindByTicketID(ticketID uuid.UUID) ([]domain.Comment, error) {
	var comments []domain.Comment
	if err := r.db.
		Preload("User").
		Where("ticket_id = ?", ticketID).
		Order("created_at ASC").
		Find(&comments).Error; err != nil {
		return nil, err
	}
	return comments, nil
}

func (r *commentRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&domain.Comment{}, "id = ?", id).Error
}
