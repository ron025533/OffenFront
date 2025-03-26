import { useEffect, useState } from "react";
import './Lobby.css';
import { LuGraduationCap, LuPresentation, LuBookText } from "react-icons/lu";
import ModalForm from "../components/form-name/modalForm";
import { ApiResponse, TNoteResponse } from "../types";
import { getNote } from "../services/api";
import { useNavigate } from "react-router-dom";
import Offen from "../assets/Offen.svg"

export const Lobby = () => {
    const [role, setRole] = useState<string>("Teacher");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [noteList, setNoteList] = useState<TNoteResponse[]>([]); // Initialized as empty array
    const navigate = useNavigate();

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRoomName(e.target.value);
    };

    const isInputEmpty = roomName.trim() === "";

    // Fetch notes on component mount
    useEffect(() => {
        const fetchNotes = async () => {
            const response = await getNote();
            if (response.status === "success") {
                setNoteList(response.data); // Store fetched notes
            } else {
                console.error(response.message); // Handle error
            }
        };

        fetchNotes();
    }, []); // Empty dependency array ensures this runs once when component mounts

    const toPlayCourse = (noteId: string) => {
        navigate(`/playCourse/${noteId}`);
    }

    const [sectionHere, setSectionHere] = useState("lobby")

    const handleDisplayInterface = () => {
        if (sectionHere == "lobby") {
            setSectionHere("courses")
        } else {
            setSectionHere("lobby")
        }
    }

    return (
        <div className="lobby-container">
            <div className={`lobby-left ${sectionHere == "courses" && "lobby-left-hided"}`}>

                <img src={Offen} alt="Offen" width="100px" style={{ marginBottom: "8%" }} />

                <div className="room-title">Plus de cohésion avec notre application</div>
                <div className="room-description">Créer ou rejoignez un salon.</div>

                {role === "Teacher" ? (
                    <div className="create-join-room">
                        <p>Créer un Salon</p>
                        <div className="room-action">
                            <div className="room-input">
                                <LuBookText className="room-icon" size={24} />
                                <input
                                    type="text"
                                    name="roomname"
                                    placeholder="Nom du salon"
                                    className="room-text"
                                    value={roomName}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div
                                className={`enter-room ${isInputEmpty ? "enter-room-disabled" : ""}`}
                                onClick={isInputEmpty ? undefined : openModal}
                            >
                                Créer
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="create-join-room">
                        <p>Rejoindre un Salon</p>
                        <div className="room-action">
                            <div className="room-input">
                                <LuBookText className="room-icon" size={24} />
                                <input
                                    type="text"
                                    name="roomname"
                                    placeholder="Nom du salon"
                                    className="room-text"
                                    value={roomName}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div
                                className={`enter-room ${isInputEmpty ? "enter-room-disabled" : ""}`}
                                onClick={isInputEmpty ? undefined : openModal}
                            >
                                Rejoindre
                            </div>
                        </div>
                    </div>
                )}

                <div className="toogle-teacher-student">
                    <div
                        className={`toogle-icon ${role === "Teacher" && "toogle-icon-active"}`}
                        onClick={() => setRole("Teacher")}
                    >
                        <LuPresentation size={24} className="icon-role" />
                        Prof
                    </div>
                    <div
                        className={`toogle-icon ${role === "Student" && "toogle-icon-active"}`}
                        onClick={() => setRole("Student")}
                    >
                        <LuGraduationCap size={24} className="icon-role" />
                        Etudiant
                    </div>
                    <div className="toogle-background"></div>
                </div>
                <div className="course-liste-button" onClick={handleDisplayInterface}>Liste des cours</div>
            </div>

            <div className={`lobby-right ${sectionHere == "courses" && "lobby-right-displayed"}`}>
                <div className="list-title">Cours Enregistrés</div>
                {noteList.length > 0 ? (
                    [...noteList].reverse().map((note) => (
                        <div className="course-list" key={note._id}>
                            <div className="course-block" onClick={() => toPlayCourse(note._id)}>
                                <div className="course-top">
                                    <div className="course-title">{note.titre}</div>
                                    #
                                </div>
                                <div className="matiere">{note.matiere}</div>
                                <div className="course-bottom">
                                    <div className="teacher">{note.nomProf}</div>
                                    <div className="teacher">{note.date}</div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Aucun cours enregistré.</p>
                )}
            <div className="course-liste-button return-lobby" onClick={handleDisplayInterface}>Retour dans le Salon</div>

            </div>

            <ModalForm isOpen={isModalOpen} closeModal={closeModal} roomName={roomName} role={role} />
        </div>
    );
};
