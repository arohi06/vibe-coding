import { useState } from 'react';
import { Plus, RotateCcw, Compass, Sparkles, Trophy, History } from 'lucide-react';
import { useTracker } from '@/hooks/useTracker';
import { TaskItem } from '@/components/TaskItem';
import { MoodTracker } from '@/components/MoodTracker';
import { ReflectionSection } from '@/components/ReflectionSection';
import { ProgressRing } from '@/components/ProgressRing';
import { WeeklyView } from '@/components/WeeklyView';
import { HistoryView } from '@/components/HistoryView';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const Index = () => {
  const {
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
  } = useTracker();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="container max-w-4xl mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-3xl font-serif font-bold text-gradient truncate">
                Daily Polymath
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{today}</p>
            </div>
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <ProgressRing completed={completedCore} total={totalCore} size={48} strokeWidth={3} />
              {isWinningDay && (
                <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-success/10 text-success rounded-full text-xs md:text-sm font-medium animate-fade-in-up">
                  <Trophy className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Win!</span>
                  <span className="sm:hidden">🏆</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-6 pb-20 md:pb-24 space-y-4 md:space-y-6">
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-4 md:mb-6 h-11 md:h-10">
            <TabsTrigger value="daily" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
              <span>Today</span>
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Compass className="w-3 h-3 md:w-4 md:h-4" />
              <span>Compass</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <History className="w-3 h-3 md:w-4 md:h-4" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4 md:space-y-6 animate-fade-in-up">
            {/* Core Tasks */}
            <section className="card-elevated p-4 md:p-5">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h2 className="text-base md:text-lg font-serif font-semibold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-primary" />
                  Non-Negotiable
                </h2>
                <span className="text-[10px] md:text-xs text-muted-foreground">
                  Complete all = WIN 🏆
                </span>
              </div>
              <div className="space-y-1">
                {coreTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TaskItem
                      task={task}
                      onToggle={toggleTask}
                      onUpdateText={updateTaskText}
                      onDelete={deleteTask}
                    />
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addTask('core')}
                className="mt-3 text-muted-foreground hover:text-foreground"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add task
              </Button>
            </section>

            {/* Optional Tasks */}
            <section className="card-elevated p-4 md:p-5">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h2 className="text-base md:text-lg font-serif font-semibold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-accent" />
                  Optional (Energy-Based)
                </h2>
              </div>
              <div className="space-y-1">
                {optionalTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${(index + coreTasks.length) * 50}ms` }}
                  >
                    <TaskItem
                      task={task}
                      onToggle={toggleTask}
                      onUpdateText={updateTaskText}
                      onDelete={deleteTask}
                    />
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addTask('optional')}
                className="mt-3 text-muted-foreground hover:text-foreground"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add task
              </Button>
            </section>

            {/* Mood Tracker */}
            <section className="card-elevated p-4 md:p-5">
              <h2 className="text-base md:text-lg font-serif font-semibold mb-3 md:mb-4 flex items-center gap-2">
                <span>🧠</span> Mood Track
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground text-center mb-3 md:mb-4">
                Mood decides duration, not consistency
              </p>
              <MoodTracker mood={dayData.mood} onSetMood={setMood} />
            </section>

            {/* Night Reflection */}
            <section className="card-elevated p-4 md:p-5">
              <h2 className="text-base md:text-lg font-serif font-semibold mb-3 md:mb-4 flex items-center gap-2">
                <span>✍️</span> Night Reflection
              </h2>
              <ReflectionSection
                reflections={dayData.reflections || []}
                onAddReflection={addReflection}
                onUpdateReflection={updateReflection}
                onUpdateReflectionLabel={updateReflectionLabel}
                onDeleteReflection={deleteReflection}
              />
            </section>

            {/* Reset Button */}
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={resetDay}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Day
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="animate-fade-in-up">
            <WeeklyView />
          </TabsContent>

          <TabsContent value="history" className="animate-fade-in-up">
            <HistoryView allDays={allDays} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 inset-x-0 bg-background/80 backdrop-blur-md border-t border-border/50 py-2 md:py-3 safe-area-pb">
        <div className="container max-w-4xl mx-auto px-3 md:px-4 text-center">
          <p className="text-[10px] md:text-xs text-muted-foreground">
            🧭 Your compass to becoming a polymath
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
