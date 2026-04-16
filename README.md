# Onco.AI

Onco.AI is a lightweight prototype for a computational oncology assistant that sits between raw cancer-related inputs and human understanding. It is designed to interpret structured inputs such as gene mutations, symptoms, and basic patient context, then translate the resulting reasoning into clear, non-technical language.

## Product framing

The project is intentionally positioned as an educational and interpretive system, not a diagnostic or medical authority.

- It uses a transparent computational layer rather than a black-box prediction model.
- It separates structured reasoning from natural-language explanation.
- It emphasizes understanding, context, and support instead of medical instruction.

## System design

The prototype is built around two layers:

1. `engine.js`
   Applies a simple weighted-scoring model across three structured input areas:
   - mutation relevance
   - symptom relevance
   - basic patient context

   The logic also adds small bonuses where gene associations and symptom associations overlap, making the reasoning more interpretable than a flat point total.

2. `translator.js`
   Converts the structured result into three plain-language sections:
   - what may be happening biologically
   - why it matters in simple terms
   - what the user should take away

This split is central to the concept of Onco.AI as an interpreter, not just a chatbot.

## Data grounding

The current prototype uses curated, TCGA/COSMIC-inspired oncology knowledge rather than direct database ingestion. Gene weighting and evidence notes are based on widely known cancer relevance patterns, such as:

- `TP53` as a broadly important tumor suppressor across many cancers
- `BRCA1` and `BRCA2` as DNA repair genes associated with hereditary cancer risk patterns
- `EGFR`, `KRAS`, `BRAF`, and `PIK3CA` as pathway-level signaling genes relevant in multiple tumor contexts
- `APC` as a classic colorectal cancer-related gene

This keeps the prototype explainable while leaving a clear path for future integration with structured public datasets.

## Current data connection status

This version is not connected to a live genomic server yet.

- Inputs are processed locally in the browser through the rule-based engine.
- Gene relevance is sourced from curated static knowledge in `knowledge.js`.
- A future backend can replace or augment this layer with real ingestion from TCGA, COSMIC, or a private genomics service.

## Global accessibility foundations

The interface has been adjusted to better support broader access:

- higher-contrast cream, black, and soft neutral styling
- keyboard-visible focus states and a skip link
- responsive layout for mobile and desktop
- reduced-motion support
- ARIA live regions for result updates
- multilingual UI switching with initial support for English, Spanish, French, Hindi, and Arabic

For a production-grade global release, the next step would be full content localization, region-aware medical wording review, and proper backend internationalization.

## Validation approach

The validation story for this project should focus on alignment rather than clinical performance.

- Check that higher scores appear for combinations already known to be more concerning in oncology literature.
- Confirm that mutation and symptom overlap behaves sensibly across common cancer contexts.
- Review whether the plain-language output stays faithful to the structured reasoning.
- Verify that every user-facing output includes an educational disclaimer and avoids diagnostic phrasing.

## Ethical boundary

Onco.AI should always make the following clear:

- It does not diagnose cancer.
- It does not recommend treatment.
- It does not replace clinicians, genetic counselors, or oncology teams.
- It is meant to support understanding, question-asking, and informed conversation.

## Files

- `index.html`: application shell and guided workflow
- `styles.css`: restrained clinical interface styling
- `knowledge.js`: learning content, support content, and cancer-related knowledge cards
- `engine.js`: rule-based computational scoring layer
- `translator.js`: explanation and follow-up translation layer
- `app.js`: front-end orchestration and UI behavior

## Run locally

This project now includes a small Node server so it can proxy live genomic API requests.

1. Run `npm start`
2. Open `http://127.0.0.1:3000`

## GitHub and deployment

This repository can be pushed to GitHub normally, but the full live app cannot run on GitHub Pages alone because it depends on `server.js` for live API access.

Recommended setup:

1. Host the code on GitHub
2. Deploy the Node app on a platform such as Render, Railway, or Vercel

If you want a GitHub Pages version, the app would need to be converted back to a static-only frontend with no live backend proxy.
