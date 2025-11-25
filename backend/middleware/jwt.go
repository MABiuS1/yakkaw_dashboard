package middleware

import (
	"github.com/golang-jwt/jwt/v4"
	"github.com/labstack/echo/v4"
	"net/http"
	"yakkaw_dashboard/config"
	"yakkaw_dashboard/models"
)

func JWTMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		cookie, err := c.Cookie("access_token")
		if err != nil {
			c.Logger().Error("No token provided")
			return c.JSON(http.StatusUnauthorized, "Unauthorized: No token provided")
		}

		tokenString := cookie.Value
		claims := &models.JWTCustomClaims{}

		// Parse JWT
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return config.JWTSecret(), nil
		})
		if err != nil || !token.Valid {
			c.Logger().Error("Invalid token")
			return c.JSON(http.StatusUnauthorized, "Unauthorized: Invalid token")
		}

		// Log the claims and attach to context
		c.Logger().Infof("Token is valid. User: %s, Role: %s", claims.Username, claims.Role)
		c.Set("userRole", claims.Role)

		return next(c)
	}
}
