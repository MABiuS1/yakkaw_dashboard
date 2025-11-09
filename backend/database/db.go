package database

import (
	"fmt"
	"log"
	"os"

	"yakkaw_dashboard/models"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB
var err error

// Init initializes the database connection using environment variables
func Init() {
	// Load .env file if present, but continue when running with injected env vars
	if err := godotenv.Load(); err != nil {
		log.Println("no .env file found, relying on environment variables")
	}

	// Get database connection details from environment variables
	dbHost := os.Getenv("DB_HOST")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbPort := os.Getenv("DB_PORT")

	// Build the connection string
	dsn := fmt.Sprintf("host=%s user=%s dbname=%s password=%s port=%s sslmode=disable", dbHost, dbUser, dbName, dbPassword, dbPort)

	// Connect to the database
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	DB.AutoMigrate(&models.Notification{}, &models.User{}, &models.Sponsor{}, &models.SensorData{}, &models.APIResponse{}, &models.ChartData{}, models.DatasetChart{}, &models.Category{}, &models.News{}, &models.Device{}, &models.ColorRange{})
	ensureIndexes(DB)

	fmt.Println("Database connection successfully established and migrations applied")
}

func ensureIndexes(db *gorm.DB) {
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_sensor_data_timestamp ON sensor_data (timestamp)").Error; err != nil {
		log.Printf("failed to create idx_sensor_data_timestamp: %v", err)
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_sensor_data_address ON sensor_data (address)").Error; err != nil {
		log.Printf("failed to create idx_sensor_data_address: %v", err)
	}
}
