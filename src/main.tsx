import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "./pages/home";
import { Course } from "./pages/course";
import { Lobby } from "./pages/lobby";
import RealtimeSpeechToText from "./Test/RealtimeSpeechToText";
import { RoomProvider } from "./hooks/RoomContext";
import { PlayCourse } from './pages/playcourse'

// import createStore from 'react-auth-kit/createStore'

// const store = createStore({
//   authName: "_auth",
//   authType: "cookie",
//   cookieDomain: window.location.hostname,
//   cookieSecure: false
// })

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/course/:noteId",
    element: <Course />,
  },
  {
    path: "/lobby",
    element: <Lobby />,
  },
  {
    path: "stt2",
    element: <RealtimeSpeechToText />,
  },
  {
    path:'/playCourse/:noteId',
    element: <PlayCourse/>
  }
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RoomProvider>
      <RouterProvider router={router} />
    </RoomProvider>
  </StrictMode>
);
