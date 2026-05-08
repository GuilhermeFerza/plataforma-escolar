package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Course struct {
	gorm.Model
	Name        string  `json:"name"`
	Category    string  `json:"category"`
	Duration    string  `json:"duration"`
	MaxStudents int     `json:"max_students"`
	Classes     []Class `json:"classes"`
}

type Class struct {
	gorm.Model
	Name     string    `json:"name"`
	CourseID uint      `json:"course_id"`
	Course   Course    `json:"course" gorm:"foreignKey:CourseID"`
	Students []Student `json:"students" gorm:"foreignKey:ClassID"`
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

	r.GET("/api/stats", func(c *gin.Context) {
		var totalCursos int64
		var totalAlunos int64
		var totalTurmas int64

		DB.Model(&Course{}).Count(&totalCursos)
		DB.Model(&Student{}).Count(&totalAlunos)
		DB.Model(&Class{}).Count(&totalTurmas)

		c.JSON(200, gin.H{
			"total_courses":  totalCursos,
			"total_students": totalAlunos,
			"total_classes":  totalTurmas,
		})
	})

	r.GET("/api/courses", func(c *gin.Context) {
		var courses []Course
		name := c.Query("name")

		// O Preload carrega as turmas, e o Preload das Classes carrega os alunos
		query := DB.Preload("Classes.Students")

		if name != "" {
			query.Where("name ILIKE ?", "%"+name+"%").Find(&courses)
		} else {
			query.Find(&courses)
		}
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
		if err := DB.Unscoped().Delete(&Course{}, id).Error; err != nil {
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
		if err := DB.Unscoped().Delete(&Class{}, id).Error; err != nil {
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

	r.DELETE("/api/students/:id", func(c *gin.Context) {
		id := c.Param("id")
		if err := DB.Unscoped().Delete(&Student{}, id).Error; err != nil {
			c.JSON(500, gin.H{"error": "Erro ao deletar aluno"})
			return
		}
		c.JSON(200, gin.H{"message": "Aluno deletado com sucesso!"})
	})

	r.PUT("/api/students/:id", func(c *gin.Context) {
		id := c.Param("id")
		var alunoExistente Student

		if err := DB.First(&alunoExistente, id).Error; err != nil {
			c.JSON(404, gin.H{"error": "Aluno não encontrado"})
			return
		}

		var dadosNovos Student
		if err := c.ShouldBindJSON(&dadosNovos); err != nil {
			c.JSON(400, gin.H{"error": "Dados inválidos"})
			return
		}

		DB.Model(&alunoExistente).Updates(dadosNovos)

		c.JSON(200, alunoExistente)
	})

	r.Run(":8080")
}
