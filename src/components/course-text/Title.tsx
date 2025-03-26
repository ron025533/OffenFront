import React from "react";
import "./texts.css"

interface TitleProps {
  text: string;
}

const Title: React.FC<TitleProps> = ({ text }) => {
  return <h1 className="course-title">{text}</h1>;
};

export default Title;