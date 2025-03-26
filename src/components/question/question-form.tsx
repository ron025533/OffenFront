import { useEffect, useState } from "react";
import socketService from "../../services/chatService";
import { postQuestion } from "../../services/api";
import { useRoomContext } from "../../hooks/RoomContext";
import "./question.css"

type props = {
  noteId: string;
};

const QuestionInput = ({ noteId }: props) => {
  const [Question, setQuestion] = useState("");

  const { room, User, setQuestions, Questions, Role } = useRoomContext();

  useEffect(() => {
    const handleNewMessage = (newMessage) => {
        console.log('new message')
        setQuestions((prev) => [...prev, newMessage])
    }

    socketService.onNewQuestion(handleNewMessage)


    return () => {
      socketService.removeNewQuestionListener();
    };
  }, []);

  const handleAskQuestion = async () => {
    socketService.askQuestion(room, User, Question);
    setQuestion("");
  };

  return (
    <>
      {Role == "Teacher" ? <>Pas de questions</> : <>
        <div className="ask-container">
          <input
            type="text"
            placeholder="Poser une question"
            value={Question}
            onChange={(e) => {
              setQuestion(e.target.value);
            }}
          />
          <button className="send-question-button" onClick={handleAskQuestion}>Poser</button>
        </div></>}
    </>
  );
};

export default QuestionInput;
