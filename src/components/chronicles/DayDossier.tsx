import { useState } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDaySummary, useDayMetrics } from '@/hooks/useChronicles';
import { Sparkles } from 'lucide-react';
import { OverviewTab } from './tabs/OverviewTab';
import { JournalTab } from './tabs/JournalTab';
import { HabitsTab } from './tabs/HabitsTab';
import { VictoriesTab } from './tabs/VictoriesTab';

interface DayDossierProps {
  date: Date | undefined;
  onClose: () => void;
  inline?: boolean;
}

export function DayDossier({ date, onClose, inline }: DayDossierProps) {
  const dateStr = date ? format(date, 'yyyy-MM-dd') : '';
  const { data: summary } = useDaySummary(dateStr);

  if (!date) return null;

  const content = (
    <>
      <div className="flex items-center justify-between mb-4">
        <span className="flex items-center gap-2 font-semibold">
          <Sparkles className="w-5 h-5 text-primary" />
          {format(date, 'EEEE, MMMM d')}
        </span>
        {summary && (
          <span className="text-sm font-normal text-primary">
            +{summary.xp_earned} XP
          </span>
        )}
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="victories">Victories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab date={dateStr} />
        </TabsContent>

        <TabsContent value="journal" className="mt-4">
          <JournalTab date={dateStr} />
        </TabsContent>

        <TabsContent value="habits" className="mt-4">
          <HabitsTab date={dateStr} />
        </TabsContent>

        <TabsContent value="victories" className="mt-4">
          <VictoriesTab date={dateStr} />
        </TabsContent>
      </Tabs>
    </>
  );

  // Inline mode for desktop
  if (inline) {
    return <div className="hidden lg:block">{content}</div>;
  }

  // Dialog mode for mobile
  return (
    <Dialog open={!!date} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {format(date, 'EEEE, MMMM d, yyyy')}
            </span>
            {summary && (
              <span className="text-sm font-normal text-primary">
                +{summary.xp_earned} XP
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="journal">Journal</TabsTrigger>
            <TabsTrigger value="habits">Habits</TabsTrigger>
            <TabsTrigger value="victories">Victories</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <OverviewTab date={dateStr} />
          </TabsContent>

          <TabsContent value="journal" className="mt-4">
            <JournalTab date={dateStr} />
          </TabsContent>

          <TabsContent value="habits" className="mt-4">
            <HabitsTab date={dateStr} />
          </TabsContent>

          <TabsContent value="victories" className="mt-4">
            <VictoriesTab date={dateStr} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
