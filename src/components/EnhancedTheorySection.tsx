import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const EnhancedTheorySection = () => {
  return (
    <div className="space-y-6">
      <Card className="border-quantum-purple/30">
        <CardHeader>
          <CardTitle className="text-quantum-blue flex items-center gap-2">
            <div className="w-6 h-6 bg-quantum-blue rounded-full"></div>
            What is BB84 Protocol?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground/90">
            The digital world is under threat. Quantum computers will break today's encryption, but a defense exists - powered by the unbreakable laws of physics, not just math.
            Welcome to the quantum frontier of security. Q-Xplore is an immersive educational platform designed to make the complex world of Quantum Key Distribution (QKD) accessible and engaging. Through interactive simulations powered by Qiskit, you will not just learn about the BB84 protocol, you will run it, break it, and understand why it is the future of un-hackable communication.
            Web-based interface for learning of QKD protocol using Qiskit: aim, objective, simulation.

          </p>
          
          <div className="space-y-4 mt-6">
            <h3 className="text-xl font-semibold text-quantum-purple">Aim And Objective</h3>
            <div className="space-y-3">
              <p className="text-foreground/90">
                Our mission is to bridge the gap between abstract quantum theory and practical, hands-on understanding.
              </p>
              
              <p className="text-foreground/90"><span className="font-semibold">Aim:</span> To provide a comprehensive, web-based learning environment that demystifies Quantum Key Distribution (QKD) through interactive simulation.</p>
              
              <p className="text-foreground/90"><span className="font-semibold">Objectives:</span></p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-foreground/90">
                <li><span className="font-semibold">To Educate:</span> Explain the fundamental principles of quantum mechanics (superposition, measurement, no-cloning) that make QKD possible.</li>
                <li><span className="font-semibold">To Simulate:</span> Offer a realistic, Qiskit-powered simulation of the BB84 protocol where users can play the roles of sender, receiver, and evesdropper.</li>
                <li><span className="font-semibold">To Demonstrate:</span> Visually show how eavesdropping attempts introduce a detectable Quantum Bit Error Rate (QBER), providing irrefutable proof of security based on physics.</li>
                <li><span className="font-semibold">To Prepare:</span> Equip students, researchers, and enthusiasts with the foundational knowledge to engage with quantum-safe cybersecurity.</li>
              </ul>
            </div>
          </div>
          
          <div className="space-y-4 mt-6">
            <h3 className="text-xl font-semibold text-red-500">The Quantum Threat is Real</h3>
            <p className="text-foreground/90">
              Today's encryption like RSA and AES relies on math problems too difficult for classical computers to solve quickly. But quantum computers change everything. Using algorithms like Shor's Algorithm, they can break these codes in minutes, not millennia.
            </p>
            <p className="text-foreground/90">
              This opens the door to "Harvest Now, Decrypt Later" attacks. Data intercepted today whether personal, financial, or national security secrets can be stored until a quantum computer is available to decrypt it. The implications are global.
            </p>
          </div>
          
          <div className="space-y-4 mt-6">
            <h3 className="text-xl font-semibold text-quantum-blue">The Problem: Why Classical Encryption Fails</h3>
            <p className="text-foreground/90">
              Imagine sending a locked box with a key. In classical cryptography, a hacker (Eve) can intercept the key, make a perfect copy, and forward the original completely undetected. She now has unrestricted access to your messages.
            </p>
            <p className="text-foreground/90">
              The flaw? Classical information can be copied without a trace.
            </p>
          </div>
          
          <div className="space-y-4 mt-6">
            <h3 className="text-xl font-semibold text-green-600">The Quantum Solution: A Lock That Can't Be Picked</h3>
            <p className="text-foreground/90">
              Quantum Key Distribution (QKD) doesn't rely on math. Instead, it harnesses the unbreakable laws of quantum physics:
            </p>
            <p className="text-foreground/90">
              If Eve tries to measure a quantum particle (like a photon) used to carry the key, she must disturb it.
            </p>
            <p className="text-foreground/90">
              This disturbance introduces errors in her unmistakable signature.
            </p>
            <p className="text-foreground/90">
              Legitimate users (Alice and Bob) can detect these errors and know they're being watched.
            </p>
            <p className="text-foreground/90">
              It's a lock that sprays ink on the thief's hands making intrusion obvious and provable.
            </p>
          </div>
          
          <div className="space-y-4 mt-6">
            <h3 className="text-xl font-semibold text-quantum-glow">Why is this a Revolution?</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 mt-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 font-medium">Aspect</th>
                    <th className="border border-gray-300 px-4 py-2 font-medium text-left">Classical Key Exchange</th>
                    <th className="border border-gray-300 px-4 py-2 font-medium text-left">Quantum Key Distribution (QKD)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-medium">Security Foundation</td>
                    <td className="border border-gray-300 px-4 py-2">Computational difficulty (hard math)</td>
                    <td className="border border-gray-300 px-4 py-2">Laws of Physics (quantum mechanics)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 font-medium">Eavesdropping</td>
                    <td className="border border-gray-300 px-4 py-2">Undetectable copying is possible</td>
                    <td className="border border-gray-300 px-4 py-2">Measurement causes disturbance, leaving proof</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-medium">Future-Proof</td>
                    <td className="border border-gray-300 px-4 py-2">Broken by quantum algorithms (Shor's)</td>
                    <td className="border border-gray-300 px-4 py-2">Secure against any computer, even quantum</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="space-y-4 mt-6">
              <h3 className="text-xl font-semibold text-quantum-purple">The Quantum Principles Behind the Magic</h3>
              <p className="text-foreground/90">
                QKD leverages several fascinating and non-negotiable properties of quantum mechanics:
              </p>
              
              <ul className="list-disc list-inside space-y-2 ml-4 text-foreground/90">
                <li><span className="font-semibold">Quantum Superposition:</span> A quantum particle (e.g., a photon) can exist in multiple states at the same time. It is only when we measure it that it "chooses" a definite state. This allows information to be encoded in a fundamentally uncertain way.</li>
                <li><span className="font-semibold">Measurement Disturbance:</span> The act of measuring a quantum particle forces it out of superposition and into a single state. This is the core of QKD's security. If Eve measures a photon, she changes its original state, leaving a trace of her interference.</li>
                <li><span className="font-semibold">No-Cloning Theorem:</span> It is impossible to create an identical copy (a clone) of an arbitrary unknown quantum state. This prevents Eve from simply copying the photons and listening without being detected.</li>
                <li><span className="font-semibold">Complementarity:</span> Information can be encoded in different, "incompatible" ways. Measuring in the wrong way yields a random result.</li>
              </ul>
              
              <div className="mt-4">
                <h4 className="text-lg font-semibold text-quantum-blue">The Security Guardian: Quantum Bit Error Rate (QBER)</h4>
                <p className="text-foreground/90">
                  This is the most critical metric. The QBER is the percentage of mismatched bits between Alice and Bob after they have compared a sample of their key.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-foreground/90 mt-2">
                  <li>A low QBER indicates a clean, secure connection with only natural noise.</li>
                  <li>A high QBER is undeniable proof of eavesdropping. When Eve measures a qubit in the wrong basis, she causes it to collapse randomly, introducing a detectable 25% error rate on the bits she tampers with.</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-quantum-blue/30">
        <CardHeader>
          <CardTitle className="text-quantum-purple flex items-center gap-2">
            <div className="w-6 h-6 bg-quantum-purple rounded-full polarization-animation"></div>
            Types of QKD
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground/90">
            While several protocols exist, they all leverage quantum mechanics to achieve secure key exchange.
          </p>
          
          <ul className="list-disc list-inside space-y-2 ml-4 text-foreground/90">
            <li><span className="font-semibold">BB84 (The Standard):</span> The original and most widely implemented protocol, using photon polarization.</li>
            <li><span className="font-semibold">E91 (The Entangled):</span> Uses "spooky action at a distance"—quantum entanglement—to create correlations that break if an eavesdropper interferes.</li>
            <li><span className="font-semibold">CV-QKD (The Integrator):</span> Uses continuous properties of light, making it easier to integrate with existing telecom fiber networks.</li>
          </ul>
        </CardContent>
      </Card>
      
      <Card className="border-quantum-blue/30">
        <CardHeader>
          <CardTitle className="text-quantum-purple flex items-center gap-2">
            <div className="w-6 h-6 bg-quantum-purple rounded-full polarization-animation"></div>
            The Quantum Magic Trick: It's All in the Basis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground/90">
            The protocol uses a simple but powerful concept: information can be encoded in different, incompatible ways.
          </p>
          
          <ul className="list-disc list-inside space-y-2 ml-4 text-foreground/90">
            <li>The Rectilinear Basis (+): A photon can be polarized Horizontal (0) or Vertical (1)</li>
            <li>The Diagonal Basis (X): A photon can be polarized 45-degrees (0) or 135-degrees (1)</li>
          </ul>
          
          <p className="text-foreground/90">
            Here's the crucial part: If Bob uses the wrong basis to measure a photon, his result is completely random. He has only a 50% chance of guessing the correct bit. This randomness is the core of the protocol's security.
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-quantum-blue/30">
        <CardHeader>
          <CardTitle className="text-quantum-purple flex items-center gap-2">
            <div className="w-6 h-6 bg-quantum-purple rounded-full polarization-animation"></div>
            The Pioneer: The BB84 Protocol- BB84 TAB
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground/90">
            The protocol you will master in our lab is BB84, named after its creators, Charles Bennett and Gilles Brassard, and the year of its invention—1984. Their groundbreaking work was the first to propose using the laws of quantum mechanics not for computation, but for creating mathematically provable security. The name forever marks their pivotal contribution to the field.
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-quantum-blue/30">
        <CardHeader>
          <CardTitle className="text-quantum-purple flex items-center gap-2">
            <div className="w-6 h-6 bg-quantum-purple rounded-full polarization-animation"></div>
            A Step-by-Step Walkthrough: How BB84 Creates a Key
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground/90">
            Our simulation will guide you through this elegant dance between Alice and Bob.
          </p>
          
          <ol className="list-decimal list-inside space-y-2 ml-4 text-foreground/90">
            <li><span className="font-semibold">Quantum Encoding (Alice):</span> Alice generates a random string of bits (0s and 1s). For each bit, she randomly chooses a basis (+ or X) and prepares a photon in the corresponding polarization state.</li>
            <li><span className="font-semibold">Quantum Transmission:</span> She sends this sequence of photons to Bob one by one.</li>
            <li><span className="font-semibold">Quantum Measurement (Bob):</span> For each incoming photon, Bob randomly guesses which basis (+ or X) to use for measurement. If his basis matches Alice's, he measures the correct bit value. If his basis is wrong, his result is random (50% chance of being right, 50% wrong).</li>
            <li><span className="font-semibold">The Sifting Process (Over a Public Channel):</span> Alice and Bob now talk publicly. They only reveal the sequence of bases they each used. They never reveal the actual bit values. They then discard all the bits where their bases did not match. The remaining bits form the "Sifted Key."</li>
            <li><span className="font-semibold">Catching the evesdropper: The Quantum Bit Error Rate (QBER)</span> This is the most important step. To check for Eve, Alice and Bob sacrifice a random portion of their sifted key by publicly comparing the bits. They calculate the Quantum Bit Error Rate (QBER) the percentage of bits that don't match. A low QBER (~0-11%) is due to natural system noise and means the channel is secure. A high QBER (>25%) is proof of eavesdropping. Why?</li>
          </ol>
        </CardContent>
      </Card>
      
      <Card className="border-quantum-blue/30">
        <CardHeader>
          <CardTitle className="text-quantum-purple flex items-center gap-2">
            <div className="w-6 h-6 bg-quantum-purple rounded-full polarization-animation"></div>
            The Ultimate Test: Activate Eve
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground/90">
            This is where the magic happens. In our simulation, you can switch on the evesdropper.
            Watch in real-time as Eve's desperate guesses corrupt the quantum states. She doesn't know the basis, so she guesses randomly, just like Bob.
            See the QBER spike from near-zero to over 25%, providing irrefutable proof she was there. This error rate is the direct mathematical result of her interference.
          </p>
          <p className="text-foreground/90">
            Understand, visually and intuitively, why this system is provably secure. The laws of physics themselves become your security guard.
          </p>
          <p className="text-foreground/90">
            <span className="font-semibold">6. Privacy Amplification & The Final Key:</span> If the QBER is low, Alice and Bob perform final steps (like error correction) on the remaining unrevealed bits to produce an identical, perfectly secret key.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};