@echo off
REM Test script for Transaction Webhook Service

set BASE_URL=http://localhost:8000

echo 🚀 Testing Transaction Webhook Service
echo ======================================

REM Test 1: Health Check
echo 📋 Test 1: Health Check
curl -s "%BASE_URL%/"
echo.
echo.

REM Test 2: Single Transaction
echo 📋 Test 2: Single Transaction
for /f %%i in ('powershell -command "Get-Date -Format 'yyyyMMddHHmmss'"') do set timestamp=%%i
set transaction_id=txn_test_%timestamp%
echo Transaction ID: %transaction_id%

curl -s -X POST "%BASE_URL%/v1/webhooks/transactions" ^
  -H "Content-Type: application/json" ^
  -d "{\"transaction_id\": \"%transaction_id%\", \"source_account\": \"acc_user_123\", \"destination_account\": \"acc_merchant_456\", \"amount\": 1500, \"currency\": \"INR\"}"

echo.
echo.

REM Test 3: Check Transaction Status (immediately)
echo 📋 Test 3: Check Transaction Status (immediately)
curl -s "%BASE_URL%/v1/transactions/%transaction_id%"
echo.
echo.

REM Test 4: Duplicate Prevention
echo 📋 Test 4: Duplicate Prevention
curl -s -X POST "%BASE_URL%/v1/webhooks/transactions" ^
  -H "Content-Type: application/json" ^
  -d "{\"transaction_id\": \"%transaction_id%\", \"source_account\": \"acc_user_123\", \"destination_account\": \"acc_merchant_456\", \"amount\": 1500, \"currency\": \"INR\"}"

echo.
echo.

REM Test 5: Wait and Check Final Status
echo 📋 Test 5: Waiting 35 seconds for processing...
timeout /t 35 /nobreak >nul

curl -s "%BASE_URL%/v1/transactions/%transaction_id%"
echo.
echo.

echo ✅ All tests completed!
pause
