import { createContext, useContext, useState } from "react";
import { IRoomContext, TQuestionFront } from "../types";

export const RoomContext = createContext<IRoomContext | null>(null);

type props = {
  children: React.ReactNode;
};

export const RoomProvider = ({ children }: props) => {
  const [room, setRoom] = useState("");
  const [NoteId, setNoteId] = useState("");
  const [User, setUser] = useState<string>('');
  const [Questions, setQuestions] = useState<TQuestionFront[]>([]);
  const [Role, setRole] = useState<"Teacher" | "Student">('Student');
  const [Titre, setTitre] = useState('');

  return (
    <>
      <RoomContext.Provider
        value={{
          NoteId: NoteId,
          setNoteId: setNoteId,
          room: room,
          setRoom: setRoom,
          User: User,
          setUser: setUser,
          Questions: Questions,
          setQuestions: setQuestions,
          Role: Role,
          setRole: setRole,
          Titre: Titre,
          setTitre: setTitre
        }}
      >
        {children}
      </RoomContext.Provider>
    </>
  );
};

export const useRoomContext = (): IRoomContext => {
    const context = useContext(RoomContext)

    if(!context) {
        throw new Error("Doit etre a l'interieur de RoomProvider")
    }

    return context

}
