"""
B92 Quantum Key Distribution Protocol Implementation
Based on Charles Bennett's 1992 two-state protocol

Accurate QBER Calculation:
- B92 uses Unambiguous State Discrimination (USD)
- QBER_B92 = N_errors / N_sifted_subset
- Only conclusive measurements form the sifted key
- Models dark counts and Eve's beam-splitting attacks
"""

import numpy as np
from typing import Dict, List, Tuple


def create_b92_states() -> Tuple[np.ndarray, np.ndarray]:
    """
    Create the two non-orthogonal quantum states for B92
    
    Alice encodes:
    - Bit 0: |0⟩ (horizontal polarization)
    - Bit 1: |+⟩ = (|0⟩ + |1⟩)/√2 (diagonal polarization)
    
    These states have overlap |⟨0|+⟩|² = 1/2
    
    Returns:
        Tuple of (state_0, state_1) as 2D vectors
    """
    # |0⟩ - horizontal polarization
    state_0 = np.array([1, 0])
    
    # |+⟩ = (|0⟩ + |1⟩)/√2 - diagonal polarization  
    state_1 = np.array([1, 1]) / np.sqrt(2)
    
    return state_0, state_1


def create_measurement_operators() -> Tuple[np.ndarray, np.ndarray]:
    """
    Create Bob's measurement operators for B92
    
    Bob uses two projective measurements:
    - M_0 = I - |+⟩⟨+| : Detects |0⟩ (conclusive for bit 0)
    - M_1 = I - |0⟩⟨0| : Detects |+⟩ (conclusive for bit 1)
    
    Returns:
        Tuple of (M_0, M_1) measurement operators
    """
    # |+⟩⟨+| projector
    plus = np.array([1, 1]) / np.sqrt(2)
    P_plus = np.outer(plus, plus)
    
    # |0⟩⟨0| projector
    P_0 = np.array([[1, 0], [0, 0]])
    
    # Identity
    I = np.eye(2)
    
    # M_0 = I - |+⟩⟨+| (clicks when state is |0⟩)
    M_0 = I - P_plus
    
    # M_1 = I - |0⟩⟨0| (clicks when state is |+⟩)
    M_1 = I - P_0
    
    return M_0, M_1


def measure_b92(state: np.ndarray, M_0: np.ndarray, M_1: np.ndarray,
                dark_count_rate: float = 0.0) -> Tuple[int, bool]:
    """
    Perform B92 measurement
    
    Args:
        state: Input quantum state (2D vector)
        M_0: Measurement operator for detecting |0⟩
        M_1: Measurement operator for detecting |+⟩
        dark_count_rate: Probability of dark count in SPAD
    
    Returns:
        Tuple of (measured_bit, is_conclusive)
        - is_conclusive=True means Bob got a definite bit value
        - is_conclusive=False means inconclusive (no detection)
    """
    # Calculate probabilities using Born rule
    # P(conclusive 0) = ⟨ψ|M_0|ψ⟩
    # P(conclusive 1) = ⟨ψ|M_1|ψ⟩
    
    prob_0 = np.real(np.vdot(state, M_0 @ state))
    prob_1 = np.real(np.vdot(state, M_1 @ state))
    prob_inconclusive = 1 - prob_0 - prob_1
    
    # Apply dark counts (can cause false conclusive clicks)
    dark_count_0 = np.random.random() < dark_count_rate
    dark_count_1 = np.random.random() < dark_count_rate
    
    # Add dark count probability to conclusive outcomes
    if dark_count_0:
        prob_0 += dark_count_rate
    if dark_count_1:
        prob_1 += dark_count_rate
    
    # Normalize
    total = prob_0 + prob_1 + prob_inconclusive
    prob_0 /= total
    prob_1 /= total
    prob_inconclusive /= total
    
    # Generate random outcome
    r = np.random.random()
    
    if r < prob_0:
        return 0, True  # Conclusive: bit 0
    elif r < prob_0 + prob_1:
        return 1, True  # Conclusive: bit 1
    else:
        return -1, False  # Inconclusive


def b92_protocol(n_signals: int = 1000,
                 seed: int = None,
                 channel_loss: float = 0.0,
                 depolarization: float = 0.0,
                 eavesdropping_rate: float = 0.0,
                 dark_count_rate: float = 0.0) -> Dict:
    """
    Execute the B92 quantum key distribution protocol with accurate QBER calculation
    
    Args:
        n_signals: Number of quantum signals to send
        seed: Random seed for reproducibility
        channel_loss: Photon loss probability (0 to 1)
        depolarization: Depolarization probability (0 to 1)
        eavesdropping_rate: Probability of Eve intercepting (0 to 1)
        dark_count_rate: SPAD dark count probability (0 to 1)
    
    Returns:
        Dictionary containing:
        - n_signals: Number of signals sent
        - alice_bits: Alice's random bit sequence
        - alice_states: States prepared by Alice ('0' or '+')
        - bob_measurements: Bob's measurement results
        - conclusive_indices: Indices with conclusive detections
        - inconclusive_indices: Indices with inconclusive results
        - sifted_key_alice: Alice's bits for conclusive measurements
        - sifted_key_bob: Bob's conclusive bit values
        - qber: Quantum Bit Error Rate
        - qber_percentage: QBER as percentage
        - key_rate: Fraction of signals that became sifted key
        - expected_qber: Theoretical QBER given parameters
        - expected_key_rate: Theoretical key rate
    """
    if seed is not None:
        np.random.seed(seed)
    
    # Get B92 states and measurement operators
    state_0, state_1 = create_b92_states()
    M_0, M_1 = create_measurement_operators()
    
    states = {'0': state_0, '+': state_1}
    
    # Generate Alice's random bits
    alice_bits = np.random.randint(2, size=n_signals)
    alice_states = ['0' if bit == 0 else '+' for bit in alice_bits]
    
    # Bob's measurements
    bob_measurements = []  # (bit_value, is_conclusive)
    bob_raw_results = []
    conclusive_flags = []
    
    for i in range(n_signals):
        # Get Alice's prepared state
        prepared_state = states[alice_states[i]].copy()
        
        # Check for channel loss (photon didn't arrive)
        if np.random.random() < channel_loss:
            bob_measurements.append((-1, False))
            bob_raw_results.append(-1)
            conclusive_flags.append(False)
            continue
        
        # Check for eavesdropping (intercept-resend attack)
        if np.random.random() < eavesdropping_rate:
            # Eve measures in random basis and resends
            eve_basis = np.random.choice(['0', '+'])
            # Eve's measurement collapses the state
            if eve_basis == '0':
                # Eve measures in {|0⟩, |1⟩} basis
                if np.random.random() < 0.5:
                    prepared_state = state_0
                else:
                    prepared_state = np.array([0, 1])  # |1⟩
            else:
                # Eve measures in {|+⟩, |-⟩} basis
                if np.random.random() < 0.5:
                    prepared_state = state_1
                else:
                    prepared_state = np.array([1, -1]) / np.sqrt(2)  # |-⟩
        
        # Apply depolarization (quantum noise)
        if np.random.random() < depolarization:
            # State becomes maximally mixed with some probability
            if np.random.random() < 0.5:
                # Flip to orthogonal state
                if alice_states[i] == '0':
                    prepared_state = np.array([0, 1])
                else:
                    prepared_state = np.array([1, -1]) / np.sqrt(2)
        
        # Bob performs measurement
        bit_value, is_conclusive = measure_b92(
            prepared_state, M_0, M_1, dark_count_rate
        )
        
        bob_measurements.append((bit_value, is_conclusive))
        bob_raw_results.append(bit_value)
        conclusive_flags.append(is_conclusive)
    
    # Extract conclusive and inconclusive subsets
    conclusive_indices = [i for i in range(n_signals) if conclusive_flags[i]]
    inconclusive_indices = [i for i in range(n_signals) if not conclusive_flags[i]]
    
    # Sifted key: only conclusive measurements
    sifted_key_alice = [alice_bits[i] for i in conclusive_indices]
    sifted_key_bob = [bob_raw_results[i] for i in conclusive_indices]
    
    # Calculate QBER: errors in sifted key / total sifted key
    # Error occurs when Bob's conclusive measurement doesn't match Alice's bit
    if len(sifted_key_alice) > 0:
        errors = sum(a != b for a, b in zip(sifted_key_alice, sifted_key_bob))
        qber = errors / len(sifted_key_alice)
    else:
        qber = 0.0
    
    # Calculate key rate (fraction of signals that became sifted key)
    key_rate = len(conclusive_indices) / n_signals
    
    # Theoretical expectations
    # For ideal B92 (no noise, no eavesdropping):
    # - Key rate = 0.25 (25% conclusive results)
    # - QBER = 0
    
    # With depolarization p and eavesdropping rate e:
    # - QBER_expected ≈ (p + e)/2 + dark_count_rate
    # - Key rate decreases with loss and noise
    
    expected_qber = (depolarization + eavesdropping_rate) / 2 + dark_count_rate
    expected_key_rate = 0.25 * (1 - channel_loss) * (1 - depolarization - eavesdropping_rate)
    
    return {
        'n_signals': n_signals,
        'alice_bits': alice_bits.tolist(),
        'alice_states': alice_states,
        'bob_measurements': bob_measurements,
        'bob_raw_results': bob_raw_results,
        'conclusive_indices': conclusive_indices,
        'inconclusive_indices': inconclusive_indices,
        'conclusive_count': len(conclusive_indices),
        'inconclusive_count': len(inconclusive_indices),
        'sifted_key_alice': sifted_key_alice,
        'sifted_key_bob': sifted_key_bob,
        'qber': qber,
        'qber_percentage': qber * 100,
        'key_rate': key_rate,
        'key_rate_percentage': key_rate * 100,
        'expected_qber': expected_qber,
        'expected_key_rate': expected_key_rate,
        'channel_loss': channel_loss,
        'depolarization': depolarization,
        'eavesdropping_rate': eavesdropping_rate,
        'dark_count_rate': dark_count_rate,
    }


def analyze_b92_results(results: Dict) -> str:
    """
    Analyze B92 protocol results and return formatted analysis string
    
    Args:
        results: Dictionary from b92_protocol()
    
    Returns:
        Formatted analysis string
    """
    analysis = []
    analysis.append("=" * 50)
    analysis.append("B92 Protocol Analysis")
    analysis.append("=" * 50)
    analysis.append(f"Number of signals sent: {results['n_signals']}")
    analysis.append(f"Conclusive detections: {results['conclusive_count']}")
    analysis.append(f"Inconclusive results: {results['inconclusive_count']}")
    analysis.append("")
    analysis.append("Key Rate (USD Efficiency):")
    analysis.append(f"  Key Rate = N_conclusive / N_signals")
    analysis.append(f"  Key Rate = {results['conclusive_count']} / {results['n_signals']}")
    analysis.append(f"  Key Rate: {results['key_rate_percentage']:.2f}%")
    analysis.append(f"  Expected (ideal): 25%")
    analysis.append(f"  Expected (with noise): {results['expected_key_rate']*100:.2f}%")
    analysis.append("")
    analysis.append("QBER Calculation (Conclusive Measurements Only):")
    analysis.append(f"  QBER = N_errors / N_sifted_subset")
    
    # Count errors
    errors = sum(a != b for a, b in zip(results['sifted_key_alice'], results['sifted_key_bob']))
    analysis.append(f"  QBER = {errors} / {len(results['sifted_key_alice'])}")
    analysis.append(f"  QBER: {results['qber_percentage']:.2f}%")
    analysis.append(f"  Expected QBER: {results['expected_qber']*100:.2f}%")
    analysis.append("")
    analysis.append("Error Sources:")
    analysis.append(f"  Channel loss: {results['channel_loss']*100:.1f}%")
    analysis.append(f"  Depolarization: {results['depolarization']*100:.1f}%")
    analysis.append(f"  Eavesdropping: {results['eavesdropping_rate']*100:.1f}%")
    analysis.append(f"  Dark count rate: {results['dark_count_rate']*100:.2f}%")
    analysis.append("")
    analysis.append("Security Assessment:")
    
    if results['qber'] > 0.15:
        analysis.append("  ⚠️  WARNING: QBER > 15% (B92 security threshold)")
        analysis.append("     High error rate - key may be compromised")
        analysis.append("     B92 tolerates higher QBER than BB84 due to USD")
    elif results['qber'] > 0.05:
        analysis.append("  ⚠️  CAUTION: Elevated QBER detected")
        analysis.append("     Possible eavesdropping or channel noise")
    else:
        analysis.append("  ✓ QBER within acceptable range")
        analysis.append(f"  ✓ Sifted key: {len(results['sifted_key_alice'])} bits")
    
    analysis.append("")
    analysis.append("B92 vs BB84:")
    analysis.append("  - B92 uses 2 non-orthogonal states (vs 4 in BB84)")
    analysis.append("  - B92 uses Unambiguous State Discrimination (USD)")
    analysis.append("  - B92 has lower key rate (~25% vs ~50% for BB84)")
    analysis.append("  - B92 is simpler to implement but more loss-tolerant")
    
    return "\n".join(analysis)


if __name__ == "__main__":
    print("B92 Quantum Key Distribution Protocol")
    print("=" * 50)
    
    # Test with different parameters
    test_cases = [
        {'depolarization': 0.0, 'eavesdropping_rate': 0.0, 'dark_count_rate': 0.01},
        {'depolarization': 0.05, 'eavesdropping_rate': 0.0, 'dark_count_rate': 0.01},
        {'depolarization': 0.0, 'eavesdropping_rate': 0.10, 'dark_count_rate': 0.01},
        {'depolarization': 0.10, 'eavesdropping_rate': 0.05, 'dark_count_rate': 0.02},
    ]
    
    for i, params in enumerate(test_cases):
        print(f"\n{'='*50}")
        print(f"Test Case {i+1}: {params}")
        print(f"{'='*50}")
        
        results = b92_protocol(
            n_signals=5000,
            seed=42 + i,
            channel_loss=0.1,
            **params
        )
        
        print(analyze_b92_results(results))
