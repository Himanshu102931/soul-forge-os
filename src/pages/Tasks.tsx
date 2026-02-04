import { motion } from 'framer-motion';
<<<<<<< HEAD
import { useBacklogTasks, useTodayTasks } from '@/hooks/useTasks';
import { TaskCard } from '@/components/TaskCard';
import { AddTaskForm } from '@/components/AddTaskForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Inbox, Target } from 'lucide-react';

export default function Tasks() {
  const { data: backlogTasks, isLoading: backlogLoading } = useBacklogTasks();
  const { data: todayTasks, isLoading: todayLoading } = useTodayTasks();

  const TaskSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="space-y-4 pb-24 md:pb-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-lg sm:text-xl font-bold">Tasks</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Manage your backlog and daily focus</p>
=======
import { useBacklogTasks, useTodayTasks, useArchiveTask, useDeleteTask } from '@/hooks/useTasks';
import { useMemo, useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Trash2, Inbox, Target } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TaskCard } from '@/components/TaskCard';
import { AddTaskForm } from '@/components/AddTaskForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


export default function Tasks() {
  const { data: backlogTasks = [] } = useBacklogTasks();
  const { data: todayTasks = [] } = useTodayTasks();
  const archiveTask = useArchiveTask();
  const deleteTask = useDeleteTask();
  const [selected, setSelected] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const isMobile = useIsMobile();
  const [expandedSection, setExpandedSection] = useState<'completed' | 'archived' | null>(null);
  // Multi-select logic
  const allTasks = useMemo(() => [...backlogTasks, ...todayTasks], [backlogTasks, todayTasks]);
  const toggleSelect = (id: string) => {
    setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  };
  const selectAll = () => setSelected(allTasks.map(t => t.id));
  const clearSelected = () => setSelected([]);
  const handleBulkArchive = async () => {
    await Promise.all(selected.map(id => archiveTask.mutateAsync(id)));
    clearSelected();
    setSelectMode(false);
  };
  // Completed tasks (completed: true, not archived)
  const [completedRange, setCompletedRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const { data: completedTasks = [] } = useQuery({
    queryKey: ['completedTasks', completedRange],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('completed', true)
        .eq('archived', false);
      const now = new Date();
      if (completedRange === 'today') {
        const todayStr = now.toISOString().slice(0, 10);
        query = query.gte('completed_at', todayStr + 'T00:00:00').lte('completed_at', todayStr + 'T23:59:59');
      } else if (completedRange === 'week') {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        const startStr = start.toISOString().slice(0, 10);
        query = query.gte('completed_at', startStr + 'T00:00:00');
      } else if (completedRange === 'month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const startStr = start.toISOString().slice(0, 10);
        query = query.gte('completed_at', startStr + 'T00:00:00');
      }
      const { data, error } = await query.order('priority', { ascending: true }).order('completed_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Archived tasks (archived: true)
  const [archivedRange, setArchivedRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const { data: archivedTasks = [] } = useQuery({
    queryKey: ['archivedTasks', archivedRange],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('archived', true);
      const now = new Date();
      if (archivedRange === 'today') {
        const todayStr = now.toISOString().slice(0, 10);
        query = query.gte('completed_at', todayStr + 'T00:00:00').lte('completed_at', todayStr + 'T23:59:59');
      } else if (archivedRange === 'week') {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        const startStr = start.toISOString().slice(0, 10);
        query = query.gte('completed_at', startStr + 'T00:00:00');
      } else if (archivedRange === 'month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const startStr = start.toISOString().slice(0, 10);
        query = query.gte('completed_at', startStr + 'T00:00:00');
      }
      const { data, error } = await query.order('priority', { ascending: true }).order('completed_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Collapse completed/archived sections when component unmounts
  useEffect(() => {
    return () => {
      setExpandedSection(null);
    };
  }, []);

  return (
    <div className="space-y-4 pb-28 md:pb-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-xl md:text-2xl font-bold">Tasks</h1>
        <p className="text-sm text-muted-foreground">Manage your backlog and daily focus</p>
>>>>>>> cf46c6e (Initial commit: project files)
      </motion.div>

      {/* Mobile: Tabs */}
      <div className="md:hidden">
<<<<<<< HEAD
        <Tabs defaultValue="today">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="backlog" className="gap-2">
              <Inbox className="w-4 h-4" />
              <span className="hidden sm:inline">Task Vault </span>({backlogTasks?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="today" className="gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Today </span>({todayTasks?.length || 0})
=======
        <div className="flex gap-2 mb-2">
          <button className="btn btn-xs" onClick={() => setSelectMode(m => !m)}>{selectMode ? 'Cancel' : 'Multi-select'}</button>
          {selectMode && (
            <>
              <button className="btn btn-xs" onClick={selectAll}>Select All</button>
              <button className="btn btn-xs btn-error" disabled={!selected.length} onClick={handleBulkArchive}>Archive Selected</button>
            </>
          )}
        </div>
        <Tabs defaultValue="today">
          <TabsList className="w-full">
            <TabsTrigger value="backlog" className="flex-1 gap-2">
              <Inbox className="w-4 h-4" />
              Backlog ({backlogTasks?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="today" className="flex-1 gap-2">
              <Target className="w-4 h-4" />
              Today ({todayTasks?.length || 0})
>>>>>>> cf46c6e (Initial commit: project files)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="backlog" className="space-y-3 mt-4">
            <AddTaskForm isForToday={false} />
<<<<<<< HEAD
            {backlogLoading ? (
              <TaskSkeleton />
            ) : backlogTasks?.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No tasks in vault</p>
            ) : (
              backlogTasks?.map(task => (
                <TaskCard key={task.id} task={task} showMoveRight />
              ))
            )}
=======
            {backlogTasks.length === 0 && <div className="text-center text-muted-foreground text-xs py-8">🎯 No backlog tasks! Add one above.</div>}
            {backlogTasks.map(task => (
              <TaskCard key={task.id} task={task} showMoveRight selectMode={selectMode} selected={selected.includes(task.id)} onSelect={toggleSelect} swipeToComplete={isMobile} />
            ))}
>>>>>>> cf46c6e (Initial commit: project files)
          </TabsContent>

          <TabsContent value="today" className="space-y-3 mt-4">
            <AddTaskForm isForToday={true} />
<<<<<<< HEAD
            {todayLoading ? (
              <TaskSkeleton />
            ) : todayTasks?.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No tasks for today</p>
            ) : (
              todayTasks?.map(task => (
                <TaskCard key={task.id} task={task} showMoveLeft />
              ))
            )}
=======
            {todayTasks.length === 0 && <div className="text-center text-muted-foreground text-xs py-8">✅ All done for today! Enjoy your free time.</div>}
            {todayTasks.map(task => (
              <TaskCard key={task.id} task={task} showMoveLeft selectMode={selectMode} selected={selected.includes(task.id)} onSelect={toggleSelect} swipeToComplete={isMobile} />
            ))}
>>>>>>> cf46c6e (Initial commit: project files)
          </TabsContent>
        </Tabs>
      </div>

<<<<<<< HEAD
      {/* Desktop: Two columns */}
=======
>>>>>>> cf46c6e (Initial commit: project files)
      <div className="hidden md:grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Inbox className="w-5 h-5 text-muted-foreground" />
<<<<<<< HEAD
            <h2 className="font-semibold">Task Vault</h2>
=======
            <h2 className="font-semibold">Backlog</h2>
>>>>>>> cf46c6e (Initial commit: project files)
            <span className="text-xs text-muted-foreground ml-auto">{backlogTasks?.length || 0} tasks</span>
          </div>
          <div className="space-y-3">
            <AddTaskForm isForToday={false} />
<<<<<<< HEAD
            {backlogLoading ? (
              <TaskSkeleton />
            ) : backlogTasks?.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No tasks in vault</p>
            ) : (
              backlogTasks?.map(task => (
                <TaskCard key={task.id} task={task} showMoveRight />
              ))
            )}
=======
            {backlogTasks.length === 0 && <div className="text-center text-muted-foreground text-xs py-8">🎯 No backlog tasks! Add one above.</div>}
            {backlogTasks?.map(task => (
              <TaskCard key={task.id} task={task} showMoveRight selectMode={selectMode} selected={selected.includes(task.id)} onSelect={toggleSelect} />
            ))}
>>>>>>> cf46c6e (Initial commit: project files)
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Today's Focus</h2>
            <span className="text-xs text-muted-foreground ml-auto">{todayTasks?.length || 0} tasks</span>
          </div>
          <div className="space-y-3">
            <AddTaskForm isForToday={true} />
<<<<<<< HEAD
            {todayLoading ? (
              <TaskSkeleton />
            ) : todayTasks?.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No tasks for today</p>
            ) : (
              todayTasks?.map(task => (
                <TaskCard key={task.id} task={task} showMoveLeft />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

=======
            {todayTasks.length === 0 && <div className="text-center text-muted-foreground text-xs py-8">✅ All done for today! Enjoy your free time.</div>}
            {todayTasks?.map(task => (
              <TaskCard key={task.id} task={task} showMoveLeft selectMode={selectMode} selected={selected.includes(task.id)} onSelect={toggleSelect} />
            ))}
          </div>
        </div>
      </div>

      {/* Multi-select controls (Desktop) */}
      <div className="hidden md:flex gap-2 mt-4">
        <button className="btn btn-sm" onClick={() => setSelectMode(m => !m)}>{selectMode ? 'Cancel' : 'Multi-select'}</button>
        {selectMode && (
          <>
            <button className="btn btn-sm" onClick={selectAll}>Select All</button>
            <button className="btn btn-sm btn-error" disabled={!selected.length} onClick={handleBulkArchive}>Archive Selected ({selected.length})</button>
          </>
        )}
      </div>

    {/* Completed & Archived Tasks Sections */}
    <div className="mt-8 space-y-4">
      <div className="flex gap-4 flex-col md:flex-row md:items-center">
        {/* Completed Tasks Button */}
        <button
          className="flex items-center gap-2 text-base font-semibold focus:outline-none py-2 px-3 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setExpandedSection(expandedSection === 'completed' ? null : 'completed')}
          aria-expanded={expandedSection === 'completed'}
        >
          {expandedSection === 'completed' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          <span>✅ Completed Tasks ({completedTasks.length})</span>
        </button>

        {/* Archived Tasks Button */}
        <button
          className="flex items-center gap-2 text-base font-semibold focus:outline-none py-2 px-3 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setExpandedSection(expandedSection === 'archived' ? null : 'archived')}
          aria-expanded={expandedSection === 'archived'}
        >
          {expandedSection === 'archived' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          <span>📦 View Archived ({archivedTasks.length})</span>
        </button>
      </div>

      {/* Completed Tasks Section */}
      {expandedSection === 'completed' && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex gap-2 mb-4 items-center flex-wrap">
            <label className="text-xs font-medium">Show:</label>
            <select
              className="text-xs border rounded px-2 py-1 bg-card text-foreground border-border focus:outline-none focus:ring-2 focus:ring-primary"
              value={completedRange}
              onChange={e => setCompletedRange(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
            </select>
          </div>
          {completedTasks.length === 0 ? (
            <div className="text-center text-muted-foreground text-xs py-8">✅ No tasks completed yet! Finish a task to see it here.</div>
          ) : (
            <ul className="divide-y divide-border">
              {completedTasks.map(task => (
                <li key={task.id} className="flex items-center gap-2 py-3 group hover:bg-muted/50 px-2 rounded transition-colors">
                  <span className={
                    task.priority === 'high' ? 'text-red-500 font-bold' :
                    task.priority === 'medium' ? 'text-yellow-500 font-semibold' :
                    'text-muted-foreground'
                  }>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                  <span className="flex-1 truncate text-sm">{task.title}</span>
                  {task.completed_at && (
                    <span className="text-xs text-muted-foreground">{new Date(task.completed_at).toLocaleDateString()}</span>
                  )}
                  <button
                    onClick={() => deleteTask.mutateAsync(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 text-destructive transition-all"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Archived Tasks Section */}
      {expandedSection === 'archived' && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex gap-2 mb-4 items-center flex-wrap">
            <label className="text-xs font-medium">Show:</label>
            <select
              className="text-xs border rounded px-2 py-1 bg-card text-foreground border-border focus:outline-none focus:ring-2 focus:ring-primary"
              value={archivedRange}
              onChange={e => setArchivedRange(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
            </select>
          </div>
          {archivedTasks.length === 0 ? (
            <div className="text-center text-muted-foreground text-xs py-8">📦 No archived tasks yet! Archive a task to see it here.</div>
          ) : (
            <ul className="divide-y divide-border">
              {archivedTasks.map(task => (
                <li key={task.id} className="flex items-center gap-2 py-3 group hover:bg-muted/50 px-2 rounded transition-colors">
                  <span className={
                    task.priority === 'high' ? 'text-red-500 font-bold' :
                    task.priority === 'medium' ? 'text-yellow-500 font-semibold' :
                    'text-muted-foreground'
                  }>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                  <span className="flex-1 truncate text-sm">{task.title}</span>
                  {task.completed_at && (
                    <span className="text-xs text-muted-foreground">{new Date(task.completed_at).toLocaleDateString()}</span>
                  )}
                  <button
                    onClick={() => deleteTask.mutateAsync(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 text-destructive transition-all"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
    </div>
  );
}
>>>>>>> cf46c6e (Initial commit: project files)
