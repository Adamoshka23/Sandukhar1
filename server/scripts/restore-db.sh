#!/usr/bin/env bash
# ============================================================
# DATABASE RESTORE
# Restores a dump produced by backup-db.sh. DESTRUCTIVE: this
# overwrites the current contents of the target database.
#
# Usage:
#   ./restore-db.sh server/backups/sandukhar_20260101_030000.dump
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$SERVER_DIR/.env"

DUMP_FILE="${1:-}"
if [ -z "$DUMP_FILE" ] || [ ! -f "$DUMP_FILE" ]; then
    echo "Usage: $0 <path-to-dump-file>" >&2
    exit 1
fi

export $(grep -E '^DB_(HOST|PORT|NAME|USER|PASSWORD)=' "$ENV_FILE" | xargs -0 2>/dev/null || grep -E '^DB_(HOST|PORT|NAME|USER|PASSWORD)=' "$ENV_FILE")

echo "This will OVERWRITE all data in database '${DB_NAME}' on ${DB_HOST}:${DB_PORT}"
echo "with the contents of: ${DUMP_FILE}"
read -r -p "Type the database name (${DB_NAME}) to confirm: " CONFIRM
if [ "$CONFIRM" != "$DB_NAME" ]; then
    echo "Aborted — confirmation did not match."
    exit 1
fi

PGPASSWORD="$DB_PASSWORD" pg_restore \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --clean --if-exists \
    "$DUMP_FILE"

echo "[$(date)] Restore complete."
