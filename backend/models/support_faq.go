package models

import "time"

// SupportFAQ keeps localized FAQ entries with display order.
type SupportFAQ struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Lang         string    `gorm:"type:varchar(2);index" json:"lang"`
	Question     string    `gorm:"type:text" json:"question"`
	Answer       string    `gorm:"type:text" json:"answer"`
	DisplayOrder int       `gorm:"default:0" json:"order"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}
