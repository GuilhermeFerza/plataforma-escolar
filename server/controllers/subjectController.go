package controllers

import (
	"github.com/GuilhermeFerza/plataforma-escolar/database"
	"github.com/GuilhermeFerza/plataforma-escolar/models"
	"github.com/gin-gonic/gin"
)

func GetSubjects(c *gin.Context) {
	var subjects []models.Subject
	database.DB.Preload("Course").Find(&subjects)
	c.JSON(200, subjects)
}

func CreateSubject(c *gin.Context) {
	var novaMateria models.Subject
	if err := c.ShouldBindJSON(&novaMateria); err != nil {
		c.JSON(400, gin.H{"error": "Dados inválidos"})
		return
	}
	database.DB.Create(&novaMateria)
	c.JSON(201, novaMateria)
}

func DeleteSubject(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Unscoped().Delete(&models.Subject{}, id).Error; err != nil {
		c.JSON(500, gin.H{"error": "Erro interno ao tentar deletar a matéria."})
		return
	}
	c.JSON(200, gin.H{"message": "Matéria removida com sucesso!"})
}

func UpdateSubject(c *gin.Context) {
	id := c.Param("id")
	var materiaExistente models.Subject
	if err := database.DB.First(&materiaExistente, id).Error; err != nil {
		c.JSON(404, gin.H{"error": "Matéria não encontrada"})
		return
	}
	var dadosNovos models.Subject
	if err := c.ShouldBindJSON(&dadosNovos); err != nil {
		c.JSON(400, gin.H{"error": "Dados inválidos"})
		return
	}
	database.DB.Model(&materiaExistente).Updates(dadosNovos)
	c.JSON(200, materiaExistente)
}
