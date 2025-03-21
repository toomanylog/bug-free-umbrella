import React, { useState, useEffect, useRef } from 'react';
import { 
  getAllTools, 
  createTool, 
  updateTool, 
  deleteTool, 
  Tool, 
  ToolStatus, 
  ConditionType,
  ToolCondition
} from '../../firebase/tools';
import { getAllFormations } from '../../firebase/formations';
import { getAllCertifications } from '../../firebase/certifications';
import { Plus, Edit, Trash, Save, X, Download, UploadCloud, Loader, File, Database } from 'lucide-react';

// Constante pour GitHub
const GITHUB_PATH = 'public/tools';

// Types pour le formulaire
interface ToolFormData {
  name: string;
  description: string;
  downloadLink: string;
  imageUrl: string;
  category: string;
  features: string[];
  status: ToolStatus;
  iconType: 'lucide' | 'custom';
  icon: string;
  conditions: {
    type: ConditionType;
    value: string;
    description: string;
  }[];
}

const ToolManager: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [formError, setFormError] = useState<string>('');
  const [formSuccess, setFormSuccess] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formations, setFormations] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // État du formulaire
  const [form, setForm] = useState<{
    name: string;
    description: string;
    iconType: 'lucide' | 'custom';
    icon: string;
    status: ToolStatus;
    features: string[];
    downloadLink: string;
    conditions: ToolCondition[];
  }>({
    name: '',
    description: '',
    iconType: 'lucide',
    icon: 'Wrench',
    status: ToolStatus.ACTIVE,
    features: [''],
    downloadLink: '',
    conditions: []
  });

  // État pour le formulaire de création ou d'édition
  const [formData, setFormData] = useState<ToolFormData>({
    name: '',
    description: '',
    downloadLink: '',
    imageUrl: '',
    category: '',
    features: [],
    status: ToolStatus.ACTIVE,
    iconType: 'lucide',
    icon: 'Wrench',
    conditions: []
  });

  // État pour la modal de sélection de médias
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'file'>('image');
  
  // Fonction pour modifier le formulaire et ouvrir le sélecteur de médias
  const handleMediaSelectorOpen = (type: 'image' | 'file') => {
    setMediaType(type);
    setShowMediaSelector(true);
  };
  
  // Fonction pour gérer la sélection d'un média
  const handleMediaSelected = (url: string) => {
    if (mediaType === 'image') {
      setFormData((prev: ToolFormData) => ({ ...prev, imageUrl: url }));
    } else {
      setFormData((prev: ToolFormData) => ({ ...prev, downloadLink: url }));
    }
    setShowMediaSelector(false);
  };

  // Fonction pour uploader un fichier vers GitHub
  const uploadFileToGithub = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      setUploadProgress(10);
      
      // 1. Convertir le fichier en base64
      await fileToBase64(file);
      setUploadProgress(30);
      
      // 2. Générer un nom de fichier unique
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}-${file.name.replace(/\s+/g, '-')}`;
      const filePath = `${GITHUB_PATH}/${fileName}`;
      setUploadProgress(50);
      
      console.log(`Préparation de l'upload vers: ${filePath}`);
      
      // 3. Simuler une requête API (remplacer par une vraie implémentation)
      // Dans une vraie implémentation, vous utiliseriez l'API GitHub:
      // https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28#create-or-update-file-contents
      
      // Simulation pour démonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUploadProgress(80);
      
      // 4. Construire l'URL de téléchargement
      // Dans une application réelle, GitHub renverrait l'URL
      const downloadUrl = `/tools/${fileName}`;
      setUploadProgress(100);
      
      // Attendre un peu pour l'interface utilisateur
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return downloadUrl;
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
      const file = files[0];
      
      // Vérification de la taille du fichier (limite à 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setFormError('Le fichier est trop volumineux (max 50MB)');
        return;
      }
      
      // Uploader le fichier
      const downloadUrl = await uploadFileToGithub(file);
      
      // Mettre à jour le formulaire avec le lien de téléchargement
      setForm({
        ...form,
        downloadLink: downloadUrl
      });
      
      // Réinitialiser l'input file
      e.target.value = '';
      
      setFormSuccess('Fichier uploadé avec succès!');
      setTimeout(() => setFormSuccess(''), 3000);
      
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      setFormError('Erreur lors de l\'upload du fichier');
    }
  };
  
  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Charger les outils
        const toolsData = await getAllTools();
        setTools(toolsData);
        
        // Charger les formations pour les conditions
        const formationsData = await getAllFormations();
        setFormations(formationsData);
        
        // Charger les certifications pour les conditions
        const certificationsData = await getAllCertifications();
        setCertifications(certificationsData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      iconType: 'lucide',
      icon: 'Wrench',
      status: ToolStatus.ACTIVE,
      features: [''],
      downloadLink: '',
      conditions: []
    });
    setEditingTool(null);
    setFormError('');
    setFormSuccess('');
  };

  // Préparer l'édition d'un outil
  const handleEdit = (tool: Tool) => {
    setEditingTool(tool);
    setForm({
      name: tool.name,
      description: tool.description,
      iconType: tool.iconType,
      icon: tool.icon,
      status: tool.status,
      features: [...tool.features],
      downloadLink: tool.downloadLink || '',
      conditions: [...(tool.conditions || [])]
    });
    setShowForm(true);
    setFormError('');
    setFormSuccess('');
  };

  // Ajouter un nouvel outil
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setFormError('');
      setFormSuccess('');
      
      // Validation
      if (!form.name.trim() || !form.description.trim()) {
        setFormError('Le nom et la description sont requis');
        return;
      }
      
      if (form.features.some(f => !f.trim())) {
        setFormError('Les fonctionnalités ne peuvent pas être vides');
        return;
      }
      
      if (form.status === ToolStatus.ACTIVE && !form.downloadLink.trim()) {
        setFormError('Le lien de téléchargement est requis pour un outil actif');
        return;
      }
      
      // Création ou mise à jour
      if (editingTool) {
        await updateTool(editingTool.id, {
          name: form.name,
          description: form.description,
          iconType: form.iconType,
          icon: form.icon,
          status: form.status,
          features: form.features.filter(f => f.trim()),
          downloadLink: form.downloadLink,
          conditions: form.conditions
        });
        
        setFormSuccess('Outil mis à jour avec succès');
      } else {
        await createTool({
          name: form.name,
          description: form.description,
          iconType: form.iconType,
          icon: form.icon,
          status: form.status,
          features: form.features.filter(f => f.trim()),
          downloadLink: form.downloadLink,
          conditions: form.conditions
        });
        
        setFormSuccess('Outil créé avec succès');
      }
      
      // Recharger les outils
      const updatedTools = await getAllTools();
      setTools(updatedTools);
      
      // Réinitialiser le formulaire après 2 secondes
      setTimeout(() => {
        resetForm();
        setShowForm(false);
      }, 2000);
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      setFormError(error.message || 'Une erreur est survenue');
    }
  };

  // Supprimer un outil
  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet outil ?')) {
      try {
        await deleteTool(id);
        setTools(tools.filter(tool => tool.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'outil');
      }
    }
  };

  // Ajout d'une fonctionnalité
  const addFeature = () => {
    setForm({
      ...form,
      features: [...form.features, '']
    });
  };

  // Mise à jour d'une fonctionnalité
  const updateFeature = (index: number, value: string) => {
    const updatedFeatures = [...form.features];
    updatedFeatures[index] = value;
    setForm({
      ...form,
      features: updatedFeatures
    });
  };

  // Suppression d'une fonctionnalité
  const removeFeature = (index: number) => {
    const updatedFeatures = form.features.filter((_, i) => i !== index);
    setForm({
      ...form,
      features: updatedFeatures
    });
  };

  // Ajout d'une condition
  const addCondition = () => {
    setForm({
      ...form,
      conditions: [...form.conditions, {
        type: ConditionType.FORMATION_COMPLETED,
        value: '',
        description: ''
      }]
    });
  };

  // Mise à jour d'une condition
  const updateCondition = (index: number, field: keyof ToolCondition, value: string) => {
    const updatedConditions = [...form.conditions];
    updatedConditions[index] = {
      ...updatedConditions[index],
      [field]: value
    };
    setForm({
      ...form,
      conditions: updatedConditions
    });
  };

  // Suppression d'une condition
  const removeCondition = (index: number) => {
    const updatedConditions = form.conditions.filter((_, i) => i !== index);
    setForm({
      ...form,
      conditions: updatedConditions
    });
  };

  // Rendu du statut d'un outil
  const renderStatus = (status: ToolStatus) => {
    switch (status) {
      case ToolStatus.ACTIVE:
        return <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-full">Actif</span>;
      case ToolStatus.SOON:
        return <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 text-xs rounded-full">Bientôt</span>;
      case ToolStatus.INACTIVE:
        return <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded-full">Inactif</span>;
      case ToolStatus.UPDATING:
        return <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded-full">Mise à jour</span>;
      default:
        return <span className="px-2 py-1 bg-gray-900/30 text-gray-400 text-xs rounded-full">Inconnu</span>;
    }
  };

  // Modal pour sélectionner un média
  const MediaSelectorModal = () => {
    const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
    const mockMedias = [
      // Images
      { name: 'tool-placeholder.jpg', url: '/media/images/tool-placeholder.jpg', type: 'image/jpeg' },
      { name: 'diagnostic-tool.png', url: '/media/images/diagnostic-tool.png', type: 'image/png' },
      // Fichiers
      { name: 'linux-scanner.zip', url: '/tools/linux-scanner.zip', type: 'application/zip' },
      { name: 'performance-monitor.exe', url: '/tools/performance-monitor.exe', type: 'application/exe' },
    ];
    
    // Filtrer les médias par type
    const filteredMedias = mockMedias.filter(media => 
      mediaType === 'image' 
        ? media.type.startsWith('image/') 
        : !media.type.startsWith('image/')
    );
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 rounded-lg w-full max-w-2xl">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold">
              Sélectionner un {mediaType === 'image' ? 'image' : 'fichier'}
            </h3>
            <button 
              onClick={() => setShowMediaSelector(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-4 max-h-96 overflow-y-auto">
            {filteredMedias.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filteredMedias.map((media) => (
                  <div 
                    key={media.url}
                    className={`p-2 border rounded-lg cursor-pointer transition-colors ${
                      selectedMedia === media.url 
                        ? 'border-blue-500 bg-blue-900 bg-opacity-20' 
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedMedia(media.url)}
                  >
                    {media.type.startsWith('image/') ? (
                      <div className="h-24 flex items-center justify-center mb-2 bg-gray-700 rounded overflow-hidden">
                        <img src={media.url} alt={media.name} className="max-h-full max-w-full object-contain" />
                      </div>
                    ) : (
                      <div className="h-24 flex items-center justify-center mb-2 bg-gray-700 rounded">
                        <File size={32} className="text-gray-400" />
                      </div>
                    )}
                    <p className="text-sm truncate">{media.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Database size={32} className="mx-auto mb-2 opacity-30" />
                <p>Aucun {mediaType === 'image' ? 'image' : 'fichier'} disponible</p>
                <p className="text-sm mt-2">Utilisez le gestionnaire de médias pour ajouter des fichiers</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end p-4 border-t border-gray-700 space-x-3">
            <button 
              onClick={() => setShowMediaSelector(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
            >
              Annuler
            </button>
            <button 
              onClick={() => selectedMedia && handleMediaSelected(selectedMedia)}
              disabled={!selectedMedia}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sélectionner
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Gestion des outils</h2>
          <p className="text-gray-400">Gérez les outils disponibles pour les utilisateurs</p>
        </div>
        
        <button 
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Ajouter un outil
        </button>
      </div>
      
      {/* Liste des outils */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map(tool => (
          <div key={tool.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="font-bold truncate">{tool.name}</h3>
              {renderStatus(tool.status)}
            </div>
            
            <div className="p-4">
              <p className="text-gray-400 mb-4 h-20 overflow-hidden text-sm">{tool.description}</p>
              
              <div className="mb-4">
                <p className="text-sm font-semibold mb-2">Fonctionnalités ({tool.features.length})</p>
                <ul className="text-xs text-gray-400 list-disc pl-4 space-y-1 max-h-20 overflow-y-auto">
                  {tool.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-semibold mb-2">Conditions d'accès</p>
                {tool.conditions && tool.conditions.length > 0 ? (
                  <ul className="text-xs text-gray-400 list-disc pl-4 space-y-1 max-h-20 overflow-y-auto">
                    {tool.conditions.map((condition, idx) => (
                      <li key={idx}>
                        {condition.type === ConditionType.FORMATION_COMPLETED && 'Formation: '}
                        {condition.type === ConditionType.CERTIFICATION_OBTAINED && 'Certification: '}
                        {condition.type === ConditionType.ADMIN_ASSIGNED && 'Approbation admin: '}
                        {condition.description || condition.value}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500">Aucune condition requise</p>
                )}
              </div>
              
              <div className="flex space-x-2">
                {tool.status === ToolStatus.ACTIVE && tool.downloadLink && (
                  <a 
                    href={tool.downloadLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-medium flex items-center"
                  >
                    <Download size={14} className="mr-1" />
                    Télécharger
                  </a>
                )}
                
                <button 
                  onClick={() => handleEdit(tool)}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs flex items-center"
                >
                  <Edit size={14} className="mr-1" />
                  Modifier
                </button>
                
                <button 
                  onClick={() => handleDelete(tool.id)}
                  className="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg text-xs flex items-center"
                >
                  <Trash size={14} className="mr-1" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {tools.length === 0 && (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400 mb-4">Aucun outil n'a été créé pour le moment.</p>
          <button 
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg inline-flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Créer le premier outil
          </button>
        </div>
      )}
      
      {/* Formulaire de création/modification */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto flex justify-center items-start pt-10 pb-20">
          <div className="bg-gray-800 rounded-xl p-6 max-w-3xl w-full mx-4 shadow-2xl border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {editingTool ? 'Modifier l\'outil' : 'Ajouter un nouvel outil'}
              </h2>
              <button 
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-gray-700 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            {formError && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400">
                {formError}
              </div>
            )}
            
            {formSuccess && (
              <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-400">
                {formSuccess}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nom de l'outil</label>
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Vérificateur de Leads"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Statut</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as ToolStatus})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={ToolStatus.ACTIVE}>Actif</option>
                    <option value={ToolStatus.INACTIVE}>Inactif</option>
                    <option value={ToolStatus.SOON}>Bientôt disponible</option>
                    <option value={ToolStatus.UPDATING}>En mise à jour</option>
                  </select>
                </div>
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Description de l'outil..."
                />
              </div>
              
              {/* Icône */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Type d'icône</label>
                  <select 
                    value={formData.iconType}
                    onChange={(e) => setFormData({...formData, iconType: e.target.value as 'lucide' | 'custom'})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lucide">Lucide (SVG intégré)</option>
                    <option value="custom">Personnalisée (SVG personnalisé)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {formData.iconType === 'lucide' ? 'Nom de l\'icône Lucide' : 'Code SVG personnalisé'}
                  </label>
                  <input 
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={formData.iconType === 'lucide' ? 'Ex: Wrench' : '<svg>...</svg>'}
                  />
                </div>
              </div>
              
              {/* Lien de téléchargement avec upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Téléchargement de l'outil</label>
                <div className="flex">
                  <input 
                    type="text"
                    value={formData.downloadLink}
                    onChange={(e) => setFormData({...formData, downloadLink: e.target.value})}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="/tools/nom-du-fichier.zip"
                    disabled={uploading}
                  />
                  <button 
                    type="button"
                    onClick={handleUploadClick}
                    disabled={uploading}
                    className={`px-4 py-2 rounded-r-lg text-gray-300 hover:bg-gray-500 flex items-center justify-center ${uploading ? 'bg-blue-600' : 'bg-gray-600'}`}
                  >
                    {uploading ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <UploadCloud size={16} />
                    )}
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    className="hidden" 
                    accept=".zip,.exe,.rar,.7z,.tar,.gz,.pdf" 
                  />
                </div>
                
                {/* Barre de progression */}
                {uploading && (
                  <div className="mt-2">
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
                
                <p className="text-xs text-gray-400 mt-1">
                  Uploadez un fichier (max 50MB) ou entrez manuellement une URL de téléchargement
                </p>
              </div>
              
              {/* Fonctionnalités */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">Fonctionnalités</label>
                  <button 
                    type="button" 
                    onClick={addFeature}
                    className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded hover:bg-blue-900/50 flex items-center"
                  >
                    <Plus size={12} className="mr-1" />
                    Ajouter
                  </button>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto p-1">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <input 
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Détection de bounce"
                      />
                      <button 
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="ml-2 p-2 text-red-400 hover:bg-red-900/30 rounded-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Conditions d'accès */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">Conditions d'accès</label>
                  <button 
                    type="button" 
                    onClick={addCondition}
                    className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded hover:bg-blue-900/50 flex items-center"
                  >
                    <Plus size={12} className="mr-1" />
                    Ajouter
                  </button>
                </div>
                
                <div className="space-y-4 max-h-80 overflow-y-auto p-1">
                  {formData.conditions.map((condition, index) => (
                    <div key={index} className="p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-300">Type de condition</label>
                        <button 
                          type="button"
                          onClick={() => removeCondition(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      <select 
                        value={condition.type}
                        onChange={(e) => updateCondition(index, 'type', e.target.value as ConditionType)}
                        className="w-full px-3 py-2 mb-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={ConditionType.FORMATION_COMPLETED}>Formation complétée</option>
                        <option value={ConditionType.CERTIFICATION_OBTAINED}>Certification obtenue</option>
                        <option value={ConditionType.ADMIN_ASSIGNED}>Attribution par l'administrateur</option>
                      </select>
                      
                      {condition.type === ConditionType.FORMATION_COMPLETED && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Formation requise</label>
                          <select 
                            value={condition.value}
                            onChange={(e) => {
                              const formationId = e.target.value;
                              const formation = formations.find(f => f.id === formationId);
                              updateCondition(index, 'value', formationId);
                              updateCondition(index, 'description', formation ? formation.title : '');
                            }}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Sélectionnez une formation</option>
                            {formations.map(formation => (
                              <option key={formation.id} value={formation.id}>
                                {formation.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      {condition.type === ConditionType.CERTIFICATION_OBTAINED && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Certification requise</label>
                          <select 
                            value={condition.value}
                            onChange={(e) => {
                              const certificationId = e.target.value;
                              const certification = certifications.find(c => c.id === certificationId);
                              updateCondition(index, 'value', certificationId);
                              // Vérifier si le titre existe avant de l'assigner
                              const certificationTitle = certification && certification.title ? certification.title : 'Certification requise';
                              updateCondition(index, 'description', certificationTitle);
                            }}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Sélectionnez une certification</option>
                            {certifications.map(certification => (
                              <option key={certification.id} value={certification.id}>
                                {certification.title || 'Certification sans titre'}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      {condition.type === ConditionType.ADMIN_ASSIGNED && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                          <input 
                            type="text"
                            value={condition.description}
                            onChange={(e) => updateCondition(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ex: Contacter un administrateur pour demander l'accès"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {formData.conditions.length === 0 && (
                    <p className="text-sm text-gray-500 py-2">
                      Aucune condition d'accès définie. L'outil sera accessible à tous les utilisateurs.
                    </p>
                  )}
                </div>
              </div>
              
              {/* Boutons d'action */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                >
                  Annuler
                </button>
                
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center"
                  disabled={formSuccess !== ''}
                >
                  <Save size={18} className="mr-2" />
                  {editingTool ? 'Mettre à jour' : 'Créer l\'outil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showMediaSelector && <MediaSelectorModal />}
    </div>
  );
};

export default ToolManager; 