import { useState, useEffect } from 'react';
import { format, subDays, parseISO, isToday, startOfWeek } from 'date-fns';
import { Trophy, Flame, Calendar as CalendarIcon, Target, Sparkles, Star, Zap, Gift, Rocket, Crown } from 'lucide-react';
import { DayData, MoodLevel, WeeklyTarget } from '@/types/tracker';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface HistoryViewProps {
  allDays: Record<string, DayData>;
}

const moodEmoji: Record<string, string> = {
  low: '😔',
  normal: '😊',
  high: '🔥',
};

const moodColors: Record<string, string> = {
  low: 'bg-amber-200/50 border-amber-300',
  normal: 'bg-emerald-200/50 border-emerald-300',
  high: 'bg-orange-200/50 border-orange-300',
};

const moodLabels: Record<string, string> = {
  low: 'Taking it easy',
  normal: 'Steady pace',
  high: 'On fire!',
};

const targetTypeEmoji: Record<string, string> = {
  hackathon: '🚀',
  meeting: '📅',
  goal: '🎯',
  task: '✨',
};

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
];

const getDailyQuote = (date: string) => {
  const dayOfYear = Math.floor((new Date(date).getTime() - new Date(new Date(date).getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return dailyQuotes[dayOfYear % dailyQuotes.length];
};

// Level system
const getLevelInfo = (xp: number) => {
  const levels = [
    { level: 1, name: 'Beginner', minXp: 0, maxXp: 50, icon: '🌱' },
    { level: 2, name: 'Apprentice', minXp: 50, maxXp: 150, icon: '🌿' },
    { level: 3, name: 'Explorer', minXp: 150, maxXp: 300, icon: '🧭' },
    { level: 4, name: 'Builder', minXp: 300, maxXp: 500, icon: '🔨' },
    { level: 5, name: 'Achiever', minXp: 500, maxXp: 750, icon: '⭐' },
    { level: 6, name: 'Master', minXp: 750, maxXp: 1000, icon: '🎯' },
    { level: 7, name: 'Champion', minXp: 1000, maxXp: 1500, icon: '🏆' },
    { level: 8, name: 'Legend', minXp: 1500, maxXp: 2000, icon: '👑' },
    { level: 9, name: 'Polymath', minXp: 2000, maxXp: 3000, icon: '🌟' },
    { level: 10, name: 'Transcendent', minXp: 3000, maxXp: 99999, icon: '✨' },
  ];
  
  const currentLevel = levels.find(l => xp >= l.minXp && xp < l.maxXp) || levels[levels.length - 1];
  const progress = ((xp - currentLevel.minXp) / (currentLevel.maxXp - currentLevel.minXp)) * 100;
  
  return { ...currentLevel, progress, totalXp: xp };
};

// Dynamic challenges that reset
const getChallenges = (stats: { currentStreak: number; totalWins: number; totalReflections: number }, todayCompleted: boolean) => {
  const challenges = [];
  
  // Daily challenge - resets every day
  challenges.push({
    icon: '🎯',
    name: 'Today\'s Win',
    progress: todayCompleted ? 1 : 0,
    target: 1,
    reward: '+10 XP',
    type: 'daily'
  });
  
  // Weekly streak challenge
  const weeklyStreakTarget = 7;
  challenges.push({
    icon: '🔥',
    name: '7-Day Streak',
    progress: Math.min(stats.currentStreak, weeklyStreakTarget),
    target: weeklyStreakTarget,
    reward: '+50 XP',
    type: 'weekly'
  });
  
  // Reflection challenge (weekly)
  const weeklyReflectionTarget = 5;
  const thisWeekReflections = Math.min(stats.totalReflections % 7 || stats.totalReflections, weeklyReflectionTarget);
  challenges.push({
    icon: '✨',
    name: 'Reflect 5x',
    progress: thisWeekReflections,
    target: weeklyReflectionTarget,
    reward: '+25 XP',
    type: 'weekly'
  });
  
  // Monthly milestone (keeps growing)
  const monthlyTarget = Math.ceil((stats.totalWins + 1) / 10) * 10; // Next milestone
  challenges.push({
    icon: '🚀',
    name: `Reach ${monthlyTarget} Wins`,
    progress: stats.totalWins,
    target: monthlyTarget,
    reward: '+100 XP',
    type: 'milestone'
  });
  
  return challenges;
};

export const HistoryView = ({ allDays }: HistoryViewProps) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [weeklyTargets, setWeeklyTargets] = useState<WeeklyTarget[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('weekly-targets');
    if (saved) setWeeklyTargets(JSON.parse(saved));
  }, []);

  // Get last 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), i);
    return format(date, 'yyyy-MM-dd');
  }).reverse();

  // Calculate stats
  const calculateStats = () => {
    const sortedDates = Object.keys(allDays).sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let totalWins = 0;
    let totalReflections = 0;

    sortedDates.forEach((date) => {
      const day = allDays[date];
      const coreTasks = day.tasks.filter(t => t.category === 'core');
      const isWin = coreTasks.length > 0 && coreTasks.every(t => t.completed);
      
      if (isWin) {
        totalWins++;
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
      
      if (day.reflections) {
        totalReflections += day.reflections.length;
      }
    });

    // Calculate current streak from today backwards
    for (let i = 0; i <= 30; i++) {
      const checkDate = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const day = allDays[checkDate];
      if (!day) break;
      
      const coreTasks = day.tasks.filter(t => t.category === 'core');
      const isWin = coreTasks.length > 0 && coreTasks.every(t => t.completed);
      
      if (isWin) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    return { currentStreak, longestStreak, totalWins, totalReflections };
  };

  const stats = calculateStats();
  const selectedDayData = selectedDate ? allDays[selectedDate] : null;
  const todayQuote = getDailyQuote(format(new Date(), 'yyyy-MM-dd'));
  
  // Check if today is a win
  const todayDate = format(new Date(), 'yyyy-MM-dd');
  const todayData = allDays[todayDate];
  const todayCoreTasks = todayData?.tasks?.filter(t => t.category === 'core') || [];
  const todayCompleted = todayCoreTasks.length > 0 && todayCoreTasks.every(t => t.completed);
  
  // XP calculation: 10xp per win, 5xp per reflection, 20xp bonus per 7-day streak
  const totalXp = (stats.totalWins * 10) + (stats.totalReflections * 5) + (Math.floor(stats.longestStreak / 7) * 20);
  const levelInfo = getLevelInfo(totalXp);
  const challenges = getChallenges(stats, todayCompleted);
  

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Today's Quote */}
      <div className="card-elevated p-4 md:p-5 text-center bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border border-primary/20">
        <Sparkles className="w-5 h-5 text-primary mx-auto mb-2" />
        <p className="text-base md:text-lg font-serif italic text-foreground/90">
          "{todayQuote.text}"
        </p>
        <p className="text-xs text-muted-foreground mt-2">— {todayQuote.author}</p>
      </div>

      {/* Level & XP Card */}
      <div className="card-elevated p-4 md:p-5 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-400/20">
        <div className="flex items-center gap-4">
          <div className="text-4xl md:text-5xl">{levelInfo.icon}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="font-serif font-bold text-lg md:text-xl">Level {levelInfo.level}</span>
                <span className="text-xs md:text-sm text-muted-foreground ml-2">{levelInfo.name}</span>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-bold">{totalXp} XP</span>
              </div>
            </div>
            <Progress value={levelInfo.progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {levelInfo.maxXp - totalXp} XP to Level {levelInfo.level + 1}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <div className="card-elevated p-3 md:p-4 text-center">
          <div className="flex items-center justify-center mb-1 md:mb-2">
            <Flame className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
          </div>
          <div className="text-xl md:text-2xl font-bold">{stats.currentStreak}</div>
          <div className="text-[10px] md:text-xs text-muted-foreground">Day Streak</div>
        </div>
        
        <div className="card-elevated p-3 md:p-4 text-center">
          <div className="flex items-center justify-center mb-1 md:mb-2">
            <Trophy className="w-5 h-5 md:w-6 md:h-6 text-success" />
          </div>
          <div className="text-xl md:text-2xl font-bold">{stats.totalWins}</div>
          <div className="text-[10px] md:text-xs text-muted-foreground">Total Wins</div>
        </div>
        
        <div className="card-elevated p-3 md:p-4 text-center">
          <div className="flex items-center justify-center mb-1 md:mb-2">
            <Crown className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <div className="text-xl md:text-2xl font-bold">{stats.longestStreak}</div>
          <div className="text-[10px] md:text-xs text-muted-foreground">Best Streak</div>
        </div>
      </div>

      {/* Active Challenges */}
      <div className="card-elevated p-4 md:p-5">
        <h3 className="text-base md:text-lg font-serif font-semibold mb-3 flex items-center gap-2">
          <Rocket className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          Active Challenges
        </h3>
        <div className="space-y-3">
          {challenges.map((challenge, i) => {
            const progressPercent = (challenge.progress / challenge.target) * 100;
            const isComplete = challenge.progress >= challenge.target;
            
            return (
              <div
                key={i}
                className={cn(
                  "p-3 rounded-xl border transition-all",
                  isComplete 
                    ? "bg-success/10 border-success/30" 
                    : "bg-muted/20 border-border/30"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{challenge.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{challenge.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{challenge.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "text-xs font-bold",
                      isComplete ? "text-success" : "text-amber-500"
                    )}>
                      {isComplete ? '✓ Done!' : challenge.reward}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-500",
                        isComplete ? "bg-success" : "bg-gradient-to-r from-primary to-accent"
                      )}
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium min-w-[40px] text-right">
                    {challenge.progress}/{challenge.target}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card-elevated p-4 md:p-5">
        <h3 className="text-base md:text-lg font-serif font-semibold mb-3 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 md:w-5 md:h-5" />
          Last 30 Days
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Tap a day to see details
        </p>
        
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center text-[10px] md:text-xs text-muted-foreground font-medium py-1">
              {day}
            </div>
          ))}
          
          {/* Offset for first day */}
          {Array.from({ length: parseISO(last30Days[0]).getDay() }, (_, i) => (
            <div key={`offset-${i}`} />
          ))}
          
          {last30Days.map((date) => {
            const day = allDays[date];
            const coreTasks = day?.tasks?.filter(t => t.category === 'core') || [];
            const isWin = coreTasks.length > 0 && coreTasks.every(t => t.completed);
            const hasData = !!day;
            const isTodayDate = isToday(parseISO(date));
            
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] md:text-xs transition-all border-2 active:scale-95",
                  selectedDate === date && "ring-2 ring-primary ring-offset-1",
                  isTodayDate && "border-primary",
                  !isTodayDate && "border-transparent",
                  isWin && "bg-success/20 hover:bg-success/30",
                  hasData && !isWin && "bg-muted/50 hover:bg-muted",
                  !hasData && "bg-background hover:bg-muted/30",
                  day?.mood && moodColors[day.mood]
                )}
              >
                <span className="font-medium">{format(parseISO(date), 'd')}</span>
                {day?.mood && (
                  <span className="text-[8px] md:text-[10px]">{moodEmoji[day.mood]}</span>
                )}
                {isWin && !day?.mood && (
                  <span className="text-[8px] md:text-[10px]">🏆</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Details Modal */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto mx-4">
          {selectedDayData && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg md:text-xl font-serif flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  {format(parseISO(selectedDate!), 'EEEE, MMM d')}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                {/* Daily Quote for that day */}
                <div className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50">
                  <p className="text-xs md:text-sm italic text-foreground/80">
                    "{getDailyQuote(selectedDate!).text}"
                  </p>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-1">— {getDailyQuote(selectedDate!).author}</p>
                </div>

                {/* Mood */}
                {selectedDayData.mood && (
                  <div className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-muted/30">
                    <span className="text-2xl md:text-3xl">{moodEmoji[selectedDayData.mood]}</span>
                    <div>
                      <p className="text-sm font-medium capitalize">{selectedDayData.mood} Energy</p>
                      <p className="text-xs text-muted-foreground">{moodLabels[selectedDayData.mood]}</p>
                    </div>
                  </div>
                )}
                
                {/* Tasks */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 md:mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Daily Tasks
                  </h4>
                  <div className="space-y-2">
                    {selectedDayData.tasks.map(task => (
                      <div 
                        key={task.id} 
                        className={cn(
                          "flex items-center gap-2 md:gap-3 text-sm p-2 rounded-lg transition-all",
                          task.completed ? "bg-success/10" : "bg-muted/30"
                        )}
                      >
                        <span className={cn(
                          "w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs flex-shrink-0",
                          task.completed 
                            ? "bg-success text-success-foreground border-success" 
                            : "border-border"
                        )}>
                          {task.completed && '✓'}
                        </span>
                        <span className="text-sm">{task.icon}</span>
                        <span className={cn(
                          "flex-1 text-xs md:text-sm",
                          task.completed && "text-muted-foreground"
                        )}>
                          {task.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekly Targets */}
                {weeklyTargets.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 md:mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      Weekly Targets
                    </h4>
                    <div className="space-y-2">
                      {weeklyTargets.slice(0, 5).map(target => (
                        <div 
                          key={target.id}
                          className={cn(
                            "flex items-center gap-2 text-xs md:text-sm p-2 rounded-lg",
                            target.completed ? "bg-success/10" : "bg-muted/30"
                          )}
                        >
                          <span>{targetTypeEmoji[target.type]}</span>
                          <span className={cn(
                            "flex-1",
                            target.completed && "line-through text-muted-foreground"
                          )}>
                            {target.text}
                          </span>
                          {target.completed && (
                            <span className="text-xs text-success">✓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Reflections */}
                {selectedDayData.reflections && selectedDayData.reflections.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 md:mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Reflections
                    </h4>
                    <div className="space-y-2 md:space-y-3">
                      {selectedDayData.reflections.map((reflection) => (
                        <div 
                          key={reflection.id}
                          className="p-3 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border/30"
                        >
                          <p className="text-xs font-medium text-primary mb-1">{reflection.label}</p>
                          <p className="text-xs md:text-sm">{reflection.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
