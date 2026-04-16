function formatConditions(conditions = []) {
  if (!conditions.length) {
    return "no specific named conditions were highlighted in the returned variant record";
  }
  return conditions.slice(0, 3).join(", ");
}

export function translateInterpretation(result) {
  const symptomNames = result.symptoms.map((symptom) => symptom.label.toLowerCase());
  const symptomText = symptomNames.length ? symptomNames.join(", ") : "no additional symptoms";
  const variantText = result.variant
    ? `The selected variant is reported as ${result.variant.displayName || result.variant.query} and is associated with ${formatConditions(
        result.variant.conditions
      )}.`
    : "No specific variant annotation was added, so the result stays at the gene level.";

  const overlapText = result.overlap.length
    ? `The selected inputs overlap around ${result.overlap.join(", ")}-related patterns.`
    : "The selected inputs do not create a strong tissue-specific overlap, so the interpretation stays broad.";

  const biologySummary = `${result.gene.biologySummary} In this profile, the system is combining live gene evidence for ${result.gene.symbol} with ${symptomText}, the selected context, and ${result.variant ? "live variant annotation" : "no extra variant annotation"}. ${variantText} ${overlapText}`;

  let plainLanguageSummary = `This result does not mean someone has cancer. It means the chosen gene, context, and any live variant evidence create a ${result.band.label.toLowerCase()} pattern in this educational model.`;

  if (result.variant?.clinvarSignificance) {
    plainLanguageSummary += ` The live variant lookup reports ${result.variant.clinvarSignificance}, which is one reason the score may be higher or lower.`;
  }

  if (result.score >= 60) {
    plainLanguageSummary +=
      " In simple terms, enough known signals are lining up that this profile deserves careful understanding and real-world clinical follow-up if it reflects a real person.";
  } else if (result.score >= 40) {
    plainLanguageSummary +=
      " In simple terms, there are meaningful signals here, but they still need broader medical context and should not be read as a diagnosis.";
  } else {
    plainLanguageSummary +=
      " In simple terms, the current pattern is lighter and leaves substantial uncertainty.";
  }

  const takeawaySummary =
    "Use this output to understand why a gene or variant may matter biologically, what symptom overlap may mean, and what informed questions a person could bring to a clinician. It should not replace medical evaluation or treatment advice.";

  return {
    biologySummary,
    plainLanguageSummary,
    takeawaySummary,
  };
}

export function answerFollowUp(question, result) {
  const normalized = question.toLowerCase();

  if (!result) {
    return "Run a live analysis first, and then I can explain the gene, the variant significance, the symptom overlap, or what the score means in simpler language.";
  }

  if (normalized.includes("variant")) {
    return result.variant
      ? `${result.variant.displayName || result.variant.query} is the current live variant match. The returned significance is ${result.variant.clinvarSignificance || "not clearly stated"}, and the result mentions ${formatConditions(
          result.variant.conditions
        )}.`
      : "No variant was provided in the latest run, so the interpretation is based on the live gene record plus symptoms and background context.";
  }

  if (normalized.includes("gene")) {
    return `${result.gene.symbol} is described in the live sources as ${result.gene.name}. In simple terms, ${result.gene.plainMeaning}`;
  }

  if (normalized.includes("why") && normalized.includes("matter")) {
    return `${result.gene.plainMeaning} That matters because genes like this can influence growth, damage repair, or the way stressed cells respond to problems.`;
  }

  if (normalized.includes("score") || normalized.includes("risk")) {
    return `The score is a weighted educational summary, not a diagnosis. It combines live gene evidence, any live variant annotation, symptom relevance, patient context, and overlap between the biology and symptom pattern.`;
  }

  if (normalized.includes("support") || normalized.includes("care")) {
    return "A useful next step is to focus on understanding, write down persistent symptoms or questions, and bring them to a qualified clinician. Emotional support, clear communication, and organized records are often very helpful.";
  }

  return "The main idea is that Onco.AI is translating a live genomic record into plain language. It helps explain what the gene does, whether a variant carries known significance, how symptoms fit in, and what uncertainty still remains.";
}
