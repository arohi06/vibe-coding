import { MoodLevel } from '@/types/tracker';
import { cn } from '@/lib/utils';

interface MoodTrackerProps {
  mood: MoodLevel;
  onSetMood: (mood: MoodLevel) => void;
}

const moods: { level: MoodLevel; emoji: string; label: string; color: string }[] = [
  { level: 'low', emoji: '😔', label: 'Low', color: 'bg-mood-low' },
  { level: 'normal', emoji: '😊', label: 'Normal', color: 'bg-mood-normal' },
  { level: 'high', emoji: '🔥', label: 'High', color: 'bg-mood-high' },
];

export const MoodTracker = ({ mood, onSetMood }: MoodTrackerProps) => {
  return (
    <div className="flex items-center justify-center gap-6">
      {moods.map((m) => (
        <button
          key={m.level}
          onClick={() => onSetMood(m.level)}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300",
            "hover:scale-110",
            mood === m.level
              ? `${m.color} shadow-lg ring-2 ring-offset-2 ring-offset-card ring-current scale-110`
              : "bg-secondary/50 hover:bg-secondary"
          )}
        >
          <span className="text-4xl">{m.emoji}</span>
          <span className={cn(
            "text-sm font-medium",
            mood === m.level ? "text-foreground" : "text-muted-foreground"
          )}>
            {m.label}
          </span>
        </button>
      ))}
    </div>
  );
};
