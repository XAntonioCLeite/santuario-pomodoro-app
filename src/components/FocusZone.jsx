// Autor: Antônio Costa Leite
// Componente de Zona de Foco e Temporizador Pomodoro (O Santuário)

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { audioSynth } from '../utils/audio';
import { getPlantRank } from '../utils/plantRenderer';

const FocusZone = ({ onSessionComplete }) => {
  const { state, addFocusMinutes, toggleTopicCompleted } = useApp();
  
  // Selection states
  const [selectedSubjectId, setSelectedSubjectId] = useState(state.subjects[0]?.id || '');
  const [timerDuration, setTimerDuration] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [breakDuration, setBreakDuration] = useState(5 * 60);   // seconds
  const [totalBlocks, setTotalBlocks] = useState(4);            // # of focus blocks
  const [currentBlock, setCurrentBlock] = useState(1);          // which block we're on
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [currentSessionSeed, setCurrentSessionSeed] = useState(Math.random());
  
  const accumulatedStudySecondsRef = useRef(0);
  const accumulatedBreakSecondsRef = useRef(0);
  
  // Running states
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isWilting, setIsWilting] = useState(false);
  const [showWiltWarning, setShowWiltWarning] = useState(false);
  const [wiltCount, setWiltCount] = useState(0);

  // Settings dropdown toggle (minimalist layout)
  const [showSettings, setShowSettings] = useState(false);
  const [showSubjectSelect, setShowSubjectSelect] = useState(false);

  const timerRef = useRef(null);

  // Obtém próximas tarefas pendentes
  const pendingTasks = (state.tasks || []).filter(t => !t.completed);
  const sortedTasks = [...pendingTasks].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Date formatter helper in FocusZone
  const getTaskDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(dateStr + 'T00:00:00');
    const diffTime = taskDate - today;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'hoje';
    if (diffDays === 1) return 'amanhã';
    if (diffDays === 2) return 'depois de amanhã';
    
    const [year, month, day] = dateStr.split('-');
    return `dia ${day}/${month}`;
  };

  const nextTask = sortedTasks[0];
  const nextTaskSubject = nextTask ? state.subjects.find(s => s.id === nextTask.subjectId) : null;

  // 2. Adaptive Rhythm: suggest 45m if they studied easily today
  const studiedTodayCount = state.museumItems?.filter(item => {
    // Verifica se a planta foi cultivada hoje
    return item.date === new Date().toLocaleDateString('pt-BR');
  }).length || 0;

  const suggestDeepFocus = studiedTodayCount >= 2;

  // Recommended cycles
  const getEnergyRecommendation = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      return { minutes: 40, title: "Foco Matutino", reason: "Mente descansada. Ideal para assimilação." };
    } else if (hour >= 22 || hour < 4) {
      return { minutes: 15, title: "Sintonia Noturna", reason: "Foco leve para não perturbar o sono." };
    } else {
      return { minutes: 25, title: "Pomodoro Tradicional", reason: "Equilíbrio recomendado de atenção." };
    }
  };
  const recommendation = getEnergyRecommendation();

  // Tab visibility changes
  useEffect(() => {
    if (!state.settings.wiltOnDistraction) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isActive && !isPaused) {
          setIsWilting(true);
          setWiltCount(prev => prev + 1);
          setShowWiltWarning(true);
        }
      }
    };
    const handleBlur = () => {
      if (isActive && !isPaused) {
        setIsWilting(true);
        setWiltCount(prev => prev + 1);
        setShowWiltWarning(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isActive, isPaused, state.settings.wiltOnDistraction]);

  // Audio start/stop
  useEffect(() => {
    if (isActive && !isPaused) {
      if (state.settings.mood === 'creative') {
        audioSynth.startPiano();
      } else {
        audioSynth.startRain();
      }
    } else {
      audioSynth.stopAll();
    }
    return () => audioSynth.stopAll();
  }, [isActive, isPaused, state.settings.mood]);

  // Timer loop
  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (isOnBreak) {
            accumulatedBreakSecondsRef.current += 1;
          } else {
            accumulatedStudySecondsRef.current += 1;
          }

          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimeout(() => {
              handlePhaseComplete();
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isPaused, isOnBreak]);

  const handleStart = () => {
    audioSynth.init();
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    setIsWilting(false);
    setShowWiltWarning(false);
    setWiltCount(0);
    setCurrentBlock(1);
    setIsOnBreak(false);
    setTimeLeft(timerDuration);
    accumulatedStudySecondsRef.current = 0;
    accumulatedBreakSecondsRef.current = 0;
    setCurrentSessionSeed(Math.random());
    audioSynth.stopAll();
  };

  const handleSessionFinish = () => {
    audioSynth.stopAll();
    audioSynth.playChime();
    
    const studyMins = accumulatedStudySecondsRef.current > 0
      ? Math.max(1, Math.round(accumulatedStudySecondsRef.current / 60))
      : 0;
    const breakMins = accumulatedBreakSecondsRef.current > 0
      ? Math.max(1, Math.round(accumulatedBreakSecondsRef.current / 60))
      : 0;

    addFocusMinutes(selectedSubjectId, studyMins, wiltCount, currentSessionSeed);
    onSessionComplete(selectedSubjectId, studyMins, breakMins, wiltCount, currentSessionSeed);
    handleReset();
  };

  const handlePhaseComplete = () => {
    audioSynth.stopAll();
    audioSynth.playChime();

    if (!isOnBreak) {
      if (currentBlock < totalBlocks) {
        setIsOnBreak(true);
        setTimeLeft(breakDuration);
        setIsActive(true);
        setIsPaused(false);
      } else {
        handleSessionFinish();
      }
    } else {
      setCurrentBlock(prev => prev + 1);
      setIsOnBreak(false);
      setTimeLeft(timerDuration);
      setIsActive(true);
      setIsPaused(false);
    }
  };

  const handleSkip = () => {
    audioSynth.stopAll();
    audioSynth.playChime();

    if (!isOnBreak) {
      if (currentBlock < totalBlocks) {
        setIsOnBreak(true);
        setTimeLeft(breakDuration);
        setIsActive(true);
        setIsPaused(false);
      } else {
        handleSessionFinish();
      }
    } else {
      setCurrentBlock(prev => prev + 1);
      setIsOnBreak(false);
      setTimeLeft(timerDuration);
      setIsActive(true);
      setIsPaused(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = isOnBreak ? 100 : ((timerDuration - timeLeft) / timerDuration) * 100;
  const activeSubject = state.subjects.find(s => s.id === selectedSubjectId);
  const subjectColor = activeSubject ? activeSubject.color : 'var(--accent-color)';

  const renderLineArtPlant = (progress, isWithered) => {
    const strokeColor = isWithered ? '#a39890' : 'var(--plant-green)';
    const bloomColor = isWithered ? '#bdafa4' : (activeSubject?.color || 'var(--accent-color)');
    
    const transformStyle = isWithered 
      ? { transform: 'rotate(20deg) translateY(10px)', transformOrigin: '50px 85px', transition: 'var(--transition-smooth)' }
      : { transformOrigin: '50px 85px', transition: 'var(--transition-smooth)' };

    return (
      <g className="sway-animation" style={transformStyle}>
        {progress >= 5 && (
          <path d="M50 85 C50 72, 48 58, 48 42" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}
        {progress >= 25 && (
          <>
            <path d="M49 68 C42 65, 36 64, 33 66" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M33 66 C31 63, 27 62, 25 64 C27 66, 30 68, 33 66" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          </>
        )}
        {progress >= 50 && (
          <>
            <path d="M48 56 C52 52, 58 50, 64 52" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M64 52 C67 50, 71 50, 73 53 C70 55, 66 55, 64 52" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          </>
        )}
        {progress >= 70 && (
          <path d="M48 42 C45 35, 41 31, 39 25" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" fill="none" />
        )}
        {progress >= 85 && (
          <g style={{ transform: 'translate(48px, 42px)', animation: 'leaf-unroll 0.8s ease' }}>
            <circle cx="0" cy="0" r="4.5" fill="none" stroke={bloomColor} strokeWidth="1.5" />
            <circle cx="-6" cy="0" r="3" fill="none" stroke={bloomColor} strokeWidth="1" />
            <circle cx="6" cy="0" r="3" fill="none" stroke={bloomColor} strokeWidth="1" />
            <circle cx="0" cy="-6" r="3" fill="none" stroke={bloomColor} strokeWidth="1" />
            <circle cx="0" cy="6" r="3" fill="none" stroke={bloomColor} strokeWidth="1" />
          </g>
        )}
      </g>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center', width: '100%' }}>
      
      {/* 1. GOOGLE CALENDAR RECOMMENDATION BANNER */}
      {!isActive && nextTask && (
        <div className="neumorphic-card" style={{ width: '100%', padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '4px solid var(--accent-color)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: '700' }}>
            Agenda Pessoal (Google Calendar)
          </span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              Você tem <strong>{nextTask.title}</strong> {getTaskDateLabel(nextTask.date)}. Estudar {nextTaskSubject ? nextTaskSubject.name : 'Geral'} agora?
            </span>
            <button 
              className="neumorphic-btn active" 
              onClick={() => setSelectedSubjectId(nextTask.subjectId || '')}
              style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: '8px' }}
            >
              Focar nesta matéria
            </button>
          </div>
        </div>
      )}

      {/* 2. ADAPTIVE RHYTHM INVITATION PANEL */}
      {!isActive && suggestDeepFocus && (
        <div className="neumorphic-card" style={{ width: '100%', padding: '20px 24px', background: 'rgba(var(--accent-rgb), 0.02)', border: '1px solid var(--accent-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Ajuste Adaptativo de Ciclo</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Você completou {studiedTodayCount} sessões hoje de forma estável. Deseja realizar um ciclo profundo de 45 minutos?
              </p>
            </div>
            <button 
              className="neumorphic-btn accent-btn"
              onClick={() => {
                setTimerDuration(45 * 60);
                setTimeLeft(45 * 60);
              }}
              style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '10px' }}
            >
              Iniciar 45m
            </button>
          </div>
        </div>
      )}

      {/* 3. CORE FOCUS PANEL (Ultra Minimalist Landing State) */}
      <div 
        className="neumorphic-card" 
        style={{ 
          width: '100%', 
          padding: isActive ? '40px 24px' : '60px 24px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '35px',
          overflow: 'hidden'
        }}
      >
        {/* Wilt distraction warning banner */}
        {showWiltWarning && (
          <div style={{
            background: 'var(--panel-bg)',
            border: '1.5px solid #d45d3f',
            borderRadius: '16px',
            padding: '16px 20px',
            color: '#a04028',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            animation: 'fadeIn 0.3s ease'
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>
              Ausência detectada. O ritmo da planta oscilou e ela pendeu para o lado. Retorne para restabelecer a hidratação.
            </span>
            <button 
              onClick={() => setShowWiltWarning(false)} 
              style={{ background: 'transparent', border: 'none', color: '#a04028', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}
            >
              Focar
            </button>
          </div>
        )}

        {/* Minimalist Header configurations (Visible when inactive and toggled) */}
        {!isActive ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', width: '100%' }}>
            {/* Subject Label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-primary)', padding: '6px 16px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: subjectColor }} />
              <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                Estudando: {activeSubject?.name || 'Geral'}
              </span>
            </div>

            {/* Topics Checklist for Selected Subject */}
            {activeSubject && activeSubject.topics && activeSubject.topics.length > 0 && (
              <div style={{
                width: '100%',
                maxWidth: '360px',
                background: 'var(--bg-primary)',
                padding: '12px 16px',
                borderRadius: '16px',
                border: '1px solid var(--card-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                animation: 'fadeIn 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>
                    Tópicos da Matéria
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontWeight: '700' }}>
                    {activeSubject.topics.filter(t => t.completed).length} / {activeSubject.topics.length} concluídos
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '110px', overflowY: 'auto' }}>
                  {activeSubject.topics.map(topic => (
                    <label key={topic.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                      <input
                        type="checkbox"
                        checked={topic.completed}
                        onChange={() => toggleTopicCompleted(activeSubject.id, topic.id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <span style={{ textDecoration: topic.completed ? 'line-through' : 'none', opacity: topic.completed ? 0.6 : 1 }}>
                        {topic.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            <button 
              onClick={() => setShowSettings(!showSettings)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem', textDecoration: 'underline', cursor: 'pointer', letterSpacing: '0.02em' }}
            >
              {showSettings ? 'Ocultar configurações de ciclo' : 'Ajustar matéria e tempo'}
            </button>

            {/* Expandable settings drawer */}
            {showSettings && (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px', 
                width: '100%', 
                maxWidth: '280px', 
                background: 'var(--bg-primary)', 
                padding: '16px', 
                borderRadius: '16px',
                border: '1px solid var(--card-border)',
                animation: 'fadeIn 0.2s ease'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Matéria</label>
                  <div style={{ position: 'relative' }}>
                    <button 
                      type="button"
                      onClick={() => setShowSubjectSelect(!showSubjectSelect)}
                      className="input-field"
                      style={{ 
                        background: 'var(--panel-bg)',
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
                      <span>{state.subjects.find(s => s.id === selectedSubjectId)?.name || 'Independente (Geral)'}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: showSubjectSelect ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {showSubjectSelect && (
                      <>
                        <div 
                          onClick={() => setShowSubjectSelect(false)}
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
                              setSelectedSubjectId('');
                              setShowSubjectSelect(false);
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
                            <span>Independente (Geral)</span>
                          </button>
                          {state.subjects.filter(s => !s.concluded).map(s => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setSelectedSubjectId(s.id);
                                setShowSubjectSelect(false);
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Duração do Foco</label>
                  <select 
                    className="input-field" 
                    value={timerDuration} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setTimerDuration(val);
                      setTimeLeft(val);
                    }}
                    style={{ background: 'var(--panel-bg)' }}
                  >
                    <option value={15 * 60}>15 minutos</option>
                    <option value={25 * 60}>25 minutos</option>
                    <option value={40 * 60}>40 minutos</option>
                    <option value={60 * 60}>60 minutos</option>
                  </select>
                </div>

                {/* Break Duration */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Duração da Pausa</label>
                  <select 
                    className="input-field" 
                    value={breakDuration} 
                    onChange={(e) => setBreakDuration(parseInt(e.target.value))}
                    style={{ background: 'var(--panel-bg)' }}
                  >
                    <option value={3 * 60}>3 minutos</option>
                    <option value={5 * 60}>5 minutos</option>
                    <option value={10 * 60}>10 minutos</option>
                    <option value={15 * 60}>15 minutos</option>
                  </select>
                </div>
                {/* Number of Blocks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Blocos de Estudo</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setTotalBlocks(prev => Math.max(1, prev - 1))}
                      className="neumorphic-btn"
                      style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={totalBlocks}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val > 0) {
                          setTotalBlocks(val);
                        }
                      }}
                      className="input-field"
                      style={{ flex: 1, textAlign: 'center', height: '36px', borderRadius: '10px', background: 'var(--panel-bg)', fontWeight: '600' }}
                    />
                    <button
                      type="button"
                      onClick={() => setTotalBlocks(prev => prev + 1)}
                      className="neumorphic-btn"
                      style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}
                    >
                      +
                    </button>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {totalBlocks} bloco{totalBlocks > 1 ? 's' : ''} de {Math.round(timerDuration/60)}min + pausa de {Math.round(breakDuration/60)}min
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'var(--bg-primary)', 
              boxShadow: 'var(--shadow-inset)',
              padding: '8px 20px', 
              borderRadius: '16px',
              border: '1px solid var(--card-border)'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: subjectColor }} />
              <span style={{ fontWeight: '600', fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                Focando em {activeSubject ? activeSubject.name : 'Geral'}
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontStyle: 'italic', letterSpacing: '0.01em' }}>
              Meta: {getPlantRank((timerDuration / 60) * totalBlocks).name}
            </span>
          </div>
        )}

        {/* Minimalist plant drawing */}
        <div style={{ height: '160px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%' }}>
          <svg width="150" height="140" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M37 85 L63 85 L59 95 L41 95 Z" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinejoin="round" />
            {renderLineArtPlant(progressPercent, isWilting)}
          </svg>
        </div>

        {/* Block progress dots / compact text */}
        {totalBlocks > 1 && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '100%' }}>
            {totalBlocks <= 8 ? (
              Array.from({ length: totalBlocks }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === currentBlock - 1 ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: i < currentBlock - 1
                      ? 'var(--accent-color)'
                      : i === currentBlock - 1
                        ? (isOnBreak ? '#f0a500' : subjectColor)
                        : 'var(--card-border)',
                    transition: 'all 0.3s ease',
                    opacity: i >= currentBlock - 1 && i !== currentBlock - 1 ? 0.35 : 1
                  }}
                />
              ))
            ) : (
              <div style={{ width: '120px', height: '6px', borderRadius: '3px', background: 'var(--card-border)', overflow: 'hidden', position: 'relative' }}>
                <div 
                  style={{ 
                    width: `${((currentBlock - 1 + (isOnBreak ? 0.5 : 0)) / totalBlocks) * 100}%`, 
                    height: '100%', 
                    background: 'var(--accent-color)', 
                    transition: 'width 0.3s ease' 
                  }} 
                />
              </div>
            )}
            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginLeft: '4px', fontWeight: '600' }}>
              {isOnBreak ? 'Pausa' : `Bloco ${currentBlock}/${totalBlocks}`}
            </span>
          </div>
        )}

        {/* Digital numbers timer display */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ 
            fontSize: '5.5rem', 
            fontWeight: '300', 
            letterSpacing: '-3px', 
            color: isOnBreak ? '#f0a500' : isWilting ? '#c75e43' : 'var(--text-primary)', 
            transition: 'var(--transition-smooth)',
            lineHeight: '1'
          }}>
            {formatTime(timeLeft)}
          </div>
          {isOnBreak && (
            <div style={{ fontSize: '0.8rem', color: '#f0a500', fontWeight: '500', marginTop: '4px' }}>
              Aproveite a pausa
            </div>
          )}
        </div>

        {/* Control triggers */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {!isActive ? (
            <button className="neumorphic-btn accent-btn" onClick={handleStart} style={{ padding: '14px 44px', borderRadius: '18px', fontSize: '0.95rem' }}>
              {isOnBreak ? 'Iniciar Pausa' : 'Iniciar Foco'}
            </button>
          ) : (
            <>
              {isPaused ? (
                <button className="neumorphic-btn active" onClick={handleResume}>
                  Retomar
                </button>
              ) : (
                <button className="neumorphic-btn" onClick={handlePause}>
                  Pausar
                </button>
              )}
              
              <button className="neumorphic-btn" onClick={handleSkip}>
                Pular
              </button>

              <button 
                className="neumorphic-btn" 
                onClick={handleReset} 
                style={{ color: '#c75e43', borderColor: 'rgba(199, 94, 67, 0.15)' }}
              >
                Suspender
              </button>
            </>
          )}
        </div>
      </div>

      {/* 4. SHARED FOCUS SIMULATED COMPANIONS (Modo Foco Compartilhado) */}
      {isActive && state.settings.companyMode && (
        <div className="neumorphic-card" style={{ width: '100%', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: '700' }}>
            Foco Coletivo Conectado
          </span>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* User Plant status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
                <path d="M40 85 L60 85 L56 93 L44 93 Z" fill="none" stroke="var(--text-secondary)" strokeWidth="2" />
                {renderLineArtPlant(progressPercent, isWilting)}
              </svg>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>Seu Santuário</div>
                <div style={{ fontSize: '0.75rem', color: isWilting ? '#c75e43' : 'var(--accent-color)' }}>
                  {isWilting ? 'Ritmo instável' : 'Mantendo fluxo ativo'}
                </div>
              </div>
            </div>

            {/* Peer plant status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, borderLeft: '1px solid rgba(0,0,0,0.04)', paddingLeft: '20px' }}>
              <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
                <path d="M40 85 L60 85 L56 93 L44 93 Z" fill="none" stroke="var(--text-secondary)" strokeWidth="2" />
                {/* Peer plant grows steadily slightly behind or matching */}
                {renderLineArtPlant(Math.max(10, progressPercent - 5), false)}
              </svg>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>Parceiro: Lucas</div>
                <div style={{ fontSize: '0.75rem', color: isWilting ? '#c75e43' : 'var(--accent-color)' }}>
                  {isWilting ? 'Apoiando você à distância' : 'Em ritmo constante'}
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center' }}>
            {isWilting 
              ? 'Aviso: Sua ausência afeta o ecossistema compartilhado. Retorne para restabelecer a conexão.'
              : 'Fluxo em harmonia. Estudar juntos potencializa a fixação de conhecimento.'}
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusZone;
