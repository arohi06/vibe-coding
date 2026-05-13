import { useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ReflectionEntry } from '@/types/tracker';
import { cn } from '@/lib/utils';

interface ReflectionSectionProps {
  reflections: ReflectionEntry[];
  onAddReflection: (label: string, text: string) => void;
  onUpdateReflection: (id: string, text: string) => void;
  onUpdateReflectionLabel: (id: string, label: string) => void;
  onDeleteReflection: (id: string) => void;
}

const suggestedLabels = ['✨ Win', '📚 Lesson', '💡 Insight', '🎯 Goal', '💪 Progress', '🌱 Growth'];

export const ReflectionSection = ({
  reflections,
  onAddReflection,
  onUpdateReflection,
  onUpdateReflectionLabel,
  onDeleteReflection,
}: ReflectionSectionProps) => {
  const [newLabel, setNewLabel] = useState('');
  const [newText, setNewText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newText.trim()) {
      onAddReflection(newLabel || '📝 Note', newText.trim());
      setNewLabel('');
      setNewText('');
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing reflections */}
      {reflections.map((reflection) => (
        <div
          key={reflection.id}
          className="group relative p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border/30 transition-all hover:border-primary/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <Input
              value={reflection.label}
              onChange={(e) => onUpdateReflectionLabel(reflection.id, e.target.value)}
              className="h-7 w-auto min-w-[100px] max-w-[200px] text-xs font-medium bg-background/50 border-border/50"
              placeholder="Label..."
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onDeleteReflection(reflection.id)}
            >
              <Trash2 className="w-3 h-3 text-destructive" />
            </Button>
          </div>
          <Textarea
            value={reflection.text}
            onChange={(e) => onUpdateReflection(reflection.id, e.target.value)}
            placeholder="Write your thought..."
            className="bg-background/30 border-none resize-none min-h-[60px] focus:ring-primary/30 text-sm"
          />
        </div>
      ))}

      {/* Add new reflection */}
      {isAdding ? (
        <div className="p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5">
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestedLabels.map((label) => (
              <button
                key={label}
                onClick={() => setNewLabel(label)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-all",
                  newLabel === label
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <Input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Or type custom label..."
            className="mb-2 h-8 text-sm"
          />
          <Textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="What's on your mind?"
            className="bg-background/50 resize-none min-h-[80px] mb-3"
            autoFocus
          />
          <div className="flex gap-2">
            <Button onClick={handleAdd} size="sm" disabled={!newText.trim()}>
              Add Reflection
            </Button>
            <Button onClick={() => setIsAdding(false)} size="sm" variant="ghost">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setIsAdding(true)}
          className="w-full border-dashed hover:border-primary/50 hover:bg-primary/5"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Reflection
        </Button>
      )}

      {reflections.length === 0 && !isAdding && (
        <p className="text-center text-sm text-muted-foreground py-4">
          Capture your thoughts, wins, and learnings ✨
        </p>
      )}
    </div>
  );
};
