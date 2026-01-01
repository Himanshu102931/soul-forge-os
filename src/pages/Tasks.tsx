import { motion } from 'framer-motion';
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
      </motion.div>

      {/* Mobile: Tabs */}
      <div className="md:hidden">
        <Tabs defaultValue="today">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="backlog" className="gap-2">
              <Inbox className="w-4 h-4" />
              <span className="hidden sm:inline">Task Vault </span>({backlogTasks?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="today" className="gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Today </span>({todayTasks?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="backlog" className="space-y-3 mt-4">
            <AddTaskForm isForToday={false} />
            {backlogLoading ? (
              <TaskSkeleton />
            ) : backlogTasks?.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No tasks in vault</p>
            ) : (
              backlogTasks?.map(task => (
                <TaskCard key={task.id} task={task} showMoveRight />
              ))
            )}
          </TabsContent>

          <TabsContent value="today" className="space-y-3 mt-4">
            <AddTaskForm isForToday={true} />
            {todayLoading ? (
              <TaskSkeleton />
            ) : todayTasks?.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No tasks for today</p>
            ) : (
              todayTasks?.map(task => (
                <TaskCard key={task.id} task={task} showMoveLeft />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: Two columns */}
      <div className="hidden md:grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Inbox className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">Task Vault</h2>
            <span className="text-xs text-muted-foreground ml-auto">{backlogTasks?.length || 0} tasks</span>
          </div>
          <div className="space-y-3">
            <AddTaskForm isForToday={false} />
            {backlogLoading ? (
              <TaskSkeleton />
            ) : backlogTasks?.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No tasks in vault</p>
            ) : (
              backlogTasks?.map(task => (
                <TaskCard key={task.id} task={task} showMoveRight />
              ))
            )}
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

