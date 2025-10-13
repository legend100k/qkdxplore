export const QuantumHardware = () => {
  return (
    <div className="prose max-w-none p-8">
      <h1 className="text-3xl font-bold text-center mb-6">The Complete Hardware Stack for a BB84 System</h1>
      <p className="text-lg mb-6 text-justify">Imagine Alice wants to send a secret key to Bob using light particles (photons). Here's the hardware they need and the simple job of each part.</p>

      <div className="my-8">
        <img src="/Photon source.png" alt="QKD System Diagram" className="w-full max-w-4xl mx-auto mb-4" />
        <p className="text-base text-justify">This diagram shows the working of a Quantum Key Distribution (QKD) system using optical components like photon sources, beam splitters, and photon detectors. On the sender's side, Alice uses a photon source that emits single photons. These photons pass through beam splitters and polarization filters, encoding binary data ("0" or "1") through different polarization orientations, shown by the arrows.</p>
        <p className="text-base mt-2 text-justify">The photons then travel through the quantum channel to Bob (Receiver), who uses a beam splitter and photon detectors to measure their polarization. Depending on the chosen measurement basis, the detectors output "0" or "1."</p>
        <p className="text-base mt-2 text-justify">Through a classical channel, Alice and Bob compare their measurement bases and keep only the matching bits to generate a shared secret key. This key is then used by encryptors on both sides to convert plain text into ciphertext securely. The setup highlights photon transmission and optical gate operations in QKD encryption.</p>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">1. The Photon Source</h2>

      <p className="mb-2 text-justify"><strong>Laser & Crystal:</strong> A special laser shines on a crystal. This crystal acts like a factory, taking one high-energy photon from the laser and splitting it into two lower-energy, entangled "twin" photons (Signal and Idler).</p>
      <p className="mb-6 text-justify"><strong>Job:</strong> Creates the pairs of photons that will carry the secret key.</p>
            <img src="/photon-source.webp" alt="Photon Source" className="w-1/4 h-auto mx-auto" />

      <h2 className="text-2xl font-semibold mt-8 mb-4">2. Alice's Encoding Station</h2>
      <p className="mb-2 text-justify"><strong>Polarizers / Waveplates:</strong> These are like tiny filters that can change the photon's orientation (its polarization). Alice uses them to encode each photon as a 0 or a 1 in one of two different ways (e.g., horizontal/vertical or diagonal/anti-diagonal).</p>
      <p className="mb-2 text-justify"><strong>Beam Splitter:</strong> A simple glass element that randomly sends each photon down one of two paths. This random choice decides which encoding method Alice uses for that photon.</p>
      <div className="flex justify-center my-4">
        <img src="/beamSpliiter.png" alt="Beam Splitter" className="w-1/3 h-auto" />
      </div>
      <p className="mb-6 text-justify"><strong>Job:</strong> Encodes the secret key onto the photons and randomly chooses how to encode each bit.</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">3. The Quantum Channel</h2>
      <p className="mb-2 text-justify"><strong>Free Space or Fibre Optic Cable:</strong> This is the path the photons travel through from Alice to Bob. It could be the open air in a lab or a dedicated fibre optic cable.</p>
      <div className="flex justify-center my-4">
        <img src="/quantumChannelPhoto.jpeg" alt="Quantum Channel" className="w-1/3 h-auto" />
      </div>
      <p className="mb-6 text-justify"><strong>Job:</strong> The "wire" that sends the photons to Bob.</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">4. Bob's Decoding Station</h2>
      <p className="mb-2 text-justify"><strong>Beam Splitter:</strong> The first thing Bob's photon hits. It randomly sends the photon to one of two measurement setups. This random choice is his "guess" of which encoding method Alice used.</p>
      <p className="mb-2 text-justify"><strong>Polarizing Beam Splitters (PBS) & Detectors:</strong> Each measurement setup has a PBS that directs the photon to one of two detectors based on its polarization. The click from a detector tells Bob what bit (0 or 1) he measured.</p>
      <p className="mb-6 text-justify"><strong>Job:</strong> Measures the incoming photons and tries to decode the bits. Bob's random choice of measurement setup is crucial for security.</p>
      <div className="flex justify-center my-4">
        <img src="/beamSpliiter.png" alt="Beam Splitter" className="w-1/3 h-auto" />
      </div>
      <h2 className="text-2xl font-semibold mt-8 mb-4">5. The Detectors & Timer</h2>
      <p className="mb-2 text-justify"><strong>Single Photon Detectors (SPADs):</strong> These are super-sensitive cameras that can detect a single photon. They "click" when a photon arrives.</p>
      <div className="flex justify-center my-4">
        <img src="/SPAD.jpeg" alt="Single Photon Detectors (SPADs)" className="w-1/3 h-auto" />
      </div>
      <p className="mb-2 text-justify"><strong>Time-Stamping Unit (TCSPC):</strong> An electronic clock that records the exact nanosecond when each detector clicks.</p>
      <p className="mb-6 text-justify"><strong>Job:</strong> See the photons and record when they arrive. The precise timing is used to match Bob's detections with Alice's transmissions later.</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">6. The Classical Channel</h2>
      <p className="mb-2 text-justify"><strong>Internet / Radio Connection:</strong> A normal public communication channel (like a regular phone call or internet connection).</p>
      <div className="flex justify-center my-4">
        <img src="/classicalChannel.jpeg" alt="Classical Channel" className="w-1/3 h-auto" />
      </div>
      <p className="mb-6 text-justify"><strong>Job:</strong> After the quantum transmission, Alice and Bob use this channel to compare notes. They talk about when photons arrived, but never what the bit value was. This allows them to sift out the parts of the key where Bob guessed the right encoding method correctly.</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Simple Analogy:</h2>
      <p className="mb-4 text-justify">Think of it like this:</p>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Photon Source:</strong> A factory making identical pairs of magic coins.</li>
        <li><strong>Alice:</strong> Flips each coin to be Heads or Tails (0 or 1) and sometimes uses a secret decoder ring that changes the meaning of Heads and Tails (different basis).</li>
        <li><strong>Quantum Channel:</strong> She mails one coin from each pair to Bob in a sealed box.</li>
        <li><strong>Bob:</strong> Guesses whether to use the decoder ring or not on each coin he receives.</li>
        <li><strong>Classical Channel:</strong> Afterward, they get on the phone. Alice says "For the coin I sent at 1:05 PM, did you use the ring?" If Bob says yes, and she did too, they know that coin is part of their secret key. If Bob guessed wrong, they throw that coin's result away.</li>
      </ul>
      <p className="text-justify">The laws of quantum physics ensure that anyone trying to intercept and measure the coins in the mail will inevitably change them, leaving evidence of their eavesdropping.</p>
    </div>
  );
};
