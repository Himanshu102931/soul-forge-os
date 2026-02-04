import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTodayHabits, useUpdateHabitOrder } from '@/hooks/useHabits';
import { HabitButton } from './HabitButton';
<<<<<<< HEAD
import { LoadingList } from '@/components/ui/loading-skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { GripVertical, Sparkles, Shield } from 'lucide-react';
=======
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { GripVertical, Sparkles, Shield, Pencil } from 'lucide-react';
import { HabitFormDialog } from './HabitFormDialog';
import { useUpdateHabit } from '@/hooks/useHabits';
import { useToast } from '@/hooks/use-toast';
>>>>>>> cf46c6e (Initial commit: project files)
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { HabitWithLog } from '@/hooks/useHabits';

interface SortableHabitProps {
  habit: HabitWithLog;
  reorderMode: boolean;
<<<<<<< HEAD
}

function SortableHabit({ habit, reorderMode }: SortableHabitProps) {
=======
  onEdit: (habit: HabitWithLog) => void;
}

function SortableHabit({ habit, reorderMode, onEdit }: SortableHabitProps) {
>>>>>>> cf46c6e (Initial commit: project files)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2',
        isDragging && 'z-50 opacity-80'
      )}
    >
      {reorderMode && (
<<<<<<< HEAD
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
        >
          <GripVertical className="w-4 h-4" />
        </button>
=======
        <>
          <button
            {...attributes}
            {...listeners}
            className="p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'none' }}
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => onEdit(habit)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
        </>
>>>>>>> cf46c6e (Initial commit: project files)
      )}
      <div className="flex-1">
        <HabitButton habit={habit} />
      </div>
    </div>
  );
}

export function HabitTracker() {
  const { todayHabits, badHabits, isLoading } = useTodayHabits();
  const updateOrder = useUpdateHabitOrder();
<<<<<<< HEAD
  const [reorderMode, setReorderMode] = useState(false);
=======
  const updateHabit = useUpdateHabit();
  const { toast } = useToast();
  const [reorderMode, setReorderMode] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitWithLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
>>>>>>> cf46c6e (Initial commit: project files)

  // Configure sensors for both mouse and touch with mobile-friendly settings
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms press-and-hold before drag
        tolerance: 5, // 5px movement tolerance during delay
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent, habits: HabitWithLog[]) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = habits.findIndex(h => h.id === active.id);
      const newIndex = habits.findIndex(h => h.id === over.id);
      const newHabits = arrayMove(habits, oldIndex, newIndex);

      updateOrder.mutate(
        newHabits.map((h, i) => ({ id: h.id, sort_order: i }))
      );
    }
  };

<<<<<<< HEAD
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4">
        <LoadingList count={4} showCheckbox className="mt-2" />
=======
  const handleEditHabit = (habit: HabitWithLog) => {
    setEditingHabit(habit);
    setDialogOpen(true);
  };

  const handleSubmitHabit = async (data: {
    title: string;
    description: string | null;
    frequency_days: number[];
    xp_reward: number;
    is_bad_habit: boolean;
    category: 'health' | 'productivity' | 'social' | 'learning' | 'wellness' | 'other';
  }) => {
    if (!editingHabit) return;
    
    try {
      await updateHabit.mutateAsync({
        id: editingHabit.id,
        ...data,
      });
      toast({ title: 'Success', description: 'Habit updated!' });
      setDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update habit', variant: 'destructive' });
    }
  };

  const lastUpdated = todayHabits && todayHabits.length > 0 && todayHabits[0].updated_at ? new Date(todayHabits[0].updated_at) : null;
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-40 bg-muted rounded animate-pulse" />
          <div className="h-10 w-24 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-muted rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
              <div className="w-12 h-6 bg-muted rounded shrink-0" />
            </div>
          ))}
        </div>
>>>>>>> cf46c6e (Initial commit: project files)
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
<<<<<<< HEAD
      className="bg-card border border-border rounded-xl p-4"
    >
      <Tabs defaultValue="good-habits" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-secondary">
            <TabsTrigger value="good-habits" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Good Habits
            </TabsTrigger>
            <TabsTrigger value="bad-habits" className="gap-2">
              <Shield className="w-4 h-4" />
              Bad Habits
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
=======
      className="bg-card border border-border rounded-xl p-3 md:p-4"
    >
      <Tabs defaultValue="protocols" className="w-full" aria-label="Habit Tracker Tabs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <TabsList className="bg-secondary w-full sm:w-auto">
            <TabsTrigger value="protocols" className="gap-2 flex-1 sm:flex-initial min-h-[60px]" aria-label="Protocols Habits Tab">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Protocols</span>
            </TabsTrigger>
            <TabsTrigger value="resistance" className="gap-2 flex-1 sm:flex-initial min-h-[60px]" aria-label="Resistance Habits Tab">
              <Shield className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Resistance</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full sm:w-auto">
>>>>>>> cf46c6e (Initial commit: project files)
            <Switch
              id="reorder"
              checked={reorderMode}
              onCheckedChange={setReorderMode}
<<<<<<< HEAD
            />
            <Label htmlFor="reorder" className="text-xs text-muted-foreground">
              Reorder
            </Label>
          </div>
        </div>

        <TabsContent value="good-habits" className="mt-0">
          {todayHabits.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No good habits for today
=======
              aria-label="Toggle habit reorder mode"
            />
            <Label htmlFor="reorder" className="text-xs sm:text-sm cursor-pointer">
              Reorder
            </Label>
            {!reorderMode && todayHabits && todayHabits.length > 1 && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                💡 Drag to reorder
              </span>
            )}
          </div>
        </div>

        <TabsContent value="protocols" className="mt-0">
          {todayHabits.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No protocols for today
>>>>>>> cf46c6e (Initial commit: project files)
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => handleDragEnd(e, todayHabits)}
            >
              <SortableContext
                items={todayHabits.map(h => h.id)}
                strategy={verticalListSortingStrategy}
              >
<<<<<<< HEAD
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
=======
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2" aria-label="Sortable Habits List">
>>>>>>> cf46c6e (Initial commit: project files)
                  {todayHabits.map((habit) => (
                    <SortableHabit
                      key={habit.id}
                      habit={habit}
                      reorderMode={reorderMode}
<<<<<<< HEAD
=======
                      onEdit={handleEditHabit}
>>>>>>> cf46c6e (Initial commit: project files)
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </TabsContent>

<<<<<<< HEAD
        <TabsContent value="bad-habits" className="mt-0">
          {badHabits.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No bad habits configured
=======
        <TabsContent value="resistance" className="mt-0">
          {badHabits.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No resistance habits configured
>>>>>>> cf46c6e (Initial commit: project files)
            </div>
          ) : (
            <div className="space-y-2">
              {badHabits.map((habit) => (
                <HabitButton key={habit.id} habit={habit} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
<<<<<<< HEAD
=======

      {/* Edit Habit Dialog */}
      <HabitFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        habit={editingHabit}
        onSubmit={handleSubmitHabit}
        isLoading={updateHabit.isPending}
      />
      {lastUpdated && (
        <div className="text-right text-xs text-muted-foreground mt-1">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}
>>>>>>> cf46c6e (Initial commit: project files)
    </motion.div>
  );
}
