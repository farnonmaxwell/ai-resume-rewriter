export const PRODUCTS = {
  oneTime: {
    name: "EO50 Single Resume Rewrite",
    description: "One full ATS-optimized resume rewrite, with PDF and DOCX downloads.",
    amount: 2700, // cents
    currency: "usd",
  },
  subscription: {
    name: "EO50 Unlimited Monthly",
    description: "Unlimited resume rewrites and downloads, billed monthly.",
    amount: 900, // cents
    currency: "usd",
    interval: "month" as const,
  },
} as const;

export type ProductKey = keyof typeof PRODUCTS;
