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
  // ===== HUNTER — soldier (ref image 3) =====
  // idle: standing, rifle aiming forward (like soldier IDLE row)
  hunter_idle: [
    "                ",
    "      kkk       ",  // helmet
    "     kddk       ",  // visor
    "      gggg      ",  // shoulders
    "     gGGGGg     ",  // torso ghillie
    "     gGGGGg     ",  // torso
    "      gggg      ",  // waist
    "      n  n      ",  // legs apart, firm stance
    "      n  n      ",
    "     ss  ss     ",  // boots
    "     ssss       ",  // rifle stock in hands
    "        ss      ",  // barrel extending right
    "                ",
    "                ",
    "                ",
    "                ",
  ],
  // move: walking, rifle held lower (like soldier MOVE row)
  hunter_move: [
    "                ",
    "      kkk       ",  // helmet
    "     kddk       ",  // visor
    "      gggg      ",  // shoulders
    "     gGGGGg     ",  // torso
    "      gggg      ",  // waist
    "      gggg      ",
    "      n  n      ",  // legs (walking stride)
    "     n   n      ",  // one leg forward
    "     s   s      ",  // boots
    "      ssss      ",  // rifle held at waist
    "         s      ",  // barrel pointing down-right
    "                ",
    "                ",
    "                ",
    "                ",
  ],
  // shoot: kneeling, firing (like soldier SHOT 2 row)
  hunter_shoot: [
    "                ",
    "      kkk       ",  // helmet
    "     kddk       ",  // visor
    "      gggg      ",  // shoulders
    "     gGGGGg     ",  // torso
    "      gggg      ",  // waist
    "      n n       ",  // kneeling (one knee down)
    "     n  nn      ",  // legs bent
    "     s  ss      ",  // boots/knee pad
    "    ssss        ",  // rifle stock against shoulder
    "       ssPPpp   ",  // barrel + muzzle flash at tip
    "                ",
    "                ",
    "                ",
    "                ",
    "                ",
  ],
  // ===== FISHERMAN — in boat (ref image 2) =====
  // idle: standing, rod resting down (like Fish row, frame 1)
  swing_idle: [
    "                ",
    "     kkk        ",  // bucket hat
    "    kbbbk       ",  // hat brim
    "     kbb        ",  // face
    "     hhhh       ",  // shirt
    "    nh  hn      ",  // arms at sides
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
  // fish: rod pointing at water, fishing (like Fish row)
  swing_fish: [
    "            c   ",  // line/rod tip
    "           c    ",
    "     kkk  c     ",  // bucket hat
    "    kbbbk c     ",  // hat + rod shaft
    "     kbb  c     ",  // face
    "     hhhh c     ",  // shirt, holding rod up
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
  // hook: rod bent, line curved, pulling (like Hook row)
  swing_hook: [
    "                ",
    "     kkk        ",  // bucket hat
    "    kbbbk       ",
    "     kbb        ",
    "     hhhh  cc   ",  // shirt, rod bent forward
    "    nh  hn c    ",  // arms pulling
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
  if (openScalpTrades > 0) return "hunter_shoot";      // active trade = kneeling, firing
  if (inKillzone) return "hunter_move";                  // in killzone, searching = walking
  return "hunter_idle";                                   // outside killzone = standing guard
}

export function getSwingSprite(openSwingTrades: number, lastSwingClosedMinutes?: number): string {
  if (openSwingTrades > 0) return "swing_hook";          // active trade = rod bent, pulling
  if (lastSwingClosedMinutes != null && lastSwingClosedMinutes < 30) return "swing_fish"; // recently caught, fishing again
  return "swing_idle";                                    // waiting = rod resting
}
