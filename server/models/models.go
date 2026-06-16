package models

import (
	"time"

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
	Name      string    `json:"name"`
	SubjectID uint      `json:"subject_id"`
	Subject   Subject   `json:"subject" gorm:"foreignKey:SubjectID"`
	Students  []Student `json:"students" gorm:"foreignKey:ClassID"`
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
	Name          string `json:"name"`
	Curso         string `json:"curso"`
	Email         string `json:"email" gorm:"unique"`
	Password      string `json:"password"`
	Role          string `json:"role" gorm:"default:'funcionario'"`
}

type Appointment struct {
	gorm.Model
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Date        time.Time `json:"date"`
	Type        string    `json:"type"`
	ClassID     *uint     `json:"class_id"`
	Class       Class     `json:"class" gorm:"foreignKey:ClassID"`
	CreatorID   uint      `json:"creator_id"`
	CreatorName string    `json:"creator_name"`
}

type Subject struct {
	gorm.Model
	Name        string `json:"name"`
	Description string `json:"description"`
	Workload    string `json:"workload"`
	CourseID    uint   `json:"course_id"`
	Course      Course `json:"course" gorm:"foreignKey:CourseID"`
}
