import React from 'react';

const PythonCodeEditor: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Python Code Editor</h2>
      <p className="mb-4">Try the experiment using Python on Google Colab.</p>
      <a 
        href="https://colab.research.google.com/drive/1inYTBgThPE77LmIE37P8S_n5ACB8FCxt?usp=sharing" 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Open in Google Colab:
      </a>
    </div>
  );
};

export default PythonCodeEditor; 