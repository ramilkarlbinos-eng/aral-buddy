import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DTRSection } from './components/DTRSection';
import { AttendanceSection } from './components/AttendanceSection';
import { TuteesSection } from './components/TuteesSection';
import { SessionsSection } from './components/SessionsSection';
import { GeminiChatSection } from './components/GeminiChatSection';
import { ReportsSection } from './components/ReportsSection';
import { SettingsSection } from './components/SettingsSection';
import { ManualDTRModal } from './components/ManualDTRModal';
import { PunchOutModal } from './components/PunchOutModal';
import { SingleFileExportModal } from './components/SingleFileExportModal';
import { WeeklySummaryModal } from './components/WeeklySummaryModal';
import { ParentSMSModal } from './components/ParentSMSModal';
import { generateSingleFileHTML } from './utils/singleFileGenerator';
import { 
  DTRRecord, 
  ActivePunch, 
  Tutee, 
  SessionRecord, 
  AttendanceRecord,
  AttendanceStatus,
  TutorSettings, 
  TabType 
} from './types';

const STORAGE_KEYS = {
  DTR: 'aral_buddy_dtr_v2',
  ACTIVE_PUNCH: 'aral_buddy_active_punch_v2',
  TUTEES: 'aral_buddy_tutees_v2',
  SESSIONS: 'aral_buddy_sessions_v2',
  ATTENDANCE: 'aral_buddy_attendance_v2',
  SETTINGS: 'aral_buddy_settings_v2',
};

const DEFAULT_SETTINGS: TutorSettings = {
  tutorName: 'Maria Theresa Santos, LPT',
  schoolName: 'Mabini Elementary School',
  districtDivision: 'SDO Manila / District III',
  role: 'Teacher Tutor',
  coordinatorName: 'Dr. Roberto Perez, Principal IV',
};

// Seed learners demonstrating Grade 1 through Grade 10 coverage with baseline vs current trajectories
const DEFAULT_TUTEES: Tutee[] = [
  {
    id: 'tut_seed_1',
    name: 'Princess Nicole Reyes',
    lrn: '109876543210',
    grade: 'Grade 1',
    subject: 'Reading (English)',
    status: 'Mastered / At Grade Level',
    notes: 'Practicing alphabet letter sounds, short vowels, and consonant blending.',
    guardianContact: 'Nanay Gina (0918-123-4567)',
    baselineLevel: 'Frustration (Letter Sounds)',
    midLevel: 'Instructional (CVC Blending)',
    currentLevel: 'Independent (CVC & Sight Words)',
  },
  {
    id: 'tut_seed_2',
    name: 'Ethan Kyle Bautista',
    lrn: '109876543211',
    grade: 'Grade 3',
    subject: 'Numeracy / Math',
    status: 'Moderate Intervention',
    notes: 'Needs foundation on 2-digit addition and place value regrouping.',
    guardianContact: 'Tatay Ronald (0920-987-6543)',
    baselineLevel: 'Critical Gap (Single-digit only)',
    midLevel: 'Progressing (2-digit without regrouping)',
    currentLevel: 'Instructional (Base-10 Blocks Regrouping)',
  },
  {
    id: 'tut_seed_3',
    name: 'John Carlo Mendoza',
    lrn: '109876543212',
    grade: 'Grade 4',
    subject: 'Reading (Filipino)',
    status: 'Mastered / At Grade Level',
    notes: 'Advancing in decoding basic pantig (Ba-Be-Bi-Bo-Bu) and simple story comprehension.',
    guardianContact: 'Nanay Jocelyn (0917-555-8901)',
    baselineLevel: 'Frustration (Hirap sa Pantig)',
    midLevel: 'Instructional (Pagpapantig KP/PK)',
    currentLevel: 'Independent (Pangungusap at Kuwento)',
  },
  {
    id: 'tut_seed_4',
    name: 'Angela Mae Delos Santos',
    lrn: '109876543213',
    grade: 'Grade 7',
    subject: 'Numeracy / Math',
    status: 'Full Refresher (Emerging)',
    notes: 'Junior High School catch-up: integers and fraction arithmetic.',
    guardianContact: 'Nanay Marites (0919-444-2211)',
    baselineLevel: 'Critical Gap (Integers & Fractions)',
    midLevel: 'Critical Gap (Integers & Fractions)',
    currentLevel: 'Critical Gap (Needs Number Line Strategy)',
  },
  {
    id: 'tut_seed_5',
    name: 'Mark Joshua Alcantara',
    lrn: '109876543214',
    grade: 'Grade 10',
    subject: 'Science',
    status: 'Transitioning to Grade Level',
    notes: 'Basic scientific method and biological organ systems review.',
    guardianContact: 'Tatay Noel (0921-777-6655)',
    baselineLevel: 'Emerging (Scientific Variables)',
    midLevel: 'Progressing (Hypothesis Testing)',
    currentLevel: 'Grade Ready (Experimental Design)',
  },
];

const DEFAULT_DTR: DTRRecord[] = [
  {
    id: 'dtr_seed_1',
    date: new Date().toISOString().split('T')[0],
    timeIn: '08:00 AM',
    timeOut: '10:00 AM',
    totalMinutes: 120,
    hours: 2.0,
    activity: 'Key Stage 1 Remedial Reading: Phonics Blending',
    notes: 'Princess Nicole and John Carlo present. Practiced consonant digraphs.',
    tuteeNames: 'Princess Nicole Reyes, John Carlo Mendoza',
    presentTuteeIds: ['tut_seed_1', 'tut_seed_3'],
  },
  {
    id: 'dtr_seed_2',
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.toISOString().split('T')[0];
    })(),
    timeIn: '01:30 PM',
    timeOut: '03:45 PM',
    totalMinutes: 135,
    hours: 2.25,
    activity: 'Numeracy Intervention: Addition with Regrouping',
    notes: 'Ethan Kyle and Angela completed drills with place value blocks.',
    tuteeNames: 'Ethan Kyle Bautista, Angela Mae Delos Santos',
    presentTuteeIds: ['tut_seed_2', 'tut_seed_4'],
  },
];

const getRelativeDateStr = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const DEFAULT_SESSIONS: SessionRecord[] = [
  {
    id: 'sess_seed_1',
    date: getRelativeDateStr(0),
    tuteeId: 'tut_seed_1',
    durationMinutes: 60,
    topic: 'CVC Words and Consonant Blends (bl, cl, fl)',
    notes: 'Learner decoded 14/15 flashcards correctly on the 2nd trial.',
  },
  {
    id: 'sess_seed_2',
    date: getRelativeDateStr(1),
    tuteeId: 'tut_seed_2',
    durationMinutes: 60,
    topic: 'Multi-digit Addition & Subtraction with Regrouping',
    notes: 'Used base-ten blocks to model borrowing across place values.',
  },
  {
    id: 'sess_seed_3',
    date: getRelativeDateStr(5),
    tuteeId: 'tut_seed_3',
    durationMinutes: 45,
    topic: 'Sight Word Speed Drills & Dolch High-Frequency Vocabulary',
    notes: 'Mastered 20 primer sight words; practiced reading short decodable phrases.',
  },
  {
    id: 'sess_seed_4',
    date: getRelativeDateStr(7),
    tuteeId: 'tut_seed_4',
    durationMinutes: 75,
    topic: 'Fraction Operations: Addition of Unlike Fractions',
    notes: 'Found least common denominators; completed 8 word problems.',
  },
  {
    id: 'sess_seed_5',
    date: getRelativeDateStr(9),
    tuteeId: 'tut_seed_1',
    durationMinutes: 60,
    topic: 'Silent E Rule (CVCe pattern) & Long Vowel Sounds',
    notes: 'Read short decodable story with 90% accuracy.',
  },
  {
    id: 'sess_seed_6',
    date: getRelativeDateStr(14),
    tuteeId: 'tut_seed_5',
    durationMinutes: 60,
    topic: 'Scientific Method: Formulating Testable Hypotheses',
    notes: 'Identified independent and dependent variables in sample experiments.',
  },
  {
    id: 'sess_seed_7',
    date: getRelativeDateStr(16),
    tuteeId: 'tut_seed_2',
    durationMinutes: 60,
    topic: 'Multiplication Tables (6, 7, 8) Rapid Recall',
    notes: 'Achieved 85% fluency in 3-minute timed recall chart.',
  },
  {
    id: 'sess_seed_8',
    date: getRelativeDateStr(21),
    tuteeId: 'tut_seed_3',
    durationMinutes: 45,
    topic: 'Reading Comprehension: Story Sequencing & Main Idea',
    notes: 'Arranged picture cards in chronological sequence from the fable read.',
  },
  {
    id: 'sess_seed_9',
    date: getRelativeDateStr(23),
    tuteeId: 'tut_seed_4',
    durationMinutes: 60,
    topic: 'Integer Addition & Number Line Visualization',
    notes: 'Solved positive and negative integer addition using chips and number line.',
  },
  {
    id: 'sess_seed_10',
    date: getRelativeDateStr(28),
    tuteeId: 'tut_seed_1',
    durationMinutes: 60,
    topic: 'Phonemic Awareness: Rhyming & Onset-Rime',
    notes: 'Completed oral rhyming drills with 100% participation.',
  },
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dtr');

  // Core Data States
  const [dtrRecords, setDtrRecords] = useState<DTRRecord[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DTR);
      return raw ? JSON.parse(raw) : DEFAULT_DTR;
    } catch {
      return DEFAULT_DTR;
    }
  });

  const [activePunch, setActivePunch] = useState<ActivePunch | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_PUNCH);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [tutees, setTutees] = useState<Tutee[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TUTEES);
      return raw ? JSON.parse(raw) : DEFAULT_TUTEES;
    } catch {
      return DEFAULT_TUTEES;
    }
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      if (raw) return JSON.parse(raw);
    } catch {}
    const today = new Date().toISOString().split('T')[0];
    return [
      { id: 'att_1', date: today, tuteeId: 'tut_seed_1', status: 'Present', remarks: 'On time, active' },
      { id: 'att_2', date: today, tuteeId: 'tut_seed_2', status: 'Present', remarks: 'Good focus' },
      { id: 'att_3', date: today, tuteeId: 'tut_seed_3', status: 'Late', remarks: 'Arrived 10 mins late' },
      { id: 'att_4', date: today, tuteeId: 'tut_seed_4', status: 'Present', remarks: 'Completed drill' },
      { id: 'att_5', date: today, tuteeId: 'tut_seed_5', status: 'Excused', remarks: 'School varsity practice' },
    ];
  });

  const [sessions, setSessions] = useState<SessionRecord[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return raw ? JSON.parse(raw) : DEFAULT_SESSIONS;
    } catch {
      return DEFAULT_SESSIONS;
    }
  });

  const [settings, setSettings] = useState<TutorSettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Clocks and Live Timers
  const [liveTime, setLiveTime] = useState('');
  const [liveDate, setLiveDate] = useState('');
  const [punchTimerText, setPunchTimerText] = useState('00:00:00');

  // Modals
  const [isManualDTRModalOpen, setIsManualDTRModalOpen] = useState(false);
  const [editingDTRRecord, setEditingDTRRecord] = useState<DTRRecord | null>(null);
  const [isPunchOutModalOpen, setIsPunchOutModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isWeeklySummaryModalOpen, setIsWeeklySummaryModalOpen] = useState(false);
  const [smsModalTutee, setSmsModalTutee] = useState<Tutee | null>(null);
  const [smsModalSession, setSmsModalSession] = useState<SessionRecord | null>(null);
  const [isParentSMSModalOpen, setIsParentSMSModalOpen] = useState(false);

  // Synchronize state changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DTR, JSON.stringify(dtrRecords));
  }, [dtrRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PUNCH, JSON.stringify(activePunch));
  }, [activePunch]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TUTEES, JSON.stringify(tutees));
  }, [tutees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Master clock & punch stopwatch timer loop
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setLiveDate(
        now.toLocaleDateString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );

      // Compute elapsed running timer if active punch exists
      if (activePunch && activePunch.timeInISO) {
        const startMs = new Date(activePunch.timeInISO).getTime();
        const diffSecs = Math.max(0, Math.floor((now.getTime() - startMs) / 1000));
        const hrs = String(Math.floor(diffSecs / 3600)).padStart(2, '0');
        const mins = String(Math.floor((diffSecs % 3600) / 60)).padStart(2, '0');
        const secs = String(diffSecs % 60).padStart(2, '0');
        setPunchTimerText(`${hrs}:${mins}:${secs}`);
      } else {
        setPunchTimerText('00:00:00');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [activePunch]);

  // Punch In Handler
  const handlePunchIn = () => {
    if (activePunch) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    setActivePunch({
      timeInISO: now.toISOString(),
      dateStr: `${yyyy}-${mm}-${dd}`,
      timeInStr: timeStr,
    });
  };

  // Adjust active punch start time while clocked in
  const handleAdjustActivePunch = (newTimeIn12: string) => {
    if (!activePunch) return;
    // Reconstruct ISO from active punch date + newTimeIn12
    const datePart = activePunch.dateStr;
    const match = newTimeIn12.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    let newISO = activePunch.timeInISO;
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const ampm = match[3] ? match[3].toUpperCase() : null;
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      const d = new Date(datePart);
      d.setHours(h, m, 0, 0);
      newISO = d.toISOString();
    }

    setActivePunch({
      ...activePunch,
      timeInISO: newISO,
      timeInStr: newTimeIn12,
    });
  };

  // Punch Out Confirmation with editable times & attendance checklist
  const handleConfirmPunchOut = ({
    date,
    timeIn,
    timeOut,
    totalMinutes,
    hours,
    activity,
    notes,
    presentTuteeIds,
    createSessionLogs,
  }: {
    date: string;
    timeIn: string;
    timeOut: string;
    totalMinutes: number;
    hours: number;
    activity: string;
    notes: string;
    presentTuteeIds: string[];
    createSessionLogs: boolean;
  }) => {
    if (!activePunch) return;

    // Resolve present tutee names
    const names = presentTuteeIds
      .map((id) => tutees.find((t) => t.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    const newRecord: DTRRecord = {
      id: 'dtr_' + Date.now(),
      date,
      timeIn,
      timeOut,
      totalMinutes,
      hours,
      activity,
      notes,
      tuteeNames: names || undefined,
      presentTuteeIds,
    };

    setDtrRecords((prev) => [newRecord, ...prev]);

    // Update Attendance Checklist records for this date
    setAttendanceRecords((prev) => {
      const dateRecords = prev.filter((r) => r.date !== date);
      const newAttendanceForDate: AttendanceRecord[] = tutees.map((t) => ({
        id: `att_${date}_${t.id}`,
        date,
        tuteeId: t.id,
        status: presentTuteeIds.includes(t.id) ? 'Present' : 'Absent',
      }));
      return [...dateRecords, ...newAttendanceForDate];
    });

    // Optionally create intervention session records for present tutees
    if (createSessionLogs && presentTuteeIds.length > 0) {
      const newSessions: SessionRecord[] = presentTuteeIds.map((tid) => ({
        id: 'sess_' + Date.now() + '_' + tid,
        date,
        tuteeId: tid,
        durationMinutes: totalMinutes,
        topic: activity,
        notes: notes || 'ARAL daily intervention session',
      }));
      setSessions((prev) => [...newSessions, ...prev]);
    }

    setActivePunch(null);
  };

  // Manual DTR Save Handler
  const handleSaveManualDTR = (recordData: Omit<DTRRecord, 'id'>, id?: string) => {
    if (id) {
      setDtrRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...recordData, id } : r))
      );
    } else {
      const newRecord: DTRRecord = {
        ...recordData,
        id: 'dtr_' + Date.now(),
      };
      setDtrRecords((prev) =>
        [newRecord, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    }
  };

  const handleDeleteDTR = (id: string) => {
    if (window.confirm('Delete this Daily Time Record entry?')) {
      setDtrRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Attendance Handlers
  const handleUpdateAttendance = (
    date: string,
    tuteeId: string,
    status: AttendanceStatus,
    remarks?: string
  ) => {
    setAttendanceRecords((prev) => {
      const existingIdx = prev.findIndex((r) => r.date === date && r.tuteeId === tuteeId);
      if (existingIdx !== -1) {
        const copy = [...prev];
        copy[existingIdx] = { ...copy[existingIdx], status, remarks };
        return copy;
      }
      return [
        ...prev,
        {
          id: `att_${Date.now()}_${tuteeId}`,
          date,
          tuteeId,
          status,
          remarks,
        },
      ];
    });
  };

  const handleBulkUpdateAttendance = (
    date: string,
    updates: { tuteeId: string; status: AttendanceStatus }[]
  ) => {
    setAttendanceRecords((prev) => {
      const map = new Map<string, AttendanceRecord>();
      prev.forEach((r) => {
        if (r.date === date) map.set(r.tuteeId, r);
      });

      const updatedDateRecords: AttendanceRecord[] = updates.map((u) => {
        const existing = map.get(u.tuteeId);
        return {
          id: existing?.id || `att_${Date.now()}_${u.tuteeId}`,
          date,
          tuteeId: u.tuteeId,
          status: u.status,
          remarks: existing?.remarks || '',
        };
      });

      const otherDates = prev.filter((r) => r.date !== date);
      return [...otherDates, ...updatedDateRecords];
    });
  };

  // Tutee Handlers
  const handleSaveTutee = (tuteeData: Omit<Tutee, 'id'>, id?: string) => {
    if (id) {
      setTutees((prev) => prev.map((t) => (t.id === id ? { ...tuteeData, id } : t)));
    } else {
      const newTutee: Tutee = {
        ...tuteeData,
        id: 'tut_' + Date.now(),
      };
      setTutees((prev) => [...prev, newTutee]);
    }
  };

  const handleDeleteTutee = (id: string) => {
    if (window.confirm('Are you sure you want to remove this learner profile?')) {
      setTutees((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // Session Handlers
  const handleSaveSession = (sessionData: Omit<SessionRecord, 'id'>) => {
    const newSession: SessionRecord = {
      ...sessionData,
      id: 'sess_' + Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
  };

  const handleDeleteSession = (id: string) => {
    if (window.confirm('Delete this session log?')) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleOpenParentSMS = (tutee: Tutee, session?: SessionRecord) => {
    setSmsModalTutee(tutee);
    setSmsModalSession(session || null);
    setIsParentSMSModalOpen(true);
  };

  const handleUpdateTuteeTrajectory = (
    tuteeId: string,
    baselineLevel: string,
    midLevel: string,
    currentLevel: string
  ) => {
    setTutees((prev) =>
      prev.map((t) => {
        if (t.id !== tuteeId) return t;
        return {
          ...t,
          baselineLevel,
          midLevel,
          currentLevel,
          status:
            currentLevel.toLowerCase().includes('independent') ||
            currentLevel.toLowerCase().includes('ready')
              ? 'Mastered / At Grade Level'
              : currentLevel.toLowerCase().includes('progressing') ||
                currentLevel.toLowerCase().includes('instructional')
              ? 'Transitioning to Grade Level'
              : t.status,
        };
      })
    );
  };

  const handleLogMicroSession = (tuteeId: string, topic: string, notes: string) => {
    const today = new Date().toISOString().split('T')[0];
    handleSaveSession({
      date: today,
      tuteeId,
      durationMinutes: 45,
      topic,
      notes,
    });
  };

  // Backup & Restore
  const handleExportJSON = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      app: 'ARAL Buddy',
      version: '2.1',
      settings,
      tutees,
      attendanceRecords,
      sessions,
      dtrRecords,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ARAL_Buddy_Backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (data.dtrRecords) setDtrRecords(data.dtrRecords);
        if (data.tutees) setTutees(data.tutees);
        if (data.attendanceRecords) setAttendanceRecords(data.attendanceRecords);
        if (data.sessions) setSessions(data.sessions);
        if (data.settings) setSettings(data.settings);
        alert('Data backup successfully restored!');
      } catch {
        alert('Invalid backup JSON format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (
      window.confirm(
        'WARNING: This will permanently reset all DTR records, attendance, tutees, and session logs on this browser. Continue?'
      )
    ) {
      localStorage.clear();
      setDtrRecords([]);
      setTutees([]);
      setAttendanceRecords([]);
      setSessions([]);
      setActivePunch(null);
      setSettings(DEFAULT_SETTINGS);
      alert('All local data cleared.');
    }
  };

  // Standalone single-file HTML generator string
  const singleFileHTML = generateSingleFileHTML(settings, dtrRecords, tutees, sessions);

  return (
    <div className="min-h-screen bg-[#f6f7f1] text-[#173b3a] pb-24 sm:pb-28">
      {/* Top App Header */}
      <Header
        liveTime={liveTime}
        liveDate={liveDate}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main Tabbed Views */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5">
        {currentTab === 'dtr' && (
          <DTRSection
            dtrRecords={dtrRecords}
            activePunch={activePunch}
            punchTimerText={punchTimerText}
            settings={settings}
            onPunchIn={handlePunchIn}
            onPunchOutClick={() => setIsPunchOutModalOpen(true)}
            onAdjustActivePunch={handleAdjustActivePunch}
            onOpenManualModal={(record) => {
              setEditingDTRRecord(record || null);
              setIsManualDTRModalOpen(true);
            }}
            onDeleteRecord={handleDeleteDTR}
          />
        )}

        {currentTab === 'attendance' && (
          <AttendanceSection
            tutees={tutees}
            attendanceRecords={attendanceRecords}
            onUpdateAttendance={handleUpdateAttendance}
            onBulkUpdateAttendance={handleBulkUpdateAttendance}
            onOpenParentSMS={handleOpenParentSMS}
            tutorName={settings.tutorName}
            schoolName={settings.schoolName}
          />
        )}

        {currentTab === 'tutees' && (
          <TuteesSection
            tutees={tutees}
            onSaveTutee={handleSaveTutee}
            onDeleteTutee={handleDeleteTutee}
            onOpenParentSMS={handleOpenParentSMS}
          />
        )}

        {currentTab === 'sessions' && (
          <SessionsSection
            sessions={sessions}
            tutees={tutees}
            onSaveSession={handleSaveSession}
            onDeleteSession={handleDeleteSession}
            onOpenWeeklySummary={() => setIsWeeklySummaryModalOpen(true)}
            onOpenParentSMS={handleOpenParentSMS}
          />
        )}

        {currentTab === 'ai-chat' && (
          <GeminiChatSection
            tutorName={settings.tutorName}
            schoolName={settings.schoolName}
            tutees={tutees}
            onLogMicroSession={handleLogMicroSession}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsSection
            dtrRecords={dtrRecords}
            tutees={tutees}
            sessions={sessions}
            onPrintDTR={() => {
              setCurrentTab('dtr');
              setTimeout(() => window.print(), 100);
            }}
            onUpdateTuteeTrajectory={handleUpdateTuteeTrajectory}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsSection
            settings={settings}
            onSaveSettings={setSettings}
            onExportJSON={handleExportJSON}
            onImportJSON={handleImportJSON}
            onClearData={handleClearData}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />
        )}
      </main>

      {/* Floating Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        activePunch={!!activePunch}
      />

      {/* Modals */}
      <ManualDTRModal
        isOpen={isManualDTRModalOpen}
        editingRecord={editingDTRRecord}
        tutees={tutees}
        onClose={() => {
          setIsManualDTRModalOpen(false);
          setEditingDTRRecord(null);
        }}
        onSave={handleSaveManualDTR}
      />

      <PunchOutModal
        isOpen={isPunchOutModalOpen}
        activePunch={activePunch}
        tutees={tutees}
        onClose={() => setIsPunchOutModalOpen(false)}
        onConfirm={handleConfirmPunchOut}
      />

      <SingleFileExportModal
        isOpen={isExportModalOpen}
        htmlCode={singleFileHTML}
        onClose={() => setIsExportModalOpen(false)}
      />

      <WeeklySummaryModal
        isOpen={isWeeklySummaryModalOpen}
        sessions={sessions}
        tutees={tutees}
        settings={settings}
        onClose={() => setIsWeeklySummaryModalOpen(false)}
      />

      <ParentSMSModal
        isOpen={isParentSMSModalOpen}
        tutee={smsModalTutee}
        todayAttendance={
          smsModalTutee
            ? attendanceRecords.find(
                (r) =>
                  r.tuteeId === smsModalTutee.id &&
                  r.date === new Date().toISOString().split('T')[0]
              )
            : null
        }
        latestSession={
          smsModalSession ||
          (smsModalTutee
            ? sessions.find((s) => s.tuteeId === smsModalTutee.id)
            : null)
        }
        tutorName={settings.tutorName}
        onClose={() => {
          setIsParentSMSModalOpen(false);
          setSmsModalTutee(null);
          setSmsModalSession(null);
        }}
      />
    </div>
  );
}
