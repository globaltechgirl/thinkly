// --- FILLED ICONS ---
import HomeIcon from "@mui/icons-material/Home";
import BookmarkIcon from "@mui/icons-material/Bookmark"; 
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import FolderIcon from "@mui/icons-material/Folder"; 
import PeopleIcon from "@mui/icons-material/People";

// --- OUTLINED ICONS ---
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined"; 
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";

/* import { IconHouse2OutlineDuo18, IconBookmarksOutlineDuo18, IconChartBarTrendUpOutlineDuo18, IconFolderOpenOutlineDuo18, IconUsersOutlineDuo18, IconGear2OutlineDuo18, IconArrowDoorOut3OutlineDuo18 } from 'nucleo-ui-essential-outline-duo-18'; */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === "production" ? "/api" : "");

export const APP_BASE_URL =
  import.meta.env.VITE_APP_BASE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");

export const ROUTES = {
  REGISTER: "/register",
  LOGIN: "/login",
  GUEST: "/guest",
  ROOT: "/",
  HOME: "/home",
  DASHBOARD: "/dashboard",
  QUIZZES: "/quizzes",
  NOTIFICATIONS: "/notifications",
  SETTINGS: "/settings",
  QUIZ: "/quiz",
  ADD: "/add",
  CREATE: "/create",
  SEARCH: "/search",
  ADMINDASHBOARD: "/admindashboard",
  ADMINLINKS: "/adminlinks",
  PLAY: "/play",
  PARTICIPANTS: "/participants",
  NOT_FOUND: "/notfound",
};

export const NavLinks = [
  {
    label: "Dashboard",
    link: ROUTES.DASHBOARD,
    icon: HomeOutlinedIcon,
    activeIcon: HomeIcon,
  },
  {
    label: "Quizzes",
    link: ROUTES.QUIZZES,
    icon: BookmarkBorderOutlinedIcon,
    activeIcon: BookmarkIcon,
  },
  {
    label: "Analytics",
    link: ROUTES.ADMINDASHBOARD,
    icon: TrendingUpOutlinedIcon,
    activeIcon: TrendingUpIcon,
  },
  {
    label: "Projects",
    link: ROUTES.ADMINLINKS,
    icon: FolderOpenOutlinedIcon,
    activeIcon: FolderIcon,
  },
  {
    label: "Participants",
    link: ROUTES.PARTICIPANTS,
    icon: PeopleOutlineOutlinedIcon,
    activeIcon: PeopleIcon,
  },
];

export const BottomLinks = [
  {
    label: "Settings",
    icon: SettingsIcon,
  },
  {
    label: "Log out",
    icon: LogoutIcon,
  },
];