package routes

import (
	"yakkaw_dashboard/controllers"
	"yakkaw_dashboard/database"
	"yakkaw_dashboard/middleware"
	"yakkaw_dashboard/services"

	"github.com/labstack/echo/v4"
)

func Init(e *echo.Echo) {
	// 🔹 Public Authentication Routes
	e.POST("/register", controllers.Register)
	e.POST("/login", controllers.Login)
	e.POST("/logout", controllers.Logout)

	// 🔹 Instantiate services using the database connection
	categoryService := services.NewCategoryService(database.DB)
	newsService := services.NewNewsService(database.DB)

	// 🔹 Create controllers by injecting the corresponding service
	categoryController := controllers.NewCategoryController(categoryService)
	newsController := controllers.NewNewsController(newsService)

	// 🔹 Public Routes for Categories and News (READ only)
	e.GET("/categories", categoryController.GetCategories)
	e.GET("/categories/:id", categoryController.GetCategoryByID)
	e.GET("/news", newsController.GetNews)
	e.GET("/news/:id", newsController.GetNewsByID)

	// 🔹 Protected Admin Routes
	adminGroup := e.Group("/admin")
	adminGroup.Use(middleware.JWTMiddleware) // Protect all admin routes

	// ✅ Admin-only: Manage Categories
	adminGroup.POST("/categories", categoryController.CreateCategory)
	adminGroup.PUT("/categories/:id", categoryController.UpdateCategory)
	adminGroup.DELETE("/categories/:id", categoryController.DeleteCategory)

	// ✅ Admin-only: Manage News
	adminGroup.POST("/news", newsController.CreateNews)
	adminGroup.PUT("/news/:id", newsController.UpdateNews)
	adminGroup.DELETE("/news/:id", newsController.DeleteNews)

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

	// 🔹 Air Quality Data Routes
	airCtl := controllers.NewAirQualityController()
	e.GET("/api/airquality/one_week", airCtl.GetOneWeekDataHandler)
	e.GET("/api/airquality/one_month", airCtl.GetOneMonthDataHandler)
	e.GET("/api/airquality/three_months", airCtl.GetThreeMonthsDataHandler)
	e.GET("/api/airquality/one_year", airCtl.GetOneYearDataHandler)
	e.GET("/api/airquality/province_average", airCtl.GetProvinceAveragePM25Handler)

	// �� Chart Data Route
	chartDataController := controllers.NewChartDataController()
	e.GET("/api/chartdata", chartDataController.GetChartDataHandler)

	// 🔹 Get Latest Air Quality
	e.GET("/api/airquality/latest", controllers.GetLatestAirQuality)
}
