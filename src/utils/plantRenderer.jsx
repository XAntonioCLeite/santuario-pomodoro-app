// Autor: Antônio Costa Leite
// Utilitários de Renderização de Plantas Vetoriais e Animações (O Santuário)

import React from 'react';

// Gerador determinístico de números pseudo-aleatórios
export const getRand = (seed, salt) => {
  const x = Math.sin(seed * 12345.6789 + salt) * 10000;
  return x - Math.floor(x);
};

// Map study minutes to level names and levels
export const getPlantRank = (minutes) => {
  if (minutes < 45) return { name: "Gêmula do Alvorecer", level: 1 };
  if (minutes < 120) return { name: "Brisa Verdejante", level: 2 };
  if (minutes < 240) return { name: "Florescência Rara", level: 3 };
  if (minutes < 360) return { name: "Jardim Ancestral", level: 4 };
  return { name: "Santuário Imemorial", level: 5 };
};

// Canvas drawing helper for decorations
export const drawDecorationToCanvas = (ctx, type, cx, cy, size = 40, color = '#4a7c59') => {
  const strokeColor = '#2b3531';
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = color;
  
  // Shift translation so cy represents the exact floor line of the item
  ctx.translate(cx, cy - size / 2);

  if (type === 'book') {
    // Open book shape
    ctx.beginPath();
    ctx.moveTo(-size/2, size/3);
    ctx.lineTo(0, size/4);
    ctx.lineTo(size/2, size/3);
    ctx.lineTo(size/2, -size/3);
    ctx.lineTo(0, -size/2);
    ctx.lineTo(-size/2, -size/3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -size/2);
    ctx.lineTo(0, size/4);
    ctx.stroke();
  } else if (type === 'quill') {
    // Quill feather & inkwell
    ctx.fillRect(-8, size/6, 16, size/3);
    ctx.strokeRect(-8, size/6, 16, size/3);
    ctx.beginPath();
    ctx.moveTo(0, size/6);
    ctx.lineTo(10, -size/2);
    ctx.stroke();
    // feather bristles
    ctx.beginPath();
    ctx.moveTo(2, -size/12); ctx.lineTo(8, -size/6);
    ctx.moveTo(5, -size/4); ctx.lineTo(11, -size/3);
    ctx.stroke();
  } else if (type === 'harp') {
    // Greek harp
    ctx.beginPath();
    ctx.moveTo(-size/3, size/2);
    ctx.lineTo(-size/3, -size/2);
    ctx.lineTo(size/3, -size/2);
    ctx.bezierCurveTo(size/3, -size/2, 0, size/6, size/3, size/2);
    ctx.stroke();
    // strings
    ctx.beginPath();
    ctx.moveTo(-size/6, -size/2); ctx.lineTo(-size/6, size/3);
    ctx.moveTo(0, -size/2); ctx.lineTo(0, size/4);
    ctx.moveTo(size/6, -size/2); ctx.lineTo(size/6, size/4);
    ctx.stroke();
  } else if (type === 'microscope') {
    // Microscope
    ctx.beginPath();
    ctx.moveTo(-size/3, size/2);
    ctx.lineTo(size/3, size/2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, size/2);
    ctx.lineTo(0, size/6);
    ctx.quadraticCurveTo(-size/3, size/6, -size/4, -size/4);
    ctx.stroke();
    ctx.save();
    ctx.translate(0, -size/6);
    ctx.rotate(-Math.PI/6);
    ctx.fillStyle = color;
    ctx.fillRect(-4, -size/3, 8, size*0.7);
    ctx.strokeRect(-4, -size/3, 8, size*0.7);
    ctx.restore();
  } else if (type === 'dna') {
    // DNA Double helix
    ctx.beginPath();
    for (let x = -size/2; x <= size/2; x++) {
      const y1 = Math.sin(x * 0.18) * (size/4);
      ctx.lineTo(x, y1);
    }
    ctx.stroke();
    ctx.beginPath();
    for (let x = -size/2; x <= size/2; x++) {
      const y2 = -Math.sin(x * 0.18) * (size/4);
      ctx.lineTo(x, y2);
    }
    ctx.stroke();
    // connectors
    ctx.beginPath();
    ctx.moveTo(-size/4, -size/6); ctx.lineTo(-size/4, size/6);
    ctx.moveTo(0, -size/4); ctx.lineTo(0, size/4);
    ctx.moveTo(size/4, -size/6); ctx.lineTo(size/4, size/6);
    ctx.stroke();
  } else if (type === 'heart') {
    // Heart
    ctx.beginPath();
    ctx.moveTo(0, size/3);
    ctx.bezierCurveTo(-size/2, -size/12, -size/2, -size/2, 0, -size/6);
    ctx.bezierCurveTo(size/2, -size/2, size/2, -size/12, 0, size/3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (type === 'flask') {
    // Flask outline
    ctx.beginPath();
    ctx.moveTo(-size/6, -size/2);
    ctx.lineTo(size/6, -size/2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-size/8, -size/2);
    ctx.lineTo(-size/8, -size/6);
    ctx.lineTo(-size/2, size/3);
    ctx.lineTo(-size/2, size/2);
    ctx.lineTo(size/2, size/2);
    ctx.lineTo(size/2, size/3);
    ctx.lineTo(size/8, -size/6);
    ctx.lineTo(size/8, -size/2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (type === 'abacus') {
    // Abacus
    ctx.strokeRect(-size/2, -size/3, size, size*0.7);
    ctx.beginPath();
    ctx.moveTo(-size/2, -size/12); ctx.lineTo(size/2, -size/12);
    ctx.moveTo(-size/2, size/6); ctx.lineTo(size/2, size/6);
    ctx.stroke();
    // beads
    ctx.beginPath();
    ctx.arc(-size/4, -size/12, 3, 0, Math.PI*2);
    ctx.arc(0, -size/12, 3, 0, Math.PI*2);
    ctx.arc(size/4, size/6, 3, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
  } else if (type === 'atom') {
    // Atom
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.rotate(Math.PI/6);
    ctx.beginPath(); ctx.ellipse(0, 0, size/2, size/6, 0, 0, Math.PI*2); ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.rotate(-Math.PI/6);
    ctx.beginPath(); ctx.ellipse(0, 0, size/2, size/6, 0, 0, Math.PI*2); ctx.stroke();
    ctx.restore();
  } else if (type === 'telescope') {
    // Telescope on stand
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size/3, size/2);
    ctx.moveTo(0, 0);
    ctx.lineTo(size/3, size/2);
    ctx.stroke();
    ctx.save();
    ctx.translate(0, -size/6);
    ctx.rotate(-Math.PI/4);
    ctx.fillRect(-size/2, -5, size, 10);
    ctx.strokeRect(-size/2, -5, size, 10);
    ctx.restore();
  } else if (type === 'globe') {
    // Globe
    ctx.beginPath();
    ctx.arc(0, -size/12, size/3, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -size/12, size/3.2, Math.PI/2, Math.PI*1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-size/3, size/2);
    ctx.lineTo(size/3, size/2);
    ctx.stroke();
  } else if (type === 'compass') {
    // Compass
    ctx.beginPath();
    ctx.arc(0, 0, size/3.2, 0, Math.PI*2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -size/3); ctx.lineTo(3, 0); ctx.lineTo(0, size/3); ctx.lineTo(-3, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (type === 'crystal') {
    // Gemstone crystal
    ctx.beginPath();
    ctx.moveTo(0, -size/2);
    ctx.lineTo(size/3, -size/6);
    ctx.lineTo(0, size/2);
    ctx.lineTo(-size/3, -size/6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-size/3, -size/6);
    ctx.lineTo(size/3, -size/6);
    ctx.moveTo(0, -size/2);
    ctx.lineTo(0, size/2);
    ctx.stroke();
  } else if (type === 'hourglass') {
    // Hourglass
    ctx.fillRect(-size/3, -size/2, size*0.66, 4);
    ctx.strokeRect(-size/3, -size/2, size*0.66, 4);
    ctx.fillRect(-size/3, size/3, size*0.66, 4);
    ctx.strokeRect(-size/3, size/3, size*0.66, 4);
    ctx.beginPath();
    ctx.moveTo(-size/4, -size/2 + 4);
    ctx.lineTo(0, -size/12);
    ctx.lineTo(-size/4, size/3);
    ctx.lineTo(size/4, size/3);
    ctx.lineTo(0, -size/12);
    ctx.lineTo(size/4, -size/2 + 4);
    ctx.closePath();
    ctx.stroke();
  } else if (type === 'bonsai') {
    // Bonsai tree
    ctx.beginPath();
    ctx.moveTo(-size/2, size/3);
    ctx.lineTo(size/2, size/3);
    ctx.lineTo(size/3, size/2);
    ctx.lineTo(-size/3, size/2);
    ctx.closePath();
    ctx.fillStyle = '#b3a094';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, size/3);
    ctx.quadraticCurveTo(-size/4, size/12, -size/6, -size/6);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#5a4d41';
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(-size/4, -size/6, size/3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size/6, -size/4, size/4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (type === 'prism') {
    // Newton Prism
    ctx.beginPath();
    ctx.moveTo(0, -size/2);
    ctx.lineTo(size/2, size/3);
    ctx.lineTo(-size/2, size/3);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(0, -size/4); ctx.lineTo(size/3, 0); ctx.stroke();
    ctx.strokeStyle = '#00d2ff';
    ctx.beginPath();
    ctx.moveTo(0, -size/4); ctx.lineTo(size/3.5, size/8); ctx.stroke();
  } else if (type === 'astrolabe') {
    // Astrolabe
    ctx.beginPath();
    ctx.arc(0, 0, size/2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#d4af37';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, size/4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-size/3, 0); ctx.lineTo(size/3, 0);
    ctx.moveTo(0, -size/3); ctx.lineTo(0, size/3);
    ctx.stroke();
  } else if (type === 'chip') {
    // Silicon Chip
    ctx.fillStyle = '#222222';
    ctx.fillRect(-size/3, -size/3, size*0.66, size*0.66);
    ctx.strokeRect(-size/3, -size/3, size*0.66, size*0.66);
    ctx.fillStyle = '#00ffcc';
    ctx.fillRect(-size/6, -size/6, size/3, size/3);
  } else if (type === 'alchemy') {
    // Potion Vial
    ctx.beginPath();
    ctx.arc(0, size/6, size/3, 0, Math.PI * 2);
    ctx.fillStyle = '#9b51e0';
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(-4, -size/2, 8, size/3);
    ctx.strokeRect(-4, -size/2, 8, size/3);
  } else if (type === 'codex') {
    // Stone Codex Tablet
    ctx.fillStyle = '#e0deda';
    ctx.fillRect(-size/3, -size/2, size*0.66, size);
    ctx.strokeRect(-size/3, -size/2, size*0.66, size);
    ctx.beginPath();
    ctx.moveTo(-size/4, -size/3); ctx.lineTo(size/4, -size/3);
    ctx.moveTo(-size/4, 0); ctx.lineTo(size/4, 0);
    ctx.moveTo(-size/4, size/3); ctx.lineTo(size/4, size/3);
    ctx.stroke();
  } else if (type === 'palette') {
    // Artist Palette
    ctx.beginPath();
    ctx.ellipse(0, 0, size/2.2, size/3, Math.PI/6, 0, Math.PI * 2);
    ctx.fillStyle = '#e8cfa6';
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e74c3c'; ctx.beginPath(); ctx.arc(-size/4, -size/8, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#3498db'; ctx.beginPath(); ctx.arc(0, -size/6, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(size/4, -size/8, 3, 0, Math.PI*2); ctx.fill();
  } else if (type === 'socrates') {
    // Socrates Bust
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(-size/4, size/6, size/2, size/3);
    ctx.strokeRect(-size/4, size/6, size/2, size/3);
    ctx.beginPath();
    ctx.arc(0, -size/6, size/3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
};

// Canvas drawing helper for plants
export const drawPlantToCanvas = (ctx, cx, cy, scale = 1, color = '#4a7c59', wilted = false, level = 3, seed = 0.5) => {
  const strokeColor = wilted ? '#a39890' : '#2b3531';
  const leafColor = wilted ? '#b5aba4' : color;
  const rVal = (salt) => getRand(seed, salt);
  const centerColors = ['#f4d06f', '#e6a15c', '#d67460', '#df8a49', '#e0b883'];
  const centerColor = centerColors[Math.floor(rVal(30) * centerColors.length)];

  ctx.save();
  // Translate shifted by -30 * scale so cy represents the exact floor line of the pot
  ctx.translate(cx, cy - 30 * scale);
  ctx.scale(scale, scale);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = leafColor;

  // Draw Pot (for levels > 0)
  if (level > 0) {
    // Soil
    ctx.beginPath();
    ctx.ellipse(0, 14, 11, 2.5, 0, 0, 2 * Math.PI);
    ctx.fillStyle = '#6d5440'; // Soil brown
    ctx.fill();
    ctx.stroke();

    // Pot Body
    ctx.beginPath();
    ctx.arc(0, 22, 10, Math.PI, 0, true);
    ctx.lineTo(12, 14);
    ctx.arc(0, 14, 12, 0, Math.PI, true);
    ctx.closePath();
    ctx.fillStyle = '#e89e7d'; // Warm terracotta
    ctx.fill();
    ctx.stroke();

    // Emblem (little green leaf on the pot)
    ctx.beginPath();
    ctx.arc(0, 20, 2.2, 0, 2 * Math.PI);
    ctx.fillStyle = '#4a7c59'; // Leaf green
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.lineWidth = 2.5; // restore original line width
  }

  // Draw Stems and Foliage based on levels
  if (level === 1) {
    // Sprout: Chubby curved leaves
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.quadraticCurveTo(-4, -6, -3, -15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.quadraticCurveTo(4, -6, 3, -15);
    ctx.stroke();

    ctx.save();
    ctx.translate(-3, -15);
    ctx.rotate(-Math.PI/4);
    ctx.beginPath();
    ctx.ellipse(0, -6, 6, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = leafColor;
    ctx.fill();
    ctx.stroke();
    if (!wilted) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-1.8, -8, 1.5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(3, -15);
    ctx.rotate(Math.PI/4);
    ctx.beginPath();
    ctx.ellipse(0, -6, 6, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = leafColor;
    ctx.fill();
    ctx.stroke();
    if (!wilted) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-1.8, -8, 1.5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  } else if (level === 2) {
    // Young plant: Chubby 3 leaves clover style
    const stems = [
      { tx: -8, ty: -18, rx: -10, ry: -5, angle: -Math.PI/3 },
      { tx: 0, ty: -24, rx: 0, ry: -10, angle: 0 },
      { tx: 8, ty: -18, rx: 10, ry: -5, angle: Math.PI/3 }
    ];
    
    stems.forEach(stem => {
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.quadraticCurveTo(stem.rx, stem.ry, stem.tx, stem.ty);
      ctx.stroke();

      ctx.save();
      ctx.translate(stem.tx, stem.ty);
      ctx.rotate(stem.angle);
      ctx.beginPath();
      ctx.ellipse(0, -7, 7, 9, 0, 0, Math.PI*2);
      ctx.fillStyle = leafColor;
      ctx.fill();
      ctx.stroke();
      if (!wilted) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(-1.8, -9, 1.8, 3.5, 0, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
    });
  } else if (level === 3) {
    // Flower: Plump petals and smiley face inside flower center
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.quadraticCurveTo(0, -10, 0, -28);
    ctx.stroke();

    ctx.save();
    ctx.translate(-8, -10);
    ctx.rotate(-Math.PI/6);
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 8, 0, 0, Math.PI*2);
    ctx.fillStyle = leafColor;
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(8, -8);
    ctx.rotate(Math.PI/6);
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 8, 0, 0, Math.PI*2);
    ctx.fillStyle = leafColor;
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(0, -28);
    if (!wilted) {
      const petalColor = color === '#4a7c59' ? '#ffd1dc' : color;
      ctx.fillStyle = petalColor;
      const petalCount = 8;
      for (let i = 0; i < petalCount; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / petalCount);
        ctx.beginPath();
        ctx.ellipse(0, -11, 6, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fillStyle = centerColor;
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.rotate(Math.PI/3);
      ctx.beginPath();
      ctx.ellipse(0, 8, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  } else if (level === 4) {
    // Tree
    const endX = rVal(3) * 6 - 3;
    const endY = -50;
    const leftEndX = -24;
    const leftEndY = -35;
    const rightEndX = 24;
    const rightEndY = -32;

    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.quadraticCurveTo(0, -25, endX, endY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.quadraticCurveTo(-18, -15, leftEndX, leftEndY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.quadraticCurveTo(18, -15, rightEndX, rightEndY);
    ctx.stroke();

    if (!wilted) {
      // Crowns of tree
      ctx.beginPath();
      ctx.arc(endX, endY - 6, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(leftEndX, leftEndY - 4, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(rightEndX, rightEndY - 4, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Details inside
      ctx.fillStyle = centerColor;
      ctx.beginPath();
      ctx.arc(endX, endY - 6, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(leftEndX, leftEndY - 4, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(endX + 3, endY + 4, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  } else if (level === 5) {
    // Sanctuary (Imemorial)
    const endX = rVal(3) * 4 - 2;
    const endY = -58;
    const leftEndX = -28;
    const leftEndY = -42;
    const rightEndX = 28;
    const rightEndY = -38;
    const leftLowX = -20;
    const leftLowY = -20;
    const rightLowX = 20;
    const rightLowY = -18;

    // Golden trim on pot
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-13, 14);
    ctx.lineTo(13, 14);
    ctx.stroke();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;

    // Branches
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.quadraticCurveTo(0, -30, endX, endY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.quadraticCurveTo(-22, -22, leftEndX, leftEndY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.quadraticCurveTo(22, -22, rightEndX, rightEndY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.quadraticCurveTo(-15, -10, leftLowX, leftLowY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.quadraticCurveTo(15, -10, rightLowX, rightLowY);
    ctx.stroke();

    if (!wilted) {
      // Draw grand flowers/leaf masses
      ctx.fillStyle = leafColor;
      ctx.beginPath();
      ctx.arc(endX, endY - 8, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(leftEndX, leftEndY - 5, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(rightEndX, rightEndY - 5, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Low buds
      ctx.fillStyle = '#e69c5e';
      ctx.beginPath();
      ctx.arc(leftLowX, leftLowY - 3, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(rightLowX, rightLowY - 3, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Centers
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(endX, endY - 8, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(endX, endY - 8, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = centerColor;
      ctx.beginPath();
      ctx.arc(leftEndX, leftEndY - 5, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rightEndX, rightEndY - 5, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(endX + 3, endY + 4, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(leftEndX + 2, leftEndY + 2, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  ctx.restore();
};

// Renderizador do elemento vetorial completo da planta
export const renderLargePlant = (color = '#4a7c59', wilted = false, level = 3, seed = 0.5, isConcludedPlant = false, isGolden = false) => {
  const strokeColor = wilted ? '#a39890' : 'var(--text-primary)';
  const leafColor = isGolden ? '#ffd700' : (wilted ? '#b5aba4' : color);
  
  // Deterministic random generator based on the seed
  const rVal = (salt) => getRand(seed, salt);
  
  // Decide flower style based on seed
  const flowerStyles = ['daisy', 'rose', 'tulip', 'lotus', 'sunflower'];
  const flowerStyle = flowerStyles[Math.floor(rVal(10) * flowerStyles.length)];
  
  const centerColors = ['#f4d06f', '#e6a15c', '#d67460', '#df8a49', '#e0b883'];
  const centerColor = centerColors[Math.floor(rVal(30) * centerColors.length)];

  // Função auxiliar para desenho dinâmico das pétalas
  const drawPetals = (style, size = 1, customColor = leafColor) => {
    if (style === 'daisy') {
      const petals = [];
      const count = 8;
      for (let i = 0; i < count; i++) {
        const angle = (i * 360) / count;
        petals.push(
          <ellipse key={i} cx="0" cy={-14 * size} rx={5 * size} ry={11 * size} fill={customColor} stroke={strokeColor} strokeWidth="1.5" style={{ transform: `rotate(${angle}deg)`, transformOrigin: '0px 0px' }} />
        );
      }
      return petals;
    } else if (style === 'lotus') {
      const petals = [];
      const count = 6;
      for (let i = 0; i < count; i++) {
        const angle = (i * 360) / count;
        petals.push(
          <path key={i} d={`M0 0 C ${-8*size} ${-8*size}, ${-4*size} ${-22*size}, 0 ${-26*size} C ${4*size} ${-22*size}, ${8*size} ${-8*size}, 0 0`} fill={customColor} stroke={strokeColor} strokeWidth="1.5" style={{ transform: `rotate(${angle}deg)`, transformOrigin: '0px 0px' }} />
        );
      }
      return petals;
    } else if (style === 'tulip') {
      return (
        <g>
          <path d={`M${-12*size} ${-6*size} C ${-18*size} ${-24*size}, ${-4*size} ${-30*size}, 0 ${-18*size} C ${4*size} ${-30*size}, ${18*size} ${-24*size}, ${12*size} ${-6*size} Z`} fill={customColor} stroke={strokeColor} strokeWidth="1.5" />
          <path d={`M${-6*size} ${-6*size} C ${-8*size} ${-16*size}, ${8*size} ${-16*size}, ${6*size} ${-6*size}`} fill={centerColor} stroke={strokeColor} strokeWidth="1.5" />
        </g>
      );
    } else if (style === 'sunflower') {
      const petals = [];
      const count = 12;
      for (let i = 0; i < count; i++) {
        const angle = (i * 360) / count;
        petals.push(
          <path key={i} d={`M${-3*size} 0 L0 ${-16*size} L${3*size} 0 Z`} fill="#f3be32" stroke={strokeColor} strokeWidth="1" style={{ transform: `rotate(${angle}deg)`, transformOrigin: '0px 0px' }} />
        );
      }
      return (
        <g>
          {petals}
          <circle cx="0" cy="0" r={9 * size} fill={centerColor} stroke={strokeColor} strokeWidth="1.5" />
        </g>
      );
    } else { // rose-like
      return (
        <g>
          <circle cx="0" cy="0" r={14 * size} fill={customColor} stroke={strokeColor} strokeWidth="1.5" />
          <circle cx={-4*size} cy={-2*size} r={8 * size} fill="none" stroke={strokeColor} strokeWidth="1.2" />
          <circle cx={4*size} cy={2*size} r={8 * size} fill="none" stroke={strokeColor} strokeWidth="1.2" />
          <circle cx="0" cy="0" r={5 * size} fill={centerColor} stroke={strokeColor} strokeWidth="1.5" />
        </g>
      );
    }
  };

  // Level 1: Dawn Sprout (Gêmula do Alvorecer)
  if (level === 1) {
    const stemCurveX = 50 + (rVal(1) * 20 - 10);
    const stemCurveY = 60 + (rVal(2) * 20 - 10);
    const stemEndX = 50 + (rVal(3) * 16 - 8);
    const stemEndY = 35 + (rVal(4) * 10);
    
    return (
      <svg width="150" height="200" viewBox="0 0 100 150" style={{ margin: '0 auto', display: 'block', animation: wilted ? 'none' : 'sway 7s infinite ease-in-out', transformOrigin: '50px 140px' }}>
        <path d="M35 115 L65 115 L60 140 L40 140 Z" fill="#d2c4bc" stroke={strokeColor} strokeWidth="2.5" />
        <rect x="30" y="108" width="40" height="7" rx="1.5" fill="#bfaea5" stroke={strokeColor} strokeWidth="2.5" />
        
        <path d={`M50 108 Q ${stemCurveX} ${stemCurveY}, ${stemEndX} ${stemEndY}`} fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
        
        {!wilted ? (
          <g style={{ transform: `translate(${stemEndX}px, ${stemEndY}px)` }}>
            <path d="M0 0 C -15 -10, -10 -25, 0 -20 C 10 -25, 15 -10, 0 0" fill={leafColor} stroke={strokeColor} strokeWidth="1.5" />
            <circle cx="0" cy="-22" r="3" fill={centerColor} />
          </g>
        ) : (
          <g style={{ transform: `translate(${stemEndX}px, ${stemEndY}px) rotate(35deg)` }}>
            <path d="M0 0 C -10 5, -15 15, 0 15" fill="#a39890" stroke={strokeColor} strokeWidth="1.5" />
          </g>
        )}
      </svg>
    );
  }

  // Level 2: Young Plant (Brisa Verdejante)
  if (level === 2) {
    const stemCurveX1 = 45 + (rVal(1) * 10 - 5);
    const stemCurveY1 = 75 + (rVal(2) * 10 - 5);
    const stemEndX = 45 + (rVal(3) * 10 - 5);
    const stemEndY = 45 + (rVal(4) * 10);
    
    const sideCurveX = 55 + (rVal(5) * 10);
    const sideCurveY = 80 - (rVal(6) * 10);
    const sideEndX = 65 + (rVal(7) * 10);
    const sideEndY = 55 - (rVal(8) * 10);

    return (
      <svg width="150" height="200" viewBox="0 0 100 150" style={{ margin: '0 auto', display: 'block', animation: wilted ? 'none' : 'sway 7s infinite ease-in-out', transformOrigin: '50px 140px' }}>
        <path d="M32 112 L68 112 L63 140 L37 140 Z" fill="#c4b0a5" stroke={strokeColor} strokeWidth="2.5" />
        <rect x="27" y="105" width="46" height="7" rx="1.5" fill="#ab978c" stroke={strokeColor} strokeWidth="2.5" />
        
        <path d={`M50 105 Q ${stemCurveX1} ${stemCurveY1}, ${stemEndX} ${stemEndY}`} fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
        <path d={`M50 105 Q ${sideCurveX} ${sideCurveY}, ${sideEndX} ${sideEndY}`} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
        
        {!wilted ? (
          <>
            <g style={{ transform: `translate(${stemEndX}px, ${stemEndY}px)` }}>
              <path d="M-6 0 C -12 -12, 0 -22, 0 -25 C 0 -22, 12 -12, 6 0 Z" fill={leafColor} stroke={strokeColor} strokeWidth="1.5" />
              <circle cx="0" cy="-10" r="4.5" fill={centerColor} stroke={strokeColor} strokeWidth="1" />
            </g>
            <g style={{ transform: `translate(${sideEndX}px, ${sideEndY}px) rotate(45deg)` }}>
              <path d="M0 0 C -8 -5, -8 -15, 0 -18 C 8 -15, 8 -5, 0 0" fill={leafColor} stroke={strokeColor} strokeWidth="1.5" />
            </g>
          </>
        ) : (
          <>
            <g style={{ transform: `translate(${stemEndX}px, ${stemEndY}px) rotate(20deg)` }}>
              <circle cx="0" cy="5" r="5" fill="#a39890" stroke={strokeColor} strokeWidth="1.5" />
            </g>
            <g style={{ transform: `translate(${sideEndX}px, ${sideEndY}px) rotate(60deg)` }}>
              <path d="M0 0 C -5 5, -10 10, -2 12" stroke={strokeColor} strokeWidth="1.5" />
            </g>
          </>
        )}
      </svg>
    );
  }

  // Level 3: Blooming Flower (Florescência Rara)
  if (level === 3) {
    const stemCurveX1 = 40 + (rVal(1) * 12);
    const stemCurveY1 = 70 + (rVal(2) * 15);
    const stemEndX = 45 + (rVal(3) * 10 - 5);
    const stemEndY = 35 + (rVal(4) * 10);
    
    const leftCurveX = 35 - (rVal(5) * 10);
    const leftCurveY = 85 - (rVal(6) * 15);
    const leftEndX = 25 - (rVal(7) * 8);
    const leftEndY = 60 - (rVal(8) * 10);
    
    const rightCurveX = 65 + (rVal(9) * 10);
    const rightCurveY = 80 - (rVal(10) * 15);
    const rightEndX = 75 + (rVal(11) * 8);
    const rightEndY = 55 - (rVal(12) * 10);

    return (
      <svg width="150" height="200" viewBox="0 0 100 150" style={{ margin: '0 auto', display: 'block', animation: wilted ? 'none' : 'sway 7s infinite ease-in-out', transformOrigin: '50px 140px' }}>
        <path d="M30 110 L70 110 L65 140 L35 140 Z" fill="#c4b0a5" stroke={strokeColor} strokeWidth="3" />
        <rect x="25" y="102" width="50" height="8" rx="2" fill="#ab978c" stroke={strokeColor} strokeWidth="3" />
        
        <path d={`M50 102 C ${stemCurveX1} 80, ${stemCurveX1} 60, ${stemEndX} ${stemEndY}`} fill="none" stroke={strokeColor} strokeWidth="4.5" strokeLinecap="round" />
        <path d={`M50 102 Q ${leftCurveX} ${leftCurveY}, ${leftEndX} ${leftEndY}`} fill="none" stroke={strokeColor} strokeWidth="3.2" strokeLinecap="round" />
        <path d={`M50 102 Q ${rightCurveX} ${rightCurveY}, ${rightEndX} ${rightEndY}`} fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
        
        {!wilted ? (
          <>
            <g style={{ transform: `translate(${stemEndX}px, ${stemEndY}px)` }}>
              {drawPetals(flowerStyle, 1)}
              {flowerStyle !== 'sunflower' && flowerStyle !== 'rose' && flowerStyle !== 'tulip' && (
                <circle cx="0" cy="0" r="6" fill={centerColor} stroke={strokeColor} strokeWidth="1.5" />
              )}
            </g>
            <circle cx={leftEndX} cy={leftEndY} r="6" fill={leafColor} stroke={strokeColor} strokeWidth="2" />
            <g style={{ transform: `translate(${rightEndX}px, ${rightEndY}px) rotate(45deg)` }}>
              <path d="M0 0 C -8 -4, -8 -12, 0 -15 C 8 -12, 8 -4, 0 0" fill={leafColor} stroke={strokeColor} strokeWidth="1.5" />
            </g>
          </>
        ) : (
          <>
            <g style={{ transform: `translate(${stemEndX}px, ${stemEndY}px) rotate(35deg)` }}>
              <circle cx="0" cy="5" r="9" fill="#a39890" stroke={strokeColor} strokeWidth="2.5" />
              <path d="M-8 10 C -12 12, -4 18, 0 12" stroke={strokeColor} strokeWidth="1.5" />
            </g>
            <g style={{ transform: `translate(${leftEndX}px, ${leftEndY}px) rotate(-40deg)` }}>
              <circle cx="0" cy="3" r="4" fill="#a39890" stroke={strokeColor} strokeWidth="1.5" />
            </g>
          </>
        )}
      </svg>
    );
  }

  // Level 4: Tree of Transcendence (Jardim Ancestral)
  if (level === 4) {
    const mainCurveX = 50 + (rVal(1) * 10 - 5);
    const mainCurveY = 70 + (rVal(2) * 10 - 5);
    const mainEndX = 50 + (rVal(3) * 10 - 5);
    const mainEndY = 26 + (rVal(4) * 8);

    const leftBranchX = 35 - (rVal(5) * 12);
    const leftBranchY = 65 - (rVal(6) * 15);
    const leftEndX = 22 - (rVal(7) * 8);
    const leftEndY = 45 - (rVal(8) * 8);

    const rightBranchX = 65 + (rVal(9) * 12);
    const rightBranchY = 60 - (rVal(10) * 15);
    const rightEndX = 78 + (rVal(11) * 8);
    const rightEndY = 42 - (rVal(12) * 8);

    return (
      <svg width="150" height="200" viewBox="0 0 100 150" style={{ margin: '0 auto', display: 'block', animation: wilted ? 'none' : 'sway 7s infinite ease-in-out', transformOrigin: '50px 140px' }}>
        <path d="M25 110 L75 110 L68 142 L32 142 Z" fill="#baab9f" stroke={strokeColor} strokeWidth="3" strokeLinejoin="round" />
        <rect x="20" y="102" width="60" height="8" rx="2.5" fill="#a69488" stroke={strokeColor} strokeWidth="3" />
        <line x1="30" y1="122" x2="70" y2="122" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="4 4" />
        
        <path d={`M50 102 C ${mainCurveX} 75, ${mainCurveX} 50, ${mainEndX} ${mainEndY}`} fill="none" stroke={strokeColor} strokeWidth="6.5" strokeLinecap="round" />
        <path d={`M50 102 C ${leftBranchX} 85, ${leftBranchX} 65, ${leftEndX} ${leftEndY}`} fill="none" stroke={strokeColor} strokeWidth="4.5" strokeLinecap="round" />
        <path d={`M50 102 C ${rightBranchX} 80, ${rightBranchX} 60, ${rightEndX} ${rightEndY}`} fill="none" stroke={strokeColor} strokeWidth="4.2" strokeLinecap="round" />

        {!wilted ? (
          <>
            <g style={{ transform: `translate(${mainEndX}px, ${mainEndY}px)` }}>
              <circle cx="0" cy="0" r="15" fill={leafColor} stroke={strokeColor} strokeWidth="2" />
              <circle cx="0" cy="0" r="6" fill={centerColor} stroke={strokeColor} strokeWidth="1.5" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                <line key={deg} x1="0" y1="0" x2="0" y2="-15" stroke={strokeColor} strokeWidth="1.5" style={{ transform: `rotate(${deg}deg)` }} />
              ))}
              <circle cx="0" cy="0" r="7" fill={centerColor} stroke={strokeColor} strokeWidth="1.5" />
            </g>

            <g style={{ transform: `translate(${leftEndX}px, ${leftEndY}px)` }}>
              <circle cx="0" cy="0" r="10" fill={leafColor} stroke={strokeColor} strokeWidth="2" />
              <circle cx="0" cy="0" r="4.5" fill={centerColor} stroke={strokeColor} strokeWidth="1.5" />
              {[0, 60, 120, 180, 240, 300].map(deg => (
                <circle key={deg} cx="0" cy="-8" r="3.5" fill={leafColor} stroke={strokeColor} strokeWidth="1" style={{ transform: `rotate(${deg}deg)`, transformOrigin: '0px 0px' }} />
              ))}
            </g>

            <g style={{ transform: `translate(${rightEndX}px, ${rightEndY}px)` }}>
              <circle cx="0" cy="0" r="10" fill={leafColor} stroke={strokeColor} strokeWidth="2" />
              <circle cx="0" cy="0" r="4" fill={centerColor} stroke={strokeColor} strokeWidth="1.5" />
              {[0, 72, 144, 216, 288].map(deg => (
                <path key={deg} d="M-3 -4 L0 -12 L3 -4 Z" fill="#e8a36e" stroke={strokeColor} strokeWidth="1" style={{ transform: `rotate(${deg}deg)`, transformOrigin: '0px 0px' }} />
              ))}
            </g>

            <g style={{ transform: `translate(40px, 60px) rotate(-30deg)` }}>
              <path d="M0 0 C -8 -4, -8 -12, 0 -15 C 8 -12, 8 -4, 0 0" fill={leafColor} stroke={strokeColor} strokeWidth="1.5" />
            </g>
            <g style={{ transform: `translate(62px, 55px) rotate(30deg)` }}>
              <path d="M0 0 C -8 -4, -8 -12, 0 -15 C 8 -12, 8 -4, 0 0" fill={leafColor} stroke={strokeColor} strokeWidth="1.5" />
            </g>
          </>
        ) : (
          <>
            <g style={{ transform: `translate(${mainEndX}px, ${mainEndY}px) rotate(25deg)` }}>
              <circle cx="0" cy="6" r="10" fill="#a39890" stroke={strokeColor} strokeWidth="2" />
            </g>
            <g style={{ transform: `translate(${leftEndX}px, ${leftEndY}px) rotate(-25deg)` }}>
              <circle cx="0" cy="4" r="7" fill="#a39890" stroke={strokeColor} strokeWidth="1.8" />
            </g>
            <g style={{ transform: `translate(${rightEndX}px, ${rightEndY}px) rotate(30deg)` }}>
              <circle cx="0" cy="4" r="7" fill="#a39890" stroke={strokeColor} strokeWidth="1.8" />
            </g>
          </>
        )}
      </svg>
    );
  }

  // Level 5: Sanctuary of Eras (Santuário Imemorial)
  const trunkCurveX = 50 + (rVal(1) * 6 - 3);
  const trunkCurveY = 65 + (rVal(2) * 6 - 3);
  const trunkEndX = 50 + (rVal(3) * 6 - 3);
  const trunkEndY = 20 + (rVal(4) * 6);

  const leftTrunkX = 30 - (rVal(5) * 8);
  const leftTrunkY = 60 - (rVal(6) * 10);
  const leftTrunkEndX = 18 - (rVal(7) * 6);
  const leftTrunkEndY = 38 - (rVal(8) * 6);

  const rightTrunkX = 70 + (rVal(9) * 8);
  const rightTrunkY = 55 - (rVal(10) * 10);
  const rightTrunkEndX = 82 + (rVal(11) * 6);
  const rightTrunkEndY = 35 - (rVal(12) * 6);

  const leftLowCurveX = 25 - (rVal(13) * 8);
  const leftLowCurveY = 90 - (rVal(14) * 10);
  const leftLowEndX = 15 - (rVal(15) * 6);
  const leftLowEndY = 70 - (rVal(16) * 6);

  const rightLowCurveX = 75 + (rVal(17) * 8);
  const rightLowCurveY = 85 - (rVal(18) * 10);
  const rightLowEndX = 85 + (rVal(19) * 6);
  const rightLowEndY = 65 - (rVal(20) * 6);

  return (
    <svg width="150" height="200" viewBox="0 0 100 150" style={{ margin: '0 auto', display: 'block', animation: wilted ? 'none' : 'sway 5s infinite ease-in-out', transformOrigin: '50px 140px' }}>
      {/* Terracotta Pot with soil and green leaf emblem */}
      {/* Soil */}
      <ellipse cx="50" cy="104" rx="31" ry="5" fill="#6d5440" stroke={strokeColor} strokeWidth="3" />
      {/* Pot Body */}
      <path d="M22 108 L78 108 L70 144 L30 144 Z" fill="#e89e7d" stroke={strokeColor} strokeWidth="3" strokeLinejoin="round" />
      {/* Pot Rim */}
      <rect x="17" y="100" width="66" height="8" rx="3" fill="#df896c" stroke={strokeColor} strokeWidth="3" />
      {/* Emblem on Pot (Gold/Green badge) */}
      <circle cx="50" cy="126" r="8" fill="#4a7c59" stroke={strokeColor} strokeWidth="1.5" />
      <path d="M47 126 C47 123, 53 123, 53 126 C53 129, 47 129, 47 126 Z" fill="#ffd700" />

      <path d={`M50 100 C ${trunkCurveX} 70, ${trunkCurveX} 45, ${trunkEndX} ${trunkEndY}`} fill="none" stroke={strokeColor} strokeWidth="7" strokeLinecap="round" />
      <path d={`M50 100 C ${leftTrunkX} 80, ${leftTrunkX} 55, ${leftTrunkEndX} ${leftTrunkEndY}`} fill="none" stroke={strokeColor} strokeWidth="5.2" strokeLinecap="round" />
      <path d={`M50 100 C ${rightTrunkX} 75, ${rightTrunkX} 50, ${rightTrunkEndX} ${rightTrunkEndY}`} fill="none" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" />
      <path d={`M50 100 C ${leftLowCurveX} 90, ${leftLowCurveX} 80, ${leftLowEndX} ${leftLowEndY}`} fill="none" stroke={strokeColor} strokeWidth="4.2" strokeLinecap="round" />
      <path d={`M50 100 C ${rightLowCurveX} 85, ${rightLowCurveX} 75, ${rightLowEndX} ${rightLowEndY}`} fill="none" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />

      {!wilted ? (
        <>
          <g style={{ transform: `translate(${trunkEndX}px, ${trunkEndY}px)` }}>
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
              <path key={deg} d="M-4 -4 C -8 -20, 8 -20, 4 -4 Z" fill={color} stroke={strokeColor} strokeWidth="1" style={{ transform: `rotate(${deg}deg)`, transformOrigin: '0px 0px' }} />
            ))}
            <circle cx="0" cy="0" r="12" fill={centerColor} stroke={strokeColor} strokeWidth="2.5" />
            <circle cx="0" cy="0" r="5" fill="#ffffff" stroke={strokeColor} strokeWidth="1.5" />
            <circle cx="0" cy="0" r="2" fill="#d4af37" />
          </g>

          <g style={{ transform: `translate(${leftTrunkEndX}px, ${leftTrunkEndY}px)` }}>
            {drawPetals(flowerStyle, 0.95)}
            <circle cx="0" cy="0" r="4" fill={centerColor} stroke={strokeColor} strokeWidth="1.5" />
          </g>

          <g style={{ transform: `translate(${rightTrunkEndX}px, ${rightTrunkEndY}px)` }}>
            {drawPetals(flowerStyle === 'rose' ? 'daisy' : 'rose', 0.95)}
          </g>

          <g style={{ transform: `translate(${leftLowEndX}px, ${leftLowEndY}px)` }}>
            <circle cx="0" cy="0" r="7" fill={color} stroke={strokeColor} strokeWidth="2" />
            <path d="M-5 -2 C -10 -15, 0 -18, 0 -18 C 0 -18, 10 -15, 5 -2 Z" fill="#e69c5e" stroke={strokeColor} strokeWidth="1.5" />
          </g>

          <g style={{ transform: `translate(${rightLowEndX}px, ${rightLowEndY}px)` }}>
            <circle cx="0" cy="0" r="7" fill={color} stroke={strokeColor} strokeWidth="2" />
            <path d="M-5 -2 C -10 -15, 0 -18, 0 -18 C 0 -18, 10 -15, 5 -2 Z" fill="#e69c5e" stroke={strokeColor} strokeWidth="1.5" />
          </g>

          <circle cx="50" cy="10" r="1.5" fill="#f4d06f" opacity="0.8" />
          <circle cx="28" cy="18" r="1.2" fill="#ffffff" opacity="0.9" />
          <circle cx="75" cy="15" r="1.5" fill="#f4d06f" opacity="0.8" />
          <circle cx="12" cy="50" r="1.2" fill="#ffffff" opacity="0.9" />
          <circle cx="88" cy="48" r="1.5" fill="#ffffff" opacity="0.9" />

          <g style={{ transform: `translate(42px, 50px) rotate(-40deg)` }}>
            <path d="M0 0 C -8 -4, -8 -15, 0 -18 C 8 -15, 8 -4, 0 0" fill={color} stroke={strokeColor} strokeWidth="1.5" />
            <line x1="0" y1="0" x2="0" y2="-15" stroke={strokeColor} strokeWidth="1" />
          </g>
          <g style={{ transform: `translate(58px, 46px) rotate(40deg)` }}>
            <path d="M0 0 C -8 -4, -8 -15, 0 -18 C 8 -15, 8 -4, 0 0" fill={color} stroke={strokeColor} strokeWidth="1.5" />
            <line x1="0" y1="0" x2="0" y2="-15" stroke={strokeColor} strokeWidth="1" />
          </g>
        </>
      ) : (
        <>
          <g style={{ transform: `translate(${trunkEndX}px, ${trunkEndY}px) rotate(25deg)` }}>
            <circle cx="0" cy="6" r="10" fill="#a39890" stroke={strokeColor} strokeWidth="2" />
          </g>
          <g style={{ transform: `translate(${leftTrunkEndX}px, ${leftTrunkEndY}px) rotate(-30deg)` }}>
            <circle cx="0" cy="5" r="8" fill="#a39890" stroke={strokeColor} strokeWidth="2" />
          </g>
          <g style={{ transform: `translate(${rightTrunkEndX}px, ${rightTrunkEndY}px) rotate(30deg)` }}>
            <circle cx="0" cy="5" r="8" fill="#a39890" stroke={strokeColor} strokeWidth="2" />
          </g>
        </>
      )}
    </svg>
  );
};

// Função auxiliar para títulos honoríficos de plantas concluídas
export const getLegendaryRankName = (seed = 0.5, gradeNum = 9, subjectName = '') => {
  const titles = [
    "Carvalho Solar de Aurum",
    "Lotus Imperial de Aurum",
    "Cipreste Divino de Aurum",
    "Flor da Glória Celestina",
    "Árvore Ancestral de Aurum",
    "Sauce Solsticial de Aurum",
    "Magnólia Áurea de Aurum",
    "Santuário Enevoado de Aurum"
  ];
  if (gradeNum >= 9.8) return "Santuário Mítico de Aurum";
  const numSeed = typeof seed === 'number' ? seed : 0.5;
  const charCodeSum = (subjectName || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const idx = Math.abs(Math.floor(getRand(numSeed, 88 + charCodeSum) * titles.length)) % titles.length;
  return titles[idx];
};

// Renderizador de micro-vetores da planta para galerias
export const renderMicroPlant = (
  color = 'var(--plant-green)',
  wilted = false,
  level = 3,
  seed = 0.5,
  size = 36,
  isConcludedPlant = false,
  isGolden = false
) => {
  const strokeColor = wilted ? '#a39890' : 'var(--text-primary)';
  const transform = wilted ? 'rotate(20deg)' : 'none';
  const rVal = (salt) => getRand(seed, salt);

  // Special rendering for Concluded Subject Plants (Bigger, majestic, and glowing)
  if (isConcludedPlant) {
    if (isGolden) {
      // Pick 1 of 4 visual variants deterministically based on seed
      const variant = Math.abs(Math.floor(rVal(55) * 4)) % 4;

      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ overflow: 'visible' }}>
          {/* Radial Gold Beams Aura */}
          <circle cx="50" cy="45" r="42" fill="rgba(255,215,0,0.18)" />
          <circle cx="50" cy="45" r="32" fill="rgba(255,230,120,0.22)" />
          
          {/* Pot Shadow */}
          <ellipse cx="50" cy="92" rx="18" ry="4" fill="rgba(0,0,0,0.12)" />

          {/* Golden Terracotta Pot */}
          <ellipse cx="50" cy="74" rx="16" ry="3.5" fill="#5c4532" stroke="#b8960c" strokeWidth="1.5" />
          <path d="M36 76 L40 92 C40 93.5, 60 93.5, 60 92 L64 76 Z" fill="#ffd700" stroke="#b8960c" strokeWidth="1.8" strokeLinejoin="round" />
          <rect x="33" y="71" width="34" height="6" rx="2" fill="#fff099" stroke="#b8960c" strokeWidth="1.8" />
          {/* Gold Star Emblem */}
          <circle cx="50" cy="83" r="4.5" fill="#2ecc71" stroke="#b8960c" strokeWidth="1" />
          <polygon points="50,80.5 51.5,83 54,83 52,84.5 53,87 50,85.5 47,87 48,84.5 46,83 48.5,83" fill="#ffd700" />

          <g style={{ transform, transformOrigin: '50px 74px' }}>
            {/* VARIANT 0: Carvalho Solar de Aurum (5-Dome Golden Oak) */}
            {variant === 0 && (
              <>
                <path d="M50 74 Q50 50, 40 32 T36 20" stroke="#b8960c" strokeWidth="7" fill="none" strokeLinecap="round" />
                <path d="M47 54 Q58 46, 66 36" stroke="#b8960c" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                <path d="M44,44 Q30,36, 26,28" stroke="#b8960c" strokeWidth="3.5" fill="none" strokeLinecap="round" />

                <circle cx="36" cy="18" r="16" fill="#ffd700" stroke="#b8960c" strokeWidth="1.8" />
                <circle cx="66" cy="32" r="14" fill="#ffd700" stroke="#b8960c" strokeWidth="1.8" />
                <circle cx="24" cy="28" r="12" fill="#ffd700" stroke="#b8960c" strokeWidth="1.8" />
                <circle cx="50" cy="14" r="17" fill="#fff099" stroke="#b8960c" strokeWidth="1.8" />

                <circle cx="42" cy="22" r="2.8" fill="#ffffff" stroke="#b8960c" strokeWidth="0.8" />
                <circle cx="58" cy="20" r="2.8" fill="#ffffff" stroke="#b8960c" strokeWidth="0.8" />
                <circle cx="28" cy="30" r="2.5" fill="#ffffff" />
                <circle cx="68" cy="36" r="2.5" fill="#ffffff" />
                <circle cx="50" cy="8" r="2" fill="#ffffff" />
              </>
            )}

            {/* VARIANT 1: Lotus Imperial de Aurum (Multi-Lotus Golden Blossom Tree) */}
            {variant === 1 && (
              <>
                <path d="M50 74 Q48 48, 50 28" stroke="#b8960c" strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M50 56 Q34 46, 28 36" stroke="#b8960c" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M50 50 Q66 42, 72 34" stroke="#b8960c" strokeWidth="4" fill="none" strokeLinecap="round" />

                {/* Top Main Lotus */}
                <g style={{ transform: 'translate(50px, 24px)' }}>
                  {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                    <ellipse key={deg} cx="0" cy="-10" rx="5" ry="10" fill="#ffd700" stroke="#b8960c" strokeWidth="1" style={{ transform: `rotate(${deg}deg)`, transformOrigin: '0px 0px' }} />
                  ))}
                  <circle cx="0" cy="0" r="7" fill="#fff099" stroke="#b8960c" strokeWidth="1.5" />
                  <circle cx="0" cy="0" r="3" fill="#ffffff" />
                </g>

                {/* Left Branch Lotus */}
                <g style={{ transform: 'translate(28px, 34px)' }}>
                  {[0, 60, 120, 180, 240, 300].map(deg => (
                    <circle key={deg} cx="0" cy="-7" r="4.5" fill="#ffd700" stroke="#b8960c" strokeWidth="1" style={{ transform: `rotate(${deg}deg)`, transformOrigin: '0px 0px' }} />
                  ))}
                  <circle cx="0" cy="0" r="5" fill="#fff099" stroke="#b8960c" strokeWidth="1" />
                </g>

                {/* Right Branch Lotus */}
                <g style={{ transform: 'translate(72px, 32px)' }}>
                  {[0, 60, 120, 180, 240, 300].map(deg => (
                    <circle key={deg} cx="0" cy="-7" r="4.5" fill="#ffd700" stroke="#b8960c" strokeWidth="1" style={{ transform: `rotate(${deg}deg)`, transformOrigin: '0px 0px' }} />
                  ))}
                  <circle cx="0" cy="0" r="5" fill="#fff099" stroke="#b8960c" strokeWidth="1" />
                </g>
              </>
            )}

            {/* VARIANT 2: Cipreste Divino de Aurum (Towering Flame Spire) */}
            {variant === 2 && (
              <>
                <path d="M50 74 L50 20" stroke="#b8960c" strokeWidth="7" fill="none" strokeLinecap="round" />
                
                {/* Flame Spire Canopy */}
                <path d="M50 8 C30 30, 32 60, 50 72 C68 60, 70 30, 50 8 Z" fill="#ffd700" stroke="#b8960c" strokeWidth="2" />
                <path d="M50 14 C36 34, 38 56, 50 66 C62 56, 64 34, 50 14 Z" fill="#fff099" stroke="#b8960c" strokeWidth="1.2" />

                {/* Sparkle Crystals along the Spire */}
                <polygon points="50,4 52,10 57,10 53,13 55,18 50,15 45,18 47,13 43,10 48,10" fill="#ffffff" stroke="#b8960c" strokeWidth="0.8" />
                <circle cx="50" cy="30" r="3" fill="#ffffff" />
                <circle cx="40" cy="45" r="2.5" fill="#ffffff" />
                <circle cx="60" cy="45" r="2.5" fill="#ffffff" />
              </>
            )}

            {/* VARIANT 3: Magnólia Áurea de Aurum (Sweeping Curved Golden Blossom) */}
            {variant === 3 && (
              <>
                <path d="M50 74 C35 55, 65 38, 46 16" stroke="#b8960c" strokeWidth="6.5" fill="none" strokeLinecap="round" />
                <path d="M42 46 Q24 38, 20 26" stroke="#b8960c" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M54 36 Q74 28, 78 18" stroke="#b8960c" strokeWidth="4" fill="none" strokeLinecap="round" />

                {/* Main Crown Flowers */}
                <circle cx="46" cy="14" r="15" fill="#fff099" stroke="#b8960c" strokeWidth="1.8" />
                <circle cx="20" cy="24" r="12" fill="#ffd700" stroke="#b8960c" strokeWidth="1.5" />
                <circle cx="78" cy="16" r="13" fill="#ffd700" stroke="#b8960c" strokeWidth="1.5" />

                {/* White-Gold Crystal Hearts */}
                <circle cx="46" cy="14" r="6" fill="#ffffff" stroke="#b8960c" strokeWidth="1" />
                <circle cx="20" cy="24" r="4.5" fill="#ffffff" stroke="#b8960c" strokeWidth="1" />
                <circle cx="78" cy="16" r="5" fill="#ffffff" stroke="#b8960c" strokeWidth="1" />
              </>
            )}
          </g>
        </svg>
      );
    } else {
      // Grade < 8.5: Flor da Vitória Cristalina (Majestic Silver & Emerald Tree)
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ overflow: 'visible' }}>
          {/* Silver Glow Aura */}
          <circle cx="50" cy="45" r="38" fill="rgba(200,225,240,0.2)" />
          
          {/* Pot Shadow */}
          <ellipse cx="50" cy="92" rx="16" ry="3.5" fill="rgba(0,0,0,0.1)" />

          {/* Silver Pot */}
          <ellipse cx="50" cy="74" rx="15" ry="3" fill="#52606d" stroke="#d0d8e0" strokeWidth="1.5" />
          <path d="M37 76 L41 91 C41 92.5, 59 92.5, 59 91 L63 76 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" strokeLinejoin="round" />
          <rect x="34" y="71" width="32" height="6" rx="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" />
          {/* Emerald Emblem */}
          <circle cx="50" cy="83" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1" />

          <g style={{ transform, transformOrigin: '50px 74px' }}>
            {/* Trunk */}
            <path d="M50 74 Q50 52, 42 34 T38 22" stroke="#475569" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M47 54 Q58 48, 64 38" stroke="#475569" strokeWidth="4" fill="none" strokeLinecap="round" />

            {/* Emerald/Custom Foliage Clusters */}
            <circle cx="38" cy="20" r="14" fill={color || '#10b981'} stroke="#334155" strokeWidth="1.5" />
            <circle cx="64" cy="34" r="12" fill={color || '#10b981'} stroke="#334155" strokeWidth="1.5" />
            <circle cx="48" cy="14" r="15" fill={color || '#10b981'} stroke="#334155" strokeWidth="1.5" />

            {/* Silver Crystal Blossoms */}
            <circle cx="38" cy="20" r="4" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="64" cy="34" r="3.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="48" cy="14" r="4.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
          </g>
        </svg>
      );
    }
  }
  
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Pot Shadow */}
      <ellipse cx="50" cy="90" rx="14" ry="3" fill="rgba(0,0,0,0.08)" />
      
      {/* Cute round terracotta pot */}
      {/* Soil */}
      <ellipse cx="50" cy="72" rx="14" ry="3" fill="#6d5440" stroke="var(--text-primary)" strokeWidth="1.2" />
      {/* Pot Body */}
      <path d="M38 74 L42 89 C42 90.5, 58 90.5, 58 89 L62 74 Z" fill="#e89e7d" stroke="var(--text-primary)" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Pot Rim */}
      <rect x="35" y="70" width="30" height="5" rx="1.5" fill="#df896c" stroke="var(--text-primary)" strokeWidth="1.5" />
      {/* Emblem: Green leaf icon on Pot */}
      <circle cx="50" cy="81" r="3" fill="#4a7c59" stroke="var(--text-primary)" strokeWidth="0.8" />
      
      <g style={{ transform, transformOrigin: '50px 72px' }}>
        {/* Level 1: Sprout */}
        {level === 1 && (
          <>
            <path d="M50 72 Q48 56, 45 48" stroke="var(--text-primary)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M45 48 C37 42, 32 49, 41 54 C43 56, 46 58, 47 59" fill={color} stroke="var(--text-primary)" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M45 48 C53 42, 58 49, 49 54 C47 56, 46 58, 45 59" fill={color} stroke="var(--text-primary)" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M41 51 Q44 50, 45 48" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" fill="none" />
          </>
        )}
        
        {/* Level 2: young plant */}
        {level === 2 && (
          <>
            <path d="M50 72 L50 44" stroke="var(--text-primary)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M50 60 Q44 56, 42 50" stroke="var(--text-primary)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M50 56 Q56 52, 58 46" stroke="var(--text-primary)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            
            <path d="M50 44 C42 34, 58 34, 50 44 Z" fill={color} stroke="var(--text-primary)" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M42 50 C34 44, 38 56, 46 54 Z" fill={color} stroke="var(--text-primary)" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M58 46 C66 40, 62 52, 54 50 Z" fill={color} stroke="var(--text-primary)" strokeWidth="1.5" strokeLinejoin="round" />
          </>
        )}
        
        {/* Level 3: flower */}
        {level === 3 && (
          <>
            <path d="M50 72 L50 42" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" />
            <path d="M50 60 C42 60, 40 54, 50 56 Z" fill={color} stroke="var(--text-primary)" strokeWidth="1.2" />
            <path d="M50 52 C58 52, 60 46, 50 48 Z" fill={color} stroke="var(--text-primary)" strokeWidth="1.2" />
            
            {[0, 60, 120, 180, 240, 300].map(angle => {
              const rad = (angle * Math.PI) / 180;
              const px = 50 + Math.cos(rad) * 9;
              const py = 42 + Math.sin(rad) * 9;
              const petalColor = color === '#4a7c59' ? '#ffb3ba' : color;
              return <circle key={angle} cx={px} cy={py} r="7" fill={petalColor} stroke="var(--text-primary)" strokeWidth="1.2" />;
            })}
            <circle cx="50" cy="42" r="6" fill="#f4d06f" stroke="var(--text-primary)" strokeWidth="1.2" />
          </>
        )}
        
        {/* Level 4: tree */}
        {level === 4 && (
          <>
            <path d="M50 72 Q50 56, 44 48 T40 38" stroke="#8f7762" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <path d="M47 56 Q55 52, 58 44" stroke="#8f7762" strokeWidth="2.8" fill="none" strokeLinecap="round" />
            
            <circle cx="38" cy="34" r="11" fill={color} stroke="var(--text-primary)" strokeWidth="1.5" />
            <circle cx="58" cy="40" r="9.5" fill={color} stroke="var(--text-primary)" strokeWidth="1.5" />
            <circle cx="48" cy="26" r="13" fill={color} stroke="var(--text-primary)" strokeWidth="1.5" />
            
            <path d="M32 30 A8 8 0 0 1 44 30" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M42 22 A10 10 0 0 1 54 22" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </>
        )}
 
        {/* Level 5: Sanctuary of Eras */}
        {level === 5 && (
          <>
            <path d="M50 72 Q50 50, 42 34 T38 24" stroke="#8f7762" strokeWidth="6.5" fill="none" strokeLinecap="round" />
            <path d="M47 54 Q58 48, 64 38" stroke="#8f7762" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M44 44 Q32 38, 28 30" stroke="#8f7762" strokeWidth="3" fill="none" strokeLinecap="round" />
            
            <circle cx="34" cy="22" r="14" fill={color} stroke="var(--text-primary)" strokeWidth="1.5" />
            <circle cx="64" cy="32" r="12" fill={color} stroke="var(--text-primary)" strokeWidth="1.5" />
            <circle cx="24" cy="28" r="11" fill={color} stroke="var(--text-primary)" strokeWidth="1.5" />
            <circle cx="48" cy="18" r="15" fill={color} stroke="var(--text-primary)" strokeWidth="1.5" />
            
            <circle cx="42" cy="25" r="2.2" fill="#ffd700" stroke="var(--text-primary)" strokeWidth="0.8" />
            <circle cx="56" cy="23" r="2.2" fill="#ffd700" stroke="var(--text-primary)" strokeWidth="0.8" />
            <circle cx="28" cy="32" r="2.2" fill="#ffd700" stroke="var(--text-primary)" strokeWidth="0.8" />
            <circle cx="66" cy="36" r="2.2" fill="#ffd700" stroke="var(--text-primary)" strokeWidth="0.8" />
          </>
        )}
      </g>
    </svg>
  );
};
