// Autor: Antônio Costa Leite
// Componente de Agenda e Cronograma de Estudos (O Santuário)

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SubjectIcons } from './SubjectCreator';
import WeeklyGrid from './WeeklyGrid';

// Outlined SVG icons
const IconFlame = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const IconCalendar = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconList = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const IconSettings = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const IconGrid = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
  </svg>
);

const IconTrash = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const IconEdit = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconGoogleCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
  </svg>
);

const AgendaView = () => {
  const { 
    state, 
    toggleTaskCompleted, 
    deleteTask, 
    updateTask, 
    addTask,
    disconnectGoogleSync,
    setGoogleSyncActive,
    getLocalDateString,
    parseLocalDate
  } = useApp();

  // Mode state: 'focus' (Day list), 'vision' (Month grid), or 'manage' (Calendar settings & Google Sync)
  const [viewMode, setViewMode] = useState('focus');
  
  // Selection date for Vision grid (defaults to today)
  const todayStr = getLocalDateString();
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 0) {
        setCurrentYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 11) {
        setCurrentYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  // Edit Task Drawer state
  const [editingTask, setEditingTask] = useState(null); // Task object
  const [showEditSubDropdown, setShowEditSubDropdown] = useState(false);
  
  // Google sync parameters
  const [onlyMatchSubjects, setOnlyMatchSubjects] = useState(true);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Sync token redirect trigger
  React.useEffect(() => {
    const handleTokenReceived = () => {
      const token = localStorage.getItem('google_calendar_access_token');
      if (token) {
        fetchEventsFromGoogle(token);
      }
    };
    window.addEventListener('google-calendar-token-received', handleTokenReceived);
    return () => window.removeEventListener('google-calendar-token-received', handleTokenReceived);
  }, [state.subjects]);

  const getUrgencyText = (taskDate) => {
    const today = parseLocalDate(todayStr);
    const target = parseLocalDate(taskDate);
    const diffTime = target - today;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { label: "HOJE", type: "urgent" };
    if (diffDays === 1) return { label: "Amanhã", type: "warning" };
    if (diffDays > 1 && diffDays <= 7) return { label: `em ${diffDays} dias`, type: "normal" };
    if (diffDays < 0) return { label: "Atrasado", type: "urgent" };
    return { label: `em ${diffDays} dias`, type: "future" };
  };

  // Filter Active Tasks list
  const pendingTasks = (state.tasks || []).filter(t => !t.completed);
  
  // Top 3 closest tasks for the banner "Próximos 7 Dias"
  const upcomingTasks = [...pendingTasks]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  // Month vision parameters
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const monthLabel = `${monthNames[currentMonth]} ${currentYear}`;
  
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOffset = (y, m) => new Date(y, m, 1).getDay();

  const daysCount = getDaysInMonth(currentYear, currentMonth);
  const offset = getFirstDayOffset(currentYear, currentMonth);
  
  const cells = [];
  for (let i = 0; i < offset; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysCount; d++) {
    const dayStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    cells.push({ dayNum: d, dateStr: dayStr });
  }

  const getTasksForDate = (dateStr) => {
    return (state.tasks || []).filter(t => t.date === dateStr);
  };

  const tasksForSelectedDate = getTasksForDate(selectedDate);

  // Run Google Calendar sync
  const handleGoogleSync = () => {
    const cachedToken = localStorage.getItem('google_calendar_access_token');
    
    if (!cachedToken) {
      const clientId = "1033192402509-tv3hoevmg5j3r0btnq3b02upkcuh83qi.apps.googleusercontent.com";
      const redirectUri = window.location.origin + window.location.pathname;
      const scopes = [
        "https://www.googleapis.com/auth/calendar.readonly"
      ].join(" ");
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth` +
        `?client_id=${encodeURIComponent(clientId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=token` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&state=google-calendar-sync` +
        `&prompt=consent`;
        
      window.location.href = authUrl;
      return;
    }
    
    fetchEventsFromGoogle(cachedToken);
  };

  const fetchEventsFromGoogle = async (token) => {
    setIsSyncing(true);
    setSyncProgress(10);
    setSyncStatusMsg('Conectando ao Google Calendar...');
    
    try {
      const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&maxResults=150`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.status === 401) {
        localStorage.removeItem('google_calendar_access_token');
        setSyncStatusMsg('Sessão expirada. Reconectando...');
        setTimeout(() => {
          handleGoogleSync();
        }, 1500);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar agendas: ${response.statusText}`);
      }
      
      setSyncProgress(50);
      setSyncStatusMsg('Filtrando e mapeando eventos...');
      
      const data = await response.json();
      const events = data.items || [];
      
      let importedCount = 0;
      
      for (const event of events) {
        const title = event.summary || '';
        const start = event.start.dateTime || event.start.date;
        if (!start) continue;
        
        const eventDate = start.split('T')[0];
        let eventTime = '00:00';
        if (start.includes('T')) {
          eventTime = start.split('T')[1].substring(0, 5);
        }
        
        let targetSubjectId = '';
        let matched = false;
        
        for (const sub of state.subjects) {
          if (title.toLowerCase().includes(sub.name.toLowerCase())) {
            targetSubjectId = sub.id;
            matched = true;
            break;
          }
        }
        
        if (onlyMatchSubjects && !matched) {
          continue;
        }
        
        const alreadyExists = (state.tasks || []).some(t => 
          t.title === title && t.date === eventDate && t.time === eventTime
        );
        
        if (!alreadyExists) {
          let taskType = 'outros';
          const titleLower = title.toLowerCase();
          if (titleLower.includes('prova') || titleLower.includes('exame') || titleLower.includes('teste')) {
            taskType = 'prova';
          } else if (titleLower.includes('trabalho') || titleLower.includes('entrega') || titleLower.includes('apresentação')) {
            taskType = 'trabalho';
          } else if (titleLower.includes('leitura') || titleLower.includes('estudar') || titleLower.includes('artigo')) {
            taskType = 'leitura';
          }
          
          addTask(title, targetSubjectId, taskType, eventDate, eventTime, false, true);
          importedCount++;
        }
      }
      
      setSyncProgress(100);
      setLastSyncTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      setIsSyncing(false);
      setSyncStatusMsg(`Sincronizado! ${importedCount} novos eventos importados.`);
      setGoogleSyncActive(true);
      setTimeout(() => setSyncStatusMsg(''), 4000);
      
    } catch (err) {
      console.error(err);
      setIsSyncing(false);
      setSyncStatusMsg(`Erro na sincronização: ${err.message}`);
      setTimeout(() => setSyncStatusMsg(''), 5000);
    }
  };

  const handleEditTaskClick = (task) => {
    setEditingTask({ ...task });
  };

  const handleSaveEditedTask = (e) => {
    e.preventDefault();
    if (!editingTask.title.trim()) return;

    updateTask(editingTask.id, {
      title: editingTask.title.trim(),
      subjectId: editingTask.subjectId,
      type: editingTask.type,
      date: editingTask.date,
      time: editingTask.time
    });

    setEditingTask(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
      
      {/* 1. UPCOMING BANNER: "Próximos 7 Dias" */}
      <div className="neumorphic-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconFlame size={16} />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: '700' }}>
            Próximos 7 Dias (Carga de Estudo)
          </span>
        </div>

        {upcomingTasks.length === 0 ? (
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Nenhum compromisso pendente no horizonte.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcomingTasks.map(task => {
              const sub = state.subjects.find(s => s.id === task.subjectId);
              const subColor = sub ? sub.color : 'var(--accent-color)';
              const urgency = getUrgencyText(task.date);
              
              let urgencyBg = 'rgba(0,0,0,0.03)';
              let urgencyColor = 'var(--text-secondary)';
              if (urgency.type === 'urgent') {
                urgencyBg = 'rgba(199, 94, 67, 0.08)';
                urgencyColor = '#c75e43';
              } else if (urgency.type === 'warning') {
                urgencyBg = 'rgba(167, 84, 31, 0.08)';
                urgencyColor = '#a7541f';
              }

              return (
                <div 
                  key={task.id} 
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--panel-bg)',
                    border: '1px solid var(--card-border)',
                    padding: '12px 16px',
                    borderRadius: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: subColor }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>{task.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {sub ? sub.name : 'Matéria'} • {task.time}
                      </div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    background: urgencyBg,
                    color: urgencyColor
                  }}>
                    {urgency.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. MODE TOGGLER */}
      <div style={{
        display: 'flex',
        background: 'var(--panel-bg)',
        boxShadow: 'var(--shadow-inset)',
        padding: '5px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '380px',
        alignSelf: 'center',
        gap: '4px'
      }}>
        <button
          onClick={() => setViewMode('focus')}
          className={`nav-btn ${viewMode === 'focus' ? 'active' : ''}`}
          style={{ flex: 1, padding: '8px', fontSize: '0.78rem', borderRadius: '12px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <IconList size={15} />
          <span>Foco</span>
        </button>
        <button
          onClick={() => setViewMode('weekly')}
          className={`nav-btn ${viewMode === 'weekly' ? 'active' : ''}`}
          style={{ flex: 1, padding: '8px', fontSize: '0.78rem', borderRadius: '12px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <IconGrid size={15} />
          <span>Grade</span>
        </button>
        <button
          onClick={() => setViewMode('vision')}
          className={`nav-btn ${viewMode === 'vision' ? 'active' : ''}`}
          style={{ flex: 1, padding: '8px', fontSize: '0.78rem', borderRadius: '12px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <IconCalendar size={15} />
          <span>Visão</span>
        </button>
        <button
          onClick={() => setViewMode('manage')}
          className={`nav-btn ${viewMode === 'manage' ? 'active' : ''}`}
          style={{ flex: 1, padding: '8px', fontSize: '0.78rem', borderRadius: '12px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <IconSettings size={15} />
          <span>Google Sync</span>
        </button>
      </div>

      {/* 3. VIEW MODE 1: FOCUS MODE (Chronological List) */}
      {viewMode === 'focus' && (
        <div className="neumorphic-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Agenda de Fluxo</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Lista cronológica de pendências organizadas por data.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {(state.tasks || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Nenhuma tarefa agendada no calendário.
              </div>
            ) : (
              [...(state.tasks || [])]
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((task) => {
                  const sub = state.subjects.find(s => s.id === task.subjectId);
                  const subColor = sub ? sub.color : '#a3a3a3';
                  const urgency = getUrgencyText(task.date);

                  return (
                    <div 
                      key={task.id} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        background: task.completed ? 'rgba(0,0,0,0.01)' : 'var(--panel-bg)',
                        borderLeft: `5px solid ${subColor}`,
                        borderRadius: '0 14px 14px 0',
                        opacity: task.completed ? 0.6 : 1,
                        border: '1px solid rgba(0,0,0,0.02)',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                        <button
                          type="button"
                          onClick={() => toggleTaskCompleted(task.id)}
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: 'var(--bg-primary)',
                            border: `2px solid ${subColor}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          {task.completed && (
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: subColor }} />
                          )}
                        </button>

                        <div>
                          <div style={{ 
                            fontSize: '0.9rem', 
                            fontWeight: '700', 
                            color: 'var(--text-primary)',
                            textDecoration: task.completed ? 'line-through' : 'none'
                          }}>
                            {task.title}
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                              {sub ? sub.name : 'Independente'} • {task.time}
                            </span>
                            <span style={{
                              fontSize: '0.65rem',
                              fontWeight: '600',
                              padding: '2px 6px',
                              borderRadius: '6px',
                              background: 'var(--bg-primary)',
                              color: 'var(--text-secondary)'
                            }}>
                              {task.type}
                            </span>
                            {!task.completed && (
                              <span style={{ fontSize: '0.68rem', fontWeight: 'bold', color: urgency.type === 'urgent' ? '#c75e43' : 'var(--text-secondary)' }}>
                                ({urgency.label})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          type="button" 
                          onClick={() => handleEditTaskClick(task)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px' }}
                          title="Editar atividade"
                        >
                          <IconEdit />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => deleteTask(task.id)}
                          style={{ background: 'none', border: 'none', color: '#c75e43', cursor: 'pointer', padding: '6px' }}
                          title="Excluir"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* 3.5 VIEW MODE 1.5: WEEKLY GRADE MODE */}
      {viewMode === 'weekly' && (
        <WeeklyGrid />
      )}

      {/* 4. VIEW MODE 2: VISION MODE (Monthly Calendar Grid) */}
      {viewMode === 'vision' && (
        <div className="neumorphic-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button type="button" onClick={handlePrevMonth} className="neumorphic-btn" style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '8px', border: 'none' }}>◀</button>
                <span>{monthLabel}</span>
                <button type="button" onClick={handleNextMonth} className="neumorphic-btn" style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '8px', border: 'none' }}>▶</button>
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Clique nos dias para visualizar as tarefas.
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            textAlign: 'center',
            fontWeight: '600',
            fontSize: '0.7rem',
            color: 'var(--text-secondary)',
            letterSpacing: '0.02em',
            textTransform: 'uppercase'
          }}>
            <span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {cells.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} style={{ height: '52px' }} />;
              }
              const isSelected = selectedDate === cell.dateStr;
              const hasTask = getTasksForDate(cell.dateStr);
              
              return (
                <button
                  key={cell.dateStr}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className="neumorphic-btn"
                  style={{
                    height: '52px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 4px 6px 4px',
                    borderRadius: '10px',
                    border: 'none',
                    background: isSelected ? 'var(--panel-bg)' : 'transparent',
                    boxShadow: isSelected ? 'var(--shadow-inset)' : 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? '700' : '400' }}>
                    {cell.dayNum}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '3px', height: '6px', justifyContent: 'center' }}>
                    {hasTask.slice(0, 3).map((t) => {
                      const sub = state.subjects.find(s => s.id === t.subjectId);
                      return (
                        <span 
                          key={t.id} 
                          style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            background: sub ? sub.color : 'var(--accent-color)'
                          }} 
                        />
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Details below */}
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Compromissos em: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tasksForSelectedDate.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '10px 0' }}>
                  Nenhuma atividade cadastrada para este dia.
                </div>
              ) : (
                tasksForSelectedDate.map(task => {
                  const sub = state.subjects.find(s => s.id === task.subjectId);
                  const subColor = sub ? sub.color : 'var(--accent-color)';
                  
                  return (
                    <div 
                      key={task.id} 
                      style={{
                        background: 'var(--bg-primary)',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid var(--card-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        opacity: task.completed ? 0.6 : 1
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                          type="button"
                          onClick={() => toggleTaskCompleted(task.id)}
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: 'var(--bg-primary)',
                            border: `2px solid ${subColor}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          {task.completed && (
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: subColor }} />
                          )}
                        </button>
                        
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: '700', textDecoration: task.completed ? 'line-through' : 'none' }}>
                            {task.title}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {sub ? sub.name : 'Geral'} • {task.time} • {task.type}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          type="button" 
                          onClick={() => handleEditTaskClick(task)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                        >
                          <IconEdit />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => deleteTask(task.id)}
                          style={{ background: 'none', border: 'none', color: '#c75e43', cursor: 'pointer', padding: '4px' }}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. VIEW MODE 3: GOOGLE CALENDAR SYNC PANEL */}
      {viewMode === 'manage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="neumorphic-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <IconGoogleCalendar />
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Integração Google Calendar</h3>
              </div>
              {state.googleSyncActive && (
                <span style={{ fontSize: '0.68rem', fontWeight: 'bold', color: 'var(--accent-color)', background: 'rgba(74, 124, 89, 0.1)', padding: '4px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>
                  Ativo
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Sincronize as datas de provas e cronograma da faculdade diretamente para o fluxo do Santuário de forma real.
            </p>

            {/* Config controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: 'var(--bg-primary)', padding: '16px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Configurações de Sincronização</label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={onlyMatchSubjects} 
                      onChange={(e) => setOnlyMatchSubjects(e.target.checked)} 
                      style={{ accentColor: 'var(--accent-color)' }}
                    />
                    <strong>Importar apenas eventos que correspondam às minhas matérias</strong>
                  </label>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginLeft: '24px', lineHeight: '1.4' }}>
                    Se marcado (recomendado), importará apenas os eventos do Google Calendar cujos títulos correspondam ao nome de alguma das suas matérias ativas. Se desmarcado, importará todos os eventos.
                  </p>
                </div>
              </div>
            </div>

            {/* Sync Progress Bar */}
            {isSyncing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '10px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span>{syncStatusMsg}</span>
                  <span>{syncProgress}%</span>
                </div>
                <div style={{ height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
                  <div style={{ height: '100%', width: `${syncProgress}%`, background: 'var(--accent-color)', transition: 'width 0.4s' }} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={handleGoogleSync} 
                disabled={isSyncing}
                className="neumorphic-btn accent-btn" 
                style={{ padding: '14px', borderRadius: '12px', fontSize: '0.88rem' }}
              >
                {isSyncing ? 'Sincronizando...' : state.googleSyncActive ? 'Sincronizar Agora' : 'Conectar e Importar Google Calendar'}
              </button>

              {state.googleSyncActive && (
                <button 
                  onClick={() => setShowDisconnectModal(true)} 
                  disabled={isSyncing}
                  className="neumorphic-btn" 
                  style={{ padding: '12px', borderRadius: '12px', fontSize: '0.82rem', color: '#c75e43', border: '1px solid rgba(199, 94, 67, 0.2)' }}
                >
                  Parar Sincronização
                </button>
              )}
            </div>

            {syncStatusMsg && !isSyncing && (
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: '600', textAlign: 'center' }}>
                {syncStatusMsg}
              </div>
            )}

            {lastSyncTime && (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                Última sincronização feita hoje às {lastSyncTime}.
              </div>
            )}
          </div>

          {/* Active Tasks Editor Table */}
          <div className="neumorphic-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Gerenciamento de Compromissos</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Edite os títulos, prazos e prioridades das atividades agendadas.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(state.tasks || []).length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                  Nenhum compromisso cadastrado para edição.
                </div>
              ) : (
                (state.tasks || []).map(task => {
                  const sub = state.subjects.find(s => s.id === task.subjectId);
                  return (
                    <div 
                      key={task.id} 
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'var(--panel-bg)',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: sub ? sub.color : '#a3a3a3', flexShrink: 0 }} />
                        <div style={{ minWidth: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{task.title}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>({task.date})</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleEditTaskClick(task)}
                        className="neumorphic-btn" 
                        style={{ padding: '6px 12px', fontSize: '0.72rem', borderRadius: '8px' }}
                      >
                        Editar
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

      {/* 6. MODAL TASK EDIT DRAWER */}
      {editingTask && (
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
          zIndex: 110
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
            <form onSubmit={handleSaveEditedTask} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(0,0,0,0.03)', paddingBottom: '14px' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Editar Compromisso</h3>
              </div>

              {/* Title input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Título</label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="input-field"
                  required
                  style={{ background: 'var(--bg-primary)' }}
                />
              </div>

              {/* Subject dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Matéria Relacionada</label>
                <div style={{ position: 'relative' }}>
                  <button 
                    type="button"
                    onClick={() => setShowEditSubDropdown(!showEditSubDropdown)}
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
                    <span>{state.subjects.find(s => s.id === editingTask.subjectId)?.name || 'Independente (Nenhuma matéria)'}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: showEditSubDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {showEditSubDropdown && (
                    <>
                      <div 
                        onClick={() => setShowEditSubDropdown(false)}
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
                            setEditingTask({ ...editingTask, subjectId: '' });
                            setShowEditSubDropdown(false);
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
                        {state.subjects.filter(s => !s.concluded || s.id === editingTask.subjectId).map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setEditingTask({ ...editingTask, subjectId: s.id });
                              setShowEditSubDropdown(false);
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
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Tipo de Atividade</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['prova', 'trabalho', 'leitura', 'outros'].map(type => {
                    const isSelected = editingTask.type === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setEditingTask({ ...editingTask, type: type })}
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
                    value={editingTask.date}
                    onChange={(e) => setEditingTask({ ...editingTask, date: e.target.value })}
                    className="input-field"
                    required
                    style={{ background: 'var(--bg-primary)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Horário</label>
                  <input
                    type="time"
                    value={editingTask.time}
                    onChange={(e) => setEditingTask({ ...editingTask, time: e.target.value })}
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
                  id="editTaskRecurringWeekly"
                  checked={editingTask.recurringWeekly || false}
                  onChange={(e) => setEditingTask({ ...editingTask, recurringWeekly: e.target.checked })}
                  style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--accent-color)' }}
                />
                <label htmlFor="editTaskRecurringWeekly" style={{ fontSize: '0.78rem', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '500' }}>
                  Repetir semanalmente (Compromisso recorrente)
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  className="neumorphic-btn" 
                  onClick={() => setEditingTask(null)}
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="neumorphic-btn accent-btn"
                  style={{ flex: 1 }}
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDisconnectModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(43,53,49,0.3)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 150,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div 
            className="neumorphic-card" 
            style={{ 
              width: '100%', 
              maxWidth: '400px', 
              padding: '30px', 
              background: 'var(--panel-bg)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>
              Desconectar Calendário
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Você deseja manter ou remover do Santuário os eventos importados do Google Calendar?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => {
                  disconnectGoogleSync(true);
                  setShowDisconnectModal(false);
                }}
                className="neumorphic-btn"
                style={{ padding: '12px', borderRadius: '12px', fontSize: '0.85rem', color: '#c75e43', fontWeight: '600' }}
              >
                Remover todos os eventos importados
              </button>
              <button
                onClick={() => {
                  disconnectGoogleSync(false);
                  setShowDisconnectModal(false);
                }}
                className="neumorphic-btn accent-btn"
                style={{ padding: '12px', borderRadius: '12px', fontSize: '0.85rem' }}
              >
                Manter eventos no aplicativo
              </button>
              <button
                onClick={() => setShowDisconnectModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer', marginTop: '6px' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AgendaView;
export { IconCalendar };
export { IconList };
export { IconTrash };
export { IconSettings };
export { IconEdit };
