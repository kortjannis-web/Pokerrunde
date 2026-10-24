#!/bin/bash
# Lokaler SQL-Test: startet ein frisches PostgreSQL 16, laedt die Supabase-Attrappe, fuehrt alle Migrationen
# ZWEIMAL aus (Idempotenz) und danach alle Tests dev/test/sql/t_*.sql (als Nutzer per test_as + set role).
# Aufruf: bash dev/test/sql/run.sh   (Exit 1 bei Fehlern)
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$HERE/../../.."
BIN=/usr/lib/postgresql/16/bin
D="$(mktemp -d)"; chown postgres "$D" 2>/dev/null || true
PORT=$((54000 + RANDOM % 900))
as_pg() { if [ "$(id -u)" = 0 ]; then su postgres -s /bin/bash -c "$*"; else bash -c "$*"; fi; }
as_pg "$BIN/initdb -D '$D/db' -U postgres -A trust >/dev/null"
as_pg "$BIN/pg_ctl -D '$D/db' -o '-p $PORT -k $D -c listen_addresses= -c wal_level=logical' -l '$D/log' start >/dev/null"
trap 'as_pg "$BIN/pg_ctl -D \"$D/db\" stop -m fast >/dev/null"; rm -rf "$D"' EXIT
P="psql -h $D -p $PORT -U postgres -d postgres -v ON_ERROR_STOP=1 -q -X"
$P -f "$HERE/supabase-stub.sql" >/dev/null
for run in 1 2; do
  for f in "$ROOT"/supabase/migrations/*.sql; do [ -e "$f" ] || continue; echo "Lauf $run: $(basename "$f")"; $P -f "$f" >/dev/null; done
done
for t in "$HERE"/t_*.sql; do [ -e "$t" ] || continue; echo "Test: $(basename "$t")"; $P -f "$t"; done
echo "SQL OK"
