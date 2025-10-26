from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlalchemy import create_engine, Column, String, Integer, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel
from datetime import datetime, timezone
import asyncio
import os
from typing import Optional
import redis
import json

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/transaction_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Redis setup for idempotency
redis_client = redis.Redis(host=os.getenv("REDIS_HOST", "localhost"), port=6379, db=0)

# Database Models
class Transaction(Base):
    __tablename__ = "transactions"
    
    transaction_id = Column(String, primary_key=True)
    source_account = Column(String, nullable=False)
    destination_account = Column(String, nullable=False)
    amount = Column(Integer, nullable=False)
    currency = Column(String, nullable=False)
    status = Column(String, default="PROCESSING")
    created_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)

# Pydantic Models
class TransactionWebhook(BaseModel):
    transaction_id: str
    source_account: str
    destination_account: str
    amount: int
    currency: str

class TransactionResponse(BaseModel):
    transaction_id: str
    source_account: str
    destination_account: str
    amount: float
    currency: str
    status: str
    created_at: datetime
    processed_at: Optional[datetime] = None

class HealthResponse(BaseModel):
    status: str
    current_time: datetime

# FastAPI app
app = FastAPI(title="Transaction Webhook Service", version="1.0.0")

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def process_transaction(transaction_data: TransactionWebhook):
    """Background task to process transaction with 30-second delay"""
    # Check if already processed (idempotency)
    if redis_client.exists(f"processed:{transaction_data.transaction_id}"):
        print(f"Transaction {transaction_data.transaction_id} already processed, skipping")
        return
    
    # Mark as being processed
    redis_client.setex(f"processing:{transaction_data.transaction_id}", 60, "true")
    
    try:
        # Simulate 30-second processing delay
        await asyncio.sleep(30)
        
        # Update database
        db = SessionLocal()
        try:
            transaction = db.query(Transaction).filter(
                Transaction.transaction_id == transaction_data.transaction_id
            ).first()
            
            if transaction:
                transaction.status = "PROCESSED"
                transaction.processed_at = datetime.utcnow()
                db.commit()
                
                # Mark as processed in Redis
                redis_client.setex(f"processed:{transaction_data.transaction_id}", 3600, "true")
                redis_client.delete(f"processing:{transaction_data.transaction_id}")
                
                print(f"Transaction {transaction_data.transaction_id} processed successfully")
            else:
                print(f"Transaction {transaction_data.transaction_id} not found in database")
        finally:
            db.close()
            
    except Exception as e:
        print(f"Error processing transaction {transaction_data.transaction_id}: {str(e)}")
        # Remove processing lock on error
        redis_client.delete(f"processing:{transaction_data.transaction_id}")

@app.get("/", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="HEALTHY",
        current_time=datetime.now(timezone.utc)
    )

@app.post("/v1/webhooks/transactions")
async def receive_webhook(transaction: TransactionWebhook, background_tasks: BackgroundTasks):
    """Webhook endpoint for receiving transactions"""
    try:
        # Check for duplicate processing
        if redis_client.exists(f"processed:{transaction.transaction_id}"):
            return JSONResponse(status_code=202, content={"message": "Transaction already processed"})
        
        if redis_client.exists(f"processing:{transaction.transaction_id}"):
            return JSONResponse(status_code=202, content={"message": "Transaction already being processed"})
        
        # Store transaction in database
        db = SessionLocal()
        try:
            # Check if transaction already exists
            existing_transaction = db.query(Transaction).filter(
                Transaction.transaction_id == transaction.transaction_id
            ).first()
            
            if not existing_transaction:
                db_transaction = Transaction(
                    transaction_id=transaction.transaction_id,
                    source_account=transaction.source_account,
                    destination_account=transaction.destination_account,
                    amount=transaction.amount,
                    currency=transaction.currency,
                    status="PROCESSING"
                )
                db.add(db_transaction)
                db.commit()
            
            # Add background task for processing
            background_tasks.add_task(process_transaction, transaction)
            
        finally:
            db.close()
        
        return JSONResponse(status_code=202, content={"message": "Transaction received"})
        
    except Exception as e:
        print(f"Error handling webhook: {str(e)}")
        return JSONResponse(status_code=202, content={"message": "Transaction received"})

@app.get("/v1/transactions/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(transaction_id: str):
    """Get transaction status by ID"""
    db = SessionLocal()
    try:
        transaction = db.query(Transaction).filter(
            Transaction.transaction_id == transaction_id
        ).first()
        
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        return TransactionResponse(
            transaction_id=transaction.transaction_id,
            source_account=transaction.source_account,
            destination_account=transaction.destination_account,
            amount=transaction.amount / 100,  # Convert from cents to currency units
            currency=transaction.currency,
            status=transaction.status,
            created_at=transaction.created_at,
            processed_at=transaction.processed_at
        )
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
