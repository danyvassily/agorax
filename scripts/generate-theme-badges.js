const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../public/images/themes');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const THEMES = [
  {
    id: 'culture-generale',
    bg: ['#ffaa00', '#ff7700', '#d94b00'],
    icon: `
      <!-- Ampoule 3D & Livre -->
      <path d="M256,120 C200,120 160,165 160,215 C160,250 185,280 205,310 L205,335 L307,335 L307,310 C327,280 352,250 352,215 C352,165 312,120 256,120 Z" fill="#ffe066" stroke="#d49400" stroke-width="6" />
      <ellipse cx="256" cy="205" rx="35" ry="45" fill="#fff9db" opacity="0.8" />
      <rect x="215" y="340" width="82" height="16" rx="6" fill="#adb5bd" />
      <rect x="225" y="360" width="62" height="14" rx="5" fill="#868e96" />
      <path d="M236,378 Q256,392 276,378" fill="none" stroke="#495057" stroke-width="8" stroke-linecap="round" />
      <!-- Rayons lumineux -->
      <line x1="256" y1="75" x2="256" y2="95" stroke="#ffe066" stroke-width="10" stroke-linecap="round" />
      <line x1="140" y1="125" x2="160" y2="140" stroke="#ffe066" stroke-width="10" stroke-linecap="round" />
      <line x1="372" y1="125" x2="352" y2="140" stroke="#ffe066" stroke-width="10" stroke-linecap="round" />
      <line x1="100" y1="215" x2="125" y2="215" stroke="#ffe066" stroke-width="10" stroke-linecap="round" />
      <line x1="412" y1="215" x2="387" y2="215" stroke="#ffe066" stroke-width="10" stroke-linecap="round" />
    `
  },
  {
    id: 'geographie',
    bg: ['#20c997', '#099268', '#087f5b'],
    icon: `
      <!-- Globe 3D -->
      <circle cx="256" cy="245" r="115" fill="#339af0" stroke="#1c7ed6" stroke-width="6" />
      <!-- Continents en vert -->
      <path d="M190,180 Q215,150 250,170 Q280,185 270,225 Q250,260 215,245 Q175,230 190,180 Z" fill="#51cf66" />
      <path d="M290,240 Q330,220 345,260 Q340,300 300,310 Q270,290 290,240 Z" fill="#51cf66" />
      <path d="M180,285 Q205,270 220,305 Q210,335 185,335 Z" fill="#51cf66" />
      <!-- Support & Pied de globe -->
      <path d="M140,245 A125,125 0 0,0 365,275" fill="none" stroke="#ffd43b" stroke-width="14" stroke-linecap="round" />
      <path d="M256,365 L256,400" stroke="#ffd43b" stroke-width="18" stroke-linecap="round" />
      <rect x="200" y="395" width="112" height="22" rx="10" fill="#fab005" />
    `
  },
  {
    id: 'histoire',
    bg: ['#fab005', '#e67700', '#b85300'],
    icon: `
      <!-- Colonne antique & Sablier -->
      <rect x="180" y="160" width="152" height="24" rx="6" fill="#f8f9fa" stroke="#ced4da" stroke-width="4" />
      <rect x="195" y="184" width="22" height="170" rx="4" fill="#e9ecef" />
      <rect x="245" y="184" width="22" height="170" rx="4" fill="#e9ecef" />
      <rect x="295" y="184" width="22" height="170" rx="4" fill="#e9ecef" />
      <rect x="170" y="354" width="172" height="28" rx="6" fill="#f8f9fa" stroke="#ced4da" stroke-width="4" />
      <!-- Sablier flottant doré -->
      <g transform="translate(290, 200) rotate(15)">
        <polygon points="20,10 80,10 50,55" fill="#ffd43b" stroke="#f59f00" stroke-width="4" />
        <polygon points="20,100 80,100 50,55" fill="#ffd43b" stroke="#f59f00" stroke-width="4" />
        <line x1="15" y1="8" x2="85" y2="8" stroke="#f08c00" stroke-width="8" stroke-linecap="round" />
        <line x1="15" y1="102" x2="85" y2="102" stroke="#f08c00" stroke-width="8" stroke-linecap="round" />
      </g>
    `
  },
  {
    id: 'cinema',
    bg: ['#ff6b6b', '#e03131', '#9b111e'],
    icon: `
      <!-- Clap de cinéma -->
      <g transform="translate(136, 150) rotate(-6)">
        <rect x="10" y="65" width="230" height="145" rx="16" fill="#212529" stroke="#495057" stroke-width="4" />
        <g transform="translate(0, 15) rotate(-14)">
          <rect x="5" y="10" width="240" height="42" rx="10" fill="#212529" stroke="#495057" stroke-width="4" />
          <polygon points="35,12 60,12 40,50 15,50" fill="#ffffff" />
          <polygon points="85,12 110,12 90,50 65,50" fill="#ffffff" />
          <polygon points="135,12 160,12 140,50 115,50" fill="#ffffff" />
          <polygon points="185,12 210,12 190,50 165,50" fill="#ffffff" />
        </g>
        <!-- Lignes du clap -->
        <polygon points="40,65 65,65 45,95 20,95" fill="#ffffff" />
        <polygon points="90,65 115,65 95,95 70,95" fill="#ffffff" />
        <polygon points="140,65 165,65 145,95 120,95" fill="#ffffff" />
        <polygon points="190,65 215,65 195,95 170,95" fill="#ffffff" />
        <!-- Étoile d'or -->
        <polygon points="125,125 133,145 155,145 137,158 144,178 125,165 106,178 113,158 95,145 117,145" fill="#ffd43b" />
      </g>
    `
  },
  {
    id: 'series',
    bg: ['#f06595', '#d6336c', '#a61e4d'],
    icon: `
      <!-- Télévision vintage 3D -->
      <rect x="135" y="165" width="242" height="175" rx="26" fill="#343a40" stroke="#ff8787" stroke-width="6" />
      <rect x="155" y="185" width="150" height="135" rx="14" fill="#22b8cf" />
      <!-- Écran reflet -->
      <path d="M165,195 L225,195 L175,285 Z" fill="#ffffff" opacity="0.3" />
      <!-- Boutons TV -->
      <circle cx="340" cy="215" r="15" fill="#ff6b6b" />
      <circle cx="340" cy="260" r="15" fill="#ffd43b" />
      <rect x="325" y="295" width="30" height="8" rx="4" fill="#adb5bd" />
      <!-- Antennes -->
      <line x1="210" y1="165" x2="160" y2="105" stroke="#f8f9fa" stroke-width="8" stroke-linecap="round" />
      <line x1="300" y1="165" x2="350" y2="105" stroke="#f8f9fa" stroke-width="8" stroke-linecap="round" />
      <!-- Pieds TV -->
      <line x1="175" y1="340" x2="155" y2="385" stroke="#495057" stroke-width="12" stroke-linecap="round" />
      <line x1="337" y1="340" x2="357" y2="385" stroke="#495057" stroke-width="12" stroke-linecap="round" />
    `
  },
  {
    id: 'musique',
    bg: ['#cc5de8', '#ae3ec9', '#862e9c'],
    icon: `
      <!-- Disque vinyle & Casque audio -->
      <circle cx="256" cy="256" r="115" fill="#212529" stroke="#495057" stroke-width="4" />
      <circle cx="256" cy="256" r="85" fill="none" stroke="#343a40" stroke-width="3" />
      <circle cx="256" cy="256" r="60" fill="none" stroke="#343a40" stroke-width="3" />
      <circle cx="256" cy="256" r="42" fill="#ff6b6b" />
      <circle cx="256" cy="256" r="10" fill="#ffffff" />
      <!-- Casque arceau -->
      <path d="M125,260 A135,135 0 0,1 387,260" fill="none" stroke="#ffd43b" stroke-width="18" stroke-linecap="round" />
      <!-- Écouteurs -->
      <rect x="110" y="235" width="32" height="70" rx="16" fill="#fab005" />
      <rect x="370" y="235" width="32" height="70" rx="16" fill="#fab005" />
      <!-- Notes de musique lumineuses -->
      <path d="M340,135 L380,120 L380,165 M340,145 L340,185" fill="none" stroke="#ff922b" stroke-width="6" stroke-linecap="round" />
      <ellipse cx="330" cy="188" rx="14" ry="10" fill="#ff922b" />
      <ellipse cx="370" cy="168" rx="14" ry="10" fill="#ff922b" />
    `
  },
  {
    id: 'manga-anime',
    bg: ['#ff922b', '#f76707', '#d9480f'],
    icon: `
      <!-- Bandeau Shōnen & Étoile / Nuage -->
      <path d="M110,240 Q256,215 402,240 L395,295 Q256,270 117,295 Z" fill="#212529" />
      <!-- Plaque frontale métallique -->
      <rect x="180" y="228" width="152" height="52" rx="10" fill="#e9ecef" stroke="#adb5bd" stroke-width="4" />
      <!-- Étoile gravée -->
      <polygon points="256,236 261,248 274,248 263,256 267,268 256,260 245,268 249,256 238,248 251,248" fill="#e03131" />
      <!-- Shuriken étincelant en haut -->
      <g transform="translate(256, 140) rotate(25)">
        <polygon points="0,-45 10,-10 45,0 10,10 0,45 -10,10 -45,0 -10,-10" fill="#ffd43b" />
        <circle cx="0" cy="0" r="8" fill="#212529" />
      </g>
    `
  },
  {
    id: 'gaming',
    bg: ['#845ef7', '#7048e8', '#5f3dc4'],
    icon: `
      <!-- Manette de jeu rétro 3D -->
      <rect x="125" y="175" width="262" height="155" rx="55" fill="#343a40" stroke="#a55eea" stroke-width="6" />
      <!-- Poignées ergonomiques -->
      <circle cx="160" cy="300" r="32" fill="#343a40" />
      <circle cx="352" cy="300" r="32" fill="#343a40" />
      <!-- Croix directionnelle D-pad -->
      <path d="M175,225 L195,225 L195,205 L215,205 L215,225 L235,225 L235,245 L215,245 L215,265 L195,265 L195,245 L175,245 Z" fill="#495057" />
      <!-- Boutons d'action colorés -->
      <circle cx="315" cy="235" r="14" fill="#51cf66" />
      <circle cx="345" cy="205" r="14" fill="#ff6b6b" />
      <circle cx="345" cy="265" r="14" fill="#ffd43b" />
      <circle cx="375" cy="235" r="14" fill="#339af0" />
      <!-- Leds centrales -->
      <ellipse cx="256" cy="225" rx="16" ry="6" fill="#20c997" />
    `
  },
  {
    id: 'science',
    bg: ['#22b8cf', '#15aabf', '#0c8599'],
    icon: `
      <!-- Fiole de laboratoire & Atome 3D -->
      <!-- Atome en fond -->
      <ellipse cx="256" cy="256" rx="130" ry="40" fill="none" stroke="#66d9e8" stroke-width="5" transform="rotate(30 256 256)" opacity="0.6" />
      <ellipse cx="256" cy="256" rx="130" ry="40" fill="none" stroke="#66d9e8" stroke-width="5" transform="rotate(-30 256 256)" opacity="0.6" />
      <!-- Fiole Erlenmeyer -->
      <path d="M236,130 L276,130 L276,170 L340,300 A35,35 0 0,1 310,345 L202,345 A35,35 0 0,1 172,300 L236,170 Z" fill="#f8f9fa" stroke="#e9ecef" stroke-width="8" opacity="0.9" />
      <!-- Liquide chimique turquoise -->
      <path d="M190,300 Q256,285 322,300 L308,335 A15,15 0 0,1 295,345 L217,345 A15,15 0 0,1 204,335 Z" fill="#20c997" />
      <!-- Bulles de science -->
      <circle cx="256" cy="285" r="8" fill="#ffffff" opacity="0.8" />
      <circle cx="235" cy="245" r="6" fill="#ffffff" opacity="0.8" />
      <circle cx="265" cy="215" r="5" fill="#ffffff" opacity="0.8" />
    `
  },
  {
    id: 'technologie',
    bg: ['#4dabf7', '#339af0', '#1c7ed6'],
    icon: `
      <!-- Microprocesseur 3D & Circuits -->
      <rect x="165" y="165" width="182" height="182" rx="24" fill="#212529" stroke="#74c0fc" stroke-width="6" />
      <rect x="200" y="200" width="112" height="112" rx="12" fill="#1c7ed6" />
      <!-- Cœur du CPU -->
      <polygon points="256,220 286,256 256,292 226,256" fill="#69db7c" />
      <!-- Pins dorés extérieurs -->
      <line x1="200" y1="165" x2="200" y2="135" stroke="#ffd43b" stroke-width="8" stroke-linecap="round" />
      <line x1="256" y1="165" x2="256" y2="135" stroke="#ffd43b" stroke-width="8" stroke-linecap="round" />
      <line x1="312" y1="165" x2="312" y2="135" stroke="#ffd43b" stroke-width="8" stroke-linecap="round" />
      <line x1="200" y1="347" x2="200" y2="377" stroke="#ffd43b" stroke-width="8" stroke-linecap="round" />
      <line x1="256" y1="347" x2="256" y2="377" stroke="#ffd43b" stroke-width="8" stroke-linecap="round" />
      <line x1="312" y1="347" x2="312" y2="377" stroke="#ffd43b" stroke-width="8" stroke-linecap="round" />
      <line x1="165" y1="200" x2="135" y2="200" stroke="#ffd43b" stroke-width="8" stroke-linecap="round" />
      <line x1="165" y1="256" x2="135" y2="256" stroke="#ffd43b" stroke-width="8" stroke-linecap="round" />
      <line x1="165" y1="312" x2="135" y2="312" stroke="#ffd43b" stroke-width="8" stroke-linecap="round" />
      <line x1="347" y1="200" x2="377" y2="200" stroke="#ffd43b" stroke-width="8" stroke-linecap="round" />
      <line x1="347" y1="256" x2="377" y2="256" stroke="#ffd43b" stroke-width="8" stroke-linecap="round" />
      <line x1="347" y1="312" x2="377" y2="312" stroke="#ffd43b" stroke-width="8" stroke-linecap="round" />
    `
  },
  {
    id: 'internet',
    bg: ['#38d9a9', '#12b886', '#0ca678'],
    icon: `
      <!-- Planète réseau & Ondes Wi-Fi -->
      <circle cx="256" cy="275" r="85" fill="#1864ab" stroke="#4dabf7" stroke-width="4" />
      <ellipse cx="256" cy="275" rx="85" ry="30" fill="none" stroke="#74c0fc" stroke-width="3" />
      <line x1="256" y1="190" x2="256" y2="360" stroke="#74c0fc" stroke-width="3" />
      <!-- Ondes Wi-Fi -->
      <path d="M195,145 A85,85 0 0,1 317,145" fill="none" stroke="#ffd43b" stroke-width="8" stroke-linecap="round" />
      <path d="M215,175 A55,55 0 0,1 297,175" fill="none" stroke="#ffd43b" stroke-width="8" stroke-linecap="round" />
      <circle cx="256" cy="205" r="7" fill="#ffd43b" />
    `
  },
  {
    id: 'mythologie-grecque',
    bg: ['#fcc419', '#fab005', '#e67700'],
    icon: `
      <!-- Éclair de Zeus & Couronne -->
      <!-- Éclair d'or -->
      <polygon points="275,100 175,245 245,245 215,385 335,215 265,215" fill="#fff3bf" stroke="#ffd43b" stroke-width="8" filter="drop-shadow(0 0 10px #ffe066)" />
      <!-- Lauriers dorés en arc -->
      <path d="M140,290 Q120,350 190,390" fill="none" stroke="#ffd43b" stroke-width="8" stroke-linecap="round" />
      <path d="M372,290 Q392,350 322,390" fill="none" stroke="#ffd43b" stroke-width="8" stroke-linecap="round" />
    `
  },
  {
    id: 'philosophie',
    bg: ['#b197fc', '#9775fa', '#7950f2'],
    icon: `
      <!-- Penseur / Esprit en réflexion -->
      <circle cx="256" cy="180" r="50" fill="#f8f9fa" stroke="#d0bfff" stroke-width="4" />
      <!-- Prisme géométrique et lueur -->
      <polygon points="256,250 190,360 322,360" fill="#6741d9" stroke="#d0bfff" stroke-width="6" />
      <circle cx="256" cy="305" r="24" fill="#ffd43b" />
      <!-- Étoile d'éveil -->
      <path d="M256,85 L260,110 L285,114 L260,118 L256,143 L252,118 L227,114 L252,110 Z" fill="#ffd43b" />
    `
  },
  {
    id: 'sport',
    bg: ['#ff8787', '#fa5252', '#e03131'],
    icon: `
      <!-- Trophée coupe d'or & Médaille -->
      <path d="M185,160 L327,160 L307,265 A50,50 0 0,1 205,265 Z" fill="#ffd43b" stroke="#f59f00" stroke-width="6" />
      <!-- Anses du trophée -->
      <path d="M185,175 Q135,185 155,235 Q175,270 205,265" fill="none" stroke="#ffd43b" stroke-width="8" stroke-linecap="round" />
      <path d="M327,175 Q377,185 357,235 Q337,270 307,265" fill="none" stroke="#ffd43b" stroke-width="8" stroke-linecap="round" />
      <!-- Pied du trophée -->
      <rect x="246" y="275" width="20" height="45" fill="#f59f00" />
      <rect x="210" y="320" width="92" height="35" rx="8" fill="#343a40" />
      <!-- Étoile victorieuse -->
      <polygon points="256,185 262,202 280,202 265,213 271,230 256,219 241,230 247,213 232,202 250,202" fill="#ffffff" />
    `
  },
  {
    id: 'football',
    bg: ['#69db7c', '#40c057', '#2f9e44'],
    icon: `
      <!-- Ballon de foot 3D -->
      <circle cx="256" cy="256" r="115" fill="#f8f9fa" stroke="#ced4da" stroke-width="6" />
      <!-- Pentagone central -->
      <polygon points="256,210 295,238 280,285 232,285 217,238" fill="#212529" />
      <!-- Lignes de coutures -->
      <line x1="256" y1="210" x2="256" y2="160" stroke="#212529" stroke-width="5" />
      <line x1="295" y1="238" x2="345" y2="225" stroke="#212529" stroke-width="5" />
      <line x1="280" y1="285" x2="315" y2="330" stroke="#212529" stroke-width="5" />
      <line x1="232" y1="285" x2="197" y2="330" stroke="#212529" stroke-width="5" />
      <line x1="217" y1="238" x2="167" y2="225" stroke="#212529" stroke-width="5" />
      <!-- Étoile d'or champion -->
      <polygon points="256,105 261,118 274,118 263,126 267,138 256,130 245,138 249,126 238,118 251,118" fill="#ffd43b" />
    `
  },
  {
    id: 'food',
    bg: ['#ffa94d', '#ff922b', '#fd7e14'],
    icon: `
      <!-- Bol de ramen fumant & Burger -->
      <path d="M160,260 Q256,230 352,260 L330,340 A60,60 0 0,1 182,340 Z" fill="#e03131" stroke="#c92a2a" stroke-width="6" />
      <ellipse cx="256" cy="255" rx="94" ry="24" fill="#fff3bf" />
      <!-- Baguettes -->
      <line x1="190" y1="210" x2="350" y2="170" stroke="#d9480f" stroke-width="8" stroke-linecap="round" />
      <line x1="185" y1="225" x2="350" y2="185" stroke="#d9480f" stroke-width="8" stroke-linecap="round" />
      <!-- Vapeur gourmande -->
      <path d="M225,185 Q215,160 230,135" fill="none" stroke="#f8f9fa" stroke-width="6" stroke-linecap="round" opacity="0.7" />
      <path d="M256,180 Q246,155 261,130" fill="none" stroke="#f8f9fa" stroke-width="6" stroke-linecap="round" opacity="0.7" />
      <path d="M287,185 Q277,160 292,135" fill="none" stroke="#f8f9fa" stroke-width="6" stroke-linecap="round" opacity="0.7" />
    `
  },
  {
    id: 'voyage',
    bg: ['#3bc9db', '#1098ad', '#0b7285'],
    icon: `
      <!-- Valise rétro & Boussole -->
      <rect x="155" y="195" width="202" height="150" rx="22" fill="#f76707" stroke="#d9480f" stroke-width="6" />
      <rect x="195" y="195" width="18" height="150" fill="#212529" />
      <rect x="299" y="195" width="18" height="150" fill="#212529" />
      <!-- Poignée valise -->
      <path d="M220,195 L220,165 A16,16 0 0,1 252,149 L260,149 A16,16 0 0,1 292,165 L292,195" fill="none" stroke="#495057" stroke-width="8" />
      <!-- Avion voyageur -->
      <g transform="translate(325, 140) rotate(20)">
        <polygon points="30,0 0,20 10,0 0,-20" fill="#ffffff" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))" />
      </g>
    `
  },
  {
    id: 'art',
    bg: ['#e599f7', '#da77f2', '#be4bdb'],
    icon: `
      <!-- Palette de peintre & Pinceau -->
      <path d="M160,250 C130,200 200,140 270,150 C340,160 370,220 350,280 C330,340 270,360 230,340 C200,325 180,345 155,320 C135,295 150,270 160,250 Z" fill="#ffd8a8" stroke="#f76707" stroke-width="6" />
      <circle cx="190" cy="300" r="16" fill="#be4bdb" opacity="0.4" />
      <!-- Taches de peinture vives -->
      <circle cx="210" cy="190" r="16" fill="#ff6b6b" />
      <circle cx="265" cy="180" r="16" fill="#339af0" />
      <circle cx="315" cy="210" r="16" fill="#51cf66" />
      <circle cx="320" cy="270" r="16" fill="#ffd43b" />
      <!-- Pinceau en travers -->
      <g transform="translate(180, 200) rotate(-45)">
        <rect x="0" y="0" width="16" height="150" rx="6" fill="#862e9c" />
        <rect x="0" y="150" width="16" height="25" fill="#ced4da" />
        <path d="M0,175 L8,205 L16,175 Z" fill="#ff6b6b" />
      </g>
    `
  },
  {
    id: 'litterature',
    bg: ['#d8f5a2', '#94d82d', '#74b816'],
    icon: `
      <!-- Pile de livres & Plume -->
      <rect x="160" y="295" width="192" height="42" rx="8" fill="#e03131" />
      <rect x="180" y="295" width="15" height="42" fill="#ffd43b" />
      <rect x="175" y="245" width="170" height="40" rx="8" fill="#1c7ed6" />
      <rect x="200" y="245" width="15" height="40" fill="#ffd43b" />
      <rect x="190" y="195" width="150" height="40" rx="8" fill="#f76707" />
      <!-- Plume dorée -->
      <g transform="translate(315, 130) rotate(30)">
        <path d="M0,0 Q30,40 10,120 Q0,80 0,0" fill="#ffd43b" stroke="#f59f00" stroke-width="3" />
        <line x1="0" y1="0" x2="10" y2="120" stroke="#f08c00" stroke-width="3" />
      </g>
    `
  },
  {
    id: 'insolite',
    bg: ['#ffe066', '#ffd43b', '#fab005'],
    icon: `
      <!-- Boîte mystère & Étoiles -->
      <rect x="155" y="195" width="202" height="155" rx="24" fill="#e8590c" stroke="#d9480f" stroke-width="6" />
      <!-- Point d'interrogation 3D -->
      <text x="256" y="315" font-family="Arial, sans-serif" font-size="120" font-weight="900" fill="#ffffff" text-anchor="middle" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))">?</text>
      <!-- Étincelles magiques -->
      <polygon points="150,150 156,165 171,165 159,174 163,189 150,180 137,189 141,174 129,165 144,165" fill="#ffffff" />
      <polygon points="360,160 365,172 377,172 367,180 371,192 360,184 349,192 353,180 343,172 355,172" fill="#ffffff" />
    `
  },
  {
    id: 'politique',
    bg: ['#748ffc', '#4c6ef5', '#3b5bdb'],
    icon: `
      <!-- Urne électorale 3D & Bulletin -->
      <rect x="165" y="215" width="182" height="145" rx="16" fill="#f8f9fa" stroke="#ced4da" stroke-width="6" />
      <rect x="150" y="195" width="212" height="28" rx="8" fill="#343a40" />
      <!-- Fente de l'urne -->
      <rect x="206" y="204" width="100" height="10" rx="5" fill="#212529" />
      <!-- Bulletin glissant dans l'urne -->
      <rect x="226" y="145" width="60" height="75" rx="6" fill="#51cf66" stroke="#40c057" stroke-width="4" transform="rotate(-6 256 182)" />
      <polygon points="256,165 260,175 270,175 262,182 265,192 256,185 247,192 250,182 242,175 252,175" fill="#ffd43b" />
    `
  },
  {
    id: 'animaux',
    bg: ['#8ce99a', '#51cf66', '#37b24d'],
    icon: `
      <!-- Empreinte de patte 3D stylisée -->
      <ellipse cx="256" cy="285" rx="58" ry="46" fill="#ffd43b" stroke="#f59f00" stroke-width="5" />
      <!-- 4 coussinets -->
      <circle cx="185" cy="210" r="24" fill="#ffd43b" stroke="#f59f00" stroke-width="4" />
      <circle cx="230" cy="175" r="25" fill="#ffd43b" stroke="#f59f00" stroke-width="4" />
      <circle cx="282" cy="175" r="25" fill="#ffd43b" stroke="#f59f00" stroke-width="4" />
      <circle cx="327" cy="210" r="24" fill="#ffd43b" stroke="#f59f00" stroke-width="4" />
    `
  },
  {
    id: 'jeux-de-societe',
    bg: ['#ff8787', '#f03e3e', '#c92a2a'],
    icon: `
      <!-- Dés de jeu 3D -->
      <!-- Dé 1 -->
      <rect x="155" y="195" width="100" height="100" rx="20" fill="#f8f9fa" stroke="#ced4da" stroke-width="5" transform="rotate(-12 205 245)" />
      <circle cx="180" cy="225" r="8" fill="#e03131" />
      <circle cx="205" cy="245" r="8" fill="#e03131" />
      <circle cx="230" cy="265" r="8" fill="#e03131" />
      <!-- Dé 2 -->
      <rect x="255" y="195" width="100" height="100" rx="20" fill="#ffd43b" stroke="#f59f00" stroke-width="5" transform="rotate(15 305 245)" />
      <circle cx="285" cy="225" r="8" fill="#212529" />
      <circle cx="325" cy="225" r="8" fill="#212529" />
      <circle cx="285" cy="265" r="8" fill="#212529" />
      <circle cx="325" cy="265" r="8" fill="#212529" />
    `
  },
  {
    id: 'comics-bd',
    bg: ['#ffd43b', '#f59f00', '#e67700'],
    icon: `
      <!-- Bulle explosive BD / POW! -->
      <polygon points="256,120 286,165 340,140 330,195 385,210 345,250 380,290 325,300 325,355 275,335 245,385 225,335 175,355 175,300 120,290 155,250 115,210 170,195 160,140 214,165" fill="#e03131" stroke="#212529" stroke-width="8" />
      <!-- Étoile jaune intérieure -->
      <polygon points="256,160 275,195 315,180 305,220 345,235 315,265 340,295 300,300 300,340 265,320 245,355 230,320 195,340 195,300 155,295 180,265 150,235 190,220 180,180 220,195" fill="#ffd43b" />
      <text x="256" y="275" font-family="'Impact', Arial Black, sans-serif" font-size="52" font-weight="900" fill="#212529" text-anchor="middle" font-style="italic">BAM!</text>
    `
  },
  {
    id: 'vehicules',
    bg: ['#ff6b6b', '#e03131', '#c92a2a'],
    icon: `
      <!-- Voiture de course 3D stylisée -->
      <path d="M140,270 Q160,210 240,205 Q300,205 345,245 L380,265 Q390,290 365,300 L135,300 Q120,290 140,270 Z" fill="#ffd43b" stroke="#f59f00" stroke-width="6" />
      <!-- Pare-brise -->
      <path d="M220,215 L285,215 L320,250 L205,250 Z" fill="#339af0" />
      <!-- Roues de bolide -->
      <circle cx="185" cy="300" r="28" fill="#212529" stroke="#adb5bd" stroke-width="6" />
      <circle cx="185" cy="300" r="10" fill="#ffd43b" />
      <circle cx="330" cy="300" r="28" fill="#212529" stroke="#adb5bd" stroke-width="6" />
      <circle cx="330" cy="300" r="10" fill="#ffd43b" />
    `
  },
  {
    id: 'psychologie',
    bg: ['#da77f2', '#be4bdb', '#9c36b5'],
    icon: `
      <!-- Prisme de cristal translucide & Rayon arc-en-ciel -->
      <polygon points="256,140 160,320 352,320" fill="#f8f9fa" stroke="#ced4da" stroke-width="6" opacity="0.85" />
      <!-- Rayon lumineux entrant -->
      <line x1="100" y1="260" x2="208" y2="245" stroke="#ffffff" stroke-width="6" />
      <!-- Spectre arc-en-ciel sortant -->
      <polygon points="275,265 390,200 405,320 290,290" fill="#ffd43b" opacity="0.6" />
      <line x1="285" y1="268" x2="400" y2="220" stroke="#ff6b6b" stroke-width="5" />
      <line x1="285" y1="275" x2="400" y2="250" stroke="#ffd43b" stroke-width="5" />
      <line x1="285" y1="282" x2="400" y2="280" stroke="#51cf66" stroke-width="5" />
      <line x1="285" y1="289" x2="400" y2="310" stroke="#339af0" stroke-width="5" />
    `
  }
];

async function generate() {
  for (const t of THEMES) {
    const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGrad_${t.id}" cx="32%" cy="30%" r="70%">
      <stop offset="0%" stop-color="${t.bg[0]}" />
      <stop offset="60%" stop-color="${t.bg[1]}" />
      <stop offset="100%" stop-color="${t.bg[2]}" />
    </radialGradient>
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.28" />
    </filter>
  </defs>

  <!-- 3D Clay Base Orb / Token -->
  <g filter="url(#dropShadow)">
    <circle cx="256" cy="256" r="205" fill="url(#bgGrad_${t.id})" />
    <!-- High gloss specular highlight -->
    <ellipse cx="205" cy="140" rx="95" ry="48" fill="#ffffff" opacity="0.4" transform="rotate(-22 205 140)" />
    <!-- Ambient bounce reflection -->
    <ellipse cx="256" cy="420" rx="110" ry="22" fill="#ffffff" opacity="0.18" />

    <!-- Pure Thematic Custom 3D Object -->
    ${t.icon}
  </g>
</svg>
    `;

    const dest = path.join(outDir, `${t.id}.png`);
    await sharp(Buffer.from(svg))
      .png({ compressionLevel: 9 })
      .toFile(dest);
    console.log(`✅ [Theme] ${t.id} -> ${dest}`);
  }
  console.log('🎉 Tous les 26 thèmes ont été générés avec succès sans aucune mascotte !');
}

generate().catch(console.error);
