# BB84 Qiskit Backend API

This backend provides a REST API to run the BB84 Quantum Key Distribution protocol using Qiskit and IBM Quantum hardware.

## Features

- **Real Quantum Hardware**: Execute BB84 protocol on IBM Quantum backends
- **Simulation Mode**: Fast simulation without quantum hardware requirements
- **RESTful API**: Easy integration with frontend applications
- **Error Handling**: Comprehensive error handling and logging
- **CORS Support**: Cross-origin requests enabled for frontend integration

## API Endpoints

### POST `/api/bb84`
Run BB84 protocol on real quantum hardware.

**Request Body:**
```json
{
  "n_bits": 4,
  "seed": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "alice_bits": [0, 1, 0, 1],
    "alice_bases": [0, 1, 0, 1],
    "bob_bases": [1, 0, 1, 0],
    "bob_results": [1, 0, 1, 0],
    "alice_key": [0, 1],
    "bob_key": [0, 1],
    "qber": 0.0,
    "job_id": "job_12345",
    "key_length": 2,
    "keys_match": true
  }
}
```

### POST `/api/bb84/simulate`
Run BB84 protocol simulation (faster, no quantum hardware required).

**Request Body:**
```json
{
  "n_bits": 4,
  "seed": 0
}
```

**Response:** Same as `/api/bb84`

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "message": "BB84 API is running"
}
```

## Setup

1. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set IBM Quantum API Key:**
   The API key is already configured in the main.py file. For production, use environment variables.

3. **Start the Server:**
   ```bash
   python app.py
   ```

   Or use the startup script from the project root:
   ```bash
   python start_backend.py
   ```

## Configuration

- **Port**: 5000 (default)
- **Host**: 0.0.0.0 (all interfaces)
- **Debug**: True (development mode)

## Error Handling

The API returns appropriate HTTP status codes:
- `200`: Success
- `500`: Server error (with error details in response)

## CORS

Cross-Origin Resource Sharing is enabled for all routes to allow frontend integration.

## Dependencies

- Flask 2.3.3
- Flask-CORS 4.0.0
- Qiskit 0.45.0
- Qiskit-IBM-Runtime 0.15.0
- NumPy 1.24.3
