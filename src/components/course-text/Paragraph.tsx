import React from "react";
import "./texts.css"

interface ParagraphProps {
  text: string;
}

const Paragraph: React.FC<ParagraphProps> = ({ text }) => {
  return <p className="course-paragraph">{text}</p>;
};

export default Paragraph;