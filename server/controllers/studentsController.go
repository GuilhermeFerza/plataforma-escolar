package controllers

import (
	"github.com/GuilhermeFerza/plataforma-escolar/database"
	"github.com/GuilhermeFerza/plataforma-escolar/models"
	"github.com/gin-gonic/gin"
)

func GetStudents(c *gin.Context) {
	var students []models.Student
	database.DB.Preload("Class.Course").Find(&students)
	c.JSON(200, students)
}

func CreateStudent(c *gin.Context) {
	var novoAluno models.Student
	if err := c.ShouldBindJSON(&novoAluno); err != nil {
		c.JSON(400, gin.H{"error": "Dados inválidos"})
		return
	}

	var turmaDesejada models.Class
	if err := database.DB.Preload("Subject").First(&turmaDesejada, novoAluno.ClassID).Error; err != nil {
		c.JSON(404, gin.H{"error": "Turma nao encontrada"})
		return
	}
	cursoDesejadoID := turmaDesejada.Subject.CourseID

	var matriculasExistentes []models.Student
	database.DB.Preload("Class.Subject").Where("cpf = ?", novoAluno.CPF).Find(&matriculasExistentes)

	for _, matricula := range matriculasExistentes {
		if matricula.Class.Subject.CourseID == cursoDesejadoID {
			c.JSON(400, gin.H{"error": "este aluno ja possui uma matricula ativa neste curso!"})
			return
		}
	}

	database.DB.Create(&novoAluno)
	c.JSON(201, novoAluno)
}

func DeleteStudent(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Unscoped().Delete(&models.Student{}, id).Error; err != nil {
		c.JSON(500, gin.H{"error": "Erro ao deletar aluno"})
		return
	}
	c.JSON(200, gin.H{"message": "Aluno deletado com sucesso!"})
}

func UpdateStudent(c *gin.Context) {
	id := c.Param("id")
	var alunoExistente models.Student
	if err := database.DB.First(&alunoExistente, id).Error; err != nil {
		c.JSON(404, gin.H{"error": "Aluno não encontrado"})
		return
	}
	var dadosNovos models.Student
	if err := c.ShouldBindJSON(&dadosNovos); err != nil {
		c.JSON(400, gin.H{"error": "Dados inválidos"})
		return
	}
	database.DB.Model(&alunoExistente).Updates(dadosNovos)
	c.JSON(200, alunoExistente)
}
