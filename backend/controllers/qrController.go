package controllers

import (
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/labstack/echo/v4"
)

// GenerateQRLogin issues a short-lived (5m) JWT suitable for QR login.
// Must be called by an authenticated admin (under /admin group).
func GenerateQRLogin(c echo.Context) error {
	role, _ := c.Get("userRole").(string)
	if role != "admin" {
		return c.JSON(http.StatusForbidden, map[string]string{"message": "admin role required"})
	}

	username := "admin"
	if claims, ok := c.Get("user").(*jwt.Token); ok {
		if mc, ok := claims.Claims.(jwt.MapClaims); ok {
			if u, ok := mc["username"].(string); ok && u != "" {
				username = u
			}
		}
	}

	now := time.Now()
	exp := now.Add(5 * time.Minute)
	claims := jwt.MapClaims{
		"username": username,
		"role":     "admin",
		"type":     "qr",
		"iat":      now.Unix(),
		"exp":      exp.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(getJWTSecret())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to sign token"})
	}

	redirect := c.QueryParam("redirect")
	consumeURL, err := buildQRConsumeURL(c, tokenString, redirect)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "invalid QR consume base URL"})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"token":      tokenString,
		"url":        consumeURL,
		"expires_at": exp.UTC().Format(time.RFC3339),
	})
}

// ConsumeQRLogin validates the QR token, sets the auth cookie, and redirects.
func ConsumeQRLogin(c echo.Context) error {
	tokenString := c.QueryParam("token")
	if tokenString == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "missing token"})
	}

	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		return getJWTSecret(), nil
	})
	if err != nil || !token.Valid {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid token"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid claims"})
	}

	if t, _ := claims["type"].(string); t != "qr" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid token type"})
	}

	expUnix, _ := claims["exp"].(float64)
	expTime := time.Unix(int64(expUnix), 0)

	cookie := new(http.Cookie)
	cookie.Name = "access_token"
	cookie.Value = tokenString
	cookie.Expires = expTime
	cookie.Path = "/"
	configureAuthCookie(c, cookie)
	c.SetCookie(cookie)

	redirect := resolveQRRedirect(c, c.QueryParam("redirect"))
	return c.Redirect(http.StatusFound, redirect)
}

func buildQRConsumeURL(c echo.Context, token, redirect string) (string, error) {
	base := strings.TrimRight(strings.TrimSpace(os.Getenv("QR_CONSUME_BASE_URL")), "/")
	if base == "" {
		base = fmt.Sprintf("%s://%s", c.Scheme(), c.Request().Host)
	}
	consumeURL, err := url.Parse(base + "/qr/consume")
	if err != nil {
		return "", err
	}

	q := consumeURL.Query()
	q.Set("token", token)
	if redirect != "" {
		q.Set("redirect", redirect)
	}
	consumeURL.RawQuery = q.Encode()
	return consumeURL.String(), nil
}

func resolveQRRedirect(c echo.Context, override string) string {
	if override != "" {
		return override
	}

	if envRedirect := strings.TrimSpace(os.Getenv("QR_DEFAULT_REDIRECT")); envRedirect != "" {
		return envRedirect
	}

	if frontendBase := strings.TrimRight(strings.TrimSpace(os.Getenv("FRONTEND_BASE_URL")), "/"); frontendBase != "" {
		return frontendBase + "/qr-create-device"
	}

	scheme := c.Scheme()
	if forwarded := strings.TrimSpace(c.Request().Header.Get("X-Forwarded-Proto")); forwarded != "" {
		scheme = forwarded
	}
	host := c.Request().Host
	return fmt.Sprintf("%s://%s/qr-create-device", scheme, host)
}
