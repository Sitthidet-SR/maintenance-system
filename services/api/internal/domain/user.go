package domain

import (
	"time"

	"github.com/google/uuid"
)

type UserRole string

const (
	RoleUser       UserRole = "USER"
	RoleTechnician UserRole = "TECHNICIAN"
	RoleAdmin      UserRole = "ADMIN"
)

type UserStatus string

const (
	StatusActive   UserStatus = "active"
	StatusInactive UserStatus = "inactive"
)

type User struct {
	ID         uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Email      string     `gorm:"uniqueIndex;not null" json:"email"`
	Password   string     `gorm:"not null" json:"-"`
	Name       string     `gorm:"not null" json:"name"`
	Role       UserRole   `gorm:"type:varchar(20);default:'USER'" json:"role"`
	Phone      string     `json:"phone,omitempty"`
	Department string     `json:"department,omitempty"`
	Avatar     string     `json:"avatar,omitempty"`
	Status     UserStatus `gorm:"type:varchar(20);default:'active'" json:"status"`
	CreatedAt  time.Time  `json:"createdAt"`
	UpdatedAt  time.Time  `json:"updatedAt"`

	// Relations
	CreatedTickets  []Ticket `gorm:"foreignKey:CreatedByID" json:"-"`
	AssignedTickets []Ticket `gorm:"foreignKey:AssignedToID" json:"-"`
}

func (User) TableName() string {
	return "users"
}
