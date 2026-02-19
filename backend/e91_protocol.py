"""
E91 Quantum Key Distribution Protocol Implementation
Based on Artur Ekert's 1991 protocol using quantum entanglement
"""

import numpy as np


def calculate_correlations(alice_outcomes, bob_outcomes, alice_bases, bob_bases):
    """
    Calculate correlations between Alice and Bob's measurements
    
    Args:
        alice_outcomes: Alice's measurement results
        bob_outcomes: Bob's measurement results
        alice_bases: Alice's measurement bases
        bob_bases: Bob's measurement bases
    
    Returns:
        dict: Correlation statistics
    """
    # Count correlations for each basis combination
    correlations = {
        'same_basis': {'count': 0, 'matches': 0, 'correlations': 0},
        'different_basis': {'count': 0, 'matches': 0, 'correlations': 0}
    }
    
    for a_base, b_base, a_result, b_result in zip(alice_bases, bob_bases, alice_outcomes, bob_outcomes):
        if a_base == b_base:
            correlations['same_basis']['count'] += 1
            if a_result != b_result:  # Anti-correlation for psi_minus state
                correlations['same_basis']['matches'] += 1
        else:
            correlations['different_basis']['count'] += 1
            if a_result != b_result:  # Random correlation for different bases
                correlations['different_basis']['matches'] += 1
    
    # Calculate correlation percentages
    if correlations['same_basis']['count'] > 0:
        correlations['same_basis']['correlation'] = (
            correlations['same_basis']['matches'] / correlations['same_basis']['count']
        )
    else:
        correlations['same_basis']['correlation'] = 0
        
    if correlations['different_basis']['count'] > 0:
        correlations['different_basis']['correlation'] = (
            correlations['different_basis']['matches'] / correlations['different_basis']['count']
        )
    else:
        correlations['different_basis']['correlation'] = 0
    
    return correlations


def calculate_chsh_correlation(alice_outcomes, bob_outcomes, alice_bases, bob_bases):
    """
    Calculate CHSH correlation for Bell inequality test
    
    The CHSH value should be approximately 2*sqrt(2) ≈ 2.828 for quantum systems
    and ≤ 2 for classical systems (local hidden variable theories)
    """
    # Define the four basis combinations for CHSH test
    # We'll use bases: 0=Z, 1=X, 2=45-degree, 3=135-degree
    # For simplicity, we'll map our 3 bases to the CHSH test
    
    # Map our bases to CHSH test angles
    # Alice: bases 0,1 for CHSH; Bob: bases 1,2 for CHSH
    chsh_terms = {'E_01': [], 'E_02': [], 'E_11': [], 'E_12': []}
    
    for a_base, b_base, a_result, b_result in zip(alice_bases, bob_bases, alice_outcomes, bob_outcomes):
        # Map to CHSH test
        if a_base == 0 and b_base == 1:  # Alice: Z, Bob: X
            # Convert bit results to {-1, +1}
            a_val = 1 if a_result == 0 else -1
            b_val = 1 if b_result == 0 else -1
            chsh_terms['E_01'].append(a_val * b_val)
        elif a_base == 0 and b_base == 2:  # Alice: Z, Bob: 45-deg
            a_val = 1 if a_result == 0 else -1
            b_val = 1 if b_result == 0 else -1
            chsh_terms['E_02'].append(a_val * b_val)
        elif a_base == 1 and b_base == 1:  # Alice: X, Bob: X
            a_val = 1 if a_result == 0 else -1
            b_val = 1 if b_result == 0 else -1
            chsh_terms['E_11'].append(a_val * b_val)
        elif a_base == 1 and b_base == 2:  # Alice: X, Bob: 45-deg
            a_val = 1 if a_result == 0 else -1
            b_val = 1 if b_result == 0 else -1
            chsh_terms['E_12'].append(a_val * b_val)
    
    # Calculate expectation values
    E_01 = np.mean(chsh_terms['E_01']) if chsh_terms['E_01'] else 0
    E_02 = np.mean(chsh_terms['E_02']) if chsh_terms['E_02'] else 0
    E_11 = np.mean(chsh_terms['E_11']) if chsh_terms['E_11'] else 0
    E_12 = np.mean(chsh_terms['E_12']) if chsh_terms['E_12'] else 0
    
    # CHSH value: E(a0,b1) - E(a0,b2) + E(a1,b1) + E(a1,b2)
    chsh_value = E_01 - E_02 + E_11 + E_12
    
    return chsh_value, {'E_01': E_01, 'E_02': E_02, 'E_11': E_11, 'E_12': E_12}


def e91_protocol(n_pairs=100, seed=0):
    """
    Execute the E91 quantum key distribution protocol
    
    Args:
        n_pairs: Number of entangled pairs to use
        seed: Random seed for reproducibility
    
    Returns:
        dict: Results of the E91 protocol
    """
    np.random.seed(seed)
    
    # Generate random measurement bases for Alice and Bob
    alice_bases = np.random.choice([0, 1, 2], size=n_pairs)
    bob_bases = np.random.choice([0, 1, 2], size=n_pairs)
    
    # Simulate outcomes based on quantum entanglement principles
    # For psi-minus state, Alice and Bob should have perfectly anti-correlated results
    alice_outcomes = []
    bob_outcomes = []
    
    for i in range(n_pairs):
        # For entangled psi-minus state, if Alice measures 0, Bob should measure 1 (and vice versa)
        alice_bit = np.random.randint(2)
        bob_bit = 1 - alice_bit  # Perfect anti-correlation initially
        
        alice_outcomes.append(alice_bit)
        bob_outcomes.append(bob_bit)
    
    # Calculate correlations
    correlations = calculate_correlations(alice_outcomes, bob_outcomes, alice_bases, bob_bases)
    
    # Calculate CHSH correlation for Bell test
    chsh_value, chsh_expectations = calculate_chsh_correlation(alice_outcomes, bob_outcomes, alice_bases, bob_bases)
    
    # Generate sifted key (only for matching bases)
    sifted_indices = [i for i in range(n_pairs) if alice_bases[i] == bob_bases[i]]
    alice_sifted_key = [alice_outcomes[i] for i in sifted_indices]
    bob_sifted_key = [bob_outcomes[i] for i in sifted_indices]
    
    # For psi-minus state, Alice and Bob should have opposite results
    # So we flip Bob's bits to align with Alice's
    bob_corrected_key = [1 - bit for bit in bob_sifted_key]
    
    # Calculate QBER (Quantum Bit Error Rate) for matching bases
    if len(alice_sifted_key) > 0:
        errors = sum(a != b for a, b in zip(alice_sifted_key, bob_corrected_key))
        qber = errors / len(alice_sifted_key)
    else:
        qber = 0
    
    # Determine if Bell inequality is violated (security check)
    bell_violated = abs(chsh_value) > 2  # Classical limit is 2, quantum can reach ~2.828
    
    return {
        'n_pairs': n_pairs,
        'alice_bases': alice_bases.tolist(),
        'bob_bases': bob_bases.tolist(),
        'alice_outcomes': alice_outcomes,
        'bob_outcomes': bob_outcomes,
        'alice_sifted_key': alice_sifted_key,
        'bob_sifted_key': bob_sifted_key,
        'bob_corrected_key': bob_corrected_key,
        'qber': qber,
        'chsh_value': chsh_value,
        'bell_violated': bell_violated,
        'correlations': correlations,
        'chsh_expectations': chsh_expectations,
    }


def analyze_e91_results(results):
    """
    Analyze the results of the E91 protocol
    """
    print("=== E91 Protocol Analysis ===")
    print(f"Number of entangled pairs: {results['n_pairs']}")
    print(f"CHSH inequality value: {results['chsh_value']:.3f}")
    print(f"Bell inequality violated: {results['bell_violated']}")
    print(f"QBER (Quantum Bit Error Rate): {results['qber']:.3f}")
    print(f"Length of sifted key: {len(results['alice_sifted_key'])}")
    print(f"Alice's sifted key: {results['alice_sifted_key'][:20]}{'...' if len(results['alice_sifted_key']) > 20 else ''}")
    print(f"Bob's corrected key: {results['bob_corrected_key'][:20]}{'...' if len(results['bob_corrected_key']) > 20 else ''}")
    
    print("\nCorrelation Analysis:")
    print(f"Same basis correlation: {results['correlations']['same_basis']['correlation']:.3f}")
    print(f"Different basis correlation: {results['correlations']['different_basis']['correlation']:.3f}")
    
    if results['bell_violated']:
        print("\n[SUCCESS] Bell inequality is violated - protocol is secure against eavesdropping")
    else:
        print("\n[WARNING] Bell inequality is NOT violated - possible eavesdropping or noise")


if __name__ == "__main__":
    print("Running E91 Quantum Key Distribution Protocol...")
    results = e91_protocol(n_pairs=100, seed=42)
    analyze_e91_results(results)