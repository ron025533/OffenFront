import React from "react";
import "./texts.css"

interface BigTextProps {
  text: string;
  number: string;
}

const BigText: React.FC<BigTextProps> = ({ number, text }) => {
  return <p className="course-big-text">{number} - {text}:</p>;
};

export default BigText;