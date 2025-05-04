import React from 'react';

interface CodeMirrorProps {
  value: string;
  onChange: (value: string) => void;
  isDarkMode?: boolean;
  placeholder?: string;
  height?: string;
}

const CodeMirror: React.FC<CodeMirrorProps> = ({
  value,
  onChange,
  isDarkMode = false,
  placeholder = 'Write your SQL query here...',
  height = '200px',
}) => {
  // Use a simple textarea instead of CodeMirror to ensure basic functionality works
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ 
        height,
        width: '100%',
        padding: '8px',
        fontFamily: 'monospace',
        fontSize: '14px',
        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
        color: isDarkMode ? '#e2e8f0' : '#1e293b',
        border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
        borderRadius: '6px',
        resize: 'vertical'
      }}
      className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      spellCheck="false"
    />
  );
};

export default CodeMirror;
