import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type DateRangeOption = '7days' | '30days' | '3months' | 'all' | 'custom';

export interface ExportOptions {
  dateRange: DateRangeOption;
  customStartDate?: string;
  customEndDate?: string;
  format: 'json' | 'csv';
}

interface ExportData {
  profile: Record<string, unknown>;
  habits: Array<Record<string, unknown>>;
  habitLogs: Array<Record<string, unknown>>;
  tasks: Array<Record<string, unknown>>;
  dailySummaries: Array<Record<string, unknown>>;
  metrics: Array<Record<string, unknown>>;
  exportedAt: string;
  dateRange: {
    from: string;
    to: string;
  };
}

export function useDataExport() {
  const { user } = useAuth();
  const { toast } = useToast();

  const getDateRange = (option: DateRangeOption, customStart?: string, customEnd?: string) => {
    const today = new Date();
    let startDate: Date;
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    switch (option) {
      case '7days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '3months':
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'custom':
        startDate = new Date(customStart || today);
        if (customEnd) {
          const custom = new Date(customEnd);
          custom.setHours(23, 59, 59, 999);
          return {
            from: startDate.toISOString().split('T')[0],
            to: custom.toISOString().split('T')[0],
          };
        }
        break;
      case 'all':
      default:
        startDate = new Date('2000-01-01');
    }

    return {
      from: startDate.toISOString().split('T')[0],
      to: endDate.toISOString().split('T')[0],
    };
  };

  const fetchAllData = async (options: ExportOptions): Promise<ExportData> => {
    if (!user) throw new Error('Not authenticated');

    const dateRange = getDateRange(
      options.dateRange,
      options.customStartDate,
      options.customEndDate
    );

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    // Fetch all habits
    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order');

    if (habitsError) throw habitsError;

    // Fetch habit logs in date range
    const { data: habitLogs, error: logsError } = await supabase
      .from('habit_logs')
      .select('*')
      .in('habit_id', habits?.map(h => h.id) || [])
      .gte('date', dateRange.from)
      .lte('date', dateRange.to)
      .order('date', { ascending: false });

    if (logsError) throw logsError;

    // Fetch all tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (tasksError) throw tasksError;

    // Fetch daily summaries in date range
    const { data: dailySummaries, error: summariesError } = await supabase
      .from('daily_summaries')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', dateRange.from)
      .lte('date', dateRange.to)
      .order('date', { ascending: false });

    if (summariesError) throw summariesError;

    // Fetch metrics in date range
    const { data: metrics, error: metricsError } = await supabase
      .from('metric_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', dateRange.from)
      .lte('date', dateRange.to)
      .order('date', { ascending: false });

    if (metricsError) throw metricsError;

    return {
      profile,
      habits: habits || [],
      habitLogs: habitLogs || [],
      tasks: tasks || [],
      dailySummaries: dailySummaries || [],
      metrics: metrics || [],
      exportedAt: new Date().toISOString(),
      dateRange,
    };
  };

  const convertToCSV = (data: ExportData): string => {
    const sections: string[] = [];

    // PROFILE SECTION
    sections.push('=== PROFILE ===');
    if (data.profile) {
      const profileHeaders = Object.keys(data.profile);
      sections.push(profileHeaders.join(','));
      sections.push(Object.values(data.profile).map(v => `"${v}"`).join(','));
    }

    // HABITS SECTION
    sections.push('\n=== HABITS ===');
    if (data.habits.length > 0) {
      const habitHeaders = ['id', 'title', 'description', 'type', 'frequency', 'xp_reward', 'archived'];
      sections.push(habitHeaders.join(','));
      data.habits.forEach(habit => {
        const h = habit as Record<string, unknown>;
        const freqStr = Array.isArray(h.frequency_days) ? (h.frequency_days as unknown[]).map(String).join('|') : '';
        sections.push([
          `"${String(h.id)}"`,
          `"${String(h.title)}"`,
          `"${h.description ? String(h.description) : ''}"`,
          h.is_bad_habit ? 'Bad Habit' : 'Good Habit',
          `"${freqStr}"`,
          String(h.xp_reward || 10),
          h.archived ? 'Yes' : 'No',
        ].join(','));
      });
    }

    // HABIT LOGS SECTION
    sections.push('\n=== HABIT LOGS ===');
    if (data.habitLogs.length > 0) {
      sections.push('date,habit_id,status');
      data.habitLogs.forEach(log => {
        const l = log as Record<string, unknown>;
        sections.push(`${String(l.date)},${String(l.habit_id)},${String(l.status)}`);
      });
    }

    // TASKS SECTION
    sections.push('\n=== TASKS ===');
    if (data.tasks.length > 0) {
      sections.push('date,title,priority,completed,due_date,archived');
      data.tasks.forEach(task => {
        const t = task as Record<string, unknown>;
        const createdDate = typeof t.created_at === 'string' ? t.created_at.split('T')[0] : new Date().toISOString().split('T')[0];
        sections.push([
          createdDate,
          `"${String(t.title)}"`,
          String(t.priority),
          t.completed ? 'Yes' : 'No',
          t.due_date ? String(t.due_date) : '',
          t.archived ? 'Yes' : 'No',
        ].join(','));
      });
    }

    // DAILY SUMMARIES SECTION
    sections.push('\n=== DAILY SUMMARIES ===');
    if (data.dailySummaries.length > 0) {
      sections.push('date,mood_score,notes,xp_earned,hp_lost');
      data.dailySummaries.forEach(summary => {
        const s = summary as Record<string, unknown>;
        sections.push([
          String(s.date),
          s.mood_score ? String(s.mood_score) : '',
          `"${s.notes ? String(s.notes) : ''}"`,
          String(s.xp_earned),
          String(s.hp_lost),
        ].join(','));
      });
    }

    // METRICS SECTION
    sections.push('\n=== METRICS ===');
    if (data.metrics.length > 0) {
      sections.push('date,metric_id,value');
      data.metrics.forEach(metric => {
        const m = metric as Record<string, unknown>;
        sections.push(`${String(m.date)},${String(m.metric_id)},${String(m.value)}`);
      });
    }

    sections.push(`\n\nExported at: ${data.exportedAt}`);
    sections.push(`Date range: ${data.dateRange.from} to ${data.dateRange.to}`);

    return sections.join('\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return useMutation({
    mutationFn: async (options: ExportOptions) => {
      const data = await fetchAllData(options);

      const timestamp = new Date()
        .toISOString()
        .split('T')[0];
      const dateRangeSuffix =
        options.dateRange === 'custom'
          ? `${options.customStartDate}_${options.customEndDate}`
          : options.dateRange;

      if (options.format === 'json') {
        const filename = `life-os-export-${dateRangeSuffix}-${timestamp}.json`;
        const jsonString = JSON.stringify(data, null, 2);
        downloadFile(jsonString, filename, 'application/json');
      } else {
        const filename = `life-os-export-${dateRangeSuffix}-${timestamp}.csv`;
        const csvString = convertToCSV(data);
        downloadFile(csvString, filename, 'text/csv');
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Export Successful',
        description: 'Your data has been downloaded',
      });
    },
    onError: (error) => {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export data',
        variant: 'destructive',
      });
    },
  });
}
