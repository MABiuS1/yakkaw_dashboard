package services

import (
	"github.com/dgrijalva/jwt-go"
	"time"
	"yakkaw_dashboard/config"
	"yakkaw_dashboard/models"
)

func GenerateJWT(user models.User) (string, error) {
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)
	claims["username"] = user.Username
	claims["role"] = user.Role
	claims["exp"] = time.Now().Add(time.Hour * 72).Unix()

	tokenString, err := token.SignedString(config.JWTSecret())
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func ValidateToken(tokenString string) (*jwt.Token, error) {
	return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return config.JWTSecret(), nil
	})
}
