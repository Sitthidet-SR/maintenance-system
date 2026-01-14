package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	// Server
	ServerPort string
	ServerHost string

	// Database
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string

	// Redis
	RedisHost     string
	RedisPort     string
	RedisPassword string

	// JWT
	JWTSecret        string
	JWTExpireMinutes int
	JWTRefreshDays   int

	// CORS
	AllowedOrigins []string

	// Upload
	MaxUploadSize int64
	UploadDir     string

	// SMTP
	SMTPHost     string
	SMTPPort     int
	SMTPUser     string
	SMTPPassword string
	SMTPFrom     string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	return &Config{
		// Server
		ServerPort: getEnv("SERVER_PORT", "8080"),
		ServerHost: getEnv("SERVER_HOST", "0.0.0.0"),

		// Database
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "postgres"),
		DBPassword: getEnv("DB_PASSWORD", "postgres"),
		DBName:     getEnv("DB_NAME", "maintenance"),
		DBSSLMode:  getEnv("DB_SSLMODE", "disable"),

		// Redis
		RedisHost:     getEnv("REDIS_HOST", "localhost"),
		RedisPort:     getEnv("REDIS_PORT", "6379"),
		RedisPassword: getEnv("REDIS_PASSWORD", ""),

		// JWT
		JWTSecret:        getEnv("JWT_SECRET", "your-super-secret-key-change-in-production"),
		JWTExpireMinutes: getEnvAsInt("JWT_EXPIRE_MINUTES", 15),
		JWTRefreshDays:   getEnvAsInt("JWT_REFRESH_DAYS", 7),

		// CORS
		AllowedOrigins: []string{
			"http://localhost:3000",
			"http://127.0.0.1:3000",
		},

		// Upload
		MaxUploadSize: 10 * 1024 * 1024, // 10MB
		UploadDir:     getEnv("UPLOAD_DIR", "./uploads"),

		// SMTP
		SMTPHost:     getEnv("SMTP_HOST", ""),
		SMTPPort:     getEnvAsInt("SMTP_PORT", 587),
		SMTPUser:     getEnv("SMTP_USER", ""),
		SMTPPassword: getEnv("SMTP_PASSWORD", ""),
		SMTPFrom:     getEnv("SMTP_FROM", "noreply@maintenance-system.local"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}
