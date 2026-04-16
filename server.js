import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function normalizeArray(value) {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Upstream request failed with status ${response.status}.`);
  }

  return response.json();
}

function uniqueStrings(values) {
  return [...new Set(values.filter(Boolean))];
}

function pickPrimaryGeneHit(payload) {
  const hits = payload.hits || [];
  const primary = hits.find((hit) => hit.symbol) || hits[0];

  if (!primary) {
    return null;
  }

  const genomicPosition = Array.isArray(primary.genomic_pos)
    ? primary.genomic_pos[0]
    : primary.genomic_pos;
  const ensemblGene =
    typeof primary.ensembl === "object"
      ? Array.isArray(primary.ensembl)
        ? primary.ensembl[0]?.gene
        : primary.ensembl?.gene
      : primary.ensembl;

  return {
    symbol: primary.symbol,
    name: primary.name,
    summary: primary.summary,
    entrezGene: primary.entrezgene,
    ensemblGene,
    chromosome: genomicPosition?.chr,
    start: genomicPosition?.start,
    end: genomicPosition?.end,
    strand: genomicPosition?.strand,
    type: primary.type_of_gene,
    sources: ["MyGene.info"],
  };
}

function normalizeGeneSearch(payload) {
  return (payload.hits || []).map((hit) => ({
    symbol: hit.symbol,
    name: hit.name,
    entrezGene: hit.entrezgene,
  }));
}

function summarizeTranscriptCount(ensemblPayload) {
  return normalizeArray(ensemblPayload.Transcript).length;
}

function normalizeGeneRecord(genePayload, ensemblPayload) {
  return {
    ...genePayload,
    chromosome: ensemblPayload?.seq_region_name || genePayload.chromosome,
    start: ensemblPayload?.start || genePayload.start,
    end: ensemblPayload?.end || genePayload.end,
    strand: ensemblPayload?.strand || genePayload.strand,
    canonicalTranscript: ensemblPayload?.canonical_transcript || null,
    transcriptCount: ensemblPayload ? summarizeTranscriptCount(ensemblPayload) : null,
    sources: uniqueStrings([
      ...(genePayload.sources || []),
      ensemblPayload ? "Ensembl REST" : null,
    ]),
  };
}

function normalizeVariantHit(hit, query) {
  const clinvarRcv = normalizeArray(hit.clinvar?.rcv);
  const snpeffAnn = normalizeArray(hit.snpeff?.ann);
  const cosmicIds = uniqueStrings(
    normalizeArray(hit.cosmic?.cosmic_id || hit.cosmic?.cosmicid)
  );
  const genomicHgvs = normalizeArray(hit.clinvar?.hgvs?.genomic || hit.hgvs?.genomic);
  const codingHgvs = normalizeArray(hit.clinvar?.hgvs?.coding || hit.hgvs?.coding);
  const proteinHgvs = normalizeArray(hit.clinvar?.hgvs?.protein || hit.hgvs?.protein);

  return {
    query,
    variantId: hit._id,
    displayName: hit._id || query,
    rsid: hit.dbsnp?.rsid || null,
    clinvarSignificance:
      clinvarRcv[0]?.clinical_significance || hit.clinvar?.clinical_significance || null,
    conditions: uniqueStrings(clinvarRcv.map((entry) => entry.conditions?.name)).slice(0, 4),
    cosmicIds,
    hgvsGenomic: genomicHgvs[0] || null,
    hgvsCoding: codingHgvs[0] || snpeffAnn[0]?.hgvs_c || null,
    hgvsProtein: proteinHgvs[0] || snpeffAnn[0]?.hgvs_p || null,
    effect: snpeffAnn[0]?.effect || null,
    sources: ["MyVariant.info"],
  };
}

async function handleGeneSearch(requestUrl, response) {
  const query = requestUrl.searchParams.get("q")?.trim();
  if (!query) {
    sendJson(response, 400, { error: "Missing gene search query." });
    return;
  }

  const payload = await fetchJson(
    `https://mygene.info/v3/query?q=symbol:${encodeURIComponent(
      query
    )}*&species=human&fields=symbol,name,entrezgene&size=8`
  );

  sendJson(response, 200, { hits: normalizeGeneSearch(payload) });
}

async function handleGeneLookup(symbol, response) {
  const payload = await fetchJson(
    `https://mygene.info/v3/query?q=symbol:${encodeURIComponent(
      symbol
    )}&species=human&fields=symbol,name,summary,entrezgene,ensembl.gene,genomic_pos,type_of_gene&size=1`
  );

  const gene = pickPrimaryGeneHit(payload);
  if (!gene) {
    sendJson(response, 404, { error: `No live human gene record found for ${symbol}.` });
    return;
  }

  let ensemblPayload = null;
  try {
    ensemblPayload = await fetchJson(
      `https://rest.ensembl.org/lookup/symbol/homo_sapiens/${encodeURIComponent(
        symbol
      )}?expand=1`,
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    ensemblPayload = null;
  }

  sendJson(response, 200, normalizeGeneRecord(gene, ensemblPayload));
}

async function handleVariantLookup(requestUrl, response) {
  const query = requestUrl.searchParams.get("q")?.trim();
  if (!query) {
    sendJson(response, 400, { error: "Missing variant query." });
    return;
  }

  let payload;
  if (query.toLowerCase().startsWith("rs")) {
    payload = await fetchJson(
      `https://myvariant.info/v1/query?q=dbsnp.rsid:${encodeURIComponent(
        query
      )}&fields=_id,dbsnp.rsid,hgvs,clinvar,cosmic,snpeff.ann&size=1`
    );
  } else {
    payload = await fetchJson(
      `https://myvariant.info/v1/variant/${encodeURIComponent(
        query
      )}?fields=_id,dbsnp.rsid,hgvs,clinvar,cosmic,snpeff.ann`
    );
    sendJson(response, 200, normalizeVariantHit(payload, query));
    return;
  }

  const hit = payload.hits?.[0];
  if (!hit) {
    sendJson(
      response,
      404,
      { error: `No live variant record found for ${query}. Try a valid rsID such as rs121913343.` }
    );
    return;
  }

  sendJson(response, 200, normalizeVariantHit(hit, query));
}

async function serveStatic(pathname, response) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(__dirname, safePath);

  if (!filePath.startsWith(__dirname)) {
    sendJson(response, 403, { error: "Forbidden." });
    return;
  }

  try {
    const file = await readFile(filePath);
    const extension = path.extname(filePath);
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
    });
    response.end(file);
  } catch (error) {
    sendJson(response, 404, { error: "Not found." });
  }
}

const server = http.createServer(async (request, response) => {
  if (!request.url) {
    sendJson(response, 400, { error: "Invalid request." });
    return;
  }

  const requestUrl = new URL(request.url, `http://127.0.0.1:${PORT}`);

  try {
    if (requestUrl.pathname === "/api/health") {
      sendJson(response, 200, {
        ok: true,
        sources: ["MyGene.info", "Ensembl REST", "MyVariant.info"],
      });
      return;
    }

    if (requestUrl.pathname === "/api/genes/search") {
      await handleGeneSearch(requestUrl, response);
      return;
    }

    if (requestUrl.pathname.startsWith("/api/genes/")) {
      const symbol = decodeURIComponent(requestUrl.pathname.replace("/api/genes/", "")).trim();
      await handleGeneLookup(symbol, response);
      return;
    }

    if (requestUrl.pathname === "/api/variants") {
      await handleVariantLookup(requestUrl, response);
      return;
    }

    await serveStatic(requestUrl.pathname, response);
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "Internal server error.",
    });
  }
});

server.listen(PORT, () => {
  console.log(`Onco.AI running at http://127.0.0.1:${PORT}`);
});
