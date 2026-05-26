export const JOB_TYPES = [
  {
    value: "professional_office",
    label: "Professional/Office",
    resumeFormat: "ATS-focused chronological resume with clear evidence of impact",
    scoringMethod: "ATS keyword match, leadership clarity, measurable impact, and role alignment",
    jobSources: ["LinkedIn", "Indeed", "company career pages", "professional associations"],
    interviewPrepStyle: "Strategic, evidence-led, and direct",
    displayedMonthlyPrice: 49.99,
    pricingAudience: "Professional and office applicants",
  },
  {
    value: "skilled_trade",
    label: "Skilled Trade",
    resumeFormat: "Credential-first trade resume with licenses, tools, safety record, and project scope",
    scoringMethod: "Certification fit, safety record, tools/equipment match, and hands-on experience",
    jobSources: ["Indeed", "trade boards", "union halls", "local contractors", "company career pages"],
    interviewPrepStyle: "Practical, proof-based, and focused on reliability and site readiness",
    displayedMonthlyPrice: 49.99,
    pricingAudience: "Skilled trade applicants",
  },
  {
    value: "healthcare",
    label: "Healthcare",
    resumeFormat: "Credential-first healthcare resume with compliance, patient-care context, and specialty fit",
    scoringMethod: "Credential fit, clinical setting match, compliance language, and patient outcome relevance",
    jobSources: ["hospital career pages", "Indeed", "Health eCareers", "professional associations"],
    interviewPrepStyle: "Calm, precise, compliance-aware, and patient-outcome focused",
    displayedMonthlyPrice: 49.99,
    pricingAudience: "Healthcare applicants",
  },
  {
    value: "labour_warehouse_logistics",
    label: "Labour/Warehouse/Logistics",
    resumeFormat: "Operations resume emphasizing equipment, throughput, attendance, safety, and reliability",
    scoringMethod: "Equipment match, shift fit, productivity, safety, and reliability indicators",
    jobSources: ["Indeed", "ZipRecruiter", "company career pages", "local staffing agencies"],
    interviewPrepStyle: "Direct, practical, and focused on readiness, safety, and dependability",
    displayedMonthlyPrice: 49.99,
    pricingAudience: "Labour, warehouse, and logistics applicants",
  },
  {
    value: "retail_hospitality_food_service",
    label: "Retail/Hospitality/Food Service",
    resumeFormat: "Customer-facing resume emphasizing service, speed, reliability, sales, and team fit",
    scoringMethod: "Customer service match, schedule fit, sales/service outcomes, and role-readiness",
    jobSources: ["Indeed", "Snagajob", "company career pages", "local employer sites"],
    interviewPrepStyle: "Friendly, concise, and focused on service judgment and dependability",
    displayedMonthlyPrice: 49.99,
    pricingAudience: "Retail, hospitality, and food service applicants",
  },
  {
    value: "administrative_coordinator",
    label: "Administrative/Coordinator",
    resumeFormat: "Clear administrative resume emphasizing coordination, scheduling, communication, office systems, and reliability",
    scoringMethod: "Coordination fit, office systems match, communication clarity, prioritization, and measurable support outcomes",
    jobSources: ["Indeed", "LinkedIn", "company career pages", "local employer sites", "staffing agencies"],
    interviewPrepStyle: "Clear, organized, practical, and focused on judgment, follow-through, and trust",
    displayedMonthlyPrice: 49.99,
    pricingAudience: "Administrative, coordinator, receptionist, office manager, and executive assistant applicants",
  },
  {
    value: "other",
    label: "Other",
    resumeFormat: "Flexible ATS-friendly resume matched to the role and industry context",
    scoringMethod: "Role alignment, transferable skills, keyword fit, and evidence quality",
    jobSources: ["LinkedIn", "Indeed", "company career pages", "specialist job boards"],
    interviewPrepStyle: "Adaptive, direct, and grounded in the specific job target",
    displayedMonthlyPrice: 49.99,
    pricingAudience: "Other applicants",
  },
] as const;

export type JobType = (typeof JOB_TYPES)[number]["value"];

export const JOB_TYPE_LABELS = Object.fromEntries(
  JOB_TYPES.map((type) => [type.value, type.label]),
) as Record<JobType, string>;

export function getJobTypeConfig(jobType?: string | null) {
  return JOB_TYPES.find((type) => type.value === jobType) ?? JOB_TYPES[0];
}

export const BLS_INDUSTRIES = [
  "Healthcare and Pharmaceuticals",
  "Technology and IT",
  "Finance and Banking",
  "Education",
  "Government and Public Sector",
  "Manufacturing",
  "Construction and Trades",
  "Retail and Consumer",
  "Legal",
  "Media and Communications",
  "Non-profit",
  "Energy and Utilities",
  "Transportation and Logistics",
  "Hospitality and Food Service",
  "Real Estate",
  "Consulting and Professional Services",
  "Agriculture",
  "Mining, Quarrying, and Oil and Gas Extraction",
  "Utilities",
  "Wholesale Trade",
  "Information",
  "Professional, Scientific, and Technical Services",
  "Management of Companies and Enterprises",
  "Administrative and Support Services",
  "Waste Management and Remediation Services",
  "Arts, Entertainment, and Recreation",
  "Personal and Other Services",
  "Public Administration",
  "Other",
] as const;

export type BlsIndustry = (typeof BLS_INDUSTRIES)[number];
