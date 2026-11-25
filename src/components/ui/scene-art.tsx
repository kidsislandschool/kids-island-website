import { cn } from "@/lib/utils";

export type SceneVariant =
  | "classroom"
  | "science"
  | "library"
  | "play"
  | "computer"
  | "outdoor"
  | "school"
  | "art"
  | "generic";

/**
 * Hand-drawn SVG scene placeholders.
 *
 * No stock photography is used anywhere — every image slot falls back to one
 * of these illustrations until the school uploads a real photo, so the site
 * looks intentional (not grey-boxed) and every image is clearly replaceable
 * from the CMS.
 */
export function SceneArt({
  variant = "generic",
  className,
  label,
}: {
  variant?: SceneVariant | string;
  className?: string;
  label?: string;
}) {
  const v = (variant || "generic") as SceneVariant;
  const scene = SCENES[v] ?? SCENES.generic;
  return (
    <svg
      viewBox="0 0 800 600"
      role={label ? "img" : "presentation"}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("h-full w-full", className)}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`bg-${v}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={scene.bg[0]} />
          <stop offset="100%" stopColor={scene.bg[1]} />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill={`url(#bg-${v})`} />
      {scene.art}
    </svg>
  );
}

const SCENES: Record<
  SceneVariant,
  { bg: [string, string]; art: React.ReactNode }
> = {
  classroom: {
    bg: ["#FFF3D6", "#FFFBF2"],
    art: (
      <>
        <circle cx="690" cy="90" r="120" fill="#FFC53D" opacity=".28" />
        <circle cx="105" cy="520" r="150" fill="#FFB7C9" opacity=".22" />
        <path d="M80 150c0-30 24-54 54-54 22 0 41 13 49 32 6-3 14-5 22-5 26 0 47 20 47 45 0 5-1 9-2 13h-170Z" fill="#fff" opacity=".85" />
        {/* chalkboard */}
        <rect x="170" y="105" width="460" height="295" rx="26" fill="#2F5D4E" />
        <rect x="192" y="127" width="416" height="251" rx="16" fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="3" strokeDasharray="8 10" />
        <text x="235" y="230" fontFamily="Fredoka, sans-serif" fontSize="64" fontWeight="700" fill="#FFFDF4" opacity=".95">A B C</text>
        <text x="335" y="305" fontFamily="Fredoka, sans-serif" fontSize="52" fontWeight="600" fill="#FFE39A" opacity=".95">1 2 3</text>
        <path d="M490 300c8-24 28-24 36 0" stroke="#FFB7C9" strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle cx="575" cy="185" r="26" fill="#FFC53D" opacity=".9" />
        <path d="M575 171v14l10 6" stroke="#8A5A00" strokeWidth="4" strokeLinecap="round" fill="none" />
        <rect x="170" y="400" width="460" height="20" rx="10" fill="#24483C" />
        {/* desk */}
        <rect x="235" y="450" width="330" height="26" rx="13" fill="#E3A16F" />
        <rect x="262" y="476" width="12" height="60" rx="6" fill="#C98554" />
        <rect x="526" y="476" width="12" height="60" rx="6" fill="#C98554" />
        <rect x="290" y="418" width="110" height="34" rx="6" fill="#FF8A65" transform="rotate(-4 345 435)" />
        <rect x="295" y="425" width="100" height="8" rx="4" fill="#FFD9CE" opacity=".9" />
        <circle cx="500" cy="432" r="22" fill="#F4626F" />
        <path d="M500 414c-6-8-16-6-16 2 0 8 10 12 16 18 6-6 16-10 16-18 0-8-10-10-16-2Z" fill="#fff" opacity=".55" />
        <path d="M110 260c8 0 8 12 16 12" stroke="#16A34A" strokeWidth="5" strokeLinecap="round" opacity=".5" />
        <path d="M700 330c-8 0-8 12-16 12" stroke="#E86A8A" strokeWidth="5" strokeLinecap="round" opacity=".6" />
        <path d="M655 240l7 18 18 7-18 7-7 18-7-18-18-7 18-7 7-18Z" fill="#FFC53D" opacity=".7" />
      </>
    ),
  },
  science: {
    bg: ["#E3F7EC", "#F7FFFA"],
    art: (
      <>
        <circle cx="120" cy="110" r="130" fill="#8FE3B8" opacity=".25" />
        <circle cx="690" cy="500" r="160" fill="#BBF7D0" opacity=".35" />
        {/* flask */}
        <path d="M365 150h70v110l110 190c14 24-3 54-31 54H286c-28 0-45-30-31-54l110-190V150Z" fill="#fff" stroke="#16A34A" strokeWidth="7" strokeLinejoin="round" />
        <path d="M330 340l-36 62c-14 24 3 54 31 54h150c28 0 45-30 31-54l-36-62Z" fill="#8FE3B8" />
        <path d="M365 150h70" stroke="#16A34A" strokeWidth="12" strokeLinecap="round" />
        <circle cx="388" cy="390" r="12" fill="#fff" opacity=".8" />
        <circle cx="430" cy="360" r="8" fill="#fff" opacity=".8" />
        <circle cx="404" cy="432" r="6" fill="#fff" opacity=".8" />
        {/* test tubes */}
        <g transform="translate(560 300)">
          <rect x="0" y="0" width="34" height="140" rx="17" fill="#fff" stroke="#16A34A" strokeWidth="5" />
          <rect x="4" y="60" width="26" height="76" rx="13" fill="#FFB7C9" />
          <rect x="54" y="-16" width="34" height="156" rx="17" fill="#fff" stroke="#16A34A" strokeWidth="5" />
          <rect x="58" y="44" width="26" height="92" rx="13" fill="#FFD36A" />
        </g>
        {/* molecules */}
        <g stroke="#12325C" strokeWidth="4" opacity=".45">
          <path d="M150 470l52-30 44 26" fill="none" />
          <circle cx="150" cy="470" r="10" fill="#FFC53D" stroke="none" />
          <circle cx="202" cy="440" r="10" fill="#86EFAC" stroke="none" />
          <circle cx="246" cy="466" r="10" fill="#FFB7C9" stroke="none" />
        </g>
        <path d="M640 150c-10-26-40-26-50 0-10-26-40-26-50 0" stroke="#16A34A" strokeWidth="5" fill="none" opacity=".35" />
        <path d="M205 210l8 20 20 8-20 8-8 20-8-20-20-8 20-8 8-20Z" fill="#FFC53D" opacity=".75" />
        <circle cx="620" cy="230" r="8" fill="#16A34A" opacity=".35" />
        <circle cx="680" cy="180" r="5" fill="#16A34A" opacity=".3" />
      </>
    ),
  },
  library: {
    bg: ["#E3F8EA", "#FBFDFF"],
    art: (
      <>
        <circle cx="660" cy="120" r="130" fill="#86EFAC" opacity=".3" />
        <circle cx="140" cy="500" r="150" fill="#FFC53D" opacity=".18" />
        {/* books stack */}
        <g transform="rotate(-3 400 430)">
          <rect x="245" y="420" width="310" height="42" rx="9" fill="#FF8A8A" />
          <rect x="258" y="381" width="284" height="39" rx="9" fill="#FFC53D" />
          <rect x="272" y="345" width="258" height="36" rx="9" fill="#22C55E" />
          <rect x="262" y="430" width="6" height="30" rx="3" fill="#fff" opacity=".6" />
          <rect x="300" y="433" width="18" height="16" fill="#fff" opacity=".55" />
          <rect x="275" y="391" width="18" height="18" fill="#fff" opacity=".55" />
          <rect x="291" y="354" width="16" height="17" fill="#fff" opacity=".6" />
        </g>
        {/* open book */}
        <g>
          <path d="M400 210c-52-36-118-38-160-14v190c42-24 108-22 160 14 52-36 118-38 160-14V196c-42-24-108-22-160 14Z" fill="#fff" stroke="#12325C" strokeWidth="7" strokeLinejoin="round" />
          <path d="M400 210v190" stroke="#12325C" strokeWidth="6" />
          <path d="M278 240c34-12 74-8 100 10M278 276c34-12 74-8 100 10M278 312c34-12 74-8 100 10M522 240c-34-12-74-8-100 10M522 276c-34-12-74-8-100 10M522 312c-34-12-74-8-100 10" stroke="#9FD8BC" strokeWidth="5" strokeLinecap="round" fill="none" />
        </g>
        <path d="M622 300l10 26 26 10-26 10-10 26-10-26-26-10 26-10 10-26Z" fill="#FFC53D" />
        <text x="185" y="170" fontFamily="Fredoka, sans-serif" fontSize="46" fontWeight="700" fill="#16A34A" opacity=".55">Aa</text>
        <text x="570" y="430" fontFamily="Fredoka, sans-serif" fontSize="30" fontWeight="600" fill="#E86A8A" opacity=".55">read</text>
      </>
    ),
  },
  play: {
    bg: ["#DFF6E4", "#F9FFFA"],
    art: (
      <>
        <circle cx="680" cy="100" r="110" fill="#FFC53D" opacity=".4" />
        <path d="M0 470c120-50 220 40 340 10s240-70 460-10v130H0Z" fill="#8FE3B8" opacity=".55" />
        <path d="M0 520c140-30 250 30 380 0s250-40 420 0v80H0Z" fill="#5DCE8E" opacity=".45" />
        {/* football */}
        <circle cx="390" cy="330" r="118" fill="#fff" stroke="#12325C" strokeWidth="8" />
        <path d="M390 265l54 38-20 64h-68l-20-64 54-38Z" fill="#12325C" opacity=".85" />
        <path d="M390 265v-38M444 303l42-12M424 367l28 30M356 367l-28 30M336 303l-42-12" stroke="#12325C" strokeWidth="6" strokeLinecap="round" />
        {/* cones */}
        <g transform="translate(140 430)">
          <path d="M28 0 56 90H0Z" fill="#FF9F1C" />
          <rect x="-8" y="88" width="72" height="16" rx="8" fill="#FF9F1C" />
          <rect x="14" y="46" width="28" height="12" fill="#fff" opacity=".85" />
        </g>
        <g transform="translate(610 440) scale(.8)">
          <path d="M28 0 56 90H0Z" fill="#16A34A" />
          <rect x="-8" y="88" width="72" height="16" rx="8" fill="#16A34A" />
        </g>
        <path d="M210 150l10 26 26 10-26 10-10 26-10-26-26-10 26-10 10-26Z" fill="#FFC53D" />
        <circle cx="590" cy="200" r="10" fill="#E86A8A" />
        <path d="M100 250c0-20 16-36 36-36 15 0 27 9 32 21 4-2 9-3 14-3 17 0 31 14 31 31 0 3-.5 6-1 9H100Z" fill="#fff" opacity=".9" />
      </>
    ),
  },
  computer: {
    bg: ["#E8F8EE", "#FCFDFF"],
    art: (
      <>
        <circle cx="130" cy="120" r="120" fill="#86EFAC" opacity=".3" />
        <circle cx="690" cy="480" r="150" fill="#C9B8FF" opacity=".25" />
        {/* monitor */}
        <rect x="185" y="110" width="430" height="290" rx="26" fill="#fff" stroke="#12325C" strokeWidth="8" />
        <rect x="210" y="135" width="380" height="235" rx="14" fill="#12325C" />
        <rect x="240" y="165" width="130" height="12" rx="6" fill="#FFC53D" />
        <rect x="240" y="195" width="220" height="10" rx="5" fill="#86EFAC" opacity=".8" />
        <rect x="240" y="221" width="170" height="10" rx="5" fill="#FFB7C9" opacity=".8" />
        <rect x="240" y="247" width="250" height="10" rx="5" fill="#8FE3B8" opacity=".8" />
        <circle cx="520" cy="290" r="34" fill="#FFC53D" />
        <circle cx="508" cy="282" r="4" fill="#12325C" />
        <circle cx="532" cy="282" r="4" fill="#12325C" />
        <path d="M508 298c8 10 24 10 32 0" stroke="#12325C" strokeWidth="5" strokeLinecap="round" fill="none" />
        <rect x="360" y="400" width="80" height="50" fill="#12325C" />
        <rect x="280" y="450" width="240" height="18" rx="9" fill="#12325C" />
        {/* keyboard */}
        <rect x="255" y="490" width="290" height="54" rx="12" fill="#fff" stroke="#12325C" strokeWidth="6" />
        <g fill="#12325C" opacity=".5">
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x={272 + i * 33} y="507" width="22" height="10" rx="4" />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <rect key={`b${i}`} x={288 + i * 33} y="525" width="22" height="8" rx="4" />
          ))}
        </g>
        <path d="M660 250l9 24 24 9-24 9-9 24-9-24-24-9 24-9 9-24Z" fill="#FFC53D" opacity=".8" />
        <path d="M110 380c0-14 11-25 25-25 10 0 19 6 23 15 3-1 6-2 9-2 13 0 24 11 24 24 0 2 0 4-1 6H110Z" fill="#fff" opacity=".85" />
      </>
    ),
  },
  outdoor: {
    bg: ["#E8F8EE", "#FCFFFE"],
    art: (
      <>
        <circle cx="650" cy="120" r="90" fill="#FFC53D" />
        <circle cx="650" cy="120" r="120" fill="#FFC53D" opacity=".25" />
        <path d="M0 430c120-70 250-60 370-10s250 30 430-40v220H0Z" fill="#B9EDCD" />
        <path d="M0 500c150-50 280 30 420-10s230-20 380 20v90H0Z" fill="#7ED9A3" />
        {/* school building */}
        <g>
          <rect x="250" y="270" width="300" height="200" rx="12" fill="#FFF8EA" stroke="#12325C" strokeWidth="6" />
          <path d="M230 275 400 190l170 85H230Z" fill="#16A34A" />
          <path d="M365 205h70v-40h-70Z" fill="#FFC53D" />
          <rect x="378" y="250" width="44" height="44" rx="22" fill="#FFC53D" stroke="#12325C" strokeWidth="5" />
          <path d="M400 258v14l10 6" stroke="#12325C" strokeWidth="4" strokeLinecap="round" fill="none" />
          <rect x="320" y="330" width="56" height="80" rx="8" fill="#86EFAC" stroke="#12325C" strokeWidth="5" />
          <rect x="430" y="330" width="56" height="80" rx="8" fill="#86EFAC" stroke="#12325C" strokeWidth="5" />
          <rect x="378" y="416" width="44" height="54" rx="6" fill="#16A34A" />
          <path d="M250 470h300" stroke="#12325C" strokeWidth="6" strokeLinecap="round" />
        </g>
        {/* trees */}
        <g>
          <rect x="135" y="400" width="20" height="100" rx="9" fill="#8A5A3C" />
          <circle cx="145" cy="380" r="62" fill="#4FBF7B" />
          <circle cx="100" cy="405" r="44" fill="#6ED494" />
          <rect x="645" y="410" width="18" height="90" rx="8" fill="#8A5A3C" />
          <circle cx="654" cy="390" r="55" fill="#4FBF7B" />
        </g>
        {/* kite */}
        <g transform="translate(560 220) rotate(12)">
          <path d="M0 0 48 38 0 110-48 38Z" fill="#FF8A8A" stroke="#12325C" strokeWidth="5" />
          <path d="M0 0v110M-48 38h96" stroke="#12325C" strokeWidth="4" />
          <path d="M0 110c-18 30 20 34 6 66" stroke="#12325C" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
        <path d="M540 110c14-10 28-10 42 0M600 90c10-8 22-8 32 0" stroke="#12325C" strokeWidth="4" strokeLinecap="round" fill="none" opacity=".45" />
        <path d="M90 240c0-18 14-32 32-32 13 0 24 8 29 19 4-2 8-2 12-2 15 0 27 12 27 27 0 3 0 5-1 7H90Z" fill="#fff" opacity=".95" />
        <path d="M700 270c0-14 11-25 25-25 10 0 19 6 22 14 2-1 5-1 8-1 12 0 22 9 22 21 0 2-.3 4-.8 6H700Z" fill="#fff" opacity=".8" />
      </>
    ),
  },
  school: {
    bg: ["#FFF7E8", "#FFFDF7"],
    art: (
      <>
        <circle cx="660" cy="130" r="100" fill="#FFC53D" opacity=".5" />
        <path d="M0 440c140-60 260 20 400-20s260-20 400 30v150H0Z" fill="#B9EDCD" />
        <g>
          <rect x="230" y="250" width="340" height="220" rx="16" fill="#fff" stroke="#12325C" strokeWidth="7" />
          <path d="M210 255 400 165l190 90H210Z" fill="#16A34A" />
          <rect x="370" y="190" width="60" height="30" rx="6" fill="#FFC53D" />
          <rect x="300" y="320" width="60" height="70" rx="8" fill="#FFE3A3" stroke="#12325C" strokeWidth="5" />
          <rect x="440" y="320" width="60" height="70" rx="8" fill="#FFE3A3" stroke="#12325C" strokeWidth="5" />
          <rect x="380" y="400" width="40" height="70" rx="6" fill="#16A34A" />
          <circle cx="400" cy="290" r="26" fill="#FFC53D" stroke="#12325C" strokeWidth="5" />
          <path d="M400 276v14l9 6" stroke="#12325C" strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>
        <g>
          <rect x="140" y="400" width="18" height="90" rx="8" fill="#8A5A3C" />
          <circle cx="149" cy="382" r="52" fill="#4FBF7B" />
          <rect x="650" y="410" width="18" height="80" rx="8" fill="#8A5A3C" />
          <circle cx="659" cy="392" r="46" fill="#4FBF7B" />
        </g>
        <path d="M580 180l8 22 22 8-22 8-8 22-8-22-22-8 22-8 8-22Z" fill="#FFC53D" />
        <path d="M110 160c0-18 14-32 32-32 13 0 24 8 29 19 4-2 8-2 12-2 15 0 27 12 27 27 0 3-.5 5-1 7H110Z" fill="#fff" />
        <path d="M620 320c0-14 11-25 25-25 10 0 18 6 22 14 2-1 5-1 7-1 12 0 22 9 22 21 0 2-.3 4-.8 6H620Z" fill="#fff" opacity=".9" />
      </>
    ),
  },
  art: {
    bg: ["#FFF0F6", "#FFFBFC"],
    art: (
      <>
        <circle cx="650" cy="120" r="110" fill="#FFB7C9" opacity=".5" />
        <circle cx="140" cy="480" r="150" fill="#86EFAC" opacity=".25" />
        {/* easel */}
        <path d="M290 460 400 180l110 280M330 360h180" stroke="#B98156" strokeWidth="14" strokeLinecap="round" fill="none" />
        <rect x="300" y="230" width="200" height="170" rx="10" fill="#fff" stroke="#12325C" strokeWidth="6" />
        <circle cx="370" cy="300" r="34" fill="#FFC53D" />
        <path d="M320 380c30-60 60-60 90 0" fill="#FF8A8A" />
        <path d="M400 380c24-40 50-40 74 0" fill="#86EFAC" />
        <circle cx="455" cy="285" r="18" fill="#8FE3B8" />
        {/* palette */}
        <g transform="translate(560 380)">
          <path d="M0 60c-14-50 20-90 70-90 50 0 80 40 64 74-10 22-38 8-50 22-14 16 6 34-20 40-22 6-52-20-64-46Z" fill="#FFF8EA" stroke="#12325C" strokeWidth="5" />
          <circle cx="52" cy="30" r="12" fill="#FF8A8A" />
          <circle cx="92" cy="20" r="12" fill="#FFC53D" />
          <circle cx="112" cy="56" r="12" fill="#16A34A" />
          <circle cx="45" cy="72" r="12" fill="#4FBF7B" />
        </g>
        <path d="M190 150l8 22 22 8-22 8-8 22-8-22-22-8 22-8 8-22Z" fill="#E86A8A" />
        <path d="M610 200l6 16 16 6-16 6-6 16-6-16-16-6 16-6 6-16Z" fill="#FFC53D" />
      </>
    ),
  },
  generic: {
    bg: ["#E8F8EE", "#FFFDF9"],
    art: (
      <>
        <circle cx="640" cy="140" r="120" fill="#FFC53D" opacity=".3" />
        <circle cx="160" cy="460" r="140" fill="#FFB7C9" opacity=".25" />
        <path d="M260 460c-20-170 70-280 140-280s160 110 140 280" fill="none" stroke="#16A34A" strokeWidth="10" strokeLinecap="round" />
        <circle cx="400" cy="220" r="48" fill="#FFC53D" />
        <path d="M320 460h160" stroke="#12325C" strokeWidth="10" strokeLinecap="round" />
        <path d="M590 320l10 26 26 10-26 10-10 26-10-26-26-10 26-10 10-26Z" fill="#E86A8A" />
        <path d="M180 220c0-18 14-32 32-32 13 0 24 8 29 19 4-2 8-2 12-2 15 0 27 12 27 27 0 3-.5 5-1 7H180Z" fill="#fff" />
      </>
    ),
  },
};
