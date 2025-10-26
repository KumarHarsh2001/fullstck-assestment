#!/bin/bash

# Test script for Transaction Webhook Service

BASE_URL="http://localhost:8000"

echo "🚀 Testing Transaction Webhook Service"
echo "======================================"

# Test 1: Health Check
echo "📋 Test 1: Health Check"
response=$(curl -s "$BASE_URL/")
echo "Response: $response"
echo ""

# Test 2: Single Transaction
echo "📋 Test 2: Single Transaction"
transaction_id="txn_test_$(date +%s)"
echo "Transaction ID: $transaction_id"

response=$(curl -s -X POST "$BASE_URL/v1/webhooks/transactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"transaction_id\": \"$transaction_id\",
    \"source_account\": \"acc_user_123\",
    \"destination_account\": \"acc_merchant_456\",
    \"amount\": 1500,
    \"currency\": \"INR\"
  }")

echo "Webhook Response: $response"
echo ""

# Test 3: Check Transaction Status (immediately)
echo "📋 Test 3: Check Transaction Status (immediately)"
response=$(curl -s "$BASE_URL/v1/transactions/$transaction_id")
echo "Status Response: $response"
echo ""

# Test 4: Duplicate Prevention
echo "📋 Test 4: Duplicate Prevention"
response=$(curl -s -X POST "$BASE_URL/v1/webhooks/transactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"transaction_id\": \"$transaction_id\",
    \"source_account\": \"acc_user_123\",
    \"destination_account\": \"acc_merchant_456\",
    \"amount\": 1500,
    \"currency\": \"INR\"
  }")

echo "Duplicate Response: $response"
echo ""

# Test 5: Wait and Check Final Status
echo "📋 Test 5: Waiting 35 seconds for processing..."
sleep 35

response=$(curl -s "$BASE_URL/v1/transactions/$transaction_id")
echo "Final Status Response: $response"
echo ""

echo "✅ All tests completed!"
