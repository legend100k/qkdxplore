from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import json
import traceback

# Add the qiskit directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'qiskit'))

from main import bb84_protocol, analyze_results

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/bb84', methods=['POST'])
def run_bb84():
    try:
        # Get parameters from request
        data = request.get_json() or {}
        n_bits = data.get('n_bits', 4)
        seed = data.get('seed', 0)
        
        # Run BB84 protocol
        results = bb84_protocol(n_bits=n_bits, seed=seed)
        
        # Calculate QBER
        alice_key = results['alice_key']
        bob_key = results['bob_key']
        
        if alice_key and bob_key:
            errors = sum(a != b for a, b in zip(alice_key, bob_key))
            qber = errors / len(alice_key) if alice_key else 0
        else:
            qber = 0
        
        # Prepare response - convert all numpy types to Python native types
        response = {
            'success': True,
            'data': {
                'alice_bits': [int(x) for x in results['alice_bits'].tolist()],
                'alice_bases': [int(x) for x in results['alice_bases'].tolist()],
                'bob_bases': [int(x) for x in results['bob_bases'].tolist()],
                'bob_results': [int(x) for x in results['bob_results']],
                'alice_key': [int(x) for x in alice_key],
                'bob_key': [int(x) for x in bob_key],
                'qber': float(qber),
                'job_id': str(results['job_id']),
                'key_length': int(len(alice_key)),
                'keys_match': bool(alice_key == bob_key)
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/bb84/simulate', methods=['POST'])
def simulate_bb84():
    """Run BB84 simulation without real quantum hardware, with optical noise support"""
    try:
        data = request.get_json() or {}
        n_bits = data.get('n_bits', 4)
        seed = data.get('seed', 0)
        
        # Optical noise parameters (optional)
        optical_noise = data.get('optical_noise', {})
        depolarization = optical_noise.get('depolarization', 0.01)
        phase_damping = optical_noise.get('phase_damping', 0.01)
        amplitude_damping = optical_noise.get('amplitude_damping', 0.05)
        fiber_length = optical_noise.get('fiber_length', 10)
        attenuation_coeff = optical_noise.get('attenuation_coeff', 0.20)
        
        # Import numpy for simulation
        import numpy as np
        np.random.seed(seed)
        
        # Calculate photon loss from fiber attenuation (Beer-Lambert law)
        photon_loss_prob = 1 - (10 ** (-(attenuation_coeff * fiber_length) / 10))
        combined_amplitude_damping = min(amplitude_damping + photon_loss_prob, 1.0)
        
        # Generate random data
        alice_bits = np.random.randint(2, size=n_bits)
        alice_bases = np.random.randint(2, size=n_bits)
        bob_bases = np.random.randint(2, size=n_bits)
        
        # Simulate Bob's measurements with optical noise
        bob_results = []
        detected_indices = []  # Track which photons were detected (not lost)
        
        for i in range(n_bits):
            # Apply amplitude damping (photon loss)
            if np.random.random() < combined_amplitude_damping:
                # Photon lost - skip this bit
                continue
            
            detected_indices.append(i)
            bit_value = alice_bits[i]
            
            # Apply depolarization (polarization flip)
            if np.random.random() < depolarization:
                bit_value = 1 - bit_value
            
            # Apply phase damping (for superposition states - affects diagonal basis)
            if alice_bases[i] == 1 and np.random.random() < phase_damping:
                # Phase errors manifest as bit flips in diagonal basis
                bit_value = 1 - bit_value
            
            # Bob measures
            if alice_bases[i] == bob_bases[i]:  # Same basis
                # With optical noise, there's still a small chance of error
                bob_results.append(int(bit_value))
            else:  # Different basis
                # Random result due to quantum measurement in wrong basis
                bob_results.append(int(np.random.randint(2)))
        
        # Generate sifted keys (only from detected photons with matching bases)
        alice_key = [int(alice_bits[detected_indices[j]]) 
                     for j in range(len(detected_indices)) 
                     if alice_bases[detected_indices[j]] == bob_bases[detected_indices[j]]]
        bob_key = [int(bob_results[j]) 
                   for j in range(len(detected_indices)) 
                   if alice_bases[detected_indices[j]] == bob_bases[detected_indices[j]]]
        
        # Calculate QBER
        if alice_key and bob_key:
            errors = sum(a != b for a, b in zip(alice_key, bob_key))
            qber = errors / len(alice_key) if alice_key else 0
        else:
            qber = 0
        
        response = {
            'success': True,
            'data': {
                'alice_bits': [int(x) for x in alice_bits.tolist()],
                'alice_bases': [int(x) for x in alice_bases.tolist()],
                'bob_bases': [int(x) for x in bob_bases.tolist()],
                'bob_results': [int(x) for x in bob_results],
                'alice_key': [int(x) for x in alice_key],
                'bob_key': [int(x) for x in bob_key],
                'qber': float(qber),
                'job_id': f'sim_{seed}_{n_bits}',
                'key_length': int(len(alice_key)),
                'keys_match': bool(alice_key == bob_key),
                'photon_loss_rate': float(photon_loss_prob),
                'detected_photons': len(detected_indices)
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/execute-python', methods=['POST'])
def execute_python():
    try:
        data = request.get_json()
        code = data.get('code', '')
        
        if not code.strip():
            return jsonify({
                'success': False,
                'error': 'No code provided'
            })
        
        # Create a safe execution environment
        import io
        import sys
        from contextlib import redirect_stdout, redirect_stderr
        
        # Capture output
        output_buffer = io.StringIO()
        error_buffer = io.StringIO()
        
        # Prepare execution environment
        exec_globals = {
            '__builtins__': __builtins__,
            'print': lambda *args, **kwargs: print(*args, file=output_buffer, **kwargs),
        }
        
        # Add common imports
        try:
            import numpy as np
            import matplotlib.pyplot as plt
            from qiskit import QuantumCircuit, transpile
            from qiskit.visualization import plot_histogram
            from qiskit_aer import AerSimulator
            exec_globals.update({
                'numpy': np,
                'np': np,
                'matplotlib': plt,
                'plt': plt,
                'QuantumCircuit': QuantumCircuit,
                'transpile': transpile,
                'plot_histogram': plot_histogram,
                'AerSimulator': AerSimulator
            })
        except ImportError as e:
            return jsonify({
                'success': False,
                'error': f'Required library not available: {str(e)}'
            })
        
        try:
            # Execute the code
            with redirect_stdout(output_buffer), redirect_stderr(error_buffer):
                exec(code, exec_globals)
            
            output = output_buffer.getvalue()
            error = error_buffer.getvalue()
            
            return jsonify({
                'success': True,
                'output': output,
                'error': error if error else None
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Execution error: {str(e)}'
            })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'BB84 API is running'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
