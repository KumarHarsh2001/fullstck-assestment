# Transaction Webhook Service

A robust FastAPI-based service that receives transaction webhooks from external payment processors and processes them reliably in the background.

## Features

- **Fast Webhook Processing**: Responds within 500ms with 202 Accepted status
- **Background Processing**: Handles transactions asynchronously with 30-second processing delay
- **Idempotency**: Prevents duplicate processing of the same transaction
- **Health Monitoring**: Built-in health check endpoint
- **Transaction Querying**: Retrieve transaction status by ID
- **Persistent Storage**: PostgreSQL database for reliable data storage
- **In-Memory Idempotency**: Thread-safe duplicate transaction detection

## API Endpoints

### 1. Health Check
```
GET /
```
Returns service health status and current timestamp.

**Response:**
```json
{
  "status": "HEALTHY",
  "current_time": "2024-01-15T10:30:00Z"
}
```

### 2. Transaction Webhook
```
POST /v1/webhooks/transactions
```
Accepts transaction webhooks from payment processors.

**Request Body:**
```json
{
  "transaction_id": "txn_abc123def456",
  "source_account": "acc_user_789",
  "destination_account": "acc_merchant_456",
  "amount": 1500,
  "currency": "INR"
}
```

**Response:** 202 Accepted (empty body or acknowledgment message)

### 3. Transaction Status Query
```
GET /v1/transactions/{transaction_id}
```
Retrieve the status of a specific transaction.

**Response:**
```json
{
  "transaction_id": "txn_abc123def456",
  "source_account": "acc_user_789",
  "destination_account": "acc_merchant_456",
  "amount": 15.00,
  "currency": "INR",
  "status": "PROCESSED",
  "created_at": "2024-01-15T10:30:00Z",
  "processed_at": "2024-01-15T10:30:30Z"
}
```

## Technical Architecture

### Framework & Libraries
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: Python SQL toolkit and Object-Relational Mapping
- **PostgreSQL**: Robust, open-source relational database
- **Uvicorn**: ASGI server for running FastAPI applications
- **In-Memory Tracking**: Thread-safe sets for idempotency

### Key Design Decisions

1. **FastAPI**: Chosen for its automatic API documentation, type safety, and excellent performance
2. **Background Tasks**: Uses FastAPI's built-in BackgroundTasks for async processing
3. **In-Memory Idempotency**: Thread-safe in-memory tracking for duplicate detection
4. **PostgreSQL**: Ensures ACID compliance and data durability
5. **Docker**: Containerized deployment for consistency and scalability

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Python 3.11+ (optional, for local development)

### Easy Run Scripts

**Windows:**
```bash
run.bat
```

**Linux/Mac:**
```bash
chmod +x run.sh
./run.sh
```

This will automatically start all services (app, database) using Docker Compose.

Access points:
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- PostgreSQL: localhost:5432

### Manual Setup

1. **Clone the repository:**
```bash
git clone <repository-url>
cd transaction-webhook-service
```

2. **Start the services:**
```bash
docker-compose up -d
```

3. **Verify the service is running:**
```bash
curl http://localhost:8000/
```

### Local Development

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Set up environment variables:**
```bash
export DATABASE_URL="postgresql://user:password@localhost/transaction_db"
```

3. **Start PostgreSQL (optional for local testing):**
```bash
# Using Docker Compose for dependencies only
docker-compose up -d db
```

4. **Run the application:**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Testing the Service

### 1. Health Check Test
```bash
curl http://localhost:8000/
```

### 2. Single Transaction Test
```bash
curl -X POST http://localhost:8000/v1/webhooks/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "txn_test_001",
    "source_account": "acc_user_123",
    "destination_account": "acc_merchant_456",
    "amount": 1500,
    "currency": "INR"
  }'
```

### 3. Check Transaction Status
```bash
curl http://localhost:8000/v1/transactions/txn_test_001
```

### 4. Duplicate Prevention Test
```bash
# Send the same transaction multiple times
curl -X POST http://localhost:8000/v1/webhooks/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "txn_test_001",
    "source_account": "acc_user_123",
    "destination_account": "acc_merchant_456",
    "amount": 1500,
    "currency": "INR"
  }'
```

## Performance Characteristics

- **Webhook Response Time**: < 500ms guaranteed
- **Background Processing**: 30-second delay per transaction
- **Concurrent Processing**: Handles multiple transactions simultaneously
- **Idempotency**: In-memory thread-safe duplicate detection
- **Database**: ACID-compliant PostgreSQL for data integrity

## Error Handling

- **Graceful Degradation**: Service continues operating even if individual transactions fail
- **Retry Logic**: Failed transactions can be reprocessed
- **Monitoring**: Comprehensive logging for debugging and monitoring
- **Health Checks**: Built-in endpoint for service monitoring

## Deployment

### 🌐 Live Deployment
- **Production URL**: https://fullstck-assestment.onrender.com/
- **API Documentation**: https://fullstck-assestment.onrender.com/docs
- **Health Check**: https://fullstck-assestment.onrender.com/

The service is deployed on Render with:
- **PostgreSQL**: Managed database on Render
- **Environment Variables**: Configurable database connections
- **Health Checks**: Ready for load balancer health monitoring
- **Stateless Design**: Horizontally scalable
- **In-Memory Idempotency**: No external dependencies like Redis

## Security Considerations

- **Input Validation**: Pydantic models ensure data integrity
- **SQL Injection Prevention**: SQLAlchemy ORM provides protection
- **Rate Limiting**: Can be added at the load balancer level
- **Authentication**: Can be extended with API keys or JWT tokens

## Monitoring & Observability

- **Structured Logging**: Comprehensive transaction processing logs
- **Health Endpoint**: Service status monitoring
- **Database Metrics**: Transaction processing statistics
- **Redis Metrics**: Cache hit rates and processing locks

## Future Enhancements

- **Authentication**: API key or JWT-based authentication
- **Rate Limiting**: Per-client rate limiting
- **Metrics**: Prometheus metrics integration
- **Dead Letter Queue**: Failed transaction retry mechanism
- **Webhook Signatures**: Cryptographic signature verification
