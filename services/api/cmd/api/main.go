package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/maintenance-system/api/internal/config"
	"github.com/maintenance-system/api/internal/database"
	"github.com/maintenance-system/api/internal/handler"
	"github.com/maintenance-system/api/internal/middleware"
	"github.com/maintenance-system/api/internal/repository"
	"github.com/maintenance-system/api/internal/service"
	"github.com/maintenance-system/api/internal/websocket"
)

func main() {
	// Load config
	cfg := config.Load()

	// Connect to database
	db, err := database.NewPostgresDB(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Initialize WebSocket Hub
	hub := websocket.NewHub()
	go hub.Run()

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	ticketRepo := repository.NewTicketRepository(db)
	commentRepo := repository.NewCommentRepository(db)
	ticketLogRepo := repository.NewTicketLogRepository(db)
	attachmentRepo := repository.NewAttachmentRepository(db)

	// Initialize services
	authService := service.NewAuthService(userRepo, cfg)
	ticketService := service.NewTicketService(ticketRepo, commentRepo, userRepo, ticketLogRepo, hub)
	userService := service.NewUserService(userRepo)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(authService)
	ticketHandler := handler.NewTicketHandler(ticketService)
	userHandler := handler.NewUserHandler(userService)
	attachmentHandler := handler.NewAttachmentHandler(attachmentRepo)

	// Setup Gin router
	r := gin.Default()

	// Middleware
	r.Use(middleware.CORSMiddleware(cfg))

	// WebSocket route
	r.GET("/ws", func(c *gin.Context) {
		websocket.ServeWs(hub, c)
	})

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Static file server for uploads
	r.Static("/uploads", "./uploads")

	// API v1
	api := r.Group("/api/v1")
	{
		// Auth routes (public)
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.RefreshToken)
			auth.POST("/logout", authHandler.Logout)
			auth.GET("/me", middleware.AuthMiddleware(cfg), authHandler.GetMe)
			auth.POST("/change-password", middleware.AuthMiddleware(cfg), authHandler.ChangePassword)
			auth.DELETE("/delete-account", middleware.AuthMiddleware(cfg), authHandler.DeleteAccount)
			auth.PATCH("/profile", middleware.AuthMiddleware(cfg), authHandler.UpdateProfile)
		}

		// Protected routes
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware(cfg))
		{
			// Ticket routes
			tickets := protected.Group("/tickets")
			{
				tickets.POST("", ticketHandler.Create)
				tickets.GET("", ticketHandler.GetAll)
				tickets.GET("/stats", ticketHandler.GetStats) // Added stats endpoint
				tickets.GET("/:id", ticketHandler.GetByID)
				tickets.PATCH("/:id", ticketHandler.Update)
				tickets.DELETE("/:id", ticketHandler.Delete)
				tickets.POST("/:id/assign", middleware.RequireTechnician(), ticketHandler.Assign)
				tickets.POST("/:id/comments", ticketHandler.AddComment)
				tickets.GET("/:id/comments", ticketHandler.GetComments)
				tickets.GET("/:id/logs", ticketHandler.GetLogs)
				tickets.POST("/:id/attachments", attachmentHandler.Upload)
				tickets.GET("/:id/attachments", attachmentHandler.GetByTicketID)
				tickets.DELETE("/:id/attachments/:attachmentId", attachmentHandler.Delete)
			}

			// User routes (Admin only)
			users := protected.Group("/users")
			users.Use(middleware.RequireAdmin())
			{
				users.GET("", userHandler.GetAll)
				users.GET("/:id", userHandler.GetByID)
				users.PATCH("/:id", userHandler.Update)
				users.PATCH("/:id/role", userHandler.UpdateRole)
				users.DELETE("/:id", userHandler.Delete)
			}
		}
	}

	// Start server
	addr := fmt.Sprintf("%s:%s", cfg.ServerHost, cfg.ServerPort)
	log.Printf("Server starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
