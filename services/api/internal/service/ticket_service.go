package service

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/maintenance-system/api/internal/domain"
	"github.com/maintenance-system/api/internal/repository"
	"github.com/maintenance-system/api/internal/websocket"
)

type TicketService interface {
	Create(ticket *domain.Ticket) error
	GetByID(id uuid.UUID) (*domain.Ticket, error)
	GetAll(filter repository.TicketFilter) ([]domain.Ticket, int64, error)
	Update(id uuid.UUID, updates map[string]interface{}, editorID uuid.UUID) (*domain.Ticket, error)
	Delete(id uuid.UUID) error
	AssignTechnician(ticketID, techID, assignerID uuid.UUID) error
	AddComment(ticketID, userID uuid.UUID, content string) (*domain.Comment, error)
	GetComments(ticketID uuid.UUID) ([]domain.Comment, error)
	GetStats() (map[string]int64, error)
}

type ticketService struct {
	repo        repository.TicketRepository
	commentRepo repository.CommentRepository
	userRepo    repository.UserRepository
	hub         *websocket.Hub
}

func NewTicketService(repo repository.TicketRepository, commentRepo repository.CommentRepository, userRepo repository.UserRepository, hub *websocket.Hub) TicketService {
	return &ticketService{
		repo:        repo,
		commentRepo: commentRepo,
		userRepo:    userRepo,
		hub:         hub,
	}
}

func (s *ticketService) Create(ticket *domain.Ticket) error {
	ticket.Status = domain.StatusOpen
	ticket.CreatedAt = time.Now()
	ticket.UpdatedAt = time.Now()

	if err := s.repo.Create(ticket); err != nil {
		return err
	}

	// Realtime notification
	if s.hub != nil {
		s.hub.Broadcast("ticket:created", ticket)
	}

	return nil
}

func (s *ticketService) GetByID(id uuid.UUID) (*domain.Ticket, error) {
	return s.repo.FindByID(id)
}

func (s *ticketService) GetAll(filter repository.TicketFilter) ([]domain.Ticket, int64, error) {
	return s.repo.FindAll(filter)
}

func (s *ticketService) Update(id uuid.UUID, updates map[string]interface{}, editorID uuid.UUID) (*domain.Ticket, error) {
	ticket, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	// Apply updates
	// Note: In a real app, strict validation would go here
	if title, ok := updates["title"].(string); ok {
		ticket.Title = title
	}
	if desc, ok := updates["description"].(string); ok {
		ticket.Description = desc
	}
	if status, ok := updates["status"].(string); ok {
		ticket.Status = domain.TicketStatus(status)
		if ticket.Status == domain.StatusResolved {
			now := time.Now()
			ticket.ResolvedAt = &now
		}
	}
	if priority, ok := updates["priority"].(string); ok {
		ticket.Priority = domain.TicketPriority(priority)
	}

	ticket.UpdatedAt = time.Now()

	if err := s.repo.Update(ticket); err != nil {
		return nil, err
	}

	// TODO: Create Log entry (skipped for brevity)

	// Realtime notification
	if s.hub != nil {
		s.hub.Broadcast("ticket:updated", ticket)
	}

	return ticket, nil
}

func (s *ticketService) Delete(id uuid.UUID) error {
	if err := s.repo.Delete(id); err != nil {
		return err
	}

	if s.hub != nil {
		s.hub.Broadcast("ticket:deleted", id)
	}

	return nil
}

func (s *ticketService) AssignTechnician(ticketID, techID, assignerID uuid.UUID) error {
	ticket, err := s.repo.FindByID(ticketID)
	if err != nil {
		return err
	}

	tech, err := s.userRepo.FindByID(techID)
	if err != nil {
		return errors.New("technician not found")
	}

	if tech.Role != domain.RoleTechnician && tech.Role != domain.RoleAdmin {
		return errors.New("assigned user is not a technician")
	}

	ticket.AssignedToID = &techID
	ticket.Status = domain.StatusInProgress // Auto update status
	ticket.UpdatedAt = time.Now()

	if err := s.repo.Update(ticket); err != nil {
		return err
	}

	if s.hub != nil {
		s.hub.Broadcast("ticket:updated", ticket)
	}

	return nil
}

func (s *ticketService) AddComment(ticketID, userID uuid.UUID, content string) (*domain.Comment, error) {
	comment := &domain.Comment{
		TicketID:  ticketID,
		UserID:    userID,
		Content:   content,
		CreatedAt: time.Now(),
	}

	if err := s.commentRepo.Create(comment); err != nil {
		return nil, err
	}
	
	// If needed emit comment event, but basic req just wants ticket updates
	// s.hub.Broadcast("comment:created", comment)

	return comment, nil
}

func (s *ticketService) GetComments(ticketID uuid.UUID) ([]domain.Comment, error) {
	return s.commentRepo.FindByTicketID(ticketID)
}

func (s *ticketService) GetStats() (map[string]int64, error) {
	return s.repo.GetStats()
}
