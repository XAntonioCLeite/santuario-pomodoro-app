// Autor: Antônio Costa Leite
// Componente de Grade Semanal de Estudos e Tarefas (O Santuário)

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import SubjectCreator from './SubjectCreator';

export default function WeeklyGrid({ onOpenTaskCreator, onOpenSubjectCreator }) {
  const { state, updateSubject, updateTask, addTask, getLocalDateString } = useApp();

  const gridContainerRef = useRef(null);
  const dayNames = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
  const shortDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  // Week days calculation
  const [weekDays, setWeekDays] = useState([]);
  const [currentDayName, setCurrentDayName] = useState('');
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [currentMinute, setCurrentMinute] = useState(new Date().getMinutes());

  // Focus Mode and Mobile selection states
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [activeMobileDay, setActiveMobileDay] = useState(dayNames[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);

  // Drag and Resize states
  const [dragState, setDragState] = useState(null); // { blockId, type, mode, startY, startX, startTop, startHeight, startDay, originalIndex, subjectId, taskId }
  const [dragPreview, setDragPreview] = useState(null); // { blockId, mode, top, height, day, hasCollision }
  const draggedRef = useRef(false);
  const justDraggedRef = useRef(false);

  // Block management actions
  const [selectedBlockActions, setSelectedBlockActions] = useState(null); // block object
  const [editingTaskData, setEditingTaskData] = useState(null); // task object
  const [editingSubject, setEditingSubject] = useState(null); // subject object

  // Quick Action modal states (empty cell click)
  const [quickCreateData, setQuickCreateData] = useState(null); // { day, time, dateStr }
  const [quickCreateSubjectId, setQuickCreateSubjectId] = useState('');
  const [quickCreateType, setQuickCreateType] = useState('task'); // 'task' | 'class'
  const [quickCreateTitle, setQuickCreateTitle] = useState('');
  const [quickCreateRecurring, setQuickCreateRecurring] = useState(false);

  // Atualiza o horário atual a cada minuto
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentHour(now.getHours());
      setCurrentMinute(now.getMinutes());
      const dayIdx = now.getDay();
      const name = dayNames[dayIdx === 0 ? 6 : dayIdx - 1];
      setCurrentDayName(name);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calcula as datas da semana atual ao carregar
  useEffect(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      dates.push({
        dayName: dayNames[i],
        dateStr: `${yyyy}-${mm}-${dd}`,
        label: `${dd}/${mm}`,
        rawDate: d
      });
    }
    setWeekDays(dates);
  }, []);

  // 1. Gather all weekly blocks relative to absolute minutes since 00:00
  const getRawGridBlocks = () => {
    const blocks = [];

    // 1.1 Gather active subject classes (aulas)
    state.subjects.filter(s => !s.concluded).forEach(sub => {
      if (sub.classTimes && Array.isArray(sub.classTimes)) {
        sub.classTimes.forEach((ct, idx) => {
          const [h, m] = ct.time.split(':').map(Number);
          const startMin = h * 60 + m;
          const durationMin = (ct.duration || 2) * 60;
          blocks.push({
            id: `class_${sub.id}_${idx}`,
            type: 'class',
            subjectId: sub.id,
            name: sub.name,
            color: sub.color,
            day: ct.day,
            time: ct.time,
            duration: ct.duration || 2,
            location: ct.location || '',
            startMin,
            endMin: startMin + durationMin,
            originalIndex: idx,
            highlights: []
          });
        });
      }
    });

    // 1.2 Gather uncompleted calendar tasks (compromissos) for the current week
    const currentWeekDates = weekDays.map(wd => wd.dateStr);
    const pendingTasks = (state.tasks || []).filter(t => !t.completed);

    pendingTasks.forEach(task => {
      let weekIndex = -1;
      let isMatch = false;

      if (task.recurringWeekly) {
        // Calcula o índice do dia da semana
        const [y, m, d] = task.date.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        const dayIdx = dateObj.getDay();
        weekIndex = dayIdx === 0 ? 6 : dayIdx - 1;
        isMatch = true;
      } else {
        weekIndex = currentWeekDates.indexOf(task.date);
        isMatch = (weekIndex !== -1);
      }

      if (isMatch && weekIndex >= 0 && weekIndex < 7) {
        const taskDay = dayNames[weekIndex];
        const [h, m] = task.time.split(':').map(Number);
        const startMin = h * 60 + m;
        const durationMin = 60; // 1 hour default

        // Context Fusion: If it has subjectId, does that subject have a class on this day?
        let fused = false;
        if (task.subjectId) {
          const matchingClass = blocks.find(b => b.type === 'class' && b.subjectId === task.subjectId && b.day === taskDay);
          if (matchingClass) {
            matchingClass.highlights.push({
              id: task.id,
              title: task.title,
              time: task.time,
              type: task.type
            });
            fused = true;
          }
        }

        if (!fused) {
          blocks.push({
            id: `task_${task.id}`,
            type: 'task',
            taskId: task.id,
            name: task.title,
            color: '#8c8c8c', // clean gray accent
            day: taskDay,
            time: task.time,
            duration: 1,
            location: task.time,
            startMin,
            endMin: startMin + durationMin,
            highlights: []
          });
        }
      }
    });

    return blocks;
  };

  const rawBlocks = getRawGridBlocks();

  // 2. Compute dynamic hour bounds based on active blocks, ending always at 00:00 (24)
  const getHourRange = (blocks) => {
    let minH = 24;
    if (blocks && blocks.length > 0) {
      blocks.forEach(b => {
        const startH = Math.floor(b.startMin / 60);
        if (startH < minH) minH = startH;
      });
    } else {
      minH = 8;
    }

    // Always include current hour in start bounds if it's today
    const currentHourReal = new Date().getHours();
    if (currentHourReal < minH) minH = currentHourReal;

    const start = Math.max(0, minH - 1);
    const end = 24; // Always show up to 00:00 (midnight)

    return { start, end };
  };

  const hourRange = getHourRange(rawBlocks);
  const totalHours = hourRange.end - hourRange.start;
  const gridHeight = totalHours * 60; // Dynamic height of overlay contents

  // 3. Map raw blocks to relative grid offsets (relative to startHour)
  const allBlocks = rawBlocks.map(b => ({
    ...b,
    startMin: b.startMin - (hourRange.start * 60),
    endMin: b.endMin - (hourRange.start * 60)
  }));

  // Convert minutes relative to startHour into absolute time string
  const relativeMinutesToTime = (relativeMins) => {
    const absoluteMins = relativeMins + (hourRange.start * 60);
    const absHours = Math.floor(absoluteMins / 60);
    const absMinsSnapped = Math.round((absoluteMins % 60) / 15) * 15;
    const adjustedHours = absMinsSnapped === 60 ? absHours + 1 : absHours;
    const adjustedMins = absMinsSnapped === 60 ? 0 : absMinsSnapped;
    return `${String(adjustedHours).padStart(2, '0')}:${String(adjustedMins).padStart(2, '0')}`;
  };

  // Scroll main viewport to align with current time in Focus Mode
  useEffect(() => {
    if (isFocusMode && gridContainerRef.current) {
      const nowHour = new Date().getHours();
      if (nowHour >= hourRange.start && nowHour <= hourRange.end) {
        const topPx = (nowHour - hourRange.start) * 60;
        const targetTop = gridContainerRef.current.getBoundingClientRect().top + window.scrollY + topPx - 100;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    }
  }, [isFocusMode, hourRange.start, hourRange.end]);

  // Position blocks side-by-side inside their columns if they overlap
  const getPositionedBlocksByDay = (dayName) => {
    const dayBlocks = allBlocks.filter(b => {
      if (dragPreview && dragPreview.blockId === b.id) {
        return dragPreview.day === dayName;
      }
      return b.day === dayName;
    }).map(b => {
      if (dragPreview && dragPreview.blockId === b.id) {
        if (dragPreview.mode === 'move') {
          const durMin = b.duration * 60;
          return {
            ...b,
            startMin: dragPreview.top,
            endMin: dragPreview.top + durMin,
            time: relativeMinutesToTime(dragPreview.top)
          };
        } else if (dragPreview.mode === 'resize') {
          return {
            ...b,
            endMin: b.startMin + dragPreview.height,
            duration: dragPreview.height / 60
          };
        }
      }
      return b;
    });

    // Verifica sobreposição de horários
    if (dragPreview && dragPreview.day === dayName) {
      const activeDragBlock = dayBlocks.find(b => b.id === dragPreview.blockId);
      if (activeDragBlock) {
        const hasCollision = dayBlocks.some(b => 
          b.id !== dragPreview.blockId && 
          activeDragBlock.startMin < b.endMin && 
          b.startMin < activeDragBlock.endMin
        );
        if (hasCollision && !dragPreview.hasCollision) {
          dragPreview.hasCollision = true;
        }
      }
    }

    // Sort by start offset
    const sorted = [...dayBlocks].sort((a, b) => a.startMin - b.startMin);

    const columns = [];
    sorted.forEach(block => {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const overlaps = columns[i].some(b => 
          block.startMin < b.endMin && b.startMin < block.endMin
        );
        if (!overlaps) {
          columns[i].push(block);
          block.colIndex = i;
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([block]);
        block.colIndex = columns.length - 1;
      }
    });

    const totalCols = columns.length;
    sorted.forEach(block => {
      block.colWidth = 100 / totalCols;
      block.colLeft = block.colIndex * (100 / totalCols);
    });

    return sorted;
  };

  // Drag and Resize event listeners
  const handleDragStart = (e, block, mode) => {
    e.stopPropagation();
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    const clientX = e.clientX || e.touches?.[0]?.clientX;

    draggedRef.current = false;

    setDragState({
      blockId: block.id,
      type: block.type,
      mode: mode,
      startY: clientY,
      startX: clientX,
      startTop: block.startMin,
      startHeight: (block.endMin - block.startMin),
      startDay: block.day,
      subjectId: block.subjectId,
      originalIndex: block.originalIndex,
      taskId: block.taskId
    });

    if (e.cancelable) e.preventDefault();
  };

  useEffect(() => {
    const handleGlobalMove = (e) => {
      if (!dragState) return;
      draggedRef.current = true;

      const clientY = e.clientY || e.touches?.[0]?.clientY;
      const clientX = e.clientX || e.touches?.[0]?.clientX;

      const deltaY = clientY - dragState.startY;

      if (dragState.mode === 'resize') {
        const rawHeight = dragState.startHeight + deltaY;
        const snappedHeight = Math.max(30, Math.round(rawHeight / 15) * 15); // Min 30m
        setDragPreview({
          blockId: dragState.blockId,
          mode: 'resize',
          height: snappedHeight,
          day: dragState.startDay
        });
      } else if (dragState.mode === 'move') {
        const rawTop = dragState.startTop + deltaY;
        const snappedTop = Math.max(0, Math.min(gridHeight - dragState.startHeight, Math.round(rawTop / 15) * 15));

        const hoveredElement = document.elementFromPoint(clientX, clientY);
        const colEl = hoveredElement?.closest('.grid-day-column');
        const hoveredDay = colEl?.getAttribute('data-day-name');

        setDragPreview({
          blockId: dragState.blockId,
          mode: 'move',
          top: snappedTop,
          day: hoveredDay || dragState.startDay
        });
      }
    };

    const handleGlobalEnd = () => {
      if (!dragState) return;

      const finalPreview = dragPreview;
      
      if (draggedRef.current) {
        justDraggedRef.current = true;
        setTimeout(() => {
          justDraggedRef.current = false;
        }, 150);
      }

      setDragState(null);
      setDragPreview(null);

      if (!finalPreview) return;

      if (finalPreview.mode === 'resize') {
        const finalDuration = finalPreview.height / 60;
        if (dragState.type === 'class') {
          const subject = state.subjects.find(s => s.id === dragState.subjectId);
          if (subject && subject.classTimes) {
            const updatedTimes = [...subject.classTimes];
            updatedTimes[dragState.originalIndex] = {
              ...updatedTimes[dragState.originalIndex],
              duration: finalDuration
            };
            updateSubject(dragState.subjectId, { classTimes: updatedTimes });
          }
        }
      } else if (finalPreview.mode === 'move') {
        const finalTop = finalPreview.top;
        const finalDay = finalPreview.day;
        const newTimeStr = relativeMinutesToTime(finalTop);

        if (dragState.type === 'class') {
          const subject = state.subjects.find(s => s.id === dragState.subjectId);
          if (subject && subject.classTimes) {
            const updatedTimes = [...subject.classTimes];
            updatedTimes[dragState.originalIndex] = {
              ...updatedTimes[dragState.originalIndex],
              day: finalDay,
              time: newTimeStr
            };
            updateSubject(dragState.subjectId, { classTimes: updatedTimes });
          }
        } else if (dragState.type === 'task') {
          const weekDayObj = weekDays.find(wd => wd.dayName === finalDay);
          if (weekDayObj) {
            updateTask(dragState.taskId, {
              date: weekDayObj.dateStr,
              time: newTimeStr
            });
          }
        }
      }
    };

    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('mouseup', handleGlobalEnd);
    window.addEventListener('touchmove', handleGlobalMove, { passive: false });
    window.addEventListener('touchend', handleGlobalEnd);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalEnd);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [dragState, dragPreview, weekDays, gridHeight]);

  // Click on empty space inside a column to open Quick Creator
  const handleEmptyCellClick = (e, dayName) => {
    if (dragState || dragPreview) return;
    if (justDraggedRef.current) {
      justDraggedRef.current = false;
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top; // Click Y relative to overlay top

    const rawMins = clickY;
    const snappedMins = Math.round(rawMins / 30) * 30; // snap to 30 min cell
    const timeStr = relativeMinutesToTime(snappedMins);

    const targetWeekDay = weekDays.find(wd => wd.dayName === dayName);
    const dateStr = targetWeekDay ? targetWeekDay.dateStr : getLocalDateString();

    setQuickCreateData({
      day: dayName,
      time: timeStr,
      dateStr: dateStr
    });
    setQuickCreateTitle('');
    setQuickCreateSubjectId(state.subjects[0]?.id || '');
    setQuickCreateType('task');
    setQuickCreateRecurring(false);
  };

  const handleQuickCreateSubmit = (e) => {
    e.preventDefault();
    if (!quickCreateTitle.trim() || !quickCreateData) return;

    if (quickCreateType === 'task') {
      addTask(
        quickCreateTitle.trim(), 
        quickCreateSubjectId || '', 
        'outros', 
        quickCreateData.dateStr, 
        quickCreateData.time,
        quickCreateRecurring
      );
    } else if (quickCreateType === 'class') {
      if (quickCreateSubjectId) {
        const subject = state.subjects.find(s => s.id === quickCreateSubjectId);
        if (subject) {
          const updatedTimes = [...(subject.classTimes || [])];
          updatedTimes.push({
            day: quickCreateData.day,
            time: quickCreateData.time,
            duration: 2, // 2 horas por padrão
            location: ''
          });
          updateSubject(quickCreateSubjectId, { classTimes: updatedTimes });
        }
      }
    }

    setQuickCreateData(null);
  };

  // Block Click opens Action Dialog
  const handleBlockClick = (e, block) => {
    e.stopPropagation();
    if (dragState || dragPreview) return;
    if (justDraggedRef.current) {
      justDraggedRef.current = false;
      return;
    }
    setSelectedBlockActions(block);
  };

  // Submit edit task data (supports scope settings)
  const handleEditTaskSubmit = (e) => {
    e.preventDefault();
    if (!editingTaskData) return;

    updateTask(editingTaskData.id, {
      title: editingTaskData.title,
      subjectId: editingTaskData.subjectId,
      date: editingTaskData.date,
      time: editingTaskData.time,
      recurringWeekly: editingTaskData.recurringWeekly
    });

    setEditingTaskData(null);
  };

  // Verifica exibição do indicador de horário atual
  const renderCurrentTimeLine = (dayName) => {
    if (currentDayName !== dayName) return null;
    if (currentHour < hourRange.start || currentHour >= hourRange.end) return null;

    const offsetMins = (currentHour * 60 + currentMinute) - (hourRange.start * 60);
    const topPx = offsetMins;

    return (
      <div 
        style={{
          position: 'absolute',
          top: `${topPx}px`,
          left: 0,
          right: 0,
          height: '2px',
          background: '#ff5c5c',
          zIndex: 8,
          pointerEvents: 'none',
          boxShadow: '0 0 6px rgba(255, 92, 92, 0.6)'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            left: '-4px',
            top: '-4px',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#ff5c5c',
            border: '2px solid #fff',
            boxShadow: '0 0 8px rgba(255, 92, 92, 0.8)',
            animation: 'pulse 1.5s infinite'
          }}
        />
      </div>
    );
  };

  // Compile hour labels dynamically
  const hourLabels = [];
  for (let h = hourRange.start; h < hourRange.end; h++) {
    hourLabels.push(`${String(h).padStart(2, '0')}:00`);
  }

  const visibleDays = isFocusMode 
    ? [currentDayName || "Segunda-feira"] 
    : dayNames;

  // Grid line borders (highly apparent)
  const gridBorderColor = 'rgba(120, 130, 125, 0.32)';
  const gridBorderColorDashed = 'rgba(120, 130, 125, 0.15)';

  // Find parent subject of currently selected action block, if applicable
  const selectedParentSubject = selectedBlockActions && selectedBlockActions.subjectId
    ? state.subjects.find(s => s.id === selectedBlockActions.subjectId)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      
      {/* 1. TOP BAR CONTROL ACTIONS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Grade Semanal</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Central de controle. Arraste para mover, puxe a borda inferior para redimensionar.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`neumorphic-btn ${isFocusMode ? 'active' : ''}`}
            style={{ padding: '6px 14px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
            <span>{isFocusMode ? 'Ver Semana' : 'Foco Hoje'}</span>
          </button>
        </div>
      </div>

      {/* MOBILE DAY SELECTOR TABS */}
      <div className="mobile-day-tabs" style={{
        display: 'none',
        background: 'var(--panel-bg)',
        boxShadow: 'var(--shadow-inset)',
        padding: '4px',
        borderRadius: '12px',
        gap: '2px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}>
        {dayNames.map((dName, idx) => {
          const isAct = isFocusMode ? (currentDayName === dName || (currentDayName === '' && dName === 'Segunda-feira')) : activeMobileDay === dName;
          return (
            <button
              key={dName}
              disabled={isFocusMode}
              onClick={() => setActiveMobileDay(dName)}
              className={`neumorphic-btn ${isAct ? 'active' : ''}`}
              style={{
                flex: 1,
                padding: '8px 10px',
                fontSize: '0.72rem',
                border: 'none',
                borderRadius: '8px',
                whiteSpace: 'nowrap',
                opacity: isFocusMode && !isAct ? 0.4 : 1
              }}
            >
              {shortDays[idx]}
            </button>
          );
        })}
      </div>

      {/* 2. CALENDAR CONTAINER */}
      <div 
        className="neumorphic-card" 
        style={{ 
          padding: '20px 10px', 
          display: 'flex', 
          flexDirection: 'column', 
          background: 'var(--panel-bg)',
          borderRadius: '24px'
        }}
      >
        <div 
          ref={gridContainerRef}
          style={{
            display: 'flex',
            position: 'relative',
            background: 'var(--bg-primary)',
            borderRadius: '16px',
            border: `1px solid ${gridBorderColor}`,
            boxShadow: 'var(--shadow-inset)',
            overflowX: 'auto', // Horizontal scroll only for mobile
            width: '100%'
          }}
        >
          {/* Hour labels (Y-Axis) */}
          <div style={{
            width: '48px',
            flexShrink: 0,
            borderRight: `1px solid ${gridBorderColor}`,
            background: 'var(--panel-bg)',
            position: 'sticky',
            left: 0,
            zIndex: 9,
            height: `${gridHeight + 30}px`,
            boxSizing: 'border-box'
          }}>
            {hourLabels.map((hl, idx) => (
              <div 
                key={idx} 
                style={{
                  position: 'absolute',
                  top: `${30 + idx * 60}px`, // Centered on grid line
                  right: '8px',
                  fontSize: '0.68rem',
                  fontWeight: '700',
                  color: 'var(--text-secondary)',
                  transform: 'translateY(-50%)', // Center alignment on the line
                  lineHeight: '1',
                  fontFamily: 'var(--font-title)'
                }}
              >
                {hl}
              </div>
            ))}
          </div>

          {/* Grid columns */}
          <div style={{
            display: 'flex',
            flex: 1,
            position: 'relative',
            minWidth: isFocusMode ? '100%' : '750px',
            height: `${gridHeight + 30}px`,
            boxSizing: 'border-box'
          }}
          className="grid-layout-columns"
          >
            {/* Day columns */}
            {dayNames.map((dName, dIdx) => {
              const isMobileDayActive = isFocusMode ? (currentDayName === dName || (currentDayName === '' && dName === 'Segunda-feira')) : activeMobileDay === dName;
              const isColVisible = isFocusMode ? (visibleDays.includes(dName)) : true;

              const dateLabel = weekDays[dIdx]?.label || '';
              const blocks = getPositionedBlocksByDay(dName);

              const columnClass = `grid-day-column ${isMobileDayActive ? 'active-mobile-col' : 'inactive-mobile-col'}`;

              if (!isColVisible) return null;

              return (
                <div 
                  key={dName}
                  data-day-name={dName}
                  className={columnClass}
                  style={{
                    flex: 1,
                    borderRight: `1px solid ${gridBorderColor}`,
                    height: `${gridHeight + 30}px`,
                    boxSizing: 'border-box',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {/* Sticky header labels */}
                  <div style={{
                    height: '30px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 7,
                    background: 'var(--panel-bg)',
                    borderBottom: `1px solid ${gridBorderColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-title)',
                    fontWeight: '700',
                    fontSize: '0.72rem',
                    color: currentDayName === dName ? 'var(--accent-color)' : 'var(--text-primary)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    boxSizing: 'border-box'
                  }}>
                    <span>{shortDays[dIdx]} {dateLabel}</span>
                  </div>

                  {/* Hour blocks overlay */}
                  <div 
                    onClick={(e) => handleEmptyCellClick(e, dName)}
                    style={{ 
                      position: 'relative', 
                      height: `${gridHeight}px`, 
                      cursor: 'pointer', 
                      boxSizing: 'border-box',
                      borderTop: `1px solid ${gridBorderColor}` // Top grid line for starting hour
                    }}
                  >
                    {/* Matrix cells for this day column */}
                    {Array.from({ length: totalHours }).map((_, i) => (
                      <div 
                        key={i} 
                        style={{ 
                          height: '60px', 
                          borderBottom: `1px solid ${gridBorderColor}`, // Apparent solid bottom lines
                          position: 'relative',
                          pointerEvents: 'none',
                          boxSizing: 'border-box'
                        }}
                      >
                        <div 
                          style={{ 
                            position: 'absolute', 
                            top: '30px', 
                            left: 0, 
                            right: 0, 
                            borderBottom: `1px dashed ${gridBorderColorDashed}`, // Apparent dashed 30-min lines
                            pointerEvents: 'none'
                          }} 
                        />
                      </div>
                    ))}

                    {renderCurrentTimeLine(dName)}

                    {/* Glow preview block */}
                    {dragPreview && dragPreview.mode === 'move' && dragPreview.day === dName && (
                      <div 
                        style={{
                          position: 'absolute',
                          top: `${dragPreview.top}px`,
                          left: '1px',
                          right: '1px',
                          height: `${dragState.startHeight}px`,
                          background: 'rgba(var(--accent-rgb), 0.1)',
                          border: `2.2px dashed ${dragPreview.hasCollision ? '#ff5c5c' : 'var(--accent-color)'}`,
                          borderRadius: '4px',
                          zIndex: 6,
                          pointerEvents: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    )}

                    {/* Actual placed blocks (Ellipsis name and room visible layouts) */}
                    {blocks.map(block => {
                      const isDragging = dragPreview?.blockId === block.id;
                      const hasFusions = block.highlights && block.highlights.length > 0;
                      const dragStyleMod = isDragging ? { opacity: 0.5, zIndex: 10 } : {};

                      // Soft pastel background based on color (hex transparency)
                      const blockColor = block.color || '#8c8c8c';
                      const pastelBg = block.type === 'class' ? (blockColor + '18') : 'rgba(var(--accent-rgb), 0.08)';
                      const borderAccent = blockColor;

                      return (
                        <div
                          key={block.id}
                          onMouseDown={(e) => handleDragStart(e, block, 'move')}
                          onTouchStart={(e) => handleDragStart(e, block, 'move')}
                          onClick={(e) => handleBlockClick(e, block)}
                          style={{
                            position: 'absolute',
                            top: `${block.startMin}px`,
                            height: `${block.endMin - block.startMin}px`,
                            left: `${block.colLeft}%`,
                            width: `calc(${block.colWidth}% - 2px)`, // perfect width fit
                            marginLeft: '1px', // perfect margin alignment
                            background: pastelBg,
                            borderLeft: `4.5px solid ${borderAccent}`, // Thick solid left border accent line
                            borderTop: `1px solid ${blockColor}22`,
                            borderRight: `1px solid ${blockColor}22`,
                            borderBottom: `1px solid ${blockColor}22`,
                            color: 'var(--text-primary)', // Legible text
                            borderRadius: '4px', // aligned corners
                            padding: '6px 8px',
                            fontSize: '0.72rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            zIndex: 5,
                            cursor: 'grab',
                            userSelect: 'none',
                            touchAction: 'none',
                            boxSizing: 'border-box',
                            ...dragStyleMod
                          }}
                          className="schedule-grid-block"
                        >
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '800', width: '100%', overflow: 'hidden' }}>
                              <span style={{ 
                                color: 'var(--text-primary)', 
                                fontSize: '0.76rem', 
                                whiteSpace: 'nowrap', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                marginRight: '6px',
                                flex: 1
                              }}>
                                {block.name}
                              </span>
                              <span style={{ fontSize: '0.62rem', color: borderAccent, fontWeight: '700', flexShrink: 0 }}>{block.time}</span>
                            </div>
                            {block.location && (
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                Local: {block.location}
                              </div>
                            )}

                            {/* Context Fusion highlights */}
                            {hasFusions && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '6px' }}>
                                {block.highlights.map(hl => (
                                  <div 
                                    key={hl.id} 
                                    style={{
                                      background: borderAccent + '15',
                                      color: 'var(--text-primary)',
                                      padding: '3px 6px',
                                      borderRadius: '4px',
                                      fontSize: '0.62rem',
                                      fontWeight: '600',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      borderLeft: `2.5px solid ${borderAccent}`,
                                      border: `1px solid ${borderAccent}20`
                                    }}
                                    title={hl.title}
                                  >
                                    {hl.title} ({hl.time})
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Resize handle */}
                          {block.type === 'class' && (
                            <div 
                              onMouseDown={(e) => handleDragStart(e, block, 'resize')}
                              onTouchStart={(e) => handleDragStart(e, block, 'resize')}
                              style={{
                                height: '8px',
                                cursor: 'ns-resize',
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0
                              }}
                              className="block-resize-handle"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. QUICK CREATION POPUP MODAL */}
      {quickCreateData && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(43,53,49,0.3)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 110
        }}>
          <div className="neumorphic-card" style={{ width: '100%', maxWidth: '400px', padding: '24px', background: 'var(--panel-bg)' }}>
            <form onSubmit={handleQuickCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>Agendamento Rápido</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {quickCreateData.day} às {quickCreateData.time}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setQuickCreateType('task')}
                  className={`neumorphic-btn ${quickCreateType === 'task' ? 'active' : ''}`}
                  style={{ flex: 1, padding: '6px', fontSize: '0.75rem', borderRadius: '8px' }}
                >
                  Compromisso
                </button>
                <button
                  type="button"
                  onClick={() => setQuickCreateType('class')}
                  className={`neumorphic-btn ${quickCreateType === 'class' ? 'active' : ''}`}
                  style={{ flex: 1, padding: '6px', fontSize: '0.75rem', borderRadius: '8px' }}
                >
                  Aula (Matéria)
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600' }}>TÍTULO</label>
                <input
                  type="text"
                  placeholder={quickCreateType === 'task' ? "Ex: Estudar Álgebra, Consulta" : "Nome da Aula / Descrição"}
                  value={quickCreateTitle}
                  onChange={(e) => setQuickCreateTitle(e.target.value)}
                  className="input-field"
                  required
                  autoFocus
                  style={{ background: 'var(--bg-primary)' }}
                />
              </div>

              {((quickCreateType === 'task' && state.subjects.length > 0) || quickCreateType === 'class') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    {quickCreateType === 'class' ? 'DISCIPLINA' : 'MATÉRIA RELACIONADA (OPCIONAL)'}
                  </label>
                  <select
                    value={quickCreateSubjectId}
                    onChange={(e) => setQuickCreateSubjectId(e.target.value)}
                    className="input-field"
                    style={{ background: 'var(--bg-primary)' }}
                    required={quickCreateType === 'class'}
                  >
                    {quickCreateType === 'task' && (
                      <option value="">Independente (Nenhuma matéria)</option>
                    )}
                    {state.subjects.filter(s => !s.concluded).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {quickCreateType === 'task' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <input
                    type="checkbox"
                    id="quickCreateRecurring"
                    checked={quickCreateRecurring}
                    onChange={(e) => setQuickCreateRecurring(e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--accent-color)' }}
                  />
                  <label htmlFor="quickCreateRecurring" style={{ fontSize: '0.78rem', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '500' }}>
                    Repetir semanalmente toda {quickCreateData.day}
                  </label>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="neumorphic-btn"
                  onClick={() => setQuickCreateData(null)}
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="neumorphic-btn active"
                  style={{ flex: 1, background: 'var(--accent-color)', color: '#fff', border: 'none', fontWeight: 'bold' }}
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. BLOCK MANAGEMENT OPTIONS MODAL */}
      {selectedBlockActions && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(43,53,49,0.3)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 110
        }}>
          <div className="neumorphic-card" style={{ width: '100%', maxWidth: '400px', padding: '24px', background: 'var(--panel-bg)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>Opções do Horário</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {selectedBlockActions.day} às {selectedBlockActions.time}
              </p>
            </div>

            {/* SUBJECT DETAILS CARD IN OPTIONS DIALOG */}
            {selectedParentSubject ? (
              <div style={{
                background: selectedBlockActions.color + '12',
                borderLeft: `4px solid ${selectedBlockActions.color}`,
                padding: '12px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                textAlign: 'left',
                border: `1px solid ${selectedBlockActions.color}22`
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.86rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{selectedParentSubject.icon || '📚'}</span>
                  <span>{selectedParentSubject.name}</span>
                </div>
                {selectedParentSubject.professor && (
                  <div style={{ color: 'var(--text-secondary)' }}>
                    <strong>Professor:</strong> {selectedParentSubject.professor}
                  </div>
                )}
                {selectedBlockActions.location && (
                  <div style={{ color: 'var(--text-secondary)' }}>
                    <strong>Local:</strong> {selectedBlockActions.location}
                  </div>
                )}
                {selectedParentSubject.priority && (
                  <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <strong>Prioridade:</strong>
                    <span style={{
                      fontSize: '0.62rem',
                      background: selectedParentSubject.priority === 'Alta' ? '#ffebeb' : selectedParentSubject.priority === 'Média' ? '#fff9eb' : '#ebefff',
                      color: selectedParentSubject.priority === 'Alta' ? '#ff5c5c' : selectedParentSubject.priority === 'Média' ? '#ffa114' : '#3c72e6',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>
                      {selectedParentSubject.priority}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              selectedBlockActions.type === 'task' && (
                <div style={{
                  background: 'rgba(var(--accent-rgb), 0.05)',
                  borderLeft: '4px solid #8c8c8c',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  textAlign: 'left',
                  border: '1px solid rgba(var(--accent-rgb), 0.08)'
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                    {selectedBlockActions.name}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    <strong>Tipo:</strong> Compromisso Independente
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    <strong>Local:</strong> {selectedBlockActions.location}
                  </div>
                </div>
              )
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                className="neumorphic-btn"
                style={{ width: '100%', textAlign: 'left', padding: '12px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => {
                  const day = selectedBlockActions.day;
                  const time = selectedBlockActions.time;
                  const targetWeekDay = weekDays.find(wd => wd.dayName === day);
                  const dateStr = targetWeekDay ? targetWeekDay.dateStr : getLocalDateString();
                  
                  setQuickCreateData({ day, time, dateStr });
                  setQuickCreateTitle('');
                  setQuickCreateSubjectId('');
                  setQuickCreateType('task');
                  setQuickCreateRecurring(false);
                  setSelectedBlockActions(null);
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                </span>
                <span>Adicionar outro compromisso neste horário</span>
              </button>

              {selectedBlockActions.subjectId && (
                <button
                  type="button"
                  className="neumorphic-btn"
                  style={{ width: '100%', textAlign: 'left', padding: '12px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onClick={() => {
                    const day = selectedBlockActions.day;
                    const time = selectedBlockActions.time;
                    const targetWeekDay = weekDays.find(wd => wd.dayName === day);
                    const dateStr = targetWeekDay ? targetWeekDay.dateStr : getLocalDateString();
                    
                    setQuickCreateData({ day, time, dateStr });
                    setQuickCreateTitle('');
                    setQuickCreateSubjectId(selectedBlockActions.subjectId);
                    setQuickCreateType('task');
                    setQuickCreateRecurring(false);
                    setSelectedBlockActions(null);
                  }}
                >
                  <span>🔗</span>
                  <span>Adicionar compromisso atrelado à matéria</span>
                </button>
              )}

              {selectedBlockActions.type === 'task' ? (
                <button
                  type="button"
                  className="neumorphic-btn active"
                  style={{ width: '100%', textAlign: 'left', padding: '12px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent-color)', color: '#fff', border: 'none' }}
                  onClick={() => {
                    const task = state.tasks.find(t => t.id === selectedBlockActions.taskId);
                    if (task) {
                      setEditingTaskData({
                        ...task,
                        day: selectedBlockActions.day
                      });
                    }
                    setSelectedBlockActions(null);
                  }}
                >
                  <span>✏️</span>
                  <span>Editar este compromisso</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="neumorphic-btn active"
                  style={{ width: '100%', textAlign: 'left', padding: '12px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent-color)', color: '#fff', border: 'none' }}
                  onClick={() => {
                    const subject = state.subjects.find(s => s.id === selectedBlockActions.subjectId);
                    if (subject) {
                      setEditingSubject(subject);
                    }
                    setSelectedBlockActions(null);
                  }}
                >
                  <span>✏️</span>
                  <span>Editar esta matéria</span>
                </button>
              )}
            </div>

            <button
              type="button"
              className="neumorphic-btn"
              onClick={() => setSelectedBlockActions(null)}
              style={{ marginTop: '6px' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* 5. EDIT TASK MODAL */}
      {editingTaskData && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(43,53,49,0.3)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 110
        }}>
          <div className="neumorphic-card" style={{ width: '100%', maxWidth: '400px', padding: '24px', background: 'var(--panel-bg)' }}>
            <form onSubmit={handleEditTaskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>Editar Compromisso</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600' }}>TÍTULO</label>
                <input
                  type="text"
                  value={editingTaskData.title}
                  onChange={(e) => setEditingTaskData({ ...editingTaskData, title: e.target.value })}
                  className="input-field"
                  required
                  style={{ background: 'var(--bg-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600' }}>MATÉRIA RELACIONADA (OPCIONAL)</label>
                <select
                  value={editingTaskData.subjectId || ''}
                  onChange={(e) => setEditingTaskData({ ...editingTaskData, subjectId: e.target.value })}
                  className="input-field"
                  style={{ background: 'var(--bg-primary)' }}
                >
                  <option value="">Independente (Nenhuma matéria)</option>
                  {state.subjects.filter(s => !s.concluded).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600' }}>DATA</label>
                  <input
                    type="date"
                    value={editingTaskData.date}
                    onChange={(e) => setEditingTaskData({ ...editingTaskData, date: e.target.value })}
                    className="input-field"
                    required
                    style={{ background: 'var(--bg-primary)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600' }}>HORÁRIO</label>
                  <input
                    type="time"
                    value={editingTaskData.time}
                    onChange={(e) => setEditingTaskData({ ...editingTaskData, time: e.target.value })}
                    className="input-field"
                    required
                    style={{ background: 'var(--bg-primary)' }}
                  />
                </div>
              </div>

              {/* Scope Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600' }}>ABRANGÊNCIA DA ALTERAÇÃO</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-primary)', padding: '10px', borderRadius: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                    <input
                      type="radio"
                      name="editScope"
                      checked={editingTaskData.recurringWeekly === true}
                      onChange={() => setEditingTaskData({ ...editingTaskData, recurringWeekly: true })}
                      style={{ accentColor: 'var(--accent-color)' }}
                    />
                    <span>Aplicar a todas as semanas (Recorrente)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                    <input
                      type="radio"
                      name="editScope"
                      checked={editingTaskData.recurringWeekly !== true}
                      onChange={() => setEditingTaskData({ ...editingTaskData, recurringWeekly: false })}
                      style={{ accentColor: 'var(--accent-color)' }}
                    />
                    <span>Aplicar apenas a esta semana (Único)</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="neumorphic-btn"
                  onClick={() => setEditingTaskData(null)}
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="neumorphic-btn active"
                  style={{ flex: 1, background: 'var(--accent-color)', color: '#fff', border: 'none', fontWeight: 'bold' }}
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. SUBJECT EDIT MODAL */}
      {editingSubject && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
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
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '30px', 
              background: 'var(--panel-bg)',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <SubjectCreator 
              editingSubject={editingSubject} 
              onClose={() => setEditingSubject(null)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
