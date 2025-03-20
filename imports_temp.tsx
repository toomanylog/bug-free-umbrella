import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  Check, 
  Plus, 
  Award, 
  FileText,
  User
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
import { getAllFormations } from '../../firebase/formations';

import { 
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  Certification,
  CertificationRequirement,
  RequirementType,
  ExamQuestion,
  QuestionType
} from '../../firebase/certifications';

import { Formation, getAllUsers, UserData, UserRole } from '../../firebase/auth';
 