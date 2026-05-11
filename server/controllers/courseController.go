package controllers

import (
	"github.com/GuilhermeFerza/plataforma-escolar/database"
	"github.com/GuilhermeFerza/plataforma-escolar/models"
	"github.com/gin-gonic/gin"
)

func GetCourses(c *gin.Context) {
	var courses []models.Course
	name := c.Query("name")
	query := database.DB.Preload("Classes.Students")
	if name != "" {
		query.Where("name ILIKE ?", "%"+name+"%").Find(&courses)
	} else {
		query.Find(&courses)
	}
	c.JSON(200, courses)
}

func CreateCourse(c *gin.Context) {
	var novoCurso models.Course
	if err := c.ShouldBindJSON(&novoCurso); err != nil {
		c.JSON(400, gin.H{"error": "Dados inválidos"})
		return
	}
	database.DB.Create(&novoCurso)
	c.JSON(201, novoCurso)
}

func DeleteCourse(c *gin.Context) {
	id := c.Param("id")
	var count int64
	database.DB.Model(&models.Class{}).Where("course_id = ?", id).Count(&count)
	if count > 0 {
		c.JSON(400, gin.H{"error": "Não é possível excluir: Existem turmas e alunos vinculados a este curso. Exclua as turmas primeiro."})
		return
	}
	if err := database.DB.Unscoped().Delete(&models.Course{}, id).Error; err != nil {
		c.JSON(500, gin.H{"error": "Erro interno ao tentar deletar o curso."})
		return
	}
	c.JSON(200, gin.H{"message": "Curso deletado com sucesso!"})
}

func UpdateCourse(c *gin.Context) {
	id := c.Param("id")
	var cursoExistente models.Course
	if err := database.DB.First(&cursoExistente, id).Error; err != nil {
		c.JSON(404, gin.H{"error": "Curso não encontrado"})
		return
	}
	var dadosNovos models.Course
	if err := c.ShouldBindJSON(&dadosNovos); err != nil {
		c.JSON(400, gin.H{"error": "Dados inválidos"})
		return
	}
	database.DB.Model(&cursoExistente).Updates(dadosNovos)
	c.JSON(200, cursoExistente)
}
