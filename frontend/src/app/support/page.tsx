"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import Navbar from "@/components/ui/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useSupport } from "@/hooks/useSupport";
import { SupportLang } from "@/constant/support";

const languages: SupportLang[] = ["en", "th"];

const SupportSettingsPage = () => {
  const {
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
    isLoading,
    isFaqRefreshing,
    error,
    statusMessage,
  } = useSupport();

  const activeContact = contacts[activeContactLang];
  const savingContact = contactSavingLang === activeContactLang;

  const faqPreview = useMemo(
    () => ({
      question: faqForm.question || "Your question will appear here.",
      answer: faqForm.answer || "Answer preview supports multiple lines.\nAdd more details to guide users.",
    }),
    [faqForm.answer, faqForm.question]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
        <p className="text-muted-foreground text-sm">Loading support settings...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-6xl mx-auto px-4 py-8 space-y-6"
        >
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-800">Support & Help Center</h1>
            <p className="text-muted-foreground">
              Update contact channels, manage FAQs, and preview exactly what the mobile app will show.
            </p>
          </div>

          {(error || statusMessage) && (
            <Alert variant={error ? "destructive" : "default"} className="border-l-4">
              {error ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
              <AlertDescription>{error || statusMessage}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-2 border-slate-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Support Contact</span>
                  <div className="flex gap-2">
                    {languages.map((lang) => (
                      <Button
                        key={lang}
                        type="button"
                        variant={activeContactLang === lang ? "default" : "secondary"}
                        className="text-xs uppercase"
                        onClick={() => setActiveContactLang(lang)}
                      >
                        {lang}
                      </Button>
                    ))}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="support-email">Email</Label>
                  <Input
                    id="support-email"
                    value={activeContact.email}
                    placeholder="support@yakkaw.app"
                    onChange={(e) => handleContactFieldChange(activeContactLang, "email", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="support-phone">Phone</Label>
                  <Input
                    id="support-phone"
                    value={activeContact.phone}
                    placeholder="+66 88 888 8888"
                    onChange={(e) => handleContactFieldChange(activeContactLang, "phone", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="support-line">Line (optional)</Label>
                  <Input
                    id="support-line"
                    value={activeContact.line}
                    placeholder="@yakkaw-support"
                    onChange={(e) => handleContactFieldChange(activeContactLang, "line", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="support-facebook">Facebook (optional)</Label>
                  <Input
                    id="support-facebook"
                    value={activeContact.facebook}
                    placeholder="https://facebook.com/yakkaw"
                    onChange={(e) => handleContactFieldChange(activeContactLang, "facebook", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="support-address">Address</Label>
                  <Textarea
                    id="support-address"
                    rows={3}
                    placeholder="Full address, building name, floor..."
                    value={activeContact.address}
                    onChange={(e) => handleContactFieldChange(activeContactLang, "address", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="support-hours">Support Hours</Label>
                  <Textarea
                    id="support-hours"
                    rows={3}
                    placeholder={"Weekdays 09:00-18:00\nWeekend support via email."}
                    value={activeContact.supportHours}
                    onChange={(e) => handleContactFieldChange(activeContactLang, "supportHours", e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    className="flex items-center gap-2"
                    onClick={() => saveContact(activeContactLang)}
                    disabled={savingContact}
                  >
                    {savingContact ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Contact
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-50 bg-emerald-50/40">
              <CardHeader>
                <CardTitle>Live Preview ({activeContactLang.toUpperCase()})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-700">Email</p>
                  <p className="text-slate-600">{activeContact.email || "Not provided"}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-700">Phone</p>
                  <p className="text-slate-600">{activeContact.phone || "Not provided"}</p>
                </div>
                {activeContact.line && (
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-700">Line</p>
                    <p className="text-slate-600">{activeContact.line}</p>
                  </div>
                )}
                {activeContact.facebook && (
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-700">Facebook</p>
                    <p className="text-slate-600 break-all">{activeContact.facebook}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="font-semibold text-slate-700">Support Hours</p>
                  <p className="text-slate-600 whitespace-pre-line border rounded-md bg-white/80 p-3 shadow-sm min-h-[80px]">
                    {activeContact.supportHours || "Not provided"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-700">Address</p>
                  <p className="text-slate-600 whitespace-pre-line border rounded-md bg-white/80 p-3 shadow-sm min-h-[80px]">
                    {activeContact.address || "Not provided"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-purple-100 shadow-sm">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-purple-900">Frequently Asked Questions</CardTitle>
                <p className="text-sm text-muted-foreground">Create FAQs per language and control their order.</p>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                {languages.map((lang) => (
                  <Button
                    key={`faq-${lang}`}
                    variant={faqLang === lang ? "default" : "outline"}
                    className="text-xs uppercase"
                    onClick={() => setFaqLang(lang)}
                  >
                    {faqLang === lang && isFaqRefreshing && (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    )}
                    {lang}
                  </Button>
                ))}
                <Button onClick={() => openCreateFaq(faqLang)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4" />
                  Add FAQ
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-xl text-muted-foreground">
                  No FAQs for this language yet. Click &quot;Add FAQ&quot; to create one.
                </div>
              ) : (
                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="rounded-xl border p-4 shadow-sm bg-white/80 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase text-muted-foreground tracking-wide">
                            Order #{faq.order ?? "-"}
                          </p>
                          <h3 className="text-lg font-semibold text-slate-800">{faq.question}</h3>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditFaq(faq)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => requestDeleteFaq(faq.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 whitespace-pre-line">{faq.answer}</p>
                      <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        <div className="flex-1">
                          <Label htmlFor={`faq-order-${faq.id}`} className="text-xs uppercase tracking-wide">
                            Order
                          </Label>
                          <Input
                            id={`faq-order-${faq.id}`}
                            type="number"
                            value={orderInputs[faq.id] ?? ""}
                            onChange={(e) => handleOrderInputChange(faq.id, e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <Button variant="secondary" className="mt-2 md:mt-6" onClick={() => saveOrder(faq)}>
                          <Save className="mr-2 h-4 w-4" />
                          Update Order
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Dialog open={isFaqDialogOpen} onOpenChange={setIsFaqDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{faqForm.id ? "Edit FAQ" : "Create FAQ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="faq-language">Language</Label>
              <select
                id="faq-language"
                value={faqForm.lang}
                onChange={(e) => setFaqForm((prev) => ({ ...prev, lang: e.target.value as SupportLang }))}
                className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              >
                {languages.map((lang) => (
                  <option key={`option-${lang}`} value={lang}>
                    {lang.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="faq-question">Question</Label>
              <Input
                id="faq-question"
                value={faqForm.question}
                onChange={(e) => setFaqForm((prev) => ({ ...prev, question: e.target.value }))}
                placeholder="How do I reset the device?"
              />
            </div>
            <div>
              <Label htmlFor="faq-answer">Answer</Label>
              <Textarea
                id="faq-answer"
                rows={4}
                value={faqForm.answer}
                onChange={(e) => setFaqForm((prev) => ({ ...prev, answer: e.target.value }))}
                placeholder={"1. Open the app\n2. Tap devices\n3. Follow the wizard"}
              />
            </div>
            <div>
              <Label htmlFor="faq-order">Order (optional)</Label>
              <Input
                id="faq-order"
                type="number"
                value={faqForm.order}
                onChange={(e) => setFaqForm((prev) => ({ ...prev, order: e.target.value }))}
                placeholder="1"
              />
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Preview</p>
              <p className="font-semibold text-slate-800">{faqPreview.question}</p>
              <p className="text-sm text-slate-600 whitespace-pre-line mt-2">{faqPreview.answer}</p>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsFaqDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitFaq} disabled={isSubmittingFaq} className="flex items-center gap-2">
              {isSubmittingFaq ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete FAQ</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This FAQ will be removed from the mobile app immediately. Are you sure you want to continue?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteFaq} disabled={isDeletingFaq} className="flex items-center gap-2">
              {isDeletingFaq ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SupportSettingsPage;
