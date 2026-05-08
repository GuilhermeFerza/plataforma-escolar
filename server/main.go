package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Course struct {
	gorm.Model
	Name        string `json:"name"`
	Category    string `json:"category"`
	Duration    string `json:"duration"`
	Students    int    `json:"students"`
	MaxStudents int    `json:"max_students"`
}

type Class struct {
	gorm.Model
	Name     string `json:"name"`
	CourseID uint   `json:"course_id"`
	Course   Course `json:"course" gorm:"foreignKey:CourseID"`
}

type Student struct {
	gorm.Model
	Name    string `json:"name"`
	Email   string `json:"email"`
	CPF     string `json:"cpf" gorm:"unique"`
	ClassID uint   `json:"class_id"`
	Class   Class  `json:"class" gorm:"foreignKey:ClassID"`
}

func main() {
	ConectarBanco()
	DB.AutoMigrate(&Course{}, &Class{}, &Student{})

	r := gin.Default()
	r.Use(cors.Default())

	r.GET("/api/courses", func(c *gin.Context) {
		var courses []Course
		DB.Find(&courses)
		c.JSON(200, courses)
	})

	r.POST("/api/courses", func(c *gin.Context) {
		var novoCurso Course
		if err := c.ShouldBindJSON(&novoCurso); err != nil {
			c.JSON(400, gin.H{"error": "Dados inválidos"})
			return
		}
		DB.Create(&novoCurso)
		c.JSON(201, novoCurso)
	})

	r.DELETE("/api/courses/:id", func(c *gin.Context) {
		id := c.Param("id")
		if err := DB.Delete(&Course{}, id).Error; err != nil {
			c.JSON(500, gin.H{"error": "Erro ao deletar curso"})
			return
		}
		c.JSON(200, gin.H{"message": "Curso deletado com sucesso!"})
	})

	r.PUT("/api/courses/:id", func(c *gin.Context) {
		id := c.Param("id")
		var cursoExistente Course

		if err := DB.First(&cursoExistente, id).Error; err != nil {
			c.JSON(404, gin.H{"error": "Curso não encontrado"})
			return
		}

		var dadosNovos Course
		if err := c.ShouldBindJSON(&dadosNovos); err != nil {
			c.JSON(400, gin.H{"error": "Dados inválidos"})
			return
		}

		DB.Model(&cursoExistente).Updates(dadosNovos)

		c.JSON(200, cursoExistente)
	})

	r.GET("/api/classes", func(c *gin.Context) {
		var classes []Class
		DB.Preload("Course").Find(&classes)
		c.JSON(200, classes)
	})

	r.POST("/api/classes", func(c *gin.Context) {
		var novaTurma Class
		if err := c.ShouldBindJSON(&novaTurma); err != nil {
			c.JSON(400, gin.H{"error": "Dados inválidos"})
			return
		}
		DB.Create(&novaTurma)
		c.JSON(201, novaTurma)
	})

	r.DELETE("/api/classes/:id", func(c *gin.Context) {
		id := c.Param("id")
		if err := DB.Delete(&Class{}, id).Error; err != nil {
			c.JSON(500, gin.H{"error": "Erro ao deletar turma"})
			return
		}
		c.JSON(200, gin.H{"message": "Turma deletada com sucesso!"})
	})

	r.PUT("/api/classes/:id", func(c *gin.Context) {
		id := c.Param("id")
		var turmaExistente Class

		if err := DB.First(&turmaExistente, id).Error; err != nil {
			c.JSON(404, gin.H{"error": "Turma não encontrada"})
			return
		}

		var dadosNovos Class
		if err := c.ShouldBindJSON(&dadosNovos); err != nil {
			c.JSON(400, gin.H{"error": "Dados inválidos"})
			return
		}

		DB.Model(&turmaExistente).Updates(dadosNovos)

		c.JSON(200, turmaExistente)
	})

	r.GET("/api/students", func(c *gin.Context) {
		var students []Student
		DB.Preload("Class.Course").Find(&students)
		c.JSON(200, students)
	})

	r.POST("/api/students", func(c *gin.Context) {
		var novoAluno Student
		if err := c.ShouldBindJSON(&novoAluno); err != nil {
			c.JSON(400, gin.H{"error": "Dados inválidos"})
			return
		}
		DB.Create(&novoAluno)
		c.JSON(201, novoAluno)
	})

	r.Run(":8080")
}
