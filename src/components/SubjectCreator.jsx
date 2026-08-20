// Autor: Antônio Costa Leite
// Componente Criador de Matérias e Disciplinas (O Santuário)

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

// Outlined icons registry matching weights (20 diverse options)
export const SubjectIcons = {
  book: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  code: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  database: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  ),
  percent: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  ),
  activity: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  compass: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  edit: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  cpu: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 9h6v6H9z" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
    </svg>
  ),
  globe: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  feather: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <line x1="16" y1="8" x2="2" y2="22" />
      <line x1="17.5" y1="15" x2="9" y2="15" />
    </svg>
  ),
  briefcase: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  music: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ),
  heart: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  image: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  anchor: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="5" x2="12" y2="22" />
      <path d="M12 22a7 7 0 0 0 7-7h-2a5 5 0 0 1-10 0H5a7 7 0 0 0 7 7z" />
      <circle cx="12" cy="5" r="3" />
    </svg>
  ),
  map: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  ),
  thermometer: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
  ),
  scale: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="5" y1="7" x2="19" y2="7" />
      <path d="M5 7L2 17c0 1.66 2.24 3 5 3s5-1.34 5-3L9 7" />
      <path d="M19 7l-3 10c0 1.66 2.24 3 5 3s5-1.34 5-3l-3-10" />
    </svg>
  ),
  umbrella: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M23 12a11.02 11.02 0 0 0-22 0zm-11 0v9a2 2 0 0 0 4 0" />
    </svg>
  ),
  scissors: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="9.8" y1="9.8" x2="20" y2="20" />
      <line x1="20" y1="4" x2="9.8" y2="14.2" />
    </svg>
  )
};

// Predictive suggestions pool
const SUGGESTIONS = [
  "Cálculo I", "Cálculo II", "Cálculo III", 
  "Inteligência Artificial", "Algoritmos e ED", 
  "Estruturas de Dados", "Banco de Dados", 
  "Pesquisa Operacional", "Sistemas Operacionais", 
  "Física Geral I", "Álgebra Linear", "Filosofia", 
  "Introdução à Computação", "Engenharia de Software",
  "Biologia Molecular", "História Contemporânea",
  "Cálculo Numérico", "Compiladores", "Redes de Computadores",
  "Direito Civil", "Contabilidade Geral", "Economia", "Teoria da Música",
  "Química Geral", "Geopolítica"
];

const DAYS_OF_WEEK = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo"
];

const PRESET_COLORS = [
  '#3d6642', // Biologia Green
  '#a7541f', // História Orange
  '#4a805a', // Math Green
  '#32527b', // Tech Blue
  '#84396b', // Philosophy Purple
  '#b93b3b'  // Urgencies Red
];

const SubjectCreator = ({ onClose, editingSubject = null }) => {
  const { addSubject, updateSubject, addBulkSubjects } = useApp();

  // Multi-step phase: 1: Name & Predictive Search / Bulk list, 2: Colors/Icons/Priority, 3: Optional Details & Class Times
  const [step, setStep] = useState(1);
  const [subjectName, setSubjectName] = useState(editingSubject ? editingSubject.name : '');
  
  // Predictive search state
  const [predictiveMatches, setPredictiveMatches] = useState([]);
  
  // Bulk state
  const [bulkList, setBulkList] = useState([]);
  const [isBulkMode, setIsBulkMode] = useState(false);

  // Step 2 variables
  const [selectedIcon, setSelectedIcon] = useState(editingSubject ? editingSubject.icon : 'book');
  const [selectedColor, setSelectedColor] = useState(editingSubject ? editingSubject.color : '#3d6642');
  const [priority, setPriority] = useState(editingSubject ? editingSubject.priority : 3); // 1-5 scale

  // Step 3 variables
  const [professor, setProfessor] = useState(editingSubject ? (editingSubject.professor || '') : '');
  const [classroom, setClassroom] = useState('');
  const [concluded, setConcluded] = useState(editingSubject ? (editingSubject.concluded || false) : false);
  const [finalGrade, setFinalGrade] = useState(editingSubject ? (editingSubject.finalGrade || '') : '');

  // Topics management state
  const [topics, setTopics] = useState(editingSubject ? (editingSubject.topics || []) : []);
  const [newTopicName, setNewTopicName] = useState('');

  const handleAddTopic = () => {
    if (!newTopicName.trim()) return;
    setTopics(prev => [...prev, {
      id: 'top_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      name: newTopicName.trim(),
      completed: false
    }]);
    setNewTopicName('');
  };

  const handleRemoveTopic = (topicId) => {
    setTopics(prev => prev.filter(t => t.id !== topicId));
  };

  // Class times variables
  const [classTimes, setClassTimes] = useState(editingSubject ? (editingSubject.classTimes || []) : []);
  const [newDay, setNewDay] = useState('Segunda-feira');
  const [newTime, setNewTime] = useState('08:00');
  const [newDuration, setNewDuration] = useState(2); // 2 horas por padrão
  const [newLoc, setNewLoc] = useState('');

  const handleAddClassTime = () => {
    if (!newTime) return;
    setClassTimes(prev => [...prev, { 
      day: newDay, 
      time: newTime, 
      duration: parseFloat(newDuration) || 2, 
      location: newLoc.trim() 
    }]);
    setNewLoc('');
    setNewDuration(2);
  };

  const handleRemoveClassTime = (index) => {
    setClassTimes(prev => prev.filter((_, i) => i !== index));
  };

  // Trata alterações no nome para sugestões
  const handleNameChange = (val) => {
    setSubjectName(val);
    if (!val.trim()) {
      setPredictiveMatches([]);
      return;
    }
    const filtered = SUGGESTIONS.filter(item => 
      item.toLowerCase().startsWith(val.toLowerCase())
    );
    setPredictiveMatches(filtered);
  };

  // Add item to bulk draft list on Enter
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!subjectName.trim()) return;
      
      setBulkList(prev => [...prev, subjectName.trim()]);
      setSubjectName('');
      setPredictiveMatches([]);
      setIsBulkMode(true);
    }
  };

  const handleSelectSuggestion = (match) => {
    setSubjectName(match);
    setPredictiveMatches([]);
  };

  const handleRemoveBulkItem = (index) => {
    setBulkList(prev => prev.filter((_, i) => i !== index));
    if (bulkList.length <= 1) {
      setIsBulkMode(false);
    }
  };

  const handleNextStep = () => {
    if (isBulkMode && bulkList.length > 0) {
      // Bulk add doesn't need steps 2/3 - saves immediately
      addBulkSubjects(bulkList);
      onClose();
      return;
    }
    if (!subjectName.trim()) return;
    setStep(2);
  };

  const handleSave = () => {
    if (editingSubject) {
      updateSubject(editingSubject.id, {
        name: subjectName.trim(),
        color: selectedColor,
        icon: selectedIcon,
        priority: priority,
        professor: professor.trim(),
        classTimes,
        topics,
        concluded,
        finalGrade: finalGrade.trim()
      });
    } else {
      addSubject(subjectName.trim(), selectedColor, selectedIcon, priority, professor.trim(), classTimes, topics, concluded, finalGrade.trim());
    }
    onClose();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(0,0,0,0.03)', paddingBottom: '14px' }}>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
          {editingSubject ? 'Editar Matéria' : 'Adicionar Matéria'}
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          {isBulkMode ? 'Modo de Adição em Lote' : `Passo ${step} de 3`}
        </p>

        {/* Step Navigation Tabs */}
        {!isBulkMode && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
            {[
              { num: 1, label: '1. Nome' },
              { num: 2, label: '2. Estilo' },
              { num: 3, label: '3. Horários & Info' }
            ].map(({ num, label }) => {
              const isActive = step === num;
              const isClickable = editingSubject || (num === 1) || (subjectName.trim().length > 0);
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    if (isClickable) setStep(num);
                  }}
                  style={{
                    background: isActive ? 'var(--accent-color)' : 'var(--bg-primary)',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '16px',
                    padding: '4px 10px',
                    fontSize: '0.7rem',
                    fontWeight: isActive ? '700' : '500',
                    cursor: isClickable ? 'pointer' : 'not-allowed',
                    opacity: isClickable ? 1 : 0.5,
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* STEP 1: NAME INPUT & SUGGESTIONS */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
              Nome da Matéria
            </label>
            <input
              type="text"
              placeholder="Digite o nome (Ex: Cálculo I) ou pressione Enter para lote"
              value={subjectName}
              onChange={(e) => handleNameChange(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className="input-field"
              autoFocus
              style={{ background: 'var(--bg-primary)' }}
            />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
              Escreva o nome e aperte Enter para listar várias de uma vez só.
            </span>
          </div>

          {/* Predictive Matches Dropdown */}
          {predictiveMatches.length > 0 && (
            <div style={{
              background: 'var(--panel-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: '12px',
              padding: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              boxShadow: 'var(--shadow-inset)'
            }}>
              {predictiveMatches.map((match, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(match)}
                  className="neumorphic-btn"
                  style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    border: 'none',
                    borderRadius: '8px',
                    width: '100%',
                    background: 'transparent',
                    boxShadow: 'none'
                  }}
                >
                  {match}
                </button>
              ))}
            </div>
          )}

          {/* Bulk Draft List display */}
          {bulkList.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
                Lote a ser Adicionado ({bulkList.length})
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {bulkList.map((item, idx) => (
                  <div 
                    key={idx} 
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1.5px solid var(--accent-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      padding: '4px 12px',
                      borderRadius: '10px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>{item}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveBulkItem(idx)}
                      style={{ background: 'none', border: 'none', color: '#c75e43', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button className="neumorphic-btn" onClick={onClose} style={{ flex: 1 }}>
              Cancelar
            </button>
            <button 
              className="neumorphic-btn accent-btn" 
              onClick={handleNextStep}
              disabled={!subjectName.trim() && bulkList.length === 0}
              style={{ flex: 1 }}
            >
              {isBulkMode ? 'Adicionar todas' : 'Avançar'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: COLORS, ICONS & PRIORITY */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Icons Library Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
              Escolha um Ícone
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(5, 1fr)', 
              gap: '10px', 
              background: 'var(--bg-primary)', 
              padding: '12px', 
              borderRadius: '16px',
              border: '1px solid var(--card-border)'
            }}>
              {Object.keys(SubjectIcons).map((iconKey) => {
                const isSelected = selectedIcon === iconKey;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setSelectedIcon(iconKey)}
                    className="neumorphic-btn"
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: 'none',
                      color: isSelected ? 'var(--accent-color)' : 'var(--text-secondary)',
                      background: isSelected ? 'var(--panel-bg)' : 'transparent',
                      boxShadow: isSelected ? 'var(--shadow-inset)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={iconKey}
                  >
                    {SubjectIcons[iconKey]({ size: 18 })}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
              Cor do Card
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: c,
                    border: selectedColor === c ? '2.5px solid var(--text-primary)' : '1.5px solid rgba(255,255,255,0.8)',
                    boxShadow: selectedColor === c ? '0 0 6px rgba(0,0,0,0.15)' : 'none',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                />
              ))}
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                style={{
                  width: '32px',
                  height: '32px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>

          {/* Priority grading */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
              <span>Nível de Prioridade</span>
              <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{priority} / 5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              Alterar a prioridade posiciona os cards no topo das suas listas.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button className="neumorphic-btn" onClick={() => setStep(1)}>
              Voltar
            </button>
            <button className="neumorphic-btn accent-btn" onClick={() => setStep(3)}>
              Avançar
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CONTEXTUAL INFO & CLASS TIMES */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Horários das Aulas (Grade Semanal) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Horários das Aulas (Grade Semanal)
              </label>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                {classTimes.length} {classTimes.length === 1 ? 'horário' : 'horários'}
              </span>
            </div>

            {/* Lista de Horários Adicionados */}
            {classTimes.length > 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                background: 'var(--bg-primary)',
                padding: '10px 12px',
                borderRadius: '12px',
                border: '1px solid var(--card-border)',
                maxHeight: '160px',
                overflowY: 'auto'
              }}>
                {classTimes.map((ct, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      background: 'var(--panel-bg)',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--card-border)',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ 
                          fontWeight: '700', 
                          fontSize: '0.78rem', 
                          color: 'var(--text-primary)' 
                        }}>
                          {ct.day}
                        </span>
                        <span style={{ 
                          fontSize: '0.72rem', 
                          color: 'var(--accent-color)', 
                          background: 'rgba(0,0,0,0.04)', 
                          padding: '1px 6px', 
                          borderRadius: '6px',
                          fontWeight: '600'
                        }}>
                          {ct.time} ({ct.duration || 2}h)
                        </span>
                      </div>
                      {ct.location && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          📍 {ct.location}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveClassTime(idx)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#c75e43', 
                        cursor: 'pointer', 
                        fontWeight: 'bold', 
                        fontSize: '1rem',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Remover horário"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '10px 12px',
                borderRadius: '10px',
                background: 'var(--bg-primary)',
                border: '1px dashed var(--card-border)',
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.4'
              }}>
                Adicione abaixo os dias e horários para que a matéria apareça na sua Grade Semanal.
              </div>
            )}

            {/* Formulário para Adicionar Novo Horário */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              background: 'var(--bg-primary)',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid var(--card-border)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    Dia da Semana
                  </label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    className="input-field"
                    style={{ padding: '6px 8px', fontSize: '0.78rem', background: 'var(--panel-bg)' }}
                  >
                    {DAYS_OF_WEEK.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    Horário de Início
                  </label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="input-field"
                    style={{ padding: '6px 8px', fontSize: '0.78rem', background: 'var(--panel-bg)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    Duração
                  </label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(parseFloat(e.target.value))}
                    className="input-field"
                    style={{ padding: '6px 8px', fontSize: '0.78rem', background: 'var(--panel-bg)' }}
                  >
                    <option value={0.5}>30 min (0.5h)</option>
                    <option value={1}>1 hora</option>
                    <option value={1.5}>1h 30min</option>
                    <option value={2}>2 horas (Padrão)</option>
                    <option value={2.5}>2h 30min</option>
                    <option value={3}>3 horas</option>
                    <option value={3.5}>3h 30min</option>
                    <option value={4}>4 horas</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    Sala / Local (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Sala 101"
                    value={newLoc}
                    onChange={(e) => setNewLoc(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddClassTime();
                      }
                    }}
                    className="input-field"
                    style={{ padding: '6px 8px', fontSize: '0.78rem', background: 'var(--panel-bg)' }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddClassTime}
                className="neumorphic-btn accent-btn"
                style={{ padding: '8px 12px', fontSize: '0.78rem', borderRadius: '8px', marginTop: '2px' }}
              >
                + Adicionar Horário à Grade
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
              Nome do Professor (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Prof. Valter"
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
              className="input-field"
              style={{ background: 'var(--bg-primary)' }}
            />
          </div>

          {/* Topics of Study Management */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
              Tópicos de Estudo da Matéria
            </label>

            {topics.length > 0 && (
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '6px',
                background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: '12px',
                border: '1px solid var(--card-border)', maxHeight: '140px', overflowY: 'auto'
              }}>
                {topics.map((t) => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--text-primary)', textDecoration: t.completed ? 'line-through' : 'none' }}>
                      • {t.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTopic(t.id)}
                      style={{ background: 'none', border: 'none', color: '#c75e43', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                placeholder="Ex: Integrais Duplas, Matrizes..."
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTopic();
                  }
                }}
                className="input-field"
                style={{ flex: 1, background: 'var(--bg-primary)' }}
              />
              <button
                type="button"
                onClick={handleAddTopic}
                className="neumorphic-btn accent-btn"
                style={{ padding: '6px 14px', fontSize: '0.78rem', borderRadius: '8px' }}
              >
                + Adicionar Tópico
              </button>
            </div>
          </div>

          {/* Concluded Status & Final Grade */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', background: 'var(--bg-primary)', padding: '14px', borderRadius: '14px', border: '1px solid var(--card-border)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, minWidth: '160px' }}>
              <input
                type="checkbox"
                checked={concluded}
                onChange={(e) => setConcluded(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Matéria Concluída
              </span>
            </label>

            <div style={{ flex: 1, minWidth: '140px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
                Nota Final de Conclusão
              </label>
              <input
                type="text"
                placeholder="Ex: 9.5 ou A"
                value={finalGrade}
                onChange={(e) => setFinalGrade(e.target.value)}
                className="input-field"
                style={{ background: 'var(--panel-bg)', padding: '6px 10px', fontSize: '0.8rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button className="neumorphic-btn" onClick={() => setStep(2)}>
              Voltar
            </button>
            <button className="neumorphic-btn accent-btn" onClick={handleSave}>
              {editingSubject ? 'Salvar Alterações' : 'Salvar Matéria'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectCreator;
