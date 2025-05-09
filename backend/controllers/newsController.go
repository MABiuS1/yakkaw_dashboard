package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	"yakkaw_dashboard/models"
	"yakkaw_dashboard/services"
)

type NewsController struct {
	Service *services.NewsService
}

// NewNewsController เป็น constructor สำหรับ NewsController
func NewNewsController(s *services.NewsService) *NewsController {
	return &NewsController{Service: s}
}

// CreateNews (ADMIN ONLY) สำหรับสร้าง News ใหม่
func (nc *NewsController) CreateNews(c echo.Context) error {
	var news models.News
	if err := c.Bind(&news); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	// กำหนดค่าเวลาปัจจุบันหากไม่ได้ระบุวัน
	if news.Date.IsZero() {
		news.Date = time.Now()
	}
	createdNews, err := nc.Service.CreateNews(news)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, createdNews)
}

// GetNews (PUBLIC) สำหรับดึงข่าวทั้งหมด
func (nc *NewsController) GetNews(c echo.Context) error {
    newsList, err := nc.Service.GetAllNews()
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    return c.JSON(http.StatusOK, newsList)
}



// GetNewsByID สำหรับดึงข่าวตาม ID
func (nc *NewsController) GetNewsByID(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid news id"})
	}
	newsItem, err := nc.Service.GetNewsByID(uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "news not found"})
	}
	return c.JSON(http.StatusOK, newsItem)
}

func (cc *NewsController) DeleteNews(c echo.Context) error {
    id, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid news id"})
    }

    err = cc.Service.DeleteNews(uint(id))
    if err != nil {
        return c.JSON(http.StatusNotFound, map[string]string{"message": "Not Found"})
    }

    return c.JSON(http.StatusOK, map[string]string{"message": "News deleted successfully"})
}

// UpdateNews (ADMIN ONLY) สำหรับอัปเดตข้อมูลข่าว
func (nc *NewsController) UpdateNews(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid news id"})
	}

	var newsUpdate models.News
	if err := c.Bind(&newsUpdate); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	// อัปเดตข่าว
	updatedNews, err := nc.Service.UpdateNews(uint(id), newsUpdate)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, updatedNews)
}
