import { useState, useEffect } from 'react';
import { Task, MoodLevel, DayData, ReflectionEntry } from '@/types/tracker';

const getToday = () => new Date().toISOString().split('T')[0];

// Daily quotes that rotate
const dailyQuotes = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Small daily improvements are the key to staggering long-term results.", author: "Robin Sharma" },
  { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is the sum of small efforts repeated daily.", author: "Robert Collier" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Every accomplishment starts with the decision to try.", author: "John F. Kennedy" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Your limitation—it's only your imagination.", author: "Unknown" },
];

const getDailyQuote = (date: string) => {
  const dayOfYear = Math.floor((new Date(date).getTime() - new Date(new Date(date).getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return dailyQuotes[dayOfYear % dailyQuotes.length];
};

const defaultTasks: Task[] = [
  { id: '1', text: 'Core Tech (minimum 30 min, ideal 2 hrs)', completed: false, category: 'core', icon: '💻' },
  { id: '2', text: 'English / Voice / Speaking (10–30 min)', completed: false, category: 'core', icon: '🗣️' },
  { id: '3', text: 'Reflection (5 min)', completed: false, category: 'core', icon: '🧘' },
  { id: '4', text: 'Video Editing (30–60 min)', completed: false, category: 'optional', icon: '🎬' },
  { id: '5', text: 'Creative (singing / dance / writing)', completed: false, category: 'optional', icon: '🎨' },
  { id: '6', text: 'Reading / thinking / idea capture', completed: false, category: 'optional', icon: '📚' },
];

const getDefaultDayData = (): DayData => ({
  date: getToday(),
  tasks: defaultTasks.map(t => ({ ...t, completed: false })),
  mood: null,
  reflections: [],
  dailyQuote: getDailyQuote(getToday()).text,
});

export const useTracker = () => {
  const [dayData, setDayData] = useState<DayData>(() => {
    const saved = localStorage.getItem(`tracker-${getToday()}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate old reflection format to new
      if (parsed.reflection && !parsed.reflections) {
        const reflections: ReflectionEntry[] = [];
        if (parsed.reflection.whatBuilt) {
          reflections.push({ id: 'built', label: 'What I built', text: parsed.reflection.whatBuilt });
        }
        if (parsed.reflection.improvement) {
          reflections.push({ id: 'improve', label: 'Improvement', text: parsed.reflection.improvement });
        }
        parsed.reflections = reflections;
        delete parsed.reflection;
      }
      if (!parsed.dailyQuote) {
        parsed.dailyQuote = getDailyQuote(parsed.date).text;
      }
      return parsed;
    }
    return getDefaultDayData();
  });

  const [allDays, setAllDays] = useState<Record<string, DayData>>(() => {
    const saved = localStorage.getItem('tracker-all-days');
    if (saved) {
      return JSON.parse(saved);
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem(`tracker-${dayData.date}`, JSON.stringify(dayData));
    setAllDays(prev => {
      const updated = { ...prev, [dayData.date]: dayData };
      localStorage.setItem('tracker-all-days', JSON.stringify(updated));
      return updated;
    });
  }, [dayData]);

  const toggleTask = (taskId: string) => {
    setDayData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ),
    }));
  };

  const updateTaskText = (taskId: string, text: string) => {
    setDayData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === taskId ? { ...t, text } : t
      ),
    }));
  };

  const setMood = (mood: MoodLevel) => {
    setDayData(prev => ({ ...prev, mood }));
  };

  const addReflection = (label: string, text: string) => {
    const newReflection: ReflectionEntry = {
      id: Date.now().toString(),
      label,
      text,
    };
    setDayData(prev => ({
      ...prev,
      reflections: [...prev.reflections, newReflection],
    }));
  };

  const updateReflection = (id: string, text: string) => {
    setDayData(prev => ({
      ...prev,
      reflections: prev.reflections.map(r =>
        r.id === id ? { ...r, text } : r
      ),
    }));
  };

  const updateReflectionLabel = (id: string, label: string) => {
    setDayData(prev => ({
      ...prev,
      reflections: prev.reflections.map(r =>
        r.id === id ? { ...r, label } : r
      ),
    }));
  };

  const deleteReflection = (id: string) => {
    setDayData(prev => ({
      ...prev,
      reflections: prev.reflections.filter(r => r.id !== id),
    }));
  };

  const addTask = (category: 'core' | 'optional') => {
    const newTask: Task = {
      id: Date.now().toString(),
      text: 'New task',
      completed: false,
      category,
      icon: category === 'core' ? '⭐' : '✨',
    };
    setDayData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
  };

  const deleteTask = (taskId: string) => {
    setDayData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId),
    }));
  };

  const resetDay = () => {
    setDayData(getDefaultDayData());
  };

  const coreTasks = dayData.tasks.filter(t => t.category === 'core');
  const optionalTasks = dayData.tasks.filter(t => t.category === 'optional');
  const completedCore = coreTasks.filter(t => t.completed).length;
  const totalCore = coreTasks.length;
  const isWinningDay = completedCore === totalCore && totalCore > 0;

  return {
    dayData,
    coreTasks,
    optionalTasks,
    completedCore,
    totalCore,
    isWinningDay,
    toggleTask,
    updateTaskText,
    setMood,
    addReflection,
    updateReflection,
    updateReflectionLabel,
    deleteReflection,
    addTask,
    deleteTask,
    resetDay,
    allDays,
    getDailyQuote,
  };
};
