import React, { useState, useEffect } from 'react';
import { Upload, Image, File, X, Check, Trash2, Search } from 'lucide-react';

// Types pour les médias
interface Media {
  id: string;
  name: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  uploadDate: Date;
}

const MediaManager: React.FC = () => {
  // États pour gérer les médias et l'interface
  const [medias, setMedias] = useState<Media[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMedias, setFilteredMedias] = useState<Media[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  // Charger les médias au montage du composant
  useEffect(() => {
    const loadMedias = async () => {
      try {
        // Simulation de chargement pour le moment - à remplacer par un appel API réel
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Données factices pour le développement
        const mockMedias: Media[] = [
          {
            id: '1',
            name: 'photo-profil.jpg',
            type: 'image/jpeg',
            url: 'https://placekitten.com/800/600',
            thumbnailUrl: 'https://placekitten.com/200/150',
            size: 1024 * 1024 * 2.5, // 2.5MB
            uploadDate: new Date('2023-11-15')
          },
          {
            id: '2',
            name: 'presentation.pdf',
            type: 'application/pdf',
            url: 'https://example.com/presentation.pdf',
            size: 1024 * 1024 * 5.2, // 5.2MB
            uploadDate: new Date('2023-12-01')
          }
        ];
        
        setMedias(mockMedias);
        setFilteredMedias(mockMedias);
      } catch (error) {
        console.error("Erreur lors du chargement des médias:", error);
      }
    };
    
    loadMedias();
  }, []);

  // Filtrer les médias quand la recherche change
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMedias(medias);
    } else {
      const filtered = medias.filter(media => 
        media.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMedias(filtered);
    }
  }, [searchQuery, medias]);

  // Gérer la sélection de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Gérer l'upload du fichier
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simuler un upload avec progression
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setUploadProgress(i);
      }
      
      // Convertir le fichier en base64 (pour la démonstration)
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      
      reader.onload = () => {
        // Créer un nouvel objet média
        const newMedia: Media = {
          id: Date.now().toString(),
          name: selectedFile.name,
          type: selectedFile.type,
          url: URL.createObjectURL(selectedFile),
          thumbnailUrl: selectedFile.type.startsWith('image/') 
            ? URL.createObjectURL(selectedFile) 
            : undefined,
          size: selectedFile.size,
          uploadDate: new Date()
        };
        
        // Ajouter le nouveau média à la liste
        setMedias(prev => [newMedia, ...prev]);
        setFilteredMedias(prev => [newMedia, ...prev]);
        
        // Réinitialiser l'état d'upload
        setIsUploading(false);
        setUploadProgress(0);
        setSelectedFile(null);
      };
    } catch (error) {
      console.error("Erreur lors de l'upload du fichier:", error);
      setIsUploading(false);
    }
  };

  // Supprimer un média
  const handleDelete = (mediaId: string) => {
    setMedias(prev => prev.filter(media => media.id !== mediaId));
    setFilteredMedias(prev => prev.filter(media => media.id !== mediaId));
    
    if (selectedMedia?.id === mediaId) {
      setSelectedMedia(null);
    }
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else if (bytes < 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Uploader un nouveau média</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div 
              className="border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-500 transition-colors"
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-center text-gray-400 mb-2">
                Glissez-déposez un fichier ici ou cliquez pour sélectionner
              </p>
              <p className="text-xs text-gray-500">Taille maximale: 10MB</p>
              
              <input 
                type="file" 
                id="fileInput" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>
            
            {selectedFile && (
              <div className="mt-4 bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-gray-600 p-2 rounded mr-2">
                      {selectedFile.type.startsWith('image/') ? (
                        <Image className="h-6 w-6 text-blue-400" />
                      ) : (
                        <File className="h-6 w-6 text-indigo-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-400">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <button
                    className="text-red-400 hover:text-red-300"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {isUploading && (
                  <div className="mt-2">
                    <div className="h-2 bg-gray-600 rounded-full mt-2">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${uploadProgress}%` }} 
                      />
                    </div>
                    <div className="text-right text-xs text-gray-400 mt-1">
                      {uploadProgress}%
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="md:w-48 flex flex-col justify-end">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed w-full mb-2"
              disabled={!selectedFile || isUploading}
              onClick={handleUpload}
            >
              {isUploading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : 'Uploader'}
            </button>
            <button
              className="border border-gray-600 hover:border-gray-500 text-gray-300 font-medium py-2 px-4 rounded-lg"
              onClick={() => setSelectedFile(null)}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Bibliothèque de médias</h2>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        {filteredMedias.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Aucun média trouvé.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMedias.map(media => (
              <div 
                key={media.id} 
                className={`bg-gray-700 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer ${
                  selectedMedia?.id === media.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedMedia(media)}
              >
                <div className="h-40 flex items-center justify-center bg-gray-800">
                  {media.type.startsWith('image/') ? (
                    <img 
                      src={media.thumbnailUrl || media.url} 
                      alt={media.name}
                      className="max-h-full max-w-full object-cover" 
                    />
                  ) : (
                    <File className="h-16 w-16 text-gray-500" />
                  )}
                </div>
                
                <div className="p-3">
                  <p className="font-medium truncate" title={media.name}>{media.name}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-400">{formatFileSize(media.size)}</span>
                    <button 
                      className="text-red-400 hover:text-red-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(media.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium">{selectedMedia.name}</h3>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => setSelectedMedia(null)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col md:flex-row gap-6">
              <div className="md:w-2/3 bg-gray-900 rounded-lg flex items-center justify-center p-4 h-80">
                {selectedMedia.type.startsWith('image/') ? (
                  <img 
                    src={selectedMedia.url} 
                    alt={selectedMedia.name}
                    className="max-h-full max-w-full object-contain" 
                  />
                ) : (
                  <div className="text-center">
                    <File className="h-24 w-24 text-gray-500 mx-auto mb-4" />
                    <p>Aperçu non disponible</p>
                  </div>
                )}
              </div>
              
              <div className="md:w-1/3 space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Type</p>
                  <p>{selectedMedia.type}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Taille</p>
                  <p>{formatFileSize(selectedMedia.size)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Date d'upload</p>
                  <p>{selectedMedia.uploadDate.toLocaleDateString()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">URL</p>
                  <div className="flex items-center">
                    <input 
                      type="text" 
                      value={selectedMedia.url}
                      readOnly
                      className="bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm w-full"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button 
                      className="ml-2 bg-blue-600 hover:bg-blue-700 p-2 rounded-lg"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedMedia.url);
                        // Afficher un toast ou une notification ici
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    className="flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
                    onClick={() => {
                      handleDelete(selectedMedia.id);
                      setSelectedMedia(null);
                    }}
                  >
                    <Trash2 className="h-5 w-5 mr-2" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaManager; 