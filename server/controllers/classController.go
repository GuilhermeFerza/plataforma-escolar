package controllers

import (
	"github.com/GuilhermeFerza/plataforma-escolar/database"
	"github.com/GuilhermeFerza/plataforma-escolar/models"
	"github.com/gin-gonic/gin"
)

func GetClasses(c *gin.Context) {
	var classes []models.Class
	database.DB.Preload("Subject").Preload("Subject.Course").Find(&classes)
	c.JSON(200, classes)
}

func CreateClass(c *gin.Context) {
	var novaTurma models.Class
	if err := c.ShouldBindJSON(&novaTurma); err != nil {
		c.JSON(400, gin.H{"error": "Dados inválidos"})
		return
	}
	database.DB.Create(&novaTurma)
	c.JSON(201, novaTurma)
}

func DeleteClass(c *gin.Context) {
	id := c.Param("id")
	var count int64
	database.DB.Model(&models.Student{}).Where("class_id = ?", id).Count(&count)
	if count > 0 {

		c.JSON(400, gin.H{"error": "Não é possível excluir: Esta turma possui alunos matriculados. Remova ou transfira os alunos antes de excluir a turma."})
		return
	}
	if err := database.DB.Unscoped().Delete(&models.Class{}, id).Error; err != nil {
		c.JSON(500, gin.H{"error": "Erro interno ao tentar deletar a turma."})
		return
	}

	c.JSON(200, gin.H{"message": "Turma removida com sucesso!"})
}

func UpdateClass(c *gin.Context) {
	id := c.Param("id")
	var turmaExistente models.Class
	if err := database.DB.First(&turmaExistente, id).Error; err != nil {
		c.JSON(404, gin.H{"error": "Turma não encontrada"})
		return
	}
	var dadosNovos models.Class
	if err := c.ShouldBindJSON(&dadosNovos); err != nil {
		c.JSON(400, gin.H{"error": "Dados inválidos"})
		return
	}
	database.DB.Model(&turmaExistente).Updates(dadosNovos)
	c.JSON(200, turmaExistente)
}
