package models

import "time"

// SupportContact keeps localized contact information for the support/help center.
type SupportContact struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Lang         string    `gorm:"type:varchar(2);uniqueIndex" json:"lang"`
	Email        string    `gorm:"type:varchar(255)" json:"email"`
	Phone        string    `gorm:"type:varchar(100)" json:"phone"`
	Address      string    `gorm:"type:text" json:"address,omitempty"`
	Line         string    `gorm:"type:varchar(255)" json:"line,omitempty"`
	Facebook     string    `gorm:"type:varchar(255)" json:"facebook,omitempty"`
	SupportHours string    `gorm:"type:text" json:"supportHours,omitempty"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}
