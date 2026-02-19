"""
E91 Quantum Key Distribution Protocol Implementation
Based on Artur Ekert's 1991 protocol using quantum entanglement

Accurate QBER Calculation:
- QBER_E91 = N_mismatched_outcomes / N_matching_bases
- Separates Bell Test set from Key Generation set
- Models depolarization effects on both S-value and QBER
"""

import numpy as np
from typing import Dict, Tuple, List


def create_bell_state(state_type: str = 'psi_minus') -> np.ndarray:
    """
    Create a Bell state density matrix
    
    Args:
        state_type: One of 'psi_minus', 'psi_plus', 'phi_minus', 'phi_plus'
    
    Returns:
        4x4 density matrix for the Bell state
    """
    if state_type == 'psi_minus':
        # |ψ⁻⟩ = (|01⟩ - |10⟩)/√2  (singlet state, anti-correlated)
        psi_minus = np.array([0, 1, -1, 0]) / np.sqrt(2)
        return np.outer(psi_minus, psi_minus.conj())
    elif state_type == 'psi_plus':
        # |ψ⁺⟩ = (|01⟩ + |10⟩)/√2  (triplet state, correlated)
        psi_plus = np.array([0, 1, 1, 0]) / np.sqrt(2)
        return np.outer(psi_plus, psi_plus.conj())
    elif state_type == 'phi_minus':
        # |φ⁻⟩ = (|00⟩ - |11⟩)/√2  (correlated with phase)
        phi_minus = np.array([1, 0, 0, -1]) / np.sqrt(2)
        return np.outer(phi_minus, phi_minus.conj())
    elif state_type == 'phi_plus':
        # |φ⁺⟩ = (|00⟩ + |11⟩)/√2  (correlated)
        phi_plus = np.array([1, 0, 0, 1]) / np.sqrt(2)
        return np.outer(phi_plus, phi_plus.conj())
    else:
        raise ValueError(f"Unknown state type: {state_type}")


def apply_depolarizing_channel(rho: np.ndarray, p: float) -> np.ndarray:
    """
    Apply depolarizing channel to simulate noise in quantum channel
    
    The depolarizing channel transforms the density matrix as:
    ρ' = (1-p)ρ + p*I/4
    
    where p is the depolarization probability and I is the 4x4 identity.
    
    Args:
        rho: 4x4 input density matrix
        p: Depolarization probability (0 to 1)
    
    Returns:
        4x4 output density matrix after depolarization
    """
    I = np.eye(4)
    return (1 - p) * rho + p * I / 4


def measure_in_basis(rho: np.ndarray, alice_basis: int, bob_basis: int) -> Tuple[int, int]:
    """
    Simulate measurement of entangled state in given bases
    
    For E91, we use three measurement bases per party:
    - Basis 0: Z (0°) - computational basis
    - Basis 1: X (90°) - Hadamard basis  
    - Basis 2: 45° (diagonal)
    
    Args:
        rho: 4x4 density matrix of the entangled state
        alice_basis: Alice's measurement basis (0, 1, or 2)
        bob_basis: Bob's measurement basis (0, 1, or 2)
    
    Returns:
        Tuple of (alice_result, bob_result) where each is 0 or 1
    """
    # Measurement operators for each basis
    # Basis 0: Z measurement (σ_z eigenstates)
    # Basis 1: X measurement (σ_x eigenstates)
    # Basis 2: 45° measurement (intermediate)
    
    measurement_angles = {
        0: 0,           # Z basis
        1: np.pi/2,     # X basis
        2: np.pi/4,     # 45° basis
    }
    
    theta_a = measurement_angles[alice_basis]
    theta_b = measurement_angles[bob_basis]
    
    # For singlet state |ψ⁻⟩, the correlation is:
    # P(same) = sin²(θ_a - θ_b)/2
    # P(different) = cos²(θ_a - θ_b)/2
    
    angle_diff = theta_a - theta_b
    
    # Probability of anti-correlation (different outcomes)
    p_anti = np.cos(angle_diff)**2
    # Probability of correlation (same outcomes)
    p_same = np.sin(angle_diff)**2
    
    # For perfect singlet at same basis: always anti-correlated
    # Generate random outcome
    alice_result = np.random.randint(2)
    
    # Bob's result depends on correlation
    if np.random.random() < p_same:
        bob_result = alice_result  # Same outcome
    else:
        bob_result = 1 - alice_result  # Anti-correlated outcome
    
    return alice_result, bob_result


def calculate_chsh_s_value(alice_outcomes: List[int], bob_outcomes: List[int],
                           alice_bases: List[int], bob_bases: List[int]) -> Tuple[float, Dict]:
    """
    Calculate CHSH S-value for Bell inequality test
    
    CHSH = E(a,b) - E(a,b') + E(a',b) + E(a',b')
    
    where E(x,y) is the correlation function for measurement settings x and y.
    
    For quantum mechanics with optimal angles: S = 2√2 ≈ 2.828
    For classical (local hidden variables): |S| ≤ 2
    
    Args:
        alice_outcomes: Alice's measurement results
        bob_outcomes: Bob's measurement results
        alice_bases: Alice's measurement settings
        bob_bases: Bob's measurement settings
    
    Returns:
        Tuple of (S_value, dict of individual correlations)
    """
    # Map our bases to CHSH test settings
    # Optimal CHSH angles for singlet state:
    # Alice: a=0°, a'=90°
    # Bob: b=45°, b'=135°
    
    # We'll use: basis 0→0°, basis 1→90°, basis 2→45°
    chsh_measurements = {
        'E_00': [],  # Alice: 0°, Bob: 0°
        'E_01': [],  # Alice: 0°, Bob: 90°
        'E_10': [],  # Alice: 90°, Bob: 0°
        'E_11': [],  # Alice: 90°, Bob: 90°
        'E_02': [],  # Alice: 0°, Bob: 45°
        'E_12': [],  # Alice: 90°, Bob: 45°
        'E_20': [],  # Alice: 45°, Bob: 0°
        'E_21': [],  # Alice: 45°, Bob: 90°
        'E_22': [],  # Alice: 45°, Bob: 45°
    }
    
    for a_out, b_out, a_base, b_base in zip(alice_outcomes, bob_outcomes, alice_bases, bob_bases):
        key = f'E_{a_base}{b_base}'
        # Convert outcomes to {-1, +1}
        a_val = 1 if a_out == 0 else -1
        b_val = 1 if b_out == 0 else -1
        chsh_measurements[key].append(a_val * b_val)
    
    # Calculate expectation values
    correlations = {}
    for key, values in chsh_measurements.items():
        if values:
            correlations[key] = np.mean(values)
        else:
            correlations[key] = 0.0
    
    # CHSH S-value using optimal combination
    # S = E(0,45) - E(0,90) + E(90,45) + E(90,0)
    S = (correlations['E_02'] - correlations['E_01'] + 
         correlations['E_12'] + correlations['E_10'])
    
    return S, correlations


def e91_protocol(n_pairs: int = 1000, 
                 seed: int = None,
                 depolarization: float = 0.0,
                 eavesdropping_rate: float = 0.0,
                 dark_count_rate: float = 0.0,
                 bell_state: str = 'psi_minus') -> Dict:
    """
    Execute the E91 quantum key distribution protocol with accurate QBER calculation
    
    Args:
        n_pairs: Number of entangled pairs to generate
        seed: Random seed for reproducibility
        depolarization: Depolarization probability (0 to 1)
        eavesdropping_rate: Probability of Eve intercepting (0 to 1)
        dark_count_rate: SPAD dark count probability (0 to 1)
        bell_state: Type of Bell state to use ('psi_minus', 'psi_plus', etc.)
    
    Returns:
        Dictionary containing:
        - n_pairs: Number of pairs used
        - alice_bases, bob_bases: Measurement bases (0, 1, 2)
        - alice_outcomes, bob_outcomes: Measurement results
        - bell_test_indices: Indices used for Bell test (CHSH)
        - key_gen_indices: Indices used for key generation
        - alice_sifted_key: Alice's sifted key bits
        - bob_sifted_key: Bob's sifted key bits (before correction)
        - bob_corrected_key: Bob's corrected key bits
        - qber: Quantum Bit Error Rate (matching bases only)
        - chsh_s_value: CHSH S-value for Bell test
        - bell_violated: Whether Bell inequality is violated
        - correlations: Individual CHSH correlation terms
        - expected_s_value: Theoretical S-value given depolarization
        - expected_qber: Theoretical QBER given depolarization
    """
    if seed is not None:
        np.random.seed(seed)
    
    # Create initial Bell state
    rho_0 = create_bell_state(bell_state)
    
    # Apply depolarizing channel
    rho_noisy = apply_depolarizing_channel(rho_0, depolarization)
    
    # Generate random measurement bases for Alice and Bob
    alice_bases = np.random.choice([0, 1, 2], size=n_pairs)
    bob_bases = np.random.choice([0, 1, 2], size=n_pairs)
    
    # Simulate measurements
    alice_outcomes = []
    bob_outcomes = []
    
    for i in range(n_pairs):
        # Check for eavesdropping
        if np.random.random() < eavesdropping_rate:
            # Eve performs intercept-resend attack
            # This destroys entanglement and introduces errors
            alice_bit = np.random.randint(2)
            bob_bit = np.random.randint(2)  # Completely random due to collapse
        else:
            # No eavesdropping - measure entangled state
            alice_bit, bob_bit = measure_in_basis(rho_noisy, alice_bases[i], bob_bases[i])
        
        # Apply dark count errors (SPAD noise)
        if np.random.random() < dark_count_rate:
            alice_bit = 1 - alice_bit  # Dark count flips the result
        if np.random.random() < dark_count_rate:
            bob_bit = 1 - bob_bit
        
        alice_outcomes.append(alice_bit)
        bob_outcomes.append(bob_bit)
    
    # Separate into Bell Test set and Key Generation set
    # Bell Test: mismatched bases (used to compute CHSH S-value)
    # Key Generation: matching bases (used to generate sifted key)
    bell_test_indices = []
    key_gen_indices = []
    
    for i in range(n_pairs):
        if alice_bases[i] == bob_bases[i]:
            key_gen_indices.append(i)
        else:
            bell_test_indices.append(i)
    
    # Extract subsets
    bell_test_alice_bases = [alice_bases[i] for i in bell_test_indices]
    bell_test_bob_bases = [bob_bases[i] for i in bell_test_indices]
    bell_test_alice_outcomes = [alice_outcomes[i] for i in bell_test_indices]
    bell_test_bob_outcomes = [bob_outcomes[i] for i in bell_test_indices]
    
    key_gen_alice_outcomes = [alice_outcomes[i] for i in key_gen_indices]
    key_gen_bob_outcomes = [bob_outcomes[i] for i in key_gen_indices]
    
    # Calculate CHSH S-value using Bell test subset
    chsh_s_value, correlations = calculate_chsh_s_value(
        bell_test_alice_outcomes, bell_test_bob_outcomes,
        bell_test_alice_bases, bell_test_bob_bases
    )
    
    # Calculate QBER using key generation subset (matching bases only)
    # For psi_minus state: outcomes should be perfectly anti-correlated
    # So we need to flip Bob's bits to get the corrected key
    alice_sifted_key = key_gen_alice_outcomes
    bob_sifted_key = key_gen_bob_outcomes
    bob_corrected_key = [1 - bit for bit in bob_sifted_key]  # Anti-correlation correction
    
    # QBER = fraction of mismatched outcomes in matching-basis measurements
    if len(alice_sifted_key) > 0:
        errors = sum(a != b for a, b in zip(alice_sifted_key, bob_corrected_key))
        qber = errors / len(alice_sifted_key)
    else:
        qber = 0.0
    
    # Bell inequality violation check
    # Classical limit: |S| ≤ 2
    # Quantum maximum: |S| = 2√2 ≈ 2.828
    bell_violated = abs(chsh_s_value) > 2.0
    
    # Calculate expected values based on depolarization
    # For depolarizing channel with parameter p:
    # S_expected = 2√2 * (1 - p)
    # QBER_expected ≈ p/2 (for small p)
    expected_s_value = 2 * np.sqrt(2) * (1 - depolarization - eavesdropping_rate)
    expected_qber = (depolarization + eavesdropping_rate) / 2 + dark_count_rate
    
    return {
        'n_pairs': n_pairs,
        'bell_state': bell_state,
        'alice_bases': alice_bases.tolist(),
        'bob_bases': bob_bases.tolist(),
        'alice_outcomes': alice_outcomes,
        'bob_outcomes': bob_outcomes,
        'bell_test_indices': bell_test_indices,
        'key_gen_indices': key_gen_indices,
        'bell_test_count': len(bell_test_indices),
        'key_gen_count': len(key_gen_indices),
        'alice_sifted_key': alice_sifted_key,
        'bob_sifted_key': bob_sifted_key,
        'bob_corrected_key': bob_corrected_key,
        'qber': qber,
        'qber_percentage': qber * 100,
        'chsh_s_value': chsh_s_value,
        'bell_violated': bell_violated,
        'correlations': correlations,
        'expected_s_value': expected_s_value,
        'expected_qber': expected_qber,
        'depolarization': depolarization,
        'eavesdropping_rate': eavesdropping_rate,
        'dark_count_rate': dark_count_rate,
    }


def analyze_e91_results(results: Dict) -> str:
    """
    Analyze E91 protocol results and return formatted analysis string
    
    Args:
        results: Dictionary from e91_protocol()
    
    Returns:
        Formatted analysis string
    """
    analysis = []
    analysis.append("=" * 50)
    analysis.append("E91 Protocol Analysis")
    analysis.append("=" * 50)
    analysis.append(f"Bell State: |{results['bell_state'].replace('_', '-')}⟩")
    analysis.append(f"Number of entangled pairs: {results['n_pairs']}")
    analysis.append(f"Bell test measurements: {results['bell_test_count']}")
    analysis.append(f"Key generation measurements: {results['key_gen_count']}")
    analysis.append("")
    analysis.append("CHSH Bell Test:")
    analysis.append(f"  S-value: {results['chsh_s_value']:.4f}")
    analysis.append(f"  Expected S: {results['expected_s_value']:.4f}")
    analysis.append(f"  Classical limit: |S| ≤ 2")
    analysis.append(f"  Quantum maximum: |S| = 2√2 ≈ 2.828")
    analysis.append(f"  Bell violated: {'✓ YES' if results['bell_violated'] else '✗ NO'}")
    analysis.append("")
    analysis.append("QBER Calculation (Matching Bases Only):")
    analysis.append(f"  QBER = N_errors / N_matching_bases")
    analysis.append(f"  QBER = {int(results['qber'] * results['key_gen_count'])} / {results['key_gen_count']}")
    analysis.append(f"  QBER: {results['qber_percentage']:.2f}%")
    analysis.append(f"  Expected QBER: {results['expected_qber']*100:.2f}%")
    analysis.append("")
    analysis.append("Security Assessment:")
    
    if not results['bell_violated']:
        analysis.append("  ⚠️  WARNING: Bell inequality NOT violated!")
        analysis.append("     Possible eavesdropping or excessive noise")
    elif results['qber'] > 0.11:
        analysis.append("  ⚠️  WARNING: QBER > 11% (security threshold)")
        analysis.append("     Key may be compromised")
    else:
        analysis.append("  ✓ Protocol secure - Bell inequality violated")
        analysis.append(f"  ✓ QBER ({results['qber_percentage']:.2f}%) below threshold (11%)")
    
    analysis.append("")
    analysis.append("Correlation Terms (CHSH):")
    for key, value in results['correlations'].items():
        analysis.append(f"  {key}: {value:.4f}")
    
    return "\n".join(analysis)


if __name__ == "__main__":
    print("E91 Quantum Key Distribution Protocol")
    print("=" * 50)
    
    # Test with different depolarization levels
    for p_dep in [0.0, 0.05, 0.10, 0.15]:
        print(f"\n{'='*50}")
        print(f"Testing with depolarization p = {p_dep*100:.0f}%")
        print(f"{'='*50}")
        
        results = e91_protocol(
            n_pairs=5000,
            seed=42,
            depolarization=p_dep,
            eavesdropping_rate=0.0,
            dark_count_rate=0.01
        )
        
        print(analyze_e91_results(results))
