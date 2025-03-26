import React, { useEffect, useState } from "react";
import "./modal-form.css";
import { TNote } from "../../types";
import { useNavigate } from "react-router-dom";
import socketService from "../../services/chatService";
import { useRoomContext } from "../../hooks/RoomContext";
import { postNote } from "../../services/api";
import { getDate } from "../../services/date";

// Définition des types des props pour ModalForm
interface ModalFormProps {
  isOpen: boolean;
  closeModal: () => void;
  roomName: string;
  role: 'Teacher' | 'Student';
}

const ModalForm: React.FC<ModalFormProps> = ({
  isOpen,
  closeModal,
  roomName,
  role,
}) => {

  const [NoteInitial, setNoteInitial] = useState<TNote>({
    nomProf: "",
    matiere: "",
    titre: "",
    date: getDate(),
    audioUrl: "",
    noteText: "",
  });

  const [userName, setuserName] = useState('');

  const {setRoom, setNoteId, setUser, setRole, setTitre} = useRoomContext()
  const to = useNavigate()

  useEffect(() => {
    socketService.onRoomCreated(({ room, noteId }) => {
      console.log(`Room created: ${room}, Note ID: ${noteId}`);
    });

    socketService.onJoinedRoom(({ room, noteId }) => {
      console.log(`Joined room: ${room}, Note ID: ${noteId}`);
    });


    return () => {
      socketService.removeListeners();
    };
  }, [roomName]);


  const createRoom =async (note: TNote) => {
    const roomNoteInfo =await postNote(note)

    if (roomNoteInfo.status === 'success'){
        console.log(`id:${roomNoteInfo.data._id}`)

        setRoom(roomName)
        setNoteId(roomNoteInfo.data._id)
        setUser(NoteInitial.nomProf)
        setRole(role)
        setTitre(note.titre)

        socketService.createRoom(note.nomProf,roomName,roomNoteInfo.data._id)
        to(`/course/${roomNoteInfo.data._id}`)
    } else {
        console.log('Room not created')
    }
  }

  const handleCreateRoom = () => {
    createRoom(NoteInitial)
    setRoom(roomName)
    closeModal();
  };

  const handleJoinRoom =async () => {
    const noteId =await socketService.joinRoom(userName, roomName)

    setRoom(roomName)
    setNoteId(noteId)
    setUser(userName)
    setRole(role)

    to(`/course/${noteId}`)
    closeModal();
  };

  if (!isOpen) return null; // Retourner null si la modal n'est pas ouverte

  return (
    <div className="modal-form">
      <div className="modal-overlay" onClick={closeModal}></div>{" "}
      {/* Overlay pour fermer la modal */}
      {role == "Teacher" ? (
        <div className="modal-content">
          <div className="room-name"># {roomName}</div>
          <div className="input-container">
            <div className="nom">Votre nom</div>
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              className="modal-input"
              onChange={(e) =>
                setNoteInitial((prev) => ({
                  ...prev,
                  nomProf: e.target.value,
                }))
              }
            />
          </div>
          <div className="input-container">
            <div className="nom">La Matière</div>
            <input
              type="text"
              placeholder="Nom de la matière"
              className="modal-input"
              onChange={(e)=>{
                setNoteInitial((prev)=>(
                  {
                    ...prev,
                    matiere:e.target.value
                  }
                ))
              }}
            />
          </div>
          <div className="input-container">
            <div className="nom">Titre du cours</div>
            <input
              type="text"
              placeholder="Titre du cours"
              className="modal-input"
              onChange={(e)=>{
                setNoteInitial((prev)=>(
                  {
                    ...prev,
                    titre:e.target.value
                  }
                ))
              }}
            />
          </div>
          <div className="modal-footer">
            <button
              onClick={handleCreateRoom}
              // Entrez dans le cours en tant que prof
              className="begin-button"
            >
              Débuter le cours
            </button>
          </div>
        </div>
      ) : (
        // Etudiant
        <div className="modal-content">
          <div className="room-name"># {roomName}</div>
          <div className="input-container">
            <div className="nom">Votre nom</div>
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              className="modal-input"
              onChange={(e)=>{
                setuserName(e.target.value)
              }}
            />
          </div>
          <div className="modal-footer">
            <button
              onClick={handleJoinRoom}
              // Entrez dans le cours en tant qu'étudiant
              className="begin-button"
            >
              Entrer dans le cours
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalForm;
