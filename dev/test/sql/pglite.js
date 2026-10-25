// SQL-Test ohne installiertes PostgreSQL (Windows, Mac): Postgres als WebAssembly (PGlite).
// Einmal: npm i @electric-sql/pglite@0.2.12 (irgendwo; Ordner der node_modules dann in PGLITE_DIR angeben).
// Aufruf: node dev/test/sql/pglite.js   (Supabase-Attrappe, supabase/pokerrunde.sql ZWEIMAL, dann alle t_*.sql)
const fs = require('fs'), path = require('path');
const HERE = __dirname, ROOT = path.join(HERE, '..', '..', '..');
const mod = process.env.PGLITE_DIR ? path.join(process.env.PGLITE_DIR, '@electric-sql', 'pglite') : '@electric-sql/pglite';
(async () => {
  const { PGlite } = await import(require('url').pathToFileURL(require.resolve(mod)).href);
  const db = new PGlite();
  const run = async (f) => { try { await db.exec(fs.readFileSync(f, 'utf8')); } catch (e) { console.error('FEHLER in ' + path.basename(f) + ': ' + e.message); process.exit(1); } };
  await run(path.join(HERE, 'supabase-stub.sql'));
  for (const n of [1, 2]) { console.log('Lauf ' + n + ': pokerrunde.sql'); await run(path.join(ROOT, 'supabase', 'pokerrunde.sql')); }
  for (const t of fs.readdirSync(HERE).filter((f) => /^t_.*\.sql$/.test(f)).sort()) { console.log('Test: ' + t); await run(path.join(HERE, t)); }
  console.log('SQL OK');
})();
