import axios from "axios";
import { ApiResponse, TNote, TNoteResponse, TPrompt, TQuestion, TQuestionResponse, TQuestionUpdate,} from "../types";
import { BACKEND_API_URL } from "../constant";

const example: TNote = {
    matiere: 'Anglais',
    titre: 'Past tense',
    audioUrl: 'anglais.mp3',
    noteText: 'longTextHere',
    nomProf: 'BERTIN Andry',
    date: new Date().toISOString().split('T')[0]
}

export const postNote = async (note: TNote): Promise<ApiResponse<TNoteResponse>> => {
    try {
        const res = await axios.post(`${BACKEND_API_URL}/note`, note)

        return {
            status: 'success',
            data: res.data
        }

    } catch (e) {
        console.log('adderror:',e)
        return {
            status: 'error',
            message: 'Error occured while adding note...'
        }
    }
}

export const getNote = async ():Promise<ApiResponse<TNoteResponse[]>> => {
    try {
        const res = await axios.get(`${BACKEND_API_URL}/note`)
        
        return {
            status: 'success',
            data: res.data
        }
    } catch (e) {
        console.log(e)
        return  {
            status: 'error',
            message: 'Error occured while fetching notes ...'
        }
    }
}


export const getNoteWithId = async (id: string):Promise<ApiResponse<TNoteResponse>> => {
    try {
        const res = await axios.get(`${BACKEND_API_URL}/note/${id}`)
        return {
            status: 'success',
            data: res.data
        }
    } catch (e) {
        console.log(e)
        return {
            status: 'error',
            message: `Error occured while fetching Note with id: ${id}`
        }
    }
}

export const updateNote = async (note: TNoteResponse): Promise<ApiResponse<TNoteResponse>> => {
    try {
        const {_id, ...UpdateNote} = note
        const res = await axios.patch(`${BACKEND_API_URL}/note/${note._id}`, UpdateNote)
        return {
            status: 'success',
            data: res.data
        }
    } catch (e) {
        console.log(e)
        return {
            status: 'error',
            message: 'Error occured while updating note...'
        }
    }
}

export const promptAi = async (prompt: TPrompt): Promise<ApiResponse<TPrompt>> => {
    try {
        const res = await axios.post(`${BACKEND_API_URL}/ai/chat`, prompt)
        return {
            status: 'success',
            data: res.data
        }
    } catch (e) {
        console.log(e)
        return {
            status: 'error',
            message: 'AI encountered a problem'
        }
    }
}

export const postQuestion = async (question: TQuestion): Promise<ApiResponse<TQuestionResponse>> => {
    try {
        const res = await axios.post(`${BACKEND_API_URL}/question`, question)
        return {
            status: "success",
            data: res.data
        }
    } catch (e) {
        console.log(e)
        return {
            status: 'error',
            message: "Error occured while adding question..."
        }
    }
}

export const getQuestion = async (): Promise<ApiResponse<TQuestionResponse[]>> => {
    try {
        const res = await axios.get(`${BACKEND_API_URL}/question`)
        return {
            status: "success",
            data: res.data
        }
    } catch (e) {
        console.log(e)
        return {
            status: 'error',
            message: "Error occured while fetching question..."
        }
    }
}

export const getQuestionWithId = async (id: string): Promise<ApiResponse<TQuestionResponse>> => {
    try {
        const res = await axios.get(`${BACKEND_API_URL}/question/${id}`)
        return {
            status: "success",
            data: res.data
        }
    } catch (e) {
        console.log(e)
        return {
            status: 'error',
            message: "Error occured while fetching question..."
        }
    }
}

export const updateQuestion = async (question: TQuestionUpdate): Promise<ApiResponse<TQuestionResponse>> => {
    try {
        const {_id, ...updateQuestion} = question
        const res = await axios.patch(`${BACKEND_API_URL}/question/${question._id}`, updateQuestion)
        return {
            status: "success",
            data: res.data
        }
    } catch (e) {
        console.log(e)
        return {
            status: 'error',
            message: "Error occured while updating question..."
        }
    }
}

export const getNoteQuestion = async (noteId: string): Promise<ApiResponse<TQuestionResponse[]>> => {
    try {
        const res = await axios.get(`${BACKEND_API_URL}/question/note/${noteId}`)
        return {
            status: 'success',
            data: res.data
        }
    } catch (e) {
        console.log(e)
        return {
            status: 'error',
            message: "Error occured while fetching questions..."
        }
    }
}
