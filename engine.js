import { contextProfiles, geneProfiles, symptomProfiles } from "./knowledge.js";

const MAX_SCORE = 100;

function getRiskBand(score) {
  if (score >= 80) {
    return { label: "High educational concern", tone: "high" };
  }
  if (score >= 60) {
    return { label: "Elevated educational concern", tone: "elevated" };
  }
  if (score >= 40) {
    return { label: "Moderate educational concern", tone: "moderate" };
  }
  return { label: "Lower educational concern", tone: "lower" };
}

function listify(value) {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function contextScore(formData) {
  return (
    contextProfiles.ageGroup[formData.ageGroup].score +
    contextProfiles.familyHistory[formData.familyHistory].score +
    contextProfiles.smokingStatus[formData.smokingStatus].score
  );
}

function deriveGeneKeywords(summary = "") {
  const normalized = summary.toLowerCase();
  const keywords = [];

  if (normalized.includes("tumor suppressor")) {
    keywords.push("tumor suppressor");
  }
  if (normalized.includes("dna repair")) {
    keywords.push("dna repair");
  }
  if (normalized.includes("apoptosis")) {
    keywords.push("apoptosis");
  }
  if (normalized.includes("cell cycle")) {
    keywords.push("cell cycle");
  }
  if (normalized.includes("growth")) {
    keywords.push("growth signaling");
  }

  return keywords;
}

function deriveGeneWeight(geneData) {
  const curated = geneProfiles[geneData.symbol];
  if (curated) {
    return { weight: curated.weight, curated };
  }

  let weight = 12;
  const summary = geneData.summary || "";
  const lowerType = (geneData.type || "").toLowerCase();

  if (lowerType.includes("protein")) {
    weight += 4;
  }
  if (summary.toLowerCase().includes("cancer")) {
    weight += 4;
  }
  if (summary.toLowerCase().includes("tumor suppressor")) {
    weight += 6;
  }
  if (summary.toLowerCase().includes("dna repair")) {
    weight += 5;
  }
  if (summary.toLowerCase().includes("cell cycle")) {
    weight += 3;
  }

  return { weight: Math.min(weight, 28), curated: null };
}

function deriveVariantWeight(variantData) {
  if (!variantData) {
    return {
      weight: 0,
      note: "No variant identifier was provided, so the score is based on gene, symptoms, and background context.",
    };
  }

  const significance = (variantData.clinvarSignificance || "").toLowerCase();

  if (significance.includes("pathogenic")) {
    return {
      weight: 18,
      note: `Live variant evidence adds 18 points because ClinVar lists this variant as ${variantData.clinvarSignificance}.`,
    };
  }

  if (significance.includes("uncertain")) {
    return {
      weight: 8,
      note: `Live variant evidence adds 8 points because ClinVar lists this variant as ${variantData.clinvarSignificance}.`,
    };
  }

  if (significance.includes("benign")) {
    return {
      weight: 2,
      note: `Live variant evidence adds only 2 points because the reported significance is ${variantData.clinvarSignificance}.`,
    };
  }

  return {
    weight: 6,
    note: "A live variant match was found, but the significance is limited or incomplete, so it adds modest weight.",
  };
}

function buildAssociationOverlap(geneSymbol, geneSummary, symptoms) {
  const curatedAssociations = geneProfiles[geneSymbol]?.associations || ["general"];
  const overlaps = [];
  const geneAssociations = new Set(curatedAssociations);
  const keywordAssociations = deriveGeneKeywords(geneSummary);

  symptoms.forEach((symptom) => {
    symptom.associations.forEach((association) => {
      if (geneAssociations.has(association) || geneAssociations.has("general")) {
        overlaps.push(association);
      }
      if (keywordAssociations.includes("growth signaling") && association === "lung") {
        overlaps.push(association);
      }
    });
  });

  return [...new Set(overlaps)];
}

function geneBiologySummary(geneData, curatedGene) {
  if (curatedGene?.summary) {
    return curatedGene.summary;
  }
  return geneData.summary || `${geneData.symbol} is a human gene with live annotation returned from public genomic resources.`;
}

function genePlainMeaning(geneData, curatedGene) {
  if (curatedGene?.plainMeaning) {
    return curatedGene.plainMeaning;
  }
  return `${geneData.symbol} may influence how cells grow, repair damage, or respond to stress.`;
}

export function runEducationalInterpretation({ formData, geneData, variantData }) {
  const symptoms = symptomProfiles.filter((symptom) =>
    formData.symptoms.includes(symptom.id)
  );
  const demographicScore = contextScore(formData);
  const { weight: geneWeight, curated } = deriveGeneWeight(geneData);
  const { weight: variantWeight, note: variantReasoning } = deriveVariantWeight(variantData);
  const symptomScore = symptoms.reduce((sum, symptom) => sum + symptom.weight, 0);
  const overlap = buildAssociationOverlap(geneData.symbol, geneData.summary, symptoms);
  const overlapBonus = Math.min(overlap.length * 7, 18);
  const multiSymptomBonus = symptoms.length >= 3 ? 8 : symptoms.length === 2 ? 4 : 0;

  const rawScore =
    geneWeight +
    variantWeight +
    symptomScore +
    demographicScore +
    overlapBonus +
    multiSymptomBonus;
  const score = Math.min(rawScore, MAX_SCORE);
  const band = getRiskBand(score);

  const transcriptCount = geneData.transcriptCount || 0;
  const coordinates = geneData.chromosome
    ? `chr${geneData.chromosome}:${geneData.start}-${geneData.end}`
    : "genomic coordinates not available";

  const reasoning = [
    `${geneData.symbol} contributes ${geneWeight} points from live gene evidence and cancer-relevance heuristics.`,
    `Selected symptoms contribute ${symptomScore} points based on their broad clinical relevance.`,
    `Patient context contributes ${demographicScore} points from age, family history, and smoking profile.`,
    `${geneData.symbol} is returned as a ${geneData.type || "gene"} with ${transcriptCount || "unknown"} transcripts and coordinates ${coordinates}.`,
    variantReasoning,
  ];

  if (overlap.length) {
    reasoning.push(
      `Gene and symptom overlap adds ${overlapBonus} points because both point toward ${overlap.join(
        ", "
      )}-related patterns.`
    );
  }

  if (multiSymptomBonus) {
    reasoning.push(
      `Multiple symptoms add ${multiSymptomBonus} points because combined patterns can carry more interpretive weight than a single symptom alone.`
    );
  }

  return {
    score,
    band,
    reasoning,
    symptoms,
    overlap,
    gene: {
      ...geneData,
      biologySummary: geneBiologySummary(geneData, curated),
      plainMeaning: genePlainMeaning(geneData, curated),
      curatedKeywords: deriveGeneKeywords(geneData.summary),
    },
    variant: variantData,
    context: {
      ageGroup: contextProfiles.ageGroup[formData.ageGroup].label,
      familyHistory: contextProfiles.familyHistory[formData.familyHistory].label,
      smokingStatus: contextProfiles.smokingStatus[formData.smokingStatus].label,
    },
    evidenceNote: [
      `Live gene evidence was fetched from ${listify(geneData.sources).join(", ")}.`,
      variantData
        ? `Live variant evidence was fetched from ${listify(variantData.sources).join(", ")}.`
        : "No live variant evidence was included for this run.",
    ].join(" "),
  };
}
