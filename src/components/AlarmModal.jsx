// Autor: Antônio Costa Leite
// Modal de Alarme e Notificação de Foco (O Santuário)

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const IconClock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const DAYS = [
  { id: 1, label: 'Seg' },
  { id: 2, label: 'Ter' },
  { id: 3, label: 'Qua' },
  { id: 4, label: 'Qui' },
  { id: 5, label: 'Sex' },
  { id: 6, label: 'Sáb' },
  { id: 0, label: 'Dom' }
];

export default function AlarmModal({ onClose }) {
  const { state, addAlarm, updateAlarm, deleteAlarm, toggleAlarm } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [type, setType] = useState('daily'); // 'daily' | 'once' | 'weekly'
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5]);
  const [subjectId, setSubjectId] = useState('');

  const alarms = state.alarms || [];

  const resetForm = () => {
    setTitle('');
    setTime('08:00');
    setType('daily');
    setScheduledDate(new Date().toISOString().split('T')[0]);
    setSelectedDays([1, 2, 3, 4, 5]);
    setSubjectId('');
    setEditingId(null);
    setIsEditing(false);
  };

  const handleOpenNew = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleEdit = (alarm) => {
    setEditingId(alarm.id);
    setTitle(alarm.title || '');
    setTime(alarm.time || '08:00');
    setType(alarm.type || 'daily');
    setScheduledDate(alarm.scheduledDate || new Date().toISOString().split('T')[0]);
    setSelectedDays(alarm.daysOfWeek || [1, 2, 3, 4, 5]);
    setSubjectId(alarm.subjectId || '');
    setIsEditing(true);
  };

  const handleToggleDay = (dayId) => {
    if (selectedDays.includes(dayId)) {
      if (selectedDays.length === 1) return;
      setSelectedDays(selectedDays.filter(d => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!time) return;

    const alarmData = {
      title: title.trim() || 'Alarme de Estudo',
      time,
      type,
      scheduledDate: type === 'once' ? scheduledDate : null,
      daysOfWeek: type === 'weekly' ? selectedDays : (type === 'daily' ? [0,1,2,3,4,5,6] : []),
      subjectId: subjectId || null,
      enabled: true
    };

    if (editingId) {
      updateAlarm(editingId, alarmData);
    } else {
      addAlarm(alarmData);
    }

    resetForm();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 10000, padding: '16px'
    }}>
      <div className="neumorphic-card" style={{
        width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto',
        background: 'var(--panel-bg)', borderRadius: '24px', padding: '24px',
        border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-flat)',
        display: 'flex', flexDirection: 'column', gap: '20px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconBell />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              Alarmes de Foco
            </h3>
          </div>
          <button onClick={onClose} className="neumorphic-btn" style={{ padding: '6px', borderRadius: '8px', border: 'none' }} title="Fechar">
            <IconX />
          </button>
        </div>

        {/* View Mode: List of Alarms */}
        {!isEditing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                {alarms.length === 0 ? 'Nenhum alarme configurado' : `${alarms.length} alarme(s)`}
              </span>
              <button onClick={handleOpenNew} className="neumorphic-btn accent-btn" style={{ padding: '6px 12px', fontSize: '0.78rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconPlus /> Novo Alarme
              </button>
            </div>

            {alarms.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '30px 0' }}>
                Configure alarmes para lembrar de estudar ou fazer pausas programadas.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {alarms.map(alarm => {
                  const linkedSub = (state.subjects || []).find(s => s.id === alarm.subjectId);
                  return (
                    <div
                      key={alarm.id}
                      className="neumorphic-card"
                      style={{
                        padding: '14px 18px', borderRadius: '14px',
                        background: 'var(--bg-primary)', border: '1px solid var(--card-border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        opacity: alarm.enabled ? 1 : 0.6
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                            {alarm.time}
                          </span>
                          <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                            {alarm.title}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontWeight: '600', background: 'var(--panel-bg)', padding: '2px 6px', borderRadius: '4px' }}>
                            {alarm.type === 'daily' ? 'Diário' : alarm.type === 'once' ? `Programado (${alarm.scheduledDate})` : 'Dias Selecionados'}
                          </span>
                          {linkedSub && (
                            <span style={{ fontSize: '0.7rem', color: linkedSub.color, fontWeight: '600' }}>
                              • Matéria: {linkedSub.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          checked={alarm.enabled}
                          onChange={() => toggleAlarm(alarm.id)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <button onClick={() => handleEdit(alarm)} className="neumorphic-btn" style={{ padding: '6px', fontSize: '0.7rem', borderRadius: '6px' }}>
                          Editar
                        </button>
                        <button onClick={() => deleteAlarm(alarm.id)} className="neumorphic-btn" style={{ padding: '6px', fontSize: '0.7rem', borderRadius: '6px', color: '#d9534f' }}>
                          <IconTrash />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Edit / Create Form */}
        {isEditing && (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              {editingId ? 'Editar Alarme' : 'Novo Alarme'}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Título do Alarme</label>
              <input
                type="text"
                placeholder="Ex: Estudar Biologia ou Pausa para Água"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                style={{ background: 'var(--bg-primary)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Horário</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="input-field"
                  required
                  style={{ background: 'var(--bg-primary)' }}
                />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Frequência</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="input-field"
                  style={{ background: 'var(--bg-primary)' }}
                >
                  <option value="daily">Diário (Todos os dias)</option>
                  <option value="weekly">Dias da Semana (Recorrente)</option>
                  <option value="once">Programado (Data Específica)</option>
                </select>
              </div>
            </div>

            {type === 'once' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Data Programada</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="input-field"
                  style={{ background: 'var(--bg-primary)' }}
                />
              </div>
            )}

            {type === 'weekly' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Repetir nos Dias</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {DAYS.map(day => {
                    const isSelected = selectedDays.includes(day.id);
                    return (
                      <button
                        type="button"
                        key={day.id}
                        onClick={() => handleToggleDay(day.id)}
                        className={`neumorphic-btn ${isSelected ? 'active' : ''}`}
                        style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '8px' }}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Vincular Matéria (Opcional)</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="input-field"
                style={{ background: 'var(--bg-primary)' }}
              >
                <option value="">Nenhuma matéria vinculada</option>
                {(state.subjects || []).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button type="button" onClick={resetForm} className="neumorphic-btn" style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '10px' }}>
                Cancelar
              </button>
              <button type="submit" className="neumorphic-btn accent-btn" style={{ padding: '8px 18px', fontSize: '0.8rem', borderRadius: '10px' }}>
                Salvar Alarme
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
