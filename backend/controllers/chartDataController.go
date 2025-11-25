package controllers

import (
	"net/http"
	"strconv"
	"time"

	"yakkaw_dashboard/services"

	"github.com/labstack/echo/v4"
)

type ChartDataController struct{}

func NewChartDataController() *ChartDataController {
	return &ChartDataController{}
}

func (ctl *ChartDataController) GetChartDataHandler(c echo.Context) error {
	rangeType := c.QueryParam("range")
	if rangeType == "" {
		rangeType = "24 Hour" // ค่า default
	}
	// รับค่า province จาก query parameter
	province := c.QueryParam("province")
	metric := c.QueryParam("metric")
	if metric == "" {
		metric = "pm25"
	}

	chartData, err := services.GetChartData(rangeType, province, metric)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, chartData)
}

// GetTodayChartDataHandler ดึงข้อมูล chart ของวันนี้ (ตั้งแต่เที่ยงคืนถึงเวลาปัจจุบัน)
func (ctl *ChartDataController) GetTodayChartDataHandler(c echo.Context) error {
	// รับค่า province จาก query parameter
	province := c.QueryParam("province")
	metric := c.QueryParam("metric")
	if metric == "" {
		metric = "pm25"
	}

	chartData, err := services.GetChartData("Today", province, metric)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, chartData)
}

// GetHeatmapOneYearHandler returns daily PM2.5 averages for the last 12 months for a given province
func (ctl *ChartDataController) GetHeatmapOneYearHandler(c echo.Context) error {
	province := c.QueryParam("province")
	if province == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "province is required"})
	}
	metric := c.QueryParam("metric")
	if metric == "" {
		metric = "pm25"
	}

	chartData, err := services.GetHeatmapOneYearDaily(province, metric)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, chartData)
}

// GetDailyRankingHandler returns daily ranking grouped by address/place/province
func (ctl *ChartDataController) GetDailyRankingHandler(c echo.Context) error {
	metric := c.QueryParam("metric")
	if metric == "" {
		metric = "pm25"
	}

	group := c.QueryParam("group")
	if group == "" {
		group = "address"
	}

	dateStr := c.QueryParam("date")
	if dateStr == "" {
		dateStr = time.Now().In(time.FixedZone("Asia/Bangkok", 7*3600)).Format("2006-01-02")
	}

	limit := 10
	if ls := c.QueryParam("limit"); ls != "" {
		if v, err := strconv.Atoi(ls); err == nil {
			if v < 1 {
				v = 1
			}
			if v > 100 {
				v = 100
			}
			limit = v
		}
	}

	ranking, err := services.GetDailyRankingGrouped(dateStr, metric, group, limit)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, ranking)
}
