#!/usr/bin/env node

/**
 * Update Root-Me category statistics
 * Run: npm run update-stats
 */

import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = new URL('.', import.meta.url).pathname.slice(1); // Remove leading /

// Load .env file
function loadEnv() {
  try {
    const envPath = join(__dirname, '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim();
        if (key && value) {
          process.env[key.trim()] = value;
        }
      }
    });
  } catch (error) {
    // .env file not found, use existing environment variables
  }
}

loadEnv();

const API_KEY = process.env.ROOTME_API_KEY;
const USER_ID = process.env.ROOTME_USER_ID;

if (!API_KEY || !USER_ID) {
  console.error('Error: ROOTME_API_KEY and ROOTME_USER_ID environment variables are required.');
  process.exit(1);
}

class RateLimiter {
  constructor(maxCalls = 1, period = 60000) {
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
      const newNow = Date.now();
      while (this.timestamps.length > 0 && newNow - this.timestamps[0] >= this.period) {
        this.timestamps.shift();
      }
    }

    this.timestamps.push(Date.now());
  }
}

function extractRecords(payload, requiredKey) {
  const records = [];
  function walk(node) {
    if (node && typeof node === 'object') {
      if (requiredKey in node) {
        records.push(node);
      }
      if (Array.isArray(node)) {
        node.forEach((item) => walk(item));
      } else {
        Object.values(node).forEach((val) => walk(val));
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
    await limiter.wait();
    const url = offset > 0
      ? `https://api.www.root-me.org/challenges?debut_challenges=${offset}&api_key=${API_KEY}`
      : `https://api.www.root-me.org/challenges?api_key=${API_KEY}`;

    let retries = 0;
    while (retries < 3) {
      try {
        const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });

        if (resp.status === 429) {
          const retryAfter = resp.headers.get('Retry-After') || '60';
          const delay = (parseInt(retryAfter) || 60) * 1000;
          console.log(`Rate limited. Waiting ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          retries++;
          continue;
        }

        if (!resp.ok) {
          console.log(`fetchAllChallenges: got status ${resp.status} at offset ${offset}`);
          return challenges;
        }

        const json = await resp.json();
        const batch = extractRecords(json, 'id_challenge');

        if (!batch.length) {
          console.log(`fetchAllChallenges: got empty batch at offset ${offset}`);
          return challenges;
        }

        let newInBatch = 0;
        for (const item of batch) {
          const cid = String(item.id_challenge);
          if (!seenIds.has(cid)) {
            seenIds.add(cid);
            challenges.push(item);
            newInBatch++;
          }
        }

        if (newInBatch === 0 || batch.length < pageSize) {
          return challenges;
        }
        offset += pageSize;
        break;
      } catch (error) {
        console.error('Error fetching challenges:', error.message);
        return challenges;
      }
    }
  }
}

async function fetchRubriqueNames(limiter) {
  const names = new Map();
  const seenIds = new Set();
  let offset = 0;

  try {
    while (true) {
      await limiter.wait();
      const url = offset > 0
        ? `https://api.www.root-me.org/rubriques?debut_rubriques=${offset}&api_key=${API_KEY}`
        : `https://api.www.root-me.org/rubriques?api_key=${API_KEY}`;

      let retries = 0;
      while (retries < 3) {
        const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });

        if (resp.status === 429) {
          const retryAfter = resp.headers.get('Retry-After') || '60';
          const delay = (parseInt(retryAfter) || 60) * 1000;
          console.log(`Rate limited. Waiting ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          retries++;
          continue;
        }

        if (!resp.ok) {
          console.log(`fetchRubriqueNames: got status ${resp.status}`);
          return names;
        }

        const json = await resp.json();
        const batch = extractRecords(json, 'id_rubrique');

        if (!batch.length) return names;

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

        if (newCount === 0) return names;
        offset += batch.length;
        break;
      }
    }
  } catch (error) {
    console.error('Error fetching rubriques:', error.message);
  }

  return names;
}

async function fetchAuthor(limiter, authorId) {
  await limiter.wait();

  try {
    const url = `https://api.www.root-me.org/auteurs/${authorId}?api_key=${API_KEY}`;

    let retries = 0;
    while (retries < 3) {
      const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });

      if (resp.status === 429) {
        const retryAfter = resp.headers.get('Retry-After') || '60';
        const delay = (parseInt(retryAfter) || 60) * 1000;
        console.log(`Rate limited. Waiting ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        retries++;
        continue;
      }

      if (!resp.ok) {
        console.log(`fetchAuthor: got status ${resp.status}`);
        return {};
      }

      const json = await resp.json();
      const records = extractRecords(json, 'id_auteur');
      if (records.length > 0) return records[0];

      if (json['0'] && typeof json['0'] === 'object') return json['0'];
      return json;
    }
  } catch (error) {
    console.error('Error fetching author:', error.message);
  }

  return {};
}

async function main() {
  try {
    console.log('Fetching Root-Me category statistics...');

    const limiter = new RateLimiter(1, 60000);

    const rubriqueNames = await fetchRubriqueNames(limiter);
    console.log(`Fetched ${rubriqueNames.size} rubrique names`);

    const allChallenges = await fetchAllChallenges(limiter);
    console.log(`Fetched ${allChallenges.length} challenges`);

    if (allChallenges.length === 0) {
      console.error('No challenges fetched. The API may be unavailable.');
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

    const outputPath = join(__dirname, 'src', 'data', 'category-stats.json');
    writeFileSync(outputPath, JSON.stringify({ categoryStats }, null, 2));

    console.log(`\n✓ Computed stats for ${Object.keys(categoryStats).length} categories`);
    console.log(`\nResults saved to: src/data/category-stats.json`);
    console.log('\nCategory completion rates:');
    for (const [cat, stats] of Object.entries(categoryStats)) {
      console.log(`  ${cat.padEnd(35)} ${stats.solved.toString().padStart(3)}/${stats.total.toString().padStart(3)} (${stats.percentage}%)`);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
