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
  t: "#d4a373", // tan/wood (boat seat)
  T: "#faedcd", // light wood
  u: "#1d3557", // dark blue (boat hull)
  U: "#457b9d", // medium blue (hull highlight)
  m: "#a8dadc", // water/light blue
  M: "#f1faee", // water foam
};

// Each line is a row (16 chars). Top to bottom.
// Both characters face RIGHT (profile view).
// k=black  d=dark grey  g=dark green  G=light green  h=skin
// n=brown  s=grey  S=light grey  o=orange(earth)  r=red  w=white
// b=blue  B=light blue  p=flash  P=bright flash  c=cyan(line)  C=bright cyan
// t=tan(wood)  u=dark hull  U=hull hl  m=water  M=foam
const SPRITES: Record<string, string[]> = {
  // ===== HUNTER — soldier style (ref: soldier sprite) =====
  // idle: sitting against wall, rifle beside, sleeping
  hunter_idle: [
    "                ",
    "      SSSS      ",  // wall
    "      S  S      ",
    " kkk  S  S      ",  // helmet
    "kddk  S  S      ",  // visor dark
    " gggg SSSS      ",  // shoulders + wall base
    " gGGGg ssss     ",  // torso
    "  gGg           ",  // waist (sitting)
    "  nnn           ",  // legs bent
    "  n n           ",
    "  s s           ",  // boots
    "  ssss          ",  // rifle on ground
    "oooooooooooooo  ",  // ground
    "                ",
    "                ",
    "                ",
  ],
  // aiming: standing combat stance, rifle with both hands (ref: soldier idle)
  hunter_aiming: [
    "                ",
    "      kkk       ",  // helmet
    "     kddk       ",  // visor
    "      gggg      ",  // shoulders
    "     gGGGGg     ",  // torso ghillie
    "     gGGGGg     ",  // torso
    "      gggg      ",  // waist
    "      n  n      ",  // legs apart (combat stance)
    "      n  n      ",
    "     ss  ss     ",  // boots
    "     ssss       ",  // rifle stock
    "        ss      ",  // barrel extending
    "                ",
    "                ",
    "                ",
    "                ",
  ],
  // shooting: same as aiming + muzzle flash (ref: soldier shot)
  hunter_shooting: [
    "                ",
    "      kkk       ",
    "     kddk       ",
    "      gggg      ",
    "     gGGGGg     ",
    "     gGGGGg     ",
    "      gggg      ",
    "      n  n      ",
    "      n  n      ",
    "     ss  ss     ",
    "     ssss       ",
    "     ppPPss     ",  // flash on barrel
    "                ",
    "                ",
    "                ",
    "                ",
  ],
  // ===== FISHERMAN — standing in boat (ref: fish sprite sheet) =====
  // idle: standing with rod resting down
  swing_idle: [
    "                ",
    "     kkk        ",  // hat
    "    kbbbk       ",  // hat brim
    "     kbb        ",  // face
    "     hhhh       ",  // shirt (skin tone = light)
    "    nh  hn      ",  // arms + pants top
    "    n    n      ",  // pants
    "    s    s      ",  // boots
    "   sss  sss     ",  // boat floor
    "  tttttttttt    ",  // wood seat
    " uuuuuuuuuuuu   ",  // hull
    " uuUuuuuuuUuu   ",
    "  uuu    uuu    ",
    " mmmm    mmmm   ",  // water
    "                ",
    "                ",
  ],
  // casting: rod raised back, line in air
  swing_casting: [
    "            c   ",
    "           c    ",
    "     kkk  c     ",  // hat
    "    kbbbk c     ",  // hat + line
    "     kbb  c     ",  // face
    "     hhhh c     ",  // shirt
    "    nh  hn      ",  // arms
    "    n    n      ",  // pants
    "    s    s      ",  // boots
    "   sss  sss     ",  // boat
    "  tttttttttt    ",
    " uuuuuuuuuuuu   ",
    " uuUuuuuuuUuu   ",
    "  uuu    uuu    ",
    " mmmm    mmmm   ",
    "                ",
  ],
  // reeling: rod bent forward, pulling fish
  swing_reeling: [
    "                ",
    "     kkk        ",
    "    kbbbk       ",
    "     kbb        ",
    "     hhhh  cc   ",  // shirt + line tension
    "    nh  hn c    ",  // arms + line
    "    n    n      ",
    "    s    s      ",
    "   sss  sss     ",
    "  tttttttttt    ",
    " uuuuuuuuuuuu   ",
    " uuUuuuuuuUuu   ",
    "  uuu    uuu    ",
    " mmmm    mmmm   ",
    "                ",
    "                ",
  ],
  // caught: fish jumping, sparkles, splashes
  swing_caught: [
    "    C     C     ",
    "   C C   C C    ",
    "     kkk        ",
    "    kbbbk       ",
    "     kbb   C    ",
    "     hhhh C C   ",
    "    nh  hn      ",
    "    n    n      ",
    "    s    s      ",
    "   sss Msss     ",  // splash
    "  tttttttttt    ",
    " uuuuuuuuuuuu   ",
    " uuUuuuuuuUuu   ",
    "  uuu    uuu    ",
    " mMmM    mMmM   ",  // foamy water
    "                ",
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
