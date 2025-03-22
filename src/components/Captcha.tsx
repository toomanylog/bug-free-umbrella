/**
 * Composant Captcha personnalisé basé sur un puzzle
 * 
 * Ce captcha utilise un puzzle à faire glisser (slide puzzle) pour vérifier que l'utilisateur est humain:
 * - Deux pièces de puzzle doivent être glissées et déposées dans les positions correspondantes
 * - Les pièces ont des formes, rotations et couleurs différentes
 * - Les positions et couleurs sont aléatoires à chaque chargement
 * - Le motif de fond change à chaque chargement
 * - Beaucoup plus résistant aux attaques par OCR que les captchas textuels
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
  
  // Couleurs pour le thème du captcha
  const [colors, setColors] = useState({
    primary: '#3b82f6',    // blue-500
    secondary: '#6366f1',  // indigo-500
    accent: '#2563eb',     // blue-600
    background: '#1e293b'  // slate-800
  });
  
  // Générer un motif de fond adapté
  const generatePattern = () => {
    const hue = Math.floor(210 + Math.random() * 60); // Variations de bleu et violet
    
    return `radial-gradient(circle at 30% 30%, hsla(${hue}, 70%, 50%, 0.1) 0%, transparent 70%),
           radial-gradient(circle at 70% 60%, hsla(${hue + 20}, 70%, 50%, 0.1) 0%, transparent 70%)`;
  };
  
  // Générer une forme aléatoire
  const getRandomShape = (): 'rectangle' | 'circle' | 'triangle' => {
    const shapes: ('rectangle' | 'circle' | 'triangle')[] = ['rectangle', 'circle', 'triangle'];
    return shapes[Math.floor(Math.random() * shapes.length)];
  };
  
  // Générer une couleur aléatoire dans le thème
  const getRandomColor = (): string => {
    const hue = Math.floor(210 + Math.random() * 60); // Variations de bleu et violet
    const saturation = Math.floor(70 + Math.random() * 20);
    const lightness = Math.floor(45 + Math.random() * 15);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };
  
  // Initialiser le puzzle
  const initPuzzle = () => {
    if (!containerRef.current) return;
    
    // Dimensions du conteneur
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = 160;
    
    // Dimensions et marges pour les pièces
    const pieceWidth = 70;
    const pieceHeight = 50;
    const margin = 20;
    
    const newPieces: PieceData[] = [];
    const newDropZones: DropZoneData[] = [];
    
    // Définir les zones pour les pièces et les zones de dépôt
    const leftArea = { 
      minX: margin, 
      maxX: containerWidth * 0.4 - pieceWidth, 
      minY: margin, 
      maxY: containerHeight - pieceHeight - margin 
    };
    
    const rightArea = { 
      minX: containerWidth * 0.6, 
      maxX: containerWidth - pieceWidth - margin, 
      minY: margin, 
      maxY: containerHeight - pieceHeight - margin 
    };
    
    // Créer les pièces et zones dans des positions semi-aléatoires
    for (let i = 0; i < 2; i++) {
      // Générer les attributs aléatoires
      const shape = getRandomShape();
      const color = getRandomColor();
      const rotation = Math.floor(Math.random() * 4) * 90; // 0, 90, 180, 270 degrés
      
      // Position de la pièce (à gauche)
      // Stratifier verticalement pour éviter le chevauchement
      const pieceY = leftArea.minY + (i * (leftArea.maxY - leftArea.minY) / 2);
      // Ajouter un peu de randomisation horizontale
      const pieceX = leftArea.minX + Math.random() * (leftArea.maxX - leftArea.minX) * 0.7;
      
      newPieces.push({
        id: i,
        pos: { x: pieceX, y: pieceY },
        isVerified: false,
        rotation,
        shape,
        color
      });
      
      // Position de la zone de dépôt (à droite)
      // Stratifier verticalement dans le même ordre que les pièces
      const dropY = rightArea.minY + (i * (rightArea.maxY - rightArea.minY) / 2);
      // Ajouter un peu de randomisation horizontale
      const dropX = rightArea.minX + Math.random() * (rightArea.maxX - rightArea.minX) * 0.7;
      
      newDropZones.push({
        id: i,
        pos: { x: dropX, y: dropY },
        shape
      });
    }
    
    setPieces(newPieces);
    setDropZones(newDropZones);
    
    // Réinitialiser l'état
    setVerified(false);
    setError(null);
    setPuzzleLoaded(true);
    
    // Réinitialiser les références
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
    
    // Si plus de 60% de la pièce est dans la zone de dépôt, c'est valide
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
    
    // Gérer différents types d'événements
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return; // Événement non pris en charge
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
    
    // Limiter au conteneur avec une marge pour éviter les problèmes de bord
    const boundedX = Math.max(5, Math.min(newX, container.width - piece.width - 5));
    const boundedY = Math.max(5, Math.min(newY, container.height - piece.height - 5));
    
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
  
  // Rendu des différentes formes de pièces
  const renderPieceShape = (piece: PieceData) => {
    switch (piece.shape) {
      case 'circle':
        return (
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent">
            <div className="w-2 h-10 rounded-full bg-gray-800/40 absolute left-2 top-2 transform rotate-45"></div>
            <div className="w-2 h-10 rounded-full bg-gray-800/40 absolute right-2 bottom-2 transform -rotate-45"></div>
          </div>
        );
      case 'triangle':
        return (
          <div className="absolute inset-0 clip-path-triangle bg-gradient-to-br from-white/20 to-transparent">
            <div className="w-2 h-10 rounded-full bg-gray-800/40 absolute left-2 bottom-2"></div>
            <div className="w-2 h-10 rounded-full bg-gray-800/40 absolute right-2 bottom-2"></div>
          </div>
        );
      case 'rectangle':
      default:
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-md">
            <div className="w-2 h-10 rounded-full bg-gray-800/40 absolute left-2 top-2"></div>
            <div className="w-2 h-10 rounded-full bg-gray-800/40 absolute right-2 bottom-2"></div>
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
                  backgroundColor: piece.color,
                  borderRadius: piece.shape === 'circle' ? '9999px' : 
                               piece.shape === 'triangle' ? '0' : '8px',
                  clipPath: piece.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
                  transform: `rotate(${piece.rotation}deg)`,
                  transformOrigin: 'center center'
                }}
                onMouseDown={(e) => handleDragStart(e, piece.id)}
                onTouchStart={(e) => handleDragStart(e, piece.id)}
              >
                {renderPieceShape(piece)}
                <span className="relative z-10 text-sm font-bold text-white">{piece.id + 1}</span>
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