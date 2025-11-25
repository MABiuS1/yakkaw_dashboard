package controllers

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

// configureAuthCookie enforces secure defaults for cross-site cookie usage.
func configureAuthCookie(c echo.Context, cookie *http.Cookie) {
	cookie.HttpOnly = true
	cookie.Secure = shouldUseSecureCookie(c)
	cookie.SameSite = http.SameSiteNoneMode
	if cookie.Path == "" {
		cookie.Path = "/"
	}
}
