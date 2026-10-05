// Autor: Antônio Costa Leite
// Aplicação Principal - Gestão de Foco, Produtividade e Estudos (O Santuário)

import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { db } from './utils/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { drawPlantToCanvas, drawDecorationToCanvas } from './utils/plantRenderer';
import { ALL_THEMES, THEME_VARIABLES } from './utils/themeConstants';
import { renderMicroPlant } from './utils/plantRenderer';
import Dashboard from './components/Dashboard';
import GardenView, { getBiomaColor } from './components/GardenView';
import FocusZone from './components/FocusZone';
import Library from './components/Library';
import Checkout from './components/Checkout';
import AuthScreen from './components/AuthScreen';
import AgendaView, { IconCalendar } from './components/AgendaView';
import SubjectCreator from './components/SubjectCreator';
import OnboardingWizard from './components/OnboardingWizard';
import VillageView, { StudentAvatar } from './components/VillageView';
import AlarmModal from './components/AlarmModal';

// Crisp line-art SVG icons for navigation (matching weights and roundings)
const IconUsers = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PRESET_AVATARS = [
  { id: 'avatar_1', name: 'Broto de Hortelã', icon: '🌱' },
  { id: 'avatar_2', name: 'Flor Geometrica', icon: '🌸' },
  { id: 'avatar_3', name: 'Bonsai Curvo', icon: '🌳' },
  { id: 'avatar_4', name: 'Modelo Anatômico', icon: '💀' },
  { id: 'avatar_5', name: 'Astrolábio Dourado', icon: '🧭' }
];

const IconLeaf = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c0 0 8-4 8-10c0-5.5-4-10-8-10S4 6.5 4 12c0 6 8 10 8 10z" />
    <path d="M12 2v20" />
    <path d="M12 12c4-2 6-5 6-5" />
    <path d="M12 15c-3-2-5-5-5-5" />
  </svg>
);

const IconTimer = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="13" r="8" />
    <path d="M12 5V2" />
    <path d="M9 2h6" />
    <path d="M12 10v3l2 2" />
  </svg>
);

const IconBook = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

function SantuarioContent() {
  const { 
    currentUser, 
    state, 
    loading, 
    addTask,
    themesCatalogOpen,
    setThemesCatalogOpen,
    mixMatchOpen,
    setMixMatchOpen,
    previewThemeId,
    setPreviewThemeId,
    setTheme,
    updateCustomTheme,
    saveCustomThemePreset,
    sendCloneNotification,
    sendSocialReaction,
    deleteCreatedTheme,
    deleteCopiedTheme,
    getLocalDateString,
    activeTriggeredAlarm,
    dismissTriggeredAlarm,
    snoozeTriggeredAlarm
  } = useApp();
  const [activeTab, setActiveTab] = useState('garden'); // 'garden', 'focus', 'agenda', 'library'
  const [activeCustomizerTab, setActiveCustomizerTab] = useState('background'); // 'background', 'typography', ...
  const [customThemeDraft, setCustomThemeDraft] = useState(null);
  const [showAlarmModal, setShowAlarmModal] = useState(false);

  useEffect(() => {
    if (mixMatchOpen) {
      setCustomThemeDraft(state.settings?.customTheme || {
        backgroundId: 'light',
        typographyId: 'light',
        textColorId: 'light',
        accentColorId: 'light',
        containerId: 'light',
        plantBiomaId: 'default',
        audioPresetId: 'natureza'
      });
    }
  }, [mixMatchOpen, state.settings?.customTheme]);

  const [checkoutSession, setCheckoutSession] = useState(null); // { subjectId, minutesStudied }

  // Social & Admin States
  const [visitedUserUid, setVisitedUserUid] = useState(null);
  const [visitedUserData, setVisitedUserData] = useState(null);
  const [visitedMuralComments, setVisitedMuralComments] = useState([]);
  const [visitedMuralText, setVisitedMuralText] = useState('');
  const [catalogSubTab, setCatalogSubTab] = useState('system'); // 'system' | 'collection'
  const [globalEvent, setGlobalEvent] = useState(null);
  const [activeSeason, setActiveSeason] = useState('spring');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  // Admin Panel states
  const [adminEventTitle, setAdminEventTitle] = useState('Meta da Comunidade: Primavera Radiante');
  const [adminEventDesc, setAdminEventDesc] = useState('Cultive e foque para batermos a meta de horas.');
  const [adminEventTarget, setAdminEventTarget] = useState(50000);
  const [adminEventCurrent, setAdminEventCurrent] = useState(1280);
  const [adminEventActive, setAdminEventActive] = useState(false);
  const [adminSelectedSeason, setAdminSelectedSeason] = useState('spring');

  // Sync visitor parameters from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const visitUid = params.get('visit');
    if (visitUid) {
      setVisitedUserUid(visitUid);
    }
    const adminMode = params.get('admin');
    if (adminMode === 'true') {
      setShowAdminPanel(true);
    }
  }, []);

  // Carrega perfil do usuário para cabeçalho e mural
  useEffect(() => {
    if (visitedUserUid) {
      const userRef = doc(db, 'users', visitedUserUid);
      getDoc(userRef).then(snap => {
        if (snap.exists()) {
          setVisitedUserData(snap.data());
        }
      }).catch(e => console.warn("Error loading visited user profile details:", e));

      const q = query(collection(db, 'mural_comments'), where('targetUid', '==', visitedUserUid));
      getDocs(q).then(snap => {
        const comments = [];
        snap.forEach(d => {
          comments.push({ id: d.id, ...d.data() });
        });
        comments.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return b.timestamp - a.timestamp;
        });
        setVisitedMuralComments(comments);
      }).catch(e => console.warn("Error loading visited user mural:", e));
    } else {
      setVisitedUserData(null);
      setVisitedMuralComments([]);
    }
  }, [visitedUserUid]);

  // Read Global settings from Firestore
  useEffect(() => {
    const docRef = doc(db, 'global_settings', 'events');
    getDoc(docRef).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.activeEvent) {
          setGlobalEvent(data.activeEvent);
          setAdminEventTitle(data.activeEvent.title || '');
          setAdminEventDesc(data.activeEvent.description || '');
          setAdminEventTarget(data.activeEvent.targetMinutes || 50000);
          setAdminEventCurrent(data.activeEvent.currentMinutes || 1280);
          setAdminEventActive(data.activeEvent.isActive || false);
        }
        if (data.currentSeason) {
          setActiveSeason(data.currentSeason);
          setAdminSelectedSeason(data.currentSeason);
        }
      }
    }).catch(e => console.warn("Could not load global settings from Firestore:", e));
  }, []);

  // Shared Garden visitor states
  const [sharedGardenData, setSharedGardenData] = useState(null);
  const [showSharedGardenModal, setShowSharedGardenModal] = useState(false);

  // Modal displays triggered by Universal FAB (+)
  const [showSubjectCreator, setShowSubjectCreator] = useState(false);
  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [showTaskSubDropdown, setShowTaskSubDropdown] = useState(false);
  const [showSettingsHUD, setShowSettingsHUD] = useState(false);

  // New task form fields
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubjectId, setTaskSubjectId] = useState('');
  const [taskType, setTaskType] = useState('prova'); // 'prova' | 'trabalho' | 'leitura' | 'outros'
  const [taskDate, setTaskDate] = useState(getLocalDateString());
  const [taskTime, setTaskTime] = useState('12:00');
  const [taskRecurringWeekly, setTaskRecurringWeekly] = useState(false);

  // taskSubjectId is initialized to empty string (Independent) by default

  // Sync data-mood and data-theme attributes on body
  useEffect(() => {
    if (state?.settings?.mood) {
      document.body.setAttribute('data-mood', state.settings.mood);
    }
  }, [state?.settings?.mood]);

  useEffect(() => {
    if (state?.settings?.activeTheme) {
      const themeVal = state.settings.activeTheme;
      document.body.setAttribute('data-theme', themeVal);

      if (themeVal === 'custom' && state.settings.customTheme) {
        const ct = state.settings.customTheme;
        const bgVars = THEME_VARIABLES[ct.backgroundId || 'light'] || THEME_VARIABLES.light;
        const tyVars = THEME_VARIABLES[ct.typographyId || 'light'] || THEME_VARIABLES.light;
        const tcVars = THEME_VARIABLES[ct.textColorId || 'light'] || THEME_VARIABLES.light;
        const acVars = THEME_VARIABLES[ct.accentColorId || 'light'] || THEME_VARIABLES.light;
        const coVars = THEME_VARIABLES[ct.containerId || 'light'] || THEME_VARIABLES.light;

        const mergedVars = {
          '--bg-primary': bgVars.bgPrimary,
          '--bg-gradient': bgVars.bgGradient,
          '--font-title': tyVars.fontTitle,
          '--font-body': tyVars.fontBody,
          '--text-primary': tcVars.textPrimary,
          '--text-secondary': tcVars.textSecondary,
          '--accent-color': acVars.accentColor,
          '--accent-light': acVars.accentLight,
          '--accent-rgb': acVars.accentRgb,
          '--panel-bg': coVars.panelBg,
          '--panel-bg-rgba': coVars.panelBgRgba,
          '--card-border': coVars.cardBorder,
          '--shelf-bg': coVars.shelfBg,
          '--shelf-border': coVars.shelfBorder,
          '--pot-color': coVars.potColor,
          '--filter': bgVars.filter || 'none',
          '--text-shadow': tyVars.textShadow || 'none'
        };

        Object.entries(mergedVars).forEach(([k, v]) => {
          document.body.style.setProperty(k, v);
        });
      } else {
        const varsToClear = [
          '--bg-primary', '--bg-gradient', '--font-title', '--font-body',
          '--text-primary', '--text-secondary', '--accent-color', '--accent-light', '--accent-rgb',
          '--panel-bg', '--panel-bg-rgba', '--card-border', '--shelf-bg', '--shelf-border', '--pot-color',
          '--filter', '--text-shadow'
        ];
        varsToClear.forEach(v => document.body.style.removeProperty(v));
      }
    }
  }, [state?.settings?.activeTheme, state?.settings?.customTheme]);

  // Scroll window to top whenever activeTab changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Capture Google Calendar OAuth 2.0 Access Token from URL redirect hash
  useEffect(() => {
    if (window.location.hash) {
      const hashStr = window.location.hash.substring(1);
      const params = new URLSearchParams(hashStr);
      const accessToken = params.get('access_token');
      const stateParam = params.get('state');
      
      if (accessToken && stateParam === 'google-calendar-sync') {
        localStorage.setItem('google_calendar_access_token', accessToken);
        // Clear hash from URL
        window.history.replaceState(null, null, ' ');
        // Notify AgendaView to trigger Google Calendar sync
        window.dispatchEvent(new Event('google-calendar-token-received'));
      }
    }
  }, []);

  // Parse shared garden data on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareBase64 = params.get('share');
    if (shareBase64) {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(shareBase64))));
        if (decoded && decoded.n) {
          setSharedGardenData(decoded);
          setShowSharedGardenModal(true);
        }
      } catch (e) {
        console.warn("Failed to parse shared garden link:", e);
      }
      // Remove query string from URL for clean interface
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState(null, null, cleanUrl);
    }
  }, []);

  // Visited garden callback ref to draw on canvas dynamically when mounted (avoiding null/mount race conditions)
  const drawSharedGarden = React.useCallback((canvas) => {
    if (!canvas || !sharedGardenData) return;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 800;
    canvas.height = 600;
    
    // Draw Theme-specific background
    const activeTheme = state?.settings?.activeTheme || 'light';
    let bgColor1 = '#f9eae1';
    let bgColor2 = '#e8ece9';
    let bgColor3 = '#dce5e2';
    let fontColor = '#2b3531';
    let subFontColor = '#6b7571';
    let shelfColor = '#8f7762';
    let shelfStroke = '#6e5948';
    let statsBg = 'rgba(255,255,255,0.7)';

    if (activeTheme === 'dark') {
      bgColor1 = '#1e2522';
      bgColor2 = '#111614';
      bgColor3 = '#0a0d0c';
      fontColor = '#e8ece9';
      subFontColor = '#a2d2a4';
      shelfColor = '#343d39';
      shelfStroke = '#5c7365';
      statsBg = 'rgba(20,26,24,0.85)';
    } else if (activeTheme === 'nordic' || activeTheme === 'cozy' || activeTheme === 'creative') {
      bgColor1 = '#fcf8f2';
      bgColor2 = '#f4ebd9';
      bgColor3 = '#eae0cd';
      fontColor = '#4e3d30';
      subFontColor = '#8a7665';
      shelfColor = '#a3856b';
      shelfStroke = '#856a53';
      statsBg = 'rgba(255,250,242,0.85)';
    }

    const grad = ctx.createRadialGradient(400, 600, 50, 400, 600, 600);
    grad.addColorStop(0, bgColor1);
    grad.addColorStop(0.5, bgColor2);
    grad.addColorStop(1, bgColor3);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 600);
    
    // Draw shelves based on grid size
    const slots = sharedGardenData.slots || [];
    const maxIdx = slots.reduce((max, s) => s.idx > max ? s.idx : max, 11);
    const rowsCount = maxIdx >= 12 ? 4 : maxIdx < 8 ? 2 : 3;
    
    const shelvesY = [];
    for (let r = 0; r < rowsCount; r++) {
      const sy = 160 + r * (330 / Math.max(1, rowsCount - 1 || 1));
      shelvesY.push(sy);
      
      ctx.fillStyle = shelfColor;
      ctx.fillRect(80, sy, 640, 10);
      ctx.strokeStyle = shelfStroke;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(80, sy, 640, 10);
    }
    
    // Draw grid items (slots)
    slots.forEach(slot => {
      const row = Math.floor(slot.idx / 4);
      const col = slot.idx % 4;
      const cy = shelvesY[row] || 260;
      const cx = 160 + col * 160;
      
      if (slot.t === 'plant') {
        drawPlantToCanvas(ctx, cx, cy, 1.25, slot.c, slot.w, slot.lvl, slot.sd);
      } else {
        drawDecorationToCanvas(ctx, slot.t, cx, cy, 46, slot.c);
      }
    });
    
    // Header Text
    ctx.fillStyle = fontColor;
    ctx.font = 'bold 28px serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Estufa de ${sharedGardenData.n}`, 400, 60);
    ctx.font = 'italic 14px sans-serif';
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
    ctx.fillText(`Streak: ${sharedGardenData.s} dias`, 170, 570);
    ctx.textAlign = 'center';
    ctx.fillText(`Tempo Focado: ${sharedGardenData.m} min`, 400, 570);
    ctx.textAlign = 'right';
    ctx.fillText('santuario-pomodoro.vercel.app', 630, 570);
  }, [sharedGardenData, state?.settings?.activeTheme]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '24px',
        background: 'var(--bg-gradient)',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        transition: 'background-color 0.3s ease'
      }}>
        <div className="breath-animation">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22c0 0 8-4 8-10c0-5.5-4-10-8-10S4 6.5 4 12c0 6 8 10 8 10z" />
          </svg>
        </div>
        <p style={{ 
          fontFamily: 'var(--font-title)', 
          fontStyle: 'italic', 
          fontSize: '1.1rem',
          color: 'var(--text-secondary)',
          letterSpacing: '0.02em'
        }}>
          Cultivando o seu santuário...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  if (state.onboardingCompleted === false) {
    return <OnboardingWizard />;
  }

  if (visitedUserUid) {
    const vName = visitedUserData?.profile?.nickname || 'Cultivador';
    const vTitle = visitedUserData?.profile?.title || 'Jardineiro de Santuários';
    const vStreak = visitedUserData?.streak || 0;
    const totalVMinutes = visitedUserData?.subjects?.reduce((sum, s) => sum + s.focusMinutes, 0) || 0;
    const vHours = (totalVMinutes / 60).toFixed(1);

    let favSubject = 'Nenhum';
    if (visitedUserData?.subjects?.length > 0) {
      const sorted = [...visitedUserData.subjects].sort((a,b) => b.focusMinutes - a.focusMinutes);
      favSubject = sorted[0].name;
    }

    const isFriendOfVisited = (visitedUserData?.friends || []).some(f => f.uid === currentUser.uid);
    const hasVisitedAsFriend = (state.friends || []).some(f => f.uid === visitedUserUid);
    const isMutualFriend = isFriendOfVisited && hasVisitedAsFriend;
    const isMuralActive = visitedUserData?.profile?.muralPrivateToggle !== true;

    const handleSendMuralComment = async () => {
      if (!visitedMuralText.trim()) return;
      try {
        const newComment = {
          targetUid: visitedUserUid,
          authorUid: currentUser.uid,
          authorName: state.profile?.nickname || 'Cultivador',
          authorShortId: state.profile?.shortId || 'Cultivador#0000',
          message: visitedMuralText.trim().substring(0, 140),
          isPinned: false,
          timestamp: Date.now()
        };
        await addDoc(collection(db, 'mural_comments'), newComment);
        setVisitedMuralText('');
        alert("Recado enviado!");
        // Reload comments
        const q = query(collection(db, 'mural_comments'), where('targetUid', '==', visitedUserUid));
        const snap = await getDocs(q);
        const list = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() }));
        list.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return b.timestamp - a.timestamp;
        });
        setVisitedMuralComments(list);
      } catch (e) {
        console.warn("Could not post comment:", e);
      }
    };

    return (
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '20px' }}>
        <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Header Card */}
          <div className="neumorphic-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--panel-bg)', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <StudentAvatar
                customization={visitedUserData?.profile?.avatarCustomization}
                size={60}
                title={vTitle}
              />
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: '700' }}>Santuário de {vName}</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>{vTitle}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setVisitedUserUid(null);
                const activeTheme = state.settings?.activeTheme || 'light';
                document.body.setAttribute('data-theme', activeTheme);
                window.history.replaceState({}, document.title, window.location.pathname);
              }}
              className="neumorphic-btn"
              style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.8rem', color: '#c75e43', fontWeight: '600' }}
            >
              Voltar ao Meu Jardim
            </button>
          </div>

          {visitedUserData?.profile?.specialTribute && (
            <div
              className="neumorphic-card"
              style={{
                padding: '22px 24px',
                background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.18) 0%, rgba(255, 105, 180, 0.1) 100%)',
                borderRadius: '20px',
                border: '1.5px solid rgba(255, 105, 180, 0.35)',
                boxShadow: 'var(--shadow-flat)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.6rem', filter: 'drop-shadow(0 2px 4px rgba(255, 105, 180, 0.4))' }}>
                    {visitedUserData.profile.specialTribute.badge || '🌹'}
                  </span>
                  <div>
                    <h4 style={{ fontSize: '0.98rem', color: 'var(--text-primary)', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {visitedUserData.profile.specialTribute.title || "Homenagem Especial"}
                      <span style={{ fontSize: '0.65rem', background: 'rgba(255, 105, 180, 0.2)', color: '#d81b60', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                        Exclusivo
                      </span>
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      Concedido por {visitedUserData.profile.specialTribute.author || "Criador do Santuário"}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-primary)', padding: '5px 12px', borderRadius: '12px', border: '1px solid rgba(255, 105, 180, 0.3)', fontSize: '0.75rem', color: '#d81b60', fontWeight: '700' }}>
                  <span>💧 Custou 10 orvalhos</span>
                </div>
              </div>

              {visitedUserData.profile.specialTribute.message && (
                <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: '4px 0', lineHeight: '1.6', fontStyle: 'italic' }}>
                  "{visitedUserData.profile.specialTribute.message}"
                </p>
              )}

              {visitedUserData.profile.specialTribute.caption && (
                <div style={{ paddingTop: '8px', borderTop: '1px dashed rgba(255, 105, 180, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    ✨ {visitedUserData.profile.specialTribute.caption}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Orgulho Stats Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div className="neumorphic-card" style={{ padding: '16px', textAlign: 'center', background: 'var(--panel-bg)', borderRadius: '16px', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-flat)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Ofensiva</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="orange" strokeWidth="2.5">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
                <h4 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', fontWeight: '700', margin: 0 }}>{vStreak} Dias</h4>
              </div>
            </div>
            <div className="neumorphic-card" style={{ padding: '16px', textAlign: 'center', background: 'var(--panel-bg)', borderRadius: '16px', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-flat)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Foco Acumulado</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <h4 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', fontWeight: '700', margin: 0 }}>{vHours} Horas</h4>
              </div>
            </div>
            <div className="neumorphic-card" style={{ padding: '16px', textAlign: 'center', background: 'var(--panel-bg)', borderRadius: '16px', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-flat)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Matéria Favorita</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2.5">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                <h4 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: '700', margin: 0 }}>{favSubject}</h4>
              </div>
            </div>
          </div>

          {/* The Visited GardenView in museum mode */}
          <GardenView visitorUid={visitedUserUid} />

          {/* Ateliê (Custom themes of visited user) */}
          <div className="neumorphic-card" style={{ padding: '24px', background: 'var(--panel-bg)', borderRadius: '20px', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-flat)' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                <path d="M12 8A4 4 0 1 0 12 16A4 4 0 1 0 12 8Z" />
              </svg>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '700', margin: 0 }}>Ateliê de Temas</h4>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Clique para testar temporariamente ou copiar as criações estéticas deste autor.</p>
            
            {(!visitedUserData?.createdThemes || visitedUserData.createdThemes.length === 0) ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Este usuário ainda não publicou temas customizados.</p>
            ) : (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {visitedUserData.createdThemes.map(theme => (
                  <div
                    key={theme.id}
                    style={{
                      flex: '1 1 220px',
                      padding: '16px',
                      borderRadius: '16px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--card-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      boxShadow: 'var(--shadow-flat)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>{theme.name}</h5>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Salvo por {theme.downloadCount || 0}</span>
                    </div>

                    {/* Color Swatch Previews */}
                    {theme.config && (
                      <div style={{ display: 'flex', gap: '6px', margin: '4px 0' }}>
                        {['bg-primary', 'accent-color', 'panel-bg', 'text-primary'].map(prop => (
                          <div
                            key={prop}
                            style={{
                              width: '18px', height: '18px', borderRadius: '4px',
                              background: theme.config[prop] || '#ccc',
                              border: '1px solid var(--card-border)'
                            }}
                            title={prop}
                          />
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <button
                        onClick={() => {
                          if (theme.config) {
                            Object.keys(theme.config).forEach(key => {
                              document.body.style.setProperty(`--${key}`, theme.config[key]);
                            });
                          }
                        }}
                        className="neumorphic-btn"
                        style={{ flex: 1, padding: '6px', fontSize: '0.72rem', borderRadius: '8px' }}
                      >
                        Visualizar
                      </button>
                      <button
                        onClick={() => {
                          saveCustomThemePreset(theme.name, theme.config);
                          sendCloneNotification(visitedUserUid, theme.name);
                          alert(`Tema "${theme.name}" copiado com sucesso para sua coleção!`);
                        }}
                        className="neumorphic-btn accent-btn"
                        style={{ flex: 1, padding: '6px', fontSize: '0.72rem', borderRadius: '8px' }}
                      >
                        Copiar Tema
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Social reactions panel */}
          <div className="neumorphic-card" style={{ padding: '20px', textAlign: 'center', background: 'var(--panel-bg)', borderRadius: '20px', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-flat)' }}>
            <h4 style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: '700', marginBottom: '12px' }}>Deixe sua Admiração Silenciosa</h4>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              {[
                { id: 'regador', label: 'Regar', icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  </svg>
                )},
                { id: 'broto', label: 'Broto', icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 20h10M10 20V12a4 4 0 0 1 8 0M12 12a4 4 0 0 0-8 0v8" />
                  </svg>
                )},
                { id: 'sol', label: 'Sol', icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                  </svg>
                )}
              ].map(react => (
                <button
                  key={react.id}
                  onClick={() => {
                    sendSocialReaction(visitedUserUid, react.id);
                    alert(`Você enviou uma reação de ${react.label}!`);
                  }}
                  className="neumorphic-btn"
                  style={{
                    padding: '10px 18px',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {react.icon}
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{react.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Guestbook comments mural for visitors */}
          <div className="neumorphic-card" style={{ padding: '24px', background: 'var(--panel-bg)', borderRadius: '20px', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-flat)' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '700', marginBottom: '8px' }}>💬 Mural de Recados</h4>
            
            {!isMuralActive ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Este usuário desativou o mural de recados.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Write comment block */}
                {isMutualFriend ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <textarea
                      placeholder="Deixe um recado carinhoso para seu amigo (máx 140 caracteres)..."
                      value={visitedMuralText}
                      onChange={(e) => setVisitedMuralText(e.target.value.substring(0, 140))}
                      maxLength={140}
                      className="input-field"
                      style={{ padding: '8px 12px', height: '60px', resize: 'none', borderRadius: '10px' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{visitedMuralText.length} / 140</span>
                      <button onClick={handleSendMuralComment} className="neumorphic-btn accent-btn" style={{ padding: '6px 14px', fontSize: '0.78rem', borderRadius: '8px' }}>
                        Enviar Recado
                      </button>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    🔒 Apenas amigos mútuos podem escrever ou visualizar recados neste mural.
                  </p>
                )}

                {/* Mural list */}
                {isMutualFriend && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    {visitedMuralComments.length === 0 ? (
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Nenhum recado ainda neste mural.</p>
                    ) : (
                      visitedMuralComments.map(msg => (
                        <div
                          key={msg.id}
                          style={{
                            padding: '12px 16px',
                            background: 'var(--bg-primary)',
                            borderRadius: '12px',
                            border: msg.isPinned ? '1.5px solid var(--accent-color)' : '1px solid var(--card-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            position: 'relative'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                              {msg.authorName} <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>({msg.authorShortId})</span>
                            </span>
                            {msg.isPinned && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2.5">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              </svg>
                            )}
                          </div>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', margin: '4px 0' }}>{msg.message}</p>
                          <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', alignSelf: 'flex-end' }}>
                            {new Date(msg.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // Soft glowing concentric rings for companionship mode
  const renderCompanions = () => {
    if (!state.settings.companyMode) return null;
    
    return (
      <div className="particle-field">
        {[...Array(6)].map((_, i) => {
          const size = 15 + Math.random() * 25;
          const left = Math.random() * 100;
          const top = Math.random() * 75;
          const delay = Math.random() * 6;
          const duration = 12 + Math.random() * 10;
          return (
            <div
              key={i}
              className="particle"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                top: `${top}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`
              }}
            />
          );
        })}
      </div>
    );
  };

  const handleFabClick = () => {
    setShowFabMenu(!showFabMenu);
  };

  const handleCreateTaskSubmit = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask(taskTitle.trim(), taskSubjectId || '', taskType, taskDate, taskTime, taskRecurringWeekly);
    
    // Reset fields
    setTaskTitle('');
    setTaskSubjectId('');
    setTaskType('prova');
    setTaskDate(getLocalDateString());
    setTaskTime('12:00');
    setTaskRecurringWeekly(false);
    setShowTaskCreator(false);
  };

  return (
    <div className="app-container">
      {/* Immersive background rings */}
      {renderCompanions()}

      {/* Main Layout Wrapper */}
      <div className="content-wrapper">
        {checkoutSession ? (
          <Checkout 
            subjectId={checkoutSession.subjectId}
            minutesStudied={checkoutSession.minutesStudied}
            minutesBreak={checkoutSession.minutesBreak}
            wiltCount={checkoutSession.wiltCount}
            seed={checkoutSession.seed}
            onFinish={() => {
              setCheckoutSession(null);
              setActiveTab('garden');
            }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', flex: 1 }}>
             {/* Community Event Banner */}
             {globalEvent && (
               <div className="neumorphic-card" style={{
                 padding: '16px 20px',
                 background: 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.08) 0%, rgba(var(--accent-rgb), 0.02) 100%)',
                 border: '1.5px solid var(--accent-color)',
                 borderRadius: '20px',
                 display: 'flex',
                 flexDirection: 'column',
                 gap: '8px',
                 boxShadow: 'var(--shadow-flat)'
               }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ fontSize: '0.72rem', color: 'var(--accent-color)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                     🎉 Evento Coletivo Ativo
                   </span>
                   <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                     {((globalEvent.currentMinutes || 0) / 60).toFixed(0)}h / {((globalEvent.targetMinutes || 1) / 60).toFixed(0)}h
                   </span>
                 </div>
                 <h4 style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
                   {globalEvent.title}
                 </h4>
                 <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                   {globalEvent.description}
                 </p>
                 <div style={{ width: '100%', height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden', boxShadow: 'var(--shadow-inset)', marginTop: '4px' }}>
                   <div style={{
                     width: `${Math.min(100, ((globalEvent.currentMinutes || 0) / (globalEvent.targetMinutes || 1)) * 100)}%`,
                     height: '100%',
                     background: 'var(--accent-color)',
                     transition: 'width 0.4s'
                   }} />
                 </div>
               </div>
             )}

             {/* Admin Panel Modal Overlay */}
             {showAdminPanel && (
               <div style={{
                 position: 'fixed',
                 top: 0,
                 left: 0,
                 right: 0,
                 bottom: 0,
                 zIndex: 9999,
                 background: 'rgba(0,0,0,0.5)',
                 backdropFilter: 'blur(4px)',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 padding: '20px'
               }}>
                 <div className="neumorphic-card" style={{
                   maxWidth: '500px',
                   width: '100%',
                   background: 'var(--bg-primary)',
                   borderRadius: '24px',
                   padding: '24px',
                   border: '2px solid var(--accent-color)',
                   boxShadow: 'var(--shadow-flat)',
                   display: 'flex',
                   flexDirection: 'column',
                   gap: '16px',
                   animation: 'fadeIn 0.2s'
                 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>Painel Administrativo</h3>
                     <button
                       onClick={() => {
                         setShowAdminPanel(false);
                         window.history.replaceState({}, document.title, window.location.pathname);
                       }}
                       style={{ background: 'none', border: 'none', color: '#c75e43', fontSize: '1.2rem', cursor: 'pointer' }}
                     >
                       ✕
                     </button>
                   </div>

                   {!isAdminAuthenticated ? (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                       <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                         Digite a senha master para acessar as configurações globais de eventos e temporadas do app.
                       </p>
                       <input
                         type="password"
                         placeholder="Senha Master"
                         value={adminPassword}
                         onChange={(e) => setAdminPassword(e.target.value)}
                         className="input-field"
                         style={{ padding: '10px', borderRadius: '10px' }}
                       />
                       {adminError && <p style={{ fontSize: '0.78rem', color: '#c75e43', fontWeight: '600' }}>{adminError}</p>}
                       <button
                         onClick={async () => {
                           try {
                             const docRef = doc(db, 'global_settings', adminPassword);
                             const snap = await getDoc(docRef);
                             if (snap.exists() && snap.data().isAdmin === true) {
                               setIsAdminAuthenticated(true);
                               setAdminError('');
                             } else {
                               setAdminError('Senha master incorreta!');
                             }
                           } catch (e) {
                             setAdminError('Erro de autorização ou senha incorreta!');
                           }
                         }}
                         className="neumorphic-btn accent-btn"
                         style={{ padding: '10px', borderRadius: '10px', fontWeight: '600' }}
                       >
                         Entrar
                       </button>
                     </div>
                   ) : (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                         <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Clima/Temporada Ativa</span>
                         <select
                           value={adminSelectedSeason}
                           onChange={(e) => setAdminSelectedSeason(e.target.value)}
                           className="input-field"
                           style={{ padding: '8px', borderRadius: '8px', background: 'var(--panel-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}
                         >
                           <option value="spring">Primavera (Verde Claro)</option>
                           <option value="summer">Verão (Verde/Azul)</option>
                           <option value="autumn">Outono (Dourado/Laranja)</option>
                           <option value="winter">Inverno (Azul/Gelo)</option>
                         </select>
                       </div>

                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                         <input
                           type="checkbox"
                           id="eventActive"
                           checked={adminEventActive}
                           onChange={(e) => setAdminEventActive(e.target.checked)}
                           style={{ cursor: 'pointer' }}
                         />
                         <label htmlFor="eventActive" style={{ fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '600' }}>
                           Ativar Evento Comunitário Global
                         </label>
                       </div>

                       {adminEventActive && (
                         <>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                             <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Título do Evento</span>
                             <input
                               type="text"
                               value={adminEventTitle}
                               onChange={(e) => setAdminEventTitle(e.target.value)}
                               className="input-field"
                               style={{ padding: '8px', borderRadius: '8px' }}
                             />
                           </div>

                           <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                             <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Descrição do Evento</span>
                             <textarea
                               value={adminEventDesc}
                               onChange={(e) => setAdminEventDesc(e.target.value)}
                               className="input-field"
                               style={{ padding: '8px', borderRadius: '8px', height: '60px', resize: 'none' }}
                             />
                           </div>

                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                               <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Meta (Minutos)</span>
                               <input
                                 type="number"
                                 value={adminEventTarget}
                                 onChange={(e) => setAdminEventTarget(Number(e.target.value))}
                                 className="input-field"
                                 style={{ padding: '8px', borderRadius: '8px' }}
                               />
                             </div>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                               <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Atual (Minutos)</span>
                               <input
                                 type="number"
                                 value={adminEventCurrent}
                                 onChange={(e) => setAdminEventCurrent(Number(e.target.value))}
                                 className="input-field"
                                 style={{ padding: '8px', borderRadius: '8px' }}
                               />
                             </div>
                           </div>
                         </>
                       )}

                       <button
                         onClick={async () => {
                           try {
                             const docRef = doc(db, 'global_settings', 'events');
                             await setDoc(docRef, {
                               activeEvent: {
                                 title: adminEventTitle,
                                 description: adminEventDesc,
                                 targetMinutes: Number(adminEventTarget),
                                 currentMinutes: Number(adminEventCurrent),
                                 isActive: adminEventActive
                               },
                               currentSeason: adminSelectedSeason
                             }, { merge: true });
                             alert("Ecossistema social atualizado com sucesso!");
                             setShowAdminPanel(false);
                             window.location.reload();
                           } catch (e) {
                             alert("Erro ao salvar configurações administrativas: " + e.message);
                           }
                         }}
                         className="neumorphic-btn accent-btn"
                         style={{ padding: '10px', borderRadius: '10px', fontWeight: '700', marginTop: '10px' }}
                       >
                         Salvar e Atualizar Ecossistema
                       </button>
                     </div>
                   )}
                 </div>
               </div>
             )}

             {/* Top HUD with settings, title and mood switcher (Retractable) */}
             {showSettingsHUD && (
               <div style={{
                 animation: 'fadeIn 0.2s ease-out',
                 background: 'var(--bg-primary)',
                 padding: '20px',
                 borderRadius: '20px',
                 boxShadow: 'var(--shadow-inset)',
                 border: '1px solid var(--card-border)',
                 marginBottom: '10px'
               }}>
                 <Dashboard />
               </div>
             )}

             {/* Minimalist Tab-Specific Header with Control Panel Toggler */}
             <div style={{
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center',
               marginBottom: showSettingsHUD ? '10px' : '30px',
               transition: 'margin-bottom 0.2s'
             }}>
               <h2 style={{
                 fontSize: '1.6rem',
                 fontFamily: 'var(--font-title)',
                 color: 'var(--text-primary)',
                 letterSpacing: 'var(--letter-spacing-narrow)',
                 textTransform: 'capitalize'
               }}>
                 {activeTab === 'garden' ? 'Seu Jardim' : activeTab === 'focus' ? 'Zona de Foco' : activeTab === 'agenda' ? 'Sua Agenda' : activeTab === 'library' ? 'Mapa de Conhecimento' : 'A Vila'}
               </h2>
               
               <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => setShowAlarmModal(true)}
                    className="neumorphic-btn"
                    style={{
                      padding: '8px 14px',
                      borderRadius: '12px',
                      fontSize: '0.72rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    title="Configurar Alarmes"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <span>Alarmes</span>
                  </button>

                  <button
                    onClick={() => setShowSettingsHUD(!showSettingsHUD)}
                    className={`neumorphic-btn ${showSettingsHUD ? 'active' : ''}`}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '12px',
                      fontSize: '0.72rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: showSettingsHUD ? 'var(--shadow-inset)' : 'var(--shadow-flat)'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: showSettingsHUD ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s' }}>
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l-.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l-.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    <span>{showSettingsHUD ? 'Fechar Painel' : 'Painel de Controle'}</span>
                  </button>
                </div>
              </div>

              {/* Special Tribute Banner (if user possesses a creator tribute) */}
              {state.profile?.specialTribute && activeTab === 'garden' && (
                <div
                  className="neumorphic-card"
                  style={{
                    marginBottom: '20px',
                    padding: '16px 20px',
                    background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.22) 0%, rgba(255, 105, 180, 0.12) 100%)',
                    borderRadius: '20px',
                    border: '1.5px solid rgba(255, 105, 180, 0.4)',
                    boxShadow: 'var(--shadow-flat)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    animation: 'fadeIn 0.3s ease-out'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 2px 4px rgba(255, 105, 180, 0.4))' }}>
                      {state.profile.specialTribute.badge || '🌹'}
                    </span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '700', margin: 0 }}>
                          {state.profile.specialTribute.title || "Homenagem Especial"}
                        </h4>
                        <span style={{ fontSize: '0.65rem', background: 'rgba(255, 105, 180, 0.2)', color: '#d81b60', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                          Para Você
                        </span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '3px 0 0 0', fontStyle: 'italic' }}>
                        {state.profile.specialTribute.caption}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setActiveTab('village'); window.scrollTo(0,0); }}
                    className="neumorphic-btn accent-btn"
                    style={{ padding: '6px 14px', borderRadius: '10px', fontSize: '0.74rem', whiteSpace: 'nowrap' }}
                  >
                    Ver no Meu Perfil
                  </button>
                </div>
              )}

              {/* Alarm Modal Handler */}
              {showAlarmModal && (
                <AlarmModal onClose={() => setShowAlarmModal(false)} />
              )}

              {/* Active Alarm Trigger Popup */}
              {activeTriggeredAlarm && (
                <div style={{
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 10001, padding: '16px'
                }}>
                  <div className="neumorphic-card" style={{
                    width: '100%', maxWidth: '380px', background: 'var(--panel-bg)',
                    borderRadius: '24px', padding: '24px', textAlign: 'center',
                    border: '2px solid var(--accent-color)', boxShadow: 'var(--shadow-flat)',
                    display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center'
                  }}>
                    <div style={{ padding: '14px', borderRadius: '50%', background: 'var(--bg-primary)' }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-color)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Alarme Disparado
                      </span>
                      <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0 2px' }}>
                        {activeTriggeredAlarm.time}
                      </h3>
                      <p style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                        {activeTriggeredAlarm.title}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '6px' }}>
                      <button
                        onClick={snoozeTriggeredAlarm}
                        className="neumorphic-btn"
                        style={{ flex: 1, padding: '10px', fontSize: '0.8rem', borderRadius: '12px' }}
                      >
                        Soneca (5 min)
                      </button>
                      <button
                        onClick={dismissTriggeredAlarm}
                        className="neumorphic-btn accent-btn"
                        style={{ flex: 1, padding: '10px', fontSize: '0.8rem', borderRadius: '12px' }}
                      >
                        Desligar
                      </button>
                    </div>
                  </div>
                </div>
              )}

             {/* Core view toggler */}
             <main 
               key={activeTab} 
               style={{ 
                 flex: 1, 
                 display: 'flex', 
                 flexDirection: 'column'
               }}
             >
               {activeTab === 'garden' && <GardenView />}
               {activeTab === 'village' && <VillageView onVisitUser={(uid) => setVisitedUserUid(uid)} />}
               {activeTab === 'focus' && (
                 <FocusZone 
                   onSessionComplete={(subjectId, minutesStudied, minutesBreak, wiltCount, seed) => {
                     setCheckoutSession({ subjectId, minutesStudied, minutesBreak, wiltCount, seed });
                   }}
                 />
               )}
               {activeTab === 'agenda' && <AgendaView />}
               {activeTab === 'library' && <Library />}

               {/* Premium Minimalist Editorial Footer (inside scroll area) */}
               <footer style={{
                 marginTop: '60px',
                 padding: '24px 0 10px 0',
                 textAlign: 'center',
                 borderTop: '1px solid rgba(0,0,0,0.04)',
                 fontSize: '0.8rem',
                 color: 'var(--text-secondary)'
               }}>
                 <p style={{ fontStyle: 'italic', fontFamily: 'var(--font-title)', fontSize: '0.9rem', opacity: 0.95 }}>
                   "O tempo não é um recurso a ser gerido, mas um jardim a ser cultivado."
                 </p>
                 <p style={{ marginTop: '6px', fontSize: '0.7rem', letterSpacing: '0.05em', opacity: 0.6 }}>
                   O SANTUARIO. GESTÃO DE ESTUDOS.
                 </p>
                 <div style={{
                   marginTop: '12px',
                   display: 'inline-flex',
                   alignItems: 'center',
                   gap: '6px',
                   padding: '6px 14px',
                   borderRadius: '20px',
                   background: 'var(--panel-bg)',
                   boxShadow: 'var(--shadow-neumorphic)',
                   border: '1px solid rgba(212, 140, 140, 0.15)'
                 }}>
                   <span style={{ 
                     fontSize: '0.78rem', 
                     fontFamily: "'Playfair Display', serif", 
                     fontStyle: 'italic', 
                     color: '#c75e43', 
                     fontWeight: '600',
                     letterSpacing: '0.02em'
                   }}>
                     Feito com carinho para Esther
                   </span>
                 </div>
               </footer>
             </main>

            {/* Bottom Floating Navigation (Invisibly integrated bar) */}
            <div className="nav-bar-container">
              <div className="nav-bar-card">
                <button 
                  onClick={() => { setActiveTab('garden'); window.scrollTo(0,0); }}
                  className={`nav-btn ${activeTab === 'garden' ? 'active' : ''}`}
                  title="Jardim"
                >
                  <IconLeaf />
                </button>
                <button 
                  onClick={() => { setActiveTab('focus'); window.scrollTo(0,0); }}
                  className={`nav-btn ${activeTab === 'focus' ? 'active' : ''}`}
                  title="Foco"
                >
                  <IconTimer />
                </button>
                <button 
                  onClick={() => { setActiveTab('agenda'); window.scrollTo(0,0); }}
                  className={`nav-btn ${activeTab === 'agenda' ? 'active' : ''}`}
                  title="Agenda"
                >
                  <IconCalendar size={22} />
                </button>
                <button 
                  onClick={() => { setActiveTab('library'); window.scrollTo(0,0); }}
                  className={`nav-btn ${activeTab === 'library' ? 'active' : ''}`}
                  title="Biblioteca"
                >
                  <IconBook />
                </button>
                <button 
                  onClick={() => { setActiveTab('village'); window.scrollTo(0,0); }}
                  className={`nav-btn ${activeTab === 'village' ? 'active' : ''}`}
                  title="A Vila"
                >
                  <IconUsers />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* UNIVERSAL CONTEXT-AWARE FAB (+) */}
      {!checkoutSession && (
        <>
          {/* Click-away Backdrop overlay */}
          {showFabMenu && (
            <div 
              onClick={() => setShowFabMenu(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 92,
                background: 'transparent'
              }}
            />
          )}

          {/* Sub-menu Options list */}
          {showFabMenu && (
            <div style={{
              position: 'fixed',
              right: '28px',
              bottom: 'calc(156px + max(16px, env(safe-area-inset-bottom, 16px)))',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              zIndex: 95,
              animation: 'fadeIn 0.15s ease-out'
            }}>
              {/* Add Task option */}
              <button
                onClick={() => {
                  setShowTaskCreator(true);
                  setShowFabMenu(false);
                }}
                className="neumorphic-btn accent-btn"
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 8px 24px rgba(74, 124, 89, 0.2)'
                }}
              >
                <IconCalendar size={14} />
                <span>Nova Atividade</span>
              </button>

              {/* Add Subject option */}
              <button
                onClick={() => {
                  setShowSubjectCreator(true);
                  setShowFabMenu(false);
                }}
                className="neumorphic-btn"
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--panel-bg)',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                  border: '1px solid var(--card-border)'
                }}
              >
                <IconBook />
                <span>Nova Matéria</span>
              </button>
            </div>
          )}

          {/* Main FAB Trigger */}
          <button 
            onClick={handleFabClick}
            aria-label="Menu de Ações"
            style={{
              position: 'fixed',
              right: '28px',
              bottom: 'calc(90px + max(16px, env(safe-area-inset-bottom, 16px)))',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--accent-color)',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 8px 24px rgba(74, 124, 89, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 96,
              transform: showFabMenu ? 'rotate(45deg)' : 'none',
              transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </>
      )}

      {/* MODAL OVERLAY: SUBJECT CREATOR */}
      {showSubjectCreator && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(43,53,49,0.3)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 100
        }}>
          <div 
            className="neumorphic-card" 
            style={{ 
              width: '100%', 
              maxWidth: '440px', 
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '30px', 
              background: 'var(--panel-bg)',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <SubjectCreator onClose={() => setShowSubjectCreator(false)} />
          </div>
        </div>
      )}

      {/* MODAL OVERLAY: SMART TASK CREATOR */}
      {showTaskCreator && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(43,53,49,0.3)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 100
        }}>
          <div 
            className="neumorphic-card" 
            style={{ 
              width: '100%', 
              maxWidth: '440px', 
              padding: '30px', 
              background: 'var(--panel-bg)',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <form onSubmit={handleCreateTaskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(0,0,0,0.03)', paddingBottom: '14px' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Agendar Atividade</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Smart Task - Lançamento rápido na Agenda
                </p>
              </div>

              {/* Title input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
                  Título do compromisso
                </label>
                <input
                  type="text"
                  placeholder="Ex: Prova de Limites"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="input-field"
                  required
                  autoFocus
                  style={{ background: 'var(--bg-primary)' }}
                />
              </div>

              {/* Subject dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
                  Matéria Relacionada
                </label>
                <div style={{ position: 'relative' }}>
                  <button 
                    type="button"
                    onClick={() => setShowTaskSubDropdown(!showTaskSubDropdown)}
                    className="input-field"
                    style={{ 
                      background: 'var(--bg-primary)',
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      padding: '10px 14px',
                      border: '1px solid var(--card-border)',
                      borderRadius: '12px'
                    }}
                  >
                    <span>{state.subjects.find(s => s.id === taskSubjectId)?.name || 'Independente (Nenhuma matéria)'}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: showTaskSubDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {showTaskSubDropdown && (
                    <>
                      <div 
                        onClick={() => setShowTaskSubDropdown(false)}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, background: 'transparent' }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'var(--panel-bg)',
                        border: '1px solid var(--card-border)',
                        borderRadius: '12px',
                        zIndex: 12,
                        marginTop: '6px',
                        maxHeight: '180px',
                        overflowY: 'auto',
                        boxShadow: 'var(--shadow-neumorphic)',
                        animation: 'fadeIn 0.15s ease-out'
                      }}>
                        <button
                          type="button"
                          onClick={() => {
                            setTaskSubjectId('');
                            setShowTaskSubDropdown(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '10px 14px',
                            border: 'none',
                            background: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            color: 'var(--text-primary)'
                          }}
                          className="dropdown-item-hover"
                        >
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#cccccc' }} />
                          <span>Independente (Nenhuma matéria)</span>
                        </button>
                        {state.subjects.filter(s => !s.concluded).map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setTaskSubjectId(s.id);
                              setShowTaskSubDropdown(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              width: '100%',
                              padding: '10px 14px',
                              border: 'none',
                              background: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              color: 'var(--text-primary)'
                            }}
                            className="dropdown-item-hover"
                          >
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
                            <span>{s.name}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Activity Type selection chips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
                  Tipo de Atividade
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['prova', 'trabalho', 'leitura', 'outros'].map(type => {
                    const isSelected = taskType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setTaskType(type)}
                        className="neumorphic-btn"
                        style={{
                          flex: 1,
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          borderRadius: '10px',
                          border: 'none',
                          background: isSelected ? 'var(--panel-bg)' : 'transparent',
                          boxShadow: isSelected ? 'var(--shadow-inset)' : 'none',
                          color: isSelected ? 'var(--accent-color)' : 'var(--text-secondary)',
                          textTransform: 'capitalize'
                        }}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date and Time inputs */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Data</label>
                  <input
                    type="date"
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="input-field"
                    required
                    style={{ background: 'var(--bg-primary)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Horário</label>
                  <input
                    type="time"
                    value={taskTime}
                    onChange={(e) => setTaskTime(e.target.value)}
                    className="input-field"
                    required
                    style={{ background: 'var(--bg-primary)' }}
                  />
                </div>
              </div>

              {/* Recurrence Selection Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="taskRecurringWeekly"
                  checked={taskRecurringWeekly}
                  onChange={(e) => setTaskRecurringWeekly(e.target.checked)}
                  style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--accent-color)' }}
                />
                <label htmlFor="taskRecurringWeekly" style={{ fontSize: '0.78rem', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '500' }}>
                  Repetir semanalmente (Compromisso recorrente)
                </label>
              </div>

              {/* Quick time presets */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setTaskTime('08:00')}
                  className="neumorphic-btn"
                  style={{ flex: 1, padding: '4px 8px', fontSize: '0.68rem', borderRadius: '8px', border: 'none' }}
                >
                  Manhã (08:00)
                </button>
                <button
                  type="button"
                  onClick={() => setTaskTime('14:00')}
                  className="neumorphic-btn"
                  style={{ flex: 1, padding: '4px 8px', fontSize: '0.68rem', borderRadius: '8px', border: 'none' }}
                >
                  Tarde (14:00)
                </button>
                <button
                  type="button"
                  onClick={() => setTaskTime('23:59')}
                  className="neumorphic-btn"
                  style={{ flex: 1, padding: '4px 8px', fontSize: '0.68rem', borderRadius: '8px', border: 'none' }}
                >
                  Noite (23:59)
                </button>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  className="neumorphic-btn" 
                  onClick={() => setShowTaskCreator(false)}
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="neumorphic-btn accent-btn"
                  style={{ flex: 1 }}
                >
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shared Garden Visitor Modal */}
      {showSharedGardenModal && sharedGardenData && (
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
          zIndex: 9999,
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div className="neumorphic-card" style={{
            width: '100%',
            maxWidth: '700px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            background: 'var(--panel-bg)',
            padding: '24px',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>Você foi convidado!</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Dê uma olhada no Santuário de <strong>{sharedGardenData.n}</strong>. Esse é o jardim único que cresceu com base nos estudos dele!
              </p>
            </div>

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
                ref={drawSharedGarden} 
                style={{
                  maxWidth: '100%',
                  maxHeight: '340px',
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              width: '100%',
              background: 'var(--bg-primary)',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid var(--card-border)'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>
                Estatísticas de Foco de {sharedGardenData.n}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '4px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Consistência</span>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>{sharedGardenData.s} dias</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Tempo Focado</span>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>{sharedGardenData.m} min</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '10px' }}>
              <button 
                className="neumorphic-btn accent-btn" 
                onClick={() => setShowSharedGardenModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', fontWeight: '600' }}
              >
                Legal! Voltar para Meu Santuário
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL THEMES CATALOG OVERLAY */}
      {themesCatalogOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          padding: '20px',
          boxSizing: 'border-box'
        }} onClick={() => {
          setThemesCatalogOpen(false);
          setPreviewThemeId(null);
        }}>
          <div style={{
            background: 'var(--panel-bg)',
            borderRadius: '24px',
            border: '1.5px solid var(--card-border)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            padding: '24px',
            maxWidth: '580px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxSizing: 'border-box',
            animation: 'fadeIn 0.2s ease-out'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>Biblioteca de Temas</h3>
              <button 
                onClick={() => {
                  setThemesCatalogOpen(false);
                  setPreviewThemeId(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '1.15rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '-4px' }}>
              Selecione um tema para transformar completamente a estética, fontes e o sentimento do seu Santuário. Passe o mouse sobre um tema para vê-lo em ação.
            </p>

            {/* LIVE THEME PREVIEW */}
            {(() => {
              const ptId = previewThemeId || state.settings?.activeTheme || 'light';
              const tv = THEME_VARIABLES[ptId] || THEME_VARIABLES.light;

              const previewStyles = {
                background: tv.bgGradient,
                color: tv.textPrimary,
                fontFamily: tv.fontBody,
                padding: '14px 18px',
                borderRadius: '16px',
                border: `1.5px solid ${tv.cardBorder}`,
                boxShadow: tv.shadowFlat || '0 4px 12px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                filter: tv.filter || 'none',
                transition: 'all 0.2s',
                marginTop: '4px',
                marginBottom: '4px',
                boxSizing: 'border-box'
              };

              return (
                <div style={previewStyles}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      color: tv.textSecondary,
                      textTransform: 'uppercase',
                      fontWeight: '700',
                      letterSpacing: '0.05em'
                    }}>
                      Prévia Visual: {ALL_THEMES.find(t => t.id === ptId)?.name || ptId}
                    </span>
                    <span style={{
                      fontSize: '0.6rem',
                      background: tv.accentColor,
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: '700'
                    }}>
                      Pré-visualização
                    </span>
                  </div>
                  <h4 style={{
                    margin: 0,
                    fontSize: '1.15rem',
                    fontFamily: tv.fontTitle,
                    color: tv.textPrimary,
                    textShadow: tv.textShadow || 'none'
                  }}>
                    Santuário de Estudos
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.72rem', color: tv.textSecondary }}>
                      Tempo focado hoje: <strong>120 min</strong>
                    </span>
                    <button style={{
                      background: tv.accentColor,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      cursor: 'default'
                    }}>
                      Focar
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Catalog Subtabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
              <button
                onClick={() => setCatalogSubTab('system')}
                style={{
                  background: catalogSubTab === 'system' ? 'var(--accent-color)' : 'transparent',
                  color: catalogSubTab === 'system' ? '#fff' : 'var(--text-primary)',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Catálogo do Santuário
              </button>
              <button
                onClick={() => setCatalogSubTab('collection')}
                style={{
                  background: catalogSubTab === 'collection' ? 'var(--accent-color)' : 'transparent',
                  color: catalogSubTab === 'collection' ? '#fff' : 'var(--text-primary)',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Minha Coleção
              </button>
            </div>

            {/* Scrollable list area */}
            {catalogSubTab === 'system' ? (
              <div style={{ 
                overflowY: 'auto', 
                flex: 1, 
                paddingRight: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginTop: '8px'
              }}>
                {Object.entries(
                  ALL_THEMES.reduce((acc, t) => {
                    if (!acc[t.category]) acc[t.category] = [];
                    acc[t.category].push(t);
                    return acc;
                  }, {})
                ).map(([category, list]) => (
                  <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {category}
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }}>
                      {list.map(theme => {
                        const isActive = (state.settings?.activeTheme || 'light') === theme.id;
                        return (
                          <div
                            key={theme.id}
                            onClick={() => {
                              setTheme(theme.id);
                              setThemesCatalogOpen(false);
                              setPreviewThemeId(null);
                            }}
                            style={{
                              background: isActive ? 'var(--accent-color)' : 'var(--panel-bg)',
                              color: isActive ? '#fff' : 'var(--text-primary)',
                              border: isActive ? '1.2px solid var(--accent-color)' : '1.2px solid var(--card-border)',
                              borderRadius: '12px',
                              padding: '10px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              boxShadow: isActive ? 'var(--shadow-inset)' : 'var(--shadow-flat)'
                            }}
                            onMouseEnter={(e) => {
                              setPreviewThemeId(theme.id);
                              if (!isActive) e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                              setPreviewThemeId(null);
                              if (!isActive) e.currentTarget.style.transform = 'none';
                            }}
                          >
                            <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>{theme.name}</span>
                            <span style={{ fontSize: '0.65rem', opacity: 0.8, lineHeight: '1.2' }}>{theme.desc}</span>
                            
                            {/* Colored Swatches indicator */}
                            <div style={{ display: 'flex', gap: '4px', marginTop: '4px', alignItems: 'center' }}>
                              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: theme.bg, border: '1px solid rgba(0,0,0,0.1)' }} />
                              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: theme.text, border: '1px solid rgba(0,0,0,0.1)' }} />
                              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: theme.accent, border: '1px solid rgba(0,0,0,0.1)' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Criados por Mim
                  </span>
                  {(!state.createdThemes || state.createdThemes.length === 0) ? (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '10px 0', margin: 0 }}>Você ainda não criou nenhum tema personalizado.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', marginTop: '8px' }}>
                      {state.createdThemes.map(theme => (
                        <div
                          key={theme.id}
                          style={{
                            padding: '12px',
                            background: 'var(--panel-bg)',
                            border: '1.2px solid var(--card-border)',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            boxShadow: 'var(--shadow-flat)'
                          }}
                        >
                          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>{theme.name}</span>
                          
                          {/* Swatches preview */}
                          {theme.config && (
                            <div style={{ display: 'flex', gap: '4px', margin: '2px 0' }}>
                              {['bg-primary', 'accent-color', 'panel-bg', 'text-primary'].map(prop => (
                                <div
                                  key={prop}
                                  style={{ width: '10px', height: '10px', borderRadius: '50%', background: theme.config[prop] || '#ccc', border: '1px solid var(--card-border)' }}
                                />
                              ))}
                            </div>
                          )}

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                            <button
                              onClick={() => {
                                updateCustomTheme(theme.config);
                                setTheme('custom');
                                setThemesCatalogOpen(false);
                              }}
                              className="neumorphic-btn accent-btn"
                              style={{ padding: '4px', fontSize: '0.68rem', borderRadius: '6px' }}
                            >
                              Aplicar
                            </button>
                            
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                onClick={() => {
                                  const newName = prompt("Digite o novo nome do seu tema:", theme.name);
                                  if (newName && newName.trim()) {
                                    const updated = state.createdThemes.map(t => t.id === theme.id ? { ...t, name: newName.trim() } : t);
                                    updateProfile({ createdThemes: updated });
                                  }
                                }}
                                className="neumorphic-btn"
                                style={{ flex: 1, padding: '4px', fontSize: '0.65rem', borderRadius: '6px' }}
                              >
                                Renomear
                              </button>
                              <button
                                onClick={() => deleteCreatedTheme(theme.id)}
                                className="neumorphic-btn"
                                style={{ flex: 1, padding: '4px', fontSize: '0.65rem', borderRadius: '6px', color: '#c75e43' }}
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Adquiridos / Copiados
                  </span>
                  {(!state.copiedThemes || state.copiedThemes.length === 0) ? (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '10px 0', margin: 0 }}>Nenhum tema copiado ainda.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', marginTop: '8px' }}>
                      {state.copiedThemes.map(theme => (
                        <div
                          key={theme.id}
                          style={{
                            padding: '12px',
                            background: 'var(--panel-bg)',
                            border: '1.2px solid var(--card-border)',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            boxShadow: 'var(--shadow-flat)'
                          }}
                        >
                          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>{theme.name}</span>
                          
                          {/* Swatches preview */}
                          {theme.config && (
                            <div style={{ display: 'flex', gap: '4px', margin: '2px 0' }}>
                              {['bg-primary', 'accent-color', 'panel-bg', 'text-primary'].map(prop => (
                                <div
                                  key={prop}
                                  style={{ width: '10px', height: '10px', borderRadius: '50%', background: theme.config[prop] || '#ccc', border: '1px solid var(--card-border)' }}
                                />
                              ))}
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                            <button
                              onClick={() => {
                                updateCustomTheme(theme.config);
                                setTheme('custom');
                                setThemesCatalogOpen(false);
                              }}
                              className="neumorphic-btn accent-btn"
                              style={{ flex: 1.5, padding: '4px', fontSize: '0.68rem', borderRadius: '6px' }}
                            >
                              Aplicar
                            </button>
                            <button
                              onClick={() => deleteCopiedTheme(theme.id)}
                              className="neumorphic-btn"
                              style={{ flex: 1, padding: '4px', fontSize: '0.68rem', borderRadius: '6px', color: '#c75e43' }}
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Crie seu próprio tema trigger button */}
            <button 
              onClick={() => {
                setThemesCatalogOpen(false);
                setMixMatchOpen(true);
              }}
              className="neumorphic-btn accent-btn"
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '12px', 
                fontWeight: '700',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              Crie seu próprio tema
            </button>
          </div>
        </div>
      )}

      {/* GLOBAL CUSTOM THEME MAKER (Crie seu próprio tema) */}
      {mixMatchOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          padding: '20px',
          boxSizing: 'border-box'
        }} onClick={() => setMixMatchOpen(false)}>
          <div style={{
            background: 'var(--panel-bg)',
            borderRadius: '24px',
            border: '1.5px solid var(--card-border)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            padding: '24px',
            maxWidth: '580px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxSizing: 'border-box',
            animation: 'fadeIn 0.2s ease-out'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontFamily: 'system-ui, sans-serif' }}>Crie seu próprio tema</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'system-ui, sans-serif', marginTop: '2px' }}>
                  Personalize a estética do seu Santuário escolhendo cada elemento separadamente.
                </p>
              </div>
              <button 
                onClick={() => setMixMatchOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '1.15rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* LIVE PREVIEW BOX */}
            {(() => {
              const ct = customThemeDraft || state.settings?.customTheme || {
                backgroundId: 'light',
                typographyId: 'light',
                textColorId: 'light',
                accentColorId: 'light',
                containerId: 'light',
                plantBiomaId: 'default',
                audioPresetId: 'natureza'
              };
              const bgVars = THEME_VARIABLES[ct.backgroundId] || THEME_VARIABLES.light;
              const tyVars = THEME_VARIABLES[ct.typographyId] || THEME_VARIABLES.light;
              const tcVars = THEME_VARIABLES[ct.textColorId] || THEME_VARIABLES.light;
              const acVars = THEME_VARIABLES[ct.accentColorId] || THEME_VARIABLES.light;
              const coVars = THEME_VARIABLES[ct.containerId] || THEME_VARIABLES.light;

              const previewStyles = {
                background: bgVars.bgGradient,
                color: tcVars.textPrimary,
                fontFamily: tyVars.fontBody,
                padding: '16px',
                borderRadius: '16px',
                border: `1.5px solid ${coVars.cardBorder}`,
                boxShadow: bgVars.shadowFlat || '0 8px 24px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                filter: bgVars.filter || 'none',
                position: 'relative'
              };

              return (
                <div style={previewStyles}>
                  <h4 style={{
                    margin: 0,
                    fontSize: '1.1rem',
                    fontFamily: tyVars.fontTitle,
                    color: tcVars.textPrimary,
                    textShadow: tyVars.textShadow || 'none'
                  }}>
                    Live Preview do Santuário
                  </h4>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: tcVars.textSecondary }}>
                      Mistura perfeita acontecendo em tempo real.
                    </span>
                    <button style={{
                      background: acVars.accentColor,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      cursor: 'default'
                    }}>
                      Focar Agora
                    </button>
                  </div>

                  <div style={{
                    background: coVars.panelBg,
                    border: `1px solid ${coVars.cardBorder}`,
                    borderRadius: '12px',
                    padding: '8px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                      <div style={{ transform: 'scale(1)' }}>
                        {renderMicroPlant(
                          ct.plantBiomaId === 'default' ? '#46bf7c' : getBiomaColor(ct.plantBiomaId, 2),
                          false,
                          2,
                          0.1
                        )}
                      </div>
                      <div style={{ transform: 'scale(1)' }}>
                        {renderMicroPlant(
                          ct.plantBiomaId === 'default' ? '#ffb400' : getBiomaColor(ct.plantBiomaId, 3),
                          false,
                          3,
                          0.5
                        )}
                      </div>
                    </div>
                    <div style={{
                      height: '6px',
                      background: coVars.shelfBg,
                      border: `1px solid ${coVars.shelfBorder}`,
                      borderRadius: '3px',
                      marginTop: '2px'
                    }} />
                  </div>
                </div>
              );
            })()}

            {/* NAVIGATION TABS FOR ASSEMBLER PANEL */}
            <div style={{
              display: 'flex',
              gap: '4px',
              borderBottom: '1px solid var(--card-border)',
              paddingBottom: '8px',
              overflowX: 'auto'
            }}>
              {[
                { id: 'background', label: 'Fundo' },
                { id: 'typography', label: 'Fontes' },
                { id: 'textColor', label: 'Textos' },
                { id: 'accent', label: 'Destaques' },
                { id: 'container', label: 'Cartões & Prateleiras' },
                { id: 'bioma', label: 'Bioma' },
                { id: 'audio', label: 'Sons' }
              ].map(tab => {
                const isActive = activeCustomizerTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCustomizerTab(tab.id)}
                    style={{
                      background: isActive ? 'var(--accent-color)' : 'transparent',
                      color: isActive ? '#fff' : 'var(--text-primary)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.72rem',
                      fontFamily: 'system-ui, sans-serif',
                      fontWeight: '600',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: isActive ? 'var(--shadow-inset)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENTS & CHOICES GRID (Scrollable Area) */}
            <div style={{ 
              overflowY: 'auto', 
              flex: 1, 
              paddingRight: '6px',
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px' 
            }}>
              {(() => {
                const ct = customThemeDraft || state.settings?.customTheme || {
                  backgroundId: 'light',
                  typographyId: 'light',
                  textColorId: 'light',
                  accentColorId: 'light',
                  containerId: 'light',
                  plantBiomaId: 'default',
                  audioPresetId: 'natureza'
                };

                // TAB 1: BACKGROUND
                if (activeCustomizerTab === 'background') {
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px' }}>
                      {ALL_THEMES.map(theme => {
                        const isSel = ct.backgroundId === theme.id;
                        return (
                          <div
                            key={theme.id}
                            onClick={() => setCustomThemeDraft(prev => ({ ...prev, backgroundId: theme.id }))}
                            style={{
                              background: theme.bg,
                              border: isSel ? '2px solid var(--accent-color)' : '1px solid var(--card-border)',
                              borderRadius: '10px',
                              height: '48px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '4px',
                              boxShadow: isSel ? 'var(--shadow-inset)' : 'var(--shadow-flat)'
                            }}
                          >
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: '600',
                              color: theme.id === 'light' || theme.id === 'papiro' || theme.id === 'sakura' || theme.id === 'morning-matcha' ? '#333' : '#fff',
                              textAlign: 'center',
                              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                            }}>
                              {theme.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                // TAB 2: TYPOGRAPHY (FONT FAMILY CHOICE)
                if (activeCustomizerTab === 'typography') {
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Escolha a Fonte das Letras</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                        {ALL_THEMES.map(theme => {
                          const isSel = ct.typographyId === theme.id;
                          const fontTitleStr = THEME_VARIABLES[theme.id]?.fontTitle || 'serif';
                          return (
                            <div
                              key={theme.id}
                              onClick={() => setCustomThemeDraft(prev => ({ ...prev, typographyId: theme.id }))}
                              style={{
                                background: 'var(--panel-bg)',
                                border: isSel ? '2px solid var(--accent-color)' : '1px solid var(--card-border)',
                                borderRadius: '10px',
                                padding: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px',
                                boxShadow: isSel ? 'var(--shadow-inset)' : 'var(--shadow-flat)'
                              }}
                            >
                              <span style={{ fontSize: '0.72rem', fontWeight: '700', fontFamily: fontTitleStr, color: 'var(--text-primary)' }}>
                                {theme.name}
                              </span>
                              <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
                                Exemplo de Texto
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                // TAB 3: TEXT COLOR CHOICE
                if (activeCustomizerTab === 'textColor') {
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px' }}>
                      {ALL_THEMES.map(theme => {
                        const isSel = ct.textColorId === theme.id;
                        return (
                          <div
                            key={theme.id}
                            onClick={() => setCustomThemeDraft(prev => ({ ...prev, textColorId: theme.id }))}
                            style={{
                              background: 'var(--panel-bg)',
                              border: isSel ? '2px solid var(--accent-color)' : '1px solid var(--card-border)',
                              borderRadius: '10px',
                              padding: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              boxShadow: isSel ? 'var(--shadow-inset)' : 'var(--shadow-flat)'
                            }}
                          >
                            <span style={{ fontSize: '0.72rem', color: theme.text, fontWeight: '700' }}>
                              {theme.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                // TAB 4: ACCENT COLOR CHOICE
                if (activeCustomizerTab === 'accent') {
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px' }}>
                      {ALL_THEMES.map(theme => {
                        const isSel = ct.accentColorId === theme.id;
                        return (
                          <div
                            key={theme.id}
                            onClick={() => setCustomThemeDraft(prev => ({ ...prev, accentColorId: theme.id }))}
                            style={{
                              background: theme.accent,
                              border: isSel ? '2px solid var(--accent-color)' : '1px solid var(--card-border)',
                              borderRadius: '10px',
                              height: '42px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: isSel ? 'var(--shadow-inset)' : 'var(--shadow-flat)'
                            }}
                          >
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: '700',
                              color: '#fff',
                              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                            }}>
                              {theme.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                // TAB 5: CONTAINER / PANEL CHOICE
                if (activeCustomizerTab === 'container') {
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
                      {ALL_THEMES.map(theme => {
                        const isSel = ct.containerId === theme.id;
                        const tv = THEME_VARIABLES[theme.id] || THEME_VARIABLES.light;
                        return (
                          <div
                            key={theme.id}
                            onClick={() => setCustomThemeDraft(prev => ({ ...prev, containerId: theme.id }))}
                            style={{
                              background: tv.panelBg,
                              border: isSel ? '2px solid var(--accent-color)' : `1.5px solid ${tv.cardBorder}`,
                              borderRadius: '12px',
                              padding: '10px',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              boxShadow: isSel ? 'var(--shadow-inset)' : 'var(--shadow-flat)'
                            }}
                          >
                            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: tv.textPrimary }}>{theme.name}</span>
                            <div style={{
                              height: '6px',
                              background: tv.shelfBg,
                              border: `1.5px solid ${tv.shelfBorder}`,
                              borderRadius: '3px'
                            }} />
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                // TAB 6: PLANT BIOMA CHOICE
                if (activeCustomizerTab === 'bioma') {
                  const biomas = [
                    { id: 'default', name: 'Original', desc: 'Verdes clássicos e flores multicoloridas do app.' },
                    { id: 'neon', name: 'Neon Cyberpunk', desc: 'Verdes fluorescentes, rosa neon e azuis elétricos.' },
                    { id: 'pastel', name: 'Doce Pastel', desc: 'Tons suaves de algodão doce e lilás acinzentados.' },
                    { id: 'autumn', name: 'Outono Aconchegante', desc: 'Folhagens alaranjadas, bronze e terracota quente.' },
                    { id: 'monochrome', name: 'Vintage E-Ink', desc: 'Escala de cinza elegante, ideal para foco absoluto.' }
                  ];

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {biomas.map(bio => {
                        const isSel = ct.plantBiomaId === bio.id;
                        return (
                          <div
                            key={bio.id}
                            onClick={() => setCustomThemeDraft(prev => ({ ...prev, plantBiomaId: bio.id }))}
                            style={{
                              background: 'var(--panel-bg)',
                              border: isSel ? '2px solid var(--accent-color)' : '1px solid var(--card-border)',
                              borderRadius: '12px',
                              padding: '10px 14px',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              boxShadow: isSel ? 'var(--shadow-inset)' : 'var(--shadow-flat)'
                            }}
                          >
                            <div>
                              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)' }}>{bio.name}</span>
                              <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', display: 'block', marginTop: '1px' }}>{bio.desc}</span>
                            </div>
                            <span style={{ fontSize: '0.68rem', color: 'var(--accent-color)', fontWeight: '700' }}>
                              {isSel ? 'Selecionado' : 'Usar'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                // TAB 7: AUDIO PRESETS CHOICE
                if (activeCustomizerTab === 'audio') {
                  const audios = [
                    { id: 'natureza', name: 'Natureza', desc: 'Chuva, ventania e som de pássaros suaves.' },
                    { id: 'urbano', name: 'Cafeteria', desc: 'Ruído suave de conversas, xícaras e jazz sutil.' },
                    { id: 'foco', name: 'Foco Puro', desc: 'Ondas binaurais de ruído marrom concentrado.' },
                    { id: 'lofi', name: 'Lofi Vibes', desc: 'Sons de vinil clássico, piano lofi e batidas relaxantes.' },
                    { id: 'hacker', name: 'Hum Eletrônico', desc: 'Ambiente futurista com hum digital de terminal.' }
                  ];

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {audios.map(aud => {
                        const isSel = ct.audioPresetId === aud.id;
                        return (
                          <div
                            key={aud.id}
                            onClick={() => setCustomThemeDraft(prev => ({ ...prev, audioPresetId: aud.id }))}
                            style={{
                              background: 'var(--panel-bg)',
                              border: isSel ? '2px solid var(--accent-color)' : '1px solid var(--card-border)',
                              borderRadius: '12px',
                              padding: '10px 14px',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              boxShadow: isSel ? 'var(--shadow-inset)' : 'var(--shadow-flat)'
                            }}
                          >
                            <div>
                              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)' }}>{aud.name}</span>
                              <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', display: 'block', marginTop: '1px' }}>{aud.desc}</span>
                            </div>
                            <span style={{ fontSize: '0.68rem', color: 'var(--accent-color)', fontWeight: '700' }}>
                              {isSel ? 'Selecionado' : 'Usar'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                }
              })()}
            </div>

            {/* SAVE & APPLY BUTTON */}
            {customThemeDraft && (
              <button 
                onClick={() => {
                  Object.entries(customThemeDraft).forEach(([k, v]) => {
                    updateCustomTheme(k, v);
                  });
                  setMixMatchOpen(false);
                }}
                className="neumorphic-btn accent-btn"
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  fontWeight: '700',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontFamily: 'system-ui, sans-serif'
                }}
              >
                Salvar e Aplicar Tema
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <SantuarioContent />
    </AppProvider>
  );
}

export default App;
