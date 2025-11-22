export type SupportLang = "en" | "th";

export type SupportContact = {
  email: string;
  phone: string;
  address: string;
  line: string;
  facebook: string;
  supportHours: string;
};

export type SupportContactMap = Record<SupportLang, SupportContact>;

export type SupportFAQ = {
  id: number;
  lang: SupportLang;
  question: string;
  answer: string;
  order?: number;
};

export type SupportFAQForm = {
  id: number | null;
  lang: SupportLang;
  question: string;
  answer: string;
  order: string;
};
