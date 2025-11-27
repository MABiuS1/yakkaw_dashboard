package config

import (
	"log"
	"os"
	"strings"
	"sync"
)

var (
	jwtSecret     []byte
	jwtSecretOnce sync.Once
)

// JWTSecret returns the signing secret for JWTs.
// It prefers the JWT_SECRET env var, then APP_SECRET, and finally falls back
// to a dev-only default while logging a warning.
func JWTSecret() []byte {
	jwtSecretOnce.Do(func() {
		secret := strings.TrimSpace(os.Getenv("JWT_SECRET"))
		if secret == "" {
			secret = strings.TrimSpace(os.Getenv("APP_SECRET"))
		}
		if secret == "" {
			secret = "dev-insecure-jwt-secret"
			log.Println("warning: JWT_SECRET not set; using fallback secret (dev only)")
		}
		jwtSecret = []byte(secret)
	})
	return jwtSecret
}
