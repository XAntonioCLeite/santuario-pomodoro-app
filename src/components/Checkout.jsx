// Autor: Antônio Costa Leite
// Componente de Finalização de Sessão de Foco (O Santuário)

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { renderLargePlant, getPlantRank } from '../utils/plantRenderer';

// Minimal outline SVG icons
const IconFlame = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const IconDroplet = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z" />
  </svg>
);

const IconMic = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1v10M19 10v1a7 7 0 0 1-14 0v-1M12 19v4M8 23h8" />
    <rect x="9" y="5" width="6" height="10" rx="3" ry="3" />
  </svg>
);

const IconStop = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" />
  </svg>
);

const Checkout = ({ subjectId, minutesStudied, minutesBreak = 0, wiltCount = 0, seed = 0.5, onFinish }) => {
  const { state, addSummary, addVoiceNote, addFutureLetter } = useApp();
  
  // Checkout phases: 1: Capsule & Summary, 2: Guided Breathing & Pausa de Ouro, 3: Rewards Card
  const [step, setStep] = useState(1); 
  const [summaryText, setSummaryText] = useState('');
  
  // Future letter input during checkout
  const [futureNote, setFutureNote] = useState('');
  const [futureNoteQuantity, setFutureNoteQuantity] = useState(30);
  const [futureNoteUnit, setFutureNoteUnit] = useState('minutes');
  const [futureNoteUnlockType, setFutureNoteUnlockType] = useState('study');

  // Guided Breathing states
  const [breathingSeconds, setBreathingSeconds] = useState(30);
  const [breathPhase, setBreathPhase] = useState('Inspire suavemente...');

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const [voiceBlobUrl, setVoiceBlobUrl] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const recordIntervalRef = useRef(null);

  const subject = state.subjects.find(s => s.id === subjectId);
  const earnedOrvalho = Math.max(1, Math.round(minutesStudied * 0.16));

  // Breathing interval timer
  useEffect(() => {
    if (step === 2) {
      const interval = setInterval(() => {
        setBreathingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setStep(3);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Breathing animation states
  useEffect(() => {
    if (step === 2) {
      const pattern = setInterval(() => {
        const elapsed = 30 - breathingSeconds;
        const phaseMod = elapsed % 12;

        if (phaseMod < 4) {
          setBreathPhase('Inspire suavemente...');
        } else if (phaseMod < 8) {
          setBreathPhase('Segure o ar...');
        } else {
          setBreathPhase('Expire devagar...');
        }
      }, 1000);
      return () => clearInterval(pattern);
    }
  }, [step, breathingSeconds]);

  // Trata gravação de voz
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setVoiceBlobUrl(reader.result);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordTimer(0);

      recordIntervalRef.current = setInterval(() => {
        setRecordTimer(p => p + 1);
      }, 1000);

    } catch (e) {
      console.warn("Mecanismo de microfone bloqueado ou ausente:", e);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
    }
  };

  const handleFirstStepSubmit = (e) => {
    e.preventDefault();
    
    // Grava resumo escrito
    if (summaryText.trim()) {
      addSummary(subjectId, summaryText.trim());
    }

    // Grava notas em áudio
    if (voiceBlobUrl) {
      addVoiceNote(subjectId, voiceBlobUrl, recordTimer);
    }

    // Grava carta para o futuro
    if (futureNote.trim()) {
      addFutureLetter(futureNote.trim(), parseInt(futureNoteQuantity), futureNoteUnit, futureNoteUnlockType);
    }

    setStep(2); // Proceed to breathing and gold pause
  };

  // Pausa de Ouro activities generator based on minutes completed
  const getPausaDeOuro = () => {
    if (minutesStudied >= 40) {
      return {
        title: "Pausa de Ouro Estendida (5 min)",
        activity: "Vá até a cozinha, tome um copo cheio de água de forma pausada e faça um alongamento leve olhando pela janela. Evite olhar telas."
      };
    } else {
      return {
        title: "Pausa de Ouro Rápida (3 min)",
        activity: "Feche os olhos completamente. Respire fundo três vezes e estique os braços acima da cabeça por 30 segundos."
      };
    }
  };

  const breakPrompt = getPausaDeOuro();

  return (
    <div 
      className="neumorphic-card" 
      style={{ 
        width: '100%', 
        maxWidth: '520px', 
        margin: '40px auto', 
        padding: '40px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '30px',
        textAlign: 'center'
      }}
    >
      {/* STEP 1: SUMMARY CAPSULE AND Voice Note */}
      {step === 1 && (
        <form onSubmit={handleFirstStepSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>Registro de Florescimento</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.5' }}>
              Finalize o ciclo salvando o conhecimento adquirido. Grave um áudio curto ou escreva uma síntese rápida.
            </p>
          </div>

          {/* Voice recording capsule controls */}
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--card-border)',
            padding: '20px',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Nota de Voz Efêmera
            </span>

            {isRecording ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '0.85rem', color: '#c75e43', fontWeight: '600', animation: 'pulse-breath 1s infinite' }}>
                  Gravando ({recordTimer}s)...
                </span>
                <button 
                  type="button" 
                  className="neumorphic-btn" 
                  onClick={stopRecording} 
                  style={{ padding: '8px 12px', borderColor: '#c75e43', color: '#c75e43' }}
                >
                  <IconStop />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%' }}>
                {voiceBlobUrl ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-color)', fontWeight: '600' }}>Áudio gravado com sucesso</span>
                    <audio src={voiceBlobUrl} controls style={{ height: '32px', width: '100%', maxWidth: '240px' }} />
                    <button 
                      type="button" 
                      className="neumorphic-btn" 
                      onClick={() => setVoiceBlobUrl(null)} 
                      style={{ padding: '4px 10px', fontSize: '0.7rem', color: '#c75e43' }}
                    >
                      Descartar áudio
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    className="neumorphic-btn" 
                    onClick={startRecording}
                    style={{ padding: '10px 20px', borderRadius: '12px' }}
                  >
                    <IconMic />
                    <span>Gravar Áudio</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Written summary input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.02em', textTransform: 'uppercase', fontWeight: '600' }}>
              Resumo de Ouro por Escrito (Opcional)
            </label>
            <textarea
              className="input-field"
              placeholder="Escreva a ideia central em uma frase curta..."
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              rows="2"
              style={{ resize: 'none', fontSize: '0.88rem', background: 'var(--bg-primary)' }}
            />
          </div>

          {/* Future Letter (Time Capsule lock) */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px', 
            textAlign: 'left',
            borderTop: '1px solid rgba(0,0,0,0.03)',
            paddingTop: '16px'
          }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.02em', textTransform: 'uppercase', fontWeight: '600' }}>
              Deixar carta para o eu do futuro (Opcional)
            </label>
            <textarea
              className="input-field"
              placeholder="Ex: Não desista do capítulo de cálculo, você já percorreu um longo caminho hoje..."
              value={futureNote}
              onChange={(e) => setFutureNote(e.target.value)}
              rows="2"
              style={{ resize: 'none', fontSize: '0.88rem', background: 'var(--bg-primary)' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Tipo de Destrancamento:</span>
                  <select 
                    className="input-field"
                    value={futureNoteUnlockType}
                    onChange={(e) => setFutureNoteUnlockType(e.target.value)}
                    style={{ padding: '6px', fontSize: '0.8rem', background: 'var(--bg-primary)' }}
                  >
                    <option value="study">Tempo de Estudo (Foco)</option>
                    <option value="calendar">Tempo Real (Calendário)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Unidade:</span>
                  <select 
                    className="input-field"
                    value={futureNoteUnit}
                    onChange={(e) => setFutureNoteUnit(e.target.value)}
                    style={{ padding: '6px', fontSize: '0.8rem', background: 'var(--bg-primary)' }}
                  >
                    <option value="minutes">Minutos</option>
                    <option value="hours">Horas</option>
                    <option value="days">Dias</option>
                    <option value="months">Meses</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Quantidade:</span>
                <input 
                  type="number"
                  min="1"
                  className="input-field"
                  value={futureNoteQuantity}
                  onChange={(e) => setFutureNoteQuantity(e.target.value)}
                  style={{ width: '80px', padding: '4px 8px', fontSize: '0.8rem', background: 'var(--bg-primary)', textAlign: 'center' }}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="neumorphic-btn accent-btn" style={{ padding: '14px', fontSize: '0.95rem', borderRadius: '14px' }}>
            Salvar e Iniciar Desaceleração
          </button>
        </form>
      )}

      {/* STEP 2: BREATHING AND PAUSA DE OURO */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>Desconexão de Estresse</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Pausa recomendada para afastar a fadiga mental. Respire no ritmo.
            </p>
          </div>

          {/* Guided breathing animation bubble */}
          <div style={{
            height: '140px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%'
          }}>
            <div 
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'var(--panel-bg)',
                border: '2px solid var(--accent-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-inset), 0 0 15px rgba(var(--accent-rgb), 0.08)',
                animation: 'pulse-breath 4s infinite ease-in-out'
              }}
            >
              <span style={{ fontWeight: '600', color: 'var(--accent-color)', fontSize: '1.25rem' }}>
                {breathingSeconds}s
              </span>
            </div>
          </div>

          <div style={{ fontSize: '1.1rem', fontWeight: '500', height: '30px', color: 'var(--text-primary)' }}>
            {breathPhase}
          </div>

          {/* Pausa de Ouro recommendation card */}
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--card-border)',
            padding: '20px',
            borderRadius: '16px',
            textAlign: 'left'
          }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: '600', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              {breakPrompt.title}
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.5' }}>
              {breakPrompt.activity}
            </p>
          </div>

          <button 
            className="neumorphic-btn" 
            onClick={() => setStep(3)}
            style={{ fontSize: '0.75rem', padding: '6px 14px', borderRadius: '10px', opacity: 0.7 }}
          >
            Pular Exercício
          </button>
        </div>
      )}

      {/* STEP 3: REWARDS CHECKOUT SUMMARY */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)' }}>Jornada Concluída</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Seus estudos foram agregados com sucesso ao seu Santuário.
            </p>
          </div>

          {/* Render the unique large plant grown in this session */}
          <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%', margin: '10px 0' }}>
            {renderLargePlant(subject ? subject.color : '#4a7c59', wiltCount > 0, getPlantRank(minutesStudied).level, seed)}
          </div>
          
          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--accent-color)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Rank: {getPlantRank(minutesStudied).name}
          </div>

          {/* Stats board */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '15px', 
              width: '100%', 
              background: 'var(--bg-primary)',
              boxShadow: 'var(--shadow-inset)',
              padding: '24px 20px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.4)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.02em', textTransform: 'uppercase', fontWeight: '600' }}>Foco Adicionado</span>
              <span style={{ fontSize: '1.15rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                +{minutesStudied} min
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.02em', textTransform: 'uppercase', fontWeight: '600' }}>Descanso Líquido</span>
              <span style={{ fontSize: '1.15rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                +{minutesBreak} min
              </span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '4px', 
              alignItems: 'center',
              borderTop: '1px solid rgba(0,0,0,0.03)', 
              paddingTop: '14px', 
              marginTop: '6px'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.02em', textTransform: 'uppercase', fontWeight: '600' }}>Orvalho Colhido</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.15rem', fontWeight: '600', color: 'var(--accent-color)' }}>
                <IconDroplet size={14} />
                <span>+{earnedOrvalho}</span>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '4px', 
              borderTop: '1px solid rgba(0,0,0,0.03)', 
              paddingTop: '14px', 
              marginTop: '6px',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.02em', textTransform: 'uppercase', fontWeight: '600' }}>Streak do Santuário</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem', fontWeight: '600', color: 'var(--accent-color)' }}>
                <IconFlame size={15} />
                <span>{state.streak} dias seguidos</span>
              </div>
            </div>
          </div>

          <button className="neumorphic-btn accent-btn" onClick={onFinish} style={{ width: '100%', padding: '14px', borderRadius: '14px', fontSize: '0.95rem' }}>
            Retornar ao Santuário
          </button>
        </div>
      )}
    </div>
  );
};

export default Checkout;
