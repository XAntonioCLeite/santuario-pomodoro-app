// Autor: Antônio Costa Leite
// Componente de Comunidade e Vilarejo (O Santuário)

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../utils/firebase';
import { collection, query, where, getDocs, getDoc, doc, setDoc, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { renderMicroPlant } from '../utils/plantRenderer';
import { AvatarHair, AvatarBackHair } from './AvatarHairComponents';

// SVG Icons that inherit color dynamically
export const IconBook = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);
export const IconWater = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);
export const IconSprout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 20h10" />
    <path d="M10 20V12a4 4 0 0 1 8 0" />
    <path d="M12 12a4 4 0 0 0-8 0v8" />
  </svg>
);
export const IconSun = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);
export const IconSparkles = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.32 11.32l.707-.707M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" />
  </svg>
);
export const IconTrash = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
export const IconPin = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
export const IconCopy = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
export const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const renderGuildIcon = (iconName, size = 16) => {
  if (iconName === 'book') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5V15a2 2 0 0 1 2-2h14" />
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6 2v14" />
      </svg>
    );
  }
  if (iconName === 'users') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  if (iconName === 'award') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      </svg>
    );
  }
  // padrão: folha
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 8a7.5 7.5 0 0 1-9 10Z" />
      <path d="M19 2c-2.26 4.33-5.27 7.14-8 10" />
    </svg>
  );
};
export const IconUsers = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
export const IconAward = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);
export const IconEdit = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

// Prestige title lock metadata
// Prestige title lock metadata
export const AVATAR_HAIR_PRESETS = [
  // Gratuitos (Homem & Mulher)
  { id: 'hair_1', name: 'Careca / Raspado Minimalista', cost: 0, requiredHours: 0, gender: 'unisex' },
  { id: 'hair_short_m', name: 'Curto Social Masculino', cost: 0, requiredHours: 0, gender: 'male' },
  { id: 'hair_wavy_m', name: 'Topete Ondulado Masculino', cost: 0, requiredHours: 0, gender: 'male' },
  { id: 'hair_short_fade', name: 'Degradê Moderno Masculino', cost: 0, requiredHours: 0, gender: 'male' },
  { id: 'hair_long_f', name: 'Longo Feminino Liso', cost: 0, requiredHours: 0, gender: 'female' },
  { id: 'hair_bob_f', name: 'Chanel / Bob Feminino', cost: 0, requiredHours: 0, gender: 'female' },
  { id: 'hair_ponytail_f', name: 'Rabo de Cavalo Elegante', cost: 0, requiredHours: 0, gender: 'female' },
  { id: 'hair_bangs_f', name: 'Franja Reta Feminina', cost: 0, requiredHours: 0, gender: 'female' },
  { id: 'hair_curly_free', name: 'Cachos Volumosos', cost: 0, requiredHours: 0, gender: 'unisex' },

  // Loja do Alfaiate (Barateados & Elaborados)
  { id: 'hair_2', name: 'Undercut Moderno', cost: 15, requiredHours: 1, gender: 'male' },
  { id: 'hair_braids', name: 'Tranças Afro', cost: 25, requiredHours: 2, gender: 'unisex' },
  { id: 'hair_topknot', name: 'Coque Samurai', cost: 40, requiredHours: 4, gender: 'unisex' },
  { id: 'hair_cat_ears', name: 'Tiara de Orelhas', cost: 75, requiredHours: 6, gender: 'female' },
  { id: 'hair_4', name: 'Chapéu de Mago Místico', cost: 150, requiredHours: 12, gender: 'unisex' },
  { id: 'hair_5', name: 'Faixa de Folhas Sagradas', cost: 250, requiredHours: 20, gender: 'unisex' },
  { id: 'hair_crown', name: 'Coroa Dourada de Louros', cost: 450, requiredHours: 35, gender: 'unisex' }
];

export const AVATAR_CLOTHING_PRESETS = [
  // Gratuitos (Homem & Mulher)
  { id: 'clothing_1', name: 'Túnica Simples de Estudante', cost: 0, requiredHours: 0, gender: 'unisex' },
  { id: 'clothing_polo_m', name: 'Camisa Polo Casual', cost: 0, requiredHours: 0, gender: 'male' },
  { id: 'clothing_top_f', name: 'Blusa Elegante com Colar', cost: 0, requiredHours: 0, gender: 'female' },
  { id: 'clothing_hoodie', name: 'Moletom Urbano com Capuz', cost: 0, requiredHours: 0, gender: 'unisex' },
  { id: 'clothing_sweater', name: 'Suéter de Tricô V-Neck', cost: 0, requiredHours: 0, gender: 'unisex' },

  // Loja do Alfaiate (Barateados & Elaborados)
  { id: 'clothing_2', name: 'Manto do Estudante com Broche', cost: 15, requiredHours: 1, gender: 'unisex' },
  { id: 'clothing_3', name: 'Avental de Couro Botânico', cost: 30, requiredHours: 2, gender: 'unisex' },
  { id: 'clothing_suit', name: 'Terno & Gravata Executivo', cost: 75, requiredHours: 6, gender: 'male' },
  { id: 'clothing_kimono', name: 'Kimono Tradicional com Obi', cost: 100, requiredHours: 10, gender: 'unisex' },
  { id: 'clothing_4', name: 'Colete Cyberpunk Neon', cost: 220, requiredHours: 18, gender: 'unisex' },
  { id: 'clothing_royal', name: 'Traje Real Botânico Dourado', cost: 450, requiredHours: 35, gender: 'unisex' }
];

// Student Avatar custom element rendering
export function StudentAvatar({ customization, size = 60, title = '' }) {
  const {
    skinColor = '#ffd8b3',
    hairColor = '#4a321a',
    hairId = 'hair_1',
    clothingId = 'clothing_1',
    clothingColor = '#2e633d'
  } = customization || {};

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      border: '2.5px solid var(--accent-color)',
      position: 'relative',
      background: 'var(--bg-primary)',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      boxShadow: 'var(--shadow-inset)'
    }}>
      <svg width="100%" height="100%" viewBox="0 0 120 120" style={{ display: 'block' }}>
        
        {/* BACK HAIR (Layer 0: Flowing behind shoulders) */}
        <AvatarBackHair hairId={hairId} color={hairColor} />

        {/* BODY & NECK BASE */}
        <rect x="52" y="72" width="16" height="22" fill={skinColor} />

        {/* DISTINCT CLOTHING SILHOUETTES */}
        {clothingId === 'clothing_1' && (
          <g>
            {/* Túnica Simples */}
            <path d="M22,120 L22,90 C22,80 44,78 60,78 C76,78 98,80 98,90 L98,120 Z" fill={clothingColor} />
            <path d="M50,78 L60,98 L70,78 L60,84 Z" fill={skinColor} />
            <path d="M48,78 L60,100 L72,78" fill="none" stroke="#ffd700" strokeWidth="2.5" />
          </g>
        )}

        {clothingId === 'clothing_polo_m' && (
          <g>
            {/* Camisa Polo Casual */}
            <path d="M20,120 L20,90 C20,80 42,78 60,78 C78,78 100,80 100,90 L100,120 Z" fill={clothingColor} />
            <path d="M40,78 L60,92 L50,95 Z" fill="#ffffff" />
            <path d="M80,78 L60,92 L70,95 Z" fill="#ffffff" />
            <rect x="56" y="90" width="8" height="22" fill="#ffffff" rx="1.5" />
            <circle cx="60" cy="95" r="1.5" fill="#333" />
            <circle cx="60" cy="103" r="1.5" fill="#333" />
          </g>
        )}

        {clothingId === 'clothing_top_f' && (
          <g>
            {/* Blusa Elegante com Colar */}
            <path d="M22,120 L22,90 C22,80 44,78 60,78 C76,78 98,80 98,90 L98,120 Z" fill={clothingColor} />
            <path d="M40,78 C40,94 80,94 80,78 Z" fill={skinColor} />
            <path d="M44,79 C50,92 70,92 76,79" fill="none" stroke="#ffd700" strokeWidth="2" />
            <circle cx="60" cy="92" r="3" fill="#ffd700" />
          </g>
        )}

        {clothingId === 'clothing_hoodie' && (
          <g>
            {/* Moletom Urbano com Capuz */}
            <path d="M18,120 L18,88 C18,78 40,76 60,76 C80,76 102,78 102,88 L102,120 Z" fill={clothingColor} />
            <path d="M36,76 C36,96 84,96 84,76 C76,104 44,104 36,76 Z" fill="rgba(0,0,0,0.2)" />
            <line x1="51" y1="86" x2="51" y2="108" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="69" y1="86" x2="69" y2="108" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {clothingId === 'clothing_sweater' && (
          <g>
            {/* Suéter de Tricô V-Neck */}
            <path d="M20,120 L20,90 C20,78 42,76 60,76 C78,76 100,78 100,90 L100,120 Z" fill={clothingColor} />
            <polygon points="46,76 60,96 74,76" fill={skinColor} />
            <path d="M46,76 L60,96 L74,76" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3.5" />
            <line x1="26" y1="102" x2="94" y2="102" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" />
          </g>
        )}

        {clothingId === 'clothing_2' && (
          <g>
            {/* Manto do Estudante com Broche */}
            <path d="M20,120 L20,90 C20,78 42,76 60,76 C78,76 100,78 100,90 L100,120 Z" fill={clothingColor} />
            <path d="M48,76 L60,120 L72,76 Z" fill="#ffd700" />
            <circle cx="60" cy="88" r="4.5" fill="#d93838" stroke="#ffd700" strokeWidth="1.5" />
          </g>
        )}

        {clothingId === 'clothing_3' && (
          <g>
            {/* Avental Botânico de Couro */}
            <path d="M22,120 L22,90 C22,80 44,79 60,79 C76,79 98,80 98,90 L98,120 Z" fill={clothingColor} />
            <polygon points="40,84 80,84 84,120 36,120" fill="#7a4e29" />
            <line x1="40" y1="84" x2="34" y2="79" stroke="#4a2e16" strokeWidth="3.5" />
            <line x1="80" y1="84" x2="86" y2="79" stroke="#4a2e16" strokeWidth="3.5" />
            <rect x="50" y="96" width="20" height="20" fill="#5c381b" rx="3" />
          </g>
        )}

        {clothingId === 'clothing_suit' && (
          <g>
            {/* Terno & Gravata Executivo */}
            <path d="M18,120 L18,90 C18,78 40,76 60,76 C80,76 102,78 102,90 L102,120 Z" fill="#24292e" />
            <polygon points="48,76 60,104 72,76" fill="#ffffff" />
            <polygon points="57,84 63,84 64,106 60,112 56,106" fill="#c73e3e" />
            <path d="M28,90 L48,76 L58,102 Z" fill="#1b1f23" />
            <path d="M92,90 L72,76 L62,102 Z" fill="#1b1f23" />
          </g>
        )}

        {clothingId === 'clothing_kimono' && (
          <g>
            {/* Kimono Tradicional com Obi */}
            <path d="M20,120 L20,90 C20,78 42,77 60,77 C78,77 100,78 100,90 L100,120 Z" fill={clothingColor} />
            <path d="M36,77 L60,104" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M84,77 L52,106" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
            <rect x="30" y="104" width="60" height="16" fill="#ffd700" />
          </g>
        )}

        {clothingId === 'clothing_4' && (
          <g>
            {/* Colete Cyberpunk Neon */}
            <path d="M18,120 L18,90 C18,78 40,76 60,76 C80,76 102,78 102,90 L102,120 Z" fill="#1a1c23" />
            <circle cx="60" cy="94" r="8" fill="#00f3ff" stroke="#ffffff" strokeWidth="2" />
            <path d="M38,76 L60,92 L82,76" fill="none" stroke="#00f3ff" strokeWidth="3" />
          </g>
        )}

        {clothingId === 'clothing_royal' && (
          <g>
            {/* Traje Real Botânico Dourado */}
            <path d="M16,120 L16,88 C16,74 38,72 60,72 C82,72 104,74 104,88 L104,120 Z" fill="#3b1d54" />
            <path d="M34,78 Q60,94 86,78" fill="none" stroke="#ffd700" strokeWidth="6" />
            <polygon points="60,86 66,92 60,98 54,92" fill="#2ecc71" stroke="#ffd700" strokeWidth="1.8" />
          </g>
        )}

        {/* HEAD BASE & FACIAL FEATURES (Head Center at cx=60, cy=54, rx=24, ry=26) */}
        {(() => {
          const hairPreset = AVATAR_HAIR_PRESETS.find(h => h.id === hairId);
          const clothingPreset = AVATAR_CLOTHING_PRESETS.find(c => c.id === clothingId);
          const isFemale = hairPreset?.gender === 'female' || clothingPreset?.gender === 'female';

          return (
            <g>
              {/* Ears */}
              <circle cx="34" cy="56" r="4.5" fill={skinColor} />
              <circle cx="86" cy="56" r="4.5" fill={skinColor} />

              {/* Head Base Oval */}
              <ellipse cx="60" cy="54" rx="24" ry="26" fill={skinColor} />

              {/* Eyes & Highlights */}
              <circle cx="48" cy="52" r="3.2" fill="#1f2937" />
              <circle cx="72" cy="52" r="3.2" fill="#1f2937" />
              <circle cx="47" cy="50.8" r="1.1" fill="#ffffff" />
              <circle cx="71" cy="50.8" r="1.1" fill="#ffffff" />

              {/* Eyebrows & Smile */}
              {isFemale ? (
                <>
                  <path d="M41,46 Q47,43 53,46" stroke="#1f2937" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                  <path d="M67,46 Q73,43 79,46" stroke="#1f2937" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                  <ellipse cx="42" cy="58" rx="3.5" ry="2" fill="rgba(244,114,182,0.3)" />
                  <ellipse cx="78" cy="58" rx="3.5" ry="2" fill="rgba(244,114,182,0.3)" />
                  <path d="M52,64 Q60,69 68,64" stroke="#1f2937" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                </>
              ) : (
                <>
                  {/* Soft friendly male eyebrows & smile */}
                  <path d="M41,46 Q47,44 53,46" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <path d="M67,46 Q73,44 79,46" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <path d="M52,64 Q60,69 68,64" stroke="#1f2937" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                </>
              )}

              {/* Subtle Natural Nose */}
              <path d="M59,55 Q60,58 61,58 Q62,58 63,55" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          );
        })()}

        {/* MODULAR HAIR RENDERER */}
        <AvatarHair hairId={hairId} color={hairColor} />
      </svg>
      
      {title === 'Botânico Lendário' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          border: '4px solid #ffd700', borderRadius: '50%',
          boxShadow: '0 0 6px #ffd700', pointerEvents: 'none'
        }} />
      )}
      {title === 'Cultivador de Elite' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          border: '3px solid #c0c0c0', borderRadius: '50%',
          boxShadow: '0 0 4px #c0c0c0', pointerEvents: 'none'
        }} />
      )}
      {title === 'Jardineiro Avançado' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          border: '2px solid #cd7f32', borderRadius: '50%', pointerEvents: 'none'
        }} />
      )}
    </div>
  );
}

export default function VillageView({ onVisitUser }) {
  const {
    state,
    currentUser,
    updateProfile,
    addFriend,
    removeFriendObj,
    acceptFriendRequest,
    declineFriendRequest,
    syncFriendshipsAndRequests,
    buyAvatarShopItem,
    updateAvatarCustomization,
    toggleMuralComments,
    proposeCustomCoopMission,
    acceptCustomCoopMission,
    rejectCustomCoopMission,
    createCustomGuild,
    leaveGuildGroup,
    detachBrokenGuild,
    transferGuildLeadership,
    kickGuildMember,
    joinGuildGroup,
    inviteFriendToGuild,
    acceptGuildInvite,
    declineGuildInvite
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState('profile'); // 'profile', 'friends', 'coop', 'guilds'
  const [profileViewMode, setProfileViewMode] = useState('card'); // 'card' | 'edit_avatar' | 'shop_avatar'
  const [avatarGenderFilter, setAvatarGenderFilter] = useState('all'); // 'all' | 'male' | 'female'
  
  // Profile inputs
  const [nickname, setNickname] = useState(state.profile?.nickname || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [copiedIdStatus, setCopiedIdStatus] = useState(false);

  // Comments Mural
  const [muralMessages, setMuralMessages] = useState([]);
  const [loadingMural, setLoadingMural] = useState(false);
  const [muralPage, setMuralPage] = useState(0);

  // Friend adding
  const [friendInput, setFriendInput] = useState('');
  const [friendAddStatus, setFriendAddStatus] = useState('');
  const [friendsSearchQuery, setFriendsSearchQuery] = useState('');

  // Co-op lobby inputs
  const [coopHoursTarget, setCoopHoursTarget] = useState(5);
  const [coopDeadlineDays, setCoopDeadlineDays] = useState(3);
  const [coopSelectedFriends, setCoopSelectedFriends] = useState([]);
  const [coopPendingInvites, setCoopPendingInvites] = useState([]);
  const [coopActiveMissions, setCoopActiveMissions] = useState([]);

  // Guild Creation/Admin
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildTag, setNewGuildTag] = useState('');
  const [newGuildDesc, setNewGuildDesc] = useState('');
  const [newGuildColor, setNewGuildColor] = useState('#2e633d');
  const [newGuildIcon, setNewGuildIcon] = useState('leaf');
  
  const [guildData, setGuildData] = useState(null);
  const [loadingGuild, setLoadingGuild] = useState(false);
  const [guildFetchDone, setGuildFetchDone] = useState(false);
  const [guildFetchError, setGuildFetchError] = useState(false); // true = network/permission error
  const [guildDocMissing, setGuildDocMissing] = useState(false); // true = doc doesn't exist in Firestore
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitedFriendUids, setInvitedFriendUids] = useState([]);

  // Guilds list and search
  const [allGuilds, setAllGuilds] = useState([]);
  const [loadingAllGuilds, setLoadingAllGuilds] = useState(false);
  const [guildSearchQuery, setGuildSearchQuery] = useState('');

  const fetchAllGuilds = async () => {
    setLoadingAllGuilds(true);
    try {
      const q = query(collection(db, 'guilds'));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setAllGuilds(list);
    } catch (e) {
      console.error("Error fetching guilds:", e);
    } finally {
      setLoadingAllGuilds(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'guilds') {
      fetchAllGuilds();
    }
  }, [activeSubTab, state.activeGuild]);

  const filteredGuilds = allGuilds.filter(g => {
    const q = guildSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (g.name || '').toLowerCase().includes(q) ||
      (g.tag || '').toLowerCase().includes(q)
    );
  });
  const [showGuildFrictionModal, setShowGuildFrictionModal] = useState(false);
  const [guildFrictionInput, setGuildFrictionInput] = useState('');
  const [guildLeaveCountdown, setGuildLeaveCountdown] = useState(0);
  const guildHoldTimerRef = useRef(null);

  // Book of visits logs
  const [visitsLogs, setVisitsLogs] = useState([]);
  const [visitsPage, setVisitsPage] = useState(0);

  const totalFocusHours = Number(((state.subjects?.reduce((sum, s) => sum + s.focusMinutes, 0) || 0) / 60).toFixed(1));

  // Sync profile edits with state updates
  useEffect(() => {
    if (state.profile) {
      setNickname(state.profile.nickname || currentUser?.email?.split('@')[0] || 'Cultivador');
    }
  }, [state.profile]);

  // Carrega comentários do mural e missões
  useEffect(() => {
    if (!currentUser) return;
    if (activeSubTab === 'profile') {
      loadMuralComments();
    } else if (activeSubTab === 'coop') {
      loadCoopMissions();
    } else if (activeSubTab === 'friends') {
      syncFriendshipsAndRequests();
    }
  }, [currentUser, activeSubTab]);

  const loadMuralComments = async () => {
    setLoadingMural(true);
    try {
      const q = query(collection(db, 'mural_comments'), where('targetUid', '==', currentUser.uid));
      const snap = await getDocs(q);
      const comments = [];
      snap.forEach(doc => {
        comments.push({ id: doc.id, ...doc.data() });
      });
      comments.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.timestamp - a.timestamp;
      });
      setMuralMessages(comments);
    } catch (e) {
      console.warn("Could not load mural comments from Firestore:", e);
    }
    setLoadingMural(false);
  };

  const loadCoopMissions = async () => {
    if (!currentUser) return;
    try {
      const q = query(
        collection(db, 'coop_missions'),
        where('participantsUids', 'array-contains', currentUser.uid)
      );
      const snap = await getDocs(q);
      const allMissions = [];
      snap.forEach(doc => {
        allMissions.push({ id: doc.id, ...doc.data() });
      });

      const invites = allMissions.filter(m => {
        const myPart = (m.participants || []).find(p => p.uid === currentUser.uid);
        return myPart && myPart.status === 'pending';
      });

      const active = allMissions.filter(m => {
        const myPart = (m.participants || []).find(p => p.uid === currentUser.uid);
        return myPart && myPart.status === 'accepted';
      });

      setCoopPendingInvites(invites);
      setCoopActiveMissions(active);
    } catch (e) {
      console.warn("Could not load co-op missions from Firestore:", e);
    }
  };

  // Group Book of visits logs daily
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'guestbook'), where('targetUid', '==', currentUser.uid));
    getDocs(q).then((snap) => {
      const logs = [];
      snap.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      
      const grouped = {};
      logs.forEach(log => {
        const dateStr = new Date(log.timestamp).toLocaleDateString();
        const key = `${log.senderName}_${dateStr}_${log.type}`;
        
        if (!grouped[key]) {
          grouped[key] = {
            id: log.id,
            senderName: log.senderName,
            type: log.type,
            detail: log.detail,
            timestamp: log.timestamp,
            count: 1
          };
        } else {
          grouped[key].count += 1;
          if (log.timestamp > grouped[key].timestamp) {
            grouped[key].timestamp = log.timestamp;
          }
        }
      });

      const list = Object.values(grouped);
      list.sort((a, b) => b.timestamp - a.timestamp);
      setVisitsLogs(list);
    }).catch(e => {
      console.warn("Guestbook loading error:", e);
    });
  }, [currentUser]);

  // Carrega dados da guilda
  useEffect(() => {
    if (state.activeGuild) {
      setLoadingGuild(true);
      setGuildFetchDone(false);
      setGuildFetchError(false);
      setGuildDocMissing(false);
      const guildRef = doc(db, 'guilds', state.activeGuild);
      getDoc(guildRef).then(snap => {
        if (snap.exists()) {
          setGuildData(snap.data());
          setGuildDocMissing(false);
        } else {
          // Document doesn't exist in Firestore (was never saved or deleted)
          setGuildData(null);
          setGuildDocMissing(true);
        }
      }).catch(e => {
        console.warn("Could not load guild:", e);
        setGuildData(null);
        setGuildFetchError(true);
      }).finally(() => {
        setLoadingGuild(false);
        setGuildFetchDone(true);
      });
    } else {
      setGuildData(null);
      setGuildDocMissing(false);
      setGuildFetchError(false);
      setLoadingGuild(false);
      setGuildFetchDone(true);
    }
  }, [state.activeGuild]);

  const handleCopyShortId = () => {
    if (!state.profile?.shortId) return;
    navigator.clipboard.writeText(state.profile.shortId);
    setCopiedIdStatus(true);
    setTimeout(() => setCopiedIdStatus(false), 2000);
  };

  const handleSaveProfile = () => {
    const totalMinutes = state.subjects?.reduce((sum, s) => sum + s.focusMinutes, 0) || 0;
    let title = 'Jardineiro de Santuários';
    if (totalMinutes >= 2000) title = 'Botânico Lendário';
    else if (totalMinutes >= 1000) title = 'Cultivador de Elite';
    else if (totalMinutes >= 300) title = 'Jardineiro Avançado';

    // Preserva títulos especiais concedidos (ex: homenagem do criador)
    if (state.profile?.title && !['Jardineiro de Santuários', 'Jardineiro Avançado', 'Cultivador de Elite', 'Botânico Lendário'].includes(state.profile.title)) {
      title = state.profile.title;
    }

    const derivedTag = currentUser.uid.substring(0, 4).toUpperCase();

    updateProfile({
      nickname: nickname.trim(),
      shortId: `${nickname.trim()}#${derivedTag}`,
      title
    });
    setIsEditingProfile(false);
  };

  const handleAddFriendSubmit = async (e) => {
    e.preventDefault();
    if (!friendInput.trim()) return;
    setFriendAddStatus('Buscando...');
    
    let targetUid = friendInput.trim();
    if (friendInput.includes('#')) {
      try {
        const q = query(collection(db, 'users'), where('profile.shortId', '==', friendInput.trim()));
        const snap = await getDocs(q);
        if (!snap.empty) {
          targetUid = snap.docs[0].id;
        } else {
          setFriendAddStatus('Identificador não encontrado.');
          return;
        }
      } catch (err) {
        setFriendAddStatus('Erro de rede ao buscar amigo.');
        return;
      }
    }

    const result = await addFriend(targetUid);
    if (result.success) {
      setFriendAddStatus(result.message);
      setFriendInput('');
    } else {
      setFriendAddStatus(result.error || 'Erro ao adicionar amigo.');
    }
  };

  const handleProposeMission = async () => {
    if (coopSelectedFriends.length === 0) return;
    const success = await proposeCustomCoopMission(
      coopSelectedFriends,
      coopHoursTarget,
      coopDeadlineDays * 24
    );
    if (success) {
      alert("Convite de missão enviado com sucesso!");
      setCoopSelectedFriends([]);
      loadCoopMissions();
    }
  };

  const handleAcceptMission = async (missionId) => {
    const success = await acceptCustomCoopMission(missionId);
    if (success) {
      alert("Missão iniciada!");
      loadCoopMissions();
    }
  };

  const handleRejectMission = async (missionId) => {
    const success = await rejectCustomCoopMission(missionId);
    if (success) {
      alert("Missão recusada.");
      loadCoopMissions();
    }
  };

  const handlePinComment = async (commentId, currentlyPinned) => {
    try {
      const ref = doc(db, 'mural_comments', commentId);
      await updateDoc(ref, { isPinned: !currentlyPinned });
      loadMuralComments();
    } catch (e) {
      console.warn("Could not pin comment:", e);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Deseja mesmo apagar este recado do seu mural?")) return;
    try {
      await deleteDoc(doc(db, 'mural_comments', commentId));
      loadMuralComments();
    } catch (e) {
      console.warn("Could not delete comment:", e);
    }
  };

  const handleClearMural = async () => {
    if (!window.confirm("Deseja mesmo apagar todos os recados do seu mural?")) return;
    try {
      const q = query(collection(db, 'mural_comments'), where('targetUid', '==', currentUser.uid));
      const snap = await getDocs(q);
      const promises = [];
      snap.forEach(d => {
        promises.push(deleteDoc(doc(db, 'mural_comments', d.id)));
      });
      await Promise.all(promises);
      loadMuralComments();
    } catch (e) {
      console.warn("Could not clear mural:", e);
    }
  };

  const handleCreateGuild = async (e) => {
    e.preventDefault();
    if (!newGuildName.trim() || newGuildTag.length < 2) {
      alert("Preencha o nome e a tag de 2 a 4 letras.");
      return;
    }
    const res = await createCustomGuild(
      newGuildName.trim(),
      newGuildTag.trim(),
      newGuildDesc.trim(),
      newGuildColor,
      newGuildIcon
    );
    if (res.success) {
      alert("Guilda fundada com sucesso!");
      setNewGuildName('');
      setNewGuildTag('');
      setNewGuildDesc('');
    } else {
      alert("Erro ao criar guilda: " + res.error);
    }
  };

  const handleLeaveGuild = async () => {
    if (guildFrictionInput !== 'SAIR') {
      alert("Digite SAIR para confirmar.");
      return;
    }
    const success = await leaveGuildGroup(state.activeGuild);
    if (success) {
      alert("Você saiu da guilda.");
      setShowGuildFrictionModal(false);
      setGuildFrictionInput('');
    }
  };

  const handleStartHoldLeave = () => {
    setGuildLeaveCountdown(3);
    guildHoldTimerRef.current = setInterval(() => {
      setGuildLeaveCountdown(prev => {
        if (prev <= 1) {
          clearInterval(guildHoldTimerRef.current);
          handleLeaveGuild();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStopHoldLeave = () => {
    if (guildHoldTimerRef.current) {
      clearInterval(guildHoldTimerRef.current);
      setGuildLeaveCountdown(0);
    }
  };

  const filteredFriends = (state.friends || []).filter(f =>
    f.nickname.toLowerCase().includes(friendsSearchQuery.toLowerCase()) ||
    (f.shortId && f.shortId.toLowerCase().includes(friendsSearchQuery.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Tab bar */}
      <div 
        className="responsive-tabs"
        style={{
          display: 'flex',
          background: 'var(--panel-bg)',
          borderRadius: '16px',
          padding: '6px',
          boxShadow: 'var(--shadow-inset)',
          border: '1.5px solid var(--card-border)',
          gap: '4px'
        }}
      >
        {[
          { id: 'profile', label: 'Meu Cartão' },
          { id: 'friends', label: 'Amigos' },
          { id: 'coop', label: 'Lobby Co-op' },
          { id: 'guilds', label: 'Guildas' }
        ].map(tb => (
          <button
            key={tb.id}
            onClick={() => { setActiveSubTab(tb.id); setProfileViewMode('card'); }}
            className={`nav-btn ${activeSubTab === tb.id ? 'active' : ''}`}
            style={{
              flex: 1,
              padding: '10px 4px',
              fontSize: '0.78rem',
              fontWeight: '600',
              borderRadius: '12px',
              transition: 'all 0.2s',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* SUBTAB 1: MEU CARTAO */}
      {activeSubTab === 'profile' && profileViewMode === 'card' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="neumorphic-card" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center', background: 'var(--panel-bg)', borderRadius: '20px', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-flat)' }}>
            
            <StudentAvatar
              customization={state.profile?.avatarCustomization}
              size={80}
              title={state.profile?.title}
            />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {isEditingProfile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    maxLength={15}
                    className="input-field"
                    style={{ padding: '6px 12px', fontSize: '0.9rem', borderRadius: '8px', maxWidth: '180px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleSaveProfile} className="neumorphic-btn accent-btn" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>Salvar</button>
                    <button onClick={() => setIsEditingProfile(false)} className="neumorphic-btn" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                      {state.profile?.nickname || 'Sem Apelido'}
                    </h3>
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <IconEdit />
                      <span>Nome</span>
                    </button>
                  </div>
                  
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>
                      {state.profile?.title || 'Jardineiro de Santuários'}
                    </span>
                    <button
                      onClick={handleCopyShortId}
                      aria-label="Copiar ID de Amizade"
                      className="neumorphic-btn"
                      style={{ padding: '4px 8px', borderRadius: '8px', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span>{state.profile?.shortId || 'Carregando ID...'}</span>
                      {copiedIdStatus ? <IconCheck /> : <IconCopy />}
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      onClick={() => setProfileViewMode('edit_avatar')}
                      className="neumorphic-btn"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px' }}
                    >
                      Personalizar Boneco
                    </button>
                    <button
                      onClick={() => setProfileViewMode('shop_avatar')}
                      className="neumorphic-btn accent-btn"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <IconAward />
                      <span>Loja de Roupas</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {state.profile?.specialTribute && (
            <div
              className="neumorphic-card"
              style={{
                padding: '22px 24px',
                background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.18) 0%, rgba(255, 105, 180, 0.1) 100%)',
                borderRadius: '20px',
                border: '1.5px solid rgba(255, 105, 180, 0.35)',
                boxShadow: 'var(--shadow-flat)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.6rem', filter: 'drop-shadow(0 2px 4px rgba(255, 105, 180, 0.4))' }}>
                    {state.profile.specialTribute.badge || '🌹'}
                  </span>
                  <div>
                    <h4 style={{ fontSize: '0.98rem', color: 'var(--text-primary)', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {state.profile.specialTribute.title || "Homenagem Especial"}
                      <span style={{ fontSize: '0.65rem', background: 'rgba(255, 105, 180, 0.2)', color: '#d81b60', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                        Exclusivo
                      </span>
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      Concedido por {state.profile.specialTribute.author || "Criador do Santuário"}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-primary)', padding: '5px 12px', borderRadius: '12px', border: '1px solid rgba(255, 105, 180, 0.3)', fontSize: '0.75rem', color: '#d81b60', fontWeight: '700' }}>
                  <span>💧 Custou 10 orvalhos</span>
                </div>
              </div>

              {state.profile.specialTribute.message && (
                <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: '4px 0', lineHeight: '1.6', fontStyle: 'italic' }}>
                  "{state.profile.specialTribute.message}"
                </p>
              )}

              {state.profile.specialTribute.caption && (
                <div style={{ paddingTop: '8px', borderTop: '1px dashed rgba(255, 105, 180, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    ✨ {state.profile.specialTribute.caption}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="neumorphic-card" style={{ padding: '24px', background: 'var(--panel-bg)', borderRadius: '20px', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-flat)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '700' }}>💬 Mural de Recados</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Apenas comentários de seus amigos mútuos aparecem aqui.</p>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={state.profile?.muralPrivateToggle || false}
                    onChange={(e) => toggleMuralComments(e.target.checked)}
                  />
                  Desativar Mural
                </label>
                
                <button
                  onClick={handleClearMural}
                  className="neumorphic-btn"
                  style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.68rem', color: '#c75e43' }}
                >
                  Limpar Tudo
                </button>
              </div>
            </div>

            {loadingMural ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Buscando comentários...</p>
            ) : muralMessages.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '10px 0' }}>Mural vazio. Nenhum recado de amigos ainda.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {muralMessages.slice(muralPage * 5, (muralPage + 1) * 5).map(msg => (
                  <div
                    key={msg.id}
                    style={{
                      padding: '12px 16px',
                      background: 'var(--bg-primary)',
                      borderRadius: '12px',
                      border: msg.isPinned ? '1.5px solid var(--accent-color)' : '1.5px solid var(--card-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {msg.authorName} <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>({msg.authorShortId})</span>
                      </span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={() => handlePinComment(msg.id, msg.isPinned)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: msg.isPinned ? 'var(--accent-color)' : 'var(--text-secondary)' }}
                          title={msg.isPinned ? "Desafixar" : "Fixar Recado"}
                        >
                          <IconPin />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(msg.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c75e43' }}
                          title="Excluir Recado"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', margin: '4px 0', wordBreak: 'break-word' }}>
                      {msg.message}
                    </p>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', alignSelf: 'flex-end' }}>
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}

                {muralMessages.length > 5 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '10px' }}>
                    <button
                      disabled={muralPage === 0}
                      onClick={() => setMuralPage(prev => Math.max(0, prev - 1))}
                      className="neumorphic-btn"
                      style={{ padding: '4px 12px', fontSize: '0.72rem' }}
                    >
                      Anterior
                    </button>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', alignSelf: 'center' }}>
                      Pág {muralPage + 1} de {Math.ceil(muralMessages.length / 5)}
                    </span>
                    <button
                      disabled={(muralPage + 1) * 5 >= muralMessages.length}
                      onClick={() => setMuralPage(prev => prev + 1)}
                      className="neumorphic-btn"
                      style={{ padding: '4px 12px', fontSize: '0.72rem' }}
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="neumorphic-card" style={{ padding: '20px', background: 'var(--panel-bg)', borderRadius: '20px', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-flat)' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
              <IconBook />
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '700' }}>Livro de Visitas (Logs)</h4>
            </div>

            {visitsLogs.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Nenhuma visita recebida nas últimas 24h.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {visitsLogs.slice(visitsPage * 5, (visitsPage + 1) * 5).map(log => {
                  let logText = '';
                  if (log.type === 'reaction') {
                    const reactVerb = log.detail === 'regador' ? 'regou' : log.detail === 'broto' ? 'admirou' : log.detail === 'sol' ? 'enviou sol para' : 'visitou';
                    logText = `Visita de ${log.senderName}: ${reactVerb} seu jardim ${log.count > 1 ? `${log.count} vezes` : ''} hoje.`;
                  } else {
                    logText = `Tema clonado por ${log.senderName}: copiou "${log.detail}".`;
                  }

                  return (
                    <div
                      key={log.id}
                      style={{
                        padding: '10px 14px',
                        background: 'var(--bg-primary)',
                        borderRadius: '12px',
                        border: '1px solid var(--card-border)',
                        fontSize: '0.8rem',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>{logText}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })}

                {visitsLogs.length > 5 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '10px' }}>
                    <button
                      disabled={visitsPage === 0}
                      onClick={() => setVisitsPage(prev => Math.max(0, prev - 1))}
                      className="neumorphic-btn"
                      style={{ padding: '4px 12px', fontSize: '0.72rem' }}
                    >
                      Anterior
                    </button>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Pág {visitsPage + 1}
                    </span>
                    <button
                      disabled={(visitsPage + 1) * 5 >= visitsLogs.length}
                      onClick={() => setVisitsPage(prev => prev + 1)}
                      className="neumorphic-btn"
                      style={{ padding: '4px 12px', fontSize: '0.72rem' }}
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT AVATAR PANEL */}
      {activeSubTab === 'profile' && profileViewMode === 'edit_avatar' && (
        <div className="neumorphic-card" style={{ padding: '24px', background: 'var(--panel-bg)', borderRadius: '20px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-primary)' }}>Personalizar Seu Boneco</h4>
            <button onClick={() => setProfileViewMode('card')} className="neumorphic-btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>Voltar</button>
          </div>

          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <StudentAvatar
                customization={state.profile?.avatarCustomization}
                size={120}
                title={state.profile?.title}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Prévia</span>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '220px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Tom de Pele</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['#ffd8b3', '#f5c396', '#d2966a', '#91593c', '#e6c2ab'].map(color => (
                    <button
                      key={color}
                      onClick={() => updateAvatarCustomization({ skinColor: color })}
                      style={{
                        width: '24px', height: '24px', borderRadius: '50%', background: color, border: state.profile?.avatarCustomization?.skinColor === color ? '2px solid var(--accent-color)' : '1px solid #ccc', cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Cor do Cabelo</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['#4a321a', '#221a12', '#783818', '#cda63c', '#9c7356'].map(color => (
                    <button
                      key={color}
                      onClick={() => updateAvatarCustomization({ hairColor: color })}
                      style={{
                        width: '24px', height: '24px', borderRadius: '50%', background: color, border: state.profile?.avatarCustomization?.hairColor === color ? '2px solid var(--accent-color)' : '1px solid #ccc', cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Filtro de Estilo</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { id: 'all', label: 'Todos os Estilos' },
                    { id: 'male', label: 'Masculino' },
                    { id: 'female', label: 'Feminino' }
                  ].map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setAvatarGenderFilter(g.id)}
                      className={`neumorphic-btn ${avatarGenderFilter === g.id ? 'active' : ''}`}
                      style={{ padding: '4px 10px', fontSize: '0.7rem', borderRadius: '6px' }}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Cabelo & Acessórios Adquiridos</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {AVATAR_HAIR_PRESETS.filter(p => avatarGenderFilter === 'all' || p.gender === 'unisex' || p.gender === avatarGenderFilter).map(preset => {
                    const isOwned = (state.profile?.avatarShopItems || []).includes(preset.id) || preset.cost === 0;
                    if (!isOwned) return null;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => updateAvatarCustomization({ hairId: preset.id })}
                        className={`neumorphic-btn ${state.profile?.avatarCustomization?.hairId === preset.id ? 'active' : ''}`}
                        style={{ padding: '6px 10px', fontSize: '0.72rem', borderRadius: '6px' }}
                      >
                        {preset.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Traje Adquirido</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {AVATAR_CLOTHING_PRESETS.filter(p => avatarGenderFilter === 'all' || p.gender === 'unisex' || p.gender === avatarGenderFilter).map(preset => {
                    const isOwned = (state.profile?.avatarShopItems || []).includes(preset.id) || preset.cost === 0;
                    if (!isOwned) return null;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => updateAvatarCustomization({ clothingId: preset.id })}
                        className={`neumorphic-btn ${state.profile?.avatarCustomization?.clothingId === preset.id ? 'active' : ''}`}
                        style={{ padding: '6px 10px', fontSize: '0.72rem', borderRadius: '6px' }}
                      >
                        {preset.name}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* AVATAR PROGRESSION STORE */}
      {activeSubTab === 'profile' && profileViewMode === 'shop_avatar' && (
        <div className="neumorphic-card" style={{ padding: '24px', background: 'var(--panel-bg)', borderRadius: '20px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-primary)' }}>Loja do Alfaiate</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Troque orvalho colhido por customizações. Alguns itens necessitam de marcos de foco.</p>
            </div>
            <button onClick={() => setProfileViewMode('card')} className="neumorphic-btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>Voltar</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Cabelos & Adereços</span>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              {AVATAR_HAIR_PRESETS.filter(h => h.cost > 0).map(item => {
                const isOwned = (state.profile?.avatarShopItems || []).includes(item.id);
                const isLocked = totalFocusHours < item.requiredHours;
                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--card-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>{item.name}</span>
                      {isOwned && <span style={{ fontSize: '0.65rem', color: 'var(--accent-color)' }}>Adquirido</span>}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Requer {item.requiredHours}h de Foco</span>
                    
                    {!isOwned && (
                      <button
                        disabled={isLocked || state.orvalho < item.cost}
                        onClick={() => {
                          const success = buyAvatarShopItem(item.id, item.cost);
                          if (success) alert(`${item.name} adquirido!`);
                        }}
                        className="neumorphic-btn accent-btn"
                        style={{ padding: '4px', fontSize: '0.72rem', width: '100%', borderRadius: '6px' }}
                      >
                        {isLocked ? 'Bloqueado por Horas' : `Comprar por ${item.cost} Orvalhos`}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', marginTop: '10px' }}>Vestimentas</span>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              {AVATAR_CLOTHING_PRESETS.filter(c => c.cost > 0).map(item => {
                const isOwned = (state.profile?.avatarShopItems || []).includes(item.id);
                const isLocked = totalFocusHours < item.requiredHours;
                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--card-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>{item.name}</span>
                      {isOwned && <span style={{ fontSize: '0.65rem', color: 'var(--accent-color)' }}>Adquirido</span>}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Requer {item.requiredHours}h de Foco</span>
                    
                    {!isOwned && (
                      <button
                        disabled={isLocked || state.orvalho < item.cost}
                        onClick={() => {
                          const success = buyAvatarShopItem(item.id, item.cost);
                          if (success) alert(`${item.name} adquirido!`);
                        }}
                        className="neumorphic-btn accent-btn"
                        style={{ padding: '4px', fontSize: '0.72rem', width: '100%', borderRadius: '6px' }}
                      >
                        {isLocked ? 'Bloqueado por Horas' : `Comprar por ${item.cost} Orvalhos`}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: AMIGOS */}
      {activeSubTab === 'friends' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <form onSubmit={handleAddFriendSubmit} className="neumorphic-card" style={{ padding: '16px', display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--panel-bg)', borderRadius: '20px', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-flat)' }}>
            <input
              type="text"
              placeholder="Adicionar por Nickname#Tag ou UID"
              value={friendInput}
              onChange={(e) => setFriendInput(e.target.value)}
              className="input-field"
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', borderRadius: '10px' }}
            />
            <button type="submit" className="neumorphic-btn accent-btn" style={{ padding: '8px 16px', fontSize: '0.82rem', borderRadius: '10px' }}>
              Adicionar
            </button>
          </form>

          {friendAddStatus && (
            <p style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: '600', paddingLeft: '8px' }}>{friendAddStatus}</p>
          )}

          {state.pendingFriendRequests && state.pendingFriendRequests.length > 0 && (
            <div className="neumorphic-card" style={{ padding: '16px', background: 'var(--panel-bg)', borderRadius: '20px', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-flat)' }}>
              <h5 style={{ fontSize: '0.82rem', color: 'var(--accent-color)', fontWeight: '700', marginBottom: '10px', marginTop: 0 }}>Pedidos de Amizade Pendentes</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {state.pendingFriendRequests.map(req => (
                  <div
                    key={req.id}
                    style={{
                      padding: '10px 12px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)' }}>{req.senderName}</span>
                      <p style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Quer ser seu amigo!</p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={async () => {
                          const res = await acceptFriendRequest(req.id);
                          if (res) alert("Pedido aceito!");
                        }} 
                        className="neumorphic-btn accent-btn" 
                        style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '8px' }}
                      >
                        Aceitar
                      </button>
                      <button 
                        onClick={async () => {
                          if (window.confirm("Recusar solicitação?")) {
                            await declineFriendRequest(req.id);
                          }
                        }} 
                        className="neumorphic-btn" 
                        style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '8px', color: '#c75e43' }}
                      >
                        Recusar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {state.sentFriendRequests && state.sentFriendRequests.length > 0 && (
            <div style={{ padding: '4px 8px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Aguardando resposta de: {state.sentFriendRequests.map(r => r.receiverName).join(', ')}
            </div>
          )}

          <div style={{ width: '100%' }}>
            <input
              type="text"
              placeholder="Buscar amigo na lista..."
              value={friendsSearchQuery}
              onChange={(e) => setFriendsSearchQuery(e.target.value)}
              className="input-field"
              style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '10px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '12px',
            width: '100%'
          }}>
            {filteredFriends.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic', padding: '20px' }}>
                  Nenhum amigo correspondente encontrado.
                </p>
              </div>
            ) : (
              filteredFriends.map(friend => (
                <div
                  key={friend.uid}
                  className="neumorphic-card"
                  style={{
                    padding: '16px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid var(--card-border)',
                    background: 'var(--panel-bg)',
                    borderRadius: '20px',
                    boxShadow: 'var(--shadow-flat)',
                    textAlign: 'center',
                    gap: '10px',
                    position: 'relative'
                  }}
                >
                  {friend.isStudying && (
                    <span style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#438f5a',
                      boxShadow: '0 0 6px #438f5a'
                    }} title="Estudando agora" />
                  )}
                  
                  <StudentAvatar
                    customization={friend.avatarCustomization}
                    size={48}
                    title={friend.title}
                  />
                  <div>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                      {friend.nickname}
                    </h4>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                      {friend.title || 'Estudante'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', width: '100%', marginTop: '4px' }}>
                    <button
                      onClick={() => onVisitUser(friend.uid)}
                      className="neumorphic-btn accent-btn"
                      style={{ padding: '6px 4px', fontSize: '0.68rem', borderRadius: '8px', flex: 1, minWidth: '45px' }}
                    >
                      Visitar
                    </button>
                    <button
                      onClick={() => removeFriendObj(friend.uid)}
                      className="neumorphic-btn"
                      style={{ padding: '6px 4px', fontSize: '0.68rem', borderRadius: '8px', color: '#c75e43', flex: 1, minWidth: '45px' }}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: LOBBY CO-OP & MISSÕES */}
      {activeSubTab === 'coop' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="neumorphic-card" style={{ padding: '24px', background: 'var(--panel-bg)', borderRadius: '20px', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-flat)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '700' }}>Lobby de Propostas Co-op</h4>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '8px 0', flexWrap: 'wrap' }}>
              {[
                { type: 'bonsai', name: 'Bonsai Co-op', color: '#4a7c59', level: 5, seed: 0.2 },
                { type: 'sakura', name: 'Cerejeira Co-op', color: '#e8a7b9', level: 3, seed: 0.4 },
                { type: 'rose', name: 'Roseira Co-op', color: '#c75e43', level: 4, seed: 0.8 }
              ].map(item => (
                <div
                  key={item.type}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'var(--bg-primary)',
                    border: '1.5px solid var(--card-border)',
                    textAlign: 'center',
                    flex: '1 1 90px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <div style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {renderMicroPlant(item.color, false, item.level, item.seed, 42)}
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-primary)', marginTop: '4px', fontWeight: '700' }}>{item.name}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Checkboxes pills for choosing friends */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Convidar Parceiros (Selecione um ou mais amigos):</span>
                {(!state.friends || state.friends.length === 0) ? (
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: '4px 0' }}>Você precisa adicionar e ser aceito por amigos para convidá-los.</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto', padding: '4px' }}>
                    {(state.friends || []).map(f => {
                      const isSelected = coopSelectedFriends.includes(f.uid);
                      return (
                        <button
                          type="button"
                          key={f.uid}
                          onClick={() => {
                            if (isSelected) {
                              setCoopSelectedFriends(coopSelectedFriends.filter(uid => uid !== f.uid));
                            } else {
                              setCoopSelectedFriends([...coopSelectedFriends, f.uid]);
                            }
                          }}
                          className="neumorphic-btn"
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            borderRadius: '10px',
                            background: isSelected ? 'var(--accent-color)' : 'var(--panel-bg)',
                            color: isSelected ? 'white' : 'var(--text-primary)',
                            border: isSelected ? '1px solid var(--accent-color)' : '1px solid var(--card-border)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {f.nickname}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '10px', flex: '1 1 100%' }}>
                  <input
                    type="number"
                    placeholder="Horas Metas"
                    value={coopHoursTarget}
                    onChange={(e) => setCoopHoursTarget(Math.max(1, Number(e.target.value)))}
                    className="input-field"
                    style={{ flex: 1, padding: '8px', borderRadius: '10px' }}
                  />
                  <select
                    value={coopDeadlineDays}
                    onChange={(e) => setCoopDeadlineDays(Number(e.target.value))}
                    className="input-field"
                    style={{ flex: 1, padding: '8px', borderRadius: '10px', background: 'var(--panel-bg)', color: 'var(--text-primary)' }}
                  >
                    <option value={1}>Prazo: 24h</option>
                    <option value={3}>Prazo: 3 dias</option>
                    <option value={7}>Prazo: 1 semana</option>
                  </select>
                </div>
              </div>

              {coopSelectedFriends.length > 0 && (
                <div style={{ padding: '10px 14px', background: 'rgba(var(--accent-rgb), 0.08)', borderRadius: '10px', fontSize: '0.78rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Recompensa dinâmica por sucesso:</span>
                  <strong>{Math.round(coopHoursTarget * 12 * (1 + 48 / (coopDeadlineDays * 24)))} Orvalhos para cada</strong>
                </div>
              )}

              <button
                disabled={coopSelectedFriends.length === 0}
                onClick={handleProposeMission}
                className="neumorphic-btn accent-btn"
                style={{ padding: '10px', borderRadius: '10px', fontWeight: '700', marginTop: '6px' }}
              >
                Propor Missão Co-op ({coopSelectedFriends.length})
              </button>
            </div>
          </div>

          {coopPendingInvites.length > 0 && (
            <div className="neumorphic-card" style={{ padding: '20px', background: 'var(--panel-bg)', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
              <h5 style={{ fontSize: '0.85rem', color: '#c75e43', fontWeight: '700', marginBottom: '12px' }}>Convites de Cultivo Pendentes</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {coopPendingInvites.map(invite => (
                  <div
                    key={invite.id}
                    style={{
                      padding: '12px 16px',
                      background: 'var(--bg-primary)',
                      border: '1.5px solid var(--card-border)',
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <h6 style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>Parceria de {invite.creatorName}</h6>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Meta: {invite.targetHours}h | Limite: {invite.deadlineHours}h</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleAcceptMission(invite.id)} className="neumorphic-btn accent-btn" style={{ padding: '6px 10px', fontSize: '0.72rem', borderRadius: '8px' }}>Aceitar</button>
                      <button onClick={() => handleRejectMission(invite.id)} className="neumorphic-btn" style={{ padding: '6px 10px', fontSize: '0.72rem', borderRadius: '8px', color: '#c75e43' }}>Recusar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="neumorphic-card" style={{ padding: '20px', background: 'var(--panel-bg)', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
            <h5 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '700', marginBottom: '12px' }}>Missões Ativas & Concluídas</h5>
            {coopActiveMissions.length === 0 ? (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Nenhuma missão no histórico.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {coopActiveMissions.map(m => {
                  const acceptedParticipants = (m.participants || []).filter(p => p.status === 'accepted');
                  const pendingParticipants = (m.participants || []).filter(p => p.status === 'pending');
                  const totalProgress = acceptedParticipants.reduce((sum, p) => sum + (p.progressMinutes || 0), 0);
                  const targetMinutes = m.targetHours * 60;
                  const percent = Math.min(100, Math.round((totalProgress / targetMinutes) * 100));
                  
                  return (
                    <div
                      key={m.id}
                      style={{
                        padding: '16px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--card-border)',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                            Missão Co-op ({acceptedParticipants.length} cultivadores)
                          </span>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Criador: {m.creatorName}
                          </p>
                        </div>
                        <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: m.status === 'active' ? 'var(--accent-color)' : m.status === 'completed' ? 'green' : '#c75e43', fontWeight: '700' }}>
                          {m.status === 'active' ? 'Em Progresso' : m.status === 'completed' ? 'Concluída' : 'Falha'}
                        </span>
                      </div>
                      
                      {/* Contributors breakdown */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--panel-bg)', padding: '8px 12px', borderRadius: '10px', fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'left' }}>
                        <strong style={{ fontSize: '0.74rem', color: 'var(--text-primary)' }}>Contribuições:</strong>
                        {acceptedParticipants.map(p => (
                          <div key={p.uid} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{p.name} {p.uid === currentUser.uid && '(Você)'}</span>
                            <strong>{((p.progressMinutes || 0) / 60).toFixed(1)}h</strong>
                          </div>
                        ))}
                        {pendingParticipants.length > 0 && (
                          <div style={{ marginTop: '2px', fontStyle: 'italic', fontSize: '0.68rem' }}>
                            Pendente aceitação de: {pendingParticipants.map(p => p.name).join(', ')}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          <span>Progresso Coletivo: {((totalProgress || 0) / 60).toFixed(1)}h / {m.targetHours}h</span>
                          <span>{percent}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'var(--panel-bg)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, height: '100%', background: m.status === 'completed' ? 'green' : 'var(--accent-color)' }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: GUILDAS */}
      {activeSubTab === 'guilds' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* BANNER DE CONVITES PENDENTES DE GUILDA */}
          {state.pendingGuildInvites && state.pendingGuildInvites.length > 0 && (
            <div className="neumorphic-card" style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.15) 0%, var(--panel-bg) 100%)',
              borderRadius: '16px',
              border: '1.5px solid var(--accent-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                Convites de Guilda Recebidos
              </div>
              {state.pendingGuildInvites.map(inv => (
                <div key={inv.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  background: 'var(--bg-primary)',
                  padding: '10px 14px',
                  borderRadius: '12px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {inv.senderName}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}> te convidou para a guilda </span>
                    <strong style={{ fontSize: '0.82rem', color: 'var(--accent-color)' }}>{inv.guildName}</strong>!
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={async () => {
                        const res = await acceptGuildInvite(inv.id, inv.guildId);
                        if (res.success) {
                          setAlertMsg(`Você agora faz parte da guilda ${inv.guildName}!`);
                          setTimeout(() => setAlertMsg(''), 3000);
                        } else {
                          setAlertMsg(res.error || "Erro ao aceitar convite.");
                          setTimeout(() => setAlertMsg(''), 3000);
                        }
                      }}
                      className="neumorphic-btn accent-btn"
                      style={{ padding: '6px 14px', fontSize: '0.75rem', borderRadius: '8px' }}
                    >
                      Aceitar Convite
                    </button>
                    <button
                      onClick={async () => {
                        await declineGuildInvite(inv.id);
                        setAlertMsg("Convite recusado.");
                        setTimeout(() => setAlertMsg(''), 3000);
                      }}
                      className="neumorphic-btn"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px', color: '#c75e43' }}
                    >
                      Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!state.activeGuild ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <form onSubmit={handleCreateGuild} className="neumorphic-card" style={{ padding: '24px', background: 'var(--panel-bg)', borderRadius: '20px', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-flat)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-primary)' }}>Fundar Nova Guilda</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Custo de fundação: 50 Orvalhos. Reúna seus amigos sob um único estandarte.</p>
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Nome da Guilda"
                    value={newGuildName}
                    onChange={(e) => setNewGuildName(e.target.value)}
                    className="input-field"
                    style={{ flex: '1 1 200px', padding: '8px' }}
                  />
                  <input
                    type="text"
                    placeholder="TAG (Até 4 letras)"
                    value={newGuildTag}
                    onChange={(e) => setNewGuildTag(e.target.value.substring(0, 4))}
                    className="input-field"
                    style={{ width: '120px', padding: '8px' }}
                  />
                </div>

                <textarea
                  placeholder="Descrição da Guilda"
                  value={newGuildDesc}
                  onChange={(e) => setNewGuildDesc(e.target.value)}
                  className="input-field"
                  style={{ padding: '8px', height: '60px', resize: 'none' }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Cor do Estandarte</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {['#2e633d', '#bf6732', '#4a154b', '#24658a', '#222222'].map(c => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => setNewGuildColor(c)}
                          style={{ width: '20px', height: '20px', borderRadius: '4px', background: c, border: newGuildColor === c ? '2px solid #fff' : 'none', cursor: 'pointer' }}
                        />
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Símbolo do Banner</span>
                    <select
                      value={newGuildIcon}
                      onChange={(e) => setNewGuildIcon(e.target.value)}
                      className="input-field"
                      style={{ padding: '6px', borderRadius: '6px', background: 'var(--panel-bg)', color: 'var(--text-primary)' }}
                    >
                      <option value="leaf">Folha</option>
                      <option value="book">Livro</option>
                      <option value="users">Estudantes</option>
                      <option value="award">Insígnia</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={state.orvalho < 50}
                  className="neumorphic-btn accent-btn"
                  style={{ padding: '10px', borderRadius: '10px', fontWeight: '700', marginTop: '6px' }}
                >
                  Fundar Guilda (Custo 50 Orvalhos)
                </button>
              </form>

              {/* Buscar e Entrar em Guildas */}
              <div className="neumorphic-card" style={{ padding: '24px', background: 'var(--panel-bg)', borderRadius: '20px', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-flat)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-primary)' }}>Buscar Guilda Existente</h4>
                <input
                  type="text"
                  placeholder="🔍 Buscar por nome ou tag..."
                  value={guildSearchQuery}
                  onChange={(e) => setGuildSearchQuery(e.target.value)}
                  className="input-field"
                  style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
                
                {loadingAllGuilds ? (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Buscando guildas...</p>
                ) : filteredGuilds.length === 0 ? (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center' }}>Nenhuma guilda encontrada para entrar.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                    {filteredGuilds.map(g => (
                      <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: g.bannerColor || '#2e633d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                            {renderGuildIcon(g.bannerIcon, 16)}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                              {g.name} <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)' }}>[{g.tag}]</span>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {g.description || 'Sem descrição.'}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                              {g.members?.length || 0} membros • {((g.totalFocusMinutes || 0) / 60).toFixed(0)}h focadas
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Deseja entrar na guilda ${g.name}?`)) {
                              const res = await joinGuildGroup(g.id);
                              if (res.success) {
                                alert(`Você entrou na guilda ${g.name}!`);
                              } else {
                                alert(`Erro ao entrar na guilda: ${res.error}`);
                              }
                            }
                          }}
                          className="neumorphic-btn accent-btn"
                          style={{ padding: '6px 12px', fontSize: '0.76rem', borderRadius: '8px', border: 'none' }}
                        >
                          Entrar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {loadingGuild || !guildFetchDone || (!guildData && !guildDocMissing && !guildFetchError) ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '40px 0', color: 'var(--text-secondary)' }}>
                  <div className="breath-animation">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2">
                      <path d="M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z" />
                      <path d="M4 15s1 1 3 1 3-1 3-1" />
                    </svg>
                  </div>
                  <p style={{ fontSize: '0.8rem' }}>Carregando estufa da guilda...</p>
                </div>
              ) : guildDocMissing ? (
                // Guild ID is saved locally but the Firestore document doesn't exist
                // (likely created before rules were published). Let the user detach and refound.
                <div style={{ textAlign: 'center', padding: '30px 16px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="1.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: '600' }}>Guilda não encontrada no servidor</p>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontStyle: 'italic', maxWidth: '280px', lineHeight: '1.5' }}>
                    Isso acontece quando a guilda foi criada antes das regras do Firestore serem publicadas.
                    Desvincule para fundar uma nova guilda.
                  </p>
                  <button
                    onClick={() => {
                      if (window.confirm('Desvincular guilda corrompida? Você receberá 50 Orvalhos de volta e poderá fundar uma nova.')) {
                        detachBrokenGuild();
                      }
                    }}
                    className="neumorphic-btn accent-btn"
                    style={{ marginTop: '8px', padding: '8px 20px', fontSize: '0.82rem', borderRadius: '10px' }}
                  >
                    🏚️ Desvincular e Fundar Nova Guilda
                  </button>
                </div>
              ) : guildFetchError ? (
                <div style={{ textAlign: 'center', padding: '30px 0', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Não foi possível carregar os dados da guilda.</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Verifique sua conexão ou tente recarregar.</p>
                  <button
                    onClick={() => {
                      setGuildFetchDone(false);
                      setGuildFetchError(false);
                      setLoadingGuild(true);
                      const ref = doc(db, 'guilds', state.activeGuild);
                      getDoc(ref).then(s => {
                        if (s.exists()) { setGuildData(s.data()); setGuildDocMissing(false); }
                        else { setGuildData(null); setGuildDocMissing(true); }
                      }).catch(() => { setGuildFetchError(true); }).finally(() => { setLoadingGuild(false); setGuildFetchDone(true); });
                    }}
                    className="neumorphic-btn"
                    style={{ marginTop: '8px', padding: '6px 16px', fontSize: '0.78rem', borderRadius: '8px' }}
                  >
                    Tentar Novamente
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className="neumorphic-card"
                    style={{
                      padding: '24px',
                      background: `linear-gradient(135deg, ${guildData.bannerColor} 0%, rgba(0,0,0,0.85) 100%)`,
                      color: '#fff',
                      borderRadius: '24px',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)' }}>
                        Estandarte da Guilda [{guildData.tag}]
                      </span>
                      
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={() => setShowInviteModal(true)}
                          className="neumorphic-btn accent-btn"
                          style={{ padding: '4px 12px', fontSize: '0.72rem', borderRadius: '8px', fontWeight: '700' }}
                        >
                          Convidar Amigo
                        </button>
                        <button
                          onClick={() => setShowGuildFrictionModal(true)}
                          className="neumorphic-btn"
                          style={{ padding: '4px 10px', fontSize: '0.68rem', borderRadius: '8px', color: '#ffd4d4', borderColor: 'rgba(255,255,255,0.3)' }}
                        >
                          Sair da Guilda
                        </button>
                      </div>
                    </div>
                    
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '700' }}>{guildData.name}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' }}>{guildData.description}</p>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>Líder: {guildData.leaderName}</span>
                  </div>

                  <div className="neumorphic-card" style={{ padding: '20px', background: 'var(--panel-bg)', borderRadius: '20px', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-flat)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '700' }}>Estufa Coletiva da Guilda</h4>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Projeções das melhores plantas de cada membro ativo.</p>
                      </div>
                    </div>

                    <div style={{
                      minHeight: '200px',
                      maxHeight: '350px',
                      overflowY: 'auto',
                      background: 'var(--bg-primary)',
                      borderRadius: '16px',
                      boxShadow: 'var(--shadow-inset)',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%'
                    }}>
                      <div style={{
                        width: '100%',
                        backgroundImage: 'radial-gradient(ellipse at center, rgba(var(--accent-rgb), 0.12) 0%, transparent 70%)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '24px',
                        padding: '20px',
                        boxSizing: 'border-box'
                      }}>
                        {(guildData.members || []).map((member, idx) => {
                          const plant = member.topPlant || { name: 'Broto', level: 1, hours: 0, color: '#4a7c59', seed: 0.5, wilted: false };
                          const gradeNum = parseFloat(String(plant.finalGrade || 0).replace(',', '.'));
                          const isConcluded = Boolean(plant.isConcludedPlant || plant.finalGrade);
                          const isGolden = Boolean(plant.isGolden || (isConcluded && gradeNum >= 8.5));
                          const plantSize = isConcluded ? (isGolden ? 58 : 50) : 38;
                          
                          return (
                            <div
                              key={member.uid}
                              className="tooltip-container"
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                width: '70px',
                                height: '90px',
                                justifyContent: 'flex-end'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                              <div style={{
                                width: '54px', height: '54px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '4px',
                                zIndex: 2
                              }}>
                                {renderMicroPlant(
                                  plant.color || '#4a7c59',
                                  plant.wilted || false,
                                  plant.level || 1,
                                  plant.seed || 0.5,
                                  plantSize,
                                  isConcluded,
                                  isGolden
                                )}
                              </div>

                              <span style={{ fontSize: '0.65rem', color: isGolden ? '#ffd700' : 'var(--text-secondary)', fontWeight: '700', marginTop: '2px', background: 'var(--panel-bg)', padding: '1px 6px', borderRadius: '6px', border: `1px solid ${isGolden ? '#ffd700' : 'var(--card-border)'}` }}>
                                {member.nickname}
                              </span>

                              <div className="tooltip-text" style={{
                                visibility: 'hidden',
                                width: '170px',
                                background: 'var(--panel-bg)',
                                color: 'var(--text-primary)',
                                textAlign: 'center',
                                borderRadius: '10px',
                                padding: '8px 10px',
                                position: 'absolute',
                                zIndex: 99,
                                bottom: '110%',
                                left: '50%',
                                marginLeft: '-85px',
                                opacity: 0,
                                transition: 'opacity 0.2s',
                                border: `1px solid ${isGolden ? '#ffd700' : 'var(--card-border)'}`,
                                boxShadow: isGolden ? '0 4px 16px rgba(255,215,0,0.35)' : '0 4px 12px rgba(0,0,0,0.15)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                pointerEvents: 'none'
                              }}>
                                <span style={{ fontSize: '0.78rem', fontWeight: '700' }}>{member.nickname}</span>
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>({member.title})</span>
                                <span style={{ fontSize: '0.7rem', color: isGolden ? '#ffd700' : 'var(--accent-color)', fontWeight: '700' }}>
                                  {isConcluded ? (isGolden ? 'Árvore Lendária de Aurum' : 'Flor da Vitória Cristalina') : `Planta: ${plant.name} (Nível ${plant.level})`}
                                </span>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                                  {isConcluded ? `Nota Final: ${plant.finalGrade || 'Concluída'}` : `Foco investido: ${plant.hours}h`}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {guildData.leaderUid === currentUser.uid && (
                    <div className="neumorphic-card" style={{ padding: '24px', background: 'var(--panel-bg)', borderRadius: '20px', border: '2px solid var(--accent-color)', boxShadow: 'var(--shadow-flat)' }}>
                      <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '700', marginBottom: '6px' }}>👑 Painel do Fundador</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Gerencie as diretrizes de estandarte e moderação dos membros da guilda.</p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--card-border)', textAlign: 'left' }}>
                                <th style={{ padding: '8px' }}>Membro</th>
                                <th style={{ padding: '8px' }}>Cargo / Título</th>
                                <th style={{ padding: '8px' }}>Planta Principal</th>
                                <th style={{ padding: '8px' }}>Ações</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(guildData.members || []).map(member => (
                                <tr key={member.uid} style={{ borderBottom: '1px solid var(--card-border)' }}>
                                  <td style={{ padding: '8px', fontWeight: '700' }}>{member.nickname} {member.uid === currentUser.uid && '(Você)'}</td>
                                  <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{member.uid === guildData.leaderUid ? 'Líder / Fundador' : member.title}</td>
                                  <td style={{ padding: '8px', color: 'var(--accent-color)', fontWeight: '600' }}>{member.topPlant?.name || 'Broto'} (Nível {member.topPlant?.level || 1})</td>
                                  <td style={{ padding: '8px' }}>
                                    {member.uid !== currentUser.uid && (
                                      <div style={{ display: 'flex', gap: '6px' }}>
                                        <button
                                          onClick={async () => {
                                            if (window.confirm(`Deseja mesmo transferir a liderança para ${member.nickname}?`)) {
                                              const res = await transferGuildLeadership(guildData.id, member.uid);
                                              if (res) alert("Liderança transferida!");
                                            }
                                          }}
                                          className="neumorphic-btn"
                                          style={{ padding: '2px 6px', fontSize: '0.68rem', borderRadius: '4px' }}
                                        >
                                          Promover
                                        </button>
                                        <button
                                          onClick={async () => {
                                            if (window.confirm(`Deseja remover ${member.nickname} da guilda?`)) {
                                              const res = await kickGuildMember(guildData.id, member.uid);
                                              if (res) alert("Membro removido.");
                                            }
                                          }}
                                          className="neumorphic-btn"
                                          style={{ padding: '2px 6px', fontSize: '0.68rem', borderRadius: '4px', color: '#c75e43' }}
                                        >
                                          Remover
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="neumorphic-card" style={{ padding: '20px', background: 'var(--panel-bg)', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
                    <h5 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '700', marginBottom: '10px' }}>📊 Classificação Saudável de Foco</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(() => {
                        const sortedGuilds = [...allGuilds].sort((a, b) => (b.totalFocusMinutes || 0) - (a.totalFocusMinutes || 0));
                        const rankingList = sortedGuilds.map((g, idx) => ({
                          rank: idx + 1,
                          name: g.id === state.activeGuild ? `${g.name} (Sua)` : g.name,
                          score: `${((g.totalFocusMinutes || 0) / 60).toFixed(0)} horas`,
                          active: g.id === state.activeGuild
                        }));
                        const displayRanks = rankingList.length > 0 ? rankingList : [{ rank: 1, name: `${guildData.name} (Sua)`, score: `${((guildData.totalFocusMinutes || 0) / 60).toFixed(0)} horas`, active: true }];
                        return displayRanks.map(rank => (
                          <div
                            key={rank.rank}
                            style={{
                              padding: '10px 14px',
                              borderRadius: '10px',
                              background: rank.active ? 'rgba(var(--accent-rgb), 0.05)' : 'var(--bg-primary)',
                              border: rank.active ? '1.5px solid var(--accent-color)' : '1px solid var(--card-border)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '0.8rem',
                              fontWeight: rank.active ? '700' : '400',
                              color: 'var(--text-primary)'
                            }}
                          >
                            <span>#{rank.rank} {rank.name}</span>
                            <span>{rank.score}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL CONVIDAR AMIGO PARA GUILDA */}
      {showInviteModal && guildData && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 998, padding: '20px'
        }}>
          <div className="neumorphic-card" style={{
            width: '100%', maxWidth: '380px',
            background: 'var(--panel-bg)', padding: '24px',
            borderRadius: '20px', display: 'flex', flexDirection: 'column',
            gap: '16px', animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                Convidar Amigos para {guildData.name}
              </h4>
              <button
                onClick={() => setShowInviteModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
              Seus amigos receberão uma notificação para se juntar à sua guilda.
            </p>

            <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(!state.friends || state.friends.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Você ainda não tem amigos adicionados na sua lista.
                </div>
              ) : (
                state.friends.map(friend => {
                  const isAlreadyMember = (guildData.members || []).some(m => m.uid === friend.uid);
                  const isInvited = invitedFriendUids.includes(friend.uid);

                  return (
                    <div key={friend.uid} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--panel-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          <StudentAvatar
                            skinColor={friend.avatarCustomization?.skinColor || '#ffd8b3'}
                            hairColor={friend.avatarCustomization?.hairColor || '#4a321a'}
                            hairId={friend.avatarCustomization?.hairId || 'hair_1'}
                            clothingId={friend.avatarCustomization?.clothingId || 'clothing_1'}
                            clothingColor={friend.avatarCustomization?.clothingColor || '#2e633d'}
                            size={36}
                          />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>{friend.nickname}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{friend.title || 'Estudante'}</div>
                        </div>
                      </div>

                      {isAlreadyMember ? (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Membro</span>
                      ) : isInvited ? (
                        <span style={{ fontSize: '0.72rem', color: '#4a7c59', fontWeight: '700' }}>Enviado!</span>
                      ) : (
                        <button
                          onClick={async () => {
                            const res = await inviteFriendToGuild(friend.uid, guildData.id, guildData.name);
                            if (res.success) {
                              setInvitedFriendUids(prev => [...prev, friend.uid]);
                            } else {
                              setAlertMsg(res.error || "Erro ao convidar.");
                              setTimeout(() => setAlertMsg(''), 3000);
                            }
                          }}
                          className="neumorphic-btn accent-btn"
                          style={{ padding: '5px 12px', fontSize: '0.75rem', borderRadius: '8px' }}
                        >
                          Convidar
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setShowInviteModal(false)}
              className="neumorphic-btn"
              style={{ width: '100%', padding: '10px', borderRadius: '10px', fontSize: '0.85rem' }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {showGuildFrictionModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="neumorphic-card" style={{
            maxWidth: '450px', width: '100%', background: 'var(--bg-primary)', borderRadius: '24px', padding: '24px', border: '2px solid #c75e43', boxShadow: 'var(--shadow-flat)', display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <h4 style={{ fontSize: '1.1rem', color: '#c75e43', fontWeight: '700' }}>Atenção: Ação Crítica</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Ao sair desta guilda, você perderá todas as contribuições acumuladas no estandarte e na estufa coletiva. Se você for o líder, a liderança será transferida para outro membro ativo.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Digite "SAIR" para habilitar a saída imediata:</span>
                <input
                  type="text"
                  placeholder="SAIR"
                  value={guildFrictionInput}
                  onChange={(e) => setGuildFrictionInput(e.target.value)}
                  className="input-field"
                  style={{ padding: '8px', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600' }}>OU segure pressionado o botão abaixo por 3 segundos:</span>
                <button
                  onMouseDown={handleStartHoldLeave}
                  onMouseUp={handleStopHoldLeave}
                  onMouseLeave={handleStopHoldLeave}
                  onTouchStart={handleStartHoldLeave}
                  onTouchEnd={handleStopHoldLeave}
                  className="neumorphic-btn"
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    color: '#c75e43',
                    background: guildLeaveCountdown > 0 ? 'rgba(235,94,85,0.1)' : 'var(--bg-primary)',
                    border: '1.5px solid #c75e43',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  {guildLeaveCountdown > 0 ? `Segurando... ${guildLeaveCountdown}s` : 'Segure aqui por 3s'}
                </button>
              </div>

            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button onClick={() => { setShowGuildFrictionModal(false); setGuildFrictionInput(''); }} className="neumorphic-btn" style={{ padding: '8px 16px', borderRadius: '8px' }}>Voltar</button>
              <button
                disabled={guildFrictionInput !== 'SAIR'}
                onClick={handleLeaveGuild}
                className="neumorphic-btn accent-btn"
                style={{ padding: '8px 16px', borderRadius: '8px', background: '#c75e43', color: '#fff' }}
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
