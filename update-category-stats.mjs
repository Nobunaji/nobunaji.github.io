#!/usr/bin/env node

/**
 * Update Root-Me category statistics
 * Run: npm run update-stats
 */

import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
function loadEnv() {
  try {
    const envPath = join(__dirname, '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) return;

      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (key && value !== '' && process.env[key] === undefined) {
        process.env[key] = value;
      }
    });
  } catch {
    // .env file not found, use existing environment variables
  }
}

loadEnv();

const BASE_URL = 'https://api.www.root-me.org';
const API_KEY = process.env.ROOTME_API_KEY;
const SPIP_SESSION = process.env.ROOTME_SPIP_SESSION;
const USER_ID = process.env.ROOTME_USER_ID;

if ((!API_KEY && !SPIP_SESSION) || !USER_ID) {
  console.error(
    'Error: ROOTME_USER_ID and either ROOTME_API_KEY or ROOTME_SPIP_SESSION are required.'
  );
  process.exit(1);
}

function buildCookieHeader() {
  const cookies = [];
  if (API_KEY) cookies.push(`api_key=${API_KEY}`);
  if (SPIP_SESSION) cookies.push(`spip_session=${SPIP_SESSION}`);
  return cookies.join('; ');
}

const COOKIE_HEADER = buildCookieHeader();

class RateLimiter {
  constructor(maxCalls = 10, period = 60000) {
    this.maxCalls = maxCalls;
    this.period = period;
    this.timestamps = [];
  }

  async wait() {
    const now = Date.now();
    while (this.timestamps.length > 0 && now - this.timestamps[0] >= this.period) {
      this.timestamps.shift();
    }

    if (this.timestamps.length >= this.maxCalls) {
      const sleepFor = this.period - (now - this.timestamps[0]) + 50;
      if (sleepFor > 0) {
        await new Promise((resolve) => setTimeout(resolve, sleepFor));
      }
      const afterSleep = Date.now();
      while (this.timestamps.length > 0 && afterSleep - this.timestamps[0] >= this.period) {
        this.timestamps.shift();
      }
    }

    this.timestamps.push(Date.now());
  }
}

async function rateLimitedGet(limiter, endpoint, params = {}, maxRetries = 3) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) {
      url.searchParams.set(k, String(v));
    }
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    await limiter.wait();
    const resp = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Cookie: COOKIE_HEADER,
      },
    });

    if (resp.status === 429 && attempt < maxRetries) {
      const retryAfter = resp.headers.get('Retry-After');
      const delay = (retryAfter && /^\d+$/.test(retryAfter) ? parseInt(retryAfter, 10) : 65) * 1000;
      console.log(`Rate limited (429). Waiting ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }

    if (!resp.ok) {
      const bodyText = await resp.text().catch(() => '');
      throw new Error(`HTTP ${resp.status} on ${endpoint}: ${bodyText.slice(0, 200)}`);
    }

    return resp.json();
  }

  throw new Error(`Unreachable retry loop exit for ${endpoint}`);
}

function extractRecords(payload, requiredKey) {
  const records = [];
  function walk(node) {
    if (node && typeof node === 'object') {
      if (requiredKey in node) {
        records.push(node);
      }
      if (Array.isArray(node)) {
        for (const item of node) walk(item);
      } else {
        for (const val of Object.values(node)) walk(val);
      }
    }
  }
  walk(payload);
  return records;
}

function extractCategory(item, rubriqueNames) {
  for (const key of ['rubrique', 'categorie', 'category']) {
    const val = item[key];
    if (typeof val === 'object' && val !== null) {
      const title = val.titre || val.id_rubrique;
      if (title !== null && title !== undefined && title !== '') {
        return rubriqueNames.get(String(title)) || String(title);
      }
    } else if (val !== null && val !== undefined && val !== '') {
      const s = String(val);
      return rubriqueNames.get(s) || s;
    }
  }

  const rid = item.id_rubrique;
  if (rid !== null && rid !== undefined && rid !== '') {
    const s = String(rid);
    return rubriqueNames.get(s) || s;
  }

  return 'Unknown';
}

async function fetchAllChallenges(limiter, pageSize = 50) {
  const challenges = [];
  const seenIds = new Set();
  let offset = 0;

  while (true) {
    const json = await rateLimitedGet(
      limiter,
      '/challenges',
      offset > 0 ? { debut_challenges: offset } : {}
    );
    const batch = extractRecords(json, 'id_challenge');
    if (!batch.length) break;

    let newInBatch = 0;
    for (const item of batch) {
      const cid = String(item.id_challenge);
      if (!seenIds.has(cid)) {
        seenIds.add(cid);
        challenges.push(item);
        newInBatch++;
      }
    }

    if (newInBatch === 0 || batch.length < pageSize) break;
    offset += pageSize;
  }

  return challenges;
}

async function fetchRubriqueNames(limiter) {
  const names = new Map();
  const seenIds = new Set();
  let offset = 0;

  try {
    while (true) {
      const json = await rateLimitedGet(
        limiter,
        '/rubriques',
        offset > 0 ? { debut_rubriques: offset } : {}
      );
      const batch = extractRecords(json, 'id_rubrique');
      if (!batch.length) break;

      let newCount = 0;
      for (const rub of batch) {
        const rid = String(rub.id_rubrique);
        const title = rub.titre || rub.nom;
        if (!seenIds.has(rid) && title) {
          seenIds.add(rid);
          names.set(rid, String(title));
          newCount++;
        }
      }

      if (newCount === 0) break;
      offset += batch.length;
    }
  } catch (error) {
    console.warn('Warning fetching rubriques (falling back to IDs):', error.message);
  }

  return names;
}

async function fetchAuthor(limiter, authorId) {
  const json = await rateLimitedGet(limiter, `/auteurs/${authorId}`);
  const records = extractRecords(json, 'id_auteur');
  if (records.length > 0) return records[0];
  if (json && typeof json === 'object' && json['0'] && typeof json['0'] === 'object') {
    return json['0'];
  }
  return json || {};
}

async function main() {
  try {
    console.log('Fetching Root-Me category statistics...');

    const limiter = new RateLimiter(10, 60000);

    const rubriqueNames = await fetchRubriqueNames(limiter);
    console.log(`Fetched ${rubriqueNames.size} rubrique names`);

    const allChallenges = await fetchAllChallenges(limiter);
    console.log(`Fetched ${allChallenges.length} challenges`);

    if (allChallenges.length === 0) {
      console.error('No challenges fetched. Check credentials and API availability.');
      process.exit(1);
    }

    const authorData = await fetchAuthor(limiter, USER_ID);
    console.log('Fetched author data');

    const totalByCategory = new Map();
    const solvedByCategory = new Map();
    const challengeCategoryMap = new Map();

    for (const chall of allChallenges) {
      const cid = String(chall.id_challenge);
      const cat = extractCategory(chall, rubriqueNames);
      totalByCategory.set(cat, (totalByCategory.get(cat) || 0) + 1);
      challengeCategoryMap.set(cid, cat);
    }

    const rawValidations = authorData.validations || [];
    const validations = extractRecords(rawValidations, 'id_challenge');
    const seenSolvedIds = new Set();

    for (const val of validations) {
      const cid = String(val.id_challenge);
      if (seenSolvedIds.has(cid)) continue;
      seenSolvedIds.add(cid);

      if (challengeCategoryMap.has(cid)) {
        const cat = challengeCategoryMap.get(cid);
        solvedByCategory.set(cat, (solvedByCategory.get(cat) || 0) + 1);
      }
    }

    const categoryStats = {};
    const sortedCategories = Array.from(totalByCategory.keys()).sort();
    for (const cat of sortedCategories) {
      const total = totalByCategory.get(cat);
      const solved = solvedByCategory.get(cat) || 0;
      const percentage = total > 0 ? Math.min(Math.round((solved / total) * 100), 100) : 0;
      categoryStats[cat] = { percentage, solved, total };
    }

    // Build directory to category mapping from the actual directories
    const { readdirSync } = await import('fs');
    const dataDir = join(__dirname, 'src', 'data', 'root-me-challenges');
    const directoryToCategory = {};
    
    try {
      const dirs = readdirSync(dataDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);
      
      for (const dir of dirs) {
        // Find matching category (may differ in accents/diacritics)
        const matchingCategory = sortedCategories.find(cat => {
          const dirNorm = dir.toLowerCase().replace(/é/g, 'e').replace(/è/g, 'e').replace(/ê/g, 'e');
          const catNorm = cat.toLowerCase().replace(/é/g, 'e').replace(/è/g, 'e').replace(/ê/g, 'e');
          return dirNorm === catNorm;
        }) || dir;
        
        directoryToCategory[dir] = matchingCategory;
      }
    } catch (error) {
      console.warn('Warning: Could not build directory mapping:', error.message);
    }

    const outputDir = join(__dirname, 'src', 'data');
    mkdirSync(outputDir, { recursive: true });
    const outputPath = join(outputDir, 'category-stats.json');
    writeFileSync(outputPath, JSON.stringify({ directoryToCategory, categoryStats }, null, 2));

    console.log(`\n✓ Computed stats for ${Object.keys(categoryStats).length} categories`);
    console.log(`✓ Created mapping for ${Object.keys(directoryToCategory).length} directories`);
    console.log(`\nResults saved to: src/data/category-stats.json`);
    console.log('\nCategory completion rates:');
    for (const [cat, stats] of Object.entries(categoryStats)) {
      console.log(
        `  ${cat.padEnd(35)} ${stats.solved.toString().padStart(3)}/${stats.total.toString().padStart(3)} (${stats.percentage}%)`
      );
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();