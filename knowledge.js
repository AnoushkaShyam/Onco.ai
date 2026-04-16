export const learningCards = [
  {
    title: "What is a mutation?",
    tag: "Foundations",
    body:
      "A mutation is a change in DNA. Some mutations do very little, while others affect how a cell grows, repairs itself, or responds to signals.",
  },
  {
    title: "Why do tumors form?",
    tag: "Biology",
    body:
      "Tumors can form when cells collect changes that let them keep dividing, avoid repair, or ignore normal stop signals from the body.",
  },
  {
    title: "Why do genes matter in cancer?",
    tag: "Interpretation",
    body:
      "Certain genes help control growth, DNA repair, or cell death. When they change, they can shift how likely a cell is to behave abnormally.",
  },
];

export const supportGuides = [
  {
    title: "Managing fatigue",
    tag: "Support",
    body:
      "Cancer-related fatigue is more than ordinary tiredness. Rest, pacing, hydration, and communication with a care team can help people plan around lower-energy periods.",
  },
  {
    title: "Understanding side effects",
    tag: "Care",
    body:
      "Treatments like chemotherapy can affect healthy fast-growing cells too. That is why nausea, hair loss, or low blood counts may happen during treatment.",
  },
  {
    title: "Supporting someone emotionally",
    tag: "Communication",
    body:
      "Many patients need steady practical support more than perfect words. Listening calmly, helping with routines, and respecting uncertainty can make a real difference.",
  },
];

export const geneProfiles = {
  TP53: {
    weight: 33,
    category: "tumor suppressor",
    summary:
      "TP53 helps cells pause, repair damage, or shut down when DNA injury is too severe.",
    associations: ["general", "breast", "lung", "ovarian", "colorectal"],
    evidence:
      "TP53 is among the most commonly altered genes across many tumor types in TCGA-style summaries and broad oncology literature.",
    plainMeaning:
      "When TP53 is disrupted, cells can lose an important safety checkpoint.",
  },
  BRCA1: {
    weight: 29,
    category: "DNA repair",
    summary:
      "BRCA1 is involved in repairing double-strand DNA damage and maintaining genomic stability.",
    associations: ["breast", "ovarian"],
    evidence:
      "BRCA1 alterations are strongly associated with hereditary breast and ovarian cancer patterns and DNA repair disruption.",
    plainMeaning:
      "When BRCA1 is affected, cells may struggle to repair DNA accurately.",
  },
  BRCA2: {
    weight: 27,
    category: "DNA repair",
    summary:
      "BRCA2 supports high-fidelity DNA repair, especially when DNA strands break.",
    associations: ["breast", "ovarian", "prostate", "pancreatic"],
    evidence:
      "BRCA2 is a well-known cancer-relevant repair gene and appears in hereditary cancer risk discussions across several tumor contexts.",
    plainMeaning:
      "BRCA2 changes may make genetic damage build up more easily over time.",
  },
  EGFR: {
    weight: 24,
    category: "growth signaling",
    summary:
      "EGFR affects how cells receive growth messages from their environment.",
    associations: ["lung"],
    evidence:
      "EGFR is a common signaling gene in lung cancer interpretation and is frequently discussed in mutation-driven tumor biology.",
    plainMeaning:
      "An altered EGFR pathway can push cells to keep responding to growth signals.",
  },
  KRAS: {
    weight: 26,
    category: "signaling",
    summary:
      "KRAS passes growth signals inside the cell and can keep that signal active when mutated.",
    associations: ["lung", "pancreatic", "colorectal"],
    evidence:
      "KRAS mutations are well-established across pancreatic, colorectal, and lung cancer biology.",
    plainMeaning:
      "A changed KRAS signal can act like a stuck accelerator for cell growth.",
  },
  APC: {
    weight: 22,
    category: "tumor suppressor",
    summary:
      "APC helps regulate cell growth pathways in intestinal tissue and related systems.",
    associations: ["colorectal"],
    evidence:
      "APC is strongly associated with colorectal tumor formation in classic cancer genetics.",
    plainMeaning:
      "APC disruption can make it easier for intestinal cells to grow out of balance.",
  },
  PIK3CA: {
    weight: 20,
    category: "cell survival signaling",
    summary:
      "PIK3CA can change how strongly cells receive survival and growth cues.",
    associations: ["breast", "endometrial", "colorectal"],
    evidence:
      "PIK3CA appears frequently in pathway-level cancer signaling discussions and mutation catalogs.",
    plainMeaning:
      "Changes in PIK3CA may make cells more likely to survive and grow.",
  },
  BRAF: {
    weight: 23,
    category: "signaling",
    summary:
      "BRAF is part of a pathway that tells cells when to grow and divide.",
    associations: ["melanoma", "colorectal", "thyroid"],
    evidence:
      "BRAF alterations are well-known in melanoma and several other cancers with pathway-driven growth.",
    plainMeaning:
      "When BRAF is altered, growth signals can become overly active.",
  },
};

export const symptomProfiles = [
  {
    id: "persistent-fatigue",
    label: "Persistent fatigue",
    weight: 8,
    associations: ["general", "blood", "lung"],
    explanation:
      "Persistent fatigue can be linked to systemic stress, anemia, inflammation, or treatment-related burden.",
  },
  {
    id: "unexplained-weight-loss",
    label: "Unexplained weight loss",
    weight: 12,
    associations: ["general", "lung", "pancreatic", "colorectal"],
    explanation:
      "Unexplained weight loss may reflect increased metabolic demand or reduced intake during serious illness.",
  },
  {
    id: "persistent-cough",
    label: "Persistent cough",
    weight: 14,
    associations: ["lung"],
    explanation:
      "A persistent cough can overlap with lung-related irritation or disease, though it also has many non-cancer causes.",
  },
  {
    id: "rectal-bleeding",
    label: "Rectal bleeding",
    weight: 16,
    associations: ["colorectal"],
    explanation:
      "Rectal bleeding can overlap with colorectal disease patterns but also occurs in several non-cancer conditions.",
  },
  {
    id: "breast-lump",
    label: "Breast lump",
    weight: 16,
    associations: ["breast"],
    explanation:
      "A breast lump is a common reason for further evaluation and may align with several breast-related conditions, not only cancer.",
  },
  {
    id: "bloating",
    label: "Persistent bloating",
    weight: 11,
    associations: ["ovarian"],
    explanation:
      "Persistent bloating can appear in ovarian disease patterns, although it is also common in non-cancer digestive issues.",
  },
];

export const contextProfiles = {
  ageGroup: {
    "under-40": { label: "Under 40", score: 3 },
    "40-60": { label: "40 to 60", score: 8 },
    "over-60": { label: "Over 60", score: 12 },
  },
  familyHistory: {
    no: { label: "No known family history", score: 0 },
    yes: { label: "Known family history of cancer", score: 10 },
  },
  smokingStatus: {
    never: { label: "Never", score: 0 },
    former: { label: "Former smoker", score: 5 },
    current: { label: "Current smoker", score: 10 },
  },
};
