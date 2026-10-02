export const ORG_TYPES = ["PRIVATE", "PUBLIC", "LLP", "STARTUP", "PSU", "FOREIGN", "OTHER"] as const;

export const AMOUNT_UNITS = ["INR_CRORE", "USD_MILLION"] as const;

export const TIMELINES = ["0-6", "6-12", "12-24", "24+"] as const;

export const SUPPORT = ["land", "power", "approvals", "incentives", "other"] as const;

export const ATTENDING_AS = [
  "investor",
  "developer",
  "infrastructure",
  "startup",
  "association",
  "consultant",
  "government",
  "academia",
  "other",
] as const;

export const REGISTRATION_SECTORS = [
  "government-public",
  "real-estate",
  "urban-infrastructure",
  "sustainability",
  "finance",
  "technology",
  "other",
] as const;

export const SESSIONS = ["plenary", "panel-1", "panel-2", "panel-3", "panel-4"] as const;

export const ATTENDING_ORG: Record<(typeof ATTENDING_AS)[number], (typeof ORG_TYPES)[number]> = {
  investor: "PRIVATE",
  developer: "PRIVATE",
  infrastructure: "PRIVATE",
  startup: "STARTUP",
  association: "OTHER",
  consultant: "OTHER",
  government: "PUBLIC",
  academia: "OTHER",
  other: "OTHER",
};

export const LEAD_STATUSES = [
  "RECEIVED",
  "UNDER_REVIEW",
  "CONTACTED",
  "MEETING_SCHEDULED",
  "CLOSED",
] as const;

export const ROLES = ["SUPER_ADMIN", "CONTENT_EDITOR", "INVESTMENT_TEAM", "VIEWER"] as const;

/** Established district names, plus an open choice. Edit this list if the official set changes. */
export const DISTRICTS = [
  "Agar-Malwa",
  "Alirajpur",
  "Anuppur",
  "Ashoknagar",
  "Balaghat",
  "Barwani",
  "Betul",
  "Bhind",
  "Bhopal",
  "Burhanpur",
  "Chhatarpur",
  "Chhindwara",
  "Damoh",
  "Datia",
  "Dewas",
  "Dhar",
  "Dindori",
  "Guna",
  "Gwalior",
  "Harda",
  "Indore",
  "Jabalpur",
  "Jhabua",
  "Katni",
  "Khandwa",
  "Khargone",
  "Maihar",
  "Mandla",
  "Mandsaur",
  "Mauganj",
  "Morena",
  "Narmadapuram",
  "Narsinghpur",
  "Neemuch",
  "Niwari",
  "Pandhurna",
  "Panna",
  "Raisen",
  "Rajgarh",
  "Ratlam",
  "Rewa",
  "Sagar",
  "Satna",
  "Sehore",
  "Seoni",
  "Shahdol",
  "Shajapur",
  "Sheopur",
  "Shivpuri",
  "Sidhi",
  "Singrauli",
  "Tikamgarh",
  "Ujjain",
  "Umaria",
  "Vidisha",
  "Not decided",
  "Other",
] as const;

export const ORG_LABELS: Record<(typeof ORG_TYPES)[number], string> = {
  PRIVATE: "Private",
  PUBLIC: "Public",
  LLP: "LLP",
  STARTUP: "Startup",
  PSU: "PSU",
  FOREIGN: "Foreign entity",
  OTHER: "Other",
};
