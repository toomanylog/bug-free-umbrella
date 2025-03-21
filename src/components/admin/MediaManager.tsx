import React, { useState, useRef, useEffect } from 'react';
import { 
  Database, 
  Upload, 
  Folder, 
  Image, 
  File, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Search,
  Loader
} from 'lucide-react';

// Constantes pour GitHub
const GITHUB_REPO = 'bug-free-umbrella';
const GITHUB_OWNER = 'votre-organisation'; // À remplacer par votre organisation
const GITHUB_PATHS = {
  images: 'public/media/images',
  tools: 'public/tools',
  documents: 'public/media/documents'
};

// Types
interface MediaFile {
  name: string;
  path: string;
  size: number;
  type: string;
  url: string;
  uploaded: string; // Date au format ISO
}

const MediaManager: React.FC = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('images');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les fichiers au chargement du composant
  useEffect(() => {
    loadFiles(selectedFolder);
  }, [selectedFolder]);

  // Fonction pour charger les fichiers d'un dossier
  const loadFiles = async (folder: string) => {
    setLoading(true);
    setFiles([]);
    
    try {
      // Ici, en production, vous feriez un appel à l'API GitHub pour obtenir les fichiers
      // Pour la démo, nous simulons les fichiers
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockFiles: MediaFile[] = [
        {
          name: 'exemple-image.jpg',
          path: `${GITHUB_PATHS[folder as keyof typeof GITHUB_PATHS]}/exemple-image.jpg`,
          size: 1024 * 512, // 512 KB
          type: 'image/jpeg',
          url: `/media/images/exemple-image.jpg`,
          uploaded: new Date().toISOString()
        },
        {
          name: 'document-test.pdf',
          path: `${GITHUB_PATHS[folder as keyof typeof GITHUB_PATHS]}/document-test.pdf`,
          size: 1024 * 1024 * 2, // 2 MB
          type: 'application/pdf',
          url: `/media/documents/document-test.pdf`,
          uploaded: new Date(Date.now() - 86400000).toISOString() // Hier
        }
      ];
      
      setFiles(mockFiles);
    } catch (err) {
      console.error('Erreur lors du chargement des fichiers:', err);
      setError('Erreur lors du chargement des fichiers');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour uploader un fichier
  const uploadFile = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      setUploadProgress(10);
      
      // 1. Convertir le fichier en base64
      const base64Content = await fileToBase64(file);
      setUploadProgress(30);
      
      // 2. Générer un nom de fichier unique
      const timestamp = new Date().getTime();
      const safeFileName = file.name.replace(/\s+/g, '-');
      const fileName = `${timestamp}-${safeFileName}`;
      const filePath = `${GITHUB_PATHS[selectedFolder as keyof typeof GITHUB_PATHS]}/${fileName}`;
      setUploadProgress(50);
      
      // 3. Simuler une requête API vers GitHub (à remplacer par une vraie implémentation)
      await new Promise(resolve => setTimeout(resolve, 1500));
      setUploadProgress(80);
      
      // 4. Construire l'URL pour accéder au fichier
      const fileUrl = `/${selectedFolder === 'tools' ? 'tools' : `media/${selectedFolder}`}/${fileName}`;
      setUploadProgress(100);
      
      // Attendre un peu pour l'UI
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 5. Ajouter le nouveau fichier à la liste
      const newFile: MediaFile = {
        name: fileName,
        path: filePath,
        size: file.size,
        type: file.type,
        url: fileUrl,
        uploaded: new Date().toISOString()
      };
      
      setFiles(prev => [newFile, ...prev]);
      
      return fileUrl;
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      throw new Error('Erreur lors de l\'upload du fichier');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
  
  // Utilitaire pour convertir un fichier en base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Extraire seulement la partie base64
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Erreur de conversion en base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  // Gérer le clic sur le bouton d'upload
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  // Gérer la sélection de fichier
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setError('');
      
      const file = files[0];
      
      // Vérifier la taille du fichier (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError('Le fichier est trop volumineux (max 50MB)');
        return;
      }
      
      // Vérifier le type de fichier selon le dossier
      if (selectedFolder === 'images' && !file.type.startsWith('image/')) {
        setError('Seules les images sont autorisées dans ce dossier');
        return;
      }
      
      // Uploader le fichier
      const fileUrl = await uploadFile(file);
      
      // Réinitialiser l'input file
      e.target.value = '';
      
      // Afficher le message de succès
      setSuccess(`Fichier uploadé avec succès: ${fileUrl}`);
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      setError('Erreur lors de l\'upload du fichier');
    }
  };

  // Supprimer un fichier
  const handleDeleteFile = async (file: MediaFile) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${file.name} ?`)) {
      return;
    }
    
    try {
      // Simuler la suppression
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Retirer le fichier de la liste
      setFiles(prev => prev.filter(f => f.name !== file.name));
      
      setSuccess('Fichier supprimé avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError('Erreur lors de la suppression du fichier');
    }
  };

  // Copier l'URL d'un fichier
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(
      () => {
        setSuccess('URL copiée dans le presse-papier');
        setTimeout(() => setSuccess(''), 3000);
      },
      () => {
        setError('Impossible de copier l\'URL');
      }
    );
  };

  // Filtrer les fichiers selon la recherche
  const filteredFiles = searchQuery 
    ? files.filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : files;

  // Conversion de taille de fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  // Icône selon le type de fichier
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image size={24} className="text-blue-400" />;
    if (type.startsWith('application/pdf')) return <File size={24} className="text-red-400" />;
    if (type.includes('zip') || type.includes('rar') || type.includes('tar') || type.includes('7z')) 
      return <File size={24} className="text-yellow-400" />;
    return <File size={24} className="text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des médias</h2>
        <div className="flex space-x-2">
          <select 
            value={selectedFolder} 
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
          >
            <option value="images">Images</option>
            <option value="tools">Outils</option>
            <option value="documents">Documents</option>
          </select>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
            accept={selectedFolder === 'images' ? 'image/*' : undefined}
          />
          <button 
            onClick={handleUploadClick}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <Loader size={18} className="mr-2 animate-spin" />
            ) : (
              <Upload size={18} className="mr-2" />
            )}
            Importer
          </button>
        </div>
      </div>
      
      {/* Messages d'erreur/succès */}
      {error && (
        <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-400">
          {success}
        </div>
      )}
      
      {/* Barre de progression */}
      {uploading && (
        <div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 text-right mt-1">
            {uploadProgress}% téléversé
          </p>
        </div>
      )}
      
      {/* Recherche */}
      <div className="relative">
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher des fichiers..."
          className="w-full px-10 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      
      {/* Liste des fichiers */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">
          Fichiers dans {
            selectedFolder === 'images' ? 'Images' : 
            selectedFolder === 'tools' ? 'Outils' : 'Documents'
          }
          {searchQuery && ` (recherche: "${searchQuery}")`}
        </h3>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader size={32} className="animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {filteredFiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredFiles.map((file) => (
                  <div key={file.name} className="bg-gray-700 p-4 rounded-lg flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-gray-600 p-3 rounded">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => handleCopyUrl(file.url)}
                          className="p-1.5 hover:bg-gray-600 rounded-lg text-gray-300"
                          title="Copier l'URL"
                        >
                          <Copy size={16} />
                        </button>
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 hover:bg-gray-600 rounded-lg text-gray-300"
                          title="Ouvrir dans un nouvel onglet"
                        >
                          <ExternalLink size={16} />
                        </a>
                        <button 
                          onClick={() => handleDeleteFile(file)}
                          className="p-1.5 hover:bg-red-900/30 rounded-lg text-gray-300 hover:text-red-400"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-sm font-medium mb-1 break-all line-clamp-2" title={file.name}>
                        {file.name}
                      </h4>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{formatFileSize(file.size)}</span>
                        <span title={new Date(file.uploaded).toLocaleString()}>
                          {new Date(file.uploaded).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {file.type.startsWith('image/') && (
                      <div className="mt-3 h-24 bg-gray-800 rounded-lg overflow-hidden flex justify-center items-center">
                        <img src={file.url} alt={file.name} className="max-h-full max-w-full object-contain" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-gray-400">
                <Database className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium mb-2">Aucun fichier {searchQuery && "correspondant à la recherche"}</p>
                <p className="text-sm max-w-md mx-auto">
                  {searchQuery 
                    ? `Essayez une autre recherche ou videz le champ de recherche pour voir tous les fichiers.`
                    : `Commencez par importer des fichiers dans ce dossier en utilisant le bouton "Importer".`
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MediaManager; 