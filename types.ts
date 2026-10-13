export type GradeLevel =
  | 'Grade 1'
  | 'Grade 2'
  | 'Grade 3'
  | 'Grade 4'
  | 'Grade 5'
  | 'Grade 6'
  | 'Grade 7'
  | 'Grade 8'
  | 'Grade 9'
  | 'Grade 10';

export interface DTRRecord {
  id: string;
  date: string; // YYYY-MM-DD
  timeIn: string; // e.g. "08:00 AM"
  timeOut: string; // e.g. "10:30 AM"
  totalMinutes: number;
  hours: number;
  activity: string;
  notes?: string;
  tuteeNames?: string;
  presentTuteeIds?: string[];
}

export interface ActivePunch {
  timeInISO: string;
  dateStr: string;
  timeInStr: string;
}

export interface TrajectoryPoint {
  stage: string;
  date: string;
  label?: string;
  note?: string;
}

export interface Tutee {
  id: string;
  name: string;
  lrn?: string; // Learner Reference Number (optional DepEd 12-digit ID)
  grade: GradeLevel;
  subject: string;
  status: 'Full Refresher (Emerging)' | 'Moderate Intervention' | 'Transitioning to Grade Level' | 'Mastered / At Grade Level';
  notes: string;
  guardianContact?: string;
  baselineLevel?: string; // e.g. "Frustration (Grade 1)" or "Critical Gap"
  midLevel?: string; // e.g. "Instructional" or "Progressing"
  currentLevel?: string; // e.g. "Independent" or "Grade Ready"
  trajectoryHistory?: TrajectoryPoint[];
  masteredSkills?: string[];
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  tuteeId: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface SessionRecord {
  id: string;
  date: string;
  tuteeId: string;
  durationMinutes: number;
  topic: string;
  notes: string;
  competencyCode?: string;
}

export interface TutorSettings {
  tutorName: string;
  schoolName: string;
  districtDivision: string;
  role: string;
  coordinatorName: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export type TabType = 'dtr' | 'attendance' | 'tutees' | 'sessions' | 'ai-chat' | 'reports' | 'settings';
