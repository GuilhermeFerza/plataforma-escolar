package main

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var jwtSecret = []byte("123123")

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

type User struct {
	gorm.Model
	FuncionarioID uint   `json:"funcionario_id" gorm:"unique"`
	Email         string `json:"email" gorm:"unique"`
	Password      string `json:"password"`
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")

		if tokenString == "" {
			c.JSON(401, gin.H{"error": "Acesso negado. Faça login para continuar."})
			c.Abort()
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			c.JSON(401, gin.H{"error": "Token inválido ou expirado."})
			c.Abort()
			return
		}

		c.Next()
	}
}

func main() {
	ConectarBanco()
	DB.AutoMigrate(&Course{}, &Class{}, &Student{}, &User{})

	r := gin.Default()
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	r.Use(cors.New(config))

	r.GET("/api/login", func(c *gin.Context) {
		var users []User
		DB.Find(&users)
		c.JSON(200, users)
	})

	r.POST("/api/login", func(c *gin.Context) {
		var input struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(400, gin.H{"error": "Dados inválidos"})
			return
		}

		var user User
		if err := DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
			c.JSON(401, gin.H{"error": "Usuário ou senha incorretos"})
			return
		}

		if !CheckPasswordHash(input.Password, user.Password) {
			c.JSON(401, gin.H{"error": "Usuário ou senha incorretos"})
			return
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"user_id": user.ID,
			"exp":     time.Now().Add(time.Hour * 24).Unix(),
		})

		tokenString, err := token.SignedString(jwtSecret)
		if err != nil {
			c.JSON(500, gin.H{"error": "Erro ao gerar token"})
			return
		}

		c.JSON(200, gin.H{
			"token": tokenString,
			"user": gin.H{
				"email": user.Email,
				"id":    user.FuncionarioID,
			},
		})
	})

	r.POST("/api/register", func(c *gin.Context) {
		var user User
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(400, gin.H{"error": "Dados inválidos"})
			return
		}

		hashedPassword, err := HashPassword(user.Password)
		if err != nil {
			c.JSON(500, gin.H{"error": "Erro ao processar senha"})
			return
		}
		user.Password = hashedPassword

		if err := DB.Create(&user).Error; err != nil {
			c.JSON(400, gin.H{"error": "E-mail ou ID de Funcionário já existe"})
			return
		}

		c.JSON(201, gin.H{"message": "Funcionário cadastrado com sucesso!"})
	})
	protected := r.Group("/api")
	protected.Use(AuthMiddleware())
	{
		// Stats
		protected.GET("/stats", func(c *gin.Context) {
			var totalCursos, totalAlunos, totalTurmas int64
			DB.Model(&Course{}).Count(&totalCursos)
			DB.Model(&Student{}).Count(&totalAlunos)
			DB.Model(&Class{}).Count(&totalTurmas)

			c.JSON(200, gin.H{
				"total_courses":  totalCursos,
				"total_students": totalAlunos,
				"total_classes":  totalTurmas,
			})
		})

		// Cursos
		protected.GET("/courses", func(c *gin.Context) {
			var courses []Course
			name := c.Query("name")
			query := DB.Preload("Classes.Students")
			if name != "" {
				query.Where("name ILIKE ?", "%"+name+"%").Find(&courses)
			} else {
				query.Find(&courses)
			}
			c.JSON(200, courses)
		})
		protected.POST("/courses", func(c *gin.Context) {
			var novoCurso Course
			if err := c.ShouldBindJSON(&novoCurso); err != nil {
				c.JSON(400, gin.H{"error": "Dados inválidos"})
				return
			}
			DB.Create(&novoCurso)
			c.JSON(201, novoCurso)
		})
		protected.DELETE("/courses/:id", func(c *gin.Context) {
			id := c.Param("id")
			if err := DB.Unscoped().Delete(&Course{}, id).Error; err != nil {
				c.JSON(500, gin.H{"error": "Erro ao deletar curso"})
				return
			}
			c.JSON(200, gin.H{"message": "Curso deletado com sucesso!"})
		})
		protected.PUT("/courses/:id", func(c *gin.Context) {
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

		// Turmas
		protected.GET("/classes", func(c *gin.Context) {
			var classes []Class
			DB.Preload("Course").Find(&classes)
			c.JSON(200, classes)
		})
		protected.POST("/classes", func(c *gin.Context) {
			var novaTurma Class
			if err := c.ShouldBindJSON(&novaTurma); err != nil {
				c.JSON(400, gin.H{"error": "Dados inválidos"})
				return
			}
			DB.Create(&novaTurma)
			c.JSON(201, novaTurma)
		})
		protected.DELETE("/classes/:id", func(c *gin.Context) {
			id := c.Param("id")
			if err := DB.Unscoped().Delete(&Class{}, id).Error; err != nil {
				c.JSON(500, gin.H{"error": "Erro ao deletar turma"})
				return
			}
			c.JSON(200, gin.H{"message": "Turma deletada com sucesso!"})
		})
		protected.PUT("/classes/:id", func(c *gin.Context) {
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

		// Alunos
		protected.GET("/students", func(c *gin.Context) {
			var students []Student
			DB.Preload("Class.Course").Find(&students)
			c.JSON(200, students)
		})
		protected.POST("/students", func(c *gin.Context) {
			var novoAluno Student
			if err := c.ShouldBindJSON(&novoAluno); err != nil {
				c.JSON(400, gin.H{"error": "Dados inválidos"})
				return
			}
			DB.Create(&novoAluno)
			c.JSON(201, novoAluno)
		})
		protected.DELETE("/students/:id", func(c *gin.Context) {
			id := c.Param("id")
			if err := DB.Unscoped().Delete(&Student{}, id).Error; err != nil {
				c.JSON(500, gin.H{"error": "Erro ao deletar aluno"})
				return
			}
			c.JSON(200, gin.H{"message": "Aluno deletado com sucesso!"})
		})
		protected.PUT("/students/:id", func(c *gin.Context) {
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
	}

	r.Run(":8081")
}
