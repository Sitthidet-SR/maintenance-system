package handler

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/maintenance-system/api/internal/domain"
	"github.com/maintenance-system/api/internal/repository"
)

type AttachmentHandler struct {
	attachmentRepo repository.AttachmentRepository
	uploadDir      string
}

func NewAttachmentHandler(attachmentRepo repository.AttachmentRepository) *AttachmentHandler {
	uploadDir := "./uploads"
	// Create uploads directory if it doesn't exist
	os.MkdirAll(uploadDir, 0755)
	return &AttachmentHandler{
		attachmentRepo: attachmentRepo,
		uploadDir:      uploadDir,
	}
}

func (h *AttachmentHandler) Upload(c *gin.Context) {
	ticketIDStr := c.Param("id")
	ticketID, err := uuid.Parse(ticketIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ticket ID"})
		return
	}

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}
	defer file.Close()

	// Generate unique filename
	ext := filepath.Ext(header.Filename)
	newFilename := fmt.Sprintf("%s_%d%s", uuid.New().String(), time.Now().Unix(), ext)
	filePath := filepath.Join(h.uploadDir, newFilename)

	// Create the file
	dst, err := os.Create(filePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}
	defer dst.Close()

	// Copy uploaded file to destination
	if _, err := io.Copy(dst, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// Create attachment record
	attachment := &domain.Attachment{
		Filename:  header.Filename,
		URL:       "/uploads/" + newFilename,
		Type:      header.Header.Get("Content-Type"),
		Size:      header.Size,
		TicketID:  ticketID,
		CreatedAt: time.Now(),
	}

	if err := h.attachmentRepo.Create(attachment); err != nil {
		// Clean up file if database insert fails
		os.Remove(filePath)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save attachment record"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "data": attachment})
}

func (h *AttachmentHandler) GetByTicketID(c *gin.Context) {
	ticketIDStr := c.Param("id")
	ticketID, err := uuid.Parse(ticketIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ticket ID"})
		return
	}

	attachments, err := h.attachmentRepo.FindByTicketID(ticketID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch attachments"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": attachments})
}

func (h *AttachmentHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("attachmentId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid attachment ID"})
		return
	}

	if err := h.attachmentRepo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete attachment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Attachment deleted"})
}
