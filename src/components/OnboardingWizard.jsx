// Autor: Antônio Costa Leite
// Assistente de Apresentação e Boas-Vindas (O Santuário)

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SubjectIcons } from './SubjectCreator';

// Outlined icons registry matching weights for task select
const IconBook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const PRESET_COLORS = ['#3d6642', '#a7541f', '#4a805a', '#32527b', '#84396b', '#b93b3b'];

const SUGGESTIONS = [
  "Cálculo I", "Cálculo II", "Estruturas de Dados", "Banco de Dados", 
  "Pesquisa Operacional", "Sistemas Operacionais", "Física Geral I", 
  "Álgebra Linear", "Filosofia", "Introdução à Computação", "Engenharia de Software",
  "Biologia Molecular", "História Contemporânea", "Direito Civil", "Economia"
];

export default function OnboardingWizard() {
  const { completeOnboarding, getLocalDateString } = useApp();
  const [step, setStep] = useState(1); // 1: Welcome & Settings, 2: Subjects, 3: First Task, 4: Finish

  // Onboarding settings
  const [theme, setTheme] = useState('light');
  const [mood, setMood] = useState('creative');
  
  // Onboarding subjects
  const [subjects, setSubjects] = useState([]);
  const [tempSubName, setTempSubName] = useState('');
  const [predictiveMatches, setPredictiveMatches] = useState([]);

  // Onboarding tasks
  const [tasks, setTasks] = useState([]);
  const [tempTaskTitle, setTempTaskTitle] = useState('');
  const [tempTaskSubId, setTempTaskSubId] = useState('');
  const [tempTaskType, setTempTaskType] = useState('prova');
  const [tempTaskDate, setTempTaskDate] = useState(getLocalDateString());

  const handleNameChange = (val) => {
    setTempSubName(val);
    if (!val.trim()) {
      setPredictiveMatches([]);
      return;
    }
    const filtered = SUGGESTIONS.filter(item => 
      item.toLowerCase().startsWith(val.toLowerCase())
    );
    setPredictiveMatches(filtered);
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!tempSubName.trim()) return;

    const newSub = {
      id: 'sub_' + Date.now() + Math.random().toString(36).substr(2, 4),
      name: tempSubName.trim(),
      color: PRESET_COLORS[subjects.length % PRESET_COLORS.length],
      icon: 'book',
      priority: 3,
      professor: '',
      focusMinutes: 0,
      concluded: false
    };

    setSubjects(prev => [...prev, newSub]);
    setTempSubName('');
    setPredictiveMatches([]);
  };

  const handleSelectSuggestion = (match) => {
    const newSub = {
      id: 'sub_' + Date.now() + Math.random().toString(36).substr(2, 4),
      name: match,
      color: PRESET_COLORS[subjects.length % PRESET_COLORS.length],
      icon: 'book',
      priority: 3,
      professor: '',
      focusMinutes: 0,
      concluded: false
    };
    setSubjects(prev => [...prev, newSub]);
    setTempSubName('');
    setPredictiveMatches([]);
  };

  const handleRemoveSubject = (id) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!tempTaskTitle.trim()) return;

    const subId = tempTaskSubId || '';
    const newTask = {
      id: 'task_' + Date.now(),
      title: tempTaskTitle.trim(),
      subjectId: subId,
      type: tempTaskType,
      date: tempTaskDate,
      time: '12:00',
      completed: false
    };

    setTasks(prev => [...prev, newTask]);
    setTempTaskTitle('');
  };

  const handleRemoveTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleFinish = () => {
    completeOnboarding(subjects, tasks, { activeTheme: theme, mood });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f7f5f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'var(--font-body)'
    }}>
      <div 
        className="neumorphic-card"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '40px',
          background: 'var(--panel-bg)',
          borderRadius: '30px',
          boxShadow: 'var(--shadow-neumorphic)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          animation: 'fadeIn 0.3s ease-out'
        }}
      >
        {/* STEP 1: WELCOME & THEME/MOOD */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>Configurar Espaço</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.4' }}>
                Bem-vindo ao Santuário. Vamos personalizar a sua interface e carregar as suas informações.
              </p>
            </div>

            {/* Theme Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Visual Inicial</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setTheme('light')}
                  className="neumorphic-btn"
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: theme === 'light' ? 'var(--panel-bg)' : 'transparent',
                    boxShadow: theme === 'light' ? 'var(--shadow-inset)' : 'none',
                    color: theme === 'light' ? 'var(--accent-color)' : 'var(--text-secondary)'
                  }}
                >
                  Modo Claro
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className="neumorphic-btn"
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: theme === 'dark' ? 'var(--panel-bg)' : 'transparent',
                    boxShadow: theme === 'dark' ? 'var(--shadow-inset)' : 'none',
                    color: theme === 'dark' ? 'var(--accent-color)' : 'var(--text-secondary)'
                  }}
                >
                  Modo Escuro
                </button>
              </div>
            </div>

            {/* Companion Mood */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Foco do Jardim (Mood)</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['creative', 'analytical', 'quiet'].map(m => {
                  const isSelected = mood === m;
                  return (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      className="neumorphic-btn"
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: 'none',
                        background: isSelected ? 'var(--panel-bg)' : 'transparent',
                        boxShadow: isSelected ? 'var(--shadow-inset)' : 'none',
                        color: isSelected ? 'var(--accent-color)' : 'var(--text-secondary)',
                        textTransform: 'capitalize',
                        fontSize: '0.8rem'
                      }}
                    >
                      {m === 'creative' ? 'Criativo' : m === 'analytical' ? 'Analítico' : 'Silencioso'}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="neumorphic-btn accent-btn"
              style={{ padding: '14px', borderRadius: '12px', marginTop: '10px' }}
            >
              Avançar
            </button>
          </div>
        )}

        {/* STEP 2: ADD SUBJECTS */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>Suas Matérias</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Quais disciplinas você está estudando neste semestre?
              </p>
            </div>

            <form onSubmit={handleAddSubject} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Ex: Cálculo I, Algoritmos"
                value={tempSubName}
                onChange={(e) => handleNameChange(e.target.value)}
                className="input-field"
                style={{ flex: 1, background: 'var(--bg-primary)' }}
              />
              <button type="submit" className="neumorphic-btn accent-btn" style={{ padding: '12px 18px', borderRadius: '12px' }}>
                Adicionar
              </button>
            </form>

            {/* Predictive Matches */}
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
                {predictiveMatches.slice(0, 3).map((match, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(match)}
                    className="neumorphic-btn"
                    style={{ textAlign: 'left', padding: '8px 12px', fontSize: '0.8rem', border: 'none', borderRadius: '8px', width: '100%', background: 'transparent', boxShadow: 'none' }}
                  >
                    {match}
                  </button>
                ))}
              </div>
            )}

            {/* Added subjects display */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>
                Matérias Cadastradas ({subjects.length})
              </span>
              {subjects.length === 0 ? (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '14px' }}>
                  Adicione pelo menos 1 matéria para continuar.
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '150px', overflowY: 'auto', padding: '4px' }}>
                  {subjects.map(s => (
                    <div
                      key={s.id}
                      style={{
                        background: 'var(--bg-primary)',
                        borderLeft: `4px solid ${s.color}`,
                        padding: '6px 12px',
                        borderRadius: '0 8px 8px 0',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span style={{ fontWeight: '600' }}>{s.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(s.id)}
                        style={{ background: 'none', border: 'none', color: '#c75e43', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button className="neumorphic-btn" onClick={() => setStep(1)} style={{ flex: 1 }}>
                Voltar
              </button>
              <button
                disabled={subjects.length === 0}
                className="neumorphic-btn accent-btn"
                onClick={() => setStep(3)}
                style={{ flex: 1 }}
              >
                Avançar
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ADD FIRST COMPROMISSO */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>Seus Compromissos</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Tem alguma prova ou entrega importante chegando?
              </p>
            </div>

            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <input
                  type="text"
                  placeholder="Ex: Prova de Limites, Relatório"
                  value={tempTaskTitle}
                  onChange={(e) => setTempTaskTitle(e.target.value)}
                  className="input-field"
                  style={{ background: 'var(--bg-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  value={tempTaskSubId}
                  onChange={(e) => setTempTaskSubId(e.target.value)}
                  className="input-field"
                  style={{ flex: 1, background: 'var(--bg-primary)' }}
                >
                  <option value="">Independente (Sem Matéria)</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>

                <select
                  value={tempTaskType}
                  onChange={(e) => setTempTaskType(e.target.value)}
                  className="input-field"
                  style={{ width: '100px', background: 'var(--bg-primary)' }}
                >
                  <option value="prova">Prova</option>
                  <option value="trabalho">Trabalho</option>
                  <option value="leitura">Leitura</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="date"
                  value={tempTaskDate}
                  onChange={(e) => setTempTaskDate(e.target.value)}
                  className="input-field"
                  style={{ flex: 1, background: 'var(--bg-primary)' }}
                />
                <button type="submit" className="neumorphic-btn accent-btn" style={{ padding: '12px 18px', borderRadius: '12px' }}>
                  Agendar
                </button>
              </div>
            </form>

            {/* List of draft tasks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>
                Agenda de Início ({tasks.length})
              </span>
              {tasks.length === 0 ? (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '14px' }}>
                  Opcional. Adicione se quiser planejar suas primeiras datas.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                  {tasks.map(t => {
                    const subName = subjects.find(s => s.id === t.subjectId)?.name || 'Independente';
                    return (
                      <div
                        key={t.id}
                        style={{
                          background: 'var(--bg-primary)',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.8rem'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '600' }}>{t.title}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {subName} • {t.date}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTask(t.id)}
                          style={{ background: 'none', border: 'none', color: '#c75e43', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          Remover
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button className="neumorphic-btn" onClick={() => setStep(2)} style={{ flex: 1 }}>
                Voltar
              </button>
              <button className="neumorphic-btn accent-btn" onClick={() => setStep(4)} style={{ flex: 1 }}>
                Avançar
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CONFIRMATION & SAVE */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>Tudo Pronto!</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.4' }}>
                Seu santuário de estudos está configurado com sucesso e limpo de dados fictícios.
              </p>
            </div>

            <div style={{
              background: 'var(--bg-primary)',
              padding: '20px',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '0.82rem',
              border: '1px solid var(--card-border)'
            }}>
              <div>
                <strong>Visual:</strong> {theme === 'light' ? 'Modo Claro' : 'Modo Escuro'}
              </div>
              <div>
                <strong>Foco do Jardim:</strong> {mood === 'creative' ? 'Criativo' : mood === 'analytical' ? 'Analítico' : 'Silencioso'}
              </div>
              <div>
                <strong>Matérias Adicionadas:</strong> {subjects.length}
              </div>
              <div>
                <strong>Tarefas Agendadas:</strong> {tasks.length}
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="neumorphic-btn accent-btn"
              style={{ padding: '16px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '700' }}
            >
              Entrar no meu Santuário
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
