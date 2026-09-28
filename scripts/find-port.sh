#!/usr/bin/env bash
# Usage: ./scripts/find-port.sh [start] [end]  — prints the first free TCP port in range.
start=${1:-3100}
end=${2:-3199}
used=$(ss -tlnH | awk '{print $4}' | sed -E 's/.*:([0-9]+)$/\1/' | sort -un)

for ((p = start; p <= end; p++)); do
  if ! grep -qx "$p" <<<"$used"; then
    echo "$p"
    exit 0
  fi
done

echo "No free port in $start-$end" >&2
exit 1
