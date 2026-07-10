import { createBrowserRouter, Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import PublicLayout from "@/component/layout/publicLayout";
import PrivateLayout from "@/component/layout/privateLayout";
import AuthGuard from "@/router/authGuard";
import { ROUTES } from "@/utils/constants";
import Dashboard from "@/pages/dashboard";
import Quizzes from "@/pages/quizzes";
import Quiz from "@/pages/quiz";
import AdminDashboard from "@/pages/admindashboard";
import AdminLinks from "@/pages/adminlinks";
import Play from "@/pages/play";
import Participants from "@/pages/participants";
import NotFound from "@/pages/notfound";
import Register from "@/pages/auth/register";
import Login from "@/pages/auth/login";
import Guest from "@/pages/auth/guest";
import Home from "@/pages/home";

const routes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      { path: ROUTES.REGISTER, element: <Register /> },
      { path: ROUTES.LOGIN, element: <Login /> },
      { path: `${ROUTES.PLAY}/:slug`, element: <Play /> },
      { path: ROUTES.GUEST, element: <Guest /> },
      { path: ROUTES.NOT_FOUND, element: <NotFound /> },
      { path: "public/*", element: <Navigate to={ROUTES.NOT_FOUND} replace /> },
      { path: ROUTES.HOME, element: <Home /> },
    ],
  },

  {
    element: <AuthGuard />,
    children: [
      {
        element: <PrivateLayout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.HOME} replace /> },
          { path: ROUTES.DASHBOARD.replace("/", ""), element: <Dashboard /> },
          { path: ROUTES.QUIZZES, element: <Quizzes /> },
          { path: `${ROUTES.QUIZ}/:id`, element: <Quiz /> },
          { path: ROUTES.ADMINDASHBOARD, element: <AdminDashboard /> },
          { path: ROUTES.ADMINLINKS, element: <AdminLinks /> },
          { path: ROUTES.PARTICIPANTS, element: <Participants /> },
          { path: "*", element: <Navigate to={ROUTES.NOT_FOUND} replace /> }
        ],
      },
    ],
  },

  { path: "*", element: <Navigate to={ROUTES.NOT_FOUND} replace /> },
];

const router = createBrowserRouter(routes);

export default router;