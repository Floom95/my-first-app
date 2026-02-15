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
