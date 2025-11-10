package database

import (
	"fmt"
	"log"
	"net/url"
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

	dsn, buildErr := resolveDSN()
	if buildErr != nil {
		log.Fatalf("invalid database configuration: %v", buildErr)
	}

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

func resolveDSN() (string, error) {
	if dbURL := os.Getenv("DATABASE_PUBLIC_URL"); dbURL != "" {
		return normalizeDatabaseURL(dbURL)
	}

	// Fallback to individual variables for local development / legacy setups.
	dbHost := os.Getenv("DB_HOST")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbPort := os.Getenv("DB_PORT")

	return fmt.Sprintf("host=%s user=%s dbname=%s password=%s port=%s sslmode=disable",
		dbHost, dbUser, dbName, dbPassword, dbPort), nil
}

func normalizeDatabaseURL(rawURL string) (string, error) {
	parsedURL, err := url.Parse(rawURL)
	if err != nil {
		return "", err
	}

	if parsedURL.Scheme == "" {
		parsedURL.Scheme = "postgres"
	}
	if parsedURL.Scheme != "postgres" && parsedURL.Scheme != "postgresql" {
		return "", fmt.Errorf("unsupported database scheme %q", parsedURL.Scheme)
	}

	query := parsedURL.Query()
	if query.Get("sslmode") == "" {
		query.Set("sslmode", "disable")
	}
	parsedURL.RawQuery = query.Encode()

	return parsedURL.String(), nil
}
