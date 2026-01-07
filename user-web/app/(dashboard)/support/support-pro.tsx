"use client";

/**
 * @fileoverview Premium Help & Support Page with SAAS-style Design
 *
 * Features:
 * - Glassmorphism hero with gradient mesh background
 * - Quick action cards for instant help
 * - Expandable FAQ accordion with category filtering
 * - Premium contact form with validation
 * - Ticket history with status badges
 * - Support info card with response times
 */

import "./support.css";
import { useState, useEffect } from "react";
import {
  HelpCircle,
  MessageCircle,
  Mail,
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  Send,
  BookOpen,
  Headphones,
  ChevronRight,
  ChevronDown,
  Search,
  Zap,
  Shield,
  Users,
  FileText,
  Sparkles,
  Phone,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { createSupportTicket, getFAQs, getSupportTickets } from "@/lib/actions/data";

/**
 * FAQ interface
 */
interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  display_order: number;
}

/**
 * Ticket status type
 */
type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

/**
 * Support ticket interface
 */
interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  category: string | null;
  status: TicketStatus;
  priority: string;
  created_at: string;
  updated_at: string;
}

/**
 * Contact form data interface
 */
interface ContactFormData {
  subject: string;
  message: string;
  category: string;
}

/**
 * Contact categories
 */
const contactCategories = [
  { value: "general", label: "General Inquiry", icon: HelpCircle },
  { value: "billing", label: "Billing & Payments", icon: FileText },
  { value: "technical", label: "Technical Issue", icon: Zap },
  { value: "project", label: "Project Related", icon: BookOpen },
  { value: "account", label: "Account Issues", icon: Shield },
];

/**
 * Quick help action card
 */
function QuickHelpCard({
  icon: Icon,
  title,
  description,
  badge,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-start p-4 rounded-xl text-left w-full",
        "bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm",
        "border border-white/60 dark:border-gray-800/60",
        "hover:shadow-md hover:border-primary/30 transition-all duration-300",
        "group"
      )}
    >
      <div className="flex items-start justify-between w-full mb-3">
        <div
          className={cn(
            "p-2.5 rounded-xl transition-colors",
            "bg-gradient-to-br from-primary/10 to-primary/5",
            "group-hover:from-primary/20 group-hover:to-primary/10"
          )}
        >
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {badge && (
          <Badge variant="secondary" className="text-xs">
            {badge}
          </Badge>
        )}
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </button>
  );
}

/**
 * Glassmorphism section card
 */
function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  className,
  headerAction,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm",
        "border border-white/60 dark:border-gray-800/60",
        "shadow-sm hover:shadow-md transition-all duration-300",
        "overflow-hidden",
        className
      )}
    >
      <div className="p-5 border-b border-gray-100 dark:border-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </div>
          </div>
          {headerAction}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/**
 * FAQ Accordion Item
 */
function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-200",
        isOpen
          ? "border-primary/30 bg-primary/5"
          : "border-gray-200 dark:border-gray-800 hover:border-primary/20"
      )}
    >
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-4 text-left"
      >
        <span className="font-medium text-gray-900 dark:text-white pr-4">{question}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-gray-400 transition-transform duration-200 flex-shrink-0",
            isOpen && "rotate-180 text-primary"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 pb-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
}

/**
 * Status icon component
 */
function StatusIcon({ status }: { status: TicketStatus }) {
  switch (status) {
    case "open":
      return <AlertCircle className="h-4 w-4 text-blue-500" />;
    case "in_progress":
      return <Clock className="h-4 w-4 text-amber-500" />;
    case "resolved":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case "closed":
      return <XCircle className="h-4 w-4 text-gray-400" />;
    default:
      return <AlertCircle className="h-4 w-4 text-blue-500" />;
  }
}

/**
 * Status badge variant
 */
function getStatusStyle(status: TicketStatus) {
  switch (status) {
    case "open":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "in_progress":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "resolved":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "closed":
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  }
}

/**
 * Premium Support Page Component
 */
export function SupportPro() {
  // FAQ State
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [faqCategories, setFaqCategories] = useState<string[]>([]);
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>("all");
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [isFaqLoading, setIsFaqLoading] = useState(true);
  const [faqSearch, setFaqSearch] = useState("");

  // Ticket State
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isTicketsLoading, setIsTicketsLoading] = useState(true);

  // Contact Form State
  const [form, setForm] = useState<ContactFormData>({
    subject: "",
    message: "",
    category: "general",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch FAQs
  useEffect(() => {
    const fetchFAQsData = async () => {
      try {
        const data = await getFAQs();
        setFaqs(data);
        const uniqueCategories = [...new Set(data.map((f: FAQ) => f.category))];
        setFaqCategories(uniqueCategories);
      } catch {
        // Silently handle
      } finally {
        setIsFaqLoading(false);
      }
    };
    fetchFAQsData();
  }, []);

  // Fetch Tickets
  useEffect(() => {
    const fetchTicketsData = async () => {
      try {
        const data = await getSupportTickets();
        setTickets(data);
      } catch {
        // Silently handle
      } finally {
        setIsTicketsLoading(false);
      }
    };
    fetchTicketsData();
  }, []);

  // Filter FAQs
  const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory = selectedFaqCategory === "all" || faq.category === selectedFaqCategory;
    const matchesSearch =
      faqSearch === "" ||
      faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.subject.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createSupportTicket({
        subject: form.subject,
        description: form.message,
        category: form.category,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Ticket created! We'll get back to you soon.");
      setForm({ subject: "", message: "", category: "general" });
      window.location.reload();
    } catch {
      toast.error("Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle live chat
  const handleLiveChat = () => {
    toast.info("Live chat coming soon!");
  };

  return (
    <main className="flex-1 p-4 lg:p-6 space-y-6 pb-24">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent p-6 lg:p-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        {/* Gradient Orbs */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/30 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Headphones className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              24/7 Support
            </Badge>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Help & Support</h1>
          <p className="text-white/80 max-w-lg">
            Get instant help from our support team. Browse FAQs, submit tickets, or chat live with our experts.
          </p>
        </div>

        {/* Support Stats */}
        <div className="relative flex flex-wrap gap-4 mt-6 pt-6 border-t border-white/20">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
            <Clock className="h-4 w-4 text-white" />
            <span className="text-sm text-white">&lt;2hr Response</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            <span className="text-sm text-white">98% Resolved</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
            <Users className="h-4 w-4 text-white" />
            <span className="text-sm text-white">Expert Team</span>
          </div>
        </div>
      </section>

      {/* Quick Help Actions */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickHelpCard
          icon={MessageCircle}
          title="Live Chat"
          description="Chat with support now"
          badge="Online"
          onClick={handleLiveChat}
        />
        <QuickHelpCard
          icon={Mail}
          title="Email Support"
          description="Get help via email"
          onClick={() => window.location.href = "mailto:support@assignx.in"}
        />
        <QuickHelpCard
          icon={BookOpen}
          title="Knowledge Base"
          description="Browse help articles"
          onClick={() => toast.info("Knowledge base coming soon!")}
        />
        <QuickHelpCard
          icon={Phone}
          title="Schedule Call"
          description="Book a callback"
          onClick={() => toast.info("Call scheduling coming soon!")}
        />
      </section>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* FAQ Section */}
        <SectionCard
          icon={HelpCircle}
          title="Frequently Asked Questions"
          description="Find quick answers to common questions"
          className="lg:row-span-2"
          headerAction={
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search FAQs..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="pl-9 h-9 w-40 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
              />
            </div>
          }
        >
          {isFaqLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 w-fit mx-auto mb-4">
                <HelpCircle className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-2">No FAQs available yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Check back soon or contact support directly
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedFaqCategory("all")}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                    selectedFaqCategory === "all"
                      ? "bg-primary text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                >
                  All
                </button>
                {faqCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedFaqCategory(cat)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors",
                      selectedFaqCategory === cat
                        ? "bg-primary text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* FAQ List */}
              <div className="space-y-3">
                {filteredFAQs.length === 0 ? (
                  <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No FAQs match your search
                  </p>
                ) : (
                  filteredFAQs.map((faq) => (
                    <FAQItem
                      key={faq.id}
                      question={faq.question}
                      answer={faq.answer}
                      isOpen={openFaqId === faq.id}
                      onToggle={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </SectionCard>

        {/* Contact Form */}
        <SectionCard
          icon={Mail}
          title="Create Support Ticket"
          description="We'll respond within 24 hours"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contactCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <cat.icon className="h-4 w-4 text-gray-500" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Subject <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.subject}
                onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                placeholder="Brief summary of your issue"
                className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Message <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="Describe your issue in detail..."
                rows={4}
                className="resize-none bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
              />
            </div>

            {/* Submit */}
            <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Ticket...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Create Support Ticket
                </>
              )}
            </Button>
          </form>
        </SectionCard>

        {/* Ticket History */}
        <SectionCard
          icon={Ticket}
          title="Your Tickets"
          description="Track your support requests"
        >
          {isTicketsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 w-fit mx-auto mb-4">
                <Ticket className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-2">No tickets yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Create a ticket above to get help
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.slice(0, 5).map((ticket) => (
                <div
                  key={ticket.id}
                  className={cn(
                    "p-4 rounded-xl border transition-all duration-200",
                    "border-gray-200 dark:border-gray-800",
                    "hover:border-primary/30 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    "cursor-pointer group"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                        <StatusIcon status={ticket.status} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {ticket.subject}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          #{ticket.ticket_number} • {ticket.category || "General"}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Updated {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium capitalize",
                          getStatusStyle(ticket.status)
                        )}
                      >
                        {ticket.status.replace("_", " ")}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              ))}

              {tickets.length > 5 && (
                <Button variant="outline" className="w-full gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View All {tickets.length} Tickets
                </Button>
              )}
            </div>
          )}
        </SectionCard>
      </div>
    </main>
  );
}
