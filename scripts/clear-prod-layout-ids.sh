#!/bin/bash
FILE="${1:-/Users/damir/Downloads/layouts-import-6a8c435ac128c37f2155b905 (2).json}"
perl -pi -e 's/"id": "6a8c44[a-f0-9]+"/"id": ""/g' "$FILE"
REMAINING=$(grep -c '"id": "6a8c44' "$FILE" 2>/dev/null || echo 0)
echo "Cleared prod layout ids. Remaining 6a8c44 ids: $REMAINING"
