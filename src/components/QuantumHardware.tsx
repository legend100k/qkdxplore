export const QuantumHardware = () => {
  const sections = [
    {
      id: "photon-source",
      title: "1. The Photon Source",
      body: [
        "Laser & Crystal: A special laser shines on a crystal. This crystal acts like a factory, taking one high-energy photon from the laser and splitting it into two lower-energy, entangled \"twin\" photons (Signal and Idler).",
        "Job: Creates the pairs of photons that will carry the secret key.",
      ],
      image: "/photon-source.webp",
      alt: "Photon Source",
    },
    {
      id: "alice-encoding",
      title: "2. Alice's Encoding Station",
      body: [
        "Polarizers / Waveplates: These are like tiny filters that can change the photon's orientation (its polarization). Alice uses them to encode each photon as a 0 or a 1 in one of two different ways (e.g., horizontal/vertical or diagonal/anti-diagonal).",
        "Beam Splitter: A simple glass element that randomly sends each photon down one of two paths. This random choice decides which encoding method Alice uses for that photon.",
        "Job: Encodes the secret key onto the photons and randomly chooses how to encode each bit.",
      ],
      image: "/beamSpliiter.png",
      alt: "Beam Splitter",
    },
    {
      id: "quantum-channel",
      title: "3. The Quantum Channel",
      body: [
        "Free Space or Fibre Optic Cable: This is the path the photons travel through from Alice to Bob. It could be the open air in a lab or a dedicated fibre optic cable.",
        "Job: The \"wire\" that sends the photons to Bob.",
      ],
      image: "/quantumChannelPhoto.jpeg",
      alt: "Quantum Channel",
    },
    {
      id: "bob-decoding",
      title: "4. Bob's Decoding Station",
      body: [
        "Beam Splitter: The first thing Bob's photon hits. It randomly sends the photon to one of two measurement setups. This random choice is his \"guess\" of which encoding method Alice used.",
        "Polarizing Beam Splitters (PBS) & Detectors: Each measurement setup has a PBS that directs the photon to one of two detectors based on its polarization. The click from a detector tells Bob what bit (0 or 1) he measured.",
        "Job: Measures the incoming photons and tries to decode the bits. Bob's random choice of measurement setup is crucial for security.",
      ],
      image: "/beamSpliiter.png",
      alt: "Beam Splitter",
    },
    {
      id: "detectors-timer",
      title: "5. The Detectors & Timer",
      body: [
        "Single Photon Detectors (SPADs): These are super-sensitive cameras that can detect a single photon. They \"click\" when a photon arrives.",
        "Time-Stamping Unit (TCSPC): An electronic clock that records the exact nanosecond when each detector clicks.",
        "Job: See the photons and record when they arrive. The precise timing is used to match Bob's detections with Alice's transmissions later.",
      ],
      image: "/SPAD.jpeg",
      alt: "Single Photon Detectors (SPADs)",
    },
    {
      id: "classical-channel",
      title: "6. The Classical Channel",
      body: [
        "Internet / Radio Connection: A normal public communication channel (like a regular phone call or internet connection).",
        "Job: After the quantum transmission, Alice and Bob use this channel to compare notes. They talk about when photons arrived, but never what the bit value was. This allows them to sift out the parts of the key where Bob guessed the right encoding method correctly.",
      ],
      image: "/classicalChannel.jpeg",
      alt: "Classical Channel",
    },
  ];

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">The Complete Hardware Stack for a BB84 System</h1>
        <p className="text-base text-muted-foreground">
          Imagine Alice wants to send a secret key to Bob using light particles (photons). Here's the hardware they need and the simple job of each part.
        </p>
      </div>

      <div className="rounded-md border bg-card p-6 shadow-soft">
        <img src="/Photon source.png" alt="QKD System Diagram" className="w-full rounded-md border border-border bg-white/5" />
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p>
            This diagram shows the working of a Quantum Key Distribution (QKD) system using optical components like photon sources, beam splitters, and photon detectors. On the sender's side, Alice uses a photon source that emits single photons. These photons pass through beam splitters and polarization filters, encoding binary data ("0" or "1") through different polarization orientations, shown by the arrows.
          </p>
          <p>
            The photons then travel through the quantum channel to Bob (Receiver), who uses a beam splitter and photon detectors to measure their polarization. Depending on the chosen measurement basis, the detectors output "0" or "1."
          </p>
          <p>
            Through a classical channel, Alice and Bob compare their measurement bases and keep only the matching bits to generate a shared secret key. This key is then used by encryptors on both sides to convert plain text into ciphertext securely. The setup highlights photon transmission and optical gate operations in QKD encryption.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {sections.map((section) => (
          <div key={section.id} className="rounded-md border bg-card p-6 shadow-soft space-y-4">
            <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              {section.body.map((text, index) => (
                <p key={index}>{text}</p>
              ))}
            </div>
            <div className="rounded-md border border-border bg-muted/40 p-3">
              <img src={section.image} alt={section.alt} className="w-full h-auto rounded-md" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-md border bg-card p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-foreground mb-3">Simple Analogy</h2>
        <p className="text-sm text-muted-foreground mb-4">Think of it like this:</p>
        <ul className="grid gap-2 text-sm text-muted-foreground list-disc pl-5">
          <li><strong>Photon Source:</strong> A factory making identical pairs of magic coins.</li>
          <li><strong>Alice:</strong> Flips each coin to be Heads or Tails (0 or 1) and sometimes uses a secret decoder ring that changes the meaning of Heads and Tails (different basis).</li>
          <li><strong>Quantum Channel:</strong> She mails one coin from each pair to Bob in a sealed box.</li>
          <li><strong>Bob:</strong> Guesses whether to use the decoder ring or not on each coin he receives.</li>
          <li><strong>Classical Channel:</strong> Afterward, they get on the phone. Alice says "For the coin I sent at 1:05 PM, did you use the ring?" If Bob says yes, and she did too, they know that coin is part of their secret key. If Bob guessed wrong, they throw that coin's result away.</li>
        </ul>
        <p className="text-sm text-muted-foreground mt-4">
          The laws of quantum physics ensure that anyone trying to intercept and measure the coins in the mail will inevitably change them, leaving evidence of their eavesdropping.
        </p>
      </div>
    </div>
  );
};
