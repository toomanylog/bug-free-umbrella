import { ref, set, get, push, remove, update } from 'firebase/database';
import { database } from './config';

// Types
export interface Certification {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
  requirements: CertificationRequirement[];
  examQuestions?: ExamQuestion[];
  imageUrl?: string;
  published: boolean;
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
  correctAnswer: string | string[]; // Réponse unique ou multiple selon le type
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  MULTIPLE_ANSWER = 'multiple_answer',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
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
      ...certificationSnapshot.val()
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
              .filter(id => !completedFormations.includes(id));
            
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

// Fonction pour soumettre un examen
export const submitExam = async (
  userId: string, 
  certificationId: string, 
  answers: {questionId: string, answer: string | string[]}[]
): Promise<ExamResult> => {
  try {
    // Récupérer la certification pour obtenir les questions d'examen
    const certificationRef = ref(database, `certifications/${certificationId}`);
    const certificationSnapshot = await get(certificationRef);
    
    if (!certificationSnapshot.exists()) {
      throw new Error(`La certification ${certificationId} n'existe pas`);
    }
    
    const certification = {
      id: certificationId,
      ...certificationSnapshot.val()
    } as Certification;
    
    if (!certification.examQuestions || certification.examQuestions.length === 0) {
      throw new Error(`Cette certification n'a pas d'examen configuré`);
    }
    
    // Évaluer les réponses
    let correctAnswers = 0;
    const questionMap = new Map(certification.examQuestions.map(q => [q.id, q]));
    const evaluatedAnswers = answers.map(answer => {
      const question = questionMap.get(answer.questionId);
      let isCorrect = false;
      
      if (question) {
        // Gestion différente selon le type de question
        if (question.type === QuestionType.MULTIPLE_ANSWER) {
          // Pour les questions à choix multiples
          if (Array.isArray(question.correctAnswer) && Array.isArray(answer.answer)) {
            // Vérifier que toutes les bonnes réponses sont sélectionnées et qu'il n'y a pas de réponses en trop
            isCorrect = question.correctAnswer.length === answer.answer.length && 
                       question.correctAnswer.every(a => answer.answer.includes(a));
          }
        } else if (question.type === QuestionType.MULTIPLE_CHOICE || question.type === QuestionType.TRUE_FALSE) {
          // Pour les questions à choix unique ou vrai/faux
          isCorrect = question.correctAnswer === answer.answer;
        } else if (question.type === QuestionType.SHORT_ANSWER) {
          // Pour les questions à réponse courte, normaliser pour la comparaison
          const normalizedCorrect = Array.isArray(question.correctAnswer) 
            ? question.correctAnswer[0].toLowerCase().trim() 
            : question.correctAnswer.toLowerCase().trim();
          const normalizedAnswer = Array.isArray(answer.answer) 
            ? answer.answer[0].toLowerCase().trim() 
            : answer.answer.toLowerCase().trim();
          isCorrect = normalizedCorrect === normalizedAnswer;
        }
        
        if (isCorrect) {
          correctAnswers++;
        }
      }
      
      return {
        questionId: answer.questionId,
        userAnswer: answer.answer,
        isCorrect
      };
    });
    
    // Calculer le score
    const totalQuestions = certification.examQuestions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Déterminer le statut
    const result: ExamResult = {
      score,
      totalQuestions,
      correctAnswers,
      submittedAt: new Date().toISOString(),
      answers: evaluatedAnswers
    };
    
    // Mettre à jour la certification de l'utilisateur avec le résultat de l'examen
    const userCertificationRef = ref(database, `userCertifications/${userId}/${certificationId}`);
    
    // Déterminer le statut en fonction du score et des exigences
    let status = CertificationStatus.FAILED;
    
    // Trouver l'exigence d'examen s'il y en a une
    const examRequirement = certification.requirements.find(r => r.type === RequirementType.PASS_EXAM);
    const minScore = examRequirement?.minScore || 70; // Score par défaut de 70%
    
    if (score >= minScore) {
      // Vérifier les autres conditions
      const { eligible } = await checkCertificationEligibility(userId, certificationId);
      status = eligible ? CertificationStatus.COMPLETED : CertificationStatus.IN_PROGRESS;
      
      // Si éligible, définir les dates d'obtention et d'expiration
      if (eligible) {
        await awardCertification(userId, certificationId);
        return result;
      }
    }
    
    // Mettre à jour uniquement le résultat de l'examen et le statut
    await update(userCertificationRef, {
      status,
      examResults: result
    });
    
    return result;
  } catch (error) {
    console.error(`Erreur lors de la soumission de l'examen pour la certification ${certificationId}:`, error);
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