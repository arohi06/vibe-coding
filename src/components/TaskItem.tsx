import { useState } from 'react';
import { Check, Trash2, Edit2 } from 'lucide-react';
import { Task } from '@/types/tracker';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdateText: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

export const TaskItem = ({ task, onToggle, onUpdateText, onDelete }: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const handleSave = () => {
    onUpdateText(task.id, editText);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditText(task.text);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
        "hover:bg-secondary/60",
        task.completed && "opacity-70"
      )}
    >
      <button
        onClick={() => onToggle(task.id)}
        className={cn(
          "w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0",
          task.completed
            ? "bg-success border-success text-success-foreground animate-check-bounce"
            : "border-border hover:border-primary/50"
        )}
      >
        {task.completed && <Check className="w-4 h-4" strokeWidth={3} />}
      </button>

      <span className="text-xl flex-shrink-0">{task.icon}</span>

      {isEditing ? (
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-secondary/50 rounded-lg px-3 py-1.5 text-foreground outline-none ring-2 ring-primary/30"
          autoFocus
        />
      ) : (
        <span
          className={cn(
            "flex-1 transition-all duration-200",
            task.completed && "line-through text-muted-foreground"
          )}
        >
          {task.text}
        </span>
      )}

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsEditing(true)}
          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
