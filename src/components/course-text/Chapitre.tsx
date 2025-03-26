import React from 'react';

interface ChapitreProps {
  number: number;
  text: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
}

const Chapitre: React.FC<ChapitreProps> = ({
  number,
  text,
  isBold = false,
  isItalic = false,
  isUnderline = false
}) => {
  const styles = {
    fontWeight: isBold ? 'bold' : 'normal',
    fontStyle: isItalic ? 'italic' : 'normal',
    textDecoration: isUnderline ? 'underline' : 'none',
    fontSize: '1.5rem',
    margin: '1rem 0',
    color: '#2a4365',
  };

  return (
    <div className="chapitre-component" style={styles}>
      <span className="chapitre-number">Chapitre {number} - </span>
      <span className="chapitre-text">{text}</span>
    </div>
  );
};

export default Chapitre;