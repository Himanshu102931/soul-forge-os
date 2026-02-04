<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSeedPlan, useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useAllHabits, useArchiveHabit, useCreateHabit, useUpdateHabit, useDeleteHabit, Habit } from '@/hooks/useHabits';
import { useArchivedTasks, useUnarchiveTask } from '@/hooks/useTasks';
import { useDataExport, type DateRangeOption } from '@/hooks/useDataExport';
import { useToast } from '@/hooks/use-toast';
import { saveAIConfigToDatabase, loadAIConfigFromDatabase, type AIConfig } from '@/lib/ai-config-db';
import { testAIConnection } from '@/lib/ai-service';
import { Settings as SettingsIcon, Brain, AlertTriangle, Zap, Sparkles } from 'lucide-react';
import { HabitFormDialog } from '@/components/HabitFormDialog';
import { MySystemSection } from '@/components/settings/MySystemSection';
import { BrainDataSection } from '@/components/settings/BrainDataSection';
import { AIConfigSection } from '@/components/settings/AIConfigSection';
import { AIUsageTab } from '@/components/settings/AIUsageTab';
import { DangerZoneSection } from '@/components/settings/DangerZoneSection';
=======
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSeedPlan, useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { SettingsXPSchema } from '@/lib/validation';
import { useAllHabits, useArchiveHabit, useCreateHabit, useUpdateHabit, useDeleteHabit, Habit } from '@/hooks/useHabits';
import { useArchivedTasks, useUnarchiveTask } from '@/hooks/useTasks';
import { ImportDataSection } from '@/components/settings/ImportDataSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  LogOut, Sparkles, Archive, RotateCcw, Loader2, 
  Plus, Pencil, Trash2, Minus, AlertTriangle, Brain, 
  CheckCircle, Settings as SettingsIcon, Pause, Play
} from 'lucide-react';
import { HabitFormDialog } from '@/components/HabitFormDialog';
import { HabitTemplateDialog } from '@/components/HabitTemplateDialog';
>>>>>>> cf46c6e (Initial commit: project files)
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

<<<<<<< HEAD
=======
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatFrequency(days: number[]): string {
  if (days.length === 0) return 'Always';
  if (days.length === 7) return 'Daily';
  return days.map(d => DAY_NAMES[d]).join(', ');
}

>>>>>>> cf46c6e (Initial commit: project files)
export default function Settings() {
  const { signOut, user } = useAuth();
  const seedPlan = useSeedPlan();
  const { data: habits } = useAllHabits();
  const { data: profile } = useProfile();
  const { data: archivedTasks } = useArchivedTasks();
  const updateProfile = useUpdateProfile();
  const archiveHabit = useArchiveHabit();
  const deleteHabit = useDeleteHabit();
  const createHabit = useCreateHabit();
  const updateHabit = useUpdateHabit();
  const unarchiveTask = useUnarchiveTask();
<<<<<<< HEAD
  const dataExport = useDataExport();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [xpInput, setXpInput] = useState('');
  const [exportDateRange, setExportDateRange] = useState<DateRangeOption>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  
  // AI Configuration state
  const [aiConfig, setAIConfig] = useState<AIConfig | null>(null);
  const [aiApiKey, setAiApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  
  // Load AI config from database on mount
  useEffect(() => {
    loadAIConfigFromDatabase().then(setAIConfig);
  }, []);
=======
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [xpInput, setXpInput] = useState('');
>>>>>>> cf46c6e (Initial commit: project files)
  
  // Controlled accordion state - starts with none open
  const [openSections, setOpenSections] = useState<string[]>([]);

  const activeHabits = habits?.filter(h => !h.archived) || [];
  const archivedHabits = habits?.filter(h => h.archived) || [];

  const handleSeedPlan = async () => {
    try {
      await seedPlan.mutateAsync();
      toast({ title: 'Success', description: 'Your plan has been loaded!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load plan', variant: 'destructive' });
    }
  };

<<<<<<< HEAD
  const handleExport = async () => {
    if (exportDateRange === 'custom' && (!customStartDate || !customEndDate)) {
      toast({
        title: 'Invalid Dates',
        description: 'Please select both start and end dates for custom range',
        variant: 'destructive',
      });
      return;
    }

    await dataExport.mutateAsync({
      dateRange: exportDateRange,
      customStartDate,
      customEndDate,
      format: exportFormat,
    });
  };

=======
>>>>>>> cf46c6e (Initial commit: project files)
  const handleAddHabit = () => {
    setEditingHabit(null);
    setDialogOpen(true);
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setDialogOpen(true);
  };

  const handleSubmitHabit = async (data: {
    title: string;
    description: string | null;
    frequency_days: number[];
    xp_reward: number;
    is_bad_habit: boolean;
<<<<<<< HEAD
=======
    category: 'health' | 'productivity' | 'social' | 'learning' | 'wellness' | 'other';
>>>>>>> cf46c6e (Initial commit: project files)
  }) => {
    try {
      if (editingHabit) {
        await updateHabit.mutateAsync({
          id: editingHabit.id,
          ...data,
        });
        toast({ title: 'Success', description: 'Habit updated!' });
      } else {
        await createHabit.mutateAsync({
          ...data,
          sort_order: activeHabits.length,
          archived: false,
        });
        toast({ title: 'Success', description: 'Habit created!' });
      }
      setDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save habit', variant: 'destructive' });
    }
  };

  const handleDeleteHabit = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteHabit.mutateAsync(deleteConfirmId);
      toast({ title: 'Deleted', description: 'Habit permanently deleted.' });
      setDeleteConfirmId(null);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete habit', variant: 'destructive' });
    }
  };

  const handleRestoreTask = async (taskId: string) => {
    try {
      await unarchiveTask.mutateAsync(taskId);
      toast({ title: 'Restored', description: 'Task restored to your list.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to restore task', variant: 'destructive' });
    }
  };
<<<<<<< HEAD
  // AI Configuration handlers
  const handleSaveAIConfig = async () => {
    if (!aiConfig) return;
    
    if (!aiApiKey) {
      toast({
        title: 'API Key Required',
        description: 'Please enter an API key',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Save encrypted key to database (server-side storage)
      await saveAIConfigToDatabase(aiConfig.provider, aiApiKey, aiConfig?.enabled ?? false);
      
      toast({ 
        title: '✅ Securely Saved', 
        description: `${aiConfig.provider} API key stored server-side` 
      });
      
      // Clear input field after save
      setAiApiKey('');
    } catch (error) {
      toast({
        title: 'Failed to save',
        description: error instanceof Error ? error.message : 'Could not save AI configuration',
        variant: 'destructive',
      });
    }
  };

  const handleTestConnection = async () => {
    if (!aiConfig) return;
    
    if (!aiApiKey) {
      toast({ 
        title: 'API Key Required', 
        description: 'Please enter an API key first', 
        variant: 'destructive' 
      });
      return;
    }

    setTestingConnection(true);
    try {
      const success = await testAIConnection(aiConfig.provider);
      
      if (success) {
        toast({ 
          title: '✅ Connection Successful', 
          description: `${aiConfig.provider} API is working!` 
        });
      } else {
        toast({ 
          title: 'Connection Failed', 
          description: 'Please check your API key', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ 
        title: 'Connection Failed', 
        description: error instanceof Error ? error.message : 'Unknown error', 
        variant: 'destructive' 
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleClearAIConfig = async () => {
    if (!aiConfig) return;
    
    try {
      const { deleteAIConfigFromDatabase } = await import('@/lib/ai-config-db');
      await deleteAIConfigFromDatabase(aiConfig.provider);
      setAIConfig(null);
      setAiApiKey('');
      toast({ 
        title: 'AI Config Cleared', 
        description: 'All AI settings have been removed from server' 
      });
    } catch (error) {
      toast({
        title: 'Failed to clear',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };
  
=======

>>>>>>> cf46c6e (Initial commit: project files)
  const handleLevelChange = async (delta: number) => {
    if (!profile) return;
    const newLevel = Math.max(1, profile.level + delta);
    try {
      await updateProfile.mutateAsync({ level: newLevel });
      toast({ title: 'Level Updated', description: `Level set to ${newLevel}` });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update level', variant: 'destructive' });
    }
  };

  const handleSetXP = async () => {
    if (!profile) return;
<<<<<<< HEAD
    const xp = parseInt(xpInput);
    if (isNaN(xp) || xp < 0) {
      toast({ title: 'Invalid', description: 'Enter a valid positive number', variant: 'destructive' });
      return;
    }
    try {
      await updateProfile.mutateAsync({ xp });
      toast({ title: 'XP Updated', description: `XP set to ${xp}` });
=======
    
    // Validate XP input
    const validation = SettingsXPSchema.safeParse({ xp: xpInput });
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({ 
        title: 'Validation Error', 
        description: firstError.message, 
        variant: 'destructive' 
      });
      return;
    }
    
    try {
      await updateProfile.mutateAsync({ xp: validation.data.xp });
      toast({ title: 'XP Updated', description: `XP set to ${validation.data.xp}` });
>>>>>>> cf46c6e (Initial commit: project files)
      setXpInput('');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update XP', variant: 'destructive' });
    }
  };

  const handleResetRound = async () => {
    if (!profile) return;
    try {
      await updateProfile.mutateAsync({ xp: 0, hp: 100 });
      toast({ title: 'Round Reset', description: 'XP set to 0, HP restored to 100' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reset round', variant: 'destructive' });
    }
  };

<<<<<<< HEAD
  const handleDayStartHourChange = async (hour: number) => {
    try {
      await updateProfile.mutateAsync({ day_start_hour: hour });
      toast({ 
        title: 'Day Start Hour Updated', 
        description: `Your day now starts at ${hour === 0 ? '12 AM' : hour + ' AM'}` 
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update day start hour', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-xl font-bold">Settings</h1>
=======
  return (
    <div className="space-y-6 pb-28 md:pb-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-xl md:text-2xl font-bold">Settings</h1>
>>>>>>> cf46c6e (Initial commit: project files)
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </motion.div>

      <Accordion 
        type="multiple" 
        value={openSections} 
        onValueChange={setOpenSections}
        className="space-y-4"
      >
        {/* MY SYSTEM */}
        <AccordionItem value="my-system" className="bg-card border border-border rounded-xl overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-5 h-5 text-primary" />
              <span className="font-semibold">My System</span>
            </div>
          </AccordionTrigger>
<<<<<<< HEAD
          <AccordionContent className="px-4 pb-4">
            <MySystemSection
              activeHabits={activeHabits}
              archivedHabits={archivedHabits}
              archivedTasks={archivedTasks || []}
              isSeeding={seedPlan.isPending}
              dayStartHour={profile?.day_start_hour}
              onAddHabit={handleAddHabit}
              onEditHabit={handleEditHabit}
              onArchiveHabit={(id, archived) => archiveHabit.mutate({ id, archived })}
              onDeleteHabit={(id) => setDeleteConfirmId(id)}
              onRestoreTask={handleRestoreTask}
              onSeedPlan={handleSeedPlan}
              onDayStartHourChange={handleDayStartHourChange}
            />
=======
          <AccordionContent className="px-4 pb-4 space-y-4">
            {/* Manage Habits */}
            <div className="bg-secondary/30 rounded-lg p-3 md:p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-sm md:text-base">Manage Habits</h4>
                <Button size="sm" onClick={handleAddHabit} className="min-h-[44px] min-w-[44px]">
                  <Plus className="w-4 h-4 md:mr-1" />
                  <span className="hidden md:inline">Add Habit</span>
                </Button>
              </div>
              
              {activeHabits.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active habits. Add one or load the default plan.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activeHabits.map(habit => (
                    <div key={habit.id} className="flex items-center justify-between p-2 bg-background/50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{habit.title}</span>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {habit.xp_reward || 10} XP
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditHabit(habit)}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                        {/* Pause/Resume functionality removed: usePauseHabit is not implemented. */}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => archiveHabit.mutate({ id: habit.id, archived: true })}>
                          <Archive className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Load Plan */}
            <div className="bg-secondary/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h4 className="font-medium">Load Habit Templates</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Choose from pre-made habit packs: Productivity, Health, Mindfulness, Learning, or Social.
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setTemplateDialogOpen(true)}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Browse Templates
                </Button>
                <Button size="sm" variant="outline" onClick={handleSeedPlan} disabled={seedPlan.isPending}>
                  {seedPlan.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Load Default
                </Button>
              </div>
            </div>

            {/* Archived Habits */}
            {archivedHabits.length > 0 && (
              <div className="bg-secondary/30 rounded-lg p-4">
                <h4 className="font-medium mb-3">Archived Habits</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {archivedHabits.map(habit => (
                    <div key={habit.id} className="flex items-center justify-between p-2 bg-background/50 rounded">
                      <span className="text-sm truncate flex-1 text-muted-foreground">{habit.title}</span>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => archiveHabit.mutate({ id: habit.id, archived: false })}>
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteConfirmId(habit.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Paused Habits */}
            {/* Paused Habits section removed: usePausedHabits is not implemented. */}

            {/* Archived Tasks */}
            {archivedTasks && archivedTasks.length > 0 && (
              <div className="bg-secondary/30 rounded-lg p-4">
                <h4 className="font-medium mb-3">Archived Tasks</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {archivedTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-background/50 rounded">
                      <span className="text-sm truncate flex-1 text-muted-foreground">{task.title}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleRestoreTask(task.id)}>
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Restore
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
>>>>>>> cf46c6e (Initial commit: project files)
          </AccordionContent>
        </AccordionItem>

        {/* BRAIN & DATA */}
        <AccordionItem value="brain-data" className="bg-card border border-border rounded-xl overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-purple-500" />
              <span className="font-semibold">Brain & Data</span>
            </div>
          </AccordionTrigger>
<<<<<<< HEAD
          <AccordionContent className="px-4 pb-4">
            <BrainDataSection
              exportDateRange={exportDateRange}
              customStartDate={customStartDate}
              customEndDate={customEndDate}
              exportFormat={exportFormat}
              isExporting={dataExport.isPending}
              onDateRangeChange={setExportDateRange}
              onCustomStartDateChange={setCustomStartDate}
              onCustomEndDateChange={setCustomEndDate}
              onFormatChange={setExportFormat}
              onExport={handleExport}
            />
          </AccordionContent>
        </AccordionItem>

        {/* AI CONFIGURATION */}
        <AccordionItem value="ai-config" className="bg-card border-2 border-primary/30 rounded-xl overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary" />
              <span className="font-semibold">AI Integration</span>
              {aiConfig && aiConfig.enabled && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                  ✨ Active
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <AIConfigSection
              aiConfig={aiConfig}
              apiKey={aiApiKey}
              showApiKey={showApiKey}
              testingConnection={testingConnection}
              onConfigChange={setAIConfig}
              onApiKeyChange={setAiApiKey}
              onToggleShowApiKey={() => setShowApiKey(!showApiKey)}
              onTestConnection={handleTestConnection}
              onSaveConfig={handleSaveAIConfig}
              onClearConfig={handleClearAIConfig}
            />
          </AccordionContent>
        </AccordionItem>

        {/* AI USAGE & COST TRACKING */}
        <AccordionItem value="ai-usage" className="bg-card border-2 border-primary/30 rounded-xl overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>AI Usage & Costs</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <AIUsageTab />
=======
          <AccordionContent className="px-4 pb-4 space-y-4">
            {/* Local Neural Core Status */}
            <div className="bg-secondary/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-medium">Local Neural Core: Active</span>
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                The Drill Sergeant uses a local algorithm for instant feedback (0ms latency, 100% uptime).
              </p>
            </div>

            {/* Import/Export Section */}
            <ImportDataSection />
>>>>>>> cf46c6e (Initial commit: project files)
          </AccordionContent>
        </AccordionItem>

        {/* DANGER ZONE */}
        <AccordionItem value="danger-zone" className="bg-card border-2 border-destructive/50 rounded-xl overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span className="font-semibold text-destructive">Danger Zone</span>
            </div>
          </AccordionTrigger>
<<<<<<< HEAD
          <AccordionContent className="px-4 pb-4">
            <DangerZoneSection
              profile={profile ?? undefined}
              xpInput={xpInput}
              onXpInputChange={setXpInput}
              onLevelChange={handleLevelChange}
              onSetXP={handleSetXP}
              onResetRound={handleResetRound}
              onSignOut={signOut}
            />
=======
          <AccordionContent className="px-4 pb-4 space-y-4">
            {profile && (
              <>
                {/* Level Manager */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Level: {profile.level}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleLevelChange(-1)}
                      disabled={profile.level <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleLevelChange(1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* XP Manager */}
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder={`Current: ${profile.xp} XP`}
                    value={xpInput}
                    onChange={(e) => setXpInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={handleSetXP}>
                    Set XP
                  </Button>
                </div>
                
                {/* Reset Round */}
                <Button 
                  variant="outline" 
                  className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                  onClick={handleResetRound}
                >
                  Reset Round (XP=0, HP=100)
                </Button>
              </>
            )}

            <Button variant="destructive" className="w-full justify-start gap-2" onClick={signOut}>
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
>>>>>>> cf46c6e (Initial commit: project files)
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <HabitFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        habit={editingHabit}
        onSubmit={handleSubmitHabit}
        isLoading={createHabit.isPending || updateHabit.isPending}
      />

<<<<<<< HEAD
=======
      <HabitTemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
      />

>>>>>>> cf46c6e (Initial commit: project files)
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes all history for this habit. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteHabit} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
