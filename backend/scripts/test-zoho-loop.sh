#!/usr/bin/env bash
# End-to-end Zoho loop test (local). Usage: ./scripts/test-zoho-loop.sh
set -euo pipefail
API="${API_URL:-http://localhost:5001/api}"
EMAIL="${TEST_EMAIL:-admin@sovereign.com}"
PASS="${TEST_PASSWORD:-password123}"

echo "=== Login ==="
TOKEN=$(curl -s -X POST "$API/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))")
test -n "$TOKEN" || { echo "Login failed"; exit 1; }
AUTH="Authorization: Bearer $TOKEN"

echo "=== Zoho status ==="
curl -s "$API/zoho/status" -H "$AUTH" | python3 -m json.tool

echo ""
echo "=== Import vendors from Zoho ==="
curl -s -X POST "$API/zoho/import/vendors" -H "$AUTH" | python3 -m json.tool

echo ""
echo "=== Sync unsynced vendors to Zoho ==="
curl -s -X POST "$API/zoho/sync/vendors" -H "$AUTH" | python3 -m json.tool

VENDOR=$(curl -s "$API/vendors" -H "$AUTH" | python3 -c "
import sys,json
vs=json.load(sys.stdin)
v=next((x for x in vs if x.get('zohoContactId')), vs[0] if vs else None)
print(v['id'] if v else '')
")
test -n "$VENDOR" || { echo "No vendors"; exit 1; }

echo ""
echo "=== Create request (vendor $VENDOR) ==="
REQ=$(curl -s -X POST "$API/requests" -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"title\":\"Zoho loop test $(date +%H%M%S)\",\"description\":\"Automated test\",\"amount\":2500,\"currency\":\"INR\",\"department\":\"Operations\",\"urgency\":\"MEDIUM\",\"vendor\":\"$VENDOR\",\"status\":\"SUBMITTED\"}")
echo "$REQ" | python3 -m json.tool
REQ_ID=$(echo "$REQ" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

echo ""
echo "=== Approve ==="
curl -s -X PATCH "$API/requests/$REQ_ID/status" -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"status":"APPROVED"}' | python3 -m json.tool

echo ""
echo "=== Generate PO ==="
PO=$(curl -s -X POST "$API/purchase-orders/generate" -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"requestId\":\"$REQ_ID\"}")
echo "$PO" | python3 -m json.tool

echo ""
echo "=== Done. If zohoSync.synced is false, reconnect Zoho in Settings and run retry-failed. ==="
