package main

import (
	"fmt"
	"time"

	"github.com/GuilhermeFerza/plataforma-escolar/controllers"
	"github.com/GuilhermeFerza/plataforma-escolar/database"
	"github.com/GuilhermeFerza/plataforma-escolar/models"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = []byte("123123")

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
	database.ConectarBanco()

	database.DB.AutoMigrate(
		&models.Course{},
		&models.Class{},
		&models.Student{},
		&models.User{},
	)

	r := gin.Default()
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	r.Use(cors.New(config))

	var count int64
	database.DB.Model(&models.User{}).Count(&count)

	if count == 0 {
		senhaHash, _ := HashPassword("admin123")
		superAdmin := models.User{
			FuncionarioID: 1,
			Email:         "admin@admin.com",
			Password:      senhaHash,
			Role:          "admin",
		}
		database.DB.Create(&superAdmin)
		fmt.Println("Admin criado com sucesso. Use admin@admin.com / admin123")
	}

	r.GET("/api/login", func(c *gin.Context) {
		var users []models.User
		database.DB.Find(&users)
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

		var user models.User
		if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
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
				"role":  user.Role,
			},
		})
	})

	r.POST("/api/register", func(c *gin.Context) {
		var user models.User
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

		if err := database.DB.Create(&user).Error; err != nil {
			c.JSON(400, gin.H{"error": "E-mail ou ID de Funcionário já existe"})
			return
		}

		c.JSON(201, gin.H{"message": "Funcionário cadastrado com sucesso!"})
	})

	protected := r.Group("/api")
	protected.Use(AuthMiddleware())
	{
		protected.GET("/stats", func(c *gin.Context) {
			var totalCursos, totalAlunos, totalTurmas int64
			database.DB.Model(&models.Course{}).Count(&totalCursos)
			database.DB.Model(&models.Student{}).Count(&totalAlunos)
			database.DB.Model(&models.Class{}).Count(&totalTurmas)

			c.JSON(200, gin.H{
				"total_courses":  totalCursos,
				"total_students": totalAlunos,
				"total_classes":  totalTurmas,
			})
		})

		protected.GET("/courses", controllers.GetCourses)
		protected.POST("/courses", controllers.CreateCourse)
		protected.DELETE("/courses/:id", controllers.DeleteCourse)
		protected.PUT("/courses/:id", controllers.UpdateCourse)

		protected.GET("/classes", controllers.GetClasses)
		protected.POST("/classes", controllers.CreateClass)
		protected.DELETE("/classes/:id", controllers.DeleteClass)
		protected.PUT("/classes/:id", controllers.UpdateClass)

		protected.GET("/students", controllers.GetStudents)
		protected.POST("/students", controllers.CreateStudent)
		protected.DELETE("/students/:id", controllers.DeleteStudent)
		protected.PUT("/students/:id", controllers.UpdateStudent)
	}

	r.Run(":8081")
}
