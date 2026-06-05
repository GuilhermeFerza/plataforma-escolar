package database

import (
	"fmt"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConectarBanco() {

	dsn := os.Getenv("DB_DSN")

	if dsn == "" {
		dsn = "host=localhost user=admin password=123 dbname=techadvance port=5434 sslmode=disable"
	}

	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		panic("Falha ao conectar no banco de dados!")
	}

	fmt.Println("Conectado ao banco com sucesso!")
	DB = database
}
