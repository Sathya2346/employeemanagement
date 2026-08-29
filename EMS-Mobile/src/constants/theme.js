import { COLORS } from "./colors";

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const RADIUS = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  xxl: 15,
  pill: 20,
  round: 50,
};

export const SHADOWS = {
  // Matching dashboard .card-stats: box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  card: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  // Matching login .login-card: box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
  loginCard: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
  },
  // Matching navbar shadow-sm
  navbar: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  // Matching btn-login hover/active shadow
  btn: {
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  // Matching orangeBtn shadow
  orangeBtn: {
    shadowColor: "#FF7423",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  // Notification badge shadow: box-shadow: 0 0 2px rgba(0,0,0,0.5);
  badge: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 2,
  },
};
