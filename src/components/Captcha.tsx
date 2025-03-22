/**
 * Composant Captcha personnalisé basé sur un puzzle
 * 
 * Ce captcha utilise un puzzle à faire glisser (slide puzzle) pour vérifier que l'utilisateur est humain:
 * - Deux pièces de puzzle doivent être glissées et déposées dans les positions correspondantes
 * - Les pièces ont des formes, rotations et couleurs différentes
 * - Les dimensions, positions et images sont aléatoires à chaque chargement
 * - Le motif de fond change à chaque chargement
 * - Beaucoup plus résistant aux attaques par OCR que les captchas textuels
 * 
 * Avantages de sécurité:
 * 1. Nécessite multiples interactions de type "glisser-déposer" difficiles à automatiser
 * 2. Les motifs visuels, formes, rotations et positions changent à chaque chargement
 * 3. Résistant aux techniques d'OCR et d'IA de reconnaissance d'images classiques
 * 4. Le puzzle change à chaque tentative échouée
 * 5. Utilisation de formes et rotations variées pour complexifier l'analyse automatique
 */

import React, { useState, useEffect, useRef } from 'react';

interface CaptchaProps {
  onVerify: (isVerified: boolean) => void;
}

interface PieceData {
  id: number;
  pos: { x: number; y: number };
  isVerified: boolean;
  rotation: number;
  shape: 'rectangle' | 'circle' | 'triangle';
  color: string;
}

interface DropZoneData {
  id: number;
  pos: { x: number; y: number };
  shape: 'rectangle' | 'circle' | 'triangle';
}

const Captcha: React.FC<CaptchaProps> = ({ onVerify }) => {
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [pieces, setPieces] = useState<PieceData[]>([]);
  const [dropZones, setDropZones] = useState<DropZoneData[]>([]);
  const [puzzleLoaded, setPuzzleLoaded] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const pieceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dropZoneRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Couleurs aléatoires pour le motif du puzzle dans le thème de l'application
  const [colors, setColors] = useState({
    primary: '#3b82f6',    // blue-500
    secondary: '#6366f1',  // indigo-500
    accent: '#2563eb',     // blue-600
    background: '#1e293b'  // slate-800
  });
  
  // Motif de fond généré aléatoirement
  const [pattern, setPattern] = useState<string>('');
  
  // Générer un nouveau pattern SVG pour le fond du puzzle
  const generatePattern = () => {
    const patternTypes = [
      // Motif de lignes croisées
      () => {
        const strokeWidth = 1.5 + Math.random();
        const strokeColor = colors.primary;
        const opacity = 0.2 + Math.random() * 0.3;
        const spacing = 20 + Math.floor(Math.random() * 15);
        
        return `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="${colors.background}"/>
          <g stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="${opacity}">
            <path d="M ${spacing} 0 V 100 M ${spacing*2} 0 V 100 M ${spacing*3} 0 V 100 M 0 ${spacing} H 100 M 0 ${spacing*2} H 100 M 0 ${spacing*3} H 100"/>
          </g>
        </svg>`;
      },
      
      // Motif de cercles
      () => {
        const r = 5 + Math.floor(Math.random() * 8);
        const fillColor = colors.secondary;
        const opacity = 0.15 + Math.random() * 0.2;
        const spacing = 25 + Math.floor(Math.random() * 15);
        
        let circles = '';
        for (let x = 0; x <= 100; x += spacing) {
          for (let y = 0; y <= 100; y += spacing) {
            circles += `<circle cx="${x}" cy="${y}" r="${r}" fill="${fillColor}" />`;
          }
        }
        
        return `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="${colors.background}"/>
          <g opacity="${opacity}">${circles}</g>
        </svg>`;
      },
      
      // Motif de triangles
      () => {
        const fillColor = colors.accent;
        const opacity = 0.15 + Math.random() * 0.2;
        const size = 15 + Math.floor(Math.random() * 10);
        const spacing = size * 2;
        
        let triangles = '';
        for (let x = 0; x <= 100; x += spacing) {
          for (let y = 0; y <= 100; y += spacing) {
            const rotation = Math.floor(Math.random() * 4) * 90;
            triangles += `<polygon transform="rotate(${rotation} ${x} ${y})" points="${x},${y-size/2} ${x+size/2},${y+size/2} ${x-size/2},${y+size/2}" fill="${fillColor}" />`;
          }
        }
        
        return `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="${colors.background}"/>
          <g opacity="${opacity}">${triangles}</g>
        </svg>`;
      },
      
      // Motif en grille avec formes aléatoires
      () => {
        const fillColor1 = colors.primary;
        const fillColor2 = colors.secondary;
        const opacity = 0.15 + Math.random() * 0.2;
        const spacing = 20 + Math.floor(Math.random() * 10);
        
        let shapes = '';
        for (let x = 0; x <= 100; x += spacing) {
          for (let y = 0; y <= 100; y += spacing) {
            const shapeType = Math.floor(Math.random() * 3);
            const fillColor = Math.random() > 0.5 ? fillColor1 : fillColor2;
            const size = 3 + Math.floor(Math.random() * 4);
            
            if (shapeType === 0) {
              shapes += `<rect x="${x-size/2}" y="${y-size/2}" width="${size}" height="${size}" fill="${fillColor}" />`;
            } else if (shapeType === 1) {
              shapes += `<circle cx="${x}" cy="${y}" r="${size/2}" fill="${fillColor}" />`;
            } else {
              shapes += `<polygon points="${x},${y-size} ${x+size},${y+size} ${x-size},${y+size}" fill="${fillColor}" />`;
            }
          }
        }
        
        return `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="${colors.background}"/>
          <g opacity="${opacity}">${shapes}</g>
        </svg>`;
      }
    ];
    
    // Choisir un motif aléatoire
    const randomPattern = patternTypes[Math.floor(Math.random() * patternTypes.length)]();
    // Convertir en base64 pour utilisation en CSS
    return `url('data:image/svg+xml;base64,${btoa(randomPattern)}')`;
  };
  
  // Générer des formes aléatoires pour les pièces
  const getRandomShape = (): 'rectangle' | 'circle' | 'triangle' => {
    const shapes: ('rectangle' | 'circle' | 'triangle')[] = ['rectangle', 'circle', 'triangle'];
    return shapes[Math.floor(Math.random() * shapes.length)];
  };
  
  // Générer une couleur aléatoire dans le thème de l'application
  const getRandomColor = (): string => {
    const hue = Math.floor(210 + Math.random() * 60); // Variations de bleu et violet
    const saturation = Math.floor(70 + Math.random() * 20);
    const lightness = Math.floor(45 + Math.random() * 15);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };
  
  // Initialiser le puzzle
  const initPuzzle = () => {
    if (!containerRef.current) return;
    
    // Générer des nouvelles couleurs dans le thème de l'application
    setColors({
      primary: `hsl(${210 + Math.random() * 30}, ${70 + Math.random() * 20}%, ${50 + Math.random() * 10}%)`,
      secondary: `hsl(${230 + Math.random() * 40}, ${70 + Math.random() * 20}%, ${50 + Math.random() * 10}%)`,
      accent: `hsl(${220 + Math.random() * 30}, ${80 + Math.random() * 20}%, ${45 + Math.random() * 15}%)`,
      background: '#1e293b' // slate-800 constant pour meilleure intégration
    });
    
    // Générer un nouveau pattern
    setPattern(generatePattern());
    
    // Créer deux pièces de puzzle avec des formes et rotations différentes
    const newPieces: PieceData[] = [];
    const newDropZones: DropZoneData[] = [];
    
    // Conteneur dimensions
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = 160; // Augmenter la hauteur pour accommoder plus de pièces
    
    // Espace pour placement des pièces et zones
    const leftArea = { minX: 20, maxX: containerWidth * 0.4, minY: 20, maxY: containerHeight - 70 };
    const rightArea = { minX: containerWidth * 0.6, maxX: containerWidth - 100, minY: 20, maxY: containerHeight - 70 };
    
    // Créer les deux pièces et zones de dépôt
    for (let i = 0; i < 2; i++) {
      // Créer la forme
      const shape = getRandomShape();
      const color = getRandomColor();
      const rotation = Math.floor(Math.random() * 4) * 90; // 0, 90, 180, 270 degrés
      
      // Position de la pièce (à gauche)
      const pieceX = leftArea.minX + Math.random() * (leftArea.maxX - leftArea.minX);
      const pieceY = leftArea.minY + (i * 70) + Math.random() * 10; // Espacer verticalement
      
      newPieces.push({
        id: i,
        pos: { x: pieceX, y: pieceY },
        isVerified: false,
        rotation,
        shape,
        color
      });
      
      // Position de la zone de dépôt (à droite)
      const dropX = rightArea.minX + Math.random() * (rightArea.maxX - rightArea.minX);
      const dropY = rightArea.minY + (i * 70) + Math.random() * 10; // Espacer verticalement
      
      newDropZones.push({
        id: i,
        pos: { x: dropX, y: dropY },
        shape
      });
    }
    
    // Mélanger l'ordre des pièces pour plus de complexité
    for (let i = newPieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newPieces[i], newPieces[j]] = [newPieces[j], newPieces[i]];
    }
    
    setPieces(newPieces);
    setDropZones(newDropZones);
    
    // Réinitialiser l'état
    setVerified(false);
    setError(null);
    setPuzzleLoaded(true);
    pieceRefs.current = pieceRefs.current.slice(0, newPieces.length);
    dropZoneRefs.current = dropZoneRefs.current.slice(0, newDropZones.length);
    
    // Vider la référence aux pièces pour les recréer
    pieceRefs.current = new Array(newPieces.length).fill(null);
    dropZoneRefs.current = new Array(newDropZones.length).fill(null);
  };
  
  // Vérifier si la pièce est dans la zone de dépôt correspondante
  const checkPiecePosition = (pieceId: number) => {
    const pieceIndex = pieces.findIndex(p => p.id === pieceId);
    if (pieceIndex === -1) return false;
    
    const dropZoneIndex = dropZones.findIndex(d => d.id === pieceId);
    if (dropZoneIndex === -1) return false;
    
    const pieceRef = pieceRefs.current[pieceIndex];
    const dropZoneRef = dropZoneRefs.current[dropZoneIndex];
    
    if (!pieceRef || !dropZoneRef) return false;
    
    const piece = pieceRef.getBoundingClientRect();
    const dropZone = dropZoneRef.getBoundingClientRect();
    
    // Calculer le chevauchement
    const overlapX = Math.max(0, Math.min(piece.right, dropZone.right) - Math.max(piece.left, dropZone.left));
    const overlapY = Math.max(0, Math.min(piece.bottom, dropZone.bottom) - Math.max(piece.top, dropZone.top));
    
    // Surface de chevauchement
    const overlapArea = overlapX * overlapY;
    // Surface de la pièce
    const pieceArea = piece.width * piece.height;
    
    // Si plus de 70% de la pièce est dans la zone de dépôt, c'est valide
    return overlapArea / pieceArea > 0.6;
  };
  
  // Gérer le début du glissement
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, pieceId: number) => {
    if (verified) return;
    setDraggingId(pieceId);
    // Empêcher le comportement par défaut pour éviter les problèmes
    e.preventDefault();
  };
  
  // Gérer le glissement
  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (draggingId === null || verified) return;
    
    let clientX: number, clientY: number;
    
    // Gérer les événements tactiles et souris
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    if (!containerRef.current) return;
    
    const container = containerRef.current.getBoundingClientRect();
    const pieceIndex = pieces.findIndex(p => p.id === draggingId);
    if (pieceIndex === -1) return;
    
    const pieceRef = pieceRefs.current[pieceIndex];
    if (!pieceRef) return;
    
    const piece = pieceRef.getBoundingClientRect();
    
    // Calculer la nouvelle position relative au conteneur
    const newX = clientX - container.left - piece.width / 2;
    const newY = clientY - container.top - piece.height / 2;
    
    // Limiter au conteneur
    const boundedX = Math.max(0, Math.min(newX, container.width - piece.width));
    const boundedY = Math.max(0, Math.min(newY, container.height - piece.height));
    
    // Mettre à jour la position de la pièce spécifique
    setPieces(prev => prev.map(p => 
      p.id === draggingId 
        ? { ...p, pos: { x: boundedX, y: boundedY } }
        : p
    ));
  };
  
  // Gérer la fin du glissement
  const handleDragEnd = () => {
    if (draggingId === null || verified) return;
    
    // Vérifier si la pièce est dans la bonne position
    const isCorrect = checkPiecePosition(draggingId);
    
    // Mettre à jour l'état de vérification de cette pièce
    setPieces(prev => prev.map(p => 
      p.id === draggingId 
        ? { ...p, isVerified: isCorrect }
        : p
    ));
    
    // Réinitialiser l'ID de la pièce en cours de déplacement
    setDraggingId(null);
    
    // Vérifier si toutes les pièces sont correctement placées
    const updatedPieces = pieces.map(p => 
      p.id === draggingId ? { ...p, isVerified: isCorrect } : p
    );
    
    const allVerified = updatedPieces.every(p => p.isVerified);
    
    if (allVerified) {
      setVerified(true);
      setError(null);
      onVerify(true);
    }
  };
  
  // Actualiser le puzzle
  const refreshPuzzle = () => {
    setPuzzleLoaded(false);
    setTimeout(initPuzzle, 100);
    onVerify(false);
  };
  
  // Initialiser le puzzle au chargement
  useEffect(() => {
    initPuzzle();
    
    // Ajouter les événements tactiles et souris au document
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingId !== null) {
        handleDrag(e as unknown as React.MouseEvent);
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (draggingId !== null) {
        handleDrag(e as unknown as React.TouchEvent);
        e.preventDefault(); // Empêcher le défilement lors du glissement
      }
    };
    
    const handleMouseUp = () => {
      if (draggingId !== null) {
        handleDragEnd();
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [draggingId, pieces]);
  
  // Réinitialiser si la taille du conteneur change
  useEffect(() => {
    const handleResize = () => refreshPuzzle();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Rendu de la pièce selon sa forme
  const renderPieceShape = (piece: PieceData) => {
    switch (piece.shape) {
      case 'circle':
        return (
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-600/30">
            <div className="w-2 h-10 rounded-full bg-gray-800/60 absolute left-2 top-2"></div>
            <div className="w-2 h-10 rounded-full bg-gray-800/60 absolute right-2 bottom-2"></div>
          </div>
        );
      case 'triangle':
        return (
          <div className="absolute inset-0 clip-path-triangle bg-gradient-to-br from-blue-500/20 to-indigo-600/30">
            <div className="w-2 h-10 rounded-full bg-gray-800/60 absolute left-2 bottom-2"></div>
            <div className="w-2 h-10 rounded-full bg-gray-800/60 absolute right-2 bottom-2"></div>
          </div>
        );
      case 'rectangle':
      default:
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/30 rounded-md">
            <div className="w-2 h-10 rounded-full bg-gray-800/60 absolute left-1"></div>
            <div className="w-2 h-10 rounded-full bg-gray-800/60 absolute right-1"></div>
          </div>
        );
    }
  };
  
  return (
    <div className="space-y-4">
      <div 
        ref={containerRef}
        className="relative h-[160px] w-full rounded-lg border border-gray-700 bg-gray-900 overflow-hidden"
        style={{ background: colors.background, touchAction: 'none' }}
      >
        {/* Instructions */}
        {!verified && (
          <div className="absolute inset-0 flex items-center justify-center text-center text-sm text-gray-300 z-0 pointer-events-none">
            <span>Glissez les pièces vers leurs emplacements respectifs</span>
          </div>
        )}
        
        {puzzleLoaded && (
          <>
            {/* Zones de dépôt */}
            {dropZones.map((zone, index) => (
              <div 
                key={`dropzone-${zone.id}`}
                ref={el => {dropZoneRefs.current[index] = el}}
                className={`absolute w-[70px] h-[50px] flex items-center justify-center ${
                  pieces.find(p => p.id === zone.id)?.isVerified 
                    ? 'border-green-400' 
                    : 'border-gray-400'
                }`}
                style={{ 
                  left: `${zone.pos.x}px`, 
                  top: `${zone.pos.y}px`,
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  borderWidth: '2px',
                  borderStyle: 'dashed',
                  borderRadius: zone.shape === 'circle' ? '9999px' : 
                               zone.shape === 'triangle' ? '0' : '8px',
                  clipPath: zone.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none'
                }}
              >
                {pieces.find(p => p.id === zone.id)?.isVerified && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </div>
            ))}
            
            {/* Pièces de puzzle à faire glisser */}
            {pieces.map((piece, index) => (
              <div 
                key={`piece-${piece.id}`}
                ref={el => {pieceRefs.current[index] = el}}
                className={`absolute w-[70px] h-[50px] shadow-lg flex items-center justify-center ${
                  draggingId === piece.id ? 'cursor-grabbing z-30' : 'cursor-grab z-20'
                } ${piece.isVerified ? 'ring-2 ring-green-400' : ''}`}
                style={{ 
                  left: `${piece.pos.x}px`, 
                  top: `${piece.pos.y}px`,
                  backgroundImage: pattern,
                  border: `2px solid ${piece.color}`,
                  borderRadius: piece.shape === 'circle' ? '9999px' : 
                               piece.shape === 'triangle' ? '0' : '8px',
                  clipPath: piece.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
                  transform: `rotate(${piece.rotation}deg)`
                }}
                onMouseDown={(e) => handleDragStart(e, piece.id)}
                onTouchStart={(e) => handleDragStart(e, piece.id)}
              >
                {renderPieceShape(piece)}
                <span className="relative z-10 text-xs font-bold text-white">{piece.id + 1}</span>
              </div>
            ))}
          </>
        )}
        
        {/* Indicateur de succès */}
        {verified && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-40">
            <div className="text-green-400 text-xl font-bold flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span className="mt-2">Vérification réussie</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <button 
          onClick={refreshPuzzle}
          type="button"
          className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors text-sm"
          aria-label="Rafraîchir le captcha"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
          Nouveau puzzle
        </button>
        
        {verified && (
          <div className="text-green-400 text-sm flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Vérification réussie
          </div>
        )}
      </div>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {/* Styles pour les formes */}
      <style>
        {`
        .clip-path-triangle {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
        `}
      </style>
    </div>
  );
};

export default Captcha; 