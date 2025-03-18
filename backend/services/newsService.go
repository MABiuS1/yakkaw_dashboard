package services

import (
	"errors"
	"time"
	"yakkaw_dashboard/models"

	"gorm.io/gorm"
)

type NewsService struct {
    DB *gorm.DB
}

// NewNewsService creates a new NewsService instance
func NewNewsService(db *gorm.DB) *NewsService {
    return &NewsService{DB: db}
}

// CreateNews creates a new news entry
func (s *NewsService) CreateNews(news models.News) (models.News, error) {
    // ตั้งค่าเวลาปัจจุบันหากไม่มีการระบุ
    if news.Date.IsZero() {
        news.Date = time.Now()
    }

    if err := s.DB.Create(&news).Error; err != nil {
        return models.News{}, err
    }

    // โหลดข้อมูล Category ของข่าวที่สร้างใหม่
    s.DB.Preload("Category").First(&news, news.ID)

    return news, nil
}


// GetAllNews returns all news, optionally with Category
func (s *NewsService) GetAllNews() ([]models.News, error) {
    var news []models.News

    // ✅ โหลด News พร้อม Category (แต่ไม่ให้ preload news อีก)
    if err := s.DB.Preload("Category").Find(&news).Error; err != nil {
        return nil, err
    }

    return news, nil
}

// GetNewsByID fetches a single news record by ID
func (s *NewsService) GetNewsByID(id uint) (models.News, error) {
    var news models.News
    if err := s.DB.First(&news, id).Error; err != nil {
        return models.News{}, err
    }
    return news, nil
}



func (s *NewsService) DeleteNews(id uint) error {
    result := s.DB.Delete(&models.News{}, id)
    if result.RowsAffected == 0 {
        return errors.New("news not found")
    }
    return nil
}