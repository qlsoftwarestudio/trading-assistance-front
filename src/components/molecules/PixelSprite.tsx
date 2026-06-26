import { cn } from "@/lib/utils";

// CSS Pixel Art renderer using box-shadow technique
// Each sprite is a 16x16 grid where each char maps to a color

const PALETTE: Record<string, string> = {
  " ": "transparent",
  ".": "transparent",
  k: "#1a1a2e", // black/dark
  g: "#2d6a4f", // green (grass/vest)
  G: "#40916c", // light green
  r: "#d00000", // red
  R: "#ff4d6d", // light red
  b: "#3f37c9", // blue
  B: "#4cc9f0", // light blue
  y: "#ffaa00", // yellow/gold
  Y: "#ffcc00", // bright yellow
  o: "#e85d04", // orange
  w: "#f8f9fa", // white
  W: "#e9ecef", // off-white
  s: "#6c757d", // silver/grey
  S: "#adb5bd", // light grey
  n: "#5c3a21", // brown
  N: "#8b5e3c", // light brown
  p: "#ff6d00", // muzzle flash
  P: "#ffea00", // bright flash
  d: "#212529", // dark grey
  v: "#7209b7", // violet/purple
  V: "#b5179e", // light purple
  a: "#80b918", // aqua green
  A: "#d8f3dc", // very light green
  h: "#ffd166", // skin tone
  H: "#f4a261", // darker skin
  c: "#118ab2", // cyan
  C: "#06d6a0", // bright cyan
};

// Each line is a row (16 chars). Top to bottom.
const SPRITES: Record<string, string[]> = {
  // ===== HUNTER / SCALP =====
  hunter_idle: [
    "                ",
    "      kkkk      ",
    "     kwwwwk     ",
    "     kwhwwk     ",
    "      khww      ",
    "      gggg      ",
    "     gGGGGg     ",
    "    gGGGGGGg    ",
    "    gGGGGGGg    ",
    "     gGGGGg     ",
    "      gggg      ",
    "      nnnn      ",
    "      n  n      ",
    "     nn  nn     ",
    "    sss  sss    ",
    "    sss  sss    ",
  ],
  hunter_aiming: [
    "                ",
    "      kkkk      ",
    "     kwwwwk     ",
    "     kwhwwk     ",
    "      khww      ",
    "      gggg      ",
    "     gGGGGg     ",
    "    gGGGGGGg    ",
    "    gGGGGGGg    ",
    "     gGGGGg     ",
    "      gggg      ",
    "      nnnn      ",
    "      n  n      ",
    "     nn  nn     ",
    "    sss  sss    ",
    "    sss  sss    ",
  ],
  hunter_shooting: [
    "            PPPP",
    "      kkkk  PPPP",
    "     kwwwwkPP   ",
    "     kwhwwkP    ",
    "      khww p    ",
    "      gggg p    ",
    "     gGGGGg     ",
    "    gGGGGGGg    ",
    "    gGGGGGGg    ",
    "     gGGGGg     ",
    "      gggg      ",
    "      nnnn      ",
    "      n  n      ",
    "     nn  nn     ",
    "    sss  sss    ",
    "    sss  sss    ",
  ],
  hunter_reloading: [
    "                ",
    "      kkkk      ",
    "     kwwwwk     ",
    "     kwhwwk     ",
    "      khww      ",
    "      gggg      ",
    "     gGGGGg     ",
    "    gGGGGGGg    ",
    "    gGGGGGGg    ",
    "     gGGGGg     ",
    "      gggg      ",
    "      nnnn      ",
    "      n  n      ",
    "     nn  nn     ",
    "    sss  sss    ",
    "    sss  sss    ",
  ],
  // ===== SWING / FISHERMAN =====
  swing_idle: [
    "                ",
    "      kkkk      ",
    "     kwwwwk     ",
    "     kwhwwk     ",
    "      khww      ",
    "      bbbb      ",
    "     bBBBBb     ",
    "    bBBBBBBb    ",
    "    bBBBBBBb    ",
    "     bBBBBb     ",
    "      bbbb      ",
    "      nnnn      ",
    "      n  n      ",
    "     nn  nn     ",
    "    sss  sss    ",
    "    sss  sss    ",
  ],
  swing_casting: [
    "                ",
    "      kkkk      ",
    "     kwwwwk     ",
    "     kwhwwk     ",
    "      khww      ",
    "      bbbb      ",
    "     bBBBBb     ",
    "    bBBBBBBb    ",
    "    bBBBBBBb    ",
    "     bBBBBb     ",
    "      bbbb  c   ",
    "      nnnn  c   ",
    "      n  n  c   ",
    "     nn  nnnnnn ",
    "    sss         ",
    "    sss         ",
  ],
  swing_reeling: [
    "                ",
    "      kkkk      ",
    "     kwwwwk     ",
    "     kwhwwk     ",
    "      khww      ",
    "      bbbb      ",
    "     bBBBBb  c  ",
    "    bBBBBBBb c  ",
    "    bBBBBBBb c  ",
    "     bBBBBb  c  ",
    "      bbbb c    ",
    "      nnnn c    ",
    "      n  nnnnn  ",
    "     nn         ",
    "    sss         ",
    "    sss         ",
  ],
  swing_caught: [
    "        C       ",
    "       C C      ",
    "      C   C     ",
    "      kkkk      ",
    "     kwwwwk     ",
    "     kwhwwk  C  ",
    "      khww   C  ",
    "      bbbb  C   ",
    "     bBBBBb C   ",
    "    bBBBBBBb    ",
    "    bBBBBBBb    ",
    "     bBBBBb     ",
    "      bbbb      ",
    "      nnnn      ",
    "      n  n      ",
    "     nn  nn     ",
  ],
};

function buildBoxShadow(rows: string[]): string {
  const shadows: string[] = [];
  rows.forEach((row, y) => {
    row.split("").forEach((char, x) => {
      if (char !== " " && char !== "." && PALETTE[char]) {
        shadows.push(`${x * 4}px ${y * 4}px 0 0 ${PALETTE[char]}`);
      }
    });
  });
  return shadows.join(",");
}

interface Props {
  sprite: string;
  size?: number; // multiplier, default 4 (64px canvas)
  className?: string;
  animate?: boolean;
}

export const PixelSprite = ({ sprite, size = 4, className, animate = false }: Props) => {
  const rows = SPRITES[sprite] ?? SPRITES["hunter_idle"];
  const shadow = buildBoxShadow(rows);
  const canvasSize = 16 * size;

  return (
    <div
      className={cn("relative inline-block", className)}
      style={{ width: canvasSize, height: canvasSize }}
    >
      <div
        className={cn("absolute top-0 left-0", animate && "animate-pulse")}
        style={{
          width: size,
          height: size,
          background: "transparent",
          boxShadow: shadow,
        }}
      />
    </div>
  );
};

// State helpers
export function getHunterSprite(openScalpTrades: number, inKillzone: boolean): string {
  if (openScalpTrades > 0) return "hunter_shooting";
  if (inKillzone) return "hunter_aiming";
  return "hunter_idle";
}

export function getSwingSprite(openSwingTrades: number, lastSwingClosedMinutes?: number): string {
  if (openSwingTrades > 0) return "swing_reeling";
  if (lastSwingClosedMinutes != null && lastSwingClosedMinutes < 30) return "swing_caught";
  return "swing_idle";
}
