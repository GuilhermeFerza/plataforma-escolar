package main

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/GuilhermeFerza/plataforma-escolar/controllers"
	"github.com/GuilhermeFerza/plataforma-escolar/database"
	"github.com/GuilhermeFerza/plataforma-escolar/models"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
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
		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			c.JSON(401, gin.H{"error": "Acesso negado. Faça login para continuar."})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			c.JSON(401, gin.H{"error": "Token inválido ou expirado."})
			c.Abort()
			return
		}
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			c.Set("user_role", claims["role"])
		}

		c.Next()
	}
}

func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("user_role")
		if !exists || role != "admin" {
			c.JSON(403, gin.H{"error": "Acesso negado. Operação restrita a administradores."})
			c.Abort()
			return
		}
		c.Next()
	}
}

func main() {
	_ = godotenv.Load()
	secret := os.Getenv("JWT_SECRET")
	if secret != "" {
		jwtSecret = []byte(secret)
	}
	database.ConectarBanco()

	database.DB.AutoMigrate(
		&models.Course{},
		&models.Class{},
		&models.Student{},
		&models.User{},
		&models.Appointment{},
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
			Name:          "Administrador",
			Curso:         "Diretoria",
			Email:         "admin@admin.com",
			Password:      senhaHash,
			Role:          "admin",
		}
		database.DB.Create(&superAdmin)
		fmt.Println("Admin criado com sucesso. Use admin@admin.com / admin123")
	}

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
			"role":    user.Role, // <-- O AdminMiddleware vai ler isso aqui
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
				"name":  user.Name,
				"curso": user.Curso,
			},
		})
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
		protected.GET("/classes", controllers.GetClasses)
		protected.POST("/classes", controllers.CreateClass)
		protected.DELETE("/classes/:id", controllers.DeleteClass)
		protected.PUT("/classes/:id", controllers.UpdateClass)
		protected.GET("/students", controllers.GetStudents)
		protected.POST("/students", controllers.CreateStudent)
		protected.DELETE("/students/:id", controllers.DeleteStudent)
		protected.PUT("/students/:id", controllers.UpdateStudent)
		protected.GET("/appointments", controllers.GetAppointments)
		protected.POST("/appointments", controllers.CreateAppointment)
		protected.DELETE("/appointments/:id", controllers.DeleteAppointment)
	}

	adminOnly := r.Group("/api")
	adminOnly.Use(AuthMiddleware(), AdminMiddleware())
	{
		adminOnly.POST("/courses", controllers.CreateCourse)
		adminOnly.DELETE("/courses/:id", controllers.DeleteCourse)
		adminOnly.PUT("/courses/:id", controllers.UpdateCourse)

		adminOnly.GET("/users", func(c *gin.Context) {
			var users []models.User
			database.DB.Select("id", "funcionario_id", "name", "email", "curso", "role").Find(&users)
			c.JSON(200, users)
		})

		adminOnly.POST("/register", func(c *gin.Context) {
			var user models.User
			if err := c.ShouldBindJSON(&user); err != nil {
				c.JSON(400, gin.H{"error": "Dados inválidos"})
				return
			}
			hashedPassword, _ := HashPassword(user.Password)
			user.Password = hashedPassword

			if err := database.DB.Create(&user).Error; err != nil {
				c.JSON(400, gin.H{"error": "E-mail ou ID de Funcionário já existe"})
				return
			}
			c.JSON(201, gin.H{"message": "Funcionário cadastrado com sucesso!"})
		})

		adminOnly.DELETE("/users/:id", func(c *gin.Context) {
			id := c.Param("id")
			var user models.User
			if err := database.DB.First(&user, id).Error; err != nil {
				c.JSON(404, gin.H{"error": "Usuário não encontrado"})
				return
			}
			if user.FuncionarioID == 1 {
				c.JSON(403, gin.H{"error": "Segurança: Não é possível excluir o Administrador principal."})
				return
			}
			database.DB.Unscoped().Delete(&models.User{}, id)
			c.JSON(200, gin.H{"message": "Funcionário removido com sucesso!"})
		})

		adminOnly.PUT("/users/:id", func(c *gin.Context) {
			id := c.Param("id")
			var user models.User
			if err := database.DB.First(&user, id).Error; err != nil {
				c.JSON(404, gin.H{"error": "Usuário não encontrado"})
				return
			}

			var updatedData models.User
			if err := c.ShouldBindJSON(&updatedData); err != nil {
				c.JSON(400, gin.H{"error": "Dados inválidos"})
				return
			}

			updates := map[string]interface{}{
				"name":           updatedData.Name,
				"email":          updatedData.Email,
				"curso":          updatedData.Curso,
				"funcionario_id": updatedData.FuncionarioID,
			}

			if updatedData.Password != "" {
				hashedPassword, _ := HashPassword(updatedData.Password)
				updates["password"] = hashedPassword
			}

			database.DB.Model(&user).Updates(updates)
			c.JSON(200, gin.H{"message": "Funcionário atualizado com sucesso!"})
		})
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}
	r.Run(":" + port)
}
