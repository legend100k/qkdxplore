from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import json
import traceback

# Add the qiskit directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'qiskit'))

from main import bb84_protocol, analyze_results
from e91_protocol import e91_protocol, analyze_e91_results
from b92_protocol import b92_protocol, analyze_b92_results

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

@app.route('/api/e91', methods=['POST'])
def run_e91():
    try:
        # Get parameters from request
        data = request.get_json() or {}
        n_pairs = data.get('n_pairs', 100)
        seed = data.get('seed', 0)

        # Run E91 protocol
        results = e91_protocol(n_pairs=n_pairs, seed=seed)

        # Prepare response - convert all numpy types to Python native types
        response = {
            'success': True,
            'data': {
                'n_pairs': int(results['n_pairs']),
                'alice_bases': [int(x) for x in results['alice_bases']],
                'bob_bases': [int(x) for x in results['bob_bases']],
                'alice_outcomes': [int(x) for x in results['alice_outcomes']],
                'bob_outcomes': [int(x) for x in results['bob_outcomes']],
                'alice_sifted_key': [int(x) for x in results['alice_sifted_key']],
                'bob_sifted_key': [int(x) for x in results['bob_sifted_key']],
                'bob_corrected_key': [int(x) for x in results['bob_corrected_key']],
                'qber': float(results['qber']),
                'chsh_value': float(results['chsh_value']),
                'bell_violated': bool(results['bell_violated']),
                'key_length': int(len(results['alice_sifted_key'])),
                'keys_match': bool(results['alice_sifted_key'] == results['bob_corrected_key'])
            }
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


@app.route('/api/e91/simulate', methods=['POST'])
def simulate_e91():
    """Run E91 simulation with accurate QBER calculation"""
    try:
        data = request.get_json() or {}
        n_pairs = data.get('n_pairs', 1000)
        seed = data.get('seed', None)
        
        # Convert percentage parameters to probabilities
        eavesdropping_rate = data.get('eavesdropping_rate', 0) / 100  # 0-1
        noise_level = data.get('noise_level', 0) / 100  # 0-1
        dark_count_rate = data.get('dark_count_rate', 0.01)  # Default 1%
        
        # Run E91 protocol with accurate physics-based QBER
        results = e91_protocol(
            n_pairs=n_pairs,
            seed=seed,
            depolarization=noise_level,
            eavesdropping_rate=eavesdropping_rate,
            dark_count_rate=dark_count_rate,
            bell_state='psi_minus'
        )
        
        response = {
            'success': True,
            'data': {
                'n_pairs': results['n_pairs'],
                'bell_state': results['bell_state'],
                'alice_bases': results['alice_bases'],
                'bob_bases': results['bob_bases'],
                'alice_outcomes': results['alice_outcomes'],
                'bob_outcomes': results['bob_outcomes'],
                'bell_test_count': results['bell_test_count'],
                'key_gen_count': results['key_gen_count'],
                'alice_sifted_key': results['alice_sifted_key'],
                'bob_sifted_key': results['bob_sifted_key'],
                'bob_corrected_key': results['bob_corrected_key'],
                'qber': results['qber'],
                'qber_percentage': results['qber_percentage'],
                'chsh_s_value': results['chsh_s_value'],
                'bell_violated': results['bell_violated'],
                'expected_s_value': results['expected_s_value'],
                'expected_qber': results['expected_qber'],
                'correlations': results['correlations'],
                'depolarization': results['depolarization'],
                'eavesdropping_rate': results['eavesdropping_rate'],
                'dark_count_rate': results['dark_count_rate'],
            },
            'analysis': analyze_e91_results(results)
        }
        
        return jsonify(response)
        
    except Exception as e:
        import traceback
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


@app.route('/api/b92/simulate', methods=['POST'])
def simulate_b92():
    """Run B92 simulation with accurate QBER calculation using USD"""
    try:
        data = request.get_json() or {}
        n_signals = data.get('n_signals', 1000)
        seed = data.get('seed', None)
        
        # Convert percentage parameters to probabilities
        channel_loss = data.get('channel_loss', 0.1) / 100  # 0-1
        noise_level = data.get('noise_level', 0) / 100  # 0-1
        eavesdropping_rate = data.get('eavesdropping_rate', 0) / 100  # 0-1
        dark_count_rate = data.get('dark_count_rate', 0.01)  # Default 1%
        
        # Run B92 protocol with accurate physics-based QBER
        results = b92_protocol(
            n_signals=n_signals,
            seed=seed,
            channel_loss=channel_loss,
            depolarization=noise_level,
            eavesdropping_rate=eavesdropping_rate,
            dark_count_rate=dark_count_rate
        )
        
        response = {
            'success': True,
            'data': {
                'n_signals': results['n_signals'],
                'alice_bits': results['alice_bits'],
                'alice_states': results['alice_states'],
                'bob_raw_results': results['bob_raw_results'],
                'conclusive_count': results['conclusive_count'],
                'inconclusive_count': results['inconclusive_count'],
                'sifted_key_alice': results['sifted_key_alice'],
                'sifted_key_bob': results['sifted_key_bob'],
                'qber': results['qber'],
                'qber_percentage': results['qber_percentage'],
                'key_rate': results['key_rate'],
                'key_rate_percentage': results['key_rate_percentage'],
                'expected_qber': results['expected_qber'],
                'expected_key_rate': results['expected_key_rate'],
                'channel_loss': results['channel_loss'],
                'depolarization': results['depolarization'],
                'eavesdropping_rate': results['eavesdropping_rate'],
                'dark_count_rate': results['dark_count_rate'],
            },
            'analysis': analyze_b92_results(results)
        }
        
        return jsonify(response)
        
    except Exception as e:
        import traceback
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'BB84/E91/B92 API is running'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
