import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Grid3x3, LayoutList } from 'lucide-react';
import { AchievementOverview } from '@/components/achievements/AchievementOverview';
import { AchievementGrid } from '@/components/achievements/AchievementGrid';

export default function Achievements() {
  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-lg sm:text-xl font-bold">Achievements</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Track your milestones and unlock rewards</p>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutList className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <Grid3x3 className="w-4 h-4" />
            All Achievements
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <AchievementOverview />
        </TabsContent>

        {/* All Achievements Tab */}
        <TabsContent value="all" className="space-y-6">
          <AchievementGrid />
        </TabsContent>
      </Tabs>
    </div>
  );
}
