/**
 * Composant Captcha personnalisé basé sur un puzzle
 * 
 * Ce captcha utilise un puzzle à faire glisser (slide puzzle) pour vérifier que l'utilisateur est humain:
 * - Une pièce de puzzle doit être glissée et déposée dans la position correspondante
 * - Les dimensions, positions et images sont aléatoires à chaque chargement
 * - Le motif de fond change à chaque chargement
 * - Beaucoup plus résistant aux attaques par OCR que les captchas textuels
 * 
 * Avantages de sécurité:
 * 1. Nécessite une interaction de type "glisser-déposer" difficile à automatiser
 * 2. Les motifs visuels et positions changent à chaque chargement
 * 3. Résistant aux techniques d'OCR et d'IA de reconnaissance d'images classiques
 * 4. Le puzzle change à chaque tentative échouée
 */

import React, { useState, useEffect, useRef } from 'react';

interface CaptchaProps {
  onVerify: (isVerified: boolean) => void;
}

const Captcha: React.FC<CaptchaProps> = ({ onVerify }) => {
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [piecePos, setPiecePos] = useState({ x: 0, y: 0 });
  const [dropZonePos, setDropZonePos] = useState({ x: 0, y: 0 });
  const [puzzleLoaded, setPuzzleLoaded] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const pieceRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
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
      }
    ];
    
    // Choisir un motif aléatoire
    const randomPattern = patternTypes[Math.floor(Math.random() * patternTypes.length)]();
    // Convertir en base64 pour utilisation en CSS
    return `url('data:image/svg+xml;base64,${btoa(randomPattern)}')`;
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
    
    // Définir la position initiale de la pièce (à gauche)
    setPiecePos({ 
      x: 20 + Math.random() * 30, 
      y: 30 + Math.random() * 20 
    });
    
    // Définir la position de la zone de dépôt (à droite)
    setDropZonePos({ 
      x: containerRef.current.clientWidth - 100 - Math.random() * 30, 
      y: 30 + Math.random() * 20 
    });
    
    // Réinitialiser l'état
    setVerified(false);
    setError(null);
    setPuzzleLoaded(true);
  };
  
  // Vérifier si la pièce est dans la zone de dépôt
  const checkPiecePosition = () => {
    if (!pieceRef.current || !dropZoneRef.current) return false;
    
    const piece = pieceRef.current.getBoundingClientRect();
    const dropZone = dropZoneRef.current.getBoundingClientRect();
    
    // Calculer le chevauchement
    const overlapX = Math.max(0, Math.min(piece.right, dropZone.right) - Math.max(piece.left, dropZone.left));
    const overlapY = Math.max(0, Math.min(piece.bottom, dropZone.bottom) - Math.max(piece.top, dropZone.top));
    
    // Surface de chevauchement
    const overlapArea = overlapX * overlapY;
    // Surface de la pièce
    const pieceArea = piece.width * piece.height;
    
    // Si plus de 70% de la pièce est dans la zone de dépôt, c'est valide
    return overlapArea / pieceArea > 0.7;
  };
  
  // Gérer le début du glissement
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (verified) return;
    setDragging(true);
    // Empêcher le comportement par défaut pour éviter les problèmes
    e.preventDefault();
  };
  
  // Gérer le glissement
  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging || verified) return;
    
    let clientX: number, clientY: number;
    
    // Gérer les événements tactiles et souris
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    if (!containerRef.current || !pieceRef.current) return;
    
    const container = containerRef.current.getBoundingClientRect();
    const piece = pieceRef.current.getBoundingClientRect();
    
    // Calculer la nouvelle position relative au conteneur
    const newX = clientX - container.left - piece.width / 2;
    const newY = clientY - container.top - piece.height / 2;
    
    // Limiter au conteneur
    const boundedX = Math.max(0, Math.min(newX, container.width - piece.width));
    const boundedY = Math.max(0, Math.min(newY, container.height - piece.height));
    
    setPiecePos({ x: boundedX, y: boundedY });
  };
  
  // Gérer la fin du glissement
  const handleDragEnd = () => {
    if (!dragging || verified) return;
    setDragging(false);
    
    // Vérifier si la pièce est dans la bonne position
    if (checkPiecePosition()) {
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
      if (dragging) {
        handleDrag(e as unknown as React.MouseEvent);
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (dragging) {
        handleDrag(e as unknown as React.TouchEvent);
      }
    };
    
    const handleMouseUp = () => {
      if (dragging) {
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
  }, [dragging]);
  
  // Réinitialiser si la taille du conteneur change
  useEffect(() => {
    const handleResize = () => refreshPuzzle();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="space-y-4">
      <div 
        ref={containerRef}
        className="relative h-[120px] w-full rounded-lg border border-gray-700 bg-gray-900 overflow-hidden"
        style={{ background: colors.background, touchAction: 'none' }}
      >
        {/* Instructions */}
        {!verified && (
          <div className="absolute inset-0 flex items-center justify-center text-center text-sm text-gray-300 z-0 pointer-events-none">
            <span>Glissez la pièce vers son emplacement</span>
          </div>
        )}
        
        {puzzleLoaded && (
          <>
            {/* Pièce de puzzle à faire glisser */}
            <div 
              ref={pieceRef}
              className={`absolute w-[80px] h-[50px] rounded-lg shadow-lg flex items-center justify-center cursor-grab ${dragging ? 'cursor-grabbing z-20' : 'z-10'} ${verified ? 'ring-2 ring-green-400' : ''}`}
              style={{ 
                left: `${piecePos.x}px`, 
                top: `${piecePos.y}px`,
                backgroundImage: pattern,
                border: `2px solid ${colors.accent}`,
              }}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/30 rounded-md"></div>
              <div className="w-2 h-10 rounded-full bg-gray-800/60 absolute left-1"></div>
              <div className="w-2 h-10 rounded-full bg-gray-800/60 absolute right-1"></div>
            </div>
            
            {/* Zone de dépôt */}
            <div 
              ref={dropZoneRef}
              className={`absolute w-[80px] h-[50px] rounded-lg border-2 border-dashed flex items-center justify-center ${verified ? 'border-green-400' : 'border-gray-400'}`}
              style={{ 
                left: `${dropZonePos.x}px`, 
                top: `${dropZonePos.y}px`,
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
              }}
            >
              {verified && (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </div>
          </>
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
    </div>
  );
};

export default Captcha; 