# Qiskit BB84 Integration Setup Guide

This guide explains how to set up and use the Qiskit backend integration for running BB84 Quantum Key Distribution protocol.

## 🚀 Quick Start

### 1. Start the Backend Server

```bash
# Option 1: Use the startup script (recommended)
python start_backend.py

# Option 2: Manual setup
cd backend
pip install -r requirements.txt
python app.py
```

The backend will start on `http://localhost:5000`

### 2. Start the Frontend

```bash
# In a new terminal
npm run dev
```

The frontend will start on `http://localhost:8082` (or another available port)

### 3. Access the Qiskit Integration

1. Open your browser and go to the frontend URL
2. Click on the "⚛️ Qiskit" tab in the sidebar
3. Configure your parameters and run the BB84 protocol

## 📋 Features

### Backend API
- **Real Quantum Hardware**: Execute BB84 on IBM Quantum backends
- **Simulation Mode**: Fast simulation without quantum hardware
- **RESTful API**: Easy integration with frontend
- **Error Handling**: Comprehensive error handling
- **CORS Support**: Cross-origin requests enabled

### Frontend Interface
- **Interactive Controls**: Configure number of bits and random seed
- **Real-time Results**: Display protocol results as they're generated
- **Visual Analysis**: See Alice's and Bob's data side by side
- **Basis Comparison**: Visual representation of basis matching
- **Performance Metrics**: QBER, key length, and success rate
- **Simulation Mode**: Toggle between real hardware and simulation

## 🔧 Configuration

### Backend Configuration
- **Port**: 5000 (configurable in `backend/app.py`)
- **IBM Quantum API**: Already configured in `qiskit/main.py`
- **CORS**: Enabled for all origins (development)

### Frontend Configuration
- **API Endpoint**: `http://localhost:5000` (configurable in `QiskitIntegration.tsx`)
- **Default Parameters**: 4 bits, seed 0
- **Simulation Mode**: Enabled by default

## 📊 API Endpoints

### POST `/api/bb84`
Run BB84 on real quantum hardware.

**Request:**
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
Run BB84 simulation (faster, no quantum hardware).

**Request/Response:** Same as above

### GET `/api/health`
Health check endpoint.

## 🛠️ Troubleshooting

### Backend Issues

1. **Port Already in Use**
   ```bash
   # Kill process using port 5000
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

2. **Dependencies Not Installed**
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **IBM Quantum API Issues**
   - Check if the API key in `qiskit/main.py` is valid
   - Ensure you have access to IBM Quantum backends

### Frontend Issues

1. **CORS Errors**
   - Ensure backend is running on port 5000
   - Check if CORS is enabled in backend

2. **API Connection Failed**
   - Verify backend is running: `curl http://localhost:5000/api/health`
   - Check browser console for error messages

3. **Build Errors**
   ```bash
   npm install
   npm run build
   ```

## 📈 Performance Notes

### Simulation Mode
- **Speed**: Very fast (milliseconds)
- **Accuracy**: 95% success rate with simulated noise
- **Use Case**: Development, testing, demonstrations

### Real Quantum Hardware
- **Speed**: Slower (seconds to minutes)
- **Accuracy**: Real quantum noise and errors
- **Use Case**: Research, real-world testing
- **Limitations**: Requires IBM Quantum account and credits

## 🔒 Security Notes

- The IBM Quantum API key is hardcoded for demonstration purposes
- For production, use environment variables
- The API key provides access to IBM Quantum backends
- Keep your API key secure and don't commit it to version control

## 📚 Understanding the Results

### Key Metrics
- **QBER (Quantum Bit Error Rate)**: Percentage of errors in the final key
- **Key Length**: Number of bits in the final sifted key
- **Keys Match**: Whether Alice's and Bob's final keys are identical

### Visual Elements
- **Alice's Data**: Initial bits, bases, and final key
- **Bob's Data**: Measurement bases, results, and final key
- **Basis Comparison**: Shows which qubits were measured in the same basis (✓) or different basis (✗)

## 🚀 Next Steps

1. **Experiment with Parameters**: Try different numbers of bits and seeds
2. **Compare Modes**: Run the same parameters in both simulation and real hardware modes
3. **Analyze Results**: Study the QBER and key generation rates
4. **Extend Functionality**: Add more quantum protocols or analysis tools

## 📞 Support

If you encounter issues:
1. Check the browser console for frontend errors
2. Check the backend terminal for server errors
3. Verify all dependencies are installed
4. Ensure both frontend and backend are running

Happy quantum computing! ⚛️
