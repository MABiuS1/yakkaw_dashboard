'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SupportContact,
  SupportContactMap,
  SupportFAQ,
  SupportFAQForm,
  SupportLang,
} from "@/constant/support";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

const emptyContact: SupportContact = {
  email: "",
  phone: "",
  address: "",
  line: "",
  facebook: "",
  supportHours: "",
};

const createDefaultFaqForm = (lang: SupportLang): SupportFAQForm => ({
  id: null,
  lang,
  question: "",
  answer: "",
  order: "",
});

type RawFaq = {
  id: number;
  lang?: string;
  question?: string;
  answer?: string;
  order?: number;
};

const isRawFaq = (value: unknown): value is RawFaq => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { id?: unknown };
  return typeof candidate.id === "number";
};

const resolveLangValue = (value: string | undefined, fallback: SupportLang): SupportLang => {
  if (value === "th") return "th";
  if (value === "en") return "en";
  return fallback;
};

export const useSupport = () => {
  const [contacts, setContacts] = useState<SupportContactMap>({
    en: { ...emptyContact },
    th: { ...emptyContact },
  });
  const [activeContactLang, setActiveContactLang] = useState<SupportLang>("en");
  const [faqLang, setFaqLang] = useState<SupportLang>("en");
  const [faqs, setFaqs] = useState<SupportFAQ[]>([]);
  const [orderInputs, setOrderInputs] = useState<Record<number, string>>({});
  const [faqForm, setFaqForm] = useState<SupportFAQForm>(createDefaultFaqForm("en"));
  const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<number | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFaqRefreshing, setIsFaqRefreshing] = useState(false);
  const [contactSavingLang, setContactSavingLang] = useState<SupportLang | null>(null);
  const [isSubmittingFaq, setIsSubmittingFaq] = useState(false);
  const [isDeletingFaq, setIsDeletingFaq] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [initialized, setInitialized] = useState(false);

  const headers = useMemo(
    () => ({
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    []
  );

  const showError = useCallback((message: string) => {
    setError(message);
    setStatusMessage("");
  }, []);

  const showStatus = useCallback((message: string) => {
    setStatusMessage(message);
    setError("");
  }, []);

  const normalizeContact = useCallback(
    (partial?: Partial<SupportContact>): SupportContact => ({
      ...emptyContact,
      ...(partial ?? {}),
      supportHours: partial?.supportHours ?? "",
    }),
    []
  );

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Unauthorized");
      }
    } catch {
      window.location.href = "/login";
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    const response = await fetch(`${API_BASE_URL}/admin/support/contact`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Failed to load contact info");
    }
    const data = await response.json();
    setContacts({
      en: normalizeContact(data.contacts?.en),
      th: normalizeContact(data.contacts?.th),
    });
  }, [normalizeContact]);

  const fetchFaqs = useCallback(
    async (lang: SupportLang, withSpinner = false) => {
      if (withSpinner) {
        setIsFaqRefreshing(true);
      }
      try {
        const response = await fetch(`${API_BASE_URL}/admin/support/faqs?lang=${lang}`, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Failed to load FAQs");
        }
        const data = await response.json();
        const rawItems = Array.isArray(data.items) ? data.items : [];
        const normalized = rawItems
          .filter(isRawFaq)
          .map((item, index) => ({
            id: item.id,
            lang: resolveLangValue(item.lang, lang),
            question: item.question ?? "",
            answer: item.answer ?? "",
            order: typeof item.order === "number" ? item.order : index + 1,
          }));
        setFaqs(normalized);
        setOrderInputs(
          normalized.reduce((acc, item) => {
            acc[item.id] = item.order !== undefined ? String(item.order) : "";
            return acc;
          }, {} as Record<number, string>)
        );
      } finally {
        if (withSpinner) {
          setIsFaqRefreshing(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    const load = async () => {
      try {
        await checkAuth();
        await fetchContacts();
        await fetchFaqs("en");
        setInitialized(true);
      } catch (err) {
        showError(err instanceof Error ? err.message : "Failed to load support data");
      } finally {
        setIsInitialLoading(false);
      }
    };
    load();
  }, [checkAuth, fetchContacts, fetchFaqs, showError]);

  useEffect(() => {
    if (!initialized) return;
    fetchFaqs(faqLang, true).catch((err) => {
      showError(err instanceof Error ? err.message : "Failed to load FAQs");
    });
  }, [faqLang, fetchFaqs, initialized, showError]);

  useEffect(() => {
    if (!statusMessage && !error) return;
    const timeout = window.setTimeout(() => {
      setStatusMessage("");
      setError("");
    }, 4000);
    return () => window.clearTimeout(timeout);
  }, [statusMessage, error]);

  const handleContactFieldChange = useCallback(
    (lang: SupportLang, field: keyof SupportContact, value: string) => {
      setContacts((prev) => ({
        ...prev,
        [lang]: {
          ...prev[lang],
          [field]: value,
        },
      }));
    },
    []
  );

  const saveContact = useCallback(
    async (lang: SupportLang) => {
      setContactSavingLang(lang);
      try {
        const response = await fetch(`${API_BASE_URL}/admin/support/contact/${lang}`, {
          method: "PUT",
          credentials: "include",
          headers,
          body: JSON.stringify(contacts[lang]),
        });
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Failed to save contact");
        }
        await fetchContacts();
        showStatus(`Saved ${lang.toUpperCase()} contact details`);
      } catch (err) {
        showError(err instanceof Error ? err.message : "Failed to save contact");
      } finally {
        setContactSavingLang(null);
      }
    },
    [contacts, fetchContacts, headers, showError, showStatus]
  );

  const openCreateFaq = useCallback(
    (lang: SupportLang) => {
      setFaqForm(createDefaultFaqForm(lang));
      setIsFaqDialogOpen(true);
    },
    []
  );

  const openEditFaq = useCallback((faq: SupportFAQ) => {
    setFaqForm({
      id: faq.id,
      lang: faq.lang,
      question: faq.question,
      answer: faq.answer,
      order: faq.order !== undefined ? String(faq.order) : "",
    });
    setIsFaqDialogOpen(true);
  }, []);

  const submitFaq = useCallback(async () => {
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      showError("Question and answer are required");
      return;
    }

    const payload: Record<string, string | number> = {
      lang: faqForm.lang,
      question: faqForm.question.trim(),
      answer: faqForm.answer.trim(),
    };
    const parsedOrder = parseInt(faqForm.order, 10);
    if (!Number.isNaN(parsedOrder)) {
      payload.order = parsedOrder;
    }

    setIsSubmittingFaq(true);
    try {
      const method = faqForm.id ? "PUT" : "POST";
      const url = faqForm.id
        ? `${API_BASE_URL}/admin/support/faqs/${faqForm.id}`
        : `${API_BASE_URL}/admin/support/faqs`;
      const response = await fetch(url, {
        method,
        credentials: "include",
        headers,
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to save FAQ");
      }
      if (faqForm.lang === faqLang) {
        await fetchFaqs(faqLang, true);
      }
      showStatus(`Saved FAQ for ${faqForm.lang.toUpperCase()}`);
      setIsFaqDialogOpen(false);
      setFaqForm(createDefaultFaqForm(faqForm.lang));
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to save FAQ");
    } finally {
      setIsSubmittingFaq(false);
    }
  }, [faqForm, fetchFaqs, faqLang, headers, showError, showStatus]);

  const requestDeleteFaq = useCallback((id: number) => {
    setFaqToDelete(id);
    setIsDeleteDialogOpen(true);
  }, []);

  const deleteFaq = useCallback(async () => {
    if (!faqToDelete) return;
    setIsDeletingFaq(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/support/faqs/${faqToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to delete FAQ");
      }
      setIsDeleteDialogOpen(false);
      setFaqToDelete(null);
      await fetchFaqs(faqLang, true);
      showStatus("FAQ deleted");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to delete FAQ");
    } finally {
      setIsDeletingFaq(false);
    }
  }, [faqLang, faqToDelete, fetchFaqs, showError, showStatus]);

  const handleOrderInputChange = useCallback((id: number, value: string) => {
    setOrderInputs((prev) => ({
      ...prev,
      [id]: value,
    }));
  }, []);

  const saveOrder = useCallback(
    async (faq: SupportFAQ) => {
      const value = orderInputs[faq.id];
      const nextOrder = parseInt(value, 10);
      if (Number.isNaN(nextOrder)) {
        showError("Order must be a number");
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/admin/support/faqs/${faq.id}`, {
          method: "PUT",
          credentials: "include",
          headers,
          body: JSON.stringify({
            lang: faq.lang,
            question: faq.question,
            answer: faq.answer,
            order: nextOrder,
          }),
        });
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Failed to update order");
        }
        await fetchFaqs(faqLang, true);
        showStatus("FAQ order updated");
      } catch (err) {
        showError(err instanceof Error ? err.message : "Failed to update order");
      }
    },
    [faqLang, fetchFaqs, headers, orderInputs, showError, showStatus]
  );

  const clearStatus = useCallback(() => {
    setStatusMessage("");
    setError("");
  }, []);

  return {
    contacts,
    activeContactLang,
    setActiveContactLang,
    handleContactFieldChange,
    saveContact,
    contactSavingLang,
    faqs,
    faqLang,
    setFaqLang,
    faqForm,
    setFaqForm,
    isFaqDialogOpen,
    setIsFaqDialogOpen,
    openCreateFaq,
    openEditFaq,
    submitFaq,
    isSubmittingFaq,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    requestDeleteFaq,
    deleteFaq,
    isDeletingFaq,
    orderInputs,
    handleOrderInputChange,
    saveOrder,
    isLoading: isInitialLoading,
    isFaqRefreshing,
    error,
    statusMessage,
    clearStatus,
  };
};
