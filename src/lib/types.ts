import { z } from "zod";

export type UserRole = "agency_admin" | "influencer" | "brand";

export interface UserProfile {
  id: string;
  user_id: string;
  organization_id: string;
  role: UserRole;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  agency_admin: "Agency Admin",
  influencer: "Influencer",
  brand: "Unternehmen / Marke",
};

// --- PROJ-2: Company & Contact Types ---

export interface Company {
  id: string;
  organization_id: string;
  name: string;
  industry: string | null;
  website: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  company_id: string;
  name: string;
  position: string | null;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyWithContacts extends Company {
  contacts: Contact[];
}

// Zod schemas for form validation

export const companyFormSchema = z.object({
  name: z.string().min(1, "Name ist ein Pflichtfeld"),
  industry: z.string(),
  website: z
    .string()
    .refine(
      (val) => !val || /^https?:\/\/.+\..+/.test(val),
      "Bitte geben Sie eine gueltige URL ein (z.B. https://example.com)"
    ),
  notes: z.string(),
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;

export const contactFormSchema = z.object({
  name: z.string().min(1, "Name ist ein Pflichtfeld"),
  position: z.string(),
  email: z.string().min(1, "E-Mail ist ein Pflichtfeld").email("Bitte geben Sie eine gueltige E-Mail-Adresse ein"),
  phone: z.string(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

// --- PROJ-3: Collaboration Types ---

export const COLLABORATION_STATUSES = [
  "requested",
  "confirmed",
  "in_progress",
  "completed",
  "declined",
] as const;

export type CollaborationStatus = (typeof COLLABORATION_STATUSES)[number];

export const STATUS_LABELS: Record<CollaborationStatus, string> = {
  requested: "Angefragt",
  confirmed: "Bestätigt",
  in_progress: "In Arbeit",
  completed: "Abgeschlossen",
  declined: "Abgelehnt",
};

export const STATUS_COLORS: Record<
  CollaborationStatus,
  { bg: string; text: string; border: string }
> = {
  requested: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-300",
    border: "border-gray-300 dark:border-gray-600",
  },
  confirmed: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-300 dark:border-blue-600",
  },
  in_progress: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-300 dark:border-orange-600",
  },
  completed: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-300",
    border: "border-green-300 dark:border-green-600",
  },
  declined: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-300 dark:border-red-600",
  },
};

export interface Collaboration {
  id: string;
  organization_id: string;
  title: string;
  company_id: string;
  assigned_influencer_id: string | null;
  status: CollaborationStatus;
  deadline: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CollaborationWithRelations extends Collaboration {
  company: Pick<Company, "id" | "name"> | null;
  assigned_influencer: Pick<UserProfile, "id" | "user_id" | "full_name"> | null;
}

export const collaborationFormSchema = z.object({
  title: z.string().min(1, "Titel ist ein Pflichtfeld"),
  company_id: z.string().min(1, "Unternehmen ist ein Pflichtfeld"),
  assigned_influencer_id: z.string().optional(),
  status: z.enum(COLLABORATION_STATUSES),
  deadline: z.string().optional(),
  notes: z.string().optional(),
});

export type CollaborationFormValues = z.infer<typeof collaborationFormSchema>;
