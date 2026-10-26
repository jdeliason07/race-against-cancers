// The bandana colors offered at registration, in the order the form shows
// them. The label is what gets stored on the registration, so renaming one
// splits its count on /admin between the old label and the new — add a color
// rather than rename one once registration is open.
//
// BENEFICIARY_BANDANA in src/config/site.ts must match one of these labels.
export const BANDANAS: { label: string; color: string }[] = [
  { label: 'Breast Cancer',     color: '#F0307A' },
  { label: 'Leukemia',          color: '#DC2626' },
  { label: 'Pancreatic Cancer', color: '#9333EA' },
  { label: 'Colon Cancer',      color: '#2563EB' },
  { label: 'Melanoma',          color: '#111111' },
  { label: 'Childhood Cancer',  color: '#EAB308' },
  { label: 'Lung Cancer',       color: '#9CA3AF' },
  { label: 'Lymphoma',          color: '#16A34A' },
];
