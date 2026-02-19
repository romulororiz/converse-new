/**
 * Strict batched cover URL correction using Open Library.
 *
 * Defaults:
 * - Dry-run mode (no DB writes)
 * - Batch size 25
 * - Offset 0
 * - Strict matching (skip uncertain)
 * - Never nulls existing covers
 *
 * Examples:
 *   node scripts/update-covers.mjs
 *   node scripts/update-covers.mjs --batch-size 25 --offset 25
 *   node scripts/update-covers.mjs --batch-size 25 --offset 0 --apply
 */

import pg from 'pg';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

function parseArgs(argv) {
  const options = {
    batchSize: 25,
    offset: 0,
    apply: false,
    delayMs: 150,
    reportDir: path.join('migration-artifacts', 'covers'),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--batch-size') {
      options.batchSize = Math.max(1, Number(argv[index + 1] ?? 25));
      index += 1;
    } else if (arg === '--offset') {
      options.offset = Math.max(0, Number(argv[index + 1] ?? 0));
      index += 1;
    } else if (arg === '--delay-ms') {
      options.delayMs = Math.max(0, Number(argv[index + 1] ?? 150));
      index += 1;
    } else if (arg === '--apply') {
      options.apply = true;
    } else if (arg === '--report-dir') {
      options.reportDir = argv[index + 1] ?? options.reportDir;
      index += 1;
    }
  }

  return options;
}

function loadDatabaseUrl() {
  const envPath = path.resolve('.env.local');
  const envFile = readFileSync(envPath, 'utf-8');
  for (const line of envFile.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator <= 0) continue;

    const key = line.slice(0, separator).trim();
    if (key !== 'DATABASE_URL') continue;

    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value) return value;
  }

  throw new Error('DATABASE_URL not found in .env.local');
}

function normalize(text) {
  return (text ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  return new Set(normalize(text).split(' ').filter(Boolean));
}

function tokenOverlapScore(a, b) {
  if (!a.size || !b.size) return 0;
  let overlap = 0;
  for (const token of a) {
    if (b.has(token)) overlap += 1;
  }
  return overlap / Math.max(a.size, b.size);
}

function getExistingConfidence(coverUrl) {
  if (!coverUrl) return 0;

  try {
    const hostname = new URL(coverUrl).hostname.toLowerCase();
    if (hostname === 'covers.openlibrary.org') return 80;
    if (hostname === 'cover.openlibrary.org') return 75;
    return 20;
  } catch {
    return 10;
  }
}

function scoreCandidate(book, candidate) {
  const titleNorm = normalize(book.title);
  const authorNorm = normalize(book.author ?? '');
  const candidateTitleNorm = normalize(candidate.title ?? '');
  const candidateAuthorNorm = normalize((candidate.author_name ?? []).join(' '));

  const exactTitle = titleNorm.length > 0 && titleNorm === candidateTitleNorm;
  const exactAuthor =
    authorNorm.length > 0 &&
    candidateAuthorNorm.length > 0 &&
    (candidateAuthorNorm.includes(authorNorm) || authorNorm.includes(candidateAuthorNorm));

  const titleOverlap = tokenOverlapScore(tokenize(book.title), tokenize(candidate.title ?? ''));
  const authorOverlap =
    authorNorm.length > 0
      ? tokenOverlapScore(tokenize(book.author ?? ''), tokenize((candidate.author_name ?? []).join(' ')))
      : 0;

  let score = 0;
  if (exactTitle) score += 70;
  else score += Math.round(titleOverlap * 55);

  if (authorNorm.length > 0) {
    if (exactAuthor) score += 25;
    else score += Math.round(authorOverlap * 20);
  } else {
    score += 5;
  }

  if (!candidate.cover_i) score -= 40;

  return {
    score,
    exactTitle,
    exactAuthor,
    titleOverlap,
    authorOverlap,
  };
}

function isCandidateAcceptable(matchDetails, score, hasAuthor) {
  if (!matchDetails.exactTitle) return false;
  if (hasAuthor && !matchDetails.exactAuthor && matchDetails.authorOverlap < 0.8) return false;
  return score >= 85;
}

async function searchOpenLibraryCandidates(title, author) {
  const params = new URLSearchParams({
    title,
    limit: '10',
    fields: 'key,title,author_name,cover_i,first_publish_year,isbn,edition_key',
  });

  if (author && normalize(author).length > 0) {
    params.set('author', author);
  }

  const url = `https://openlibrary.org/search.json?${params.toString()}`;

  const response = await fetch(url, {
    headers: { 'User-Agent': 'ConversAI/1.0 (strict-cover-updater)' },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) {
    throw new Error(`OpenLibrary search failed (${response.status})`);
  }

  const data = await response.json();
  return Array.isArray(data.docs) ? data.docs : [];
}

function nowStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const DATABASE_URL = loadDatabaseUrl();

  mkdirSync(options.reportDir, { recursive: true });

  const pool = new pg.Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  console.log('Fetching batch from database...');
  const { rows: books } = await pool.query(
    `
      SELECT id, title, author, cover_url, metadata
      FROM books
      ORDER BY title ASC, id ASC
      LIMIT $1 OFFSET $2
    `,
    [options.batchSize, options.offset]
  );

  console.log(
    `Mode: ${options.apply ? 'APPLY (writes enabled)' : 'DRY-RUN'} | Batch size: ${options.batchSize} | Offset: ${options.offset}`
  );
  console.log(`Books in batch: ${books.length}\n`);

  const report = {
    executedAt: new Date().toISOString(),
    mode: options.apply ? 'apply' : 'dry-run',
    offset: options.offset,
    batchSize: options.batchSize,
    totalInBatch: books.length,
    updated: [],
    skippedNoMatch: [],
    skippedUncertain: [],
    unchanged: [],
    errors: [],
  };

  for (let index = 0; index < books.length; index += 1) {
    const book = books[index];
    process.stdout.write(`[${index + 1}/${books.length}] ${book.title} → `);

    try {
      const candidates = await searchOpenLibraryCandidates(book.title, book.author);
      const scored = candidates
        .map((candidate) => {
          const matchDetails = scoreCandidate(book, candidate);
          return {
            candidate,
            matchDetails,
            score: matchDetails.score,
            url: candidate.cover_i
              ? `https://covers.openlibrary.org/b/id/${candidate.cover_i}-L.jpg`
              : null,
          };
        })
        .filter((entry) => entry.url)
        .sort((a, b) => b.score - a.score);

      if (scored.length === 0) {
        console.log('skip (no candidates)');
        report.skippedNoMatch.push({
          id: book.id,
          title: book.title,
          author: book.author,
        });
        await new Promise((resolve) => setTimeout(resolve, options.delayMs));
        continue;
      }

      const top = scored[0];
      const second = scored[1] ?? null;
      const hasAuthor = normalize(book.author ?? '').length > 0;
      const acceptable = isCandidateAcceptable(top.matchDetails, top.score, hasAuthor);
      const ambiguous = second && Math.abs(top.score - second.score) <= 3;

      if (!acceptable || ambiguous) {
        console.log('skip (uncertain)');
        report.skippedUncertain.push({
          id: book.id,
          title: book.title,
          author: book.author,
          currentCoverUrl: book.cover_url,
          topCandidate: {
            title: top.candidate.title,
            author: top.candidate.author_name,
            score: top.score,
            url: top.url,
            matchDetails: top.matchDetails,
          },
          secondCandidate: second
            ? {
                title: second.candidate.title,
                author: second.candidate.author_name,
                score: second.score,
                url: second.url,
                matchDetails: second.matchDetails,
              }
            : null,
          reason: !acceptable ? 'below strict threshold' : 'ambiguous top candidates',
        });
        await new Promise((resolve) => setTimeout(resolve, options.delayMs));
        continue;
      }

      const existingConfidence = getExistingConfidence(book.cover_url);
      if (book.cover_url === top.url || top.score <= existingConfidence) {
        console.log('unchanged');
        report.unchanged.push({
          id: book.id,
          title: book.title,
          author: book.author,
          currentCoverUrl: book.cover_url,
          candidateUrl: top.url,
          candidateScore: top.score,
          existingConfidence,
        });
        await new Promise((resolve) => setTimeout(resolve, options.delayMs));
        continue;
      }

      const updateEntry = {
        id: book.id,
        title: book.title,
        author: book.author,
        oldCoverUrl: book.cover_url,
        newCoverUrl: top.url,
        score: top.score,
        existingConfidence,
        openLibraryKey: top.candidate.key,
      };

      if (options.apply) {
        await pool.query('UPDATE books SET cover_url = $1, updated_at = NOW() WHERE id = $2', [
          top.url,
          book.id,
        ]);
        console.log('updated');
      } else {
        console.log('would update');
      }

      report.updated.push(updateEntry);
    } catch (error) {
      console.log('error');
      report.errors.push({
        id: book.id,
        title: book.title,
        author: book.author,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    await new Promise((resolve) => setTimeout(resolve, options.delayMs));
  }

  const summary = {
    mode: report.mode,
    totalInBatch: report.totalInBatch,
    updatedCount: report.updated.length,
    unchangedCount: report.unchanged.length,
    skippedNoMatchCount: report.skippedNoMatch.length,
    skippedUncertainCount: report.skippedUncertain.length,
    errorsCount: report.errors.length,
  };

  report.summary = summary;

  const reportPath = path.join(
    options.reportDir,
    `cover-batch-offset-${options.offset}-size-${options.batchSize}-${nowStamp()}.json`
  );
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log('\nBatch complete:');
  console.log(summary);
  console.log(`Report written to: ${reportPath}`);

  await pool.end();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
