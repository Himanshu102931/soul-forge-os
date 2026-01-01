import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTodayHabits, useUpdateHabitOrder } from '@/hooks/useHabits';
import { HabitButton } from './HabitButton';
import { LoadingList } from '@/components/ui/loading-skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { GripVertical, Sparkles, Shield } from 'lucide-react';
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
}

function SortableHabit({ habit, reorderMode }: SortableHabitProps) {
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
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
        >
          <GripVertical className="w-4 h-4" />
        </button>
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
  const [reorderMode, setReorderMode] = useState(false);

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

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4">
        <LoadingList count={4} showCheckbox className="mt-2" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
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
            <Switch
              id="reorder"
              checked={reorderMode}
              onCheckedChange={setReorderMode}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {todayHabits.map((habit) => (
                    <SortableHabit
                      key={habit.id}
                      habit={habit}
                      reorderMode={reorderMode}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </TabsContent>

        <TabsContent value="bad-habits" className="mt-0">
          {badHabits.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No bad habits configured
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
    </motion.div>
  );
}
