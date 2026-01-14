package service

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/maintenance-system/api/internal/config"
	"github.com/maintenance-system/api/internal/domain"
	"github.com/maintenance-system/api/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrUserExists         = errors.New("user already exists")
	ErrUserNotFound       = errors.New("user not found")
)

type AuthService interface {
	Register(name, email, password string) (*domain.User, error)
	Login(email, password string) (*domain.User, string, string, error)
	RefreshToken(refreshToken string) (string, error)
	GetUserByID(id uuid.UUID) (*domain.User, error)
	ChangePassword(userID uuid.UUID, currentPassword, newPassword string) error
	DeleteAccount(userID uuid.UUID) error
	UpdateProfile(userID uuid.UUID, name, phone string) error
}

type authService struct {
	userRepo repository.UserRepository
	cfg      *config.Config
}

func NewAuthService(userRepo repository.UserRepository, cfg *config.Config) AuthService {
	return &authService{
		userRepo: userRepo,
		cfg:      cfg,
	}
}

func (s *authService) Register(name, email, password string) (*domain.User, error) {
	// Check if user exists
	existingUser, _ := s.userRepo.FindByEmail(email)
	if existingUser != nil {
		return nil, ErrUserExists
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &domain.User{
		Name:     name,
		Email:    email,
		Password: string(hashedPassword),
		Role:     domain.RoleUser,
		Status:   domain.StatusActive,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *authService) Login(email, password string) (*domain.User, string, string, error) {
	user, err := s.userRepo.FindByEmail(email)
	if err != nil {
		return nil, "", "", ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, "", "", ErrInvalidCredentials
	}

	// Generate tokens
	accessToken, err := s.generateAccessToken(user)
	if err != nil {
		return nil, "", "", err
	}

	refreshToken, err := s.generateRefreshToken(user)
	if err != nil {
		return nil, "", "", err
	}

	return user, accessToken, refreshToken, nil
}

func (s *authService) RefreshToken(refreshToken string) (string, error) {
	claims := &jwt.RegisteredClaims{}
	token, err := jwt.ParseWithClaims(refreshToken, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.cfg.JWTSecret), nil
	})

	if err != nil || !token.Valid {
		return "", errors.New("invalid refresh token")
	}

	userID, err := uuid.Parse(claims.Subject)
	if err != nil {
		return "", err
	}

	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return "", ErrUserNotFound
	}

	return s.generateAccessToken(user)
}

func (s *authService) GetUserByID(id uuid.UUID) (*domain.User, error) {
	return s.userRepo.FindByID(id)
}

func (s *authService) generateAccessToken(user *domain.User) (string, error) {
	claims := jwt.MapClaims{
		"sub":   user.ID.String(),
		"email": user.Email,
		"role":  user.Role,
		"exp":   time.Now().Add(time.Duration(s.cfg.JWTExpireMinutes) * time.Minute).Unix(),
		"iat":   time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}

func (s *authService) generateRefreshToken(user *domain.User) (string, error) {
	claims := jwt.RegisteredClaims{
		Subject:   user.ID.String(),
		ExpiresAt: jwt.NewNumericDate(time.Now().AddDate(0, 0, s.cfg.JWTRefreshDays)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}

func (s *authService) ChangePassword(userID uuid.UUID, currentPassword, newPassword string) error {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return ErrUserNotFound
	}

	// Verify current password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(currentPassword)); err != nil {
		return errors.New("current password is incorrect")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user.Password = string(hashedPassword)
	return s.userRepo.Update(user)
}

func (s *authService) DeleteAccount(userID uuid.UUID) error {
	return s.userRepo.Delete(userID)
}

func (s *authService) UpdateProfile(userID uuid.UUID, name, phone string) error {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return ErrUserNotFound
	}

	if name != "" {
		user.Name = name
	}
	if phone != "" {
		user.Phone = phone
	}

	return s.userRepo.Update(user)
}
