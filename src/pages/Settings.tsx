import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSeedPlan, useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useAllHabits, useArchiveHabit, useCreateHabit, useUpdateHabit, useDeleteHabit, Habit } from '@/hooks/useHabits';
import { useArchivedTasks, useUnarchiveTask } from '@/hooks/useTasks';
import { useDataExport, type DateRangeOption } from '@/hooks/useDataExport';
import { useToast } from '@/hooks/use-toast';
import { loadAIConfig, saveAIConfig, clearAIConfig, type AIConfig } from '@/lib/encryption';
import { testAIConnection } from '@/lib/ai-service';
import { Settings as SettingsIcon, Brain, AlertTriangle, Zap, Sparkles } from 'lucide-react';
import { HabitFormDialog } from '@/components/HabitFormDialog';
import { MySystemSection } from '@/components/settings/MySystemSection';
import { BrainDataSection } from '@/components/settings/BrainDataSection';
import { AIConfigSection } from '@/components/settings/AIConfigSection';
import { AIUsageTab } from '@/components/settings/AIUsageTab';
import { DangerZoneSection } from '@/components/settings/DangerZoneSection';
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
  const [aiConfig, setAIConfig] = useState<AIConfig>(() => loadAIConfig());
  const [aiApiKey, setAiApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  
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
  // AI Configuration handlers
  const handleSaveAIConfig = () => {
    const newConfig: AIConfig = {
      provider: aiConfig.provider,
      apiKey: aiApiKey || aiConfig.apiKey,
      enabled: aiConfig.enabled,
    };
    saveAIConfig(newConfig);
    setAIConfig(newConfig);
    toast({ 
      title: '✨ AI Configuration Saved', 
      description: `${aiConfig.provider} is now ${aiConfig.enabled ? 'enabled' : 'disabled'}` 
    });
  };

  const handleTestConnection = async () => {
    if (!aiApiKey && !aiConfig.apiKey) {
      toast({ 
        title: 'API Key Required', 
        description: 'Please enter an API key first', 
        variant: 'destructive' 
      });
      return;
    }

    setTestingConnection(true);
    try {
      const success = await testAIConnection(
        aiConfig.provider, 
        aiApiKey || aiConfig.apiKey || ''
      );
      
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

  const handleClearAIConfig = () => {
    clearAIConfig();
    setAIConfig({ provider: 'local', enabled: false });
    setAiApiKey('');
    toast({ title: 'AI Config Cleared', description: 'All AI settings have been removed' });
  };
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
    const xp = parseInt(xpInput);
    if (isNaN(xp) || xp < 0) {
      toast({ title: 'Invalid', description: 'Enter a valid positive number', variant: 'destructive' });
      return;
    }
    try {
      await updateProfile.mutateAsync({ xp });
      toast({ title: 'XP Updated', description: `XP set to ${xp}` });
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
              {aiConfig.enabled && (
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
          <AccordionContent className="px-4 pb-4">
            <DangerZoneSection
              profile={profile}
              xpInput={xpInput}
              onXpInputChange={setXpInput}
              onLevelChange={handleLevelChange}
              onSetXP={handleSetXP}
              onResetRound={handleResetRound}
              onSignOut={signOut}
            />
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
