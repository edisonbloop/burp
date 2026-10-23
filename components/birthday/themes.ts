import type { BirthdayTheme } from "@/types/birthday";

export type ThemeSpec = {
  id: BirthdayTheme;
  label: string;
  blurb: string;
  dark: boolean;
  /** Page background (CSS background value). */
  bg: string;
  ink: string;
  muted: string;
  accent: string;
  accentSoft: string;
  /** Envelope body + flap colours. */
  envelope: string;
  envelopeFlap: string;
  /** Paper tints for the message notes, cycled. */
  papers: string[];
  paperInk: string;
  confetti: string[];
  balloons: string[];
};

export const THEMES: Record<BirthdayTheme, ThemeSpec> = {
  gold: {
    id: "gold",
    label: "Parchment & Gold",
    blurb: "Warm, classic, very BURP.",
    dark: false,
    bg: "radial-gradient(120% 80% at 50% 0%, #FFF8EA 0%, #F7EEDB 45%, #EFE3C8 100%)",
    ink: "#1A1714",
    muted: "#6B5F50",
    accent: "#B8924A",
    accentSoft: "#E8C9A0",
    envelope: "#E7D5AE",
    envelopeFlap: "#D9C08E",
    papers: ["#FFFDF6", "#FBF3E2", "#F6ECDA", "#FFF7E8"],
    paperInk: "#2A241D",
    confetti: ["#B8924A", "#D9B978", "#8E6F33", "#F5E9D2", "#9C3A2A", "#5B7A4A"],
    balloons: ["#C9A35C", "#9C3A2A", "#5B7A4A", "#E2C68E"],
  },
  blush: {
    id: "blush",
    label: "Blush Bloom",
    blurb: "Soft pinks and peach.",
    dark: false,
    bg: "radial-gradient(120% 80% at 50% 0%, #FFF4F2 0%, #FBE3E1 50%, #F4D0CF 100%)",
    ink: "#3B1F26",
    muted: "#8A5A63",
    accent: "#D2667A",
    accentSoft: "#F4B8C1",
    envelope: "#F2C6C8",
    envelopeFlap: "#E8A9AE",
    papers: ["#FFFBFA", "#FFF0EE", "#FDE7E4", "#FFF6EC"],
    paperInk: "#3B1F26",
    confetti: ["#D2667A", "#F4B8C1", "#FFD6A5", "#FFFFFF", "#B5838D", "#E5989B"],
    balloons: ["#E5989B", "#D2667A", "#FFD6A5", "#F4B8C1"],
  },
  midnight: {
    id: "midnight",
    label: "Midnight Stars",
    blurb: "Deep navy, gold starlight.",
    dark: true,
    bg: "radial-gradient(120% 80% at 50% 0%, #253158 0%, #141B36 55%, #0B1024 100%)",
    ink: "#F6EFDF",
    muted: "#AEB6D3",
    accent: "#E3C27A",
    accentSoft: "#F3DFA8",
    envelope: "#2E3A66",
    envelopeFlap: "#3A4878",
    papers: ["#FFFDF6", "#F7F1E2", "#EEF0FA", "#FBF5E6"],
    paperInk: "#1B2140",
    confetti: ["#E3C27A", "#F3DFA8", "#FFFFFF", "#8EA2E6", "#C9B6F2", "#F28CA8"],
    balloons: ["#E3C27A", "#8EA2E6", "#C9B6F2", "#F28CA8"],
  },
  garden: {
    id: "garden",
    label: "Garden Party",
    blurb: "Sage, cream and wildflowers.",
    dark: false,
    bg: "radial-gradient(120% 80% at 50% 0%, #F8FAF1 0%, #E8EFDC 50%, #D6E2C6 100%)",
    ink: "#1F2A1C",
    muted: "#5C6B53",
    accent: "#5B7A4A",
    accentSoft: "#B7CCA1",
    envelope: "#CFDDBB",
    envelopeFlap: "#B9CD9F",
    papers: ["#FFFEF7", "#F4F8EA", "#FFF6E6", "#EEF4E4"],
    paperInk: "#1F2A1C",
    confetti: ["#5B7A4A", "#B7CCA1", "#F2C14E", "#F78154", "#FFFFFF", "#E8A0BF"],
    balloons: ["#F2C14E", "#F78154", "#8DB580", "#E8A0BF"],
  },
};

export const THEME_LIST = Object.values(THEMES);
