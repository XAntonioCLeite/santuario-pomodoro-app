// Autor: Antônio Costa Leite
// Componente de Biblioteca de Materiais e Galeria (O Santuário)

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import SubjectCreator, { SubjectIcons } from './SubjectCreator';
import { renderLargePlant, renderMicroPlant, getPlantRank, getLegendaryRankName } from '../utils/plantRenderer';
import { db, storage } from '../utils/firebase';
import { collection, query, where, getDocs, doc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Outlined SVG icons
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const IconLock = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconUnlock = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

const IconAudioPlay = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const IconFilePdf = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c75e43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const IconFileImage = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a805a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const IconFileText = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </svg>
);

// renderLargePlant is imported from plantRenderer

const Library = () => {
  const { 
    state, 
    currentUser,
    addSubject, 
    deleteSubject, 
    toggleSubjectConcluded, 
    addFutureLetter, 
    addSummary, 
    deleteSummary, 
    deleteVoiceNote,
    shareSummary,
    unshareSummary,
    deleteSharedSummaryDirectly
  } = useApp();
  
  const [showArchived, setShowArchived] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  
  // Custom in-app dialog modals
  const [confirmModal, setConfirmModal] = useState(null);
  const [alertModal, setAlertModal] = useState(null);
  
  // Tab within Library
  const [libraryTab, setLibraryTab] = useState('constellation'); // 'constellation' | 'museum'
  
  // Constellation filter & add subject form
  const [newSubName, setNewSubName] = useState('');
  const [newSubColor, setNewSubColor] = useState('#4a7c59');
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Future lock letters states
  const [futureLetterText, setFutureLetterText] = useState('');
  const [unlockQuantity, setUnlockQuantity] = useState(30);
  const [unlockUnit, setUnlockUnit] = useState('minutes');
  const [unlockType, setUnlockType] = useState('study');
  const [showLetterForm, setShowLetterForm] = useState(false);
  const [letterStatusMsg, setLetterStatusMsg] = useState('');

  // Summaries Add Form States
  const [showSummaryForm, setShowSummaryForm] = useState(false);
  const [summarySubjectId, setSummarySubjectId] = useState('');
  const [summaryTitle, setSummaryTitle] = useState('');
  const [summaryMediaType, setSummaryMediaType] = useState('text');
  const [summaryTextContent, setSummaryTextContent] = useState('');
  const [summaryFileContent, setSummaryFileContent] = useState('');
  const [summaryFileName, setSummaryFileName] = useState('');
  const [publishPublicly, setPublishPublicly] = useState(false);

  // Interactive View Overlays
  const [expandedImage, setExpandedImage] = useState(null);
  const [selectedPlantDetail, setSelectedPlantDetail] = useState(null);

  // Public Shared Summaries Search/State
  const [searchQuery, setSearchQuery] = useState('');
  const [sharedSummaries, setSharedSummaries] = useState([]);
  const [loadingShared, setLoadingShared] = useState(false);

  const fetchSharedSummaries = async () => {
    setLoadingShared(true);
    try {
      const q = collection(db, 'shared_summaries');
      const snap = await getDocs(q);
      const list = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() });
      });
      list.sort((a, b) => (b.sharedAt || 0) - (a.sharedAt || 0));
      setSharedSummaries(list);
    } catch (e) {
      console.error("Error fetching shared summaries:", e);
    } finally {
      setLoadingShared(false);
    }
  };

  useEffect(() => {
    if (libraryTab === 'shared') {
      fetchSharedSummaries();
    }
  }, [libraryTab]);

  const filteredShared = sharedSummaries.filter(sum => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (sum.title || '').toLowerCase().includes(q) ||
      (sum.content || '').toLowerCase().includes(q) ||
      (sum.subjectName || '').toLowerCase().includes(q) ||
      (sum.authorName || '').toLowerCase().includes(q)
    );
  });

  // Filters & Sorting for Museum gallery
  const [sortBy, setSortBy] = useState('date-desc');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterFocus, setFilterFocus] = useState('all');

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    addSubject(newSubName.trim(), newSubColor);
    setNewSubName('');
    setShowAddForm(false);
  };

  const handleAddLetter = (e) => {
    e.preventDefault();
    if (!futureLetterText.trim()) return;
    addFutureLetter(futureLetterText.trim(), parseInt(unlockQuantity), unlockUnit, unlockType);
    setFutureLetterText('');
    setLetterStatusMsg('Cápsula do tempo selada com sucesso!');
    setTimeout(() => {
      setLetterStatusMsg('');
      setShowLetterForm(false);
    }, 2500);
  };

  const [selectedFileObj, setSelectedFileObj] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Strict 8 MB limit check (8 * 1024 * 1024 bytes = 8,388,608 bytes)
    const maxSizeBytes = 8 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setAlertModal({
        title: 'Arquivo Excede o Limite de 8 MB',
        message: `O arquivo "${file.name}" possui ${(file.size / (1024 * 1024)).toFixed(1)} MB, excedendo o limite máximo de 8 MB. Por favor, selecione um arquivo menor.`
      });
      e.target.value = '';
      setSummaryFileName('');
      setSummaryFileContent('');
      setSelectedFileObj(null);
      return;
    }

    setSummaryFileName(file.name);
    setSelectedFileObj(file);
    
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setSummaryFileContent(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddSummary = async (e) => {
    e.preventDefault();
    if (!summaryTitle.trim()) return;

    let finalContent = summaryMediaType === 'text' ? summaryTextContent : summaryFileContent;

    if (summaryMediaType !== 'text') {
      if (!summaryFileContent) {
        setAlertModal({ title: 'Aviso', message: 'Por favor, selecione um arquivo válido.' });
        return;
      }

      // Verifica limite de 8 MB
      if (selectedFileObj && selectedFileObj.size > 8 * 1024 * 1024) {
        setAlertModal({
          title: 'Arquivo Excede o Limite de 8 MB',
          message: 'O arquivo selecionado excede o limite máximo permitido de 8 MB.'
        });
        return;
      }

      // Tenta envio para o Firebase Storage
      if (selectedFileObj && storage) {
        try {
          setUploadingFile(true);
          const safeName = selectedFileObj.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const storageRef = ref(storage, `summaries/${Date.now()}_${safeName}`);
          await uploadBytes(storageRef, selectedFileObj);
          const downloadUrl = await getDownloadURL(storageRef);
          finalContent = downloadUrl;
        } catch (storageErr) {
          console.warn("Storage upload failed, falling back to base64:", storageErr);
          if (summaryFileContent.length > 900000) {
            setAlertModal({
              title: 'Arquivo Muito Grande',
              message: 'Não foi possível enviar para a nuvem e o arquivo em formato direto excede o limite do banco. Tente um arquivo menor.'
            });
            setUploadingFile(false);
            return;
          }
        } finally {
          setUploadingFile(false);
        }
      }
    }

    if (!finalContent) {
      setAlertModal({ title: 'Aviso', message: 'Por favor, informe o conteúdo ou selecione um arquivo válido.' });
      return;
    }

    const createdSubId = summarySubjectId || (state.subjects[0]?.id || '');
    const newSum = addSummary(createdSubId, finalContent, summaryTitle.trim(), summaryMediaType, summaryFileName);

    if (publishPublicly && newSum) {
      const res = await shareSummary(newSum);
      if (res.success) {
        setAlertModal({ title: 'Resumo Publicado', message: 'Resumo salvo e publicado com sucesso no Acervo Público!' });
      } else {
        setAlertModal({ title: 'Salvo na Biblioteca Pessoal', message: 'Resumo salvo na sua biblioteca pessoal. Erro ao publicar: ' + res.error });
      }
    } else {
      setAlertModal({ title: 'Resumo Salvo', message: 'Resumo adicionado à sua biblioteca com sucesso!' });
    }

    setSummaryTitle('');
    setSummarySubjectId('');
    setSummaryTextContent('');
    setSummaryFileContent('');
    setSummaryFileName('');
    setSelectedFileObj(null);
    setPublishPublicly(false);
    setShowSummaryForm(false);
  };

  const getStarCoordinates = (index, total) => {
    if (total === 1) return { x: 50, y: 50 };
    if (total === 2) {
      return index === 0 ? { x: 30, y: 50 } : { x: 70, y: 50 };
    }
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
    const radius = 30;
    return {
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle)
    };
  };

  const totalSubjects = state.subjects.length;
  const stars = state.subjects.map((sub, idx) => {
    const coords = getStarCoordinates(idx, totalSubjects);
    return {
      ...sub,
      x: coords.x,
      y: coords.y,
      r: Math.min(18, 6 + Math.sqrt(sub.focusMinutes || 0) * 1.2)
    };
  });

  const filteredSummaries = selectedSubjectId
    ? state.summaries.filter(s => s.subjectId === selectedSubjectId)
    : state.summaries;

  // Renderiza vetor da planta em microescala
  // renderMicroPlant is imported from plantRenderer

  // Total studied minutes overall
  const totalStudiedMinutes = state.subjects.reduce((sum, s) => sum + s.focusMinutes, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
      
      {/* Tab Switcher */}
      <div 
        className="responsive-tabs"
        style={{
          display: 'flex',
          background: 'var(--bg-primary)',
          boxShadow: 'var(--shadow-inset)',
          padding: '5px',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '450px',
          alignSelf: 'center',
          gap: '4px'
        }}
      >
        <button
          className={`neumorphic-btn ${libraryTab === 'constellation' ? 'active' : ''}`}
          onClick={() => setLibraryTab('constellation')}
          style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', borderRadius: '12px', border: 'none' }}
        >
          Constelações
        </button>
        <button
          className={`neumorphic-btn ${libraryTab === 'museum' ? 'active' : ''}`}
          onClick={() => setLibraryTab('museum')}
          style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', borderRadius: '12px', border: 'none' }}
        >
          Museu do Crescimento
        </button>
        <button
          className={`neumorphic-btn ${libraryTab === 'shared' ? 'active' : ''}`}
          onClick={() => setLibraryTab('shared')}
          style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', borderRadius: '12px', border: 'none' }}
        >
          Resumos Coletivos
        </button>
      </div>

      {/* VIEW 1: CONSTELLATIONS */}
      {libraryTab === 'constellation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Constellation Chart Card */}
          <div className="neumorphic-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary)' }}>Mapa de Conhecimento</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                As constelações ligam as áreas estudadas. Clique em uma estrela para ver os conceitos associados.
              </p>
            </div>

            {/* SVG Chart */}
            <div style={{ 
              background: 'var(--bg-primary)', 
              boxShadow: 'var(--shadow-inset)',
              borderRadius: '20px', 
              height: '240px', 
              position: 'relative',
              border: '1px solid var(--card-border)',
              overflow: 'hidden'
            }}>
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                {stars.map((star, i) => {
                  const nextStar = stars[(i + 1) % stars.length];
                  if (!nextStar) return null;
                  const hasActivity = star.focusMinutes > 0 && nextStar.focusMinutes > 0;
                  return (
                    <line
                      key={`line-${i}`}
                      x1={`${star.x}%`}
                      y1={`${star.y}%`}
                      x2={`${nextStar.x}%`}
                      y2={`${nextStar.y}%`}
                      stroke={hasActivity ? 'var(--accent-color)' : 'rgba(0,0,0,0.06)'}
                      strokeWidth={hasActivity ? '0.7' : '0.3'}
                      strokeDasharray={hasActivity ? 'none' : '2 2'}
                      style={{ transition: 'var(--transition-smooth)' }}
                    />
                  );
                })}
              </svg>

              {stars.map((star) => (
                <div
                  key={star.id}
                  onClick={() => setSelectedSubjectId(selectedSubjectId === star.id ? null : star.id)}
                  style={{
                    position: 'absolute',
                    left: `${star.x}%`,
                    top: `${star.y}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 5
                  }}
                >
                  <div 
                    className={star.concluded ? "" : "breath-animation"}
                    style={{
                      width: `${star.r * 2}px`,
                      height: `${star.r * 2}px`,
                      borderRadius: '50%',
                      background: 'var(--panel-bg)',
                      border: star.concluded ? `2.5px dashed #a39890` : `2.5px solid ${star.color}`,
                      opacity: star.concluded ? 0.65 : 1,
                      boxShadow: selectedSubjectId === star.id 
                        ? `0 0 0 4px rgba(255,255,255,1), 0 0 12px ${star.color}` 
                        : `0 4px 10px rgba(0,0,0,0.05)`,
                      transition: 'var(--transition-smooth)'
                    }}
                  />
                  
                  <div style={{
                    marginTop: '8px',
                    fontSize: '8px',
                    fontWeight: '600',
                    background: 'var(--panel-bg)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    padding: '3px 6px',
                    borderRadius: '8px',
                    border: `1.5px solid ${selectedSubjectId === star.id ? 'var(--accent-color)' : 'rgba(0,0,0,0.03)'}`,
                    color: 'var(--text-primary)',
                    opacity: star.concluded ? 0.75 : 1,
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    textAlign: 'center',
                    maxWidth: '90px',
                    lineHeight: '1.25',
                    pointerEvents: 'none',
                    letterSpacing: '0.01em'
                  }}>
                    {star.name.length > 20 ? star.name.substring(0, 18) + '...' : star.name} {star.concluded ? '(Concluída) ' : ''}• {star.focusMinutes}m
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                className="neumorphic-btn" 
                onClick={() => setSelectedSubjectId(null)}
                style={{ fontSize: '0.75rem', padding: '6px 14px', borderRadius: '10px', opacity: selectedSubjectId ? 1 : 0.6 }}
              >
                Ver Todas
              </button>
              
              <button 
                className="neumorphic-btn" 
                onClick={() => setShowArchived(!showArchived)}
                style={{ fontSize: '0.75rem', padding: '6px 14px', borderRadius: '10px', color: 'var(--accent-color)' }}
              >
                {showArchived ? 'Ocultar Concluídas' : 'Ver Matérias Concluídas'}
              </button>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'var(--bg-primary)',
              padding: '20px',
              borderRadius: '20px',
              border: '1px solid var(--card-border)',
              boxShadow: 'var(--shadow-inset)',
              marginTop: '10px'
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', letterSpacing: '0.03em', textTransform: 'uppercase', fontWeight: '700' }}>
                Matérias Ativas
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {state.subjects
                  .filter(sub => showArchived || !sub.concluded)
                  .map(sub => (
                    <div key={sub.id} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      background: 'var(--panel-bg)',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(0,0,0,0.02)',
                      opacity: sub.concluded ? 0.65 : 1,
                      gap: '12px',
                      boxShadow: 'var(--shadow-flat)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', minWidth: 0, width: '100%' }}>
                        <span style={{ color: sub.color, display: 'flex', alignItems: 'center', flexShrink: 0, marginTop: '2px' }}>
                          {SubjectIcons[sub.icon || 'book']({ size: 18 })}
                        </span>
                        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ 
                              fontSize: '0.88rem', 
                              fontWeight: '600', 
                              color: 'var(--text-primary)',
                              textDecoration: sub.concluded ? 'line-through' : 'none',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap'
                            }}>
                              {sub.name}
                            </span>
                            <span style={{ 
                              fontSize: '0.65rem', 
                              color: 'var(--text-secondary)', 
                              background: 'var(--bg-primary)',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              flexShrink: 0
                            }}>
                              P{sub.priority || 3}
                            </span>
                          </div>
                          {sub.concluded ? (
                            <span style={{ 
                              fontSize: '0.68rem', 
                              color: 'var(--accent-color)', 
                              fontWeight: 'bold'
                            }}>
                              Concluída {sub.finalGrade ? `• Nota Final: ${sub.finalGrade}` : ''}
                            </span>
                          ) : sub.finalGrade ? (
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                              Nota: {sub.finalGrade}
                            </span>
                          ) : null}
                          {sub.professor && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                              Prof: {sub.professor}
                            </span>
                          )}
                          {sub.classTimes && sub.classTimes.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                              {sub.classTimes.map((ct, idx) => (
                                <span key={idx} style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.7 }}>
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                  </svg>
                                  <span>{ct.day} às {ct.time}{ct.location ? ` (${ct.location})` : ''}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'flex-end', 
                        gap: '12px', 
                        borderTop: '1px solid rgba(0,0,0,0.03)',
                        paddingTop: '8px',
                        marginTop: '4px'
                      }}>
                        {/* Archive Toggle Button */}
                        <button 
                          onClick={() => toggleSubjectConcluded(sub.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: sub.concluded ? 'var(--accent-color)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem',
                            fontWeight: '600',
                            padding: '4px'
                          }}
                          title={sub.concluded ? "Reativar Matéria" : "Concluir Semestre / Arquivar"}
                        >
                          {sub.concluded ? <IconUnlock size={14} /> : <IconLock size={14} />}
                          <span>{sub.concluded ? 'Reativar' : 'Concluir'}</span>
                        </button>

                        {/* Edit Button */}
                        <button 
                          onClick={() => setEditingSubject(sub)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-color)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem',
                            fontWeight: '600',
                            padding: '4px'
                          }}
                          title="Editar Matéria"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          <span>Editar</span>
                        </button>

                        {/* Delete Button */}
                        <button 
                          onClick={() => {
                            setConfirmModal({
                              title: 'Excluir Matéria',
                              message: `Deseja realmente excluir a matéria "${sub.name}" e todas as suas anotações?`,
                              confirmText: 'Excluir',
                              cancelText: 'Cancelar',
                              onConfirm: () => deleteSubject(sub.id)
                            });
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#c75e43',
                            cursor: 'pointer',
                            display: 'flex',
                            padding: '4px'
                          }}
                          title="Excluir Matéria"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Golden Summaries timeline list */}
          <div className="neumorphic-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.15rem' }}>
                {selectedSubjectId 
                  ? `Anotações: ${state.subjects.find(s => s.id === selectedSubjectId)?.name}` 
                  : 'Biblioteca de Resumos de Ouro'}
              </h3>
              <button 
                className="neumorphic-btn" 
                onClick={() => {
                  setSummarySubjectId(selectedSubjectId || state.subjects[0]?.id || '');
                  setShowSummaryForm(!showSummaryForm);
                }}
                style={{ padding: '6px 14px', fontSize: '0.75rem', color: 'var(--accent-color)' }}
              >
                {showSummaryForm ? 'Fechar Form' : '+ Adicionar Resumo'}
              </button>
            </div>

            {showSummaryForm && (
              <form onSubmit={handleAddSummary} style={{
                background: 'var(--bg-primary)',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid var(--card-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                animation: 'fadeIn 0.2s'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Título / Assunto</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Teorema Fundamental do Cálculo" 
                    value={summaryTitle}
                    onChange={(e) => setSummaryTitle(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Matéria</label>
                    <select 
                      value={summarySubjectId} 
                      onChange={(e) => setSummarySubjectId(e.target.value)}
                      className="input-field"
                    >
                      <option value="">Sem Matéria</option>
                      {state.subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Tipo de Mídia</label>
                    <select 
                      value={summaryMediaType} 
                      onChange={(e) => {
                        setSummaryMediaType(e.target.value);
                        setSummaryFileContent('');
                        setSummaryFileName('');
                      }}
                      className="input-field"
                    >
                      <option value="text">Texto</option>
                      <option value="image">Imagem</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>
                </div>

                {summaryMediaType === 'text' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Resumo de Ouro</label>
                    <textarea 
                      placeholder="Digite a ideia central ou fórmulas importantes..."
                      value={summaryTextContent}
                      onChange={(e) => setSummaryTextContent(e.target.value)}
                      className="input-field"
                      rows="3"
                      style={{ resize: 'none', fontSize: '0.85rem' }}
                      required
                    />
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
                      Selecionar Arquivo {summaryMediaType === 'pdf' ? '.pdf' : 'Imagem'}
                    </label>
                    <input 
                      type="file" 
                      accept={summaryMediaType === 'pdf' ? 'application/pdf' : 'image/*'}
                      onChange={handleFileChange}
                      className="input-field"
                      required
                    />
                    {summaryFileName && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)' }}>Arquivo carregado: {summaryFileName}</span>
                    )}
                  </div>
                )}

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: '4px 0' }}>
                  <input
                    type="checkbox"
                    checked={publishPublicly}
                    onChange={(e) => setPublishPublicly(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                    Publicar resumo no acervo público (visível para outros estudantes)
                  </span>
                </label>

                <button type="submit" disabled={uploadingFile} className="neumorphic-btn accent-btn" style={{ padding: '10px', borderRadius: '10px', opacity: uploadingFile ? 0.7 : 1 }}>
                  {uploadingFile ? 'Enviando Arquivo (até 8 MB)...' : 'Salvar Resumo de Ouro'}
                </button>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredSummaries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Nenhum resumo registrado.
                </div>
              ) : (
                filteredSummaries.map((sum) => {
                  const sub = state.subjects.find(s => s.id === sum.subjectId);
                  return (
                    <div 
                      key={sum.id} 
                      style={{
                        background: 'var(--panel-bg)',
                        borderLeft: `4px solid ${sub ? sub.color : 'var(--accent-color)'}`,
                        borderRadius: '0 12px 12px 0',
                        padding: '16px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        border: '1px solid rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {sum.type === 'pdf' ? <IconFilePdf /> : sum.type === 'image' ? <IconFileImage /> : <IconFileText />}
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {sum.title || 'Resumo de Ouro'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            {new Date(sum.timestamp).toLocaleDateString('pt-BR')}
                          </span>
                          
                          {/* Only allow sharing if summary was originally created by this user and NOT imported */}
                          {!sum.isImported && (!sum.authorUid || sum.authorUid === currentUser?.uid) && (
                            <button 
                              onClick={() => {
                                if (sum.isShared) {
                                  setConfirmModal({
                                    title: 'Retirar do Acervo',
                                    message: 'Deseja retirar este resumo do acervo público da comunidade?',
                                    confirmText: 'Retirar',
                                    cancelText: 'Cancelar',
                                    onConfirm: async () => {
                                      const success = await unshareSummary(sum.id);
                                      if (success) {
                                        setAlertModal({ title: 'Resumo Retirado', message: 'Resumo retirado do acervo público com sucesso.' });
                                      }
                                    }
                                  });
                                } else {
                                  setConfirmModal({
                                    title: 'Publicar no Acervo',
                                    message: 'Deseja publicar este resumo no acervo público para outros estudantes?',
                                    confirmText: 'Publicar',
                                    cancelText: 'Cancelar',
                                    onConfirm: async () => {
                                      const res = await shareSummary(sum);
                                      if (res.success) {
                                        setAlertModal({ title: 'Resumo Publicado', message: 'Resumo compartilhado com sucesso no Acervo Público!' });
                                      } else {
                                        setAlertModal({ title: 'Erro ao Publicar', message: res.error || 'Não foi possível publicar o resumo.' });
                                      }
                                    }
                                  });
                                }
                              }}
                              className={`neumorphic-btn ${sum.isShared ? 'active' : ''}`}
                              style={{ padding: '2px 8px', fontSize: '0.7rem', borderRadius: '6px', color: sum.isShared ? 'var(--accent-color)' : 'var(--text-secondary)', border: 'none' }}
                              title={sum.isShared ? "Retirar Compartilhamento" : "Compartilhar Publicamente"}
                            >
                              {sum.isShared ? "Publicado" : "Publicar"}
                            </button>
                          )}

                          <button 
                            onClick={() => {
                              setConfirmModal({
                                title: 'Excluir Resumo',
                                message: 'Deseja realmente excluir este resumo da sua biblioteca?',
                                confirmText: 'Excluir',
                                cancelText: 'Cancelar',
                                onConfirm: () => {
                                  deleteSummary(sum.id);
                                  setAlertModal({ title: 'Resumo Excluído', message: 'Resumo excluído com sucesso.' });
                                }
                              });
                            }}
                            style={{ background: 'none', border: 'none', color: '#c75e43', cursor: 'pointer', padding: '2px' }}
                            title="Excluir Resumo"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </div>
                      
                      {sum.type === 'image' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <img 
                            src={sum.content} 
                            alt={sum.title} 
                            style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', objectFit: 'contain', cursor: 'zoom-in', alignSelf: 'flex-start', border: '1px solid var(--card-border)' }} 
                            onClick={() => setExpandedImage(sum.content)}
                          />
                        </div>
                      ) : sum.type === 'pdf' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <a 
                            href={sum.content} 
                            download={sum.fileName || 'resumo.pdf'} 
                            className="neumorphic-btn" 
                            style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '6px', textDecoration: 'none' }}
                          >
                            <IconDownload />
                            <span>Baixar PDF ({sum.fileName || 'Abrir'})</span>
                          </a>
                        </div>
                      ) : (
                        <div style={{ fontFamily: 'var(--font-title)', fontStyle: 'italic', fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                          "{sum.content}"
                        </div>
                      )}
                      
                      {sub && (
                        <div style={{ fontSize: '0.72rem', color: sub.color, fontWeight: '600', alignSelf: 'flex-start', background: sub.color + '10', padding: '2px 8px', borderRadius: '6px' }}>
                          {sub.name}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MUSEUM OF GROWTH & VOICE CAPSULES */}
      {libraryTab === 'museum' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Successful grown plants gallery */}
          <div className="neumorphic-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Galeria de Florescimento</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Registro visual de cada planta cuidada com sucesso e adicionada ao museu do Santuário. Clique para detalhes.
              </p>
            </div>

            {/* Filters and sorting layout */}
            {(state.museumItems && state.museumItems.length > 0) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', background: 'var(--panel-bg)', padding: '12px', borderRadius: '12px', border: '1px solid var(--card-border)', marginBottom: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '120px' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Ordenar Por</span>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-inset)'
                    }}
                  >
                    <option value="date-desc">Mais recentes</option>
                    <option value="date-asc">Mais antigas</option>
                    <option value="focus-desc">Maior tempo</option>
                    <option value="focus-asc">Menor tempo</option>
                    <option value="level-desc">Maior nível</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '120px' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Matéria</span>
                  <select 
                    value={filterSubject} 
                    onChange={(e) => setFilterSubject(e.target.value)}
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-inset)'
                    }}
                  >
                    <option value="all">Todas</option>
                    {Array.from(new Set((state.museumItems || []).map(item => item.subjectName).filter(Boolean))).map(subName => (
                      <option key={subName} value={subName}>{subName}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '120px' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Foco</span>
                  <select 
                    value={filterFocus} 
                    onChange={(e) => setFilterFocus(e.target.value)}
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-inset)'
                    }}
                  >
                    <option value="all">Todos</option>
                    <option value="pleno">Foco Pleno</option>
                    <option value="distracted">Com Distrações</option>
                  </select>
                </div>
              </div>
            )}

            {(!state.museumItems || state.museumItems.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Sua galeria está vazia. Complete sessões de foco para colher suas primeiras plantas.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* Process lists */}
                {(() => {
                  const filteredMuseumItems = (state.museumItems || [])
                    .filter(item => {
                      if (filterSubject !== 'all' && item.subjectName !== filterSubject) return false;
                      if (filterFocus === 'pleno' && item.wiltCount > 0) return false;
                      if (filterFocus === 'distracted' && (!item.wiltCount || item.wiltCount === 0)) return false;
                      return true;
                    })
                    .sort((a, b) => {
                      if (sortBy === 'date-desc') {
                        const timeA = parseInt(a.id?.split('_')[1]) || 0;
                        const timeB = parseInt(b.id?.split('_')[1]) || 0;
                        return timeB - timeA;
                      }
                      if (sortBy === 'date-asc') {
                        const timeA = parseInt(a.id?.split('_')[1]) || 0;
                        const timeB = parseInt(b.id?.split('_')[1]) || 0;
                        return timeA - timeB;
                      }
                      if (sortBy === 'focus-desc') {
                        return b.minutes - a.minutes;
                      }
                      if (sortBy === 'focus-asc') {
                        return a.minutes - b.minutes;
                      }
                      if (sortBy === 'level-desc') {
                        const levelA = a.level || getPlantRank(a.minutes).level;
                        const levelB = b.level || getPlantRank(b.minutes).level;
                        return levelB - levelA;
                      }
                      return 0;
                    });

                  if (filteredMuseumItems.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        Nenhuma planta corresponde aos filtros selecionados.
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '15px' }}>
                      {filteredMuseumItems.map((item) => (
                        <div 
                          key={item.id} 
                          onClick={() => setSelectedPlantDetail(item)}
                          style={{
                            background: 'var(--bg-primary)',
                            padding: '16px',
                            borderRadius: '16px',
                            border: '1px solid var(--card-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            boxShadow: 'var(--shadow-flat)',
                            transition: 'transform 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                        >
                          {(() => {
                            const gradeNum = parseFloat(String(item.finalGrade || 0).replace(',', '.'));
                            const isGolden = item.isGolden || gradeNum >= 8.5;
                            return (
                              <>
                                {renderMicroPlant(
                                  item.subjectColor, 
                                  item.wiltCount > 0, 
                                  item.level || getPlantRank(item.minutes).level, 
                                  item.seed !== undefined ? item.seed : (parseInt(item.id?.split('_')[1]) / 1000000000000 || 0.5),
                                  item.isConcludedPlant ? (isGolden ? 56 : 50) : 36,
                                  item.isConcludedPlant,
                                  isGolden
                                )}
                                <div>
                                  <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.subjectName}</div>
                                  <div style={{ fontSize: '0.75rem', color: isGolden ? '#ffd700' : 'var(--text-secondary)', marginTop: '2px', fontWeight: item.isConcludedPlant ? '700' : '400' }}>
                                    {item.isConcludedPlant ? (isGolden ? getLegendaryRankName(item.seed, gradeNum, item.subjectName) : 'Matéria Concluída') : `${item.minutes}m focado`}
                                  </div>
                                  <div style={{ fontSize: '0.68rem', color: item.isConcludedPlant ? (isGolden ? '#ffd700' : '#64748b') : (item.wiltCount > 0 ? '#c75e43' : 'var(--accent-color)'), fontWeight: '600', marginTop: '4px' }}>
                                    {item.isConcludedPlant ? `Nota: ${item.finalGrade || 'Concluída'}` : (item.wiltCount > 0 ? `${item.wiltCount} distração` : 'Foco pleno')}
                                  </div>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{item.date}</div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Time Capsule: Locked Future Letters */}
          <div className="neumorphic-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Cartas para o Eu do Futuro</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Escreva bilhetes motivacionais. Eles abrem de acordo com o tempo estudado ou datas reais.
                </p>
              </div>
              <button 
                className="neumorphic-btn" 
                onClick={() => setShowLetterForm(!showLetterForm)}
                style={{ padding: '6px 14px', fontSize: '0.75rem' }}
              >
                Criar Bilhete
              </button>
            </div>

            {showLetterForm && (
              <form onSubmit={handleAddLetter} style={{
                background: 'var(--bg-primary)',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid var(--card-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                animation: 'fadeIn 0.2s'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Mensagem para o Futuro</label>
                  <textarea
                    className="input-field"
                    placeholder="Escreva algo inspirador ou lembre-se do porquê começou..."
                    value={futureLetterText}
                    onChange={(e) => setFutureLetterText(e.target.value)}
                    rows="3"
                    style={{ resize: 'none', fontSize: '0.85rem' }}
                    required
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Tipo de Destrancamento</label>
                    <select
                      value={unlockType}
                      onChange={(e) => setUnlockType(e.target.value)}
                      className="input-field"
                    >
                      <option value="study">Tempo de Estudo (Foco)</option>
                      <option value="calendar">Tempo Real (Calendário)</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Unidade</label>
                    <select
                      value={unlockUnit}
                      onChange={(e) => setUnlockUnit(e.target.value)}
                      className="input-field"
                    >
                      <option value="minutes">Minutos</option>
                      <option value="hours">Horas</option>
                      <option value="days">Dias</option>
                      <option value="months">Meses</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    value={unlockQuantity}
                    onChange={(e) => setUnlockQuantity(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <button type="submit" className="neumorphic-btn accent-btn" style={{ padding: '10px', borderRadius: '10px' }}>
                  Trancar Mensagem
                </button>
                {letterStatusMsg && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-color)', textAlign: 'center', fontWeight: '500' }}>
                    {letterStatusMsg}
                  </div>
                )}
              </form>
            )}

            {(!state.futureLetters || state.futureLetters.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Nenhum bilhete temporal criado.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {state.futureLetters.map((letter) => {
                  const formatRemaining = () => {
                    if (letter.unlockType === 'calendar') {
                      const remMs = letter.unlockDate - Date.now();
                      if (remMs <= 0) return 'Pronto';
                      const remMins = Math.ceil(remMs / 60000);
                      if (remMins < 60) return `Faltam ${remMins} min`;
                      const remHours = Math.ceil(remMins / 60);
                      if (remHours < 24) return `Faltam ${remHours} horas`;
                      const remDays = Math.ceil(remHours / 24);
                      return `Faltam ${remDays} dias`;
                    } else {
                      const needed = letter.unlockMilestone - totalStudiedMinutes;
                      return needed <= 0 ? 'Pronto' : `Faltam ${needed}m focados`;
                    }
                  };

                  return (
                    <div key={letter.id} style={{
                      background: letter.isUnlocked ? 'var(--bg-primary)' : 'rgba(0,0,0,0.01)',
                      border: '1px solid var(--card-border)',
                      padding: '16px 20px',
                      borderRadius: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Escrito em {letter.dateCreated}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '600', color: letter.isUnlocked ? 'var(--accent-color)' : 'var(--text-secondary)' }}>
                          {letter.isUnlocked ? <IconUnlock size={14} /> : <IconLock size={14} />}
                          <span>
                            {letter.isUnlocked 
                              ? 'Mensagem Revelada' 
                              : `Trancado (${formatRemaining()})`}
                          </span>
                        </div>
                      </div>
                      {letter.isUnlocked ? (
                        <div style={{ fontFamily: 'var(--font-title)', fontStyle: 'italic', fontSize: '1rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                          "{letter.content}"
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          Esta cápsula de tempo está selada. Continue estudando para desbloquear seu conteúdo.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Voice Capsules Panel */}
          <div className="neumorphic-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Cápsulas de Voz Efêmeras</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Consultoria rápida por voz. Reproduza áudios curtos gravados ao final dos seus ciclos.
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontWeight: '600', marginTop: '4px' }}>
                *Áudio efêmero (se autodestrói após reprodução completa)
              </p>
            </div>

            {(!state.voiceNotes || state.voiceNotes.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Nenhuma cápsula de áudio gravada ainda.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {state.voiceNotes.map((note) => {
                  const sub = state.subjects.find(s => s.id === note.subjectId);
                  return (
                    <div key={note.id} style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--card-border)',
                      padding: '16px 20px',
                      borderRadius: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: sub ? sub.color : 'var(--text-secondary)' }}>
                          {sub ? sub.name : 'Matéria'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {note.dateCreated}
                          </span>
                          <button 
                            onClick={() => {
                              if (window.confirm("Deseja descartar este áudio?")) {
                                deleteVoiceNote(note.id);
                              }
                            }}
                            style={{ background: 'none', border: 'none', color: '#c75e43', cursor: 'pointer', padding: '2px' }}
                            title="Descartar áudio"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </div>
                      
                      {/* Audio element container */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'var(--panel-bg)', padding: '8px 16px', borderRadius: '12px' }}>
                        <audio 
                          src={note.audioUrl} 
                          controls 
                          style={{ flex: 1, height: '32px' }} 
                          onEnded={() => deleteVoiceNote(note.id)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* EDIT SUBJECT MODAL OVERLAY */}
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
            <SubjectCreator 
              onClose={() => setEditingSubject(null)} 
              editingSubject={editingSubject} 
            />
          </div>
        </div>
      )}
      {/* VIEW 3: SHARED LIBRARY */}
      {libraryTab === 'shared' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="neumorphic-card" style={{ padding: '24px', background: 'var(--panel-bg)', borderRadius: '20px', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-flat)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: '700' }}>Biblioteca Pública de Resumos</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Explore e pesquise os resumos de ouro compartilhados pela comunidade. Você pode importar qualquer resumo para a sua biblioteca pessoal!</p>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Buscar por título, matéria, autor ou conteúdo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ flex: 1, padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              />
              <button 
                onClick={fetchSharedSummaries} 
                className="neumorphic-btn" 
                style={{ padding: '10px 16px', borderRadius: '12px', fontSize: '0.82rem', border: 'none' }}
              >
                Atualizar
              </button>
            </div>
            
            {loadingShared ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>Carregando biblioteca pública...</p>
            ) : filteredShared.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>Nenhum resumo compartilhado encontrado.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredShared.map(sum => (
                  <div key={sum.id} className="neumorphic-card" style={{ padding: '18px 24px', background: 'var(--panel-bg)', borderRadius: '16px', borderLeft: `5px solid ${sum.subjectColor || 'var(--accent-color)'}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          {sum.type === 'pdf' ? <IconFilePdf /> : sum.type === 'image' ? <IconFileImage /> : <IconFileText />}
                          <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{sum.title}</h4>
                          <span style={{ fontSize: '0.68rem', background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: '6px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                            {sum.subjectName}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          Compartilhado por <strong style={{ color: 'var(--text-primary)' }}>{sum.authorName}</strong> • {new Date(sum.sharedAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={async () => {
                            let subId = '';
                            const localSub = state.subjects.find(s => s.name.toLowerCase() === sum.subjectName.toLowerCase());
                            if (localSub) {
                              subId = localSub.id;
                            } else {
                              const newSub = addSubject(sum.subjectName, sum.subjectColor || 'var(--accent-color)');
                              subId = newSub.id;
                            }
                            addSummary(subId, sum.content, sum.title, sum.type, sum.fileName, true);
                            setAlertModal({ title: 'Resumo Importado', message: 'Resumo importado com sucesso para a sua biblioteca pessoal!' });
                          }}
                          className="neumorphic-btn accent-btn"
                          style={{ padding: '6px 12px', fontSize: '0.74rem', borderRadius: '8px' }}
                        >
                          Importar
                        </button>

                        {/* Author delete button */}
                        {currentUser && sum.authorUid === currentUser.uid && (
                          <button
                            onClick={() => {
                              setConfirmModal({
                                title: 'Excluir do Acervo Público',
                                message: 'Deseja remover permanentemente este resumo do acervo público para todos os usuários?',
                                confirmText: 'Excluir',
                                cancelText: 'Cancelar',
                                onConfirm: async () => {
                                  const ok = await deleteSharedSummaryDirectly(sum.id);
                                  if (ok) {
                                    fetchSharedSummaries();
                                    setAlertModal({ title: 'Removido', message: 'Resumo removido do acervo público.' });
                                  } else {
                                    setAlertModal({ title: 'Erro', message: 'Não foi possível remover o resumo.' });
                                  }
                                }
                              });
                            }}
                            className="neumorphic-btn"
                            style={{ padding: '6px 10px', fontSize: '0.74rem', borderRadius: '8px', color: '#c75e43' }}
                            title="Excluir do Acervo Público"
                          >
                            Excluir do Acervo
                          </button>
                        )}
                      </div>
                    </div>

                    {sum.type === 'text' && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.01)', maxHeight: '150px', overflowY: 'auto' }}>
                        {sum.content}
                      </p>
                    )}

                    {sum.type === 'image' && (
                      <img 
                        src={sum.content} 
                        alt={sum.title} 
                        style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', objectFit: 'contain', cursor: 'zoom-in', alignSelf: 'flex-start', border: '1px solid var(--card-border)' }} 
                        onClick={() => setExpandedImage(sum.content)}
                      />
                    )}

                    {sum.type === 'pdf' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <a 
                          href={sum.content} 
                          download={sum.fileName || 'resumo.pdf'} 
                          className="neumorphic-btn" 
                          style={{ padding: '6px 12px', fontSize: '0.74rem', gap: '6px', textDecoration: 'none' }}
                        >
                          <IconDownload /> Download PDF ({sum.fileName})
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* EXPANDED IMAGE PREVIEW MODAL */}
      {expandedImage && (
        <div 
          onClick={() => setExpandedImage(null)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 200,
            cursor: 'zoom-out',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <img 
            src={expandedImage} 
            alt="Preview Ampliado" 
            style={{ maxWidth: '95%', maxHeight: '95%', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.25)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }} 
          />
        </div>
      )}

      {/* DETAILED FLOWER VIEW MODAL */}
      {selectedPlantDetail && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(43,53,49,0.3)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 100,
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
            <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-title)' }}>
              Florescimento Colhido
            </h3>
            
            {renderLargePlant(
              selectedPlantDetail.subjectColor, 
              selectedPlantDetail.wiltCount > 0, 
              selectedPlantDetail.level || getPlantRank(selectedPlantDetail.minutes).level, 
              selectedPlantDetail.seed !== undefined ? selectedPlantDetail.seed : (parseInt(selectedPlantDetail.id?.split('_')[1]) / 1000000000000 || 0.5)
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-primary)', padding: '16px', borderRadius: '16px', border: '1px solid var(--card-border)', textAlign: 'left' }}>
              {(() => {
                const gradeNum = parseFloat(String(selectedPlantDetail.finalGrade || 0).replace(',', '.'));
                const isGolden = selectedPlantDetail.isGolden || gradeNum >= 8.5;
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Matéria:</span>
                      <strong style={{ color: selectedPlantDetail.subjectColor }}>{selectedPlantDetail.subjectName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Espécie / Rank:</span>
                      <strong style={{ color: isGolden ? '#ffd700' : 'var(--text-primary)' }}>
                        {selectedPlantDetail.isConcludedPlant 
                          ? (isGolden ? getLegendaryRankName(selectedPlantDetail.seed, gradeNum, selectedPlantDetail.subjectName) : 'Flor da Vitória Cristalina') 
                          : (selectedPlantDetail.rankName || getPlantRank(selectedPlantDetail.minutes).name)}
                      </strong>
                    </div>
                    {selectedPlantDetail.isConcludedPlant ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Nota de Conclusão:</span>
                        <strong style={{ color: isGolden ? '#ffd700' : 'var(--accent-color)' }}>
                          {selectedPlantDetail.finalGrade || 'Concluída'}
                        </strong>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Tempo Focado:</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{selectedPlantDetail.minutes} minutos</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Colheita:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{selectedPlantDetail.date}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Estado de Foco:</span>
                      <strong style={{ color: selectedPlantDetail.wiltCount > 0 ? '#c75e43' : 'var(--accent-color)' }}>
                        {selectedPlantDetail.wiltCount > 0 ? `${selectedPlantDetail.wiltCount} distração` : 'Foco Pleno'}
                      </strong>
                    </div>
                  </>
                );
              })()}
            </div>

            <p style={{ fontSize: '0.82rem', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {selectedPlantDetail.wiltCount > 0 
                ? '"Até as flores mais fortes às vezes vergam, mas persistem em busca da luz. Continue firme!"'
                : '"O fruto do silêncio é a luz. Cada segundo de atenção nutre a semente do seu saber."'}
            </p>

            <button 
              className="neumorphic-btn accent-btn" 
              onClick={() => setSelectedPlantDetail(null)}
              style={{ padding: '12px', borderRadius: '12px' }}
            >
              Fechar Visualização
            </button>
          </div>
        </div>
      )}

      {/* IN-APP CONFIRMATION MODAL */}
      {confirmModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10005, padding: '16px', animation: 'fadeIn 0.2s ease'
        }}>
          <div className="neumorphic-card" style={{
            width: '100%', maxWidth: '380px', background: 'var(--panel-bg)',
            borderRadius: '24px', padding: '24px', textAlign: 'center',
            border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-flat)',
            display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              {confirmModal.title || 'Confirmar Ação'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              {confirmModal.message}
            </p>

            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '6px' }}>
              <button
                onClick={() => setConfirmModal(null)}
                className="neumorphic-btn"
                style={{ flex: 1, padding: '10px', fontSize: '0.8rem', borderRadius: '12px' }}
              >
                {confirmModal.cancelText || 'Cancelar'}
              </button>
              <button
                onClick={() => {
                  const action = confirmModal.onConfirm;
                  setConfirmModal(null);
                  if (action) action();
                }}
                className="neumorphic-btn accent-btn"
                style={{ flex: 1, padding: '10px', fontSize: '0.8rem', borderRadius: '12px' }}
              >
                {confirmModal.confirmText || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP ALERT MODAL */}
      {alertModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10005, padding: '16px', animation: 'fadeIn 0.2s ease'
        }}>
          <div className="neumorphic-card" style={{
            width: '100%', maxWidth: '380px', background: 'var(--panel-bg)',
            borderRadius: '24px', padding: '24px', textAlign: 'center',
            border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-flat)',
            display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              {alertModal.title || 'Aviso'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              {alertModal.message}
            </p>
            <button
              onClick={() => setAlertModal(null)}
              className="neumorphic-btn accent-btn"
              style={{ width: '100%', padding: '10px', fontSize: '0.8rem', borderRadius: '12px' }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
