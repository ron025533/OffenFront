import { useEffect, useState } from "react";
import Question from "./Question";
import { useRoomContext } from "../../hooks/RoomContext";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../../constant";
import { TQuestionFront } from "../../types";
import socketService from "../../services/chatService";

const QuestionList = () => {


    const {User, Questions, setQuestions, room} = useRoomContext()


    return <div>
        {
            Questions.map((question, index)  => (
                <Question question={question.question} response={question.response} student={User} key={index}/>
            ))
        }
    </div>
}
 
export default QuestionList;