// Autor: Antônio Costa Leite
// Componente de Painel de Controle e Estatísticas (O Santuário)

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { audioSynth } from '../utils/audio';

// Crisply aligned SVG outline icons
const IconDroplet = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z" />
  </svg>
);

const IconFlame = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const IconPlay = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const IconPause = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

const IconNext = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 4 15 12 5 20 5 4" />
    <line x1="19" y1="5" x2="19" y2="19" />
  </svg>
);

import { ALL_THEMES, THEME_VARIABLES } from '../utils/themeConstants';

const Dashboard = () => {
  const { 
    currentUser, 
    logout, 
    state, 
    setTheme, 
    setMood, 
    toggleCompanyMode, 
    toggleWiltOnDistraction, 
    updateMixerVolume, 
    nextTrack, 
    themesCatalogOpen, 
    setThemesCatalogOpen, 
    previewThemeId, 
    setPreviewThemeId 
  } = useApp();
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);

  const totalMinutes = state.subjects.reduce((sum, s) => sum + s.focusMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);



  // Toggle ambient play/pause of the full mixer
  const handleToggleAmbient = () => {
    audioSynth.init();
    if (isAmbientPlaying) {
      audioSynth.stopAll();
      setIsAmbientPlaying(false);
    } else {
      audioSynth.startAmbientMix();
      setIsAmbientPlaying(true);
    }
  };

  const currentMixer = state.settings.mixer || { master: 0.8, rain: 0.3, whiteNoise: 0.1, piano: 0.4, trackIndex: 0 };
  const currentTheme = state.settings.activeTheme || 'light';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header and Theme selectors */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--text-primary)', letterSpacing: 'var(--letter-spacing-narrow)', lineHeight: '1.2' }}>
            O Santuário
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
            Seu refúgio mental e gerenciador inteligente de estudos.
          </p>
        </div>

        {/* Theme select controls */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            className="neumorphic-btn accent-btn"
            onClick={() => setThemesCatalogOpen(true)}
            style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.78rem' }}
          >
            Biblioteca de Temas
          </button>
        </div>
      </div>

      {/* Grid containing Mixer dashboard & stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
        
        {/* MUSIC & AUDIO MIXER PANEL */}
        <div className="neumorphic-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>Mesa de Áudio</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Misture ruídos e acordes para criar seu porto seguro.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="neumorphic-btn" 
                onClick={handleToggleAmbient}
                style={{ padding: '8px 12px', borderRadius: '10px' }}
                title={isAmbientPlaying ? 'Pausar Áudio' : 'Tocar Áudio'}
              >
                {isAmbientPlaying ? <IconPause /> : <IconPlay />}
              </button>
              <button 
                className="neumorphic-btn" 
                onClick={nextTrack}
                style={{ padding: '8px 12px', borderRadius: '10px' }}
                title="Mudar escala do piano"
              >
                <IconNext />
              </button>
            </div>
          </div>

          {/* Volume controls for channels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--bg-primary)', padding: '16px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
            
            {/* Master Slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>Volume Geral</span>
                <span>{Math.round(currentMixer.master * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={currentMixer.master} 
                onChange={(e) => updateMixerVolume('master', e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
              />
            </div>

            {/* Rain Slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>Chuva</span>
                <span>{Math.round(currentMixer.rain * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={currentMixer.rain} 
                onChange={(e) => updateMixerVolume('rain', e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
              />
            </div>

            {/* White Noise Slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>Ruído Branco</span>
                <span>{Math.round(currentMixer.whiteNoise * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={currentMixer.whiteNoise} 
                onChange={(e) => updateMixerVolume('whiteNoise', e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
              />
            </div>

            {/* Piano Slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>Piano Acústico</span>
                <span>{Math.round(currentMixer.piano * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={currentMixer.piano} 
                onChange={(e) => updateMixerVolume('piano', e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
              />
            </div>
            
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '4px' }}>
              Escala de Acordes ativa: {currentMixer.trackIndex === 0 ? ' Sunset Maior' : ' Moonlit Zen Menor'}
            </div>
          </div>
        </div>

        {/* STATS & SYNC PANEL */}
        <div className="neumorphic-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>Configurações & Status</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.03)', paddingBottom: '10px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Foco Acumulado</span>
              <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{totalHours}h</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.03)', paddingBottom: '10px', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Estudos Seguidos</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: 'var(--accent-color)' }}>
                <IconFlame size={14} />
                <span>{state.streak} dias</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.03)', paddingBottom: '10px', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Orvalho Colhido</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: 'var(--accent-color)' }}>
                <IconDroplet size={14} />
                <span>{state.orvalho}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '500' }}>Modo Companhia</span>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Presenças no horizonte.</p>
              </div>
              <button 
                className={`neumorphic-btn ${state.settings.companyMode ? 'active' : ''}`}
                onClick={toggleCompanyMode}
                style={{ padding: '6px 14px', fontSize: '0.75rem' }}
              >
                {state.settings.companyMode ? 'Ativo' : 'Desativado'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '500' }}>Penalidade por Saída</span>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Murchar planta se mudar de aba.</p>
              </div>
              <button 
                className={`neumorphic-btn ${state.settings.wiltOnDistraction ? 'active' : ''}`}
                onClick={toggleWiltOnDistraction}
                style={{ padding: '6px 14px', fontSize: '0.75rem' }}
              >
                {state.settings.wiltOnDistraction ? 'Ativo' : 'Desativado'}
              </button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Sessão Ativa</span>
              <button 
                onClick={logout}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#c75e43', 
                  fontSize: '0.75rem', 
                  cursor: 'pointer', 
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em'
                }}
              >
                Sair da Conta
              </button>
            </div>
            <div style={{ 
              background: 'var(--bg-primary)', 
              boxShadow: 'var(--shadow-inset)',
              padding: '10px 14px', 
              borderRadius: '10px', 
              fontSize: '0.75rem', 
              fontFamily: 'monospace',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: 'var(--text-primary)',
              border: '1px solid rgba(255,255,255,0.4)',
              textAlign: 'center',
              fontWeight: '600'
            }}>
              {currentUser?.email || 'Acesso Google'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
