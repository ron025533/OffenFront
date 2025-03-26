import React from "react";

export type ApiResponse<T> =
    {
        status: 'success'; data: T;
    } |
    {
        status: 'error'; message: string
    }

// export type error = {
//     status: 
// }

export type TNote = {
    matiere: string;
    titre: string;
    noteText: string;
    audioUrl: string;
    date: string;
    nomProf: string;
}

export type TNoteResponse = TNote & {
    _id: string;
}

export type TNoteUpdate = TNote

export type TPrompt = {
    message: string;
}

export type TAiResponse = {
    message: string;
}

export type TDateFormat =
    "YYYY-MM-DD"
    | "DD/MM/YYYY"
    | "MM-DD-YYYY"
    | "YYYY/MM/DD"
    | "DD-MM-YYYY"
    | "MM/DD/YYYY";

export type TQuestion = {
    noteId: string;
    question: string;
}

export type TQuestionResponse = TQuestion & {
    _id: string;
    reponse: string;
}

export type TQuestionUpdate = TQuestion & {
    _id: string;
    reponse: string;
}

// src/types.ts
export enum UserRole {
    TEACHER = 'teacher',
    STUDENT = 'student',
}

export interface Room {
    name: string;
    noteId: string;
    createdBy: string;
}

export interface User {
    username: string;
    role: UserRole;
}

export interface Student {
    username: string;
}

export interface RoomListItem {
    name: string;
    createdBy: string;
}

export interface IRoomContext {
    room: string;
    setRoom: (val: string) => void;
    NoteId: string;
    setNoteId: (val: string) => void;
    User: string;
    setUser: (val: string) => void;
    Questions: TQuestionFront[];
    setQuestions: (val: React.SetStateAction<TQuestionFront[]>) => void;
    Role: "Teacher" | "Student";
    setRole: (val: "Teacher" | "Student")=> void;
    Titre: string;
    setTitre: (val: string) => void
}

export type TQuestionFront = {
    question: string;
    response: string;
}