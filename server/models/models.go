package models

import "gorm.io/gorm"

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
	Role          string `json:"role" gorm:"default:'funcionario'"`
}
