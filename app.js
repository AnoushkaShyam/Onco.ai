import { learningCards, supportGuides, symptomProfiles } from "./knowledge.js";
import { runEducationalInterpretation } from "./engine.js";
import { answerFollowUp, translateInterpretation } from "./translator.js";

const geneSearch = document.querySelector("#gene-search");
const geneSuggestions = document.querySelector("#gene-suggestions");
const variantInput = document.querySelector("#variant-input");
const symptomOptions = document.querySelector("#symptom-options");
const learnGrid = document.querySelector("#learn-grid");
const supportGrid = document.querySelector("#support-grid");
const analyzerForm = document.querySelector("#analyzer-form");
const resultState = document.querySelector("#result-state");
const resultContent = document.querySelector("#result-content");
const loadingState = document.querySelector("#loading-state");
const errorState = document.querySelector("#error-state");
const riskLevel = document.querySelector("#risk-level");
const riskScore = document.querySelector("#risk-score");
const riskBarFill = document.querySelector("#risk-bar-fill");
const biologySummary = document.querySelector("#biology-summary");
const plainLanguageSummary = document.querySelector("#plain-language-summary");
const takeawaySummary = document.querySelector("#takeaway-summary");
const reasoningList = document.querySelector("#reasoning-list");
const evidenceNote = document.querySelector("#evidence-note");
const sourcePillRow = document.querySelector("#source-pill-row");
const geneCardTitle = document.querySelector("#gene-card-title");
const geneCardSummary = document.querySelector("#gene-card-summary");
const geneMetadata = document.querySelector("#gene-metadata");
const variantCardTitle = document.querySelector("#variant-card-title");
const variantCardSummary = document.querySelector("#variant-card-summary");
const variantMetadata = document.querySelector("#variant-metadata");
const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");
const chatLog = document.querySelector("#chat-log");
const languageSelect = document.querySelector("#language-select");

let latestResult = null;
let geneSearchAbortController = null;

const translations = {
  en: {
    topbarNote: "Educational and interpretive only",
    eyebrowAssistant: "Computational oncology assistant",
    heroTitle: "Live genomic interpretation with plain-language explanations.",
    heroText:
      "Onco.AI now connects live public genomic data sources through a local backend, then translates gene and variant evidence into clear everyday understanding for educational use.",
    navLearn: "Learn",
    navAnalyze: "Analyze",
    navSupport: "Support",
    panelSystemDesign: "Live evidence stack",
    stackComputationTitle: "1. Genomic data layer",
    stackComputationText:
      "Queries MyGene.info, Ensembl, and MyVariant.info through a local proxy so the app can resolve live gene and variant information.",
    stackTranslationTitle: "2. Interpretation layer",
    stackTranslationText:
      "Combines live genomic evidence with symptom and context scoring to generate transparent educational reasoning.",
    stackDataTitle: "3. Translation layer",
    stackDataText:
      "Converts structured biomedical output into plain-language explanations, practical takeaways, and follow-up support guidance.",
    heroDisclaimer:
      "This application is not a diagnostic or treatment tool. It is designed for educational interpretation only.",
    learnEyebrow: "Learn",
    learnTitle: "Core oncology concepts, explained simply.",
    learnText:
      "Short explainers help users build context before exploring mutations, symptoms, or care-related questions.",
    analyzeEyebrow: "Analyze",
    analyzeTitle: "Search a real human gene, optionally add a variant, then interpret it.",
    analyzeText:
      "Enter a gene symbol such as TP53 or BRCA1. You can also provide a variant identifier like an rsID to pull live annotation from public genomics services.",
    analyzerNote:
      "This tool offers educational interpretation only and should not be used as a diagnosis.",
    labelGene: "Gene symbol",
    labelSymptoms: "Symptoms",
    labelAge: "Age group",
    labelFamily: "Family history",
    labelSmoking: "Smoking status",
    runInterpretation: "Run live interpretation",
    panelOutput: "Interpretation output",
    resultEmpty: "Search for a live gene to generate an educational interpretation.",
    metaRiskLevel: "Educational risk level",
    metaCompositeScore: "Composite score",
    metaBiology: "What may be happening biologically",
    metaSimple: "Why it matters in simple terms",
    metaTakeaway: "Takeaway",
    metaReasoning: "Reasoning signals",
    metaEvidence: "Evidence basis",
    panelFollowUp: "Follow-up assistant",
    chatIntro: "Ask a plain-language follow-up about the current result.",
    askButton: "Ask",
    supportEyebrow: "Support",
    supportTitle: "General care and support guidance without prescription.",
    supportText:
      "These guides focus on understanding, communication, and supportive care topics that commonly matter around cancer journeys.",
    validationEyebrow: "Validation",
    validationTitle: "Grounded in live public genomics sources, presented with clear limits.",
    validationReasoningTitle: "Live sources",
    validationReasoningText:
      "Gene search and gene summaries come from MyGene.info and Ensembl. Variant evidence is fetched from MyVariant.info when a supported identifier is provided.",
    validationLimitTitle: "Interpretation limit",
    validationLimitText:
      "Scores are educational summaries, not predictions of diagnosis, prognosis, or treatment response.",
    validationEthicsTitle: "Ethical boundary",
    validationEthicsText:
      "Onco.AI is intentionally framed as an interpreter between medical data and human understanding, not a replacement for clinical judgment.",
    chatPlaceholder: "Why does this mutation matter?",
  },
  es: {
    topbarNote: "Solo educativo e interpretativo",
    eyebrowAssistant: "Asistente de oncología computacional",
    heroTitle: "Interpretación genómica en vivo con explicaciones claras.",
    navLearn: "Aprender",
    navAnalyze: "Analizar",
    navSupport: "Apoyo",
    panelSystemDesign: "Capas de evidencia en vivo",
    askButton: "Preguntar",
    chatPlaceholder: "¿Por qué importa esta mutación?",
  },
  fr: {
    topbarNote: "Usage éducatif et interprétatif uniquement",
    eyebrowAssistant: "Assistant d'oncologie computationnelle",
    heroTitle: "Interprétation génomique en direct avec explications claires.",
    navLearn: "Apprendre",
    navAnalyze: "Analyser",
    navSupport: "Soutien",
    panelSystemDesign: "Pile de données en direct",
    askButton: "Demander",
    chatPlaceholder: "Pourquoi cette mutation est-elle importante ?",
  },
  hi: {
    topbarNote: "केवल शैक्षिक और व्याख्यात्मक उपयोग",
    eyebrowAssistant: "कम्प्यूटेशनल ऑन्कोलॉजी असिस्टेंट",
    heroTitle: "लाइव जीनोमिक व्याख्या, सरल भाषा में।",
    navLearn: "सीखें",
    navAnalyze: "विश्लेषण",
    navSupport: "सहायता",
    panelSystemDesign: "लाइव एविडेंस स्टैक",
    askButton: "पूछें",
    chatPlaceholder: "यह म्यूटेशन क्यों महत्वपूर्ण है?",
  },
  ar: {
    topbarNote: "للاستخدام التعليمي والتفسيري فقط",
    eyebrowAssistant: "مساعد الأورام الحاسوبي",
    heroTitle: "تفسير جينومي مباشر مع شرح واضح.",
    navLearn: "تعلّم",
    navAnalyze: "حلّل",
    navSupport: "دعم",
    panelSystemDesign: "طبقات الأدلة الحية",
    askButton: "اسأل",
    chatPlaceholder: "لماذا تهم هذه الطفرة؟",
  },
};

function getDictionary(language) {
  return { ...translations.en, ...(translations[language] || {}) };
}

function applyTranslations(language) {
  const dictionary = getDictionary(language);
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (dictionary[key]) {
      element.textContent = dictionary[key];
    }
  });

  chatInput.placeholder = dictionary.chatPlaceholder;
}

function renderLearningCards() {
  learnGrid.innerHTML = learningCards
    .map(
      (card) => `
        <article class="info-card">
          <span class="learn-tag">${card.tag}</span>
          <h3>${card.title}</h3>
          <p>${card.body}</p>
        </article>
      `
    )
    .join("");
}

function renderSupportGuides() {
  supportGrid.innerHTML = supportGuides
    .map(
      (guide) => `
        <article class="support-card">
          <span class="support-tag">${guide.tag}</span>
          <h3>${guide.title}</h3>
          <p>${guide.body}</p>
        </article>
      `
    )
    .join("");
}

function renderSymptomOptions() {
  symptomOptions.innerHTML = symptomProfiles
    .map(
      (symptom) => `
        <label class="chip-option">
          <input type="checkbox" name="symptoms" value="${symptom.id}" />
          <span>${symptom.label}</span>
        </label>
      `
    )
    .join("");
}

function appendChatMessage(type, text) {
  const message = document.createElement("div");
  message.className = `chat-message ${type}`;
  message.textContent = text;
  chatLog.appendChild(message);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function toneColor(score) {
  if (score >= 80) {
    return "linear-gradient(90deg, #c79b92 0%, #7d4343 100%)";
  }
  if (score >= 60) {
    return "linear-gradient(90deg, #dcc08e 0%, #8a6332 100%)";
  }
  if (score >= 40) {
    return "linear-gradient(90deg, #d6c1a1 0%, #5b4d37 100%)";
  }
  return "linear-gradient(90deg, #c7d2c6 0%, #415446 100%)";
}

function setLoadingState(isLoading) {
  loadingState.classList.toggle("hidden", !isLoading);
}

function setError(message = "") {
  errorState.textContent = message;
  errorState.classList.toggle("hidden", !message);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }

  return payload;
}

function normalizeGeneInput(value) {
  return value.trim().toUpperCase();
}

async function handleGeneSearchInput() {
  const query = normalizeGeneInput(geneSearch.value);

  if (query.length < 2) {
    geneSuggestions.innerHTML = "";
    return;
  }

  if (geneSearchAbortController) {
    geneSearchAbortController.abort();
  }

  geneSearchAbortController = new AbortController();

  try {
    const results = await fetchJson(`/api/genes/search?q=${encodeURIComponent(query)}`, {
      signal: geneSearchAbortController.signal,
    });

    geneSuggestions.innerHTML = results.hits
      .map(
        (hit) =>
          `<option value="${hit.symbol}">${hit.symbol} | ${hit.name || "human gene"}</option>`
      )
      .join("");
  } catch (error) {
    if (error.name !== "AbortError") {
      geneSuggestions.innerHTML = "";
    }
  }
}

function renderSourcePills(result) {
  const pills = [
    ...(result.gene.sources || []),
    ...(result.variant?.sources || []),
  ];
  const unique = [...new Set(pills)];

  sourcePillRow.innerHTML = unique
    .map((source) => `<span class="source-pill">${source}</span>`)
    .join("");
}

function renderMetadataList(listNode, items) {
  listNode.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
}

function renderGeneCard(gene) {
  geneCardTitle.textContent = `${gene.symbol} | ${gene.name}`;
  geneCardSummary.textContent = gene.summary || "Live summary unavailable for this gene.";

  renderMetadataList(geneMetadata, [
    `Gene type: ${gene.type || "not specified"}`,
    `Chromosome: ${gene.chromosome || "unknown"}`,
    `Coordinates: ${
      gene.chromosome ? `chr${gene.chromosome}:${gene.start}-${gene.end}` : "not available"
    }`,
    `Transcripts: ${gene.transcriptCount || "unknown"}`,
    `Canonical transcript: ${gene.canonicalTranscript || "not reported"}`,
    `Entrez Gene: ${gene.entrezGene || "not reported"}`,
    `Ensembl Gene: ${gene.ensemblGene || "not reported"}`,
  ]);
}

function renderVariantCard(variant) {
  if (!variant) {
    variantCardTitle.textContent = "Variant";
    variantCardSummary.textContent = "No variant was provided for this analysis.";
    variantMetadata.innerHTML = "";
    return;
  }

  variantCardTitle.textContent = variant.displayName || variant.query;
  variantCardSummary.textContent =
    variant.clinvarSignificance
      ? `Live significance: ${variant.clinvarSignificance}.`
      : "Live variant evidence was found, but significance is limited or not clearly reported.";

  renderMetadataList(variantMetadata, [
    `Query: ${variant.query}`,
    `rsID: ${variant.rsid || "not reported"}`,
    `Genomic HGVS: ${variant.hgvsGenomic || "not reported"}`,
    `Coding HGVS: ${variant.hgvsCoding || "not reported"}`,
    `Protein HGVS: ${variant.hgvsProtein || "not reported"}`,
    `Conditions: ${variant.conditions?.length ? variant.conditions.join(", ") : "not reported"}`,
    `COSMIC IDs: ${variant.cosmicIds?.length ? variant.cosmicIds.join(", ") : "not reported"}`,
  ]);
}

function renderResult(result) {
  const translation = translateInterpretation(result);
  latestResult = result;

  resultState.classList.add("hidden");
  resultContent.classList.remove("hidden");

  riskLevel.textContent = result.band.label;
  riskScore.textContent = `${result.score}/100`;
  riskBarFill.style.width = `${result.score}%`;
  riskBarFill.style.background = toneColor(result.score);

  biologySummary.textContent = translation.biologySummary;
  plainLanguageSummary.textContent = translation.plainLanguageSummary;
  takeawaySummary.textContent = translation.takeawaySummary;
  evidenceNote.textContent = result.evidenceNote;

  reasoningList.innerHTML = result.reasoning.map((item) => `<li>${item}</li>`).join("");

  renderSourcePills(result);
  renderGeneCard(result.gene);
  renderVariantCard(result.variant);
}

async function handleAnalysis(event) {
  event.preventDefault();
  setError("");
  setLoadingState(true);

  const formData = new FormData(analyzerForm);
  const normalizedGene = normalizeGeneInput(formData.get("gene"));
  const variantQuery = formData.get("variant").trim();

  try {
    const [geneData, variantData] = await Promise.all([
      fetchJson(`/api/genes/${encodeURIComponent(normalizedGene)}`),
      variantQuery
        ? fetchJson(`/api/variants?q=${encodeURIComponent(variantQuery)}`)
        : Promise.resolve(null),
    ]);

    const result = runEducationalInterpretation({
      formData: {
        gene: normalizedGene,
        symptoms: formData.getAll("symptoms"),
        ageGroup: formData.get("ageGroup"),
        familyHistory: formData.get("familyHistory"),
        smokingStatus: formData.get("smokingStatus"),
      },
      geneData,
      variantData,
    });

    renderResult(result);

    appendChatMessage(
      "assistant",
      `Live interpretation updated for ${result.gene.symbol}. ${result.band.label} with a composite score of ${result.score}/100.`
    );
  } catch (error) {
    setError(error.message);
  } finally {
    setLoadingState(false);
  }
}

function handleChat(event) {
  event.preventDefault();
  const question = chatInput.value.trim();

  if (!question) {
    return;
  }

  appendChatMessage("user", question);
  appendChatMessage("assistant", answerFollowUp(question, latestResult));
  chatInput.value = "";
}

let debounceTimer = null;
geneSearch.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(handleGeneSearchInput, 250);
});

renderLearningCards();
renderSupportGuides();
renderSymptomOptions();
applyTranslations("en");

analyzerForm.addEventListener("submit", handleAnalysis);
chatForm.addEventListener("submit", handleChat);
languageSelect.addEventListener("change", (event) => {
  applyTranslations(event.target.value);
});
