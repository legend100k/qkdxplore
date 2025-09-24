import { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import styles from './SimulationSection.module.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface EveData {
  measureBasis: string;
  sendBasis: string;
}

interface TransmissionData {
  step: number;
  aliceBit: number;
  aliceBasis: string;
  eveBasesData: string[];
  bobBasis: string;
  bobBit: string;
  status: string;
  sifted: boolean;
  error: boolean;
}

const getBasisSymbol = (basis: number): string => {
  return basis === 0 ? '+' : '×';
};

const getPolarization = (bit: number, basis: number): string => {
  if (basis === 0) {
    return bit === 0 ? 'H' : 'V';
  } else {
    return bit === 0 ? '+45°' : '-45°';
  }
};

const getPolarizationSymbol = (bit: number, basis: number): string => {
  if (basis === 0) {
    return bit === 0 ? '→' : '↑';
  } else {
    return bit === 0 ? '↗' : '↖';
  }
};

export const SimulationSection = () => {
  // Simulation state
  const [isRunning, setIsRunning] = useState(false);
  const [isBurst, setIsBurst] = useState(false);
  const [currentQubit, setCurrentQubit] = useState(0);
  const [data, setData] = useState<TransmissionData[]>([]);
  const [interceptCount, setInterceptCount] = useState(0);
  const [aliceKey, setAliceKey] = useState<number[]>([]);
  const [bobKey, setBobKey] = useState<number[]>([]);
  
  // Alice and Bob information
  const [aliceInfo, setAliceInfo] = useState({
    bit: '-',
    basis: '-',
    polarization: '-'
  });
  
  const [bobInfo, setBobInfo] = useState({
    basis: '-',
    bit: '-',
    result: '-'
  });
  
  // Animation state
  const [photonPosition, setPhotonPosition] = useState(0);
  const [photonVisible, setPhotonVisible] = useState(false);
  const [photonVibrating, setPhotonVibrating] = useState(false);
  const [photonFalling, setPhotonFalling] = useState(false);
  const [statusInfo, setStatusInfo] = useState('Ready...');
  const [statusInfoVisible, setStatusInfoVisible] = useState(false);
  const [activeEve, setActiveEve] = useState<number | null>(null);
  const [alicePolarizer, setAlicePolarizer] = useState('+');
  const [bobPolarizer, setBobPolarizer] = useState('+');
  const [evePolarizers, setEvePolarizers] = useState<Array<{measure: string, send: string}>>([
    {measure: '+', send: '+'},
    {measure: '+', send: '+'},
    {measure: '+', send: '+'},
    {measure: '+', send: '+'},
    {measure: '+', send: '+'}
  ]);
  
  // Control parameters
  const [numQubits, setNumQubits] = useState(20);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [distance, setDistance] = useState(1);
  const [attenuation, setAttenuation] = useState(5);
  const [numEves, setNumEves] = useState(0);
  const [speed, setSpeed] = useState(5);
  
  // Chart reference
  const chartRef = useRef<any>(null);
  
  // Security status
  const [securityStatus, setSecurityStatus] = useState({
    text: '🔒 Channel Secure',
    level: 'secure' as 'secure' | 'warning' | 'danger'
  });

  // Initialize chart data
  const [chartData, setChartData] = useState({
    labels: [] as number[],
    datasets: [
      {
        label: 'QBER (%)',
        data: [] as number[],
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.2
      }
    ]
  });

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 25,
        title: { display: true, text: 'QBER (%)' }
      },
      x: {
        title: { display: true, text: 'Sifted Bits' }
      }
    }
  };

  // Update distance-based Eves
  useEffect(() => {
    let autoEves = 0;
    if (distance >= 20) autoEves = 1;
    if (distance >= 40) autoEves = 2;
    if (distance >= 60) autoEves = 3;
    if (distance >= 80) autoEves = 4;
    if (distance >= 100) autoEves = 5;
    
    setNumEves(autoEves);
  }, [distance]);

  // Measure qubit function
  const measureQubit = (bit: number, sendBasis: number, measureBasis: number): number => {
    const noise = noiseLevel / 100;
    if (Math.random() < noise) {
      return Math.random() < 0.5 ? 0 : 1;
    }

    if (sendBasis === measureBasis) {
      return bit;
    }

    return Math.random() < 0.5 ? 0 : 1;
  };

  // Check signal loss
  const checkSignalLoss = (): boolean => {
    const baseAttenuation = attenuation / 100;
    return Math.random() < baseAttenuation;
  };

  // Should photon vibrate
  const shouldPhotonVibrate = (): boolean => {
    const baseAttenuation = attenuation / 100;
    return baseAttenuation > 0.05;
  };

  // Process Eve interception
  const processEveInterception = (bit: number, basis: number, numEves: number) => {
    let currentBit = bit;
    let currentBasis = basis;
    const eveBasesData: string[] = ['-', '-', '-', '-', '-'];
    
    // Create a copy of the current evePolarizers state
    const newEvePolarizers = [...evePolarizers];

    for (let i = 0; i < numEves; i++) {
      const eveMeasureBasis = Math.random() < 0.5 ? 0 : 1;
      const eveSendBasis = Math.random() < 0.5 ? 0 : 1;
      
      const eveResult = measureQubit(currentBit, currentBasis, eveMeasureBasis);
      
      eveBasesData[i] = `${getBasisSymbol(eveMeasureBasis)}→${getBasisSymbol(eveSendBasis)}`;
      
      // Set active Eve for animation
      setActiveEve(i);
      setTimeout(() => setActiveEve(null), 1500);
      
      // Update eve polarizers state
      newEvePolarizers[i] = {
        measure: getBasisSymbol(eveMeasureBasis),
        send: getBasisSymbol(eveSendBasis)
      };

      currentBit = eveResult;
      currentBasis = eveSendBasis;
    }
    
    // Update the evePolarizers state
    setEvePolarizers(newEvePolarizers);

    return {
      bit: currentBit,
      basis: currentBasis,
      eveBasesData: eveBasesData
    };
  };

  // Animate photon
  const animatePhoton = async (bit: number, basis: number, willBeLost: boolean = false) => {
    // Set initial state
    setPhotonVisible(true);
    setStatusInfo(`Photon: ${getPolarization(bit, basis)}`);
    setStatusInfoVisible(true);
    
    if (shouldPhotonVibrate()) {
      setPhotonVibrating(true);
    }

    setPhotonPosition(0);
    
    // Move photon
    setTimeout(() => {
      if (!willBeLost) {
        setPhotonPosition(100);
      } else {
        const fallPosition = 20 + Math.random() * 60;
        setPhotonPosition(fallPosition);
        
        setTimeout(() => {
          setPhotonVibrating(false);
          setPhotonFalling(true);
          setStatusInfo('Signal Lost!');
        }, 1000);
      }
    }, 100);

    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, willBeLost ? 3000 : 2000));

    // Reset animation state
    setPhotonVisible(false);
    setPhotonVibrating(false);
    setPhotonFalling(false);
    setPhotonPosition(0);
    setStatusInfoVisible(false);
  };

  // Update stats
  const updateStats = (newData: TransmissionData[]) => {
    const totalSent = newData.length;
    const totalReceived = newData.filter(d => d.status !== 'Lost').length;
    const siftedData = newData.filter(d => d.sifted);
    const siftedBits = siftedData.length;
    const errorCount = siftedData.filter(d => d.error).length;
    const qber = siftedBits > 0 ? (errorCount / siftedBits) * 100 : 0;

    // Update security status
    if (qber > 11) {
      setSecurityStatus({
        text: '🚨 Channel Compromised',
        level: 'danger'
      });
    } else if (qber > 5) {
      setSecurityStatus({
        text: '⚠️ Suspicious Activity',
        level: 'warning'
      });
    } else {
      setSecurityStatus({
        text: '🔒 Channel Secure',
        level: 'secure'
      });
    }
  };

  // Update chart
  const updateChart = (newData: TransmissionData[]) => {
    const siftedData = newData.filter(d => d.sifted);
    if (siftedData.length === 0) return;

    const labels: number[] = [];
    const qberData: number[] = [];

    for (let i = 1; i <= siftedData.length; i++) {
      const subset = siftedData.slice(0, i);
      const errors = subset.filter(d => d.error).length;
      const qber = (errors / i) * 100;
      
      labels.push(i);
      qberData.push(qber);
    }

    setChartData({
      labels,
      datasets: [
        {
          ...chartData.datasets[0],
          data: qberData
        }
      ]
    });
    
    // Update chart directly if needed
    if (chartRef.current) {
      chartRef.current.data.labels = labels;
      chartRef.current.data.datasets[0].data = qberData;
      chartRef.current.update('none');
    }
  };

  // Update key display
  const updateKeyDisplay = () => {
    // This function is no longer needed as we're using React state directly
  };

  // Add table row
  const addTableRow = (data: TransmissionData) => {
    const tbody = document.getElementById('dataTableBody');
    if (!tbody) return;
    
    const row = document.createElement('tr');
    row.className = 'current';

    if (data.status === 'Lost') {
      row.classList.add('lost');
    } else if (data.error) {
      row.classList.add('error');
    } else if (data.sifted) {
      row.style.backgroundColor = '#e3f2fd';
    }

    row.innerHTML = `
      <td>${data.step}</td>
      <td><strong>${data.aliceBit}</strong></td>
      <td><strong>${data.aliceBasis}</strong></td>
      <td>${data.eveBasesData[0]}</td>
      <td>${data.eveBasesData[1]}</td>
      <td>${data.eveBasesData[2]}</td>
      <td>${data.eveBasesData[3]}</td>
      <td>${data.eveBasesData[4]}</td>
      <td><strong>${data.bobBasis}</strong></td>
      <td><strong>${data.bobBit}</strong></td>
      <td>${data.status}</td>
      <td>${data.error ? '<span style="color: #e74c3c; font-weight: bold;">ERROR</span>' : '✓'}</td>
    `;

    tbody.appendChild(row);
    
    setTimeout(() => row.classList.remove('current'), 2000);
    row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // Update polarizer
  const updatePolarizer = (id: string, basis: number) => {
    const polarizer = document.getElementById(id);
    if (!polarizer) return;
    
    polarizer.textContent = getBasisSymbol(basis);
    
    if (basis === 0) {
      polarizer.className = 'polarizer';
    } else {
      polarizer.className = 'polarizer diagonal';
    }
  };

  // Process a single qubit
  const processQubit = async (skipAnimation: boolean = false) => {
    const aliceBit = Math.random() < 0.5 ? 0 : 1;
    const aliceBasis = Math.random() < 0.5 ? 0 : 1;
    const bobBasis = Math.random() < 0.5 ? 0 : 1;
    
    // Update Alice info
    setAliceInfo({
      bit: aliceBit.toString(),
      basis: getBasisSymbol(aliceBasis),
      polarization: getPolarization(aliceBit, aliceBasis)
    });
    
    // Update Bob info
    setBobInfo(prev => ({
      ...prev,
      basis: getBasisSymbol(bobBasis)
    }));
    
    // Update polarizers
    setAlicePolarizer(getBasisSymbol(aliceBasis));
    setBobPolarizer(getBasisSymbol(bobBasis));

    const willBeLost = checkSignalLoss();

    if (!skipAnimation) {
      await animatePhoton(aliceBit, aliceBasis, willBeLost);
    }

    if (willBeLost) {
      const newData: TransmissionData = {
        step: currentQubit + 1,
        aliceBit,
        aliceBasis: getBasisSymbol(aliceBasis),
        eveBasesData: ['-', '-', '-', '-', '-'],
        bobBasis: getBasisSymbol(bobBasis),
        bobBit: '-',
        status: 'Lost',
        sifted: false,
        error: false
      };
      
      addTableRow(newData);
      setData(prev => [...prev, newData]);
      updateStats([...data, newData]);
      return;
    }

    let finalBit = aliceBit;
    let finalBasis = aliceBasis;
    let eveBasesData = ['-', '-', '-', '-', '-'];
    
    // Process Eve interception
    if (numEves > 0) {
      const result = processEveInterception(finalBit, finalBasis, numEves);
      finalBit = result.bit;
      finalBasis = result.basis;
      eveBasesData = result.eveBasesData;
      
      // Update intercept count
      setInterceptCount(prev => prev + 1);
    }

    const bobResult = measureQubit(finalBit, finalBasis, bobBasis);

    // Update Bob result
    setBobInfo(prev => ({
      ...prev,
      bit: finalBit.toString(),
      result: bobResult.toString()
    }));

    const basesMatch = aliceBasis === bobBasis;
    const isError = basesMatch && (aliceBit !== bobResult);

    const newData: TransmissionData = {
      step: currentQubit + 1,
      aliceBit,
      aliceBasis: getBasisSymbol(aliceBasis),
      eveBasesData: eveBasesData,
      bobBasis: getBasisSymbol(bobBasis),
      bobBit: bobResult.toString(),
      status: 'OK',
      sifted: basesMatch,
      error: isError
    };

    addTableRow(newData);
    setData(prev => [...prev, newData]);

    // Update keys if sifted
    if (basesMatch) {
      setAliceKey(prev => [...prev, aliceBit]);
      setBobKey(prev => [...prev, bobResult]);
    }

    updateStats([...data, newData]);
    updateChart([...data, newData]);
  };

  // Single step
  const singleStep = async () => {
    if (currentQubit >= numQubits) return;
    
    await processQubit();
    setCurrentQubit(prev => prev + 1);
  };

  // Start simulation
  const startSimulation = () => {
    setIsRunning(true);
    setIsBurst(false);
  };

  // Stop simulation
  const stopSimulation = () => {
    setIsRunning(false);
    setIsBurst(false);
  };

  // Burst mode
  const burstMode = async () => {
    setIsBurst(true);
    
    const remaining = numQubits - currentQubit;
    
    for (let i = 0; i < Math.min(remaining, 10); i++) {
      if (!isRunning) break;
      await processQubit(true);
      setCurrentQubit(prev => prev + 1);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    setIsBurst(false);
  };

  // Reset simulation
  const resetSimulation = () => {
    stopSimulation();
    setCurrentQubit(0);
    setData([]);
    setInterceptCount(0);
    setAliceKey([]);
    setBobKey([]);
    
    // Reset Alice and Bob info
    setAliceInfo({
      bit: '-',
      basis: '-',
      polarization: '-'
    });
    
    setBobInfo({
      basis: '-',
      bit: '-',
      result: '-'
    });
    
    // Reset polarizers
    setAlicePolarizer('+');
    setBobPolarizer('+');
    setEvePolarizers([
      {measure: '+', send: '+'},
      {measure: '+', send: '+'},
      {measure: '+', send: '+'},
      {measure: '+', send: '+'},
      {measure: '+', send: '+'}
    ]);
    
    // Clear table
    const dataTableBody = document.getElementById('dataTableBody');
    if (dataTableBody) dataTableBody.innerHTML = '';
    
    // Reset chart
    setChartData({
      labels: [],
      datasets: [
        {
          ...chartData.datasets[0],
          data: []
        }
      ]
    });
    
    // Reset security status
    setSecurityStatus({
      text: '🔒 Channel Secure',
      level: 'secure'
    });
  };

  // Run continuous simulation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && !isBurst) {
      if (currentQubit < numQubits) {
        interval = setInterval(async () => {
          await processQubit();
          setCurrentQubit(prev => {
            if (prev >= numQubits - 1) {
              stopSimulation();
              return numQubits;
            }
            return prev + 1;
          });
        }, 1200 - speed * 100);
      } else {
        stopSimulation();
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isBurst, currentQubit, numQubits, speed]);

  // Calculate key match percentage
  const getKeyMatchPercentage = () => {
    if (aliceKey.length === 0 || bobKey.length === 0) return 0;
    
    const matches = aliceKey.filter((bit, i) => bit === bobKey[i]).length;
    return aliceKey.length > 0 ? (matches / aliceKey.length) * 100 : 0;
  };

  // Get security status class
  const getSecurityStatusClass = () => {
    switch (securityStatus.level) {
      case 'secure':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'danger':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>QKD_Xplore: Quantum Key Distribution Simulator</h1>
        <p>Interactive simulation with basis visualization and eavesdropping detection</p>
      </div>

      <div className={styles['controls-panel']}>
        <div className={styles['controls-grid']}>
          <div className={styles['control-group']}>
            <label>Number of Qubits</label>
            <input 
              type="range" 
              id="qubitSlider" 
              min="1" 
              max="100" 
              value={numQubits}
              onChange={(e) => setNumQubits(parseInt(e.target.value))}
              disabled={isRunning || isBurst}
            />
            <div className={styles['control-value']}>{numQubits}</div>
          </div>
          
          <div className={styles['control-group']}>
            <label>Channel Noise (%)</label>
            <input 
              type="range" 
              id="noiseSlider" 
              min="0" 
              max="25" 
              value={noiseLevel}
              onChange={(e) => setNoiseLevel(parseInt(e.target.value))}
              disabled={isRunning || isBurst}
            />
            <div className={styles['control-value']}>{noiseLevel}%</div>
          </div>
          
          <div className={styles['control-group']}>
            <label>Distance (km)</label>
            <input 
              type="range" 
              id="distanceSlider" 
              min="1" 
              max="100" 
              value={distance}
              onChange={(e) => setDistance(parseInt(e.target.value))}
              disabled={isRunning || isBurst}
            />
            <div className={styles['control-value']}>{distance} km</div>
          </div>
          
          <div className={styles['control-group']}>
            <label>Attenuation (%)</label>
            <input 
              type="range" 
              id="attenuationSlider" 
              min="0" 
              max="30" 
              value={attenuation}
              onChange={(e) => setAttenuation(parseInt(e.target.value))}
              disabled={isRunning || isBurst}
            />
            <div className={styles['control-value']}>{attenuation}%</div>
          </div>
          
          <div className={styles['control-group']}>
            <label>Number of Eves</label>
            <input 
              type="range" 
              id="eveSlider" 
              min="0" 
              max="5" 
              value={numEves}
              onChange={(e) => setNumEves(parseInt(e.target.value))}
              disabled={isRunning || isBurst}
            />
            <div className={styles['control-value']}>{numEves}</div>
          </div>
          
          <div className={styles['control-group']}>
            <label>Animation Speed</label>
            <input 
              type="range" 
              id="speedSlider" 
              min="1" 
              max="10" 
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              disabled={isRunning || isBurst}
            />
            <div className={styles['control-value']}>{speed}</div>
          </div>
        </div>
        
        <div className={styles['button-row']}>
          <button 
            className={styles.btn}
            id="stepBtn"
            onClick={singleStep}
            disabled={isRunning || isBurst || currentQubit >= numQubits}
          >
            Single Step
          </button>
          {!isRunning ? (
            <button 
              className={styles.btn}
              id="runBtn"
              onClick={startSimulation}
              disabled={isRunning || isBurst || currentQubit >= numQubits}
            >
              Start
            </button>
          ) : (
            <button 
              className={`${styles.btn} ${styles.stop}`}
              id="stopBtn"
              onClick={stopSimulation}
            >
              Stop
            </button>
          )}
          <button 
            className={`${styles.btn} ${styles.burst}`}
            id="burstBtn"
            onClick={burstMode}
            disabled={isRunning || isBurst || currentQubit >= numQubits}
          >
            Burst Mode
          </button>
          <button 
            className={styles.btn}
            id="resetBtn"
            onClick={resetSimulation}
          >
            Reset
          </button>
        </div>
      </div>

      <div className={styles['simulation-container']}>
        <div className={styles['quantum-setup']}>
          <div className={`${styles.person} ${styles.alice}`}>
            <div className={styles.face}>👩‍🦰</div>
            <div className={styles['person-name']}>Alice</div>
            <div className={styles['person-info']}>
              <div className={styles['info-line']}>Bit: <strong>{aliceInfo.bit}</strong></div>
              <div className={styles['info-line']}>Basis: <strong>{aliceInfo.basis}</strong></div>
              <div className={styles['info-line']}>Sends: <strong>{aliceInfo.polarization}</strong></div>
            </div>
          </div>

          <div className={styles['channel-area']}>
            <div className={styles['quantum-beam']}>
              <div 
                className={`${styles.photon} ${photonVisible ? styles.visible : ''} ${photonVibrating ? styles.vibrating : ''} ${photonFalling ? styles.falling : ''}`}
                id="photon"
                style={{ left: `${photonPosition}%` }}
              >
                →
              </div>
              <div 
                className={`${styles['status-info']} ${statusInfoVisible ? styles.show : ''}`}
                id="statusInfo"
              >
                {statusInfo}
              </div>
            </div>

            <div className={styles['alice-polarizer']}>
              <div className={`${styles.polarizer} ${alicePolarizer === '×' ? styles.diagonal : ''}`} id="alicePolarizer">{alicePolarizer}</div>
            </div>

            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className={styles['eve-polarizer-pair']}
                id={`evePair${i}`}
                style={{ display: i < numEves ? 'block' : 'none', left: `${20 + i * 15}%` }}
              >
                <div 
                  className={`${styles['eve-icon']} ${activeEve === i ? styles.active : ''}`}
                  id={`eveIcon${i}`}
                >
                  E{i+1}
                </div>
                <div className={styles['polarizer-container']}>
                  <div className={`${styles['eve-measure-pol']} ${evePolarizers[i].measure === '×' ? styles.diagonal : ''}`} id={`eveMeasure${i}`}>{evePolarizers[i].measure}</div>
                  <div className={`${styles['eve-send-pol']} ${evePolarizers[i].send === '×' ? styles.diagonal : ''}`} id={`eveSend${i}`}>{evePolarizers[i].send}</div>
                </div>
              </div>
            ))}

            <div className={styles['bob-polarizer']}>
              <div className={`${styles.polarizer} ${bobPolarizer === '×' ? styles.diagonal : ''}`} id="bobPolarizer">{bobPolarizer}</div>
            </div>
          </div>

          <div className={`${styles.person} ${styles.bob}`}>
            <div className={styles.face}>👨‍💼</div>
            <div className={styles['person-name']}>Bob</div>
            <div className={styles['person-info']}>
              <div className={styles['info-line']}>Basis: <strong>{bobInfo.basis}</strong></div>
              <div className={styles['info-line']}>Measures: <strong>{bobInfo.bit}</strong></div>
              <div className={styles['info-line']}>Gets: <strong>{bobInfo.result}</strong></div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.dashboard}>
        <div className={styles['stats-panel']}>
          <div className={styles['panel-title']}>Statistics & Security</div>
          <div className={styles['stats-grid']}>
            <div className={styles['stat-card']}>
              <div className={styles['stat-label']}>Sent</div>
              <div className={styles['stat-number']}>{data.length}</div>
            </div>
            <div className={styles['stat-card']}>
              <div className={styles['stat-label']}>Received</div>
              <div className={styles['stat-number']}>{data.filter(d => d.status !== 'Lost').length}</div>
            </div>
            <div className={styles['stat-card']}>
              <div className={styles['stat-label']}>Sifted</div>
              <div className={styles['stat-number']}>{data.filter(d => d.sifted).length}</div>
            </div>
            <div className={styles['stat-card']}>
              <div className={styles['stat-label']}>Errors</div>
              <div className={styles['stat-number']}>{data.filter(d => d.sifted && d.error).length}</div>
            </div>
            <div className={styles['stat-card']}>
              <div className={styles['stat-label']}>QBER</div>
              <div className={styles['stat-number']}>
                {data.filter(d => d.sifted).length > 0 
                  ? ((data.filter(d => d.sifted && d.error).length / data.filter(d => d.sifted).length) * 100).toFixed(1) + '%' 
                  : '0.0%'}
              </div>
            </div>
            <div className={styles['stat-card']}>
              <div className={styles['stat-label']}>Intercepts</div>
              <div className={styles['stat-number']}>{interceptCount}</div>
            </div>
          </div>
          <div className={`${styles['security-status']} ${styles[securityStatus.level]}`}>
            {securityStatus.text}
          </div>
        </div>

        <div className={styles['chart-panel']}>
          <div className={styles['panel-title']}>QBER Evolution</div>
          <div className="h-64">
            <Line 
              ref={chartRef}
              data={chartData} 
              options={chartOptions} 
            />
          </div>
        </div>
      </div>

      <div className={styles['table-section']}>
        <div className={styles['table-header']}>Sifted Key Bits</div>
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <strong>Alice's Key:</strong>
            <div 
              style={{ fontFamily: 'monospace', background: '#f8f9fa', padding: '10px', borderRadius: '5px', marginTop: '5px', wordBreak: 'break-all', minHeight: '30px' }}
            >
              {aliceKey.length > 0 ? aliceKey.join('') : '-'}
            </div>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>Bob's Key:</strong>
            <div 
              style={{ fontFamily: 'monospace', background: '#f8f9fa', padding: '10px', borderRadius: '5px', marginTop: '5px', wordBreak: 'break-all', minHeight: '30px' }}
            >
              {bobKey.length > 0 ? bobKey.join('') : '-'}
            </div>
          </div>
          <div>
            <strong>Key Match:</strong>
            <div 
              style={{ 
                fontWeight: 'bold', 
                marginTop: '5px', 
                padding: '8px', 
                borderRadius: '5px',
                background: aliceKey.length > 0 && bobKey.length > 0 ? 
                  (aliceKey.filter((bit, i) => bit === bobKey[i]).length / aliceKey.length) * 100 >= 95 ? '#d5f4e6' :
                  (aliceKey.filter((bit, i) => bit === bobKey[i]).length / aliceKey.length) * 100 >= 85 ? '#fef9e7' : '#fadbd8' : '',
                color: aliceKey.length > 0 && bobKey.length > 0 ? 
                  (aliceKey.filter((bit, i) => bit === bobKey[i]).length / aliceKey.length) * 100 >= 95 ? '#27ae60' :
                  (aliceKey.filter((bit, i) => bit === bobKey[i]).length / aliceKey.length) * 100 >= 85 ? '#f39c12' : '#e74c3c' : '',
                border: aliceKey.length > 0 && bobKey.length > 0 ? 
                  (aliceKey.filter((bit, i) => bit === bobKey[i]).length / aliceKey.length) * 100 >= 95 ? '1px solid #27ae60' :
                  (aliceKey.filter((bit, i) => bit === bobKey[i]).length / aliceKey.length) * 100 >= 85 ? '1px solid #f39c12' : '1px solid #e74c3c' : ''
              }}
            >
              {aliceKey.length > 0 && bobKey.length > 0 ? 
                `${aliceKey.filter((bit, i) => bit === bobKey[i]).length}/${aliceKey.length} bits match (${(((aliceKey.filter((bit, i) => bit === bobKey[i]).length / aliceKey.length) * 100).toFixed(1))}%)` : 
                '-'}
            </div>
          </div>
        </div>
      </div>

      <div className={styles['table-section']}>
        <div className={styles['table-header']}>Transmission Log</div>
        <div className={styles['table-container']}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>A-Bit</th>
                <th>A-Base</th>
                <th>E1-Base</th>
                <th>E2-Base</th>
                <th>E3-Base</th>
                <th>E4-Base</th>
                <th>E5-Base</th>
                <th>B-Base</th>
                <th>B-Bit</th>
                <th>Status</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody id="dataTableBody">
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};