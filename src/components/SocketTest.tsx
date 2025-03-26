import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../constant";

const socket = io(SOCKET_URL);

export default function ChatClient() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [noteId, setNoteId] = useState("");
  const [question, setQuestion] = useState("");
  const [questions, setQuestions] = useState([]);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const handleRoomCreated = ({ room, noteId }) => {
      console.log(`Room created: ${room}, Note ID: ${noteId}`);
      setJoined(true);
      setNoteId(noteId);
    };

    const handleJoinedRoom = ({ room, noteId }) => {
      console.log(`Joined room: ${room}, Note ID: ${noteId}`);
      setJoined(true);
      setNoteId(noteId);
    };

    const handleNewQuestion = (newQuestion) => {
      setQuestions((prev) => [...prev, newQuestion]);
    };
    const handleQuestionAnswer = (updatedQuestion) => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.question === updatedQuestion.question ? updatedQuestion : q
        )
      );
    };

    socket.on("roomCreated", handleRoomCreated);
    socket.on("joinedRoom", handleJoinedRoom);
    socket.on("newQuestion", handleNewQuestion);
    socket.on("questionAnswered", handleQuestionAnswer);

    return () => {
      socket.off("roomCreated", handleRoomCreated);
      socket.off("joinedRoom", handleJoinedRoom);
      socket.off("newQuestion", handleNewQuestion);
      socket.off("questionAnswered", handleQuestionAnswer);
    };
  }, []);

  const createRoom = () => {
    socket.emit("createRoom", { teacher: username, room, noteId: "12345" });
  };

  const joinRoom = () => {
    socket.emit("joinRoom", { username, room });
  };

  const askQuestion = () => {
    socket.emit("askQuestion", { room, username, question });
    setQuestion("");
  };

  const answerQuestion = (q) => {
    const response = prompt(`Answer for: ${q.question}`);
    if (response) {
      socket.emit("answerQuestion", {
        room,
        teacher: username,
        question: q.question,
        response,
      });
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "400px",
        margin: "auto",
        border: "1px solid #ccc",
        borderRadius: "5px",
        boxShadow: "2px 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      {!joined ? (
        <div>
          <input
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
            placeholder="Room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <button
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginBottom: "10px",
            }}
            onClick={createRoom}
          >
            Create Room
          </button>
          <button
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={joinRoom}
          >
            Join Room
          </button>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: "14px", color: "#555" }}>Note ID: {noteId}</p>
          <div
            style={{
              border: "1px solid #ddd",
              padding: "10px",
              height: "200px",
              overflowY: "auto",
              marginBottom: "10px",
            }}
          >
            {questions.map((q, index) => (
              <p key={index}>
                <strong>Q:</strong> {q.question} <br />
                <strong>A:</strong> {q.response || "Awaiting response"}
                {username && q.response === null && (
                  <button
                    onClick={() => answerQuestion(q)}
                    style={{
                      marginLeft: "10px",
                      padding: "5px",
                      cursor: "pointer",
                      border: "none",
                      backgroundColor: "#ff9800",
                      color: "white",
                      borderRadius: "4px",
                    }}
                  >
                    Answer
                  </button>
                )}
              </p>
            ))}
          </div>
          <input
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
            placeholder="Ask a question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#6f42c1",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={askQuestion}
          >
            Ask Question
          </button>
        </div>
      )}
    </div>
  );
}
