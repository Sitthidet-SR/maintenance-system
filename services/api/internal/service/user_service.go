package service

import (
	"github.com/google/uuid"
	"github.com/maintenance-system/api/internal/domain"
	"github.com/maintenance-system/api/internal/repository"
)

type UserService interface {
	GetAll(page, limit int) ([]domain.User, int64, error)
	GetByID(id uuid.UUID) (*domain.User, error)
	Update(id uuid.UUID, updates map[string]interface{}) (*domain.User, error)
	UpdateRole(id uuid.UUID, role domain.UserRole) error
	Delete(id uuid.UUID) error
}

type userService struct {
	userRepo repository.UserRepository
}

func NewUserService(userRepo repository.UserRepository) UserService {
	return &userService{userRepo: userRepo}
}

func (s *userService) GetAll(page, limit int) ([]domain.User, int64, error) {
	if limit <= 0 {
		limit = 10
	}
	if page <= 0 {
		page = 1
	}
	return s.userRepo.FindAll(page, limit)
}

func (s *userService) GetByID(id uuid.UUID) (*domain.User, error) {
	return s.userRepo.FindByID(id)
}

func (s *userService) Update(id uuid.UUID, updates map[string]interface{}) (*domain.User, error) {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		return nil, ErrUserNotFound
	}

	if name, ok := updates["name"].(string); ok && name != "" {
		user.Name = name
	}
	if phone, ok := updates["phone"].(string); ok {
		user.Phone = phone
	}
	if department, ok := updates["department"].(string); ok {
		user.Department = department
	}
	if status, ok := updates["status"].(string); ok && status != "" {
		user.Status = domain.UserStatus(status)
	}

	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *userService) UpdateRole(id uuid.UUID, role domain.UserRole) error {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		return ErrUserNotFound
	}

	user.Role = role
	return s.userRepo.Update(user)
}

func (s *userService) Delete(id uuid.UUID) error {
	return s.userRepo.Delete(id)
}
