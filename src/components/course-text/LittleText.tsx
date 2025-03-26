import React from "react";
import "./texts.css"

interface LittleTextProps {
  section: string;
  text: string;
}

const LittleText: React.FC<LittleTextProps> = ({ section, text }) => {
  return <h1 className="course-little-text">{section} - {text}</h1>;
};

export default LittleText;