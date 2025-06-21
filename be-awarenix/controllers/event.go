package controllers

import (
	"be-awarenix/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func EventPost(c *gin.Context) {
	var event models.Event
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Simpan event ke DB...
	c.Status(http.StatusNoContent)
}
