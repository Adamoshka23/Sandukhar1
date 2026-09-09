#!/bin/bash
#
# Safe-starts the local PostgreSQL 16 (Homebrew) service.
#
# DEPLOYMENT NOTE: the copy launchd actually runs lives outside this repo,
# at ~/Library/Application Support/sandukhar/pg-safe-start.sh — macOS's TCC
# privacy protection blocks launchd from executing scripts straight out of
# ~/Desktop (fails silently with "Operation not permitted"), even though
# running the same script by hand from a terminal works fine. This copy is
# kept for version control / visibility; keep the deployed copy in sync
# with it if you edit this file (see ~/Library/LaunchAgents/com.sandukhar.pg-safe-start.plist).
#
# Homebrew's own LaunchAgent already has RunAtLoad + KeepAlive, so it
# retries on its own — but Postgres refuses to start whenever
# postmaster.pid is left over from an unclean shutdown (sleep, power
# loss, force-quit), even if the PID it names belongs to an unrelated
# process by now. KeepAlive then retries forever against the same
# stale file and never recovers on its own.
#
# This script runs at login, confirms the lock is genuinely stale
# (the PID it names is not an actual postgres process) before ever
# touching it, then kicks the service.

set -u

PG_VERSION="16"
PG_DATA_DIR="/opt/homebrew/var/postgresql@${PG_VERSION}"
LOCK_FILE="${PG_DATA_DIR}/postmaster.pid"
LOG_FILE="/opt/homebrew/var/log/pg-safe-start.log"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') $1" >> "$LOG_FILE"
}

if /opt/homebrew/opt/postgresql@${PG_VERSION}/bin/pg_isready -q; then
    log "Postgres already up — nothing to do."
    exit 0
fi

if [ -f "$LOCK_FILE" ]; then
    LOCK_PID=$(head -n 1 "$LOCK_FILE" | tr -d '[:space:]')
    PROCESS_COMMAND=$(ps -p "$LOCK_PID" -o comm= 2>/dev/null)

    if [ -n "$LOCK_PID" ] && [[ "$PROCESS_COMMAND" != *postgres* ]]; then
        log "Stale lock file found (PID $LOCK_PID is '$PROCESS_COMMAND', not postgres) — removing it."
        rm -f "$LOCK_FILE"
    elif [ -n "$PROCESS_COMMAND" ]; then
        log "PID $LOCK_PID is a real postgres process — leaving lock file alone."
        exit 0
    fi
fi

log "Starting postgresql@${PG_VERSION}..."
/opt/homebrew/bin/brew services restart postgresql@${PG_VERSION} >> "$LOG_FILE" 2>&1

sleep 2
if /opt/homebrew/opt/postgresql@${PG_VERSION}/bin/pg_isready -q; then
    log "Postgres is up."
else
    log "Postgres still not responding after restart attempt — needs manual attention."
fi
