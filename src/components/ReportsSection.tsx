import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, Packer } from 'docx';
import { saveAs } from 'file-saver';
import { ExperimentResult } from './experiments/common/types';

interface ReportsSectionProps {
  availableExperiments?: ExperimentResult[];
}

interface ExperimentData {
  name: string;
  aim: string;
  objective: string;
  apparatus: string;
  theory: string;
  procedure: string[];
}

// Parse experiment data from reports-section.txt content
const getExperimentData = (experimentId: string): ExperimentData => {
  const experiments: { [key: string]: ExperimentData } = {
    'effect-of-qubits': {
      name: 'Experiment 1: Effect of Qubits',
      aim: 'To study the fundamental role of qubits and their quantum properties in the BB84 protocol.',
      objective: 'To understand how the principles of superposition, measurement disturbance, and the no-cloning theorem provide the security foundation for Quantum Key Distribution (QKD).',
      apparatus: 'Qkd-xplore Virtual Lab (Web-based interface powered by Qiskit)',
      theory: `The BB84 protocol leverages the unique properties of quantum bits, or qubits, which is the fundamental unit of quantum information. Unlike a classical bit, which is definitively 0 or 1, a qubit can exist in a superposition of both states simultaneously, represented as |ψ⟩ = α|0⟩ + β|1⟩, where α and β are complex probability amplitudes (|α|² + |β|² = 1).
In BB84, information is encoded onto qubits using two non-orthogonal bases:
The Rectilinear Basis (+): |0⟩₊ = |→⟩ (Horizontal polarization), |1⟩₊ = |↑⟩ (Vertical polarization)
The Diagonal Basis (×): |0⟩ₓ = |↗⟩ = (|→⟩ + |↑⟩)/√2 (45° polarization), |1⟩ₓ = |↖⟩ = (|→⟩ - |↑⟩)/√2 (135° polarization)
The protocol's security is not mathematical but physical, relying on three core principles:
Measurement Disturbance: Measuring a quantum system irrevocably collapses its state. If Bob measures a qubit in a basis different from the one Alice used to prepare it, the result is random (50% chance of |0⟩ or |1⟩), and the original information is lost.
No-Cloning Theorem: It is impossible to create an identical copy (clone) of an arbitrary unknown quantum state. An evesdropper, Eve, cannot perfectly intercept, copy, and resend a qubit without altering the original.
Heisenberg Uncertainty Principle: Certain pairs of physical properties (like polarization in different bases) cannot be simultaneously known with perfect accuracy. This makes it impossible to measure a quantum state in multiple ways without introducing errors.
These properties ensure that any attempt to gain information about the key introduces detectable anomalies.`,
      procedure: [
        "Go to the Qkd-xplore Virtual Lab simulator.",
        "Run the BB84 simulation without any evesdropper and with low channel noise.",
        "Note the QBER and the successful generation of a secure key.",
        "Take a screenshot of the results screen showing the low QBER."
      ]
    },
    'without-eavesdropper': {
      name: 'Experiment 2: BB84 Without an Evesdropper',
      aim: "To establish a baseline for the BB84 protocol's performance under ideal, secure conditions.",
      objective: 'To observe the key generation process and resulting QBER when the quantum channel is secure.',
      apparatus: 'Qkd-xplore Virtual Lab',
      theory: `This experiment establishes the optimal operating conditions for the BB84 protocol. In the complete absence of an evesdropper, the only factors affecting the Quantum Bit Error Rate (QBER) are the inherent channel noise and system imperfections, as described in Experiment 2. Under well-controlled laboratory conditions with high-quality components, this intrinsic QBER can be very low, often below 2%.
The process proceeds as follows:
Quantum Transmission: Alice sends a sequence of qubits, each randomly prepared in one of the two bases.
Quantum Measurement: Bob independently and randomly chooses a basis for each incoming qubit and measures it.
Sifting: Alice and Bob publicly communicate the bases they used for each qubit (but not the bit values) over a classical channel. They discard all bits where their bases did not match. The remaining bits form the sifted key.
Error Estimation: They compare a random subset of the sifted key to calculate the QBER. A low QBER confirms the channel is secure.
Key Finalization: The remaining portion of the sifted key is then processed through error correction (to fix the few remaining errors) and privacy amplification (to reduce any partial information a potential evesdropper might have) to produce a final, identical, and perfectly secret key.
This scenario demonstrates the protocol's maximum efficiency and serves as a control to identify the disruptive effects of an evesdropper.`,
      procedure: [
        "Go to the Qkd-xplore Virtual Lab simulator.",
        'Set the "evesdropper" parameter to OFF and "Channel Noise" to LOW.',
        "Run the simulation and note the low QBER and efficient key generation.",
        "Take a screenshot of the successful results."
      ]
    },
    'with-eavesdropper': {
      name: 'Experiment 3: With an Evesdropper',
      aim: 'To demonstrate the detection of an evesdropper (Eve) using the BB84 protocol.',
      objective: "To observe how Eve's interception attempts disturb the quantum states and significantly increase the QBER.",
      apparatus: 'Qkd-xplore Virtual Lab',
      theory: `This experiment demonstrates the core security feature of BB84: the detectable disruption caused by any interception attempt. The most straightforward attack is the intercept-resend attack:
Interception: Eve intercepts the qubit sent by Alice.
Measurement: She randomly chooses a basis (rectilinear or diagonal) to measure it. She has a 50% chance of choosing the wrong basis.
Disturbance: If she chooses the wrong basis, the qubit's state collapses randomly. She records this random result as the bit value.
Resending: To hide her presence, she must send a new qubit to Bob prepared in the state she measured.
This action introduces errors. The probability that Eve chooses the wrong basis is 1/2. If she chooses wrong, she sends the wrong state to Bob. However, Bob also has a 50% chance of choosing the wrong basis for his measurement. The overall probability that an error is introduced for a bit that Eve tampered with is calculated as:
P(Eve chooses wrong basis) = 1/2
P(Bob gets wrong bit | Eve was wrong) = 1/2
Therefore, P(Error) = (1/2) * (1/2) = 1/4 or 25%
Thus, Eve's activity raises the Quantum Bit Error Rate (QBER) to approximately 25%, which is far above the typical tolerable threshold of ~11%. This dramatic and predictable increase is an unambiguous signature of eavesdropping, forcing Alice and Bob to discard the compromised key.`,
      procedure: [
        "Go to the Qkd-xplore Virtual Lab simulator.",
        'Set the "evesdropper" parameter to ON.',
        "Run the simulation and observe the QBER.",
        "Take a screenshot of the results showing the high (~25%) QBER."
      ]
    },
    'effect-of-channel-noise': {
      name: 'Experiment 4: Effect of Channel Noise',
      aim: 'To investigate how noise in the quantum channel affects the security of the BB84 protocol by increasing the Quantum Bit Error Rate (QBER).',
      objective: 'To isolate and observe the impact of channel noise on the QBER.',
      apparatus: 'Qkd-xplore Virtual Lab',
      theory: `Channel noise stems from physical imperfections like photon scattering, polarization drift, and detector dark counts. Unlike photon loss, noise directly causes bit errors: Bob detects a photon but records the wrong bit value. This directly increases the QBER. A high QBER can render the key insecure, even without an evesdropper, as it becomes impossible to distinguish these errors from a malicious attack.`,
      procedure: [
        "Set evesdropper = OFF, Distance = SHORT (to minimize other effects).",
        "Set Channel Noise = LOW. Run the simulation. Record the QBER and Final Key Length. This is your baseline.",
        "Set Channel Noise = MEDIUM. Run the simulation. Record the QBER and Final Key Length.",
        "Set Channel Noise = HIGH. Run the simulation. Record the QBER and Final Key Length."
      ]
    },
    'effect-of-distance': {
      name: 'Experiment 5: Effect of Distance',
      aim: 'To analyze how increasing the transmission distance impacts the efficiency and performance of the BB84 protocol.',
      objective: 'To observe the relationship between distance, photon loss (key rate), and error rate (QBER).',
      apparatus: 'Qkd-xplore Virtual Lab',
      theory: `The primary effect of distance is exponential photon loss (attenuation), which drastically reduces the number of photons reaching Bob and thus the final key rate. Furthermore, over longer distances, effects like polarization drift have more time to occur, which can also cause errors and lead to a slight increase in the QBER alongside the major issue of loss.`,
      procedure: [
        "Set evesdropper = OFF, Channel Noise = LOW.",
        "Set Distance = SHORT. Run the simulation. Record the QBER and Final Key Length. This is your baseline.",
        "Set Distance = MEDIUM. Run the simulation. Record the QBER and Final Key Length.",
        "Set Distance = LONG. Run the simulation. Record the QBER and Final Key Length."
      ]
    },
    'overall': {
      name: 'Experiment 6: Effect of Photon Loss',
      aim: 'To study the specific impact of photon loss on the efficiency of the BB84 protocol and distinguish it from bit errors.',
      objective: 'To demonstrate that photon loss reduces the key rate but does not directly increase the QBER.',
      apparatus: 'Qkd-xplore Virtual Lab',
      theory: `It is crucial to distinguish between Photon Loss and Bit Errors.
Photon Loss: A photon is sent but not detected. This reduces the raw number of bits, lowering the key rate, but it does not increase the QBER (a lost photon isn't an error; it's just missing data).
Bit Errors: A photon is detected but its value is wrong. This increases the QBER and compromises security.
An evesdropper causes errors. Channel noise causes errors. Distance causes loss (which can lead to errors indirectly). This experiment isolates the pure effect of loss.`,
      procedure: [
        "Set evesdropper = OFF, Channel Noise = LOW (to ensure no errors are introduced).",
        'Find a "Photon Loss" or "Attenuation" parameter. If not available, use Distance = LONG.',
        "Set loss to HIGH (or use max distance). Run the simulation.",
        "Record the very short (or zero) Final Key Length and the QBER."
      ]
    }
  };
  
  return experiments[experimentId] || {
    name: 'Unknown Experiment',
    aim: 'Unknown',
    objective: 'Unknown',
    apparatus: 'Qkd-xplore Virtual Lab',
    theory: 'Unknown',
    procedure: ['Run the experiment with default parameters']
  };
};

export const ReportsSection: React.FC<ReportsSectionProps> = ({ availableExperiments = [] }) => {
  const [selectedExperiment, setSelectedExperiment] = useState<string>('');
  const [userConclusion, setUserConclusion] = useState<string>('');
  const [experimentResultData, setExperimentResultData] = useState<ExperimentResult | null>(null);
  
  useEffect(() => {
    if (selectedExperiment && availableExperiments.length > 0) {
      const expData = availableExperiments.find(exp => exp.id === selectedExperiment);
      setExperimentResultData(expData || null);
    }
  }, [selectedExperiment, availableExperiments]);

  const generateDocx = async () => {
    if (!selectedExperiment) {
      alert('Please select an experiment first');
      return;
    }

    const expInfo = getExperimentData(selectedExperiment);
    if (!expInfo) return;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: expInfo.name,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: "AIM",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: expInfo.aim,
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: "OBJECTIVE",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: expInfo.objective,
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: "APPARATUS",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: expInfo.apparatus,
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: "THEORY",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          ...expInfo.theory.split('\n').filter(p => p.trim()).map(para => 
            new Paragraph({
              text: para,
              spacing: { after: 100 }
            })
          ),
          
          new Paragraph({
            text: "PROCEDURE",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          ...expInfo.procedure.map((step, index) => 
            new Paragraph({
              text: `${index + 1}. ${step}`,
              spacing: { after: 50 }
            })
          ),
          
          new Paragraph({
            text: "RESULTS",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: "Graphs and experimental data will be inserted here by the user.",
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Note: Please add your experiment graphs, charts, and observations in this section.",
                italics: true
              })
            ],
            spacing: { after: 100 }
          }),
          
          ...(experimentResultData && experimentResultData.data && experimentResultData.data.length > 0 ? [
            new Paragraph({
              text: "Experimental Data Table:",
              spacing: { before: 100, after: 100 }
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: Object.keys(experimentResultData.data[0]).map(key => 
                    new TableCell({
                      children: [new Paragraph({ 
                        text: key.charAt(0).toUpperCase() + key.slice(1),
                        alignment: AlignmentType.CENTER
                      })]
                    })
                  )
                }),
                ...experimentResultData.data.map(row => 
                  new TableRow({
                    children: Object.values(row).map(value => 
                      new TableCell({
                        children: [new Paragraph({ 
                          text: typeof value === 'number' ? value.toFixed(2) : String(value),
                          alignment: AlignmentType.CENTER
                        })]
                      })
                    )
                  })
                )
              ]
            })
          ] : []),
          
          new Paragraph({
            text: "CONCLUSION",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: userConclusion || "(User-provided conclusion to be inserted here)",
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: `Report generated on: ${new Date().toLocaleDateString()}`,
            alignment: AlignmentType.RIGHT,
            spacing: { before: 400 }
          })
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${selectedExperiment}_report.docx`);
  };

  return (
    <Card className="border-quantum-glow">
      <CardHeader>
        <CardTitle className="text-quantum-blue flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Experiment Reports
        </CardTitle>
        <p className="text-muted-foreground">
          Generate comprehensive reports for your experiments with customizable results and conclusions
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="experiment-select">Select Experiment</Label>
          <Select value={selectedExperiment} onValueChange={setSelectedExperiment}>
            <SelectTrigger id="experiment-select" className="w-full">
              <SelectValue placeholder="Choose an experiment to generate report" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="effect-of-qubits">Experiment 1: Effect of Qubits</SelectItem>
              <SelectItem value="without-eavesdropper">Experiment 2: BB84 Without an Evesdropper</SelectItem>
              <SelectItem value="with-eavesdropper">Experiment 3: With an Evesdropper</SelectItem>
              <SelectItem value="effect-of-channel-noise">Experiment 4: Effect of Channel Noise</SelectItem>
              <SelectItem value="effect-of-distance">Experiment 5: Effect of Distance</SelectItem>
              <SelectItem value="overall">Experiment 6: Effect of Photon Loss</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedExperiment && (() => {
          const expData = getExperimentData(selectedExperiment);
          return (
            <>
              <Card className="bg-secondary/20">
                <CardHeader>
                  <CardTitle className="text-sm">Report Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold mb-1">Aim:</h3>
                    <p className="text-muted-foreground text-justify">
                {expData.aim}
              </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-1">Objective:</h3>
                    <p className="text-muted-foreground">{expData.objective}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-1">Apparatus:</h3>
                    <p className="text-muted-foreground">{expData.apparatus}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-1">Theory:</h3>
                    <p className="text-muted-foreground text-xs max-h-32 overflow-y-auto whitespace-pre-line">
                      {expData.theory}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-1">Procedure:</h3>
                    <ol className="text-muted-foreground text-xs list-decimal list-inside space-y-1">
                      {expData.procedure.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {experimentResultData && experimentResultData.data && experimentResultData.data.length > 0 && (
                <Card className="bg-secondary/10">
                  <CardHeader>
                    <CardTitle className="text-sm">Experimental Data Table (from simulation)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b">
                            {Object.keys(experimentResultData.data[0]).map((key) => (
                              <th key={key} className="px-2 py-1 text-left">
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {experimentResultData.data.slice(0, 5).map((row, idx) => (
                            <tr key={idx} className="border-b">
                              {Object.values(row).map((value, vIdx) => (
                                <td key={vIdx} className="px-2 py-1">
                                  {typeof value === 'number' ? value.toFixed(2) : String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                          {experimentResultData.data.length > 5 && (
                            <tr>
                              <td colSpan={Object.keys(experimentResultData.data[0]).length} className="text-center py-2 text-muted-foreground">
                                ... and {experimentResultData.data.length - 5} more rows
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div>
                <Label htmlFor="user-conclusion">Conclusion</Label>
                <Textarea
                  id="user-conclusion"
                  placeholder="Enter your conclusion based on the experimental results..."
                  value={userConclusion}
                  onChange={(e) => setUserConclusion(e.target.value)}
                  className="min-h-[100px]"
                />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={generateDocx}
                  className="bg-quantum-blue hover:bg-quantum-blue/90 flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  Download Report (.docx)
                </Button>
              </div>
            </>
          );
        })()}
      </CardContent>
    </Card>
  );
};
