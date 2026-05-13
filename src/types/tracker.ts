export interface Task {
  id: string;
  text: string;
  completed: boolean;
  category: 'core' | 'optional';
  icon?: string;
}

export type MoodLevel = 'low' | 'normal' | 'high' | null;

export interface ReflectionEntry {
  id: string;
  label: string;
  text: string;
}

export interface DayData {
  date: string;
  tasks: Task[];
  mood: MoodLevel;
  reflections: ReflectionEntry[];
  dailyQuote?: string;
}

export interface WeeklyTarget {
  id: string;
  text: string;
  completed: boolean;
  type: 'hackathon' | 'meeting' | 'goal' | 'task';
  weekDate: string; // ISO week string
}

export interface IdeaNote {
  id: string;
  text: string;
  type: 'script' | 'story' | 'lesson' | 'thought' | 'idea';
  createdAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface FocusZone {
  id: string;
  name: string;
  icon: string;
  color: string;
  items: string[];
}

export interface WeeklyArchive {
  weekDate: string;
  targets: WeeklyTarget[];
  selectedFocusZone: string | null;
  archivedAt: string;
}
