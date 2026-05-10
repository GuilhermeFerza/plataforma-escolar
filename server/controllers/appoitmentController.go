package controllers

import (
	"github.com/GuilhermeFerza/plataforma-escolar/database"
	"github.com/GuilhermeFerza/plataforma-escolar/models"
	"github.com/gin-gonic/gin"
)

func GetAppointments(c *gin.Context) {
	var appointments []models.Appointment
	database.DB.Preload("Class").Find(&appointments)
	c.JSON(200, appointments)
}

func CreateAppointment(c *gin.Context) {
	var appointment models.Appointment
	if err := c.ShouldBindJSON(&appointment); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	database.DB.Create(&appointment)
	c.JSON(201, appointment)
}

func DeleteAppointment(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Unscoped().Delete(&models.Appointment{}, id).Error; err != nil {
		c.JSON(500, gin.H{"error": "Erro ao eliminar agendamento"})
		return
	}
	c.JSON(200, gin.H{"message": "Agendamento removido com sucesso!"})
}
