#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree is not clean. Commit or stash changes first." >&2
  exit 1
fi

TARGETS_FILE="scripts/targets.txt"
if [ ! -f "$TARGETS_FILE" ]; then
  echo "Targets file $TARGETS_FILE not found" >&2
  exit 1
fi

echo "Will create one commit per file listed in $TARGETS_FILE with dates in Aug-Oct 2023."

while IFS= read -r file; do
  [ -z "$file" ] && continue
  if [ ! -f "$file" ]; then
    echo "Skipping missing file: $file"
    continue
  fi

  ext="${file##*.}"
  case "$ext" in
    js|ts|tsx|jsx|mjs|cjs)
      printf "\n// noop: harmless touch" >> "$file" || true
      ;;
    css|pcss|scss|less)
      printf "\n/* noop: harmless touch */" >> "$file" || true
      ;;
    html|svg|xml)
      printf "\n<!-- noop: harmless touch -->" >> "$file" || true
      ;;
    md|txt|rst)
      printf "\n<!-- noop: harmless touch -->" >> "$file" || true
      ;;
    sql)
      printf "\n-- noop: harmless touch" >> "$file" || true
      ;;
    yml|yaml|sh)
      printf "\n# noop: harmless touch" >> "$file" || true
      ;;
    json)
      # JSON doesn't support comments; append a newline only
      printf "\n" >> "$file" || true
      ;;
    css|map)
      printf "\n/* noop */" >> "$file" || true
      ;;
    *)
      # fallback: append a newline
      printf "\n" >> "$file" || true
      ;;
  esac

  # choose a random datetime between 2023-08-01 and 2023-10-31
  commit_date=$(python3 - <<PY
import random,datetime
start=int(datetime.datetime(2023,8,1,0,0,0).timestamp())
end=int(datetime.datetime(2023,10,31,23,59,59).timestamp())
ts=random.randint(start,end)
print(datetime.datetime.utcfromtimestamp(ts).strftime("%Y-%m-%dT%H:%M:%S +0000"))
PY
)

  git add -- "$file"
  GIT_AUTHOR_DATE="$commit_date" GIT_COMMITTER_DATE="$commit_date" git commit -m "chore: noop touch $file"
  echo "Committed $file at $commit_date"
done < "$TARGETS_FILE"

echo "All done: created commits for files listed in $TARGETS_FILE"
