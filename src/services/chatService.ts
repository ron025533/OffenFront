import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../constant";
import { TQuestionFront } from "../types";

class SocketService {
    private socket: Socket;

    constructor() {
        this.socket = io(SOCKET_URL);
    }

    onRoomCreated(callback: (data: { room: string; noteId: string }) => void) {
        this.socket.on("roomCreated", callback);
    }

    onJoinedRoom(callback: (data: { room: string; noteId: string }) => void) {
        this.socket.on("joinedRoom", callback);
    }

    onNewQuestion(callback: (question: { noteId: string; question: string; response: string }) => void): void {
        if (this.socket) {
          this.socket.on("newQuestion", callback);
        }
      }

    onQuestionAnswered(callback: (updatedQuestion: { question: string; response: string }) => void) {
        this.socket.on("questionAnswered", callback);
    }

    // Updated to use the correct event name: 'userList' instead of 'getUsersInRoom'
    onUserList(callback: (users: { users: string[] }) => void) {
        this.socket.on("userList", callback);
    }

    onBroadcastSpeech(callback: (data: { room: string, text: string }) => void) {
        this.socket.on("broadcastSpeech", callback);
    }

    createRoom(username: string, room: string, noteId: string) {
        this.socket.emit("createRoom", { teacher: username, room, noteId: noteId });
    }

    joinRoom(username: string, room: string): Promise<string> {
        return new Promise((resolve) => {
            this.socket.emit("joinRoom", { username, room });

            const handleJoinedRoom = (data: { room: string; noteId: string }) => {
                resolve(data.noteId);
                this.socket.off("joinedRoom", handleJoinedRoom);
            };

            this.socket.on("joinedRoom", handleJoinedRoom);
        });
    }

    

    askQuestion(room: string, username: string, question: string) {
        this.socket.emit("askQuestion", { room, username, question });
    }

    answerQuestion(room: string, teacher: string, question: string, response: string) {
        this.socket.emit("answerQuestion", { room, teacher, question, response });
    }

    broadcastSpeech(room: string, text: string) {
        this.socket.emit("broadcastSpeech", { roomName: room, text });
    }

    onReceiveSpeech(callback: (data: { text: string }) => void) {
        this.socket.on("receiveSpeech", callback);
    }

    receiveSpeech(text: string) {
        this.socket.emit("receiveSpeech", { text: text })
    }

    getUsersList(room: string): Promise<string[]> {
        return new Promise((resolve) => {
            this.socket.emit('getUsersInRoom', room);

            const handleUserList = (data: { users: string[] }) => {
                console.log('user list', data.users);
                resolve(data.users);
                // Using the correct event name for cleanup too
                this.socket.off("userList", handleUserList);
            };

            // Updated to use the correct event name
            this.socket.on('userList', handleUserList)
        })
    }

    removeRoomCreatedListener() {
        this.socket.off("roomCreated");
    }
    
    removeJoinedRoomListener() {
        this.socket.off("joinedRoom");
    }
    
    removeNewQuestionListener() {
        this.socket.off("newQuestion");
    }
    
    removeQuestionAnsweredListener() {
        this.socket.off("questionAnswered");
    }
    
    removeUserListListener() {
        this.socket.off("userList");
    }
    
    removeBroadcastSpeechListener() {
        this.socket.off("broadcastSpeech");
    }
    
    removeReceiveSpeechListener() {
        this.socket.off("receiveSpeech");
    }


    removeListeners() {
        this.socket.off("roomCreated");
        this.socket.off("joinedRoom");
        this.socket.off("newQuestion");
        this.socket.off("questionAnswered");
        this.socket.off("userList"); // Updated event name here too
        this.socket.off("broadcastSpeech");
        this.socket.off("receiveSpeech");
    }

    removeSpecifiListener(listener: string) {
        this.socket.off(listener);
    }
}

export const socketService = new SocketService();
export default socketService;