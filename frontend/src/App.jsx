import { createBrowserRouter, RouterProvider } from "react-router-dom"

//UI components
import { Toaster } from "sonner";
import {ProtectedRoute} from "./features/auth/Protectedroutes.jsx"

// Pagesss
import Login from "./pages/LoginForm.jsx"
import Register from "./pages/RegisterForm.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import LandingPage from "./pages/LandingPage.jsx"
import PollsPage from "./pages/Pollspage.jsx"


function App() {

  const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> }
  ,
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/polls/:teamId", element: <PollsPage /> },
    ]
  }
]);
  return (
    <>
      
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />

    </>
  )
}

export default App
