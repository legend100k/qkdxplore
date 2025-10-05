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
    """Run BB84 simulation without real quantum hardware"""
    try:
        data = request.get_json() or {}
        n_bits = data.get('n_bits', 4)
        seed = data.get('seed', 0)
        
        # Import numpy for simulation
        import numpy as np
        np.random.seed(seed)
        
        # Generate random data
        alice_bits = np.random.randint(2, size=n_bits)
        alice_bases = np.random.randint(2, size=n_bits)
        bob_bases = np.random.randint(2, size=n_bits)
        
        # Simulate Bob's measurements (with some noise)
        bob_results = []
        for i in range(n_bits):
            if alice_bases[i] == bob_bases[i]:  # Same basis
                # 95% chance of correct measurement
                if np.random.random() < 0.95:
                    bob_results.append(alice_bits[i])
                else:
                    bob_results.append(1 - alice_bits[i])
            else:  # Different basis
                # Random result
                bob_results.append(np.random.randint(2))
        
        # Generate sifted keys
        alice_key = [bit for i, bit in enumerate(alice_bits) if alice_bases[i] == bob_bases[i]]
        bob_key = [bit for i, bit in enumerate(bob_results) if alice_bases[i] == bob_bases[i]]
        
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
                'bob_results': [int(x) for x in bob_key],
                'alice_key': [int(x) for x in alice_key],
                'bob_key': [int(x) for x in bob_key],
                'qber': float(qber),
                'job_id': f'sim_{seed}_{n_bits}',
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
