// Autor: Antônio Costa Leite
// Componente Visualizador do Jardim Botânico de Foco (O Santuário)

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { renderMicroPlant, drawPlantToCanvas, drawDecorationToCanvas, getPlantRank, getLegendaryRankName } from '../utils/plantRenderer';
import { db } from '../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Clean line-art SVG icons
const IconDroplet = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z" />
  </svg>
);

const IconCart = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const IconShare = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

// Minimal wireframe SVGs for placed items
export const DecorationSVG = ({ type, color = '#4a7c59', size = 48 }) => {
  const strokeColor = 'var(--text-primary)';
  const fillAccent = color;

  switch (type) {
    case 'book':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 52h22a4 4 0 0 0 4-4V12a4 4 0 0 0-4-4H6v48z" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M58 52H36a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4h22v48z" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 18h10M12 28h10M12 38h6M52 18H42M52 28H42M52 38H46" stroke={fillAccent} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    case 'quill':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="22" y="44" width="20" height="12" rx="2" stroke={strokeColor} strokeWidth="2" fill="var(--bg-primary)"/>
          <path d="M28 44v-4h8v4" stroke={strokeColor} strokeWidth="2"/>
          <path d="M32 40L48 12" stroke={strokeColor} strokeWidth="2" strokeLinecap="round"/>
          <path d="M35 32c5-3 7-8 9-13-3 1-6 4-8 8" stroke={fillAccent} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M38 25c4-2 6-6 7-10-2.5 1-5 3.5-6.5 6.5" stroke={fillAccent} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    case 'harp':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 52V12h24c0 0-8 12 0 40" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 52h36" stroke={strokeColor} strokeWidth="2"/>
          <line x1="24" y1="12" x2="24" y2="52" stroke={fillAccent} strokeWidth="1.5"/>
          <line x1="30" y1="12" x2="30" y2="48" stroke={fillAccent} strokeWidth="1.5"/>
          <line x1="36" y1="12" x2="36" y2="40" stroke={fillAccent} strokeWidth="1.5"/>
        </svg>
      );
    case 'microscope':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 10v10M20 54h24M24 54V44a8 8 0 0 1 16 0v10" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M38 18L26 32" stroke={fillAccent} strokeWidth="2" strokeLinecap="round"/>
          <circle cx="26" cy="32" r="3" stroke={strokeColor} strokeWidth="2"/>
          <path d="M22 34h-4" stroke={strokeColor} strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    case 'dna':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 16c8 4 16 12 24 16s16 12 24 16" stroke={strokeColor} strokeWidth="2" strokeLinecap="round"/>
          <path d="M16 48c8-4 16-12 24-16s16-12 24-16" stroke={strokeColor} strokeWidth="2" strokeLinecap="round"/>
          <line x1="22" y1="22" x2="22" y2="42" stroke={fillAccent} strokeWidth="2"/>
          <line x1="32" y1="32" x2="32" y2="32" stroke={fillAccent} strokeWidth="2"/>
          <line x1="42" y1="42" x2="42" y2="22" stroke={fillAccent} strokeWidth="2"/>
        </svg>
      );
    case 'heart':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 50C16 38 10 24 18 16c6-6 14-4 14 4 0-8 8-10 14-4 8 8 2 22-14 34z" stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" fill="none"/>
          <path d="M26 26c4 0 6-4 6-4s2 4 6 4" stroke={fillAccent} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    case 'flask':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 10h20M26 10v16L12 48a4 4 0 0 0 4 5h32a4 4 0 0 0 4-5L38 26V10" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17 40h30" stroke={fillAccent} strokeWidth="2" strokeDasharray="3 3"/>
          <circle cx="26" cy="45" r="1.5" fill={fillAccent}/>
          <circle cx="38" cy="47" r="1.5" fill={fillAccent}/>
        </svg>
      );
    case 'abacus':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="12" y="16" width="40" height="32" rx="2" stroke={strokeColor} strokeWidth="2"/>
          <line x1="12" y1="28" x2="52" y2="28" stroke={strokeColor} strokeWidth="2"/>
          <line x1="12" y1="38" x2="52" y2="38" stroke={strokeColor} strokeWidth="2"/>
          <circle cx="20" cy="28" r="3.5" fill={fillAccent}/>
          <circle cx="32" cy="28" r="3.5" fill={fillAccent}/>
          <circle cx="42" cy="38" r="3.5" fill={fillAccent}/>
        </svg>
      );
    case 'atom':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="4.5" fill={strokeColor}/>
          <ellipse cx="32" cy="32" rx="24" ry="8" transform="rotate(30 32 32)" stroke={strokeColor} strokeWidth="2"/>
          <ellipse cx="32" cy="32" rx="24" ry="8" transform="rotate(-30 32 32)" stroke={fillAccent} strokeWidth="1.5"/>
        </svg>
      );
    case 'telescope':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 48L48 12M16 44L44 16" stroke={strokeColor} strokeWidth="2" strokeLinecap="round"/>
          <path d="M40 16l4-4M12 48l-2 2" stroke={fillAccent} strokeWidth="2" strokeLinecap="round"/>
          <path d="M30 30L22 54M30 30L38 54" stroke={strokeColor} strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    case 'globe':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="28" r="16" stroke={strokeColor} strokeWidth="2"/>
          <path d="M32 12a16 16 0 0 0-16 16c0 8.8 7.2 16 16 16" stroke={strokeColor} strokeWidth="2"/>
          <path d="M16 28h32" stroke={fillAccent} strokeWidth="1.5"/>
          <path d="M32 44v8M22 52h20" stroke={strokeColor} strokeWidth="2"/>
        </svg>
      );
    case 'compass':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="18" stroke={strokeColor} strokeWidth="2"/>
          <path d="M32 18l4 14-4 4-4-4z" fill={fillAccent} stroke={strokeColor} strokeWidth="1.5"/>
          <path d="M32 46l4-14-4-4-4 4z" fill="var(--bg-primary)" stroke={strokeColor} strokeWidth="1.5"/>
        </svg>
      );
    case 'crystal':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 6L48 24L32 58L16 24L32 6z" stroke={strokeColor} strokeWidth="2" strokeLinejoin="round"/>
          <path d="M32 6v52M16 24h32" stroke={fillAccent} strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      );
    case 'hourglass':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 16h28M18 48h28" stroke={strokeColor} strokeWidth="3" strokeLinecap="round"/>
          <path d="M22 16l10 16-10 16h20L32 32l10-16H22z" stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" fill="none"/>
          <circle cx="32" cy="42" r="3" fill={fillAccent}/>
          <circle cx="32" cy="22" r="2" fill={fillAccent}/>
        </svg>
      );
    case 'bonsai':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 50h40l-3 8H15l-3-8z" stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" fill="var(--bg-primary)"/>
          <path d="M32 50c0-10-8-12-4-22s8-6 6-12" stroke={strokeColor} strokeWidth="3" strokeLinecap="round"/>
          <circle cx="26" cy="22" r="10" stroke={fillAccent} strokeWidth="2" fill="none" strokeDasharray="3 3"/>
          <circle cx="38" cy="16" r="8" stroke={fillAccent} strokeWidth="2" fill="none" strokeDasharray="3 3"/>
          <circle cx="20" cy="30" r="7" stroke={fillAccent} strokeWidth="1.5" fill="none"/>
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke={strokeColor} strokeWidth="2">
          <circle cx="32" cy="32" r="20" />
        </svg>
      );
  }
};

import { ALL_THEMES, THEME_VARIABLES } from '../utils/themeConstants';

const IconWhatsApp = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

const IconLinkedIn = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const IconInstagram = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

export const getBiomaColor = (biomaId, level) => {
  const neonColors = ['#39ff14', '#ff79c6', '#8be9fd', '#bd93f9', '#50fa7b'];
  const pastelColors = ['#ffb3ba', '#baffc9', '#bae1ff', '#ffffba', '#ffdfba'];
  const autumnColors = ['#d4a373', '#e9c46a', '#f4a261', '#e76f51', '#264653'];
  const monoColors = ['#e0e0e0', '#b0b0b0', '#808080', '#5c5c5c', '#2c2c2c'];
  
  const idx = (level - 1) % 5;
  if (biomaId === 'neon') return neonColors[idx];
  if (biomaId === 'pastel') return pastelColors[idx];
  if (biomaId === 'autumn') return autumnColors[idx];
  if (biomaId === 'monochrome') return monoColors[idx];
  return '#46bf7c';
};

const GardenView = ({ visitorUid = null }) => {
  const { 
    state: localState, 
    buyDecoration, 
    updateGardenSlots, 
    saveGardenProfile, 
    loadGardenProfile, 
    deleteGardenProfile,
    renameGardenProfile,
    setGreenhouseSize,
    setSlotDisplayStyle,
    setTheme,
    updateCustomTheme,
    currentUser,
    themesCatalogOpen,
    setThemesCatalogOpen,
    mixMatchOpen,
    setMixMatchOpen,
    previewThemeId,
    setPreviewThemeId
  } = useApp();

  const [visitedState, setVisitedState] = useState(null);
  const [visitorLoading, setVisitorLoading] = useState(false);

  useEffect(() => {
    if (visitorUid) {
      setVisitorLoading(true);
      const userRef = doc(db, 'users', visitorUid);
      getDoc(userRef).then(snap => {
        if (snap.exists()) {
          setVisitedState(snap.data());
        }
        setVisitorLoading(false);
      }).catch(e => {
        console.error("Error loading visited garden:", e);
        setVisitorLoading(false);
      });
    }
  }, [visitorUid]);

  const state = visitorUid ? (visitedState || { orvalho: 0, activeGardenSlots: [], subjects: [], savedGardenProfiles: [], settings: {} }) : localState;

  const [storeOpen, setStoreOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedItemType, setSelectedItemType] = useState('book');
  const [selectedSubjectId, setSelectedSubjectId] = useState(state?.subjects?.[0]?.id || '');
  const [alertMsg, setAlertMsg] = useState('');

  // Sandbox slot management
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [itemSelectorOpen, setItemSelectorOpen] = useState(false);
  const [activeItemMenu, setActiveItemMenu] = useState(null); // { slotIndex, item }
  const [swapSourceIndex, setSwapSourceIndex] = useState(null);

  // Profile manager & suggestions states
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [explanationMsg, setExplanationMsg] = useState('');
  const [showNewProfileInput, setShowNewProfileInput] = useState(false);
  const [profileNameInput, setProfileNameInput] = useState('');
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [editProfileNameInput, setEditProfileNameInput] = useState('');

  const [isMobile, setIsMobile] = useState(window.innerWidth < 480);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 480);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Drag and Drop Sandbox states
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e, index) => {
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIdx) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const slots = [...(state.activeGardenSlots || [])];
    const sourceItem = slots.find(s => s.slotIndex === draggedIndex);
    const targetItem = slots.find(s => s.slotIndex === targetIdx);

    if (sourceItem && targetItem) {
      // Swap indexes
      sourceItem.slotIndex = targetIdx;
      targetItem.slotIndex = draggedIndex;
    } else if (sourceItem) {
      // Move to empty slot
      sourceItem.slotIndex = targetIdx;
    }

    updateGardenSlots(slots);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setActiveProfileId(null);
    setExplanationMsg('');
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Sharing states
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareTemplate, setShareTemplate] = useState('bioma');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const activeTheme = state.settings?.activeTheme || 'light';
  const [shareTheme, setShareTheme] = useState(activeTheme);
  const greenhouseSize = state.settings?.greenhouseSize || 12;
  const displayStyle = state.settings?.slotDisplayStyle || 'focus';

  // Sync share theme default with active theme changes
  useEffect(() => {
    setShareTheme(activeTheme);
  }, [activeTheme]);

  // Rich categorized relics across all knowledge areas
  const shopItems = [
    // Humanidades & Filosofia
    { type: 'book', name: 'Livro Antigo', cost: 10, desc: 'Humanidades - Nível 1' },
    { type: 'quill', name: 'Pena & Tinteiro', cost: 20, desc: 'Humanidades - Nível 2' },
    { type: 'harp', name: 'Lira Grega de Apolo', cost: 35, desc: 'Humanidades & Música' },
    { type: 'hourglass', name: 'Ampulheta de Filósofo', cost: 45, desc: 'Filosofia - Relíquia' },
    { type: 'socrates', name: 'Busto de Sócrates', cost: 60, desc: 'Filosofia - Relíquia Mestra' },
    { type: 'codex', name: 'Código de Leis de Mármore', cost: 75, desc: 'Direito & Sociedade' },
    { type: 'palette', name: 'Paleta do Pintor Mestre', cost: 40, desc: 'Artes Plásticas' },

    // Biológicas & Saúde
    { type: 'microscope', name: 'Microscópio', cost: 10, desc: 'Biológicas - Nível 1' },
    { type: 'dna', name: 'Dupla Hélice DNA', cost: 20, desc: 'Biológicas - Nível 2' },
    { type: 'heart', name: 'Coração Anatômico', cost: 35, desc: 'Saúde - Relíquia' },
    { type: 'alchemy', name: 'Frasco de Alquimia', cost: 50, desc: 'Alquimia Botânica' },

    // Exatas & Engenharia
    { type: 'flask', name: 'Frasco Químico', cost: 10, desc: 'Química - Nível 1' },
    { type: 'abacus', name: 'Ábaco Romano', cost: 20, desc: 'Matemática - Nível 2' },
    { type: 'atom', name: 'Modelo Atômico', cost: 35, desc: 'Física Quântica' },
    { type: 'prism', name: 'Prisma de Newton', cost: 50, desc: 'Óptica & Exatas' },
    { type: 'chip', name: 'Chip de Silício Neon', cost: 65, desc: 'Computação & Tecnologia' },

    // Espaciais & Geografia
    { type: 'telescope', name: 'Luneta Espacial', cost: 10, desc: 'Astronomia - Nível 1' },
    { type: 'globe', name: 'Globo Terrestre', cost: 20, desc: 'Geografia - Nível 2' },
    { type: 'astrolabe', name: 'Astrolábio Náutico', cost: 55, desc: 'Navegação Ancestral' },

    // Foco Geral
    { type: 'crystal', name: 'Cristal Rúnico', cost: 15, desc: 'Foco Geral - Nível 1' },
    { type: 'bonsai', name: 'Bonsai da Constância', cost: 35, desc: 'Foco Geral - Nível 3' }
  ];

  // Assemble active slots grid based on custom greenhouseSize
  const slotsGrid = [];
  for (let i = 0; i < greenhouseSize; i++) {
    const slotItem = (state.activeGardenSlots || []).find(s => s.slotIndex === i);
    slotsGrid.push({ index: i, item: slotItem });
  }

  // Public visitor mode vitrine rendering (Top 3 pedestals)
  if (visitorUid) {
    const activeSlots = state.activeGardenSlots || [];
    const plants = activeSlots.filter(s => s.type === 'plant');
    
    const sortedPlants = [...plants].sort((a,b) => {
      const lvlA = a.level || 1;
      const lvlB = b.level || 1;
      if (lvlB !== lvlA) return lvlB - lvlA;
      return (b.focusMinutes || 0) - (a.focusMinutes || 0);
    });

    const top1 = sortedPlants[0] || null;
    const top2 = sortedPlants[1] || null;
    const top3 = sortedPlants[2] || null;
    const rest = sortedPlants.slice(3);
    const decorations = activeSlots.filter(s => s.type === 'decoration');

    return (
      <div className="neumorphic-card" style={{ padding: '24px', background: 'var(--panel-bg)', borderRadius: '24px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: 'var(--shadow-flat)' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 20h10" />
            <path d="M10 20V12a4 4 0 0 1 8 0" />
            <path d="M12 12a4 4 0 0 0-8 0v8" />
          </svg>
          <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            Vitrine de Florescimento Público
          </h4>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>Estas são as três maiores conquistas botânicas deste usuário em destaque.</p>

        {/* Top 3 Pedestals Showcase */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '10px', height: '220px', padding: '10px 0', borderBottom: '1.5px solid var(--card-border)' }}>
          
          {/* Pedestal 2 (Silver) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            {top2 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ width: '60px', height: '60px' }}>
                  {renderMicroPlant(top2.subjectColor || '#909090', top2.wiltCount > 0, top2.level || 1, top2.seed || 0.5)}
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>Nível {top2.level}</span>
              </div>
            ) : (
              <div style={{ height: '80px', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', opacity: 0.3, fontSize: '0.75rem' }}>Vazio</div>
            )}
            <div style={{ width: '80%', height: '50px', background: 'var(--bg-primary)', border: '2.5px solid #c0c0c0', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-flat)', color: '#909090', fontWeight: 'bold' }}>
              #2
            </div>
          </div>

          {/* Pedestal 1 (Gold) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1.2 }}>
            {top1 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ width: '74px', height: '74px' }}>
                  {renderMicroPlant(top1.subjectColor || '#ffd700', top1.wiltCount > 0, top1.level || 1, top1.seed || 0.5)}
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>Nível {top1.level}</span>
              </div>
            ) : (
              <div style={{ height: '90px', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', opacity: 0.3, fontSize: '0.75rem' }}>Vazio</div>
            )}
            <div style={{ width: '85%', height: '75px', background: 'var(--bg-primary)', border: '3.5px solid #ffd700', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(255,215,0,0.15)', color: '#d4af37', fontWeight: 'extrabold', fontSize: '1.1rem' }}>
              #1
            </div>
          </div>

          {/* Pedestal 3 (Bronze) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            {top3 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ width: '54px', height: '54px' }}>
                  {renderMicroPlant(top3.subjectColor || '#cd7f32', top3.wiltCount > 0, top3.level || 1, top3.seed || 0.5)}
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>Nível {top3.level}</span>
              </div>
            ) : (
              <div style={{ height: '80px', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', opacity: 0.3, fontSize: '0.75rem' }}>Vazio</div>
            )}
            <div style={{ width: '80%', height: '35px', background: 'var(--bg-primary)', border: '2.5px solid #cd7f32', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-flat)', color: '#a05a2c', fontWeight: 'bold' }}>
              #3
            </div>
          </div>

        </div>

        {/* Rest of the Garden Grid */}
        <div>
          <h5 style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '10px' }}>Outras Cultivações & Decorações</h5>
          {rest.length === 0 && decorations.length === 0 ? (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>Nenhuma outra planta ou decoração no jardim.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: '12px' }}>
              {[...rest, ...decorations].map((slot, sIdx) => {
                return (
                  <div
                    key={sIdx}
                    style={{
                      padding: '10px',
                      borderRadius: '16px',
                      background: 'var(--bg-primary)',
                      border: '1.5px solid var(--card-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: 'var(--shadow-flat)'
                    }}
                  >
                    <div style={{ width: '40px', height: '40px' }}>
                      {slot.type === 'plant' 
                        ? renderMicroPlant(slot.subjectColor || '#4a7c59', slot.wiltCount > 0, slot.level || 1, slot.seed || 0.5)
                        : <span style={{ fontSize: '1.8rem' }}>🔮</span>
                      }
                    </div>
                    {slot.type === 'plant' && (
                      <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-primary)' }}>Nível {slot.level}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Calcula reservas de inventário
  const placedPlantIds = (state.activeGardenSlots || []).filter(s => s.type === 'plant').map(s => s.itemId);
  const unplacedPlants = (state.museumItems || []).filter(p => !placedPlantIds.includes(p.id));

  const placedDecIds = (state.activeGardenSlots || []).filter(s => s.type === 'decoration').map(s => s.itemId);
  const unplacedDecs = (state.gardenDecorations || []).filter(d => !placedDecIds.includes(d.id));

  const handleBuy = () => {
    const item = shopItems.find(i => i.type === selectedItemType);
    if (!item) return;
    
    if (state.orvalho < item.cost) {
      setAlertMsg('Orvalho insuficiente.');
      setTimeout(() => setAlertMsg(''), 3000);
      return;
    }

    const success = buyDecoration(item.type, selectedSubjectId, item.cost);
    if (success) {
      setAlertMsg('Item comprado e posicionado na estufa.');
      setTimeout(() => setAlertMsg(''), 3000);
    }
  };

  const handleOpenItemSelector = (slotIndex) => {
    if (swapSourceIndex !== null) {
      const slots = [...(state.activeGardenSlots || [])];
      const source = slots.find(s => s.slotIndex === swapSourceIndex);
      if (source) {
        source.slotIndex = slotIndex;
        updateGardenSlots(slots);
      }
      setSwapSourceIndex(null);
      setActiveProfileId(null);
      setExplanationMsg('');
      return;
    }
    setSelectedSlotIndex(slotIndex);
    setItemSelectorOpen(true);
  };

  const handleSelectItem = (type, itemId) => {
    const slots = [...(state.activeGardenSlots || [])];
    slots.push({ slotIndex: selectedSlotIndex, type, itemId });
    updateGardenSlots(slots);
    setItemSelectorOpen(false);
    setActiveProfileId(null);
    setExplanationMsg('');
  };

  const handleOpenItemMenu = (slotIndex, item) => {
    if (swapSourceIndex !== null) {
      const slots = [...(state.activeGardenSlots || [])];
      const sourceItem = slots.find(s => s.slotIndex === swapSourceIndex);
      const targetItem = slots.find(s => s.slotIndex === slotIndex);
      
      if (sourceItem && targetItem) {
        sourceItem.slotIndex = slotIndex;
        targetItem.slotIndex = swapSourceIndex;
        updateGardenSlots(slots);
      }
      setSwapSourceIndex(null);
      setActiveProfileId(null);
      setExplanationMsg('');
      return;
    }
    setActiveItemMenu({ slotIndex, item });
  };

  const handleRemoveItem = (slotIndex) => {
    const slots = (state.activeGardenSlots || []).filter(s => s.slotIndex !== slotIndex);
    updateGardenSlots(slots);
    setActiveItemMenu(null);
    setActiveProfileId(null);
    setExplanationMsg('');
  };

  const handleStartMove = (slotIndex) => {
    setSwapSourceIndex(slotIndex);
    setActiveItemMenu(null);
  };

  const applySuggestion = (mode) => {
    const plants = state.museumItems || [];
    let slots = [];
    
    if (mode === 'suggested_clear') {
      updateGardenSlots([]);
      return;
    }

    if (mode === 'suggested_elite') {
      const sorted = [...plants].sort((a, b) => b.minutes - a.minutes).slice(0, greenhouseSize);
      slots = sorted.map((p, idx) => ({ slotIndex: idx, type: 'plant', itemId: p.id }));
    } else if (mode === 'suggested_bioma') {
      const sorted = [...plants].sort((a, b) => a.subjectColor.localeCompare(b.subjectColor)).slice(0, greenhouseSize);
      slots = sorted.map((p, idx) => ({ slotIndex: idx, type: 'plant', itemId: p.id }));
    } else if (mode === 'suggested_cron') {
      const sorted = [...plants].sort((a, b) => {
        const tA = parseInt(a.id.split('_')[1]) || 0;
        const tB = parseInt(b.id.split('_')[1]) || 0;
        return tA - tB;
      }).slice(0, greenhouseSize);
      slots = sorted.map((p, idx) => ({ slotIndex: idx, type: 'plant', itemId: p.id }));
    } else if (mode === 'suggested_zen') {
      const sorted = [...plants].sort((a, b) => b.minutes - a.minutes).slice(0, greenhouseSize);
      const zenSlots = greenhouseSize === 8 
        ? [2, 3, 1, 4, 0, 5, 6, 7] 
        : greenhouseSize === 16 
          ? [9, 10, 5, 6, 4, 7, 8, 11, 1, 2, 13, 14, 0, 3, 12, 15] 
          : [5, 6, 1, 2, 4, 7, 8, 11, 0, 3, 9, 10];
      sorted.forEach((p, idx) => {
        slots.push({ slotIndex: zenSlots[idx], type: 'plant', itemId: p.id });
      });
    }

    updateGardenSlots(slots);
  };

  const handleSelectProfile = (pId, type = 'custom') => {
    setActiveProfileId(pId);
    if (type === 'custom') {
      loadGardenProfile(pId);
      setExplanationMsg('');
    } else {
      applySuggestion(pId);
      const explanations = {
        suggested_elite: 'Exibe seus cultivos de maior tempo de foco em ordem decrescente, destacando suas conquistas mais profundas.',
        suggested_bioma: 'Agrupa os cultivos pela cor de cada matéria, criando blocos visuais harmoniosos de conhecimento.',
        suggested_cron: 'Ordena as plantas cronologicamente conforme foram concluídas no Santuário, contando sua jornada no tempo.',
        suggested_zen: 'Posiciona os cultivos mais altos no centro da estufa, decrescendo suavemente em direção às pontas para um visual equilibrado.',
        suggested_clear: 'Remove todas as plantas e relíquias das prateleiras para você montar seu jardim do zero.'
      };
      setExplanationMsg(explanations[pId] || '');
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!profileNameInput.trim()) return;
    saveGardenProfile(profileNameInput.trim());
    setProfileNameInput('');
    setShowNewProfileInput(false);
  };

  const generateShareLink = () => {
    const totalMins = state.subjects.reduce((sum, s) => sum + s.focusMinutes, 0);
    const payload = {
      n: currentUser?.displayName || 'Estudante',
      s: state.streak,
      m: totalMins,
      slots: (state.activeGardenSlots || []).map(s => {
        let details = {};
        if (s.type === 'plant') {
          const p = (state.museumItems || []).find(item => item.id === s.itemId);
          if (p) {
            const activeTheme = state.settings?.activeTheme;
            const customTheme = state.settings?.customTheme;
            const customBioma = (activeTheme === 'custom' && customTheme) ? customTheme.plantBiomaId : 'default';
            const plantColor = customBioma === 'default' 
              ? p.subjectColor 
              : getBiomaColor(customBioma, p.level || 3);
            details = { c: plantColor, w: p.wiltCount > 0, lvl: p.level, sd: p.seed, sub: p.subjectName };
          }
        } else {
          const d = (state.gardenDecorations || []).find(item => item.id === s.itemId);
          const sub = state.subjects.find(sub => sub.id === d?.subjectId);
          details = { c: sub ? sub.color : '#4a7c59', sub: sub ? sub.name : 'Decoração', decType: d ? d.type : 'book' };
        }
        return {
          idx: s.slotIndex,
          t: s.type === 'plant' ? 'plant' : (details.decType || 'book'),
          ...details
        };
      })
    };
    const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    return `${window.location.origin}/?share=${base64}`;
  };

  const handleCopyLink = () => {
    const link = generateShareLink();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPostcard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `santuario-estufa-${shareTemplate}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Canvas drawing trigger for sharing modal (with theme support and aligned planks)
  useEffect(() => {
    if (!shareModalOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dynamic core drawing palette based on THEME_VARIABLES
    const tv = THEME_VARIABLES[shareTheme] || THEME_VARIABLES.light;
    const bgColor1 = tv.bgPrimary;
    const bgColor2 = tv.bgPrimary; 
    const bgColor3 = tv.bgPrimary;
    const fontColor = tv.textPrimary;
    const subFontColor = tv.textSecondary;
    const shelfColor = tv.shelfBg;
    const shelfStroke = tv.shelfBorder;
    const statsBg = tv.panelBgRgba || 'rgba(255,255,255,0.7)';

    if (shareTemplate === 'bioma') {
      canvas.width = 800;
      canvas.height = 600;
      
      const grad = ctx.createRadialGradient(400, 600, 50, 400, 600, 600);
      grad.addColorStop(0, bgColor1);
      grad.addColorStop(0.5, bgColor2);
      grad.addColorStop(1, bgColor3);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 600);
      
      // Draw shelves based on size
      const rowsCount = greenhouseSize / 4;
      const shelvesY = [];
      const startY = rowsCount === 4 ? 130 : 160;
      const endY = rowsCount === 4 ? 510 : 490;
      const totalHeightRange = endY - startY;
      
      for (let r = 0; r < rowsCount; r++) {
        const sy = startY + r * (totalHeightRange / Math.max(1, rowsCount - 1 || 1));
        shelvesY.push(sy);
        
        ctx.fillStyle = shelfColor;
        ctx.fillRect(80, sy, 640, 10);
        ctx.strokeStyle = shelfStroke;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(80, sy, 640, 10);
      }
      
      // Draw grid items aligned on planks (cy = sy)
      const scale = rowsCount === 4 ? 0.95 : 1.25;
      const slots = state.activeGardenSlots || [];
      slots.forEach(slot => {
        const row = Math.floor(slot.slotIndex / 4);
        const col = slot.slotIndex % 4;
        const cy = shelvesY[row];
        const cx = 160 + col * 160;
        
        if (slot.type === 'plant') {
          const plant = (state.museumItems || []).find(p => p.id === slot.itemId);
          if (plant) {
            drawPlantToCanvas(ctx, cx, cy, scale, plant.subjectColor, plant.wiltCount > 0, plant.level, plant.seed);
          }
        } else {
          const dec = (state.gardenDecorations || []).find(d => d.id === slot.itemId);
          if (dec) {
            const sub = state.subjects.find(s => s.id === dec.subjectId);
            const color = sub ? sub.color : '#4a7c59';
            drawDecorationToCanvas(ctx, dec.type, cx, cy, 38 * scale, color);
          }
        }
      });
      
      // Header
      ctx.fillStyle = fontColor;
      ctx.font = 'bold 26px serif';
      ctx.textAlign = 'center';
      ctx.fillText('Estufa do meu Santuário', 400, 60);
      ctx.font = 'italic 12px sans-serif';
      ctx.fillStyle = subFontColor;
      ctx.fillText('Organização customizada das conquistas de foco', 400, 85);
      
      // Stats block
      ctx.fillStyle = statsBg;
      ctx.fillRect(150, 545, 500, 42);
      ctx.strokeStyle = fontColor;
      ctx.lineWidth = 0.8;
      ctx.strokeRect(150, 545, 500, 42);
      
      ctx.fillStyle = fontColor;
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Streak: ${state.streak} dias`, 170, 570);
      ctx.textAlign = 'center';
      ctx.fillText(`Total Focado: ${state.subjects.reduce((sum, s) => sum + s.focusMinutes, 0)} min`, 400, 570);
      ctx.textAlign = 'right';
      ctx.fillText('santuario-pomodoro.vercel.app', 630, 570);
      
    } else if (shareTemplate === 'elite') {
      canvas.width = 600;
      canvas.height = 800;
      
      ctx.fillStyle = shareTheme === 'dark' ? '#111614' : shareTheme === 'nordic' ? '#fcf8f2' : '#f8f6f0';
      ctx.fillRect(0, 0, 600, 800);
      
      ctx.strokeStyle = shareTheme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 600; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 800); ctx.stroke();
      }
      for (let y = 0; y < 800; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(600, y); ctx.stroke();
      }

      ctx.fillStyle = fontColor;
      ctx.font = 'bold 30px serif';
      ctx.textAlign = 'center';
      ctx.fillText('Catálogo Botânico de Elite', 300, 80);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = subFontColor;
      ctx.fillText('As conquistas de esforço máximo cultivadas no meu Santuário', 300, 110);
      
      const topPlants = [...(state.museumItems || [])]
        .sort((a, b) => b.minutes - a.minutes)
        .slice(0, 3);
        
      const positions = [
        { x: 160, y: 550, h: 80, rank: 2, scale: 1.1 },
        { x: 300, y: 550, h: 130, rank: 1, scale: 1.3 },
        { x: 440, y: 550, h: 100, rank: 3, scale: 1.05 }
      ];
      
      positions.forEach(pos => {
        const plant = topPlants[pos.rank - 1];
        ctx.strokeStyle = fontColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pos.x - 30, pos.y);
        ctx.lineTo(pos.x + 30, pos.y);
        ctx.stroke();
        
        ctx.lineWidth = 1.5;
        ctx.strokeRect(pos.x - 15, pos.y, 30, pos.h);
        ctx.fillStyle = shareTheme === 'dark' ? '#202a25' : '#e8e4db';
        ctx.fillRect(pos.x - 15, pos.y, 30, pos.h);
        
        ctx.fillStyle = fontColor;
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`#${pos.rank}`, pos.x, pos.y + 20);
        
        if (plant) {
          drawPlantToCanvas(ctx, pos.x, pos.y, pos.scale, plant.subjectColor, plant.wiltCount > 0, plant.level || getPlantRank(plant.minutes).level, plant.seed || 0.5);
          
          ctx.strokeStyle = shareTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(43, 53, 49, 0.12)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y - 65, 52 * pos.scale, 0, Math.PI * 2);
          ctx.stroke();
          
          ctx.fillStyle = fontColor;
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(plant.subjectName, pos.x, pos.y + pos.h + 20);
          ctx.font = '11px sans-serif';
          ctx.fillStyle = subFontColor;
          ctx.fillText(`${plant.minutes} min`, pos.x, pos.y + pos.h + 34);
          ctx.font = 'italic 10px serif';
          ctx.fillText(getPlantRank(plant.minutes).name, pos.x, pos.y + pos.h + 46);
        } else {
          ctx.fillStyle = 'rgba(128,128,128,0.4)';
          ctx.font = 'italic 12px serif';
          ctx.fillText('(Vazio)', pos.x, pos.y - 30);
        }
      });
      
      ctx.fillStyle = fontColor;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('santuario-pomodoro.vercel.app', 300, 770);
      
    } else if (shareTemplate === 'shelf') {
      canvas.width = 600;
      canvas.height = 800;
      
      ctx.fillStyle = shareTheme === 'dark' ? '#111614' : shareTheme === 'nordic' ? '#fcf8f2' : '#f3eee3';
      ctx.fillRect(0, 0, 600, 800);
      
      ctx.fillStyle = fontColor;
      ctx.font = 'bold 28px serif';
      ctx.textAlign = 'center';
      ctx.fillText('Prateleiras do Saber', 300, 80);
      ctx.font = '13px sans-serif';
      ctx.fillStyle = subFontColor;
      ctx.fillText('Distribuição e diversidade do esforço focado por matéria', 300, 110);
      
      const subjects = state.subjects || [];
      const shelfPlants = [];
      subjects.forEach(sub => {
        const subPlants = (state.museumItems || []).filter(p => p.subjectId === sub.id || p.subjectName === sub.name);
        if (subPlants.length > 0) {
          const best = subPlants.reduce((max, p) => p.minutes > max.minutes ? p : max, subPlants[0]);
          shelfPlants.push({ subject: sub, plant: best });
        }
      });
      
      const shelvesY = [280, 480, 680];
      
      shelvesY.forEach((sy, sIdx) => {
        ctx.fillStyle = shelfColor;
        ctx.fillRect(50, sy, 500, 10);
        ctx.strokeStyle = shelfStroke;
        ctx.lineWidth = 2;
        ctx.strokeRect(50, sy, 500, 10);
        
        const itemsOnShelf = shelfPlants.slice(sIdx * 3, (sIdx + 1) * 3);
        
        itemsOnShelf.forEach((item, iIdx) => {
          const cx = 150 + iIdx * 150;
          drawPlantToCanvas(ctx, cx, sy, 0.9, item.plant.subjectColor, item.plant.wiltCount > 0, item.plant.level || getPlantRank(item.plant.minutes).level, item.plant.seed || 0.5);
          
          ctx.fillStyle = fontColor;
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText(item.subject.name, cx, sy + 25);
          
          ctx.font = '10px sans-serif';
          ctx.fillStyle = item.subject.color;
          ctx.fillText(`${item.subject.focusMinutes} min focado`, cx, sy + 38);
        });
      });
      
      ctx.fillStyle = fontColor;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('santuario-pomodoro.vercel.app', 300, 770);
    }
  }, [shareModalOpen, shareTemplate, state, shareTheme, greenhouseSize]);

  // Height of slots based on styling
  const slotHeight = displayStyle === 'minimal' ? '110px' : displayStyle === 'details' ? '142px' : '124px';
  const rowCount = greenhouseSize / 4;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', flex: 1 }}>
      
      {/* Immersive slot grid board */}
      <div 
        className="neumorphic-card" 
        style={{ 
          minHeight: '440px', 
          position: 'relative', 
          background: 'var(--panel-bg)',
          padding: '24px'
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(var(--accent-rgb), 0.03) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* HUD top bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)' }}>Estufa Botânica</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Organize seus maiores florescimentos e relíquias nas prateleiras.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ 
              background: 'var(--panel-bg)', 
              boxShadow: 'var(--shadow-inset)',
              padding: '6px 14px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: 'var(--accent-color)',
              border: '1px solid rgba(255, 255, 255, 0.4)'
            }}>
              <IconDroplet size={14} />
              <span>{state.orvalho}</span>
            </div>
            
            {!visitorUid && (
              <>
                <button className="neumorphic-btn" onClick={() => setStoreOpen(!storeOpen)} style={{ padding: '8px 12px', borderRadius: '12px' }}>
                  <IconCart size={14} />
                  <span style={{ fontSize: '0.8rem', marginLeft: '4px' }}>Loja</span>
                </button>

                <button className="neumorphic-btn" onClick={() => setSettingsOpen(!settingsOpen)} style={{ padding: '8px 12px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.8rem' }}>Aparência</span>
                </button>

                <button className="neumorphic-btn" onClick={() => setShareModalOpen(true)} style={{ padding: '8px 12px', borderRadius: '12px' }}>
                  <IconShare size={14} />
                  <span style={{ fontSize: '0.8rem', marginLeft: '4px' }}>Compartilhar minha estufa</span>
                </button>
              </>
            )}
          </div>
        </div>

        {!visitorUid && (
          <div style={{
            background: 'var(--bg-primary)',
            border: '1.5px solid var(--card-border)',
            borderRadius: '16px',
            padding: '14px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-inset)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Perfis de Organização
            </span>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Suggested configurations */}
              {[
                { id: 'suggested_elite', label: 'Os Melhores' },
                { id: 'suggested_bioma', label: 'Matérias (Bioma)' },
                { id: 'suggested_cron', label: 'Histórico' },
                { id: 'suggested_zen', label: 'Equilíbrio (Zen)' },
                { id: 'suggested_clear', label: 'Limpar Estufa' }
              ].map(p => {
                const isSelected = activeProfileId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProfile(p.id, 'preset')}
                    className={`neumorphic-btn ${isSelected ? 'pressed' : ''}`}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: isSelected ? 'var(--accent-color)' : 'var(--bg-primary)',
                      color: isSelected ? '#fff' : 'var(--text-primary)',
                      border: isSelected ? '1px solid var(--accent-color)' : '1px solid var(--card-border)',
                      boxShadow: isSelected ? 'var(--shadow-inset)' : 'var(--shadow-flat)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}

              {/* Separator */}
              {state.savedGardenProfiles && state.savedGardenProfiles.length > 0 && (
                <div style={{ width: '1.2px', height: '16px', background: 'var(--card-border)', margin: '0 4px' }} />
              )}

              {/* Custom User Profiles */}
              {(state.savedGardenProfiles || []).map(p => {
                const isSelected = activeProfileId === p.id;
                const isEditing = editingProfileId === p.id;

                if (isEditing) {
                  return (
                    <form
                      key={p.id}
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (editProfileNameInput.trim()) {
                          renameGardenProfile(p.id, editProfileNameInput.trim());
                          setEditingProfileId(null);
                        }
                      }}
                      style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}
                    >
                      <input 
                        type="text" 
                        value={editProfileNameInput}
                        onChange={(e) => setEditProfileNameInput(e.target.value)}
                        className="input-field"
                        style={{ padding: '4px 6px', fontSize: '0.72rem', width: '90px', borderRadius: '8px' }}
                        autoFocus
                      />
                      <button type="submit" className="neumorphic-btn accent-btn" style={{ padding: '4px 6px', fontSize: '0.72rem', borderRadius: '8px' }}>✓</button>
                      <button type="button" className="neumorphic-btn" onClick={() => setEditingProfileId(null)} style={{ padding: '4px 6px', fontSize: '0.72rem', borderRadius: '8px', color: '#c75e43' }}>✕</button>
                    </form>
                  );
                }

                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <button
                      onClick={() => handleSelectProfile(p.id, 'custom')}
                      className={`neumorphic-btn ${isSelected ? 'pressed' : ''}`}
                      style={{
                        padding: '6px 42px 6px 12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: isSelected ? 'var(--accent-color)' : 'var(--bg-primary)',
                        color: isSelected ? '#fff' : 'var(--text-primary)',
                        border: isSelected ? '1px solid var(--accent-color)' : '1px solid var(--card-border)',
                        boxShadow: isSelected ? 'var(--shadow-inset)' : 'var(--shadow-flat)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {p.name}
                    </button>

                    {/* Rename profile pencil button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProfileId(p.id);
                        setEditProfileNameInput(p.name);
                      }}
                      style={{
                        position: 'absolute',
                        right: '22px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Renomear perfil"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>

                    {/* Delete profile button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Deseja realmente excluir o perfil "${p.name}"?`)) {
                          deleteGardenProfile(p.id);
                          if (activeProfileId === p.id) {
                            setActiveProfileId(null);
                          }
                        }
                      }}
                      style={{
                        position: 'absolute',
                        right: '6px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: isSelected ? 'rgba(255,255,255,0.7)' : '#c75e43',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        padding: '2px',
                        lineHeight: '1'
                      }}
                      title="Excluir perfil"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}

              {/* Custom layout saver form inline */}
              {showNewProfileInput ? (
                <form onSubmit={handleSaveProfile} style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    placeholder="Nome do perfil" 
                    value={profileNameInput}
                    onChange={(e) => setProfileNameInput(e.target.value)}
                    className="input-field"
                    style={{ padding: '4px 8px', fontSize: '0.72rem', width: '100px', borderRadius: '8px' }}
                    autoFocus
                  />
                  <button type="submit" className="neumorphic-btn accent-btn" style={{ padding: '5px 8px', fontSize: '0.72rem', borderRadius: '8px' }}>Salvar</button>
                  <button type="button" className="neumorphic-btn" onClick={() => setShowNewProfileInput(false)} style={{ padding: '5px 8px', fontSize: '0.72rem', borderRadius: '8px', color: '#c75e43' }}>Voltar</button>
                </form>
              ) : (
                <button 
                  onClick={() => setShowNewProfileInput(true)} 
                  className="neumorphic-btn"
                  style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: '600', borderRadius: '10px', color: 'var(--accent-color)' }}
                >
                  Salvar Estufa Atual
                </button>
              )}
            </div>

            {/* Explanation banner */}
            {explanationMsg && (
              <div style={{
                background: 'rgba(var(--accent-rgb), 0.04)',
                borderLeft: '3.5px solid var(--accent-color)',
                padding: '8px 12px',
                borderRadius: '0 8px 8px 0',
                fontSize: '0.78rem',
                color: 'var(--text-primary)',
                animation: 'fadeIn 0.2s',
                marginTop: '4px'
              }}>
                {explanationMsg}
              </div>
            )}
          </div>
        )}

        {/* Global Greenhouse customization panel */}
        {settingsOpen && (
          <div style={{
            background: 'var(--bg-primary)',
            border: '1.5px solid var(--card-border)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-inset)',
            animation: 'fadeIn 0.2s',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '600' }}>Customização da Estufa</h3>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {/* Size selectors */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '150px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Tamanho da Estufa</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { val: 8, label: 'Pequena (8 Slots)' },
                    { val: 12, label: 'Média (12 Slots)' },
                    { val: 16, label: 'Grande (16 Slots)' }
                  ].map(sz => (
                    <button
                      key={sz.val}
                      onClick={() => setGreenhouseSize(sz.val)}
                      className="neumorphic-btn"
                      style={{
                        flex: 1,
                        padding: '6px',
                        fontSize: '0.72rem',
                        background: greenhouseSize === sz.val ? 'var(--accent-color)' : 'transparent',
                        color: greenhouseSize === sz.val ? '#fff' : 'var(--text-primary)'
                      }}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Style selectors */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '150px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Visualização</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { val: 'minimal', label: 'Minimalista' },
                    { val: 'focus', label: 'Tempo' },
                    { val: 'details', label: 'Detalhes' }
                  ].map(st => (
                    <button
                      key={st.val}
                      onClick={() => setSlotDisplayStyle(st.val)}
                      className="neumorphic-btn"
                      style={{
                        flex: 1,
                        padding: '6px',
                        fontSize: '0.72rem',
                        background: displayStyle === st.val ? 'var(--accent-color)' : 'transparent',
                        color: displayStyle === st.val ? '#fff' : 'var(--text-primary)'
                      }}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Customizer button */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '150px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Estilo de Tema</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setThemesCatalogOpen(true)}
                    className="neumorphic-btn"
                    style={{
                      flex: 1,
                      padding: '7px 4px',
                      fontSize: '0.7rem',
                      borderRadius: '10px'
                    }}
                  >
                    Catálogo
                  </button>
                  <button
                    onClick={() => setMixMatchOpen(true)}
                    className="neumorphic-btn accent-btn"
                    style={{
                      flex: 1,
                      padding: '7px 4px',
                      fontSize: '0.7rem',
                      borderRadius: '10px'
                    }}
                  >
                    Crie seu próprio tema
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {swapSourceIndex !== null && (
          <div style={{
            background: 'rgba(var(--accent-rgb), 0.05)',
            border: '1.5px solid var(--accent-color)',
            padding: '10px 14px',
            borderRadius: '12px',
            marginBottom: '15px',
            fontSize: '0.82rem',
            textAlign: 'center',
            color: 'var(--text-primary)',
            fontWeight: '600',
            animation: 'fadeIn 0.2s'
          }}>
            Modo Mover Ativo: Clique em qualquer prateleira/slot para transferir o item.
            <button 
              onClick={() => setSwapSourceIndex(null)}
              style={{
                marginLeft: '12px',
                background: 'none',
                border: 'none',
                color: '#c75e43',
                cursor: 'pointer',
                fontWeight: '700',
                textDecoration: 'underline'
              }}
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Shelf structure */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '35px', 
          position: 'relative',
          paddingBottom: '20px',
          width: '100%'
        }}>
          {(() => {
            const columns = isMobile ? 3 : 4;
            const rows = [];
            for (let i = 0; i < slotsGrid.length; i += columns) {
              rows.push(slotsGrid.slice(i, i + columns));
            }
            return rows.map((rowSlots, rIdx) => (
              <div 
                key={`row-${rIdx}`}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: `repeat(${columns}, 1fr)`, 
                  gap: '15px', 
                  position: 'relative',
                  paddingBottom: '24px',
                  width: '100%',
                  zIndex: 2
                }}
              >
                {rowSlots.map(slot => {
                  if (!slot.item) {
                    const isMovingDest = swapSourceIndex !== null;
                    const isDragOver = dragOverIndex === slot.index;
                    return (
                      <div
                        key={`empty-${slot.index}`}
                        onClick={() => !visitorUid && handleOpenItemSelector(slot.index)}
                        onDragOver={(e) => handleDragOver(e, slot.index)}
                        onDragLeave={(e) => handleDragLeave(e, slot.index)}
                        onDrop={(e) => handleDrop(e, slot.index)}
                        style={{
                          height: slotHeight,
                          border: isDragOver 
                            ? '2.5px dashed var(--accent-color)' 
                            : (isMovingDest ? '2.5px dashed var(--accent-color)' : '2px dashed var(--card-border)'),
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          background: isDragOver
                            ? 'rgba(var(--accent-rgb), 0.12)'
                            : (isMovingDest ? 'rgba(var(--accent-rgb), 0.05)' : 'rgba(0,0,0,0.01)'),
                          boxShadow: isDragOver ? '0 0 12px rgba(var(--accent-rgb), 0.35)' : 'var(--shadow-inset)',
                          transform: isDragOver ? 'scale(1.02)' : 'none',
                          transition: 'all 0.2s',
                          zIndex: 2
                        }}
                      >
                        <span style={{ fontSize: '1.6rem', color: (isDragOver || isMovingDest) ? 'var(--accent-color)' : 'var(--text-secondary)' }}>+</span>
                      </div>
                    );
                  }

                  // Occupied slot resolving details
                  const item = slot.item;
                  let element = null;
                  let title = '';
                  let border = 'rgba(0,0,0,0.05)';
                  let label = '';
                  let plant = null;

                  if (item.type === 'plant') {
                    plant = (state.museumItems || []).find(p => p.id === item.itemId);
                    if (plant) {
                      const sub = (state.subjects || []).find(s => s.id === plant.subjectId || s.name?.toLowerCase() === plant.subjectName?.toLowerCase());
                      const finalGradeVal = plant.finalGrade || sub?.finalGrade || '';
                      const gradeNum = parseFloat(String(finalGradeVal || 0).replace(',', '.'));
                      const isConcluded = Boolean(plant.isConcludedPlant || plant.id?.startsWith('concluded_plant_'));
                      const isGolden = Boolean(plant.isGolden || (isConcluded && gradeNum >= 8.5));

                      const activeTheme = state.settings?.activeTheme;
                      const customTheme = state.settings?.customTheme;
                      const customBioma = (activeTheme === 'custom' && customTheme) ? customTheme.plantBiomaId : 'default';
                      const plantColor = customBioma === 'default' 
                        ? plant.subjectColor 
                        : getBiomaColor(customBioma, plant.level || getPlantRank(plant.minutes).level);

                      border = isConcluded ? (isGolden ? '#ffd700' : '#94a3b8') : plantColor;
                      label = plant.subjectName;
                      title = isConcluded 
                        ? `${plant.subjectName} (Matéria Concluída${finalGradeVal ? ' - Nota: ' + finalGradeVal : ''})`
                        : `${plant.subjectName} (${plant.minutes} min focado)`;

                      const plantSize = isConcluded ? (isGolden ? 58 : 52) : 46;

                      element = (
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: '62px', width: '100%' }}>
                          {renderMicroPlant(
                            plantColor, 
                            plant.wiltCount > 0, 
                            plant.level || getPlantRank(plant.minutes).level, 
                            plant.seed || 0.5,
                            plantSize,
                            isConcluded,
                            isGolden
                          )}
                        </div>
                      );

                      // Store calculated values on temporary object for layout below
                      plant._isConcluded = isConcluded;
                      plant._isGolden = isGolden;
                      plant._finalGrade = finalGradeVal;
                    }
                  } else {
                    const dec = (state.gardenDecorations || []).find(d => d.id === item.itemId);
                    if (dec) {
                      const sub = state.subjects.find(s => s.id === dec.subjectId);
                      border = sub ? sub.color : 'var(--accent-color)';
                      label = sub ? sub.name : 'Decoração';
                      title = sub ? `Relíquia: ${sub.name}` : 'Relíquia';
                      element = (
                        <div style={{ height: '62px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <DecorationSVG type={dec.type} color={border} size={38} />
                        </div>
                      );
                    }
                  }

                  const isCurrentSource = swapSourceIndex === slot.index;
                  const isDragOver = dragOverIndex === slot.index;
                  const isDragged = draggedIndex === slot.index;
                  const isConcluded = plant?._isConcluded;
                  const isGolden = plant?._isGolden;

                  return (
                    <div
                      key={`item-${slot.index}`}
                      onClick={() => !visitorUid && handleOpenItemMenu(slot.index, item)}
                      draggable={!visitorUid ? "true" : "false"}
                      onDragStart={(e) => !visitorUid && handleDragStart(e, slot.index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, slot.index)}
                      onDragLeave={(e) => handleDragLeave(e, slot.index)}
                      onDrop={(e) => handleDrop(e, slot.index)}
                      style={{
                        height: slotHeight,
                        border: isDragOver 
                          ? '2.5px dashed var(--accent-color)' 
                          : (isCurrentSource ? '2.5px solid var(--accent-color)' : `1.2px solid ${border}`),
                        borderRadius: '16px',
                        background: 'var(--bg-primary)',
                        boxShadow: isDragOver ? '0 0 12px rgba(var(--accent-rgb), 0.35)' : (isConcluded ? (isGolden ? '0 0 14px rgba(255,215,0,0.45)' : '0 0 8px rgba(148,163,184,0.3)') : 'var(--shadow-flat)'),
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 4px 8px 4px',
                        cursor: 'grab',
                        position: 'relative',
                        zIndex: 2,
                        transition: 'all 0.2s',
                        transform: isDragOver ? 'scale(1.02)' : (isCurrentSource ? 'scale(1.04)' : 'none'),
                        opacity: isDragged ? 0.4 : ((swapSourceIndex !== null && !isCurrentSource) ? 0.75 : 1)
                      }}
                      onMouseEnter={(e) => {
                        if (swapSourceIndex === null && !isDragged) e.currentTarget.style.transform = 'translateY(-3px)';
                      }}
                      onMouseLeave={(e) => {
                        if (swapSourceIndex === null && !isDragged) e.currentTarget.style.transform = 'none';
                      }}
                      title={title}
                    >
                      {element}
                      
                      {/* Custom Slot display styles */}
                      {displayStyle === 'minimal' && (
                        <div style={{
                          fontSize: '7.5px',
                          background: 'var(--panel-bg)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          textAlign: 'center',
                          border: `1px solid ${border}`,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          maxWidth: '90%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {label}
                        </div>
                      )}

                      {displayStyle === 'focus' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center', width: '95%' }}>
                          <div style={{
                            fontSize: '7.5px',
                            background: 'var(--panel-bg)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            textAlign: 'center',
                            border: `1px solid ${border}`,
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            maxWidth: '90%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {label}
                          </div>
                          <span style={{ fontSize: '7.5px', color: isConcluded ? (isGolden ? '#ffd700' : 'var(--accent-color)') : 'var(--text-secondary)', fontWeight: '700' }}>
                            {item.type === 'plant' 
                              ? (isConcluded ? (isGolden ? getLegendaryRankName(plant?.seed, plant?._gradeNum || 9, plant?.subjectName) : 'Matéria Concluída') : `${plant?.minutes} min`) 
                              : 'Relíquia'}
                          </span>
                        </div>
                      )}

                      {displayStyle === 'details' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center', width: '95%' }}>
                          <div style={{
                            fontSize: '7.5px',
                            background: 'var(--panel-bg)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            textAlign: 'center',
                            border: `1px solid ${border}`,
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            maxWidth: '90%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {label}
                          </div>
                          <span style={{ fontSize: '7.5px', fontWeight: '700', color: isConcluded ? (isGolden ? '#ffd700' : 'var(--text-primary)') : 'var(--text-primary)' }}>
                            {item.type === 'plant' 
                              ? (isConcluded ? (isGolden ? getLegendaryRankName(plant?.seed, plant?._gradeNum || 9, plant?.subjectName) : 'Matéria Concluída') : `${plant?.minutes} min`) 
                              : 'Relíquia'}
                          </span>
                          {item.type === 'plant' && plant && (
                            <>
                              <span style={{ fontSize: '6.5px', color: 'var(--text-secondary)' }}>{plant.date}</span>
                              <span style={{ fontSize: '6.5px', color: isConcluded ? (isGolden ? '#ffd700' : '#64748b') : 'var(--text-secondary)', fontWeight: isConcluded ? '700' : '400', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                                {isConcluded ? `Nota: ${plant._finalGrade || 'Concluída'}` : plant.rankName}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {/* Wooden plank for this shelf level */}
                <div 
                  style={{ 
                    position: 'absolute', 
                    left: '-15px', 
                    right: '-15px', 
                    bottom: '8px', 
                    height: '8px', 
                    background: 'var(--shelf-bg, #8f7762)', 
                    borderRadius: '4px', 
                    border: '1.2px solid var(--shelf-border, #6e5948)', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.06)', 
                    zIndex: 1 
                  }} 
                />
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Item Selector Popover */}
      {itemSelectorOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '20px'
        }}>
          <div className="neumorphic-card" style={{
            width: '100%',
            maxWidth: '560px',
            background: 'var(--panel-bg)',
            maxHeight: '80vh',
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Exibir no Slot {selectedSlotIndex + 1}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Selecione um item disponível no seu acervo para colocar na estufa.
              </p>
            </div>

            {/* Plants Section */}
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Florescimentos Cultivados ({unplacedPlants.length})</span>
              {unplacedPlants.length === 0 ? (
                <div style={{ padding: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center' }}>
                  Nenhuma planta livre. Complete sessões de estudo para cultivar!
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))', gap: '10px', marginTop: '8px' }}>
                  {unplacedPlants.map(plant => (
                    <div
                      key={plant.id}
                      onClick={() => handleSelectItem('plant', plant.id)}
                      style={{
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--card-border)',
                        borderRadius: '12px',
                        padding: '10px 6px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-flat)',
                        transition: 'transform 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                    >
                      <div style={{ transform: 'scale(0.95)' }}>
                        {renderMicroPlant(
                          plant.subjectColor, 
                          plant.wiltCount > 0, 
                          plant.level, 
                          plant.seed, 
                          36, 
                          plant.isConcludedPlant, 
                          plant.isGolden
                        )}
                      </div>
                      <span style={{ fontSize: '8px', color: 'var(--text-primary)', marginTop: '6px', fontWeight: '600', textAlign: 'center' }}>
                        {plant.subjectName}
                      </span>
                      <span style={{ fontSize: '7px', color: plant.isConcludedPlant ? (plant.isGolden ? '#ffd700' : 'var(--accent-color)') : 'var(--text-secondary)', marginTop: '2px', fontWeight: plant.isConcludedPlant ? '700' : '400' }}>
                        {plant.isConcludedPlant ? (plant.isGolden ? 'Lendária Aurum' : 'Matéria Concluída') : `${plant.minutes} min`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Decorations Section */}
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Relíquias da Loja ({unplacedDecs.length})</span>
              {unplacedDecs.length === 0 ? (
                <div style={{ padding: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center' }}>
                  Nenhuma decoração no acervo. Compre itens na Loja!
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))', gap: '10px', marginTop: '8px' }}>
                  {unplacedDecs.map(dec => {
                    const sub = state.subjects.find(s => s.id === dec.subjectId);
                    const color = sub ? sub.color : 'var(--accent-color)';
                    return (
                      <div
                        key={dec.id}
                        onClick={() => handleSelectItem('decoration', dec.id)}
                        style={{
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--card-border)',
                          borderRadius: '12px',
                          padding: '12px 6px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: 'var(--shadow-flat)',
                          transition: 'transform 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                      >
                        <DecorationSVG type={dec.type} color={color} size={30} />
                        <span style={{ fontSize: '8px', color: 'var(--text-primary)', marginTop: '8px', fontWeight: '600', textAlign: 'center' }}>
                          {sub ? sub.name : 'Geral'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button 
              className="neumorphic-btn" 
              onClick={() => setItemSelectorOpen(false)}
              style={{ padding: '10px', borderRadius: '10px', width: '100%', border: 'none', color: '#c75e43' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Item Action Overlay Menu */}
      {activeItemMenu && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 998,
          padding: '20px'
        }}>
          <div className="neumorphic-card" style={{
            width: '100%',
            maxWidth: '340px',
            background: 'var(--panel-bg)',
            padding: '24px',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-flat)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              Slot {activeItemMenu.slotIndex + 1}
            </h4>

            {/* FULL PLANT / DECORATION VISUAL PREVIEW & DETAILS */}
            {(() => {
              const item = activeItemMenu.item;
              if (!item) return null;

              if (item.type === 'plant') {
                const plant = (state.museumItems || []).find(p => p.id === item.itemId);
                if (!plant) return null;

                const gradeNum = parseFloat(String(plant.finalGrade || 0).replace(',', '.'));
                const isConcluded = Boolean(plant.isConcludedPlant || plant.id?.startsWith('concluded_plant_'));
                const isGolden = Boolean(plant.isGolden || (isConcluded && gradeNum >= 8.5));
                const rankTitle = isConcluded 
                  ? (isGolden ? getLegendaryRankName(plant.seed, gradeNum, plant.subjectName) : 'Flor da Vitória Cristalina')
                  : (plant.rankName || getPlantRank(plant.minutes).name);

                return (
                  <div style={{
                    background: 'var(--bg-primary)',
                    padding: '16px',
                    borderRadius: '16px',
                    border: `1.5px solid ${isConcluded ? (isGolden ? '#ffd700' : '#94a3b8') : (plant.subjectColor || 'var(--accent-color)')}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{ transform: 'scale(1.15)', margin: '10px 0' }}>
                      {renderMicroPlant(
                        plant.subjectColor,
                        plant.wiltCount > 0,
                        plant.level || getPlantRank(plant.minutes).level,
                        plant.seed || 0.5,
                        isConcluded ? (isGolden ? 64 : 56) : 48,
                        isConcluded,
                        isGolden
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {plant.subjectName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: isGolden ? '#ffd700' : 'var(--accent-color)', fontWeight: '700', marginTop: '2px' }}>
                        {rankTitle}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {isConcluded ? `Nota de Conclusão: ${plant.finalGrade || 'Concluída'}` : `${plant.minutes} minutos de foco`}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {plant.date}
                      </div>
                    </div>
                  </div>
                );
              } else {
                const dec = (state.gardenDecorations || []).find(d => d.id === item.itemId);
                const sub = dec ? state.subjects.find(s => s.id === dec.subjectId) : null;
                const decColor = sub ? sub.color : 'var(--accent-color)';
                const decName = sub ? `Relíquia de ${sub.name}` : 'Relíquia da Loja';

                return (
                  <div style={{
                    background: 'var(--bg-primary)',
                    padding: '16px',
                    borderRadius: '16px',
                    border: `1.5px solid ${decColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{ padding: '10px' }}>
                      <DecorationSVG type={dec?.type} color={decColor} size={54} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                        {decName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Item Decorativo da Estufa
                      </div>
                    </div>
                  </div>
                );
              }
            })()}

            <button 
              className="neumorphic-btn" 
              onClick={() => handleStartMove(activeItemMenu.slotIndex)}
              style={{ width: '100%', padding: '10px', borderRadius: '10px', fontSize: '0.85rem' }}
            >
              Mover Item
            </button>

            <button 
              className="neumorphic-btn" 
              onClick={() => handleRemoveItem(activeItemMenu.slotIndex)}
              style={{ width: '100%', padding: '10px', borderRadius: '10px', color: '#c75e43', fontSize: '0.85rem' }}
            >
              Retirar da Estufa
            </button>

            <button 
              className="neumorphic-btn" 
              onClick={() => setActiveItemMenu(null)}
              style={{ width: '100%', padding: '8px', borderRadius: '10px', border: 'none', background: 'transparent', boxShadow: 'none', fontSize: '0.85rem', color: 'var(--text-secondary)' }}
            >
              Voltar
            </button>
          </div>
        </div>
      )}

      {/* Store Pop-up Modal */}
      {storeOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001,
          padding: '20px'
        }}>
          <div className="neumorphic-card" style={{
            width: '100%',
            maxWidth: '650px',
            background: 'var(--panel-bg)',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'relative',
            animation: 'fadeIn 0.25s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Loja de Relíquias Botânicas</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Transfigure seu orvalho em símbolos minimalistas das áreas do conhecimento.
                </p>
              </div>
              <button 
                onClick={() => setStoreOpen(false)}
                className="neumorphic-btn"
                style={{ padding: '6px 12px', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Fechar
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
              {shopItems.map((item) => (
                <div 
                  key={item.type}
                  onClick={() => setSelectedItemType(item.type)}
                  style={{
                    border: `1.5px solid ${selectedItemType === item.type ? 'var(--accent-color)' : 'rgba(0,0,0,0.04)'}`,
                    background: selectedItemType === item.type ? 'rgba(var(--accent-rgb), 0.04)' : 'var(--bg-primary)',
                    boxShadow: selectedItemType === item.type ? 'var(--shadow-inset)' : 'var(--shadow-flat)',
                    borderRadius: '16px',
                    padding: '18px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <DecorationSVG type={item.type} color="var(--accent-color)" size={44} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.88rem', color: 'var(--text-primary)' }}>{item.name}</div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.desc}</div>
                    <div style={{ fontWeight: '700', color: 'var(--accent-color)', fontSize: '0.85rem', marginTop: '8px' }}>
                      {item.cost} Orvalho
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '16px', 
              alignItems: 'flex-end', 
              background: 'var(--bg-primary)', 
              padding: '16px', 
              borderRadius: '16px',
              border: '1px solid var(--card-border)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '180px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.02em', textTransform: 'uppercase', fontWeight: '600' }}>
                  Associar à Matéria
                </label>
                <select 
                  className="input-field" 
                  value={selectedSubjectId} 
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  style={{ width: '100%', background: 'var(--panel-bg)' }}
                >
                  {state.subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <button 
                className="neumorphic-btn accent-btn" 
                onClick={handleBuy}
                style={{ padding: '12px 28px', flexShrink: 0, borderRadius: '14px' }}
              >
                Adquirir Relíquia
              </button>
            </div>

            {alertMsg && (
              <div style={{ 
                textAlign: 'center', 
                color: alertMsg.includes('insuficiente') ? '#c75e43' : 'var(--accent-color)',
                fontWeight: '600',
                fontSize: '0.85rem'
              }}>
                {alertMsg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sharing Postcard Studio Modal */}
      {shareModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div className="neumorphic-card" style={{
            width: '100%',
            maxWidth: '900px',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: '24px',
            background: 'var(--panel-bg)',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px'
          }}>
            {/* Left preview card */}
            <div style={{
              flex: '1.2',
              minWidth: '280px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Visualização do Postal</h3>
              <div style={{
                width: '100%',
                background: 'var(--bg-primary)',
                borderRadius: '16px',
                padding: '10px',
                boxShadow: 'var(--shadow-inset)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <canvas 
                  ref={canvasRef} 
                  style={{
                    maxWidth: '100%',
                    maxHeight: '380px',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
                  }}
                />
              </div>
            </div>

            {/* Right configuration side */}
            <div style={{
              flex: '1',
              minWidth: '260px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Compartilhar minha estufa</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Escolha uma lente e personalize o tema para exportar seu progresso botânico.
                </p>

                {/* Template selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Selecione a Lente</span>
                  {[
                    { id: 'bioma', title: 'Postal: Minha Estufa', desc: 'Visualização limpa da sua estufa de slots (800x600)' },
                    { id: 'elite', title: 'Catálogo de Elite', desc: 'Top 3 maiores plantas em terrários (Stories 9:16)' },
                    { id: 'shelf', title: 'Prateleira do Saber', desc: 'Distribuição vertical por matérias (Stories 9:16)' }
                  ].map(temp => (
                    <button
                      key={temp.id}
                      onClick={() => setShareTemplate(temp.id)}
                      style={{
                        background: shareTemplate === temp.id ? 'var(--accent-color)' : 'var(--bg-primary)',
                        color: shareTemplate === temp.id ? '#fff' : 'var(--text-primary)',
                        border: '1px solid var(--card-border)',
                        borderRadius: '12px',
                        padding: '12px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-flat)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{temp.title}</div>
                      <div style={{ fontSize: '0.72rem', color: shareTemplate === temp.id ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)', marginTop: '2px' }}>{temp.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Postcard Theme Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Tema do Postal</span>
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    overflowX: 'auto', 
                    paddingBottom: '8px',
                    scrollbarWidth: 'thin'
                  }}>
                    {ALL_THEMES.map(t => {
                      const isSel = shareTheme === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setShareTheme(t.id)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            padding: '6px 4px',
                            borderRadius: '10px',
                            background: isSel ? 'rgba(var(--accent-rgb), 0.15)' : 'transparent',
                            border: isSel ? '1.5px solid var(--accent-color)' : '1.5px solid transparent',
                            minWidth: '54px',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${t.bg} 0%, ${t.accent} 100%)`,
                            border: '1px solid var(--card-border)',
                            boxShadow: isSel ? 'var(--shadow-inset)' : 'var(--shadow-flat)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '0.65rem'
                          }}>
                            {isSel && '✓'}
                          </div>
                          <span style={{ 
                            fontSize: '0.58rem', 
                            color: isSel ? 'var(--accent-color)' : 'var(--text-secondary)',
                            fontWeight: '600',
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            width: '54px'
                          }}>
                            {t.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  className="neumorphic-btn accent-btn" 
                  onClick={handleDownloadPostcard}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', fontWeight: '600' }}
                >
                  Baixar Imagem (PNG)
                </button>

                <button 
                  className="neumorphic-btn" 
                  onClick={handleCopyLink}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', fontWeight: '600' }}
                >
                  {copied ? 'Link Copiado!' : 'Copiar Link de Visita'}
                </button>

                {/* Social Networks Share */}
                <div style={{ marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' }}>
                    Compartilhar Direto
                  </span>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      onClick={() => {
                        const link = generateShareLink();
                        const text = `Confira meu Santuário de Estudos Pomodoro! Criei um jardim com minhas conquistas: ${link}`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="neumorphic-btn"
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        fontSize: '0.72rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <IconWhatsApp size={14} /> WhatsApp
                    </button>

                    <button
                      onClick={() => {
                        const link = generateShareLink();
                        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`, '_blank');
                      }}
                      className="neumorphic-btn"
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        fontSize: '0.72rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <IconLinkedIn size={14} /> LinkedIn
                    </button>
                  </div>

                  <div style={{
                    background: 'rgba(var(--accent-rgb), 0.05)',
                    border: '1px dashed var(--accent-color)',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    fontSize: '0.68rem',
                    color: 'var(--text-primary)',
                    textAlign: 'center',
                    marginTop: '2px'
                  }}>
                    <IconInstagram size={14} /> <strong>Instagram:</strong> Baixe o Postal acima e poste no seu Feed ou Stories marcando nosso santuário!
                  </div>
                </div>

                <button 
                  className="neumorphic-btn" 
                  onClick={() => setShareModalOpen(false)}
                  style={{ width: '100%', padding: '10px', borderRadius: '12px', background: 'transparent', boxShadow: 'none', border: 'none', color: '#c75e43' }}
                >
                  Fechar Modo Estúdio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GardenView;
