package routes

import (
	"yakkaw_dashboard/controllers"
	"yakkaw_dashboard/database"
	"yakkaw_dashboard/middleware"
	"yakkaw_dashboard/services"

	"github.com/labstack/echo/v4"
)

func Init(e *echo.Echo) {

	ctrl := new(controllers.ColorRangeController)

	e.GET("/colorranges", ctrl.GetAll)
	e.GET("/colorranges/:id", ctrl.GetByID)

	// Devices (READ public, WRITE admin)

	// Admin-only: Manage Devices & ColorRanges
	// adminGroup := e.Group("/admin")
	// adminGroup.Use(middleware.JWTMiddleware)

	//Devices
	e.GET("/devices", controllers.GetAllDevices)
	e.GET("/devices/:dvid", controllers.GetDevice)

	// 🔹 Public Authentication Routes
	e.POST("/register", controllers.Register)
	e.POST("/login", controllers.Login)
	e.POST("/logout", controllers.Logout)

	// 🔹 Instantiate services using the database connection
	categoryService := services.NewCategoryService(database.DB)
	newsService := services.NewNewsService(database.DB)
	supportService := services.NewSupportService(database.DB)

	// 🔹 Create controllers by injecting the corresponding service
	categoryController := controllers.NewCategoryController(categoryService)
	newsController := controllers.NewNewsController(newsService)
	supportController := controllers.NewSupportController(supportService)

	// 🔹 Public Routes for Categories and News (READ only)
	e.GET("/categories", categoryController.GetCategories)
	e.GET("/categories/:id", categoryController.GetCategoryByID)
	e.GET("/news", newsController.GetNews)
	e.GET("/news/:id", newsController.GetNewsByID)
	e.GET("/api/support/contact", supportController.GetSupportContact)
	e.GET("/api/support/faqs", supportController.GetSupportFAQs)

	// 🔹 Protected Admin Routes
	adminGroup := e.Group("/admin")
	adminGroup.Use(middleware.JWTMiddleware) // Protect all admin routes

	adminGroup.POST("/qr/generate", controllers.GenerateQRLogin)
	adminGroup.POST("/devices", controllers.CreateDevice)
	adminGroup.PUT("/devices/:dvid", controllers.UpdateDevice)
	adminGroup.DELETE("/devices/:id", controllers.DeleteDevice)

	adminGroup.POST("/colorranges", ctrl.Create)
	adminGroup.PUT("/colorranges/:id", ctrl.Update)
	adminGroup.DELETE("/colorranges/:id", ctrl.Delete)

	// ✅ Admin-only: Manage Categories
	adminGroup.POST("/categories", categoryController.CreateCategory)
	adminGroup.PUT("/categories/:id", categoryController.UpdateCategory)
	adminGroup.DELETE("/categories/:id", categoryController.DeleteCategory)

	// ✅ Admin-only: Manage News
	adminGroup.POST("/news", newsController.CreateNews)
	adminGroup.PUT("/news/:id", newsController.UpdateNews)
	adminGroup.DELETE("/news/:id", newsController.DeleteNews)

	// ✅ Admin-only: Manage Support Content
	supportAdminGroup := adminGroup.Group("/support")
	supportAdminGroup.GET("/contact", supportController.AdminListContacts)
	supportAdminGroup.PUT("/contact/:lang", supportController.AdminUpdateContact)
	supportAdminGroup.GET("/faqs", supportController.AdminListFAQs)
	supportAdminGroup.POST("/faqs", supportController.AdminCreateFAQ)
	supportAdminGroup.PUT("/faqs/:id", supportController.AdminUpdateFAQ)
	supportAdminGroup.DELETE("/faqs/:id", supportController.AdminDeleteFAQ)

	// ✅ Admin-only: Manage Dashboard & Notifications
	adminGroup.GET("/dashboard", controllers.AdminDashboard)
	adminGroup.POST("/notifications", controllers.CreateNotification)
	adminGroup.PUT("/notifications/:id", controllers.UpdateNotification)
	adminGroup.DELETE("/notifications/:id", controllers.DeleteNotification)

	// 🔹 Sponsor Management (Admin Only)
	sponsorGroup := e.Group("/admin/sponsors")
	sponsorGroup.Use(middleware.JWTMiddleware)
	sponsorGroup.POST("", controllers.CreateSponsor)
	sponsorGroup.PUT("/:id", controllers.UpdateSponsor)
	sponsorGroup.DELETE("/:id", controllers.DeleteSponsor)

	// 🔹 Public Routes for Sponsors and Notifications
	e.GET("/sponsors", controllers.GetSponsors)
	e.GET("/notifications", controllers.GetNotifications)
	e.GET("/me", controllers.Me)

	e.GET("/qr/consume", controllers.ConsumeQRLogin)

	// 🔹 Air Quality Data Routes
	airCtl := controllers.NewAirQualityController()
	e.GET("/api/airquality/one_day", airCtl.GetOneDayDataHandler)
	e.GET("/api/airquality/one_week", airCtl.GetOneWeekDataHandler)
	e.GET("/api/airquality/one_month", airCtl.GetOneMonthDataHandler)
	e.GET("/api/airquality/three_months", airCtl.GetThreeMonthsDataHandler)
	e.GET("/api/airquality/one_year", airCtl.GetOneYearDataHandler)
	e.GET("/api/airquality/one_year_series", controllers.GetAirQualityOneYearSeriesByAddress)
	e.GET("/api/airquality/one_year_series_by_province", controllers.GetAirQualityOneYearSeriesByProvince)
	e.GET("/api/airquality/province_average", airCtl.GetProvinceAveragePM25Handler)
	e.GET("/api/airquality/sensor_data/week", airCtl.GetSensorData7DaysHandler)

	// 🔹 Chart Data Route
	chartDataController := controllers.NewChartDataController()
	e.GET("/api/chartdata", chartDataController.GetChartDataHandler)
	e.GET("/api/chartdata/today", chartDataController.GetTodayChartDataHandler)
	e.GET("/api/chartdata/heatmap_one_year", chartDataController.GetHeatmapOneYearHandler)
	e.GET("/chart/data", chartDataController.GetChartDataHandler)
	e.GET("/chart/today", chartDataController.GetTodayChartDataHandler)
	e.GET("/chart/heatmap/year", chartDataController.GetHeatmapOneYearHandler)
	e.GET("/chart/ranking/daily", chartDataController.GetDailyRankingHandler)

	// 🔹 Get Latest Air Quality
	e.GET("/api/airquality/latest", controllers.GetLatestAirQuality)
}
