import { useState, useEffect } from 'react';
import { Check, Plus, Trash2, X, Target, Lightbulb, Zap, Archive, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WeeklyTarget, IdeaNote, FocusZone, WeeklyArchive } from '@/types/tracker';
import { format, startOfWeek, isSunday, addDays } from 'date-fns';
import { toast } from 'sonner';

const targetTypeEmoji: Record<string, string> = {
  hackathon: '🚀',
  meeting: '📅',
  goal: '🎯',
  task: '✨',
};

const ideaTypeEmoji: Record<string, string> = {
  script: '🎬',
  story: '📖',
  lesson: '📚',
  thought: '💭',
  idea: '💡',
};

const defaultFocusZones: FocusZone[] = [
  { 
    id: 'deep', 
    name: 'Deep Work', 
    icon: '🧠', 
    color: 'from-purple-500/20 to-indigo-500/20 border-purple-400/30',
    items: ['Core Tech sessions', 'Learning new skills', 'Complex problem solving']
  },
  { 
    id: 'creative', 
    name: 'Creative Flow', 
    icon: '🎨', 
    color: 'from-pink-500/20 to-rose-500/20 border-pink-400/30',
    items: ['Video editing', 'Writing', 'Music/singing']
  },
  { 
    id: 'growth', 
    name: 'Growth Time', 
    icon: '🌱', 
    color: 'from-green-500/20 to-emerald-500/20 border-green-400/30',
    items: ['English practice', 'Reading', 'Reflection']
  },
  { 
    id: 'explore', 
    name: 'Exploration', 
    icon: '🌍', 
    color: 'from-amber-500/20 to-orange-500/20 border-amber-400/30',
    items: ['Adventures', 'New experiences', 'Rest & recharge']
  },
];

export const WeeklyView = () => {
  const currentWeek = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEndDate = format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 6), 'MMM d');
  const weekStartLabel = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM d');

  const [targets, setTargets] = useState<WeeklyTarget[]>(() => {
    const saved = localStorage.getItem('weekly-targets');
    return saved ? JSON.parse(saved) : [];
  });

  const [ideas, setIdeas] = useState<IdeaNote[]>(() => {
    const saved = localStorage.getItem('idea-dump');
    return saved ? JSON.parse(saved) : [];
  });

  const [focusZones] = useState<FocusZone[]>(() => {
    const saved = localStorage.getItem('focus-zones');
    return saved ? JSON.parse(saved) : defaultFocusZones;
  });

  const [selectedFocusZone, setSelectedFocusZone] = useState<string | null>(() => {
    const saved = localStorage.getItem('selected-focus-zone');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Check if it's from the current week
      if (parsed.weekDate === currentWeek) {
        return parsed.zoneId;
      }
    }
    return null;
  });

  const [weeklyArchives, setWeeklyArchives] = useState<WeeklyArchive[]>(() => {
    const saved = localStorage.getItem('weekly-archives');
    return saved ? JSON.parse(saved) : [];
  });

  const [showArchive, setShowArchive] = useState(false);
  const [newTargetText, setNewTargetText] = useState('');
  const [newTargetType, setNewTargetType] = useState<WeeklyTarget['type']>('goal');
  const [newIdeaText, setNewIdeaText] = useState('');
  const [newIdeaType, setNewIdeaType] = useState<IdeaNote['type']>('idea');

  // Check for week reset on Sunday
  useEffect(() => {
    const checkWeekReset = () => {
      const lastResetWeek = localStorage.getItem('last-reset-week');
      if (lastResetWeek !== currentWeek && targets.length > 0) {
        // Archive the current week's data
        const archive: WeeklyArchive = {
          weekDate: lastResetWeek || currentWeek,
          targets: [...targets],
          selectedFocusZone,
          archivedAt: new Date().toISOString(),
        };
        
        const updatedArchives = [archive, ...weeklyArchives].slice(0, 12); // Keep last 12 weeks
        setWeeklyArchives(updatedArchives);
        localStorage.setItem('weekly-archives', JSON.stringify(updatedArchives));
        
        // Reset for new week
        setTargets([]);
        setSelectedFocusZone(null);
        localStorage.setItem('weekly-targets', JSON.stringify([]));
        localStorage.removeItem('selected-focus-zone');
        localStorage.setItem('last-reset-week', currentWeek);
        
        toast.success('New week started! Previous week archived.', {
          description: `Completed: ${archive.targets.filter(t => t.completed).length}/${archive.targets.length} targets`
        });
      }
      localStorage.setItem('last-reset-week', currentWeek);
    };
    
    checkWeekReset();
  }, [currentWeek]);

  const saveTargets = (updated: WeeklyTarget[]) => {
    localStorage.setItem('weekly-targets', JSON.stringify(updated));
    setTargets(updated);
  };

  const saveIdeas = (updated: IdeaNote[]) => {
    localStorage.setItem('idea-dump', JSON.stringify(updated));
    setIdeas(updated);
  };

  const selectFocusZone = (zoneId: string) => {
    setSelectedFocusZone(zoneId);
    localStorage.setItem('selected-focus-zone', JSON.stringify({ zoneId, weekDate: currentWeek }));
    toast.success('Focus zone selected!', { description: `This week: ${focusZones.find(z => z.id === zoneId)?.name}` });
  };

  const addTarget = () => {
    if (!newTargetText.trim()) return;
    const newTarget: WeeklyTarget = {
      id: `target-${Date.now()}`,
      text: newTargetText.trim(),
      completed: false,
      type: newTargetType,
      weekDate: currentWeek,
    };
    saveTargets([...targets, newTarget]);
    setNewTargetText('');
    toast.success('Target added!');
  };

  const toggleTarget = (id: string) => {
    const target = targets.find(t => t.id === id);
    saveTargets(targets.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    if (target && !target.completed) {
      toast.success('🎯 Target completed!');
    }
  };

  const deleteTarget = (id: string) => {
    saveTargets(targets.filter(t => t.id !== id));
    toast('Target removed');
  };

  const addIdea = () => {
    if (!newIdeaText.trim()) return;
    const newIdea: IdeaNote = {
      id: `idea-${Date.now()}`,
      text: newIdeaText.trim(),
      type: newIdeaType,
      createdAt: new Date().toISOString(),
    };
    saveIdeas([newIdea, ...ideas]);
    setNewIdeaText('');
    toast.success('Idea captured!');
  };

  const deleteIdea = (id: string) => {
    saveIdeas(ideas.filter(i => i.id !== id));
  };

  const completedTargets = targets.filter(t => t.completed).length;
  const totalTargets = targets.length;
  const selectedZone = focusZones.find(z => z.id === selectedFocusZone);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Week Header */}
      <div className="text-center py-2">
        <p className="text-xs text-muted-foreground">Week of {weekStartLabel} - {weekEndDate}</p>
      </div>

      {/* Focus Zone Selection */}
      <div className="card-elevated p-4 md:p-5">
        <h3 className="text-base md:text-lg font-serif font-semibold mb-3 flex items-center gap-2">
          <span className="text-xl">🎯</span>
          This Week's Focus
        </h3>
        
        {selectedZone ? (
          <div className={cn(
            "p-4 rounded-xl bg-gradient-to-br border-2 transition-all",
            selectedZone.color
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedZone.icon}</span>
                <div>
                  <h4 className="font-semibold">{selectedZone.name}</h4>
                  <p className="text-xs text-muted-foreground">Your focus this week</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedFocusZone(null);
                  localStorage.removeItem('selected-focus-zone');
                }}
                className="text-xs"
              >
                Change
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedZone.items.map((item, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-background/50">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            {focusZones.map((zone) => (
              <button
                key={zone.id}
                onClick={() => selectFocusZone(zone.id)}
                className={cn(
                  "p-3 md:p-4 rounded-xl bg-gradient-to-br border-2 transition-all hover:scale-[1.02] active:scale-[0.98] text-left",
                  zone.color
                )}
              >
                <span className="text-2xl md:text-3xl">{zone.icon}</span>
                <h4 className="font-medium text-sm md:text-base mt-2">{zone.name}</h4>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1 line-clamp-1">
                  {zone.items[0]}...
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Targets Section */}
      <div className="card-elevated p-4 md:p-5 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base md:text-lg font-serif font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            Weekly Targets
          </h3>
          {totalTargets > 0 && (
            <span className="text-xs md:text-sm text-muted-foreground">
              {completedTargets}/{totalTargets}
            </span>
          )}
        </div>
        
        {/* Progress bar */}
        {totalTargets > 0 && (
          <div className="w-full h-2 bg-muted rounded-full mb-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500"
              style={{ width: `${(completedTargets / totalTargets) * 100}%` }}
            />
          </div>
        )}
        
        {/* Add new target - Mobile optimized */}
        <div className="space-y-2 mb-4">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {(['goal', 'hackathon', 'meeting', 'task'] as WeeklyTarget['type'][]).map(type => (
              <button
                key={type}
                onClick={() => setNewTargetType(type)}
                className={cn(
                  "flex-shrink-0 w-10 h-10 md:w-9 md:h-9 rounded-xl text-lg transition-all",
                  newTargetType === type ? "bg-primary/20 scale-110 shadow-md" : "hover:bg-muted"
                )}
              >
                {targetTypeEmoji[type]}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTargetText}
              onChange={(e) => setNewTargetText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTarget()}
              placeholder="Add target..."
              className="flex-1 h-11 md:h-10"
            />
            <Button onClick={addTarget} size="icon" className="h-11 w-11 md:h-10 md:w-10 shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Targets list */}
        <div className="space-y-2">
          {targets.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Set your weekly targets 🎯
            </p>
          ) : (
            targets.map(target => (
              <div
                key={target.id}
                className={cn(
                  "flex items-center gap-2 md:gap-3 p-3 rounded-xl bg-background/50 group transition-all active:scale-[0.98]",
                  target.completed && "opacity-60"
                )}
              >
                <button
                  onClick={() => toggleTarget(target.id)}
                  className={cn(
                    "w-7 h-7 md:w-6 md:h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0",
                    target.completed
                      ? "bg-success border-success text-success-foreground"
                      : "border-border hover:border-primary/50 hover:bg-primary/5"
                  )}
                >
                  {target.completed && <Check className="w-4 h-4 md:w-3.5 md:h-3.5" strokeWidth={3} />}
                </button>
                <span className="text-lg md:text-xl">{targetTypeEmoji[target.type]}</span>
                <span className={cn(
                  "text-sm flex-1",
                  target.completed && "line-through text-muted-foreground"
                )}>
                  {target.text}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 md:h-7 md:w-7 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  onClick={() => deleteTarget(target.id)}
                >
                  <Trash2 className="w-4 h-4 md:w-3.5 md:h-3.5 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Past Weeks Archive */}
      {weeklyArchives.length > 0 && (
        <div className="card-elevated p-4 md:p-5">
          <button
            onClick={() => setShowArchive(!showArchive)}
            className="w-full flex items-center justify-between"
          >
            <h3 className="text-base md:text-lg font-serif font-semibold flex items-center gap-2">
              <Archive className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
              Past Weeks
            </h3>
            {showArchive ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showArchive && (
            <div className="mt-4 space-y-3">
              {weeklyArchives.slice(0, 4).map((archive, idx) => {
                const completed = archive.targets.filter(t => t.completed).length;
                const total = archive.targets.length;
                const zone = focusZones.find(z => z.id === archive.selectedFocusZone);
                
                return (
                  <div key={idx} className="p-3 rounded-xl bg-muted/30 border border-border/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">
                        Week of {format(new Date(archive.weekDate), 'MMM d')}
                      </span>
                      {zone && <span className="text-sm">{zone.icon} {zone.name}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-success/60"
                          style={{ width: total > 0 ? `${(completed / total) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="text-xs font-medium">
                        {completed}/{total}
                      </span>
                    </div>
                    {archive.targets.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {archive.targets.slice(0, 3).map((t, i) => (
                          <span 
                            key={i}
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full",
                              t.completed ? "bg-success/20 text-success" : "bg-muted"
                            )}
                          >
                            {targetTypeEmoji[t.type]} {t.text.slice(0, 15)}...
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Idea Dump Section */}
      <div className="card-elevated p-4 md:p-5">
        <h3 className="text-base md:text-lg font-serif font-semibold mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
          Brain Dump
          <span className="text-xs text-muted-foreground font-normal ml-auto hidden md:inline">
            Capture everything
          </span>
        </h3>
        
        {/* Add new idea - Mobile optimized */}
        <div className="space-y-2 mb-4">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {(['idea', 'script', 'story', 'lesson', 'thought'] as IdeaNote['type'][]).map(type => (
              <button
                key={type}
                onClick={() => setNewIdeaType(type)}
                className={cn(
                  "flex-shrink-0 w-10 h-10 md:w-9 md:h-9 rounded-xl text-lg transition-all",
                  newIdeaType === type ? "bg-amber-500/20 scale-110 shadow-md" : "hover:bg-muted"
                )}
              >
                {ideaTypeEmoji[type]}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newIdeaText}
              onChange={(e) => setNewIdeaText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addIdea()}
              placeholder="Dump your thoughts..."
              className="flex-1 h-11 md:h-10"
            />
            <Button onClick={addIdea} size="icon" variant="secondary" className="h-11 w-11 md:h-10 md:w-10 shrink-0">
              <Zap className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Ideas list */}
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {ideas.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Your brain dump is empty. Capture that spark! 💡
            </p>
          ) : (
            ideas.map(idea => (
              <div
                key={idea.id}
                className="flex items-start gap-2 md:gap-3 p-3 rounded-xl bg-muted/30 group hover:bg-muted/50 transition-all"
              >
                <span className="text-xl mt-0.5">{ideaTypeEmoji[idea.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{idea.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(idea.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 md:h-7 md:w-7 opacity-100 md:opacity-0 md:group-hover:opacity-100 shrink-0"
                  onClick={() => deleteIdea(idea.id)}
                >
                  <Trash2 className="w-4 h-4 md:w-3.5 md:h-3.5 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
