// Autor: Antônio Costa Leite
// Provedor de Estado Global e Autenticação (O Santuário)

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db, auth, googleProvider } from '../utils/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithRedirect, 
  signInWithPopup,
  signInWithCredential,
  signInAnonymously,
  getRedirectResult,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { audioSynth } from '../utils/audio';
import { Capacitor } from '@capacitor/core';
import { getPlantRank } from '../utils/plantRenderer';
import { SocialLogin } from '@capgo/capacitor-social-login';

export const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseLocalDate = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const AppContext = createContext();

const defaultState = {
  orvalho: 10,
  streak: 0,
  lastStudyDate: null,
  onboardingCompleted: false,
  subjects: [],
  tasks: [],
  summaries: [],
  gardenDecorations: [],
  settings: {
    mood: 'creative',
    companyMode: true,
    activeTheme: 'light',
    wiltOnDistraction: true,
    gardenLayout: 'organic',
    greenhouseSize: 12,
    slotDisplayStyle: 'focus',
    customTheme: {
      backgroundId: 'light',
      typographyId: 'light',
      textColorId: 'light',
      accentColorId: 'light',
      containerId: 'light',
      plantBiomaId: 'default',
      audioPresetId: 'natureza'
    },
    mixer: {
      master: 0.8,
      rain: 0.3,
      whiteNoise: 0.1,
      piano: 0.4,
      trackIndex: 0
    }
  },
  museumItems: [],
  pendingGuildInvites: [],
  futureLetters: [],
  voiceNotes: [],
  googleSyncActive: false,
  activeGardenSlots: [],
  savedGardenProfiles: [],
  profile: {
    nickname: '',
    avatarId: 'avatar_1',
    title: 'Jardineiro de Santuários',
    shortId: '',
    avatarCustomization: {
      skinColor: '#ffd8b3',
      hairColor: '#4a321a',
      hairId: 'hair_1',
      clothingId: 'clothing_1',
      clothingColor: '#2e633d',
      badgeId: 'badge_none'
    },
    avatarShopItems: ['hair_1', 'clothing_1'],
    muralPrivateToggle: false
  },
  socialStats: {
    isStudying: false,
    lastActive: null
  },
  friends: [],
  alarms: [],
  createdThemes: [],
  copiedThemes: [],
  activeGuild: null,
  coopPlants: [],
  guestbook: []
};

const placeInFirstEmptySlot = (slots, type, itemId, maxSlots = 12) => {
  const occupied = (slots || []).map(s => s.slotIndex);
  let emptyIndex = -1;
  for (let i = 0; i < maxSlots; i++) {
    if (!occupied.includes(i)) {
      emptyIndex = i;
      break;
    }
  }
  if (emptyIndex !== -1) {
    return [...(slots || []), { slotIndex: emptyIndex, type, itemId }];
  }
  return slots || [];
};

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inicializa o plugin nativo SocialLogin na primeira montagem
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      SocialLogin.initialize({
        google: {
          webClientId: '1033192402509-tv3hoevmg5j3r0btnq3b02upkcuh83qi.apps.googleusercontent.com',
        },
      }).catch(e => console.warn('SocialLogin init error:', e));
    }
  }, []);
  
  const [state, setState] = useState(defaultState);
  const [themesCatalogOpen, setThemesCatalogOpen] = useState(false);
  const [mixMatchOpen, setMixMatchOpen] = useState(false);
  const [previewThemeId, setPreviewThemeId] = useState(null);

  // Inicializa o GoogleAuth na plataforma nativa
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      try {
        GoogleAuth.initialize({
          clientId: '1033192402509-c1h8p3h3fch7vch4dcr3n24g723v.apps.googleusercontent.com',
          scopes: ['profile', 'email'],
          grantOfflineAccess: true
        });
      } catch (e) {
        console.warn("GoogleAuth native initialization failed:", e);
      }
    }
  }, []);

  // Trata o resultado de autenticação via redirecionamento
  useEffect(() => {
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        console.log("Redirect login success:", result.user.email);
      }
    }).catch((e) => {
      console.error("Redirect login error:", e);
      setState(prev => ({ ...prev, authError: e.message }));
    });
  }, []);

  const clearAuthError = () => {
    setState(prev => ({ ...prev, authError: null }));
  };

  // Sync auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        // Carrega os dados do usuário a partir do Firestore
        try {
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);
          
          if (docSnap.exists()) {
            const cloudData = docSnap.data();
            
            if (!cloudData.profile?.shortId) {
              const baseName = cloudData.profile?.nickname || user.email?.split('@')[0] || 'Cultivador';
              const derivedTag = user.uid.substring(0, 4).toUpperCase();
              const generatedShortId = `${baseName}#${derivedTag}`;
              
              if (!cloudData.profile) cloudData.profile = {};
              cloudData.profile.shortId = generatedShortId;
              
              if (!cloudData.profile.avatarCustomization) {
                cloudData.profile.avatarCustomization = defaultState.profile.avatarCustomization;
                cloudData.profile.avatarShopItems = defaultState.profile.avatarShopItems;
              }
              await setDoc(userRef, { profile: cloudData.profile }, { merge: true });
            }

            const merged = {
              ...defaultState,
              ...cloudData,
              settings: { ...defaultState.settings, ...cloudData.settings }
            };

            // Targeted cleanup for user tontoncn2@gmail.com (Antônio#6CVU): remove demo/orphan plants with no related subject
            if (user.email?.toLowerCase() === 'tontoncn2@gmail.com' || cloudData.profile?.shortId?.includes('6CVU')) {
              const userSubNames = (merged.subjects || []).map(s => s.name?.toLowerCase()).filter(Boolean);
              const userSubIds = (merged.subjects || []).map(s => s.id).filter(Boolean);

              const cleanMuseum = (merged.museumItems || []).filter(item => {
                if (!item) return false;
                const matchesName = item.subjectName && userSubNames.includes(item.subjectName.toLowerCase());
                const matchesId = item.subjectId && userSubIds.includes(item.subjectId);
                return matchesName || matchesId;
              });

              const cleanMuseumIds = cleanMuseum.map(item => item.id);

              const cleanSlots = (merged.activeGardenSlots || []).filter(slot => {
                if (!slot) return false;
                if (slot.type === 'decoration') return true;
                return cleanMuseumIds.includes(slot.itemId);
              });

              merged.museumItems = cleanMuseum;
              merged.activeGardenSlots = cleanSlots;

              // Grava o estado limpo no Firestore
              setDoc(userRef, { museumItems: cleanMuseum, activeGardenSlots: cleanSlots }, { merge: true }).catch(e => console.warn("Cleanup save error:", e));
            }
            
            setState(prev => {
              const mix = merged.settings.mixer || defaultState.settings.mixer;
              audioSynth.levels = {
                master: mix.master,
                rain: mix.rain,
                whiteNoise: mix.whiteNoise,
                piano: mix.piano
              };
              audioSynth.currentTrackIndex = mix.trackIndex || 0;
              return merged;
            });
            // Cache theme so the loading screen shows correct colours on next visit
            try { localStorage.setItem('santuario_theme', merged.settings.activeTheme || 'light'); } catch(e) {}
            console.log("Santuario data synced for user:", user.email);
            
            // Sync friendships and auto-claim co-op rewards
            syncFriendshipsAndRequests(user);
            claimPendingCoopRewards(user);
          } else {
            // Initial signup - write defaultState with generated shortId to Firestore
            const baseName = user.email?.split('@')[0] || 'Cultivador';
            const derivedTag = user.uid.substring(0, 4).toUpperCase();
            const initialProfile = {
              ...defaultState.profile,
              nickname: baseName,
              shortId: `${baseName}#${derivedTag}`
            };
            const initialDoc = {
              ...defaultState,
              profile: initialProfile
            };
            await setDoc(userRef, initialDoc);
            setState(initialDoc);
            console.log("Initialized new Firestore profiles doc for:", user.email);
          }
        } catch (e) {
          console.warn("Could not sync profile doc from Firestore, using local defaults:", e);
        }
      } else {
        // Logged out
        setCurrentUser(null);
        setState(defaultState);
        audioSynth.stopAll();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Periodically check calendar-time future letters (every 10 seconds)
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      setState(prev => {
        const now = Date.now();
        const totalMinutes = prev.subjects.reduce((sum, s) => sum + s.focusMinutes, 0);
        let hasChanges = false;
        
        const updatedLetters = (prev.futureLetters || []).map(letter => {
          if (!letter.isUnlocked) {
            const studyUnlocked = letter.unlockType !== 'calendar' && totalMinutes >= (letter.unlockMilestone || 0);
            const calendarUnlocked = letter.unlockType === 'calendar' && now >= (letter.unlockDate || 0);
            if (studyUnlocked || calendarUnlocked) {
              hasChanges = true;
              return { ...letter, isUnlocked: true };
            }
          }
          return letter;
        });

        if (hasChanges) {
          const updated = { ...prev, futureLetters: updatedLetters };
          syncToFirebase(updated);
          return updated;
        }
        return prev;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const syncToFirebase = async (newState) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, newState, { merge: true });
      if (newState.activeGuild) {
        await syncUserToGuild(newState.activeGuild, newState);
      }
    } catch (e) {
      console.warn("Firestore sync fail:", e);
    }
  };

  const updateState = (updater) => {
    setState(prev => {
      const updated = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      if (currentUser) {
        syncToFirebase(updated);
      }
      return updated;
    });
  };

  // Auth Operations
  const loginWithEmail = async (email, password) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (e) {
      setLoading(false);
      return { success: false, error: e.message };
    }
  };

  const registerWithEmail = async (email, password) => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (e) {
      setLoading(false);
      return { success: false, error: e.message };
    }
  };

  const loginWithGooglePopup = async () => {
    setLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        // Use @capgo/capacitor-social-login (modern replacement for codetrix)
        const result = await SocialLogin.login({
          provider: 'google',
          options: {
            scopes: ['profile', 'email'],
          },
        });

        const idToken = result?.result?.idToken;
        if (!idToken) {
          throw new Error('Google login retornou sem idToken. Verifique SHA-1 no Firebase.');
        }

        const { GoogleAuthProvider } = await import('firebase/auth');
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
      return { success: true };
    } catch (e) {
      setLoading(false);
      return { success: false, error: e.message || 'Erro desconhecido' };
    }
  };

  const loginWithGoogleRedirect = () => {
    setLoading(true);
    signInWithRedirect(auth, googleProvider).catch((e) => {
      setLoading(false);
      console.error("Google login initiation error:", e);
      setState(prev => ({ ...prev, authError: e.message }));
    });
  };

  const loginAnonymously = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
      return { success: true };
    } catch (e) {
      setLoading(false);
      return { success: false, error: e.message };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      return { success: true };
    } catch (e) {
      setLoading(false);
      return { success: false, error: e.message };
    }
  };

  const sendPasswordReset = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // State Actions
  const addSubject = (name, color, icon = 'book', priority = 3, professor = '', classTimes = [], topics = [], concluded = false, finalGrade = '') => {
    const newSubject = {
      id: 'sub_' + Date.now(),
      name,
      color,
      icon,
      priority: parseInt(priority),
      professor,
      classTimes,
      topics: Array.isArray(topics) ? topics : [],
      concluded: !!concluded,
      finalGrade: finalGrade || '',
      focusMinutes: 0
    };
    updateState(prev => ({
      ...prev,
      subjects: [...prev.subjects, newSubject]
    }));
    return newSubject;
  };

  const addBulkSubjects = (names) => {
    const colors = ['#3d6642', '#a7541f', '#4a805a', '#3f5d75', '#8a4f7d', '#b09e2a', '#b04a4a'];
    const icons = ['book', 'code', 'percent', 'activity', 'compass', 'cpu', 'globe'];
    
    updateState(prev => {
      const newSubjects = names.map((name, index) => ({
        id: 'sub_' + (Date.now() + index),
        name,
        color: colors[index % colors.length],
        icon: icons[index % icons.length],
        priority: 3,
        professor: '',
        classTimes: [],
        topics: [],
        concluded: false,
        finalGrade: '',
        focusMinutes: 0
      }));
      return {
        ...prev,
        subjects: [...prev.subjects, ...newSubjects]
      };
    });
  };

  const handleSubjectConclusionReward = (stateObj, subjectId, targetConcluded, finalGradeVal) => {
    const sub = stateObj.subjects.find(s => s.id === subjectId);
    if (!sub) return stateObj;

    const grade = finalGradeVal !== undefined ? finalGradeVal : (sub.finalGrade || '');
    const gradeNum = parseFloat(String(grade || 0).replace(',', '.'));
    const isGolden = gradeNum >= 8.5;

    const newConcludedPlant = {
      id: 'concluded_plant_' + Date.now(),
      subjectName: sub.name,
      subjectColor: sub.color || '#4a7c59',
      minutes: sub.focusMinutes || 120,
      date: new Date().toLocaleDateString('pt-BR'),
      wiltCount: 0,
      seed: Math.random(),
      isConcludedPlant: true,
      finalGrade: grade,
      isGolden: isGolden,
      rankName: isGolden ? 'Santuário Aurum de Conclusão' : 'Santuário Cristalino de Conclusão',
      level: isGolden ? 6 : 5
    };

    const updatedMuseum = [...(stateObj.museumItems || []), newConcludedPlant];
    const updatedSlots = placeInFirstEmptySlot(stateObj.activeGardenSlots || [], 'plant', newConcludedPlant.id, stateObj.settings?.greenhouseSize || 12);

    return {
      ...stateObj,
      museumItems: updatedMuseum,
      activeGardenSlots: updatedSlots
    };
  };

  const toggleSubjectConcluded = (subjectId) => {
    updateState(prev => {
      const targetSub = prev.subjects.find(s => s.id === subjectId);
      const nextConcluded = !targetSub?.concluded;
      let newState = {
        ...prev,
        subjects: prev.subjects.map(s => s.id === subjectId ? { ...s, concluded: nextConcluded } : s)
      };
      if (nextConcluded) {
        newState = handleSubjectConclusionReward(newState, subjectId, true, targetSub?.finalGrade);
      }
      return newState;
    });
  };

  const deleteSubject = (subjectId) => {
    updateState(prev => {
      const subjects = prev.subjects.filter(s => s.id !== subjectId);
      const summaries = prev.summaries.filter(s => s.subjectId !== subjectId);
      const gardenDecorations = prev.gardenDecorations.filter(d => d.subjectId !== subjectId);
      const tasks = (prev.tasks || []).filter(t => t.subjectId !== subjectId);
      return {
        ...prev,
        subjects,
        summaries,
        gardenDecorations,
        tasks
      };
    });
  };

  const updateSubject = (subjectId, updatedFields) => {
    updateState(prev => {
      const targetSub = prev.subjects.find(s => s.id === subjectId);
      const nextConcluded = updatedFields.concluded !== undefined ? updatedFields.concluded : targetSub?.concluded;
      let newState = {
        ...prev,
        subjects: prev.subjects.map(s => s.id === subjectId ? { ...s, ...updatedFields } : s)
      };
      if (!targetSub?.concluded && nextConcluded) {
        newState = handleSubjectConclusionReward(newState, subjectId, true, updatedFields.finalGrade || targetSub?.finalGrade);
      }
      return newState;
    });
  };

  // --- Topic Management for Subjects ---
  const addTopicToSubject = (subjectId, topicName) => {
    if (!topicName || !topicName.trim()) return;
    const newTopic = {
      id: 'top_' + Date.now(),
      name: topicName.trim(),
      completed: false
    };
    updateState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => {
        if (s.id === subjectId) {
          const currentTopics = s.topics || [];
          return { ...s, topics: [...currentTopics, newTopic] };
        }
        return s;
      })
    }));
  };

  const toggleTopicCompleted = (subjectId, topicId) => {
    updateState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => {
        if (s.id === subjectId) {
          const currentTopics = s.topics || [];
          return {
            ...s,
            topics: currentTopics.map(t => t.id === topicId ? { ...t, completed: !t.completed } : t)
          };
        }
        return s;
      })
    }));
  };

  const deleteTopicFromSubject = (subjectId, topicId) => {
    updateState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => {
        if (s.id === subjectId) {
          const currentTopics = s.topics || [];
          return {
            ...s,
            topics: currentTopics.filter(t => t.id !== topicId)
          };
        }
        return s;
      })
    }));
  };

  // --- Alarm System Actions ---
  const [activeTriggeredAlarm, setActiveTriggeredAlarm] = useState(null);
  const lastTriggeredKeyRef = useRef('');

  const addAlarm = (alarmObj) => {
    const newAlarm = {
      id: 'alarm_' + Date.now(),
      title: alarmObj.title || 'Alarme de Estudo',
      time: alarmObj.time || '08:00',
      type: alarmObj.type || 'daily',
      scheduledDate: alarmObj.scheduledDate || null,
      daysOfWeek: alarmObj.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
      subjectId: alarmObj.subjectId || null,
      enabled: alarmObj.enabled !== undefined ? alarmObj.enabled : true
    };
    updateState(prev => ({
      ...prev,
      alarms: [...(prev.alarms || []), newAlarm]
    }));
    return newAlarm;
  };

  const updateAlarm = (alarmId, updatedFields) => {
    updateState(prev => ({
      ...prev,
      alarms: (prev.alarms || []).map(a => a.id === alarmId ? { ...a, ...updatedFields } : a)
    }));
  };

  const deleteAlarm = (alarmId) => {
    updateState(prev => ({
      ...prev,
      alarms: (prev.alarms || []).filter(a => a.id !== alarmId)
    }));
  };

  const toggleAlarm = (alarmId) => {
    updateState(prev => ({
      ...prev,
      alarms: (prev.alarms || []).map(a => a.id === alarmId ? { ...a, enabled: !a.enabled } : a)
    }));
  };

  const dismissTriggeredAlarm = () => {
    setActiveTriggeredAlarm(null);
  };

  const snoozeTriggeredAlarm = () => {
    if (!activeTriggeredAlarm) return;
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    addAlarm({
      title: `Soneca: ${activeTriggeredAlarm.title}`,
      time: `${h}:${m}`,
      type: 'once',
      scheduledDate: getLocalDateString(),
      enabled: true
    });
    setActiveTriggeredAlarm(null);
  };

  const addFocusMinutes = (subjectId, minutes, wiltCount = 0, seed = null) => {
    updateState(prev => {
      const subjects = prev.subjects.map(sub => {
        if (sub.id === subjectId) {
          return { ...sub, focusMinutes: sub.focusMinutes + minutes };
        }
        return sub;
      });

      const earnedOrvalho = Math.max(1, Math.round(minutes * 0.16));
      
      const todayStr = getLocalDateString();
      let newStreak = prev.streak;
      if (prev.lastStudyDate !== todayStr) {
        if (prev.lastStudyDate) {
          const lastDate = new Date(prev.lastStudyDate);
          const diffDays = Math.ceil(Math.abs(new Date(todayStr) - lastDate) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }
      }

      const activeSubject = prev.subjects.find(s => s.id === subjectId);
      const rank = getPlantRank(minutes);
      const newMuseumItem = {
        id: 'plant_' + Date.now(),
        subjectName: activeSubject ? activeSubject.name : 'Geral',
        subjectColor: activeSubject ? activeSubject.color : '#4a7c59',
        minutes: minutes,
        date: new Date().toLocaleDateString('pt-BR'),
        wiltCount: wiltCount,
        seed: seed !== null ? seed : Math.random(),
        rankName: rank.name,
        level: rank.level
      };

      const totalMinutesPreviously = prev.subjects.reduce((sum, s) => sum + s.focusMinutes, 0);
      const totalMinutesNow = totalMinutesPreviously + minutes;
      const now = Date.now();
      
      const updatedLetters = (prev.futureLetters || []).map(letter => {
        if (!letter.isUnlocked) {
          const studyUnlocked = letter.unlockType !== 'calendar' && totalMinutesNow >= (letter.unlockMilestone || 0);
          const calendarUnlocked = letter.unlockType === 'calendar' && now >= (letter.unlockDate || 0);
          if (studyUnlocked || calendarUnlocked) {
            return { ...letter, isUnlocked: true };
          }
        }
        return letter;
      });

      const currentSlots = prev.activeGardenSlots || [];
      const updatedSlots = placeInFirstEmptySlot(currentSlots, 'plant', newMuseumItem.id, prev.settings?.greenhouseSize || 12);

      return {
        ...prev,
        subjects,
        orvalho: prev.orvalho + earnedOrvalho,
        streak: newStreak,
        lastStudyDate: todayStr,
        museumItems: [...(prev.museumItems || []), newMuseumItem],
        futureLetters: updatedLetters,
        activeGardenSlots: updatedSlots
      };
    });

    // Atualiza o progresso das missões colaborativas no Firestore
    if (currentUser) {
      (async () => {
        try {
          const qCoop = query(
            collection(db, 'coop_missions'),
            where('participantsUids', 'array-contains', currentUser.uid)
          );
          const coopSnap = await getDocs(qCoop);
          coopSnap.forEach(async (missionDoc) => {
            const m = missionDoc.data();
            if (m.status !== 'active') return;
            
            const myPart = (m.participants || []).find(p => p.uid === currentUser.uid);
            if (myPart && myPart.status === 'accepted') {
              const updatedParticipants = m.participants.map(p => {
                if (p.uid === currentUser.uid) {
                  return { ...p, progressMinutes: p.progressMinutes + minutes };
                }
                return p;
              });
              
              const totalProgress = updatedParticipants
                .filter(p => p.status === 'accepted')
                .reduce((sum, p) => sum + p.progressMinutes, 0);
                
              const targetMinutes = m.targetHours * 60;
              const isCompleted = totalProgress >= targetMinutes;
              
              const updateFields = {
                participants: updatedParticipants
              };
              
              if (isCompleted) {
                updateFields.status = 'completed';
                updateFields.completedAt = Date.now();
                
                // Distribute rewards using guestbook for other members
                updatedParticipants.forEach(async (p) => {
                  if (p.status === 'accepted') {
                    if (p.uid === currentUser.uid) {
                      updateState(prev => ({
                        ...prev,
                        orvalho: prev.orvalho + m.rewardOrvalho
                      }));
                    } else {
                      try {
                        await addDoc(collection(db, 'guestbook'), {
                          authorUid: currentUser.uid,
                          authorName: state.profile?.nickname || 'Cultivador',
                          targetUid: p.uid,
                          type: 'coop_reward',
                          detail: `Ganhou ${m.rewardOrvalho} orvalhos na Missão Co-op!`,
                          amount: m.rewardOrvalho,
                          timestamp: Date.now(),
                          isClaimed: false
                        });
                      } catch (err) {
                        console.warn("Could not write reward log for partner:", p.uid, err);
                      }
                    }
                  }
                });
              }
              
              await updateDoc(doc(db, 'coop_missions', missionDoc.id), updateFields);
            }
          });
        } catch (coopErr) {
          console.warn("Could not update co-op missions progress:", coopErr);
        }
      })();
    }
  };

  const addSummary = (subjectId, content, title = 'Resumo', type = 'text', fileName = '', isImported = false) => {
    const newSummary = {
      id: 'sum_' + Date.now(),
      subjectId,
      content,
      title,
      type,
      fileName,
      isImported: !!isImported,
      authorUid: currentUser ? currentUser.uid : null,
      timestamp: new Date().toISOString()
    };
    updateState(prev => ({
      ...prev,
      summaries: [newSummary, ...(prev.summaries || [])]
    }));
    return newSummary;
  };

  const buyDecoration = (type, subjectId, cost) => {
    if (state.orvalho < cost) return false;
    
    const newDec = {
      id: 'dec_' + Date.now(),
      type,
      subjectId,
      x: 15 + Math.random() * 70,
      y: 50 + Math.random() * 35
    };

    updateState(prev => {
      const currentSlots = prev.activeGardenSlots || [];
      const updatedSlots = placeInFirstEmptySlot(currentSlots, 'decoration', newDec.id, prev.settings?.greenhouseSize || 12);
      return {
        ...prev,
        orvalho: prev.orvalho - cost,
        gardenDecorations: [...prev.gardenDecorations, newDec],
        activeGardenSlots: updatedSlots
      };
    });
    return true;
  };

  const setTheme = (theme) => {
    try { localStorage.setItem('santuario_theme', theme); } catch(e) {}
    updateState(prev => ({
      ...prev,
      settings: { ...prev.settings, activeTheme: theme }
    }));
  };

  const updateCustomTheme = (key, value) => {
    updateState(prev => {
      const customTheme = {
        backgroundId: 'light',
        typographyId: 'light',
        textColorId: 'light',
        accentColorId: 'light',
        containerId: 'light',
        plantBiomaId: 'default',
        audioPresetId: 'natureza',
        ...(prev.settings?.customTheme || {}),
        [key]: value
      };
      return {
        ...prev,
        settings: {
          ...prev.settings,
          activeTheme: 'custom',
          customTheme
        }
      };
    });
  };

  const setMood = (mood) => {
    updateState(prev => ({
      ...prev,
      settings: { ...prev.settings, mood }
    }));
  };

  const toggleCompanyMode = () => {
    updateState(prev => ({
      ...prev,
      settings: { ...prev.settings, companyMode: !prev.settings.companyMode }
    }));
  };

  const toggleWiltOnDistraction = () => {
    updateState(prev => ({
      ...prev,
      settings: { ...prev.settings, wiltOnDistraction: !prev.settings.wiltOnDistraction }
    }));
  };

  const updateMixerVolume = (channel, val) => {
    const vol = parseFloat(val);
    audioSynth.setVolume(channel, vol);
    updateState(prev => {
      const mixer = { ...prev.settings.mixer, [channel]: vol };
      return {
        ...prev,
        settings: { ...prev.settings, mixer }
      };
    });
  };

  const nextTrack = () => {
    audioSynth.changeTrack();
    updateState(prev => {
      const mixer = { ...prev.settings.mixer, trackIndex: audioSynth.currentTrackIndex };
      return {
        ...prev,
        settings: { ...prev.settings, mixer }
      };
    });
  };

  const addFutureLetter = (content, quantity, unit = 'minutes', unlockType = 'study') => {
    const currentTotalMinutes = state.subjects.reduce((sum, s) => sum + s.focusMinutes, 0);
    
    let durationMinutes = parseInt(quantity);
    let durationMs = parseInt(quantity) * 60 * 1000;

    if (unit === 'hours') {
      durationMinutes = quantity * 60;
      durationMs = quantity * 60 * 60 * 1000;
    } else if (unit === 'days') {
      durationMinutes = quantity * 24 * 60;
      durationMs = quantity * 24 * 60 * 60 * 1000;
    } else if (unit === 'months') {
      durationMinutes = quantity * 30 * 24 * 60;
      durationMs = quantity * 30 * 24 * 60 * 60 * 1000;
    }

    const newLetter = {
      id: 'letter_' + Date.now(),
      content,
      dateCreated: new Date().toLocaleDateString('pt-BR'),
      unlockType,
      unit,
      quantity: parseInt(quantity),
      unlockMilestone: unlockType === 'study' ? (currentTotalMinutes + durationMinutes) : null,
      unlockDate: unlockType === 'calendar' ? (Date.now() + durationMs) : null,
      isUnlocked: false
    };
    updateState(prev => ({
      ...prev,
      futureLetters: [...(prev.futureLetters || []), newLetter]
    }));
  };

  const addVoiceNote = (subjectId, audioUrl, duration) => {
    const newNote = {
      id: 'voice_' + Date.now(),
      subjectId,
      audioUrl,
      duration,
      dateCreated: new Date().toLocaleDateString('pt-BR')
    };
    updateState(prev => ({
      ...prev,
      voiceNotes: [...(prev.voiceNotes || []), newNote]
    }));
  };

  const addTask = (title, subjectId, type, date, time, recurringWeekly = false, fromGoogleSync = false) => {
    const newTask = {
      id: 'task_' + Date.now(),
      title,
      subjectId,
      type,
      date,
      time,
      completed: false,
      recurringWeekly,
      fromGoogleSync
    };
    updateState(prev => ({
      ...prev,
      tasks: [...(prev.tasks || []), newTask]
    }));
  };

  const updateTask = (taskId, updatedFields) => {
    updateState(prev => ({
      ...prev,
      tasks: (prev.tasks || []).map(t => t.id === taskId ? { ...t, ...updatedFields } : t)
    }));
  };

  const deleteTask = (taskId) => {
    updateState(prev => ({
      ...prev,
      tasks: (prev.tasks || []).filter(t => t.id !== taskId)
    }));
  };

  const toggleTaskCompleted = (taskId) => {
    updateState(prev => ({
      ...prev,
      tasks: (prev.tasks || []).map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    }));
  };

  const deleteVoiceNote = (noteId) => {
    updateState(prev => ({
      ...prev,
      voiceNotes: (prev.voiceNotes || []).filter(n => n.id !== noteId)
    }));
  };

  const deleteSummary = async (summaryId) => {
    const targetSum = (state.summaries || []).find(s => s.id === summaryId);
    if (targetSum && targetSum.isShared) {
      await unshareSummary(summaryId);
    }
    updateState(prev => ({
      ...prev,
      summaries: (prev.summaries || []).filter(s => s.id !== summaryId)
    }));
  };

  const disconnectGoogleSync = (removeTasks) => {
    localStorage.removeItem('google_calendar_access_token');
    updateState(prev => {
      const updatedTasks = removeTasks 
        ? (prev.tasks || []).filter(t => !t.fromGoogleSync)
        : prev.tasks;
      return {
        ...prev,
        googleSyncActive: false,
        tasks: updatedTasks
      };
    });
  };

  const setGoogleSyncActive = (active) => {
    updateState(prev => ({
      ...prev,
      googleSyncActive: active
    }));
  };

  const setGardenLayout = (layout) => {
    updateState(prev => ({
      ...prev,
      settings: { ...prev.settings, gardenLayout: layout }
    }));
  };

  const updateGardenSlots = (slots) => {
    updateState(prev => ({
      ...prev,
      activeGardenSlots: slots
    }));
  };

  const saveGardenProfile = (name) => {
    const newProfile = {
      id: 'profile_' + Date.now(),
      name,
      slots: state.activeGardenSlots || []
    };
    updateState(prev => ({
      ...prev,
      savedGardenProfiles: [...(prev.savedGardenProfiles || []), newProfile]
    }));
  };

  const loadGardenProfile = (profileId) => {
    updateState(prev => {
      const profile = (prev.savedGardenProfiles || []).find(p => p.id === profileId);
      if (profile) {
        return {
          ...prev,
          activeGardenSlots: profile.slots
        };
      }
      return prev;
    });
  };

  const deleteGardenProfile = (profileId) => {
    updateState(prev => ({
      ...prev,
      savedGardenProfiles: (prev.savedGardenProfiles || []).filter(p => p.id !== profileId)
    }));
  };

  const renameGardenProfile = (profileId, newName) => {
    updateState(prev => ({
      ...prev,
      savedGardenProfiles: (prev.savedGardenProfiles || []).map(p => p.id === profileId ? { ...p, name: newName } : p)
    }));
  };

  const setGreenhouseSize = (size) => {
    updateState(prev => {
      const filteredSlots = (prev.activeGardenSlots || []).filter(s => s.slotIndex < size);
      return {
        ...prev,
        activeGardenSlots: filteredSlots,
        settings: { ...prev.settings, greenhouseSize: size }
      };
    });
  };

  const setSlotDisplayStyle = (style) => {
    updateState(prev => ({
      ...prev,
      settings: { ...prev.settings, slotDisplayStyle: style }
    }));
  };

  const completeOnboarding = (subjectsList, tasksList, settingsConfig) => {
    updateState(prev => ({
      ...prev,
      subjects: subjectsList,
      tasks: tasksList,
      settings: { ...prev.settings, ...settingsConfig },
      onboardingCompleted: true
    }));
  };

  const updateProfile = (profileData) => {
    updateState(prev => {
      const updated = {
        ...prev,
        profile: { ...(prev.profile || {}), ...profileData }
      };
      syncToFirebase(updated);
      return updated;
    });
  };

  const syncFriendshipsAndRequests = async (user = currentUser) => {
    if (!user) return;
    try {
      const q1 = query(collection(db, 'friendships'), where('uid1', '==', user.uid));
      const q2 = query(collection(db, 'friendships'), where('uid2', '==', user.uid));
      
      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      
      const allFriendships = [];
      snap1.forEach(doc => allFriendships.push({ id: doc.id, ...doc.data() }));
      snap2.forEach(doc => allFriendships.push({ id: doc.id, ...doc.data() }));
      
      const accepted = allFriendships.filter(f => f.status === 'accepted');
      const pendingReceived = allFriendships.filter(f => f.status === 'pending' && f.receiverUid === user.uid);
      const pendingSent = allFriendships.filter(f => f.status === 'pending' && f.senderUid === user.uid);
      
      const resolvedFriends = [];
      for (const fs of accepted) {
        const friendUid = fs.uid1 === user.uid ? fs.uid2 : fs.uid1;
        try {
          const friendDoc = await getDoc(doc(db, 'users', friendUid));
          if (friendDoc.exists()) {
            const fd = friendDoc.data();
            resolvedFriends.push({
              uid: friendUid,
              nickname: fd.profile?.nickname || fd.nickname || 'Cultivador',
              avatarCustomization: fd.profile?.avatarCustomization || {},
              title: fd.profile?.title || 'Estudante',
              isStudying: fd.socialStats?.isStudying || false,
              focusMinutes: fd.focusMinutes || fd.subjects?.reduce((sum, s) => sum + s.focusMinutes, 0) || 0
            });
          } else {
            const isUid1 = fs.uid1 === friendUid;
            resolvedFriends.push({
              uid: friendUid,
              nickname: isUid1 ? (fs.nickname1 || 'Cultivador') : (fs.nickname2 || 'Cultivador'),
              avatarCustomization: isUid1 ? (fs.avatarCustomization1 || {}) : (fs.avatarCustomization2 || {}),
              title: isUid1 ? (fs.title1 || 'Estudante') : (fs.title2 || 'Estudante'),
              isStudying: isUid1 ? (fs.isStudying1 || false) : (fs.isStudying2 || false),
              focusMinutes: 0
            });
          }
        } catch (err) {
          console.warn("Could not fetch profile for friend:", friendUid, err);
        }
      }
      
      updateState(prev => ({
        ...prev,
        friends: resolvedFriends,
        pendingFriendRequests: pendingReceived,
        sentFriendRequests: pendingSent
      }));

      await syncGuildInvites(user);
    } catch (e) {
      console.warn("Error syncing friendships:", e);
    }
  };

  const claimPendingCoopRewards = async (user = currentUser) => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'guestbook'),
        where('targetUid', '==', user.uid),
        where('type', '==', 'coop_reward'),
        where('isClaimed', '==', false)
      );
      const snap = await getDocs(q);
      let totalClaimed = 0;
      const claimPromises = [];
      
      snap.forEach(docSnap => {
        totalClaimed += docSnap.data().amount || 0;
        claimPromises.push(updateDoc(doc(db, 'guestbook', docSnap.id), { isClaimed: true }));
      });
      
      if (totalClaimed > 0) {
        await Promise.all(claimPromises);
        updateState(prev => ({
          ...prev,
          orvalho: prev.orvalho + totalClaimed
        }));
        alert(`Você coletou ${totalClaimed} Orvalhos acumulados de missões co-op concluídas!`);
      }
    } catch (e) {
      console.warn("Error claiming coop rewards:", e);
    }
  };

  const addFriend = async (friendUidOrShortId) => {
    try {
      if (!currentUser) return { success: false, error: "Usuário não autenticado." };
      
      let targetUid = friendUidOrShortId.trim();
      let targetData = null;
      
      if (targetUid.includes('#')) {
        const q = query(collection(db, 'users'), where('profile.shortId', '==', targetUid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          targetUid = snap.docs[0].id;
          targetData = snap.docs[0].data();
        } else {
          return { success: false, error: "Nickname#Tag não encontrado." };
        }
      } else {
        const friendRef = doc(db, 'users', targetUid);
        const docSnap = await getDoc(friendRef);
        if (docSnap.exists()) {
          targetData = docSnap.data();
        } else {
          return { success: false, error: "UID de usuário não encontrado." };
        }
      }
      
      if (targetUid === currentUser.uid) {
        return { success: false, error: "Você não pode adicionar a si mesmo." };
      }
      
      const uidA = currentUser.uid;
      const uidB = targetUid;
      const docId = uidA < uidB ? `${uidA}_${uidB}` : `${uidB}_${uidA}`;
      
      const friendshipRef = doc(db, 'friendships', docId);
      const fsSnap = await getDoc(friendshipRef);
      
      if (fsSnap.exists()) {
        const fsData = fsSnap.data();
        if (fsData.status === 'accepted') {
          return { success: false, error: "Vocês já são amigos." };
        }
        if (fsData.status === 'pending') {
          if (fsData.senderUid === currentUser.uid) {
            return { success: false, error: "Solicitação já enviada e pendente." };
          } else {
            await updateDoc(friendshipRef, {
              status: 'accepted',
              acceptedAt: Date.now()
            });
            await syncFriendshipsAndRequests(currentUser);
            return { success: true, message: `Você aceitou a amizade de ${targetData.profile?.nickname || 'Cultivador'}!` };
          }
        }
      } else {
        const myName = state.profile?.nickname || 'Cultivador';
        const targetName = targetData.profile?.nickname || 'Cultivador';
        
        await setDoc(friendshipRef, {
          uid1: uidA < uidB ? uidA : uidB,
          uid2: uidA < uidB ? uidB : uidA,
          senderUid: uidA,
          senderName: myName,
          receiverUid: uidB,
          receiverName: targetName,
          status: 'pending',
          timestamp: Date.now(),
          avatarCustomization1: uidA < uidB ? (state.profile?.avatarCustomization || {}) : (targetData.profile?.avatarCustomization || {}),
          avatarCustomization2: uidA < uidB ? (targetData.profile?.avatarCustomization || {}) : (state.profile?.avatarCustomization || {}),
          title1: uidA < uidB ? (state.profile?.title || 'Estudante') : (targetData.profile?.title || 'Estudante'),
          title2: uidA < uidB ? (targetData.profile?.title || 'Estudante') : (state.profile?.title || 'Estudante')
        });
        
        await syncFriendshipsAndRequests(currentUser);
        return { success: true, message: "Solicitação de amizade enviada com sucesso!" };
      }
    } catch (err) {
      console.error("Error in addFriend:", err);
      return { success: false, error: err.message };
    }
  };

  const acceptFriendRequest = async (friendshipId) => {
    try {
      const docRef = doc(db, 'friendships', friendshipId);
      await setDoc(docRef, {
        status: 'accepted',
        acceptedAt: Date.now()
      }, { merge: true });

      // Optimistically update local state
      updateState(prev => {
        const acceptedReq = (prev.pendingFriendRequests || []).find(r => r.id === friendshipId);
        const newPending = (prev.pendingFriendRequests || []).filter(r => r.id !== friendshipId);
        let newFriends = [...(prev.friends || [])];

        if (acceptedReq) {
          const friendUid = acceptedReq.senderUid;
          if (!newFriends.some(f => f.uid === friendUid)) {
            newFriends.push({
              uid: friendUid,
              nickname: acceptedReq.senderName || 'Cultivador',
              avatarCustomization: acceptedReq.avatarCustomization1 || {},
              title: acceptedReq.title1 || 'Estudante',
              isStudying: false,
              focusMinutes: 0
            });
          }
        }

        return {
          ...prev,
          friends: newFriends,
          pendingFriendRequests: newPending
        };
      });

      await syncFriendshipsAndRequests(currentUser);
      return true;
    } catch (e) {
      console.error("Error accepting friendship request:", e);
      return false;
    }
  };

  const declineFriendRequest = async (friendshipId) => {
    try {
      const docRef = doc(db, 'friendships', friendshipId);
      await deleteDoc(docRef);
      updateState(prev => ({
        ...prev,
        pendingFriendRequests: (prev.pendingFriendRequests || []).filter(r => r.id !== friendshipId)
      }));
      await syncFriendshipsAndRequests(currentUser);
      return true;
    } catch (e) {
      console.error("Error declining friendship request:", e);
      return false;
    }
  };

  const removeFriendObj = async (friendUid) => {
    try {
      const uidA = currentUser.uid;
      const uidB = friendUid;
      const docId = uidA < uidB ? `${uidA}_${uidB}` : `${uidB}_${uidA}`;
      await deleteDoc(doc(db, 'friendships', docId));
      await syncFriendshipsAndRequests(currentUser);
      return true;
    } catch (e) {
      console.error("Error removing friend:", e);
      return false;
    }
  };

  const saveCustomThemePreset = (themeName, themeConfig) => {
    const newTheme = {
      id: 'theme_' + Date.now(),
      name: themeName,
      downloadCount: 0,
      config: themeConfig
    };
    updateState(prev => {
      const updated = {
        ...prev,
        createdThemes: [...(prev.createdThemes || []), newTheme]
      };
      syncToFirebase(updated);
      return updated;
    });
  };

  const joinGuildGroup = async (guildId) => {
    try {
      const guildRef = doc(db, 'guilds', guildId);
      const guildSnap = await getDoc(guildRef);
      if (!guildSnap.exists()) {
        return { success: false, error: "Guilda não encontrada." };
      }
      const gData = guildSnap.data();
      const members = gData.members || [];
      
      if (!members.some(m => m.uid === currentUser.uid)) {
        const slots = state.activeGardenSlots || [];
        const plantsWithDetails = slots
          .filter(s => s.type === 'plant')
          .map(s => (state.museumItems || []).find(p => p.id === s.itemId))
          .filter(Boolean);

        let topPlantInfo = { name: 'Broto', level: 1, hours: 0, color: '#4a7c59', seed: 0.5, wilted: false };
        if (plantsWithDetails.length > 0) {
          const sorted = [...plantsWithDetails].sort((a, b) => {
            const lvlB = b.level || 1;
            const lvlA = a.level || 1;
            if (lvlB !== lvlA) return lvlB - lvlA;
            return (b.minutes || 0) - (a.minutes || 0);
          });
          topPlantInfo = {
            name: sorted[0].subjectName || 'Geral',
            level: sorted[0].level || 1,
            hours: Number(((sorted[0].minutes || 0) / 60).toFixed(1)),
            color: sorted[0].subjectColor || '#4a7c59',
            seed: sorted[0].seed || 0.5,
            wilted: sorted[0].wiltCount > 0
          };
        }

        const userFocusMinutes = state.subjects?.reduce((sum, s) => sum + s.focusMinutes, 0) || 0;
        const newMember = {
          uid: currentUser.uid,
          nickname: state.profile?.nickname || 'Cultivador',
          title: state.profile?.title || 'Jardineiro de Santuários',
          avatarCustomization: state.profile?.avatarCustomization || defaultState.profile.avatarCustomization,
          topPlant: topPlantInfo,
          focusMinutes: userFocusMinutes
        };

        const updatedMembers = [...members, newMember];
        const newTotal = updatedMembers.reduce((sum, m) => sum + (m.focusMinutes || 0), 0);

        await setDoc(guildRef, { 
          members: updatedMembers,
          totalFocusMinutes: newTotal
        }, { merge: true });
      }

      updateState(prev => {
        const updated = {
          ...prev,
          activeGuild: guildId
        };
        syncToFirebase(updated);
        return updated;
      });
      return { success: true };
    } catch (e) {
      console.error("Error joining guild:", e);
      return { success: false, error: e.message };
    }
  };

  const syncUserToGuild = async (currentGuildId, updatedState = state) => {
    if (!currentGuildId || !currentUser) return;
    try {
      const guildRef = doc(db, 'guilds', currentGuildId);
      const guildSnap = await getDoc(guildRef);
      if (guildSnap.exists()) {
        const gData = guildSnap.data();
        const members = gData.members || [];
        const index = members.findIndex(m => m.uid === currentUser.uid);
        if (index !== -1) {
          const slots = updatedState.activeGardenSlots || [];
          const plantsWithDetails = slots
            .filter(s => s.type === 'plant')
            .map(s => (updatedState.museumItems || []).find(p => p.id === s.itemId))
            .filter(Boolean);

          let topPlantInfo = { name: 'Broto', level: 1, hours: 0, color: '#4a7c59', seed: 0.5, wilted: false };
          if (plantsWithDetails.length > 0) {
            const sorted = [...plantsWithDetails].sort((a, b) => {
              const isGoldB = b.isGolden || (b.isConcludedPlant && parseFloat(String(b.finalGrade || 0).replace(',', '.')) >= 8.5) ? 100 : 0;
              const isGoldA = a.isGolden || (a.isConcludedPlant && parseFloat(String(a.finalGrade || 0).replace(',', '.')) >= 8.5) ? 100 : 0;
              if (isGoldB !== isGoldA) return isGoldB - isGoldA;
              const lvlB = b.level || 1;
              const lvlA = a.level || 1;
              if (lvlB !== lvlA) return lvlB - lvlA;
              return (b.minutes || 0) - (a.minutes || 0);
            });
            const best = sorted[0];
            const gradeNum = parseFloat(String(best.finalGrade || 0).replace(',', '.'));
            const isConcluded = Boolean(best.isConcludedPlant || best.id?.startsWith('concluded_plant_'));
            const isGolden = Boolean(best.isGolden || (isConcluded && gradeNum >= 8.5));

            topPlantInfo = {
              name: best.subjectName || 'Geral',
              level: best.level || 1,
              hours: Number(((best.minutes || 0) / 60).toFixed(1)),
              color: best.subjectColor || '#4a7c59',
              seed: best.seed || 0.5,
              wilted: best.wiltCount > 0,
              isConcludedPlant: isConcluded,
              isGolden: isGolden,
              finalGrade: best.finalGrade || ''
            };
          }

          const userFocusMinutes = updatedState.subjects?.reduce((sum, s) => sum + s.focusMinutes, 0) || 0;
          const oldMember = members[index];
          const newMember = {
            ...oldMember,
            nickname: updatedState.profile?.nickname || 'Cultivador',
            title: updatedState.profile?.title || 'Jardineiro de Santuários',
            avatarCustomization: updatedState.profile?.avatarCustomization || oldMember.avatarCustomization,
            topPlant: topPlantInfo,
            focusMinutes: userFocusMinutes
          };

          const updatedMembers = [...members];
          updatedMembers[index] = newMember;

          const newTotal = updatedMembers.reduce((sum, m) => sum + (m.focusMinutes || 0), 0);

          await setDoc(guildRef, {
            members: updatedMembers,
            totalFocusMinutes: newTotal
          }, { merge: true });
        }
      }
    } catch (e) {
      console.warn("Could not sync user to guild:", e);
    }
  };

  const shareSummary = async (summaryObj) => {
    if (!currentUser) return { success: false, error: "Usuário não autenticado." };
    if (summaryObj.isImported) return { success: false, error: "Resumos importados de outros usuários não podem ser republicados." };
    try {
      const sub = state.subjects.find(s => s.id === summaryObj.subjectId);
      const sharedDoc = {
        originalId: summaryObj.id,
        title: summaryObj.title || 'Resumo',
        content: summaryObj.content || '',
        type: summaryObj.type || 'text',
        fileName: summaryObj.fileName || '',
        subjectName: sub ? sub.name : 'Geral',
        subjectColor: sub ? sub.color : '#4a7c59',
        authorUid: currentUser.uid,
        authorName: state.profile?.nickname || 'Jardineiro',
        timestamp: summaryObj.timestamp || new Date().toISOString(),
        sharedAt: Date.now(),
        likes: 0,
        likedBy: []
      };
      
      const docRef = await addDoc(collection(db, 'shared_summaries'), sharedDoc);
      
      updateState(prev => {
        const updatedSummaries = (prev.summaries || []).map(s => 
          s.id === summaryObj.id ? { ...s, isShared: true, sharedDocId: docRef.id } : s
        );
        return { ...prev, summaries: updatedSummaries };
      });
      
      return { success: true };
    } catch (e) {
      console.error("Error sharing summary:", e);
      return { success: false, error: e.message };
    }
  };

  const unshareSummary = async (summaryId) => {
    try {
      const q = query(
        collection(db, 'shared_summaries'),
        where('originalId', '==', summaryId),
        where('authorUid', '==', currentUser.uid)
      );
      const snap = await getDocs(q);
      const promises = [];
      snap.forEach(d => {
        promises.push(deleteDoc(d.ref));
      });
      await Promise.all(promises);
      
      updateState(prev => {
        const updatedSummaries = (prev.summaries || []).map(s => 
          s.id === summaryId ? { ...s, isShared: false } : s
        );
        return { ...prev, summaries: updatedSummaries };
      });
      return true;
    } catch (e) {
      console.error("Error unsharing summary:", e);
      return false;
    }
  };

  const deleteSharedSummaryDirectly = async (sharedDocId) => {
    try {
      const docRef = doc(db, 'shared_summaries', sharedDocId);
      await deleteDoc(docRef);
      return true;
    } catch (e) {
      console.error("Error deleting shared summary directly:", e);
      return false;
    }
  };

  // Detach a guild whose Firestore document was never saved (creation failed silently).
  // Refunds the 50 orvalho cost so the user can try again.
  const detachBrokenGuild = () => {
    updateState(prev => {
      const updated = {
        ...prev,
        activeGuild: null,
        orvalho: (prev.orvalho || 0) + 50  // refund
      };
      syncToFirebase(updated);
      return updated;
    });
  };

  const sendSocialReaction = async (targetUid, reactionType) => {
    const entry = {
      targetUid,
      senderName: state.profile?.nickname || currentUser?.email?.split('@')[0] || 'Um Visitante',
      type: 'reaction',
      detail: reactionType,
      timestamp: Date.now()
    };
    try {
      await addDoc(collection(db, 'guestbook'), entry);
    } catch (e) {
      console.warn("Could not save reaction to Firestore:", e);
    }
  };

  const sendCloneNotification = async (targetUid, themeName) => {
    const entry = {
      targetUid,
      senderName: state.profile?.nickname || currentUser?.email?.split('@')[0] || 'Um Visitante',
      type: 'clone',
      detail: themeName,
      timestamp: Date.now()
    };
    try {
      await addDoc(collection(db, 'guestbook'), entry);
      const targetRef = doc(db, 'users', targetUid);
      const targetDoc = await getDoc(targetRef);
      if (targetDoc.exists()) {
        const targetData = targetDoc.data();
        const updatedThemes = (targetData.createdThemes || []).map(t => {
          if (t.name === themeName) {
            return { ...t, downloadCount: (t.downloadCount || 0) + 1 };
          }
          return t;
        });
        await setDoc(targetRef, { createdThemes: updatedThemes }, { merge: true });
      }
    } catch (e) {
      console.warn("Could not sync clone notification to Firestore:", e);
    }
  };

  const setStudyingStatus = (isStudying) => {
    updateState(prev => {
      const socialStats = {
        isStudying,
        lastActive: Date.now()
      };
      const updated = { ...prev, socialStats };
      syncToFirebase(updated);
      return updated;
    });
  };

  const createCoopSession = (friendUid, plantType) => {
    const newCoop = {
      id: 'coop_' + currentUser.uid + '_' + friendUid,
      players: [currentUser.uid, friendUid],
      plantType,
      progress: 0,
      level: 1,
      lastUpdate: Date.now()
    };
    updateState(prev => {
      const updated = {
        ...prev,
        coopPlants: [...(prev.coopPlants || []), newCoop]
      };
      syncToFirebase(updated);
      return updated;
    });
  };

  const addCoopProgress = (coopId, minutes) => {
    updateState(prev => {
      const updatedCoop = (prev.coopPlants || []).map(c => {
        if (c.id === coopId) {
          const newProgress = c.progress + minutes * 2;
          const newLevel = Math.min(5, Math.floor(newProgress / 100) + 1);
          return {
            ...c,
            progress: newProgress % 100,
            level: newLevel,
            lastUpdate: Date.now()
          };
        }
        return c;
      });
      const updated = { ...prev, coopPlants: updatedCoop };
      syncToFirebase(updated);
      return updated;
    });
  };

  const deleteCreatedTheme = (themeId) => {
    updateState(prev => {
      const updated = {
        ...prev,
        createdThemes: (prev.createdThemes || []).filter(t => t.id !== themeId)
      };
      syncToFirebase(updated);
      return updated;
    });
  };

  const deleteCopiedTheme = (themeId) => {
    updateState(prev => {
      const updated = {
        ...prev,
        copiedThemes: (prev.copiedThemes || []).filter(t => t.id !== themeId)
      };
      syncToFirebase(updated);
      return updated;
    });
  };

  const saveCopiedTheme = (themeName, themeConfig, authorUid) => {
    const newTheme = {
      id: 'copied_' + Date.now(),
      name: themeName,
      config: themeConfig,
      authorUid
    };
    updateState(prev => {
      const updated = {
        ...prev,
        copiedThemes: [...(prev.copiedThemes || []), newTheme]
      };
      syncToFirebase(updated);
      return updated;
    });
  };

  const buyAvatarShopItem = (itemId, cost) => {
    if (state.orvalho < cost) return false;
    updateState(prev => {
      const currentItems = prev.profile?.avatarShopItems || ['hair_1', 'clothing_1'];
      if (currentItems.includes(itemId)) return prev;
      const updated = {
        ...prev,
        orvalho: prev.orvalho - cost,
        profile: {
          ...prev.profile,
          avatarShopItems: [...currentItems, itemId]
        }
      };
      syncToFirebase(updated);
      return updated;
    });
    return true;
  };

  const updateAvatarCustomization = (newCustomization) => {
    updateState(prev => {
      const updated = {
        ...prev,
        profile: {
          ...prev.profile,
          avatarCustomization: {
            ...(prev.profile?.avatarCustomization || defaultState.profile.avatarCustomization),
            ...newCustomization
          }
        }
      };
      syncToFirebase(updated);
      return updated;
    });
  };

  const toggleMuralComments = (disabled) => {
    updateState(prev => {
      const updated = {
        ...prev,
        profile: {
          ...prev.profile,
          muralPrivateToggle: disabled
        }
      };
      syncToFirebase(updated);
      return updated;
    });
  };

  const proposeCustomCoopMission = async (partnerUid, partnerName, targetHours, deadlineHours) => {
    const rewardOrvalho = Math.round(targetHours * 12 * (1 + 48 / deadlineHours));
    const newMission = {
      creatorUid: currentUser.uid,
      creatorName: state.profile?.nickname || 'Cultivador',
      partnerUid,
      partnerName,
      targetHours,
      deadlineHours,
      rewardOrvalho,
      status: 'pending',
      createdAt: Date.now(),
      creatorProgressMinutes: 0,
      partnerProgressMinutes: 0
    };
    try {
      await addDoc(collection(db, 'coop_missions'), newMission);
      return true;
    } catch (e) {
      console.error("Error creating custom co-op mission:", e);
      return false;
    }
  };

  const acceptCustomCoopMission = async (missionId) => {
    try {
      const docRef = doc(db, 'coop_missions', missionId);
      await setDoc(docRef, { status: 'active', acceptedAt: Date.now() }, { merge: true });
      return true;
    } catch (e) {
      console.error("Error accepting custom co-op mission:", e);
      return false;
    }
  };

  const rejectCustomCoopMission = async (missionId) => {
    try {
      const docRef = doc(db, 'coop_missions', missionId);
      await setDoc(docRef, { status: 'rejected' }, { merge: true });
      return true;
    } catch (e) {
      console.error("Error rejecting custom co-op mission:", e);
      return false;
    }
  };

  const createCustomGuild = async (name, tag, description, bannerColor, bannerIcon) => {
    if (state.orvalho < 50) return { success: false, error: "Orvalho insuficiente (Necessário 50)." };
    const guildId = 'guild_' + Date.now();
    
    const slots = state.activeGardenSlots || [];
    const plantsWithDetails = slots
      .filter(s => s.type === 'plant')
      .map(s => (state.museumItems || []).find(p => p.id === s.itemId))
      .filter(Boolean);

    let topPlantInfo = { name: 'Broto', level: 1, hours: 0, color: '#4a7c59', seed: 0.5, wilted: false };
    if (plantsWithDetails.length > 0) {
      const sorted = [...plantsWithDetails].sort((a, b) => {
        const lvlB = b.level || 1;
        const lvlA = a.level || 1;
        if (lvlB !== lvlA) return lvlB - lvlA;
        return (b.minutes || 0) - (a.minutes || 0);
      });
      topPlantInfo = {
        name: sorted[0].subjectName || 'Geral',
        level: sorted[0].level || 1,
        hours: Number(((sorted[0].minutes || 0) / 60).toFixed(1)),
        color: sorted[0].subjectColor || '#4a7c59',
        seed: sorted[0].seed || 0.5,
        wilted: sorted[0].wiltCount > 0
      };
    }

    const userFocusMinutes = state.subjects?.reduce((sum, s) => sum + s.focusMinutes, 0) || 0;

    const newGuildObj = {
      id: guildId,
      name,
      tag: tag.substring(0, 4).toUpperCase(),
      description,
      bannerColor,
      bannerIcon,
      leaderUid: currentUser.uid,
      leaderName: state.profile?.nickname || 'Cultivador',
      members: [{
        uid: currentUser.uid,
        nickname: state.profile?.nickname || 'Cultivador',
        title: state.profile?.title || 'Jardineiro de Santuários',
        avatarCustomization: state.profile?.avatarCustomization || defaultState.profile.avatarCustomization,
        topPlant: topPlantInfo,
        focusMinutes: userFocusMinutes
      }],
      totalFocusMinutes: userFocusMinutes
    };

    try {
      await setDoc(doc(db, 'guilds', guildId), newGuildObj);
      updateState(prev => {
        const updated = {
          ...prev,
          orvalho: prev.orvalho - 50,
          activeGuild: guildId
        };
        syncToFirebase(updated);
        return updated;
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const leaveGuildGroup = async (guildId) => {
    try {
      const guildRef = doc(db, 'guilds', guildId);
      const guildSnap = await getDoc(guildRef);
      if (guildSnap.exists()) {
        const gData = guildSnap.data();
        let updatedMembers = (gData.members || []).filter(m => m.uid !== currentUser.uid);
        
        if (updatedMembers.length === 0) {
          await setDoc(guildRef, { members: [], totalFocusMinutes: 0 }, { merge: true });
        } else {
          let updatedLeaderUid = gData.leaderUid;
          let updatedLeaderName = gData.leaderName;
          if (gData.leaderUid === currentUser.uid) {
            updatedLeaderUid = updatedMembers[0].uid;
            updatedLeaderName = updatedMembers[0].nickname;
          }
          const newTotal = updatedMembers.reduce((sum, m) => sum + (m.focusMinutes || 0), 0);
          await setDoc(guildRef, {
            members: updatedMembers,
            leaderUid: updatedLeaderUid,
            leaderName: updatedLeaderName,
            totalFocusMinutes: newTotal
          }, { merge: true });
        }
      }
      
      updateState(prev => {
        const updated = {
          ...prev,
          activeGuild: null
        };
        syncToFirebase(updated);
        return updated;
      });
      return true;
    } catch (e) {
      console.error("Error leaving guild:", e);
      return false;
    }
  };

  const transferGuildLeadership = async (guildId, targetMemberUid) => {
    try {
      const guildRef = doc(db, 'guilds', guildId);
      const guildSnap = await getDoc(guildRef);
      if (guildSnap.exists()) {
        const gData = guildSnap.data();
        const target = (gData.members || []).find(m => m.uid === targetMemberUid);
        if (target) {
          await setDoc(guildRef, {
            leaderUid: target.uid,
            leaderName: target.nickname
          }, { merge: true });
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error("Error transferring leadership:", e);
      return false;
    }
  };

  const kickGuildMember = async (guildId, memberUid) => {
    try {
      const guildRef = doc(db, 'guilds', guildId);
      const guildSnap = await getDoc(guildRef);
      if (guildSnap.exists()) {
        const gData = guildSnap.data();
        const updatedMembers = (gData.members || []).filter(m => m.uid !== memberUid);
        const newTotal = updatedMembers.reduce((sum, m) => sum + (m.focusMinutes || 0), 0);
        await setDoc(guildRef, { 
          members: updatedMembers,
          totalFocusMinutes: newTotal
        }, { merge: true });
        return true;
      }
      return false;
    } catch (e) {
      console.error("Error kicking member:", e);
      return false;
    }
  };

  const syncGuildInvites = async (user = currentUser) => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'guild_invites'),
        where('receiverUid', '==', user.uid),
        where('status', '==', 'pending')
      );
      const snap = await getDocs(q);
      const invites = [];
      snap.forEach(docSnap => {
        invites.push({ id: docSnap.id, ...docSnap.data() });
      });
      updateState(prev => ({
        ...prev,
        pendingGuildInvites: invites
      }));
    } catch (e) {
      console.warn("Could not sync guild invites:", e);
    }
  };

  const inviteFriendToGuild = async (friendUid, guildId, guildName) => {
    if (!currentUser || !guildId) return { success: false, error: "Você precisa estar em uma guilda." };
    try {
      const guildRef = doc(db, 'guilds', guildId);
      const gSnap = await getDoc(guildRef);
      if (gSnap.exists()) {
        const members = gSnap.data().members || [];
        if (members.some(m => m.uid === friendUid)) {
          return { success: false, error: "Este amigo já faz parte da guilda." };
        }
      }

      const inviteDocRef = doc(collection(db, 'guild_invites'));
      await setDoc(inviteDocRef, {
        id: inviteDocRef.id,
        guildId: guildId,
        guildName: guildName || 'Santuário da Guilda',
        senderUid: currentUser.uid,
        senderName: state.profile?.nickname || 'Cultivador',
        receiverUid: friendUid,
        timestamp: Date.now(),
        status: 'pending'
      });

      return { success: true };
    } catch (e) {
      console.error("Error inviting friend to guild:", e);
      return { success: false, error: e.message };
    }
  };

  const acceptGuildInvite = async (inviteId, guildId) => {
    try {
      const inviteRef = doc(db, 'guild_invites', inviteId);
      await setDoc(inviteRef, { status: 'accepted' }, { merge: true });

      const joinRes = await joinGuildGroup(guildId);

      updateState(prev => ({
        ...prev,
        pendingGuildInvites: (prev.pendingGuildInvites || []).filter(i => i.id !== inviteId)
      }));

      await syncGuildInvites(currentUser);
      return joinRes;
    } catch (e) {
      console.error("Error accepting guild invite:", e);
      return { success: false, error: e.message };
    }
  };

  const declineGuildInvite = async (inviteId) => {
    try {
      const inviteRef = doc(db, 'guild_invites', inviteId);
      await setDoc(inviteRef, { status: 'declined' }, { merge: true });

      updateState(prev => ({
        ...prev,
        pendingGuildInvites: (prev.pendingGuildInvites || []).filter(i => i.id !== inviteId)
      }));

      await syncGuildInvites(currentUser);
      return { success: true };
    } catch (e) {
      console.error("Error declining guild invite:", e);
      return { success: false, error: e.message };
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const alarms = state.alarms || [];
      if (alarms.length === 0) return;

      const now = new Date();
      const hoursStr = String(now.getHours()).padStart(2, '0');
      const minsStr = String(now.getMinutes()).padStart(2, '0');
      const timeNow = `${hoursStr}:${minsStr}`;
      const dayOfWeekNow = now.getDay();
      const todayDateStr = getLocalDateString();

      for (const alarm of alarms) {
        if (!alarm.enabled) continue;
        if (alarm.time !== timeNow) continue;

        let matches = false;
        if (alarm.type === 'daily') {
          matches = true;
        } else if (alarm.type === 'once') {
          if (alarm.scheduledDate === todayDateStr) {
            matches = true;
          }
        } else if (alarm.type === 'weekly') {
          if ((alarm.daysOfWeek || []).includes(dayOfWeekNow)) {
            matches = true;
          }
        }

        if (matches) {
          const triggerKey = `${alarm.id}_${todayDateStr}_${timeNow}`;
          if (lastTriggeredKeyRef.current !== triggerKey) {
            lastTriggeredKeyRef.current = triggerKey;
            audioSynth.playAlarmSound();
            setActiveTriggeredAlarm(alarm);
          }
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [state.alarms]);

  return (
    <AppContext.Provider value={{
      currentUser,
      loading,
      state,
      loginWithEmail,
      registerWithEmail,
      loginWithGooglePopup,
      loginWithGoogleRedirect,
      loginAnonymously,
      logout,
      sendPasswordReset,
      clearAuthError,
      addSubject,
      updateSubject,
      addBulkSubjects,
      toggleSubjectConcluded,
      deleteSubject,
      addTopicToSubject,
      toggleTopicCompleted,
      deleteTopicFromSubject,
      addAlarm,
      updateAlarm,
      deleteAlarm,
      toggleAlarm,
      dismissTriggeredAlarm,
      snoozeTriggeredAlarm,
      activeTriggeredAlarm,
      addFocusMinutes,
      addSummary,
      buyDecoration,
      setTheme,
      updateCustomTheme,
      setMood,
      toggleCompanyMode,
      toggleWiltOnDistraction,
      updateMixerVolume,
      nextTrack,
      addFutureLetter,
      addVoiceNote,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskCompleted,
      completeOnboarding,
      deleteVoiceNote,
      deleteSummary,
      disconnectGoogleSync,
      setGoogleSyncActive,
      setGardenLayout,
      updateGardenSlots,
      saveGardenProfile,
      loadGardenProfile,
      deleteGardenProfile,
      renameGardenProfile,
      setGreenhouseSize,
      setSlotDisplayStyle,
      themesCatalogOpen,
      setThemesCatalogOpen,
      mixMatchOpen,
      setMixMatchOpen,
      previewThemeId,
      setPreviewThemeId,
      updateProfile,
      addFriend,
      removeFriendObj,
      acceptFriendRequest,
      declineFriendRequest,
      syncFriendshipsAndRequests,
      claimPendingCoopRewards,
      saveCustomThemePreset,
      joinGuildGroup,
      detachBrokenGuild,
      sendSocialReaction,
      sendCloneNotification,
      setStudyingStatus,
      createCoopSession,
      addCoopProgress,
      deleteCreatedTheme,
      deleteCopiedTheme,
      saveCopiedTheme,
      buyAvatarShopItem,
      updateAvatarCustomization,
      toggleMuralComments,
      proposeCustomCoopMission,
      acceptCustomCoopMission,
      rejectCustomCoopMission,
      createCustomGuild,
      leaveGuildGroup,
      transferGuildLeadership,
      kickGuildMember,
      inviteFriendToGuild,
      syncGuildInvites,
      acceptGuildInvite,
      declineGuildInvite,
      shareSummary,
      unshareSummary,
      deleteSharedSummaryDirectly,
      getLocalDateString,
      parseLocalDate
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
