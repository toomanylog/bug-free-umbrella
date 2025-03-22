import { ref, set, get, push, remove, update } from 'firebase/database';
import { database } from './config';

// Types
export interface Certification {
  id: string;
  title: string;
  description: string;
  formation?: string; // ID de la formation associée
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  examQuestions?: ExamQuestion[];
  passingScore?: number; // Score minimum pour réussir (en pourcentage, par défaut 70%)
  requirements: CertificationRequirement[]; // Change from optional to required with default empty array
  published?: boolean; // Added to fix errors in CertificationManager
}

export interface CertificationRequirement {
  type: RequirementType;
  formationIds?: string[]; // Formations requises
  minScore?: number; // Score minimum à l'examen (en pourcentage)
  description: string;
}

export enum RequirementType {
  COMPLETE_FORMATIONS = 'complete_formations',
  COMPLETE_SPECIFIC_MODULES = 'complete_specific_modules',
  PASS_EXAM = 'pass_exam',
  ADMIN_APPROVAL = 'admin_approval'
}

export interface ExamQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  MULTIPLE_ANSWER = 'multiple_answer',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer'
}

export interface UserCertification {
  userId: string;
  certificationId: string;
  status: CertificationStatus;
  earnedAt?: string;
  expiresAt?: string;
  examResults?: ExamResult;
}

export enum CertificationStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  FAILED = 'failed'
}

export interface ExamResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  submittedAt: string;
  answers: {
    questionId: string;
    userAnswer: string | string[];
    isCorrect: boolean;
  }[];
}

// Fonction pour obtenir toutes les certifications
export const getAllCertifications = async (): Promise<Certification[]> => {
  try {
    const certificationsRef = ref(database, 'certifications');
    const snapshot = await get(certificationsRef);
    
    if (snapshot.exists()) {
      const certificationsData: Record<string, Certification> = snapshot.val();
      return Object.entries(certificationsData).map(([id, certification]) => ({
        ...certification,
        id
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Erreur lors de la récupération des certifications:', error);
    return [];
  }
};

// Fonction pour créer une nouvelle certification
export const createCertification = async (certificationData: Omit<Certification, 'id'>): Promise<string> => {
  try {
    const certificationsRef = ref(database, 'certifications');
    const newCertificationRef = push(certificationsRef);
    
    await set(newCertificationRef, {
      ...certificationData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return newCertificationRef.key || '';
  } catch (error) {
    console.error('Erreur lors de la création de la certification:', error);
    throw error;
  }
};

// Fonction pour mettre à jour une certification
export const updateCertification = async (certificationId: string, certificationData: Partial<Certification>): Promise<void> => {
  try {
    const certificationRef = ref(database, `certifications/${certificationId}`);
    
    await update(certificationRef, {
      ...certificationData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la certification ${certificationId}:`, error);
    throw error;
  }
};

// Fonction pour supprimer une certification
export const deleteCertification = async (certificationId: string): Promise<void> => {
  try {
    const certificationRef = ref(database, `certifications/${certificationId}`);
    await remove(certificationRef);
  } catch (error) {
    console.error(`Erreur lors de la suppression de la certification ${certificationId}:`, error);
    throw error;
  }
};

// Fonction pour vérifier si un utilisateur remplit les conditions d'une certification
export const checkCertificationEligibility = async (userId: string, certificationId: string): Promise<{
  eligible: boolean;
  missingRequirements: string[];
}> => {
  try {
    // Récupérer la certification
    const certificationRef = ref(database, `certifications/${certificationId}`);
    const certificationSnapshot = await get(certificationRef);
    
    if (!certificationSnapshot.exists()) {
      throw new Error(`La certification ${certificationId} n'existe pas`);
    }
    
    const certification = {
      id: certificationId,
      ...certificationSnapshot.val(),
      requirements: certificationSnapshot.val().requirements || [] // Ensure requirements is always an array
    } as Certification;
    
    // Récupérer les données utilisateur
    const userRef = ref(database, `users/${userId}`);
    const userSnapshot = await get(userRef);
    
    if (!userSnapshot.exists()) {
      throw new Error(`L'utilisateur ${userId} n'existe pas`);
    }
    
    const userData = userSnapshot.val();
    const formationsProgress = userData.formationsProgress || [];
    
    // Vérifier chaque exigence
    const missingRequirements: string[] = [];
    let allRequirementsMet = true;
    
    for (const requirement of certification.requirements) {
      switch (requirement.type) {
        case RequirementType.COMPLETE_FORMATIONS:
          if (requirement.formationIds && requirement.formationIds.length > 0) {
            const completedFormations = formationsProgress
              .filter((progress: any) => progress.completed)
              .map((progress: any) => progress.formationId);
            
            const missingFormations = requirement.formationIds
              .filter((id: string) => !completedFormations.includes(id));
            
            if (missingFormations.length > 0) {
              allRequirementsMet = false;
              missingRequirements.push(`Formations à compléter: ${missingFormations.length} formation(s) manquante(s)`);
            }
          }
          break;
          
        case RequirementType.PASS_EXAM:
          // Vérifier si l'utilisateur a passé l'examen avec succès
          const userCertificationRef = ref(database, `userCertifications/${userId}/${certificationId}`);
          const userCertificationSnapshot = await get(userCertificationRef);
          
          if (!userCertificationSnapshot.exists() || 
              !userCertificationSnapshot.val().examResults || 
              userCertificationSnapshot.val().examResults.score < (requirement.minScore || 70)) {
            allRequirementsMet = false;
            missingRequirements.push(`Examen à réussir avec un score minimum de ${requirement.minScore || 70}%`);
          }
          break;
          
        case RequirementType.ADMIN_APPROVAL:
          // Vérifier si un administrateur a approuvé cette certification
          const adminApprovalRef = ref(database, `userCertifications/${userId}/${certificationId}/adminApproved`);
          const adminApprovalSnapshot = await get(adminApprovalRef);
          
          if (!adminApprovalSnapshot.exists() || !adminApprovalSnapshot.val()) {
            allRequirementsMet = false;
            missingRequirements.push('Approbation administrative requise');
          }
          break;
      }
    }
    
    return {
      eligible: allRequirementsMet,
      missingRequirements
    };
    
  } catch (error) {
    console.error(`Erreur lors de la vérification d'éligibilité pour la certification ${certificationId}:`, error);
    throw error;
  }
};

// Fonction pour attribuer une certification à un utilisateur
export const awardCertification = async (userId: string, certificationId: string): Promise<void> => {
  try {
    // Vérifier l'éligibilité d'abord
    const { eligible } = await checkCertificationEligibility(userId, certificationId);
    
    if (!eligible) {
      throw new Error(`L'utilisateur ne remplit pas toutes les conditions pour cette certification`);
    }
    
    // Mettre à jour l'état de la certification pour l'utilisateur
    const userCertificationRef = ref(database, `userCertifications/${userId}/${certificationId}`);
    
    await update(userCertificationRef, {
      status: CertificationStatus.COMPLETED,
      earnedAt: new Date().toISOString(),
      // Durée de validité d'un an par défaut
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    // Mettre à jour les données utilisateur avec cette certification
    const userRef = ref(database, `users/${userId}/certifications/${certificationId}`);
    await set(userRef, {
      earnedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    });
    
  } catch (error) {
    console.error(`Erreur lors de l'attribution de la certification ${certificationId} à l'utilisateur ${userId}:`, error);
    throw error;
  }
};

/**
 * Soumet un examen de certification
 * @param userId ID de l'utilisateur
 * @param certificationId ID de la certification
 * @param userAnswers Réponses de l'utilisateur
 * @returns Résultat de l'examen
 */
export const submitExam = async (
  userId: string,
  certificationId: string,
  userAnswers: { questionId: string; answer: string | string[] }[]
) => {
  try {
    // Récupérer la certification
    const certification = await getCertification(certificationId);
    
    if (!certification.examQuestions || certification.examQuestions.length === 0) {
      throw new Error("Cette certification ne contient pas de questions d'examen");
    }
    
    // Vérifier les réponses
    let correctAnswers = 0;
    const totalQuestions = certification.examQuestions.length;
    
    userAnswers.forEach(userAnswer => {
      const question = certification.examQuestions!.find(q => q.id === userAnswer.questionId);
      
      if (!question) return;
      
      let isCorrect = false;
      
      // Vérifier si la réponse est correcte selon le type de question
      if (question.type === QuestionType.MULTIPLE_CHOICE || question.type === QuestionType.TRUE_FALSE) {
        isCorrect = userAnswer.answer === question.correctAnswer;
      } 
      else if (question.type === QuestionType.MULTIPLE_ANSWER) {
        // Pour les questions à choix multiples, vérifier que toutes les bonnes réponses sont sélectionnées
        // et qu'aucune mauvaise réponse n'est sélectionnée
        const userAnswerArray = userAnswer.answer as string[];
        const correctAnswerArray = question.correctAnswer as string[];
        
        // Toutes les bonnes réponses doivent être sélectionnées
        const allCorrectSelected = correctAnswerArray.every(answer => 
          userAnswerArray.includes(answer)
        );
        
        // Aucune mauvaise réponse ne doit être sélectionnée
        const noIncorrectSelected = userAnswerArray.every(answer => 
          correctAnswerArray.includes(answer)
        );
        
        isCorrect = allCorrectSelected && noIncorrectSelected;
      }
      else if (question.type === QuestionType.SHORT_ANSWER) {
        // Pour les réponses courtes, on peut implémenter une logique plus flexible
        // comme vérifier si la réponse contient certains mots-clés
        const userAnswerText = (userAnswer.answer as string).toLowerCase().trim();
        const correctAnswerText = (question.correctAnswer as string).toLowerCase().trim();
        
        // Vérification simple d'égalité
        isCorrect = userAnswerText === correctAnswerText;
      }
      
      if (isCorrect) {
        correctAnswers++;
      }
    });
    
    // Calculer le score
    const score = (correctAnswers / totalQuestions) * 100;
    const passingScore = certification.passingScore || 70; // Par défaut 70%
    const passed = score >= passingScore;
    
    // Enregistrer le résultat dans Realtime Database au lieu de Firestore
    const userCertificationRef = ref(database, `userCertifications/${userId}/${certificationId}`);
    const submittedAt = new Date().toISOString();
    
    await update(userCertificationRef, {
      status: passed ? CertificationStatus.COMPLETED : CertificationStatus.FAILED,
      examResults: {
        score,
        correctAnswers,
        totalQuestions,
        submittedAt,
        answers: userAnswers.map(answer => ({
          questionId: answer.questionId,
          userAnswer: answer.answer,
          isCorrect: certification.examQuestions!.find(q => q.id === answer.questionId)?.correctAnswer === answer.answer
        }))
      }
    });
    
    // Si l'utilisateur a réussi, mettre à jour ses données
    if (passed) {
      // Mettre à jour le statut de la certification
      await update(userCertificationRef, {
        earnedAt: submittedAt,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 an de validité
      });
      
      // Ajouter la certification à la liste des certifications de l'utilisateur
      const userCertificationsRef = ref(database, `users/${userId}/certifications/${certificationId}`);
      await set(userCertificationsRef, {
        earnedAt: submittedAt,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      try {
        // Trouver la formation associée à cette certification pour mettre à jour formationsProgress
        const userRef = ref(database, `users/${userId}`);
        const userSnapshot = await get(userRef);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          const formationsProgress = userData.formationsProgress || [];
          
          // Récupérer l'ID de la formation liée à cette certification
          let formationId = certification.formation;
          
          // Si l'ID de formation n'est pas directement dans la certification, chercher parmi les formations
          if (!formationId) {
            // Chercher dans toutes les formations pour trouver celle qui a cette certification
            const formationsRef = ref(database, 'formations');
            const formationsSnapshot = await get(formationsRef);
            
            if (formationsSnapshot.exists()) {
              const formations = formationsSnapshot.val();
              
              // Parcourir toutes les formations pour trouver celle qui a cette certification
              for (const [fId, formation] of Object.entries<{certificationId?: string}>(formations)) {
                if (formation.certificationId === certificationId) {
                  formationId = fId;
                  break;
                }
              }
            }
          }
          
          if (formationId) {
            // Mettre à jour le certificateUrl dans formationsProgress pour cette formation
            const updatedFormationsProgress = formationsProgress.map((progress: any) => {
              if (progress.formationId === formationId) {
                return {
                  ...progress,
                  completed: true,
                  certificateUrl: `/certification/${certificationId}`,
                  completedAt: submittedAt
                };
              }
              return progress;
            });
            
            // Sauvegarder les changements
            await update(userRef, {
              formationsProgress: updatedFormationsProgress
            });
            
            console.log(`Certification ${certificationId} enregistrée pour l'utilisateur ${userId} et liée à la formation ${formationId}`);
          } else {
            console.warn(`Aucune formation trouvée pour la certification ${certificationId}`);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour de formationsProgress:", error);
        // Ne pas bloquer le processus même si cette partie échoue
      }
    }
    
    // Retourner le résultat
    return {
      passed,
      score,
      correctAnswers,
      totalQuestions,
      passingScore
    };
  } catch (error) {
    console.error('Erreur lors de la soumission de l\'examen:', error);
    throw error;
  }
};

// Fonction pour récupérer les certifications d'un utilisateur
export const getUserCertifications = async (userId: string): Promise<{
  certification: Certification;
  status: CertificationStatus;
  earnedAt?: string;
}[]> => {
  try {
    // Vérifier si l'utilisateur existe
    const userRef = ref(database, `users/${userId}`);
    const userSnapshot = await get(userRef);
    
    if (!userSnapshot.exists()) {
      console.error(`L'utilisateur ${userId} n'existe pas`);
      return [];
    }
    
    // Récupérer les certifications de l'utilisateur
    try {
      const userCertificationsRef = ref(database, `userCertifications/${userId}`);
      const userCertificationsSnapshot = await get(userCertificationsRef);
      
      if (!userCertificationsSnapshot.exists()) {
        return []; // Aucune certification trouvée
      }
      
      const userCertifications = userCertificationsSnapshot.val();
      
      // Récupérer les détails de chaque certification
      const certifications = await Promise.all(
        Object.entries(userCertifications).map(async ([certificationId, certData]: [string, any]) => {
          try {
            const certification = await getCertificationById(certificationId);
            
            if (!certification) {
              return null;
            }
            
            return {
              certification,
              status: certData.status as CertificationStatus,
              earnedAt: certData.earnedAt
            };
          } catch (error) {
            console.error(`Erreur lors de la récupération des détails de la certification ${certificationId}:`, error);
            return null;
          }
        })
      );
      
      // Filtrer les éléments null et retourner un tableau typé correctement
      return certifications
        .filter((cert): cert is { 
          certification: Certification; 
          status: CertificationStatus; 
          earnedAt: string | undefined;
        } => cert !== null);
    } catch (error) {
      console.error(`Erreur lors de la récupération des certifications de l'utilisateur ${userId}:`, error);
      // Retourner un tableau vide en cas d'erreur pour ne pas bloquer l'interface
      return [];
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération des certifications de l'utilisateur ${userId}:`, error);
    // Ici aussi, retourner un tableau vide en cas d'erreur pour ne pas bloquer l'interface
    return [];
  }
};

// Fonction pour obtenir une certification par son ID
export const getCertificationById = async (certificationId: string): Promise<Certification | null> => {
  try {
    const certificationRef = ref(database, `certifications/${certificationId}`);
    const snapshot = await get(certificationRef);
    
    if (snapshot.exists()) {
      const certificationData = snapshot.val();
      return {
        id: certificationId,
        ...certificationData
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la certification ${certificationId}:`, error);
    throw error;
  }
};

// Récupérer une certification par ID
export const getCertification = async (certificationId: string): Promise<Certification> => {
  try {
    const certificationRef = ref(database, `certifications/${certificationId}`);
    const snapshot = await get(certificationRef);
    
    if (!snapshot.exists()) {
      throw new Error(`La certification avec l'ID ${certificationId} n'existe pas.`);
    }
    
    const certificationData = snapshot.val();
    return {
      id: certificationId,
      ...certificationData,
      requirements: certificationData.requirements || []
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération de la certification ${certificationId}:`, error);
    throw error;
  }
}; 