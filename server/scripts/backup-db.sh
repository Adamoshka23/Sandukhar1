#!/usr/bin/env bash
# ============================================================
# DATABASE BACKUP
# Dumps the sandukhar Postgres database to server/backups/ and
# deletes dumps older than RETENTION_DAYS. Reads connection info
# from server/.env — run from anywhere, no arguments needed.
#
# Schedule it (example: nightly at 3am):
#   crontab -e
#   0 3 * * * /path/to/server/scripts/backup-db.sh >> /path/to/server/backups/backup.log 2>&1
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$SERVER_DIR/.env"
BACKUP_DIR="$SERVER_DIR/backups"
RETENTION_DAYS=14

if [ ! -f "$ENV_FILE" ]; then
    echo "ERROR: $ENV_FILE not found" >&2
    exit 1
fi

# Load DB_* vars from .env without executing the rest of the file
export $(grep -E '^DB_(HOST|PORT|NAME|USER|PASSWORD)=' "$ENV_FILE" | xargs -0 2>/dev/null || grep -E '^DB_(HOST|PORT|NAME|USER|PASSWORD)=' "$ENV_FILE")

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DUMP_FILE="$BACKUP_DIR/sandukhar_${TIMESTAMP}.dump"

echo "[$(date)] Starting backup of ${DB_NAME} -> ${DUMP_FILE}"

PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -Fc \
    -f "$DUMP_FILE"

echo "[$(date)] Backup complete: $(du -h "$DUMP_FILE" | cut -f1)"

# Rotation: delete dumps older than RETENTION_DAYS
find "$BACKUP_DIR" -name 'sandukhar_*.dump' -mtime "+${RETENTION_DAYS}" -print -delete

echo "[$(date)] Rotation complete (kept last ${RETENTION_DAYS} days)"
