import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Lock, ShieldCheck, Zap } from "lucide-react";

export const EnhancedTheorySection = () => {
  return (
    <div className="space-y-8 pb-0">
      <Card className="border-none shadow-soft">
        <CardHeader className="pb-2">
          <Badge variant="outline" className="w-fit mb-2 border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">Introduction</Badge>
          <CardTitle className="text-3xl font-bold text-foreground flex items-center gap-3">
            What is BB84 Protocol?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 pt-4">
          <p className="text-lg text-foreground/80 leading-relaxed text-justify">
            The digital world is under threat. Quantum computers will break today's encryption, but a defense exists - powered by the unbreakable laws of physics, not just math.
            Welcome to the quantum frontier of security. Q-Xplore is an immersive educational platform designed to make the complex world of Quantum Key Distribution (QKD) accessible and engaging. Through interactive simulations powered by Qiskit, you will not just learn about the BB84 protocol, you will run it, break it, and understand why it is the future of un-hackable communication.
          </p>

          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <span className="w-1 h-8 bg-blue-600 rounded-full inline-block"></span>
              Aim and Objective
            </h3>
            <div className="space-y-4 pl-4 border-l-2 border-gray-100 dark:border-gray-800">
              <p className="text-lg text-foreground/80 leading-relaxed text-justify">
                Our mission is to bridge the gap between complex quantum theory and practical, hands-on understanding.
              </p>

              <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
                <p className="text-lg text-foreground/90 mb-4"><span className="font-bold text-blue-600 dark:text-blue-400">Aim:</span> To provide a comprehensive, web-based learning environment that demystifies Quantum Key Distribution (QKD) through interactive simulation.</p>

                <p className="font-bold text-foreground text-lg mb-3">Objectives:</p>
                <ul className="space-y-3 ml-2">
                  {[
                    { title: "To Educate:", desc: "Explain the fundamental principles of quantum mechanics (superposition, measurement, no-cloning) that make QKD possible." },
                    { title: "To Simulate:", desc: "Offer a realistic, Qiskit-powered simulation of the BB84 protocol where users can play the roles of sender, receiver, and evesdropper." },
                    { title: "To Demonstrate:", desc: "Visually show how eavesdropping attempts introduce a detectable Quantum Bit Error Rate (QBER), providing irrefutable proof of security based on physics." },
                    { title: "To Prepare:", desc: "Equip students, researchers, and enthusiasts with the foundational knowledge to engage with quantum-safe cybersecurity." }
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 text-foreground/80 items-start">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                      <span><span className="font-semibold text-foreground">{item.title}</span> {item.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/50">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                <AlertCircle size={24} />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">The Quantum Threat is Real</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
                  Today's encryption like RSA and AES relies on math problems too difficult for classical computers to solve quickly. But quantum computers change everything. Using algorithms like Shor's Algorithm, they can break these codes in minutes, not millennia.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
                  This opens the door to <span className="font-semibold text-blue-700 dark:text-blue-300">"Harvest Now, Decrypt Later"</span> attacks. Data intercepted today whether personal, financial, or national security secrets can be stored until a quantum computer is available to decrypt it. The implications are global.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="text-red-500" />
                <h3 className="text-lg font-bold text-foreground">The Problem</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-justify mb-4">
                Imagine sending a locked box with a key. In classical cryptography, a hacker (Eve) can intercept the key, make a perfect copy, and forward the original completely undetected. She now has unrestricted access to your messages.
              </p>
              <p className="font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
                Classical information can be copied without a trace.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800/50">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-bold text-foreground">The Solution</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-justify mb-3">
                QKD harnesses the unbreakable laws of quantum physics. If Eve tries to measure a quantum particle, she must disturb it.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex gap-2 items-center"><Zap size={14} className="text-amber-500" /> Disturbance introduces detectable errors</li>
                <li className="flex gap-2 items-center"><Zap size={14} className="text-amber-500" /> Legitimate users detect the intrusion</li>
                <li className="flex gap-2 items-center"><Zap size={14} className="text-amber-500" /> Intrusion becomes obvious and provable</li>
              </ul>
            </div>
          </div>

          <div className="space-y-6 mt-8">
            <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <span className="w-1 h-8 bg-indigo-500 rounded-full inline-block"></span>
              Why is this a Revolution?
            </h3>

            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 uppercase tracking-wider text-xs font-semibold text-gray-500 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-4">Aspect</th>
                      <th className="px-6 py-4">Classical Key Exchange</th>
                      <th className="px-6 py-4 text-blue-600 dark:text-blue-400">Quantum Key Distribution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-slate-900">
                    <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">Security Foundation</td>
                      <td className="px-6 py-4 text-muted-foreground">Computational difficulty (hard math)</td>
                      <td className="px-6 py-4 font-medium text-blue-700 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-900/10">Laws of Physics (quantum mechanics)</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">Eavesdropping</td>
                      <td className="px-6 py-4 text-muted-foreground">Undetectable copying is possible</td>
                      <td className="px-6 py-4 font-medium text-blue-700 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-900/10">Measurement causes disturbance, leaving proof</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">Future-Proof</td>
                      <td className="px-6 py-4 text-muted-foreground">Broken by quantum algorithms (Shor's)</td>
                      <td className="px-6 py-4 font-medium text-blue-700 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-900/10">Secure against any computer, even quantum</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-slate-900">
                {[
                  {
                    label: "Security Foundation",
                    classical: "Computational difficulty (hard math)",
                    quantum: "Laws of Physics (quantum mechanics)",
                  },
                  {
                    label: "Eavesdropping",
                    classical: "Undetectable copying is possible",
                    quantum: "Measurement causes disturbance, leaving proof",
                  },
                  {
                    label: "Future-Proof",
                    classical: "Broken by quantum algorithms (Shor's)",
                    quantum: "Secure against any computer, even quantum",
                  },
                ].map((row) => (
                  <div key={row.label} className="p-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{row.label}</p>
                    <div className="rounded-md border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-slate-950/40 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Classical</p>
                      <p className="text-sm text-muted-foreground mt-1">{row.classical}</p>
                    </div>
                    <div className="rounded-md border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-300">Quantum (QKD)</p>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mt-1">{row.quantum}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 mt-8">
            <h3 className="text-xl font-semibold text-foreground">The Quantum Principles Behind the Magic</h3>
            <p className="text-foreground/80 leading-relaxed text-justify">
              QKD leverages several fascinating and non-negotiable properties of quantum mechanics:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "Quantum Superposition", desc: "A quantum particle can exist in multiple states at the same time until measured." },
                { title: "Measurement Disturbance", desc: "Measuring a particle forces it to 'choose' a state, changing it forever if measured wrong." },
                { title: "No-Cloning Theorem", desc: "Impossible to create an identical copy of an unknown quantum state." },
                { title: "Complementarity", desc: "Measuring in the wrong way yields a random result." }
              ].map((card, i) => (
                <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                  <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2">{card.title}</h4>
                  <p className="text-sm text-foreground/80">{card.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900">
              <h4 className="flex items-center gap-2 font-bold text-indigo-700 dark:text-indigo-300 mb-2">
                <ShieldCheck size={20} />
                The Security Guardian: Quantum Bit Error Rate (QBER)
              </h4>
              <p className="text-foreground/80 text-justify mb-3">
                This is the most critical metric. The QBER is the percentage of mismatched bits between Alice and Bob after they have compared a sample of their key.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-white dark:bg-indigo-900/50 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800">
                  <span className="font-bold text-green-600 dark:text-green-400 block mb-1">Low QBER</span>
                  Clean, secure connection with only natural noise.
                </div>
                <div className="bg-white dark:bg-indigo-900/50 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800">
                  <span className="font-bold text-red-500 dark:text-red-400 block mb-1">High QBER (&gt;25%)</span>
                  Undeniable proof of eavesdropping. Eve's interference creates random errors.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-soft">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">Types of QKD</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground/80 leading-relaxed text-justify">
            While several protocols exist, they all leverage quantum mechanics to achieve secure key exchange.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: "BB84", subtitle: "The Standard", desc: "The original and most widely implemented protocol, using photon polarization.", color: "blue" },
              { name: "E91", subtitle: "The Entangled", desc: "Uses 'spooky action at a distance'—quantum entanglement—to create correlations.", color: "purple" },
              { name: "CV-QKD", subtitle: "The Integrator", desc: "Uses continuous properties of light, allowing integration with existing telecom fibers.", color: "cyan" }
            ].map((type, i) => (
              <div key={i} className={`p-5 rounded-xl bg-${type.color}-50 dark:bg-${type.color}-900/10 border border-${type.color}-100 dark:border-${type.color}-900/50`}>
                <h4 className={`text-lg font-bold text-${type.color}-700 dark:text-${type.color}-300`}>{type.name}</h4>
                <span className={`text-xs uppercase tracking-wider font-semibold text-${type.color}-600/70 dark:text-${type.color}-400/70 mb-2 block`}>{type.subtitle}</span>
                <p className="text-sm text-foreground/80">{type.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-soft">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">The Quantum Magic Trick: It's All in the Basis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-foreground/80 leading-relaxed text-justify">
            The protocol uses a simple but powerful concept: information can be encoded in different, incompatible ways.
          </p>

          <div className="flex flex-wrap gap-12 justify-center py-8 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col items-center group">
              <div className="text-blue-600 dark:text-blue-400 font-bold mb-4 text-lg">Rectilinear Basis (+)</div>
              <div className="relative w-32 h-32 flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
                <div className="absolute w-24 h-0.5 bg-blue-500/30"></div>
                <div className="absolute w-0.5 h-24 bg-blue-500/30"></div>
                <div className="absolute w-12 h-12 rounded-full border-2 border-blue-500 bg-background shadow-lg shadow-blue-500/20 flex items-center justify-center z-10">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <line x1="6" y1="12" x2="18" y2="12" strokeWidth="2"></line>
                    <polygon points="16,9 20,12 16,15" fill="currentColor"></polygon>
                  </svg>
                </div>
              </div>
              <div className="text-sm font-medium text-foreground/60 text-center mt-4 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border shadow-sm">Horizontal (0) or Vertical (1)</div>
            </div>

            <div className="flex flex-col items-center group">
              <div className="text-purple-600 dark:text-purple-400 font-bold mb-4 text-lg">Diagonal Basis (X)</div>
              <div className="relative w-32 h-32 flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
                <div className="absolute w-24 h-0.5 bg-purple-500/30 transform -rotate-45 origin-center"></div>
                <div className="absolute w-24 h-0.5 bg-purple-500/30 transform rotate-45 origin-center"></div>
                <div className="absolute w-12 h-12 rounded-full border-2 border-purple-500 bg-background shadow-lg shadow-purple-500/20 flex items-center justify-center z-10">
                  <svg className="w-6 h-6 text-purple-600 transform rotate-145" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" transform="rotate(-45 12 12)"></line>
                    <polygon points="18,8 22,12 18,16" fill="currentColor" transform="rotate(-45 12 12)"></polygon>
                  </svg>
                </div>
              </div>
              <div className="text-sm font-medium text-foreground/60 text-center mt-4 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border shadow-sm">45° (0) or 135° (1)</div>
            </div>
          </div>

          <p className="text-foreground/80 text-justify bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg border-l-4 border-amber-400">
            <span className="font-bold text-amber-700 dark:text-amber-500 block mb-1">Crucial Concept:</span>
            If Bob uses the wrong basis to measure a photon, his result is completely random. He has only a 50% chance of guessing the correct bit. This randomness is the core of the protocol's security.
          </p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-soft">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">The BB84 Protocol Block Diagram</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white dark:bg-white/5 p-8 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-center">
            <img src="/Working-process-of-the-bb84-upscaled.png" alt="BB84 Protocol Block Diagram" className="w-full max-w-2xl h-auto transition-transform hover:scale-[1.02] duration-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-soft">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">
            A Step-by-Step Walkthrough
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <p className="text-lg text-foreground/80 leading-relaxed text-justify">
            Our simulation will guide you through this elegant dance between Alice and Bob.
          </p>

          <div className="space-y-0">
            {[
              { title: "Quantum Encoding (Alice)", desc: "Alice generates a random string of bits (0s and 1s). For each bit, she randomly chooses a basis (+ or X) and prepares a photon in the corresponding polarization state." },
              { title: "Quantum Transmission", desc: "She sends this sequence of photons to Bob one by one." },
              { title: "Quantum Measurement (Bob)", desc: "For each incoming photon, Bob randomly guesses which basis (+ or X) to use for measurement. If his basis matches Alice's, he measures the correct bit value. If his basis is wrong, his result is random." },
              { title: "The Sifting Process", desc: "Alice and Bob talk publicly. They only reveal the sequence of bases they each used, never the actual bit values. They discard all bits where their bases did not match, forming the 'Sifted Key'." },
              { title: "Catching the Eavesdropper", desc: "Alice and Bob sacrifice a random portion of their sifted key to compare bits. A low error rate (QBER) means security. A high QBER (>25%) proves eavesdropping." }
            ].map((step, i, arr) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-700 text-sm font-bold text-blue-600 dark:text-blue-400 shrink-0 z-10 transition-colors duration-300">
                    {i + 1}
                  </div>
                  {i < arr.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-100 dark:bg-gray-800 my-1"></div>
                  )}
                </div>
                <div className="pb-8 pt-1">
                  <h4 className="font-bold text-foreground mb-2 text-lg">{step.title}</h4>
                  <p className="text-foreground/70 text-base leading-relaxed max-w-2xl">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-border bg-card p-5 sm:p-6 lg:p-8 shadow-soft relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 sm:w-56 sm:h-56 bg-blue-500/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>
            <div className="relative z-10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground flex items-center gap-2">
                  <Zap className="text-amber-500" />
                  The Ultimate Test: Activate Eve
                </h3>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full w-fit">
                  Live QBER Impact
                </span>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                <p>
                  This is where the magic happens. In our simulation, you can switch on the eavesdropper.
                  Watch in real-time as Eve's desperate guesses corrupt the quantum states. She doesn't know the basis, so she guesses randomly, just like Bob.
                </p>
                <div className="p-4 rounded-lg border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20">
                  <p className="font-medium text-foreground">
                    See the QBER spike from near-zero to over 25%, providing irrefutable proof she was there.
                  </p>
                </div>
                <p>
                  Understand, visually and intuitively, why this system is provably secure. The laws of physics themselves become your security guard.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
