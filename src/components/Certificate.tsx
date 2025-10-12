import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import './Certificate.css';

interface CertificateProps {
  quizScore?: number;
}

export const Certificate = ({ quizScore }: CertificateProps) => {
  const [studentName, setStudentName] = useState('');
  const [isCertificateVisible, setIsCertificateVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    if (typeof quizScore === 'number' && quizScore > 40) {
      setIsCertificateVisible(true);
      const today = new Date();
      setCurrentDate(today.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));
    } else {
      setIsCertificateVisible(false);
    }
  }, [quizScore]);

  const generatePDF = async () => {
    if (!studentName.trim()) {
      alert('Please enter a student name before downloading the certificate.');
      return;
    }

    try {
      const certificateElement = document.getElementById('certificate-template');
      if (!certificateElement) {
        alert('Certificate template not found.');
        return;
      }

      const canvas = await html2canvas(certificateElement, { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 297;
      const imgHeight = 210;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`QKD_Xplore_Certificate_${studentName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the certificate. Please try again.');
    }
  };

  if (!isCertificateVisible) {
    return (
      <div className="certificate-page">
        <div className="certificate-message">
          <h2>Certificate Not Available</h2>
          <p>Complete the post-quiz with a score above 40% to unlock your certificate.</p>
          <p>Your current score: {quizScore ? `${quizScore}%` : 'Not attempted'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="certificate-page">
      <div className="certificate-controls">
        <h2>Certificate of Completion</h2>
        <p className="score-display">Your quiz score: {quizScore}%</p>
        
        <div className="input-group">
          <label htmlFor="studentName">Enter Your Name:</label>
          <input
            type="text"
            id="studentName"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Enter your full name"
            className="name-input"
          />
        </div>
        
        <button 
          onClick={generatePDF} 
          disabled={!studentName.trim()}
          className="download-btn"
        >
          Download Certificate (PDF)
        </button>
      </div>

      {/* Certificate Template for PDF */}
      <div id="certificate-template" className="certificate-container">
        <div className="certificate-logo">
          QKD_Xplore
        </div>

        <div className="certificate-marquee">
          Certificate of Completion
        </div>

        <div className="certificate-assignment">
          This certificate is presented to
        </div>

        <div className="certificate-person">
          {studentName || '[Your Name]'}
        </div>

        <div className="certificate-reason">
          For successfully completing the<br/>
          <strong>Quantum Cryptography with BB84 Protocol</strong><br/>
          course with a score of {quizScore}%
        </div>

        <div className="certificate-date">
          {currentDate}
        </div>
      </div>

      {/* Visual Preview */}
      <div className="certificate-preview">
        <h3>Certificate Preview</h3>
        <div className="preview-container">
          <div className="preview-logo">
            QKD_Xplore
          </div>

          <div className="preview-marquee">
            Certificate of Completion
          </div>

          <div className="preview-assignment">
            This certificate is presented to
          </div>

          <div className="preview-person">
            {studentName || '[Your Name]'}
          </div>

          <div className="preview-reason">
            For successfully completing the<br/>
            <strong>Quantum Cryptography with BB84 Protocol</strong><br/>
            course with a score of {quizScore}%
          </div>

          <div className="preview-date">
            {currentDate}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
