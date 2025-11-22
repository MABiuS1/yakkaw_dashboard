package services

import (
	"errors"
	"yakkaw_dashboard/models"

	"gorm.io/gorm"
)

type SupportService struct {
	DB *gorm.DB
}

func NewSupportService(db *gorm.DB) *SupportService {
	return &SupportService{DB: db}
}

func (s *SupportService) GetContactByLang(lang string) (*models.SupportContact, error) {
	var contact models.SupportContact
	if err := s.DB.Where("lang = ?", lang).First(&contact).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &contact, nil
}

func (s *SupportService) UpsertContact(contact models.SupportContact) (models.SupportContact, error) {
	var existing models.SupportContact
	if err := s.DB.Where("lang = ?", contact.Lang).First(&existing).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			if err := s.DB.Create(&contact).Error; err != nil {
				return models.SupportContact{}, err
			}
			return contact, nil
		}
		return models.SupportContact{}, err
	}

	existing.Email = contact.Email
	existing.Phone = contact.Phone
	existing.Address = contact.Address
	existing.Line = contact.Line
	existing.Facebook = contact.Facebook
	existing.SupportHours = contact.SupportHours

	if err := s.DB.Save(&existing).Error; err != nil {
		return models.SupportContact{}, err
	}

	return existing, nil
}

func (s *SupportService) ListAllContacts() ([]models.SupportContact, error) {
	var contacts []models.SupportContact
	if err := s.DB.Order("lang ASC").Find(&contacts).Error; err != nil {
		return nil, err
	}
	return contacts, nil
}

func (s *SupportService) ListFAQsByLang(lang string) ([]models.SupportFAQ, error) {
	var faqs []models.SupportFAQ
	query := s.DB.Order("display_order ASC").Order("id ASC")
	if lang != "" {
		query = query.Where("lang = ?", lang)
	}
	if err := query.Find(&faqs).Error; err != nil {
		return nil, err
	}
	return faqs, nil
}

func (s *SupportService) CreateFAQ(faq *models.SupportFAQ) error {
	if faq.DisplayOrder == 0 {
		nextOrder, err := s.nextOrderForLang(faq.Lang)
		if err != nil {
			return err
		}
		faq.DisplayOrder = nextOrder
	}
	return s.DB.Create(faq).Error
}

func (s *SupportService) UpdateFAQ(id uint, payload models.SupportFAQ, updateOrder bool) (models.SupportFAQ, error) {
	var existing models.SupportFAQ
	if err := s.DB.First(&existing, id).Error; err != nil {
		return models.SupportFAQ{}, err
	}

	if payload.Lang != "" {
		existing.Lang = payload.Lang
	}
	existing.Question = payload.Question
	existing.Answer = payload.Answer
	if updateOrder {
		order := payload.DisplayOrder
		if order == 0 {
			next, err := s.nextOrderForLang(existing.Lang)
			if err != nil {
				return models.SupportFAQ{}, err
			}
			order = next
		}
		existing.DisplayOrder = order
	}

	if err := s.DB.Save(&existing).Error; err != nil {
		return models.SupportFAQ{}, err
	}
	return existing, nil
}

func (s *SupportService) DeleteFAQ(id uint) error {
	result := s.DB.Delete(&models.SupportFAQ{}, id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (s *SupportService) nextOrderForLang(lang string) (int, error) {
	var last models.SupportFAQ
	if err := s.DB.Where("lang = ?", lang).
		Order("display_order DESC").
		Limit(1).
		First(&last).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return 1, nil
		}
		return 0, err
	}
	return last.DisplayOrder + 1, nil
}
