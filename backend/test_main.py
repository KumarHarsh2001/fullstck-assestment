import pytest
import asyncio
from fastapi.testclient import TestClient
from main import app, get_db, Transaction
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import redis

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the get_db dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert "current_time" in data

def test_webhook_endpoint():
    """Test the webhook endpoint"""
    transaction_data = {
        "transaction_id": "txn_test_001",
        "source_account": "acc_user_123",
        "destination_account": "acc_merchant_456",
        "amount": 1500,
        "currency": "INR"
    }
    
    response = client.post("/v1/webhooks/transactions", json=transaction_data)
    assert response.status_code == 202
    assert "message" in response.json()

def test_duplicate_webhook():
    """Test duplicate webhook handling"""
    transaction_data = {
        "transaction_id": "txn_test_002",
        "source_account": "acc_user_123",
        "destination_account": "acc_merchant_456",
        "amount": 1500,
        "currency": "INR"
    }
    
    # First request
    response1 = client.post("/v1/webhooks/transactions", json=transaction_data)
    assert response1.status_code == 202
    
    # Duplicate request
    response2 = client.post("/v1/webhooks/transactions", json=transaction_data)
    assert response2.status_code == 202
    assert "already" in response2.json()["message"].lower()

def test_get_transaction():
    """Test getting transaction status"""
    transaction_data = {
        "transaction_id": "txn_test_003",
        "source_account": "acc_user_123",
        "destination_account": "acc_merchant_456",
        "amount": 1500,
        "currency": "INR"
    }
    
    # Create transaction
    client.post("/v1/webhooks/transactions", json=transaction_data)
    
    # Get transaction
    response = client.get("/v1/transactions/txn_test_003")
    assert response.status_code == 200
    data = response.json()
    assert data["transaction_id"] == "txn_test_003"
    assert data["status"] == "PROCESSING"
    assert data["amount"] == 15.0  # Converted from cents

def test_get_nonexistent_transaction():
    """Test getting non-existent transaction"""
    response = client.get("/v1/transactions/nonexistent")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

if __name__ == "__main__":
    pytest.main([__file__])
