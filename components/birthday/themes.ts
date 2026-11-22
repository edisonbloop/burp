import type { CSSProperties } from "react";
import type { BirthdayTheme } from "@/types/birthday";

/** The little shapes that twinkle in the background. */
export type Motif = "dots" | "sparkles" | "stars" | "hearts" | "petals" | "bubbles" | "diamonds";

export type ThemeSpec = {
  id: BirthdayTheme;
  label: string;
  blurb: string;
  dark: boolean;
  /** Page background (CSS background value). */
  bg: string;
  /** Optional repeating pattern laid over `bg` (CSS background-image layers). */
  pattern?: string;
  ink: string;
  muted: string;
  accent: string;
  accentSoft: string;
  /** Text colour on an `accent`-filled button. */
  onAccent: string;
  /** Optional gradient for foil-effect lettering on the name. */
  foil?: string;
  motif: Motif;
  /** Envelope body + flap colours. */
  envelope: string;
  envelopeFlap: string;
  /** Paper tints for the message notes, cycled. */
  papers: string[];
  paperInk: string;
  confetti: string[];
  balloons: string[];
};

const CREAM_PAPERS = ["#FFFDF6", "#FBF4E6", "#F6F1FA", "#FFF8EC"];
const GOLD_FOIL = "linear-gradient(100deg, #B8862E 0%, #F7E3A1 22%, #D4A647 45%, #FFF1C1 62%, #B8862E 85%)";

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
    onAccent: "#FFFFFF",
    motif: "sparkles",
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
    onAccent: "#FFFFFF",
    motif: "hearts",
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
    onAccent: "#141B36",
    foil: GOLD_FOIL,
    motif: "stars",
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
    onAccent: "#FFFFFF",
    motif: "petals",
    envelope: "#CFDDBB",
    envelopeFlap: "#B9CD9F",
    papers: ["#FFFEF7", "#F4F8EA", "#FFF6E6", "#EEF4E4"],
    paperInk: "#1F2A1C",
    confetti: ["#5B7A4A", "#B7CCA1", "#F2C14E", "#F78154", "#FFFFFF", "#E8A0BF"],
    balloons: ["#F2C14E", "#F78154", "#8DB580", "#E8A0BF"],
  },
  sunset: {
    id: "sunset",
    label: "Golden Hour",
    blurb: "Peach, coral and late sun.",
    dark: false,
    bg: "linear-gradient(170deg, #FFF3E3 0%, #FFE0C4 38%, #FBC3A8 72%, #F4A6A0 100%)",
    ink: "#3A1E14",
    muted: "#8A5544",
    accent: "#E0703C",
    accentSoft: "#F8C29B",
    onAccent: "#FFFFFF",
    motif: "sparkles",
    envelope: "#F6CDA8",
    envelopeFlap: "#EFB487",
    papers: ["#FFFBF5", "#FFF1E4", "#FFE9DE", "#FFF6E8"],
    paperInk: "#3A1E14",
    confetti: ["#E0703C", "#F8C29B", "#F6D06F", "#D9506A", "#FFFFFF", "#9B5DE5"],
    balloons: ["#E0703C", "#F6D06F", "#D9506A", "#F8C29B"],
  },
  ocean: {
    id: "ocean",
    label: "Ocean Breeze",
    blurb: "Sea glass, aqua and sunshine.",
    dark: false,
    bg: "radial-gradient(120% 80% at 50% 0%, #F2FCFC 0%, #D7F1F1 50%, #B6E1E6 100%)",
    ink: "#0F2E36",
    muted: "#4C7480",
    accent: "#1C8A9A",
    accentSoft: "#9ADCE0",
    onAccent: "#FFFFFF",
    motif: "bubbles",
    envelope: "#BFE6E8",
    envelopeFlap: "#A2D7DB",
    papers: ["#FFFFFF", "#EEFAFA", "#F4F8FF", "#FFFBF2"],
    paperInk: "#0F2E36",
    confetti: ["#1C8A9A", "#9ADCE0", "#FFD166", "#FF8FA3", "#FFFFFF", "#3A86FF"],
    balloons: ["#3A86FF", "#1C8A9A", "#FFD166", "#FF8FA3"],
  },
  lavender: {
    id: "lavender",
    label: "Lavender Haze",
    blurb: "Lilac, mint and dreamy pastels.",
    dark: false,
    bg: "radial-gradient(110% 70% at 20% 0%, #FDF9FF 0%, #EFE5FC 45%, #DCCDF5 100%)",
    ink: "#2A1F3D",
    muted: "#6E5E8A",
    accent: "#8A63D2",
    accentSoft: "#CDB8F2",
    onAccent: "#FFFFFF",
    motif: "stars",
    envelope: "#E1D3F7",
    envelopeFlap: "#D0BDF0",
    papers: ["#FFFDFF", "#F7F2FF", "#FFF5FA", "#F1FAF6"],
    paperInk: "#2A1F3D",
    confetti: ["#8A63D2", "#CDB8F2", "#F7AEF8", "#B8E0D2", "#FFFFFF", "#FFD6A5"],
    balloons: ["#B794F6", "#F7AEF8", "#8A63D2", "#B8E0D2"],
  },
  candy: {
    id: "candy",
    label: "Candy Pop",
    blurb: "Bright, playful, polka dots.",
    dark: false,
    bg: "linear-gradient(160deg, #FFFFFF 0%, #FFF3FA 50%, #EEF6FF 100%)",
    pattern: "radial-gradient(rgba(255,79,154,0.13) 2.5px, transparent 3px) 0 0 / 26px 26px, radial-gradient(rgba(59,206,172,0.12) 2.5px, transparent 3px) 13px 13px / 26px 26px",
    ink: "#2B2140",
    muted: "#6B6585",
    accent: "#FF4F9A",
    accentSoft: "#FFC2DF",
    onAccent: "#FFFFFF",
    motif: "dots",
    envelope: "#FFD3E8",
    envelopeFlap: "#FFB8D9",
    papers: ["#FFFFFF", "#FFF5FA", "#F2FAFF", "#FFFDEB"],
    paperInk: "#2B2140",
    confetti: ["#FF4F9A", "#FFD23F", "#3BCEAC", "#5E60CE", "#FF9F1C", "#00B4D8"],
    balloons: ["#FF4F9A", "#FFD23F", "#3BCEAC", "#5E60CE"],
  },
  tropical: {
    id: "tropical",
    label: "Tropical Fiesta",
    blurb: "Mint, coral and pineapple yellow.",
    dark: false,
    bg: "radial-gradient(120% 80% at 50% 0%, #FFFBEA 0%, #E6F8EF 50%, #C9F0DF 100%)",
    ink: "#123B30",
    muted: "#4E7A6C",
    accent: "#FF6B4A",
    accentSoft: "#FFB4A2",
    onAccent: "#FFFFFF",
    motif: "petals",
    envelope: "#BCEBD5",
    envelopeFlap: "#9EDFC1",
    papers: ["#FFFFFF", "#FFF8EC", "#EFFBF5", "#FFF1EE"],
    paperInk: "#123B30",
    confetti: ["#FF6B4A", "#FFC93C", "#2EC4B6", "#7BD389", "#FF8FAB", "#FFFFFF"],
    balloons: ["#FF6B4A", "#FFC93C", "#2EC4B6", "#FF8FAB"],
  },
  kente: {
    id: "kente",
    label: "Kente Gold",
    blurb: "Woven gold, green and red.",
    dark: false,
    bg: "linear-gradient(180deg, #FFF7DF 0%, #F9E7B4 55%, #F1D484 100%)",
    pattern:
      "repeating-linear-gradient(90deg, rgba(11,122,59,0.11) 0 14px, transparent 14px 30px, rgba(200,16,46,0.09) 30px 36px, transparent 36px 62px, rgba(30,20,8,0.08) 62px 66px, transparent 66px 92px), repeating-linear-gradient(0deg, rgba(232,177,14,0.16) 0 10px, transparent 10px 44px)",
    ink: "#1E1408",
    muted: "#6B4F1D",
    accent: "#0B7A3B",
    accentSoft: "#E8B10E",
    onAccent: "#FFFFFF",
    motif: "diamonds",
    envelope: "#E8C25A",
    envelopeFlap: "#D9A92C",
    papers: ["#FFFDF4", "#FFF7E0", "#FBF2DA", "#FFFAEB"],
    paperInk: "#1E1408",
    confetti: ["#E8B10E", "#0B7A3B", "#C8102E", "#1E1408", "#FFFFFF"],
    balloons: ["#E8B10E", "#0B7A3B", "#C8102E", "#F2CF5B"],
  },
  royal: {
    id: "royal",
    label: "Royal Velvet",
    blurb: "Deep plum with gold foil.",
    dark: true,
    bg: "radial-gradient(120% 80% at 50% 0%, #54247A 0%, #2E1048 55%, #170727 100%)",
    ink: "#FBF3E4",
    muted: "#CDB7E0",
    accent: "#E7C46A",
    accentSoft: "#F6E2A6",
    onAccent: "#2A0F3F",
    foil: GOLD_FOIL,
    motif: "diamonds",
    envelope: "#5B2A80",
    envelopeFlap: "#6A3592",
    papers: CREAM_PAPERS,
    paperInk: "#2A1438",
    confetti: ["#E7C46A", "#F6E2A6", "#FFFFFF", "#B892E0", "#E58FB5"],
    balloons: ["#E7C46A", "#9B5DE5", "#E58FB5", "#F6E2A6"],
  },
  emerald: {
    id: "emerald",
    label: "Emerald Night",
    blurb: "Rich green and candlelit gold.",
    dark: true,
    bg: "radial-gradient(120% 80% at 50% 0%, #135A49 0%, #0A342C 55%, #041C17 100%)",
    ink: "#F3F0E2",
    muted: "#A9C8BC",
    accent: "#D8B45E",
    accentSoft: "#EED9A0",
    onAccent: "#082B24",
    foil: GOLD_FOIL,
    motif: "sparkles",
    envelope: "#155A49",
    envelopeFlap: "#1C6B57",
    papers: CREAM_PAPERS,
    paperInk: "#12332B",
    confetti: ["#D8B45E", "#EED9A0", "#FFFFFF", "#6FCF97", "#F2994A"],
    balloons: ["#D8B45E", "#6FCF97", "#F2994A", "#EED9A0"],
  },
  noir: {
    id: "noir",
    label: "Black Tie",
    blurb: "Black, champagne, art deco.",
    dark: true,
    bg: "radial-gradient(120% 80% at 50% 0%, #2C2C31 0%, #151517 55%, #09090A 100%)",
    pattern: "repeating-linear-gradient(45deg, rgba(217,192,138,0.06) 0 1px, transparent 1px 16px), repeating-linear-gradient(-45deg, rgba(217,192,138,0.06) 0 1px, transparent 1px 16px)",
    ink: "#F5EFE3",
    muted: "#B5AE9F",
    accent: "#D9C08A",
    accentSoft: "#EFE2C0",
    onAccent: "#141416",
    foil: "linear-gradient(100deg, #A88B52 0%, #F3E6C4 25%, #C9AD72 50%, #FFF6DD 65%, #A88B52 90%)",
    motif: "stars",
    envelope: "#232326",
    envelopeFlap: "#2E2E32",
    papers: ["#FFFDF8", "#F7F3EA", "#F2F2F2", "#FBF7EE"],
    paperInk: "#1A1A1C",
    confetti: ["#D9C08A", "#EFE2C0", "#FFFFFF", "#9A9A9A", "#C9A55C"],
    balloons: ["#D9C08A", "#F5EFE3", "#3A3A3F", "#C9A55C"],
  },
};

export const THEME_LIST = Object.values(THEMES);

/** `bg` with the theme's pattern (if any) laid on top, as a CSS background. */
export function themeBackground(t: ThemeSpec) {
  return t.pattern ? `${t.pattern}, ${t.bg}` : t.bg;
}

/** Inline style for foil (gradient-filled) lettering, or plain ink. */
export function foilText(t: ThemeSpec): CSSProperties {
  if (!t.foil) return {};
  return {
    backgroundImage: t.foil,
    backgroundSize: "300% 100%",
    animation: "bday-foil 6s ease-in-out infinite",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  };
}
