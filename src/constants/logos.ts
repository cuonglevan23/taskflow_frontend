// Company logos constants for better organization and management

export const COMPANY_LOGOS = {
  MICROSOFT: "/images/logo%20company/Microsoft.svg",
  MICROSOFT_OUTLOOK: "/images/logo%20company/Microsoft%20Outlook.svg",
  MICROSOFT_TEAMS: "/images/logo%20company/Microsoft%20Teams.svg",
  SLACK: "/images/logo%20company/Slack.svg",
  FIGMA: "/images/logo%20company/Figma.svg",
  ZENDESK: "/images/logo%20company/Zendesk.svg",
  TABLEAU: "/images/logo%20company/Tableau.svg",
  TWILIO: "/images/logo%20company/logo-app-Twilio.svg",
  NIGHTFALL: "/images/logo%20company/Nightfall.svg",
} as const;

// Company information with logos
export interface CompanyLogo {
  name: string;
  logo: string;
  category?: string;
}

export const INTEGRATION_COMPANIES: CompanyLogo[] = [
  {
    name: "Microsoft",
    logo: COMPANY_LOGOS.MICROSOFT,
    category: "productivity"
  },
  {
    name: "Microsoft Outlook",
    logo: COMPANY_LOGOS.MICROSOFT_OUTLOOK,
    category: "email"
  },
  {
    name: "Microsoft Teams",
    logo: COMPANY_LOGOS.MICROSOFT_TEAMS,
    category: "communication"
  },
  {
    name: "Slack",
    logo: COMPANY_LOGOS.SLACK,
    category: "communication"
  },
  {
    name: "Figma",
    logo: COMPANY_LOGOS.FIGMA,
    category: "design"
  },
  {
    name: "Zendesk",
    logo: COMPANY_LOGOS.ZENDESK,
    category: "support"
  },
  {
    name: "Tableau",
    logo: COMPANY_LOGOS.TABLEAU,
    category: "analytics"
  },
  {
    name: "Twilio",
    logo: COMPANY_LOGOS.TWILIO,
    category: "communication"
  },
  {
    name: "Nightfall",
    logo: COMPANY_LOGOS.NIGHTFALL,
    category: "security"
  },
];

// Helper function to get logos by category
export const getLogosByCategory = (category: string): CompanyLogo[] => {
  return INTEGRATION_COMPANIES.filter(company => company.category === category);
};

// Get all available categories
export const getAvailableCategories = (): string[] => {
  return [...new Set(INTEGRATION_COMPANIES.map(company => company.category).filter(Boolean))];
};
