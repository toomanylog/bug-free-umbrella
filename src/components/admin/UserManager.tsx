import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole, UserData, UserRole, Formation } from '../../firebase/auth';
import { getAllFormations, assignFormationToUser } from '../../firebase/formations';
import { Users, UserCheck, UserX, PlusCircle, ChevronDown, ChevronUp } from 'lucide-react';

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{message: string, isError: boolean} | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [assigningFormation, setAssigningFormation] = useState<string | null>(null);
  const [selectedFormation, setSelectedFormation] = useState<string>('');

  // Charger tous les utilisateurs et formations
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [usersData, formationsData] = await Promise.all([
          getAllUsers(),
          getAllFormations()
        ]);
        setUsers(usersData);
        setFormations(formationsData);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des données");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const showFeedback = (message: string, isError: boolean = false) => {
    setFeedback({ message, isError });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRole(userId, newRole);
      
      // Mise à jour locale
      setUsers(users.map(user => 
        user.uid === userId ? { ...user, role: newRole } : user
      ));
      
      showFeedback(`Rôle modifié avec succès`);
    } catch (err) {
      showFeedback("Erreur lors de la modification du rôle", true);
      console.error(err);
    }
  };

  const handleAssignFormation = async (userId: string) => {
    if (!selectedFormation) {
      return showFeedback("Veuillez sélectionner une formation", true);
    }

    try {
      await assignFormationToUser(selectedFormation, userId);
      showFeedback("Formation assignée avec succès");
      setAssigningFormation(null);
      setSelectedFormation('');
      
      // Mise à jour de la liste (le plus simple serait de recharger les utilisateurs)
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
    } catch (err) {
      showFeedback("Erreur lors de l'assignation de la formation", true);
      console.error(err);
    }
  };

  const toggleUserExpand = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrateur';
      case UserRole.CLIENT:
        return 'Client';
      default:
        return 'Utilisateur';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Feedback */}
      {feedback && (
        <div className={`p-4 mb-4 rounded-lg ${feedback.isError ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}>
          {feedback.message}
        </div>
      )}
      
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Utilisateurs</h2>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">{users.length}</span>
            <Users size={28} className="text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Administrateurs</h2>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">
              {users.filter(u => u.role === UserRole.ADMIN).length}
            </span>
            <UserCheck size={28} className="text-green-500" />
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Clients</h2>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">
              {users.filter(u => u.role === UserRole.CLIENT).length}
            </span>
            <UserX size={28} className="text-yellow-500" />
          </div>
        </div>
      </div>
      
      {/* Liste des utilisateurs */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Liste des utilisateurs</h2>
        
        {error && (
          <div className="p-4 mb-4 rounded-lg bg-red-900/50 text-red-200">
            {error}
          </div>
        )}
        
        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            Aucun utilisateur trouvé
          </div>
        ) : (
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.uid} className="bg-gray-700 rounded-lg overflow-hidden">
                {/* En-tête utilisateur */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || user.email} 
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                        <span className="text-lg font-bold">
                          {(user.displayName || user.email || 'U')[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-semibold">
                        {user.displayName || 'Sans nom'}
                      </h3>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      user.role === UserRole.ADMIN 
                        ? 'bg-green-900/50 text-green-200' 
                        : 'bg-blue-900/50 text-blue-200'
                    }`}>
                      {getRoleLabel(user.role)}
                    </span>
                    
                    <button 
                      className="p-2 hover:bg-gray-600 rounded-full"
                      onClick={() => toggleUserExpand(user.uid)}
                    >
                      {expandedUser === user.uid ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>
                
                {/* Détails utilisateur */}
                {expandedUser === user.uid && (
                  <div className="p-4 bg-gray-800 border-t border-gray-700">
                    {/* Changement de rôle */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Modifier le rôle</h4>
                      <div className="flex space-x-2">
                        <button 
                          className={`px-3 py-1 rounded-lg text-sm ${
                            user.role === UserRole.ADMIN ? 'bg-green-600' : 'bg-gray-600 hover:bg-green-700'
                          }`}
                          onClick={() => handleRoleChange(user.uid, UserRole.ADMIN)}
                          disabled={user.role === UserRole.ADMIN}
                        >
                          Administrateur
                        </button>
                        <button 
                          className={`px-3 py-1 rounded-lg text-sm ${
                            user.role === UserRole.CLIENT ? 'bg-blue-600' : 'bg-gray-600 hover:bg-blue-700'
                          }`}
                          onClick={() => handleRoleChange(user.uid, UserRole.CLIENT)}
                          disabled={user.role === UserRole.CLIENT}
                        >
                          Client
                        </button>
                      </div>
                    </div>
                    
                    {/* Formations assignées */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Formations assignées</h4>
                        <button 
                          className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                          onClick={() => setAssigningFormation(assigningFormation === user.uid ? null : user.uid)}
                        >
                          <PlusCircle size={14} className="mr-1" />
                          Assigner une formation
                        </button>
                      </div>
                      
                      {/* Interface d'assignation */}
                      {assigningFormation === user.uid && (
                        <div className="bg-gray-700 p-3 rounded-lg mb-3 flex space-x-2">
                          <select
                            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg"
                            value={selectedFormation}
                            onChange={e => setSelectedFormation(e.target.value)}
                          >
                            <option value="">Sélectionner une formation</option>
                            {formations.map(formation => (
                              <option key={formation.id} value={formation.id}>
                                {formation.title}
                              </option>
                            ))}
                          </select>
                          <button
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
                            onClick={() => handleAssignFormation(user.uid)}
                          >
                            Assigner
                          </button>
                        </div>
                      )}
                      
                      {/* Liste des formations assignées */}
                      {user.formationsProgress && Object.keys(user.formationsProgress).length > 0 ? (
                        <ul className="bg-gray-700 rounded-lg overflow-hidden">
                          {Object.entries(user.formationsProgress).map(([formationId, progress]) => {
                            const formation = formations.find(f => f.id === formationId);
                            const totalModules = formation?.modules?.length || 0;
                            const completedModules = progress.completedModules?.length || 0;
                            const progressPercent = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
                            
                            return (
                              <li key={formationId} className="p-3 border-b border-gray-600 last:border-b-0">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-medium">
                                    {formation?.title || 'Formation inconnue'}
                                  </span>
                                  <span className="text-xs">
                                    {completedModules}/{totalModules} modules
                                  </span>
                                </div>
                                <div className="w-full bg-gray-600 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full" 
                                    style={{ width: `${progressPercent}%` }}
                                  ></div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          Aucune formation assignée
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManager; 