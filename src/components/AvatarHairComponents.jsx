import React from 'react';

/**
 * REBUILT AVATAR HAIR ENGINE (2-LAYER MODULAR SVG SYSTEM)
 * Head center is at (cx=60, cy=54, rx=24, ry=26). Top of head is y=28.
 * 
 * Layer 1 (AvatarBackHair): Renders behind body & head (flowing long hair, braids, ponytails, hats, ears).
 * Layer 2 (AvatarFrontHair / AvatarHair): Renders on top of skull & face (seamless cap y=16..20 wrapping down to browline y=42).
 */

// ==========================================
// BACK HAIR LAYER (Rendered behind head/neck)
// ==========================================
export function AvatarBackHair({ hairId, color }) {
  switch (hairId) {
    case 'hair_long_f':
      return (
        <path d="M26,52 C24,76 22,100 36,120 L84,120 C98,100 96,76 94,52 Z" fill={color} />
      );
    case 'hair_bob_f':
      return (
        <path d="M30,52 C26,72 26,88 38,94 C46,96 74,96 82,94 C94,88 94,72 90,52 Z" fill={color} />
      );
    case 'hair_bangs_f':
      return (
        <path d="M26,52 C24,76 22,100 36,120 L84,120 C98,100 96,76 94,52 Z" fill={color} />
      );
    case 'hair_curly_free':
      return (
        <g fill={color}>
          <circle cx="34" cy="46" r="16" />
          <circle cx="86" cy="46" r="16" />
          <circle cx="28" cy="62" r="14" />
          <circle cx="92" cy="62" r="14" />
          <circle cx="34" cy="78" r="14" />
          <circle cx="86" cy="78" r="14" />
        </g>
      );
    case 'hair_ponytail_f':
      return (
        <g>
          <circle cx="60" cy="16" r="9" fill={color} />
          <path d="M52,18 C40,6 28,16 38,32 Z" fill={color} />
          <path d="M68,18 C80,6 92,16 82,32 Z" fill={color} />
        </g>
      );
    case 'hair_braids':
      return (
        <g fill={color}>
          <rect x="26" y="50" width="6" height="50" rx="3" />
          <rect x="88" y="50" width="6" height="50" rx="3" />
          <rect x="20" y="54" width="6" height="42" rx="3" />
          <rect x="94" y="54" width="6" height="42" rx="3" />
        </g>
      );
    case 'hair_topknot':
      return (
        <g>
          <circle cx="60" cy="16" r="8" fill={color} />
          <rect x="55" y="22" width="10" height="5" fill="#ffd700" rx="1" />
        </g>
      );
    case 'hair_cat_ears':
      return (
        <g>
          <polygon points="36,40 26,14 46,28" fill={color} />
          <polygon points="29,18 36,37 43,28" fill="#ffb3ba" />
          <polygon points="84,40 94,14 74,32" fill={color} />
          <polygon points="91,18 84,37 77,28" fill="#ffb3ba" />
        </g>
      );
    case 'hair_4': // Chapéu de Mago
      return (
        <g>
          <polygon points="60,4 30,42 90,42" fill="#3b1d54" stroke="#ffd700" strokeWidth="1.8" />
          <ellipse cx="60" cy="42" rx="36" ry="7" fill="#4a2269" stroke="#ffd700" strokeWidth="1.8" />
          <circle cx="60" cy="24" r="3.5" fill="#ffd700" />
        </g>
      );
    case 'hair_crown': // Coroa
      return (
        <g>
          <path d="M36,41 L41,23 L52,32 L60,16 L68,32 L79,23 L84,41 Z" fill="#ffd700" stroke="#b8960c" strokeWidth="1.8" />
          <circle cx="60" cy="28" r="3" fill="#e74c3c" />
          <circle cx="46" cy="30" r="2.2" fill="#3498db" />
          <circle cx="74" cy="30" r="2.2" fill="#3498db" />
        </g>
      );
    default:
      return null;
  }
}

// ==========================================
// FRONT HAIR CAP LAYER (Rendered on top of scalp/face)
// ==========================================

// 1. Raspado / Buzzcut
export function Hair1({ color }) {
  return (
    <path d="M32,56 C30,22 90,22 88,56 C80,48 70,44 60,44 C50,44 40,48 32,56 Z" fill={color} opacity="0.35" />
  );
}

// 2. Curto Social Masculino
export function HairShortM({ color }) {
  return (
    <g>
      {/* Outer dome wraps y=16 (well above skull top y=28), inner arc curves at y=42 */}
      <path d="M32,56 C30,16 90,16 88,56 C82,46 72,43 60,44 C48,43 38,46 32,56 Z" fill={color} />
      {/* Sideburns */}
      <polygon points="32,52 32,60 36,56" fill={color} />
      <polygon points="88,52 88,60 84,56" fill={color} />
      {/* Parted Bangs */}
      <path d="M32,56 C40,44 50,43 60,45 C70,43 80,44 88,56 C78,48 60,47 32,56 Z" fill={color} />
      <path d="M42,28 Q58,24 76,29" stroke="rgba(255,255,255,0.25)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </g>
  );
}

// 3. Topete Ondulado Masculino
export function HairWavyM({ color }) {
  return (
    <g>
      <path d="M32,56 C26,10 50,8 66,8 C84,8 92,16 88,56 C80,45 70,43 58,43 C46,43 38,45 32,56 Z" fill={color} />
      <polygon points="32,52 32,60 36,56" fill={color} />
      <polygon points="88,52 88,60 84,56" fill={color} />
      <path d="M40,22 Q58,14 76,18" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round" fill="none" />
    </g>
  );
}

// 4. Degradê Moderno Masculino
export function HairShortFade({ color }) {
  return (
    <g>
      <path d="M34,52 C32,16 90,16 88,52 C78,44 60,43 34,52 Z" fill={color} />
      <path d="M32,56 L35,46 L35,56 Z" fill={color} opacity="0.45" />
      <path d="M88,56 L85,46 L85,56 Z" fill={color} opacity="0.45" />
    </g>
  );
}

// 5. Undercut Moderno
export function HairUndercut({ color }) {
  return (
    <g>
      <path d="M34,52 C28,12 54,8 68,8 C88,10 90,20 86,52 C76,43 56,41 34,52 Z" fill={color} />
      <path d="M32,56 L35,46 L35,56 Z" fill={color} opacity="0.4" />
      <path d="M88,56 L85,46 L85,56 Z" fill={color} opacity="0.4" />
    </g>
  );
}

// 6. Longo Feminino Liso
export function HairLongF({ color }) {
  return (
    <g>
      <path d="M32,56 C30,16 90,16 88,56 C80,45 60,42 32,56 Z" fill={color} />
      <path d="M32,54 C30,70 30,95 38,118 L45,118 L37,70 L37,54 Z" fill={color} />
      <path d="M88,54 C90,70 90,95 82,118 L75,118 L83,70 L83,54 Z" fill={color} />
    </g>
  );
}

// 7. Chanel / Bob Feminino
export function HairBobF({ color }) {
  return (
    <g>
      <path d="M32,56 C30,16 90,16 88,56 C91,72 84,78 79,76 C79,60 76,44 60,42 C44,44 41,60 41,76 C36,78 29,72 32,56 Z" fill={color} />
    </g>
  );
}

// 8. Franja Reta Feminina
export function HairBangsF({ color }) {
  return (
    <g>
      <path d="M32,56 C30,16 90,16 88,56 C91,72 84,78 79,76 C79,60 76,44 60,42 C44,44 41,60 41,76 C36,78 29,72 32,56 Z" fill={color} />
      <path d="M34,45 L86,45 L86,38 L34,38 Z" fill={color} />
    </g>
  );
}

// 9. Cachos Volumosos
export function HairCurlyFree({ color }) {
  return (
    <g fill={color}>
      <circle cx="44" cy="22" r="13" />
      <circle cx="60" cy="18" r="14" />
      <circle cx="76" cy="22" r="13" />
      <path d="M34,47 Q60,38 86,47 Q60,42 34,47 Z" />
    </g>
  );
}

// 10. Rabo de Cavalo Elegante
export function HairPonytailF({ color }) {
  return (
    <g>
      <path d="M32,56 C30,16 90,16 88,56 C80,45 60,42 32,56 Z" fill={color} />
    </g>
  );
}

// 11. Tranças Afro
export function HairBraids({ color }) {
  return (
    <g fill={color}>
      <path d="M32,50 C30,16 90,16 88,50 Z" />
      <path d="M32,50 Q60,42 88,50 Q60,45 32,50 Z" />
    </g>
  );
}

// 12. Coque Samurai
export function HairTopknot({ color }) {
  return (
    <g>
      <path d="M32,56 C30,16 90,16 88,56 C80,45 60,42 32,56 Z" fill={color} />
    </g>
  );
}

// 13. Tiara & Orelhas de Gato
export function HairCatEars({ color }) {
  return (
    <g>
      <path d="M33,44 Q60,32 87,44" fill="none" stroke="#222" strokeWidth="3.5" />
      <path d="M32,54 C30,16 90,16 88,54 C80,45 60,42 32,54 Z" fill={color} />
    </g>
  );
}

// 14. Chapéu de Mago Místico
export function HairWizard() {
  return null;
}

// 15. Faixa de Folhas Sagradas
export function HairLaurel({ color }) {
  return (
    <g>
      <path d="M32,54 C30,16 90,16 88,54 C80,45 60,42 32,54 Z" fill={color} />
      <path d="M33,44 Q60,35 87,44" fill="none" stroke="#6d4c2e" strokeWidth="3.5" />
      <path d="M39,38 C39,38 48,26 57,38 Z" fill="#4a7c59" />
      <path d="M81,38 C81,38 72,26 63,38 Z" fill="#4a7c59" />
    </g>
  );
}

// 16. Coroa Dourada de Louros
export function HairCrown({ color }) {
  return (
    <g>
      <path d="M32,54 C30,16 90,16 88,54 C80,45 60,42 32,54 Z" fill={color} />
    </g>
  );
}

// Master Hair Component Resolver (Front Cap)
export function AvatarHair({ hairId, color }) {
  switch (hairId) {
    case 'hair_short_m': return <HairShortM color={color} />;
    case 'hair_wavy_m': return <HairWavyM color={color} />;
    case 'hair_short_fade': return <HairShortFade color={color} />;
    case 'hair_2': return <HairUndercut color={color} />;
    case 'hair_long_f': return <HairLongF color={color} />;
    case 'hair_bob_f': return <HairBobF color={color} />;
    case 'hair_bangs_f': return <HairBangsF color={color} />;
    case 'hair_curly_free': return <HairCurlyFree color={color} />;
    case 'hair_ponytail_f': return <HairPonytailF color={color} />;
    case 'hair_braids': return <HairBraids color={color} />;
    case 'hair_topknot': return <HairTopknot color={color} />;
    case 'hair_cat_ears': return <HairCatEars color={color} />;
    case 'hair_4': return <HairWizard />;
    case 'hair_5': return <HairLaurel color={color} />;
    case 'hair_crown': return <HairCrown color={color} />;
    case 'hair_1':
    default:
      return <Hair1 color={color} />;
  }
}
