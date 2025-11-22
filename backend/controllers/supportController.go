package controllers

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
	"yakkaw_dashboard/models"
	"yakkaw_dashboard/services"
)

type SupportController struct {
	Service *services.SupportService
}

func NewSupportController(service *services.SupportService) *SupportController {
	return &SupportController{Service: service}
}

type supportContactRequest struct {
	Email        string `json:"email"`
	Phone        string `json:"phone"`
	Address      string `json:"address"`
	Line         string `json:"line"`
	Facebook     string `json:"facebook"`
	SupportHours string `json:"supportHours"`
}

type supportFAQRequest struct {
	Lang     string `json:"lang"`
	Question string `json:"question"`
	Answer   string `json:"answer"`
	Order    *int   `json:"order"`
}

type supportContactResponse struct {
	Email        string `json:"email"`
	Phone        string `json:"phone"`
	Address      string `json:"address,omitempty"`
	Line         string `json:"line,omitempty"`
	Facebook     string `json:"facebook,omitempty"`
	SupportHours string `json:"supportHours,omitempty"`
}

type supportFAQResponse struct {
	ID       uint   `json:"id"`
	Lang     string `json:"lang,omitempty"`
	Order    int    `json:"order,omitempty"`
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

func (sc *SupportController) GetSupportContact(c echo.Context) error {
	if !acceptsJSON(c) {
		return c.String(http.StatusNotAcceptable, "Accept header must include application/json")
	}

	lang, err := normalizeLang(c.QueryParam("lang"))
	if err != nil {
		return c.String(http.StatusBadRequest, "lang must be either 'en' or 'th'")
	}

	contact, err := sc.Service.GetContactByLang(lang)
	if err != nil {
		return c.String(http.StatusInternalServerError, "unable to load support contact")
	}

	setNoStore(c)
	return c.JSON(http.StatusOK, toContactResponse(contact))
}

func (sc *SupportController) GetSupportFAQs(c echo.Context) error {
	if !acceptsJSON(c) {
		return c.String(http.StatusNotAcceptable, "Accept header must include application/json")
	}

	lang, err := normalizeLang(c.QueryParam("lang"))
	if err != nil {
		return c.String(http.StatusBadRequest, "lang must be either 'en' or 'th'")
	}

	faqs, err := sc.Service.ListFAQsByLang(lang)
	if err != nil {
		return c.String(http.StatusInternalServerError, "unable to load FAQs")
	}

	items := make([]supportFAQResponse, 0, len(faqs))
	for _, faq := range faqs {
		items = append(items, supportFAQResponse{
			ID:       faq.ID,
			Order:    faq.DisplayOrder,
			Question: faq.Question,
			Answer:   faq.Answer,
		})
	}

	setNoStore(c)
	return c.JSON(http.StatusOK, items)
}

func (sc *SupportController) AdminListContacts(c echo.Context) error {
	if !acceptsJSON(c) {
		return c.String(http.StatusNotAcceptable, "Accept header must include application/json")
	}

	contacts, err := sc.Service.ListAllContacts()
	if err != nil {
		return c.String(http.StatusInternalServerError, "unable to load support contact")
	}

	result := map[string]supportContactResponse{
		"en": toContactResponse(nil),
		"th": toContactResponse(nil),
	}
	for _, contact := range contacts {
		result[contact.Lang] = toContactResponse(&contact)
	}

	setNoStore(c)
	return c.JSON(http.StatusOK, map[string]interface{}{"contacts": result})
}

func (sc *SupportController) AdminUpdateContact(c echo.Context) error {
	if !acceptsJSON(c) {
		return c.String(http.StatusNotAcceptable, "Accept header must include application/json")
	}

	lang, err := normalizeLang(c.Param("lang"))
	if err != nil {
		return c.String(http.StatusBadRequest, "lang must be either 'en' or 'th'")
	}

	var req supportContactRequest
	if err := c.Bind(&req); err != nil {
		return c.String(http.StatusBadRequest, "invalid contact payload")
	}

	if strings.TrimSpace(req.Email) == "" || strings.TrimSpace(req.Phone) == "" {
		return c.String(http.StatusBadRequest, "email and phone are required")
	}

	payload := models.SupportContact{
		Lang:         lang,
		Email:        strings.TrimSpace(req.Email),
		Phone:        strings.TrimSpace(req.Phone),
		Address:      strings.TrimSpace(req.Address),
		Line:         strings.TrimSpace(req.Line),
		Facebook:     strings.TrimSpace(req.Facebook),
		SupportHours: strings.TrimSpace(req.SupportHours),
	}

	contact, err := sc.Service.UpsertContact(payload)
	if err != nil {
		return c.String(http.StatusInternalServerError, "unable to save contact")
	}

	return c.JSON(http.StatusOK, toContactResponse(&contact))
}

func (sc *SupportController) AdminListFAQs(c echo.Context) error {
	if !acceptsJSON(c) {
		return c.String(http.StatusNotAcceptable, "Accept header must include application/json")
	}

	queryLang := c.QueryParam("lang")
	lang := ""
	if queryLang != "" {
		value, err := normalizeLang(queryLang)
		if err != nil {
			return c.String(http.StatusBadRequest, "lang must be either 'en' or 'th'")
		}
		lang = value
	}

	faqs, err := sc.Service.ListFAQsByLang(lang)
	if err != nil {
		return c.String(http.StatusInternalServerError, "unable to load FAQs")
	}

	items := make([]supportFAQResponse, 0, len(faqs))
	for _, faq := range faqs {
		items = append(items, supportFAQResponse{
			ID:       faq.ID,
			Lang:     faq.Lang,
			Order:    faq.DisplayOrder,
			Question: faq.Question,
			Answer:   faq.Answer,
		})
	}

	setNoStore(c)
	return c.JSON(http.StatusOK, map[string]interface{}{"items": items})
}

func (sc *SupportController) AdminCreateFAQ(c echo.Context) error {
	if !acceptsJSON(c) {
		return c.String(http.StatusNotAcceptable, "Accept header must include application/json")
	}

	var req supportFAQRequest
	if err := c.Bind(&req); err != nil {
		return c.String(http.StatusBadRequest, "invalid FAQ payload")
	}

	lang, err := normalizeLang(req.Lang)
	if err != nil {
		return c.String(http.StatusBadRequest, "lang must be either 'en' or 'th'")
	}

	if strings.TrimSpace(req.Question) == "" || strings.TrimSpace(req.Answer) == "" {
		return c.String(http.StatusBadRequest, "question and answer are required")
	}

	faq := models.SupportFAQ{
		Lang:         lang,
		Question:     strings.TrimSpace(req.Question),
		Answer:       strings.TrimSpace(req.Answer),
		DisplayOrder: 0,
	}
	if req.Order != nil {
		faq.DisplayOrder = *req.Order
	}

	if err := sc.Service.CreateFAQ(&faq); err != nil {
		return c.String(http.StatusInternalServerError, "unable to create FAQ")
	}

	return c.JSON(http.StatusCreated, supportFAQResponse{
		ID:       faq.ID,
		Lang:     faq.Lang,
		Order:    faq.DisplayOrder,
		Question: faq.Question,
		Answer:   faq.Answer,
	})
}

func (sc *SupportController) AdminUpdateFAQ(c echo.Context) error {
	if !acceptsJSON(c) {
		return c.String(http.StatusNotAcceptable, "Accept header must include application/json")
	}

	var req supportFAQRequest
	if err := c.Bind(&req); err != nil {
		return c.String(http.StatusBadRequest, "invalid FAQ payload")
	}

	id, err := parseUintParam(c, "id")
	if err != nil {
		return c.String(http.StatusBadRequest, "invalid FAQ id")
	}

	if strings.TrimSpace(req.Question) == "" || strings.TrimSpace(req.Answer) == "" {
		return c.String(http.StatusBadRequest, "question and answer are required")
	}

	payload := models.SupportFAQ{
		Question: strings.TrimSpace(req.Question),
		Answer:   strings.TrimSpace(req.Answer),
	}
	if req.Lang != "" {
		lang, err := normalizeLang(req.Lang)
		if err != nil {
			return c.String(http.StatusBadRequest, "lang must be either 'en' or 'th'")
		}
		payload.Lang = lang
	}

	updateOrder := req.Order != nil
	if req.Order != nil {
		payload.DisplayOrder = *req.Order
	}

	faq, err := sc.Service.UpdateFAQ(uint(id), payload, updateOrder)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.String(http.StatusNotFound, "FAQ not found")
		}
		return c.String(http.StatusInternalServerError, "unable to update FAQ")
	}

	return c.JSON(http.StatusOK, supportFAQResponse{
		ID:       faq.ID,
		Lang:     faq.Lang,
		Order:    faq.DisplayOrder,
		Question: faq.Question,
		Answer:   faq.Answer,
	})
}

func (sc *SupportController) AdminDeleteFAQ(c echo.Context) error {
	id, err := parseUintParam(c, "id")
	if err != nil {
		return c.String(http.StatusBadRequest, "invalid FAQ id")
	}

	if err := sc.Service.DeleteFAQ(uint(id)); err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.String(http.StatusNotFound, "FAQ not found")
		}
		return c.String(http.StatusInternalServerError, "unable to delete FAQ")
	}

	return c.String(http.StatusOK, "FAQ deleted")
}

func toContactResponse(contact *models.SupportContact) supportContactResponse {
	if contact == nil {
		return supportContactResponse{}
	}
	return supportContactResponse{
		Email:        contact.Email,
		Phone:        contact.Phone,
		Address:      contact.Address,
		Line:         contact.Line,
		Facebook:     contact.Facebook,
		SupportHours: contact.SupportHours,
	}
}

func normalizeLang(value string) (string, error) {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "", "en":
		return "en", nil
	case "th":
		return "th", nil
	default:
		return "", echo.ErrBadRequest
	}
}

func parseUintParam(c echo.Context, name string) (uint64, error) {
	return strconv.ParseUint(c.Param(name), 10, 64)
}

func acceptsJSON(c echo.Context) bool {
	accept := c.Request().Header.Get(echo.HeaderAccept)
	if accept == "" || accept == "*/*" {
		return true
	}
	return strings.Contains(accept, echo.MIMEApplicationJSON)
}

func setNoStore(c echo.Context) {
	c.Response().Header().Set(echo.HeaderCacheControl, "no-store")
}
