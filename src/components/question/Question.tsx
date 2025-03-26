import React, { useEffect, useState } from "react";
import "./question.css"
import { LuMic } from "react-icons/lu";
import { LuForward } from "react-icons/lu";
import { LuX } from "react-icons/lu";
import socketService from "../../services/chatService";
import { useRoomContext } from "../../hooks/RoomContext";

interface QuestionProps {
    student: string;
    question: string;
    response: string;
}

const Question: React.FC<QuestionProps> = ({ student, question, response }) => {

    const {setQuestions} = useRoomContext()
    
    const [Response, setResponse] = useState(response);
    const [isAnswering, setIsAnswering] = useState(false)
    const questionColors = ["#33FF57", "#33FF57", "#3357FF", "#FF33A1", "#FFD700"];

    const getRandomColor = () => {
        return questionColors[Math.floor(Math.random() * questionColors.length)];
    };

    const randomBgColor = getRandomColor();


    const handleAnswerQuestion = () => {

    }

    useEffect(()=>{
        socketService.onQuestionAnswered(({question, response})=>{
            setQuestions((prev) =>
                prev.map((q) =>
                  q.question === question ? {question, response} : q
                )
              );
        })

        return () => {
            socketService.removeListeners()
        }
    },[])

    return <div className="question-container">
        <div className="student-name">Fenohasina<div className="student-circle" style={{ backgroundColor: randomBgColor }}></div></div>
        <p className="question-asked">{question}</p>
        {isAnswering ? (
            <div className="answering">
                <div className="answer-block">
                    <textarea name="answer" placeholder="Réponse" className="answer-textarea" onChange={(e)=> setResponse(e.target.value)}></textarea>
                </div>
                <div className="answer-bottom">
                    <div className="answer-left">Vous répondez</div>
                    <div className="answer-action">
                        <div className="cancel-answer" onClick={() => setIsAnswering(false)}>
                            <LuX className="icon" />
                        </div>
                        <div className="submit-answer" onClick={handleAnswerQuestion}>
                            <LuForward className="icon" />
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <div onClick={() => setIsAnswering(true)} className="answer-question">
                <LuMic size={18} className="answering-icon" />
                Répondre
            </div>
        )}
    </div>;
};

export default Question;