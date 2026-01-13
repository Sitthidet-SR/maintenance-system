package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/maintenance-system/api/internal/domain"
)

// RequireRole middleware checks if user has required role
func RequireRole(roles ...domain.UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("userRole")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		role := domain.UserRole(userRole.(string))

		for _, r := range roles {
			if role == r {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
	}
}

// RequireAdmin is a shortcut for admin-only routes
func RequireAdmin() gin.HandlerFunc {
	return RequireRole(domain.RoleAdmin)
}

// RequireTechnician allows technicians and admins
func RequireTechnician() gin.HandlerFunc {
	return RequireRole(domain.RoleTechnician, domain.RoleAdmin)
}
