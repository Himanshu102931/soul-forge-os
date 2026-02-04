import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { parseCSVToObjects, toBoolean, toInt, toFloat, toISODate } from '@/lib/csv-utils';

// CSV parsing utility (legacy, kept for backward compatibility)
function parseCSV(text: string): string[][] {
  const lines = text.split('\n');
  const rows: string[][] = [];
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const row: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    row.push(current.trim());
    rows.push(row);
  }
  
  return rows;
}

interface ExportedProfile {
  level: number;
  xp: number;
  hp: number;
  max_hp: number;
  day_start_hour: number;
}

interface ExportedHabit {
  id: string;
  title: string;
  description: string | null;
  frequency_days: number[];
  sort_order: number;
  archived: boolean;
  is_bad_habit: boolean;
  xp_reward: number;
}

interface ExportedHabitLog {
  habit_id: string;
  date: string;
  status: string;
}

interface ExportedTask {
  title: string;
  description?: string | null;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  completed_at?: string | null;
  is_for_today: boolean;
  due_date: string | null;
  archived: boolean;
}

interface ExportedDailySummary {
  date: string;
  mood_score: number | null;
  notes: string | null;
  xp_earned: number;
  hp_lost: number;
  ai_response: string | null;
}

interface ExportedMetricLog {
  metric_id: string;
  date: string;
  value: number;
}

interface ExportedData {
  version: string;
  profile?: ExportedProfile;
  habits?: ExportedHabit[];
  habit_logs?: ExportedHabitLog[];
  tasks?: ExportedTask[];
  daily_summaries?: ExportedDailySummary[];
  metric_logs?: ExportedMetricLog[];
}

export function useDataImport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  /**
   * Parse multi-entity CSV with table_type column.
   * Returns organized data by entity type.
   */
  const parseMultiEntityCSV = (csvText: string): ExportedData => {
    const rows = parseCSVToObjects(csvText);
    if (rows.length === 0) throw new Error('CSV file is empty');

    const data: ExportedData = { version: '1.0' };
    const profiles: Record<string, unknown>[] = [];
    const habits: Record<string, unknown>[] = [];
    const habitLogs: Record<string, unknown>[] = [];
    const tasks: Record<string, unknown>[] = [];
    const summaries: Record<string, unknown>[] = [];
    const metrics: Record<string, unknown>[] = [];

    for (const row of rows) {
      const tableType = row.table_type || '';

      if (tableType === 'profiles') {
        profiles.push({
          level: toInt(row.level, 1),
          xp: toInt(row.xp, 0),
          hp: toInt(row.hp, 100),
          max_hp: toInt(row.max_hp, 100),
          day_start_hour: toInt(row.day_start_hour, 5),
        });
      } else if (tableType === 'habits') {
        const frequencyDaysStr = row.frequency_days || '0|1|2|3|4|5|6';
        const frequencyDays = frequencyDaysStr
          .split('|')
          .map((d: string) => toInt(d.trim(), 0))
          .filter((d: number) => !isNaN(d) && d >= 0 && d <= 6);

        habits.push({
          id: row.id || `csv-${Date.now()}-${Math.random()}`,
          title: row.title,
          description: row.description || null,
          frequency_days: frequencyDays.length > 0 ? frequencyDays : [0, 1, 2, 3, 4, 5, 6],
          sort_order: toInt(row.sort_order, 0),
          archived: toBoolean(row.archived),
          is_bad_habit: toBoolean(row.is_bad_habit),
          xp_reward: toInt(row.xp_reward, 10),
        });
      } else if (tableType === 'habit_logs') {
        habitLogs.push({
          habit_id: row.habit_id,
          date: toISODate(row.date) || row.date,
          status: row.status,
        });
      } else if (tableType === 'tasks') {
        tasks.push({
          title: row.title,
          description: row.description || null,
          priority: row.priority || 'medium',
          completed: toBoolean(row.completed),
          completed_at: toISODate(row.completed_at),
          is_for_today: toBoolean(row.is_for_today),
          due_date: toISODate(row.due_date),
          archived: toBoolean(row.archived),
        });
      } else if (tableType === 'daily_summaries') {
        summaries.push({
          date: toISODate(row.date) || row.date,
          mood_score: row.mood_score ? toInt(row.mood_score) : null,
          notes: row.notes || null,
          xp_earned: toInt(row.xp_earned, 0),
          hp_lost: toInt(row.hp_lost, 0),
          ai_response: row.ai_response || null,
        });
      } else if (tableType === 'metric_logs') {
        metrics.push({
          metric_id: row.metric_id,
          date: toISODate(row.date) || row.date,
          value: toFloat(row.value, 0),
        });
      }
    }

    if (profiles.length > 0) data.profile = profiles[0] as unknown as ExportedProfile;
    if (habits.length > 0) data.habits = habits as unknown as ExportedHabit[];
    if (habitLogs.length > 0) data.habit_logs = habitLogs as unknown as ExportedHabitLog[];
    if (tasks.length > 0) data.tasks = tasks as unknown as ExportedTask[];
    if (summaries.length > 0) data.daily_summaries = summaries as unknown as ExportedDailySummary[];
    if (metrics.length > 0) data.metric_logs = metrics as unknown as ExportedMetricLog[];

    return data;
  };

  const parseCSVToData = (csvText: string, filename: string): { type: string; data: Record<string, unknown> | ExportedData } => {
    const rows = parseCSV(csvText);
    if (rows.length === 0) throw new Error('CSV file is empty');

    const headerRow = rows[0];
    const filenameLC = filename.toLowerCase();

    // CHECK: Is this a multi-entity CSV with table_type column?
    if (headerRow.some(h => h.toLowerCase() === 'table_type')) {
      console.log('Detected multi-entity CSV format with table_type column');
      return { type: 'multi-entity', data: parseMultiEntityCSV(csvText) };
    }

    // 1. PROFILE CSV
    if (filenameLC.includes('profile')) {
      const levelIdx = headerRow.findIndex(h => h.toLowerCase() === 'level');
      const xpIdx = headerRow.findIndex(h => h.toLowerCase() === 'xp');
      const hpIdx = headerRow.findIndex(h => h.toLowerCase() === 'hp');
      const maxHpIdx = headerRow.findIndex(h => h.toLowerCase() === 'max hp');
      const dayStartIdx = headerRow.findIndex(h => h.toLowerCase().includes('day start'));

      if (rows.length > 1) {
        const row = rows[1];
        return {
          type: 'profile',
          data: {
            level: levelIdx !== -1 ? parseInt(row[levelIdx], 10) : undefined,
            xp: xpIdx !== -1 ? parseInt(row[xpIdx], 10) : undefined,
            hp: hpIdx !== -1 ? parseInt(row[hpIdx], 10) : undefined,
            max_hp: maxHpIdx !== -1 ? parseInt(row[maxHpIdx], 10) : undefined,
            day_start_hour: dayStartIdx !== -1 ? parseInt(row[dayStartIdx], 10) : undefined,
          },
        };
      }
    }

    // 2. HABITS CSV
    if (filenameLC.includes('habit') && !filenameLC.includes('log')) {
      const titleIdx = headerRow.findIndex(h => h.toLowerCase() === 'title');
      const typeIdx = headerRow.findIndex(h => h.toLowerCase() === 'type');
      const frequencyIdx = headerRow.findIndex(h => h.toLowerCase() === 'frequency');
      const xpIdx = headerRow.findIndex(h => h.toLowerCase().includes('xp'));
      const descIdx = headerRow.findIndex(h => h.toLowerCase() === 'description');
      const archivedIdx = headerRow.findIndex(h => h.toLowerCase() === 'archived');
      const sortIdx = headerRow.findIndex(h => h.toLowerCase().includes('sort'));

      if (titleIdx === -1) throw new Error('Habits CSV must have "Title" column');

      const habits = [];
      let sortOrder = 0;

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.every(cell => !cell)) continue;

        const title = row[titleIdx]?.trim();
        if (!title) continue;

        const typeStr = row[typeIdx]?.toLowerCase() || 'protocol';
        const isBadHabit = typeStr.includes('resistance');

        let frequencyDays = [0, 1, 2, 3, 4, 5, 6];
        if (frequencyIdx !== -1) {
          const freqStr = row[frequencyIdx]?.trim().toLowerCase() || '';
          if (freqStr === 'daily') {
            frequencyDays = [0, 1, 2, 3, 4, 5, 6];
          } else if (freqStr) {
            const days = freqStr.split('|').map(d => parseInt(d, 10)).filter(d => !isNaN(d));
            if (days.length > 0) frequencyDays = days;
          }
        }

        habits.push({
          id: `csv-${i}-${Date.now()}`,
          title,
          description: descIdx !== -1 ? row[descIdx]?.trim() || null : null,
          frequency_days: frequencyDays,
          sort_order: sortIdx !== -1 ? parseInt(row[sortIdx], 10) : sortOrder++,
          archived: archivedIdx !== -1 ? row[archivedIdx]?.toLowerCase() === 'yes' : false,
          is_bad_habit: isBadHabit,
          xp_reward: xpIdx !== -1 ? parseInt(row[xpIdx], 10) || 10 : 10,
        });
      }

      return { type: 'habits', data: habits as unknown as Record<string, unknown> };
    }

    // 3. HABIT LOGS CSV
    if (filenameLC.includes('habit') && filenameLC.includes('log')) {
      const habitTitleIdx = headerRow.findIndex(h => h.toLowerCase().includes('habit'));
      const dateIdx = headerRow.findIndex(h => h.toLowerCase() === 'date');
      const statusIdx = headerRow.findIndex(h => h.toLowerCase() === 'status');

      if (dateIdx === -1 || statusIdx === -1) throw new Error('Habit Logs CSV must have "Date" and "Status" columns');

      const logs = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.every(cell => !cell)) continue;

        const date = row[dateIdx]?.trim();
        const status = row[statusIdx]?.trim();
        const habitTitle = habitTitleIdx !== -1 ? row[habitTitleIdx]?.trim() : null;

        if (date && status) {
          logs.push({
            date,
            status,
            habitTitle, // Will be used to find the habit ID
          });
        }
      }

      return { type: 'habit_logs', data: logs as unknown as Record<string, unknown> };
    }

    // 4. TASKS CSV
    if (filenameLC.includes('task')) {
      const titleIdx = headerRow.findIndex(h => h.toLowerCase() === 'title');
      const priorityIdx = headerRow.findIndex(h => h.toLowerCase() === 'priority');
      const completedIdx = headerRow.findIndex(h => h.toLowerCase() === 'completed' && !h.toLowerCase().includes('date'));
      const completedDateIdx = headerRow.findIndex(h => h.toLowerCase().includes('completed') && h.toLowerCase().includes('date'));
      const forTodayIdx = headerRow.findIndex(h => h.toLowerCase().includes('for today'));
      const dueIdx = headerRow.findIndex(h => h.toLowerCase().includes('due'));
      const archivedIdx = headerRow.findIndex(h => h.toLowerCase() === 'archived');
      const descIdx = headerRow.findIndex(h => h.toLowerCase() === 'description');

      if (titleIdx === -1) throw new Error('Tasks CSV must have "Title" column');

      const tasks = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.every(cell => !cell)) continue;

        const title = row[titleIdx]?.trim();
        if (!title) continue;

        tasks.push({
          title,
          priority: (priorityIdx !== -1 ? row[priorityIdx]?.toLowerCase() : 'medium') || 'medium',
          completed: completedIdx !== -1 ? row[completedIdx]?.toLowerCase() === 'yes' : false,
          completed_at: completedDateIdx !== -1 ? row[completedDateIdx]?.trim() || null : null,
          is_for_today: forTodayIdx !== -1 ? row[forTodayIdx]?.toLowerCase() === 'yes' : false,
          due_date: dueIdx !== -1 ? row[dueIdx]?.trim() || null : null,
          archived: archivedIdx !== -1 ? row[archivedIdx]?.toLowerCase() === 'yes' : false,
          description: descIdx !== -1 ? row[descIdx]?.trim() || null : null,
        });
      }

      return { type: 'tasks', data: tasks as unknown as Record<string, unknown> };
    }

    // 5. SUMMARIES CSV
    if (filenameLC.includes('summar')) {
      const dateIdx = headerRow.findIndex(h => h.toLowerCase() === 'date');
      const moodIdx = headerRow.findIndex(h => h.toLowerCase().includes('mood'));
      const notesIdx = headerRow.findIndex(h => h.toLowerCase() === 'notes');
      const xpIdx = headerRow.findIndex(h => h.toLowerCase() === 'xp earned');
      const hpIdx = headerRow.findIndex(h => h.toLowerCase() === 'hp lost');

      if (dateIdx === -1) throw new Error('Summaries CSV must have "Date" column');

      const summaries = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.every(cell => !cell)) continue;

        const date = row[dateIdx]?.trim();
        if (!date) continue;

        summaries.push({
          date,
          mood_score: moodIdx !== -1 ? parseInt(row[moodIdx], 10) || null : null,
          notes: notesIdx !== -1 ? row[notesIdx]?.trim() || null : null,
          xp_earned: xpIdx !== -1 ? parseInt(row[xpIdx], 10) || 0 : 0,
          hp_lost: hpIdx !== -1 ? parseInt(row[hpIdx], 10) || 0 : 0,
        });
      }

      return { type: 'daily_summaries', data: summaries as unknown as Record<string, unknown> };
    }

    // 6. METRICS CSV
    if (filenameLC.includes('metric')) {
      const metricIdx = headerRow.findIndex(h => h.toLowerCase().includes('metric'));
      const dateIdx = headerRow.findIndex(h => h.toLowerCase() === 'date');
      const valueIdx = headerRow.findIndex(h => h.toLowerCase() === 'value');

      if (dateIdx === -1 || valueIdx === -1) throw new Error('Metrics CSV must have "Date" and "Value" columns');

      const metrics = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.every(cell => !cell)) continue;

        const date = row[dateIdx]?.trim();
        const value = row[valueIdx]?.trim();
        const metricId = metricIdx !== -1 ? row[metricIdx]?.trim().toLowerCase() : 'unknown';

        if (date && value) {
          metrics.push({
            metric_id: metricId || 'unknown',
            date,
            value: parseFloat(value),
          });
        }
      }

      return { type: 'metric_logs', data: metrics as unknown as Record<string, unknown> };
    }

    throw new Error('Unknown CSV format. Could not detect file type from headers.');
  };

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Not authenticated');

      const text = await file.text();
      let data: ExportedData;

      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        // Parse CSV and detect type
        const { type, data: parsedData } = parseCSVToData(text, file.name);

        // Build ExportedData based on CSV type
        if (type === 'multi-entity') {
          // Already fully parsed
          data = parsedData as ExportedData;
        } else if (type === 'profile') {
          data = {
            version: '1.0',
            profile: parsedData as unknown as ExportedProfile,
          };
        } else if (type === 'habits') {
          data = {
            version: '1.0',
            habits: parsedData as unknown as ExportedHabit[],
          };
        } else if (type === 'habit_logs') {
          data = {
            version: '1.0',
            habit_logs: parsedData as unknown as ExportedHabitLog[],
          };
        } else if (type === 'tasks') {
          data = {
            version: '1.0',
            tasks: parsedData as unknown as ExportedTask[],
          };
        } else if (type === 'daily_summaries') {
          data = {
            version: '1.0',
            daily_summaries: parsedData as unknown as ExportedDailySummary[],
          };
        } else if (type === 'metric_logs') {
          data = {
            version: '1.0',
            metric_logs: parsedData as unknown as ExportedMetricLog[],
          };
        } else {
          throw new Error('Unknown CSV type');
        }
      } else {
        // Parse JSON
        try {
          data = JSON.parse(text);
        } catch (error) {
          throw new Error('Invalid JSON file');
        }
      }

      // Validate structure
      if (!data.profile && !data.habits && !data.tasks && !data.habit_logs && !data.daily_summaries && !data.metric_logs) {
        throw new Error('Invalid export file format - missing required data');
      }

      let importedHabits = 0;
      let importedLogs = 0;
      let importedTasks = 0;
      let importedSummaries = 0;
      let importedMetrics = 0;
      const habitIdMap: Record<string, string> = {};

      // CLEAN START: Delete all old data for this user (except profile)
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('habit_logs').delete() as any).eq('user_id', user.id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('tasks').delete() as any).eq('user_id', user.id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('daily_summaries').delete() as any).eq('user_id', user.id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('metric_logs').delete() as any).eq('user_id', user.id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('habits').delete() as any).eq('user_id', user.id);
        console.log('Cleaned all old data for fresh import');
      } catch (error) {
        console.warn('Error cleaning old data:', error);
      }

      // 1. Import Profile (merge strategy: keep higher values)
      if (data.profile) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (existingProfile) {
          const updates = {
            level: Math.max(existingProfile.level, data.profile.level || 0),
            xp: Math.max(existingProfile.xp, data.profile.xp || 0),
            hp: Math.max(existingProfile.hp, data.profile.hp || 0),
            max_hp: Math.max(existingProfile.max_hp, data.profile.max_hp || 100),
            day_start_hour: data.profile.day_start_hour ?? existingProfile.day_start_hour,
          };

          await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);
        }
      }

      // 2. Import Habits (UPSERT by id if present, else insert new)
      if (data.habits && data.habits.length > 0) {
        console.log(`Importing ${data.habits.length} habits...`);
        for (const habit of data.habits) {
          try {
            const habitToInsert = {
              user_id: user.id,
              title: habit.title,
              description: habit.description,
              frequency_days: habit.frequency_days,
              sort_order: habit.sort_order,
              archived: habit.archived,
              is_bad_habit: habit.is_bad_habit,
              xp_reward: habit.xp_reward,
            };

            // If habit has an ID from export, try to upsert; otherwise insert new
            let newHabit;
            if (habit.id && !habit.id.startsWith('csv-')) {
              // This is a real ID from an export, try to upsert
              const { data: existingHabit } = await supabase
                .from('habits')
                .select('id')
                .eq('id', habit.id)
                .single();

              if (existingHabit) {
                // Update existing
                const { data: updated } = await supabase
                  .from('habits')
                  .update(habitToInsert)
                  .eq('id', habit.id)
                  .select()
                  .single();
                newHabit = updated;
              } else {
                // Insert with the original ID
                const { data: inserted } = await supabase
                  .from('habits')
                  .insert({ ...habitToInsert, id: habit.id })
                  .select()
                  .single();
                newHabit = inserted;
              }
            } else {
              // Insert as new (let DB generate ID)
              const { data: inserted } = await supabase
                .from('habits')
                .insert(habitToInsert)
                .select()
                .single();
              newHabit = inserted;
            }

            if (newHabit) {
              habitIdMap[habit.id] = newHabit.id;
              console.log(`Mapped: ${habit.id} (${habit.title}) → ${newHabit.id}`);
              importedHabits++;
            }
          } catch (error: unknown) {
            console.warn(`Failed to import habit "${habit.title}":`, error);
          }
        }
        console.log('HabitIdMap:', habitIdMap);
      }

      // 3. Import Habit Logs (map to new habit IDs)
      if (data.habit_logs && data.habit_logs.length > 0) {
        console.log(`Processing ${data.habit_logs.length} habit logs...`);
        
        // Get all habits for this user to map by title if needed
        const { data: userHabits } = await supabase
          .from('habits')
          .select('id, title')
          .eq('user_id', user.id);

        const habitTitleMap: Record<string, string> = {};
        if (userHabits) {
          userHabits.forEach(h => {
            habitTitleMap[h.title] = h.id;
          });
          console.log('HabitTitleMap:', habitTitleMap);
        }

        let mappedCount = 0;
        let unmappedCount = 0;
        const logsToInsert = data.habit_logs
          .map(log => {
            // Try to get habit_id from map, or fall back to title matching
            let habitId = habitIdMap[log.habit_id];
            const logWithTitle = log as unknown as Record<string, unknown>;
            if (!habitId && logWithTitle.habitTitle && habitTitleMap[logWithTitle.habitTitle as string]) {
              habitId = habitTitleMap[logWithTitle.habitTitle as string];
            }
            
            if (habitId) {
              mappedCount++;
              const status = (log.status || 'completed') as 'completed' | 'partial' | 'skipped' | 'missed';
              return { habit_id: habitId, date: log.date, status };
            } else {
              unmappedCount++;
              console.warn(`Could not map log: habit_id=${log.habit_id}, date=${log.date}`);
              return null;
            }
          })
          .filter((log): log is { habit_id: string; date: string; status: 'completed' | 'partial' | 'skipped' | 'missed' } => log !== null);

        console.log(`Mapped ${mappedCount} logs, unmapped ${unmappedCount} logs`);

        if (logsToInsert.length > 0) {
          try {
            const { data: insertedLogs, error } = await supabase
              .from('habit_logs')
              .insert(logsToInsert)
              .select();

            if (error) {
              console.error('Habit logs import error:', error);
              throw error;
            }

            if (insertedLogs) {
              importedLogs = insertedLogs.length;
              console.log(`Successfully inserted ${importedLogs} habit logs`);
            }
          } catch (error: unknown) {
          let msg = 'Unknown error';
          if (error instanceof Error) {
            msg = error.message;
          } else if (typeof error === 'object' && error !== null) {
            msg = (error as Record<string, unknown>).message as string || JSON.stringify(error);
          } else {
            msg = String(error);
          }
            console.error('Habit logs import failed:', msg);
            throw new Error(`Failed to import habit logs: ${msg}`);
          }
        }
      }

      // 4. Import Tasks (UPSERT by id if present)
      if (data.tasks && data.tasks.length > 0) {
        const tasksToInsert = data.tasks.map(task => ({
          user_id: user.id,
          title: task.title,
          description: task.description || null,
          priority: task.priority,
          completed: task.completed,
          completed_at: task.completed_at || null,
          is_for_today: task.is_for_today,
          due_date: task.due_date || null,
          archived: task.archived,
        }));

        try {
          const { data: insertedTasks, error } = await supabase
            .from('tasks')
            .insert(tasksToInsert)
            .select();

          if (error) {
            console.error('Tasks import error:', error);
            throw error;
          }

          if (insertedTasks) {
            importedTasks = insertedTasks.length;
          }
        } catch (error: unknown) {
          let msg = 'Unknown error';
          if (error instanceof Error) {
            msg = error.message;
          } else if (typeof error === 'object' && error !== null) {
            msg = (error as Record<string, unknown>).message as string || JSON.stringify(error);
          } else {
            msg = String(error);
          }
          console.error('Tasks import failed:', msg);
          throw new Error(`Failed to import tasks: ${msg}`);
        }
      }

      // 5. Import Daily Summaries (UPSERT by date to prevent duplicates)
      if (data.daily_summaries && data.daily_summaries.length > 0) {
        const summariesToInsert = data.daily_summaries.map(summary => ({
          user_id: user.id,
          date: summary.date,
          mood_score: summary.mood_score,
          notes: summary.notes,
          xp_earned: summary.xp_earned,
          hp_lost: summary.hp_lost,
          ai_response: summary.ai_response || null,
        }));

        try {
          // Upsert by date to avoid duplicates
          const { data: insertedSummaries, error } = await supabase
            .from('daily_summaries')
            .upsert(summariesToInsert, {
              onConflict: 'user_id,date',
            })
            .select();

          if (error) {
            console.error('Daily summaries import error:', error);
            throw error;
          }

          if (insertedSummaries) {
            importedSummaries = insertedSummaries.length;
          }
        } catch (error: unknown) {
          let msg = 'Unknown error';
          if (error instanceof Error) {
            msg = error.message;
          } else if (typeof error === 'object' && error !== null) {
            msg = (error as Record<string, unknown>).message as string || JSON.stringify(error);
          } else {
            msg = String(error);
          }
          console.error('Daily summaries import failed:', msg);
          throw new Error(`Failed to import daily summaries: ${msg}`);
        }
      }

      // 6. Import Metric Logs
      if (data.metric_logs && data.metric_logs.length > 0) {
        const metricsToInsert = data.metric_logs.map(metric => {
          const metricObj = metric as unknown as Record<string, unknown>;
          return {
            user_id: user.id,
            metric_id: String(metricObj.metric_id || ''),
            date: String(metricObj.date || ''),
            value: typeof metricObj.value === 'number' ? metricObj.value : parseFloat(String(metricObj.value || 0)),
          };
        });

        try {
          // Upsert by composite key (user_id, metric_id, date) to avoid duplicates
          const { data: insertedMetrics, error } = await supabase
            .from('metric_logs')
            .upsert(metricsToInsert, {
              onConflict: 'user_id,metric_id,date',
            })
            .select();

          if (error) {
            console.error('Metrics import error details:', {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code,
            });
            throw new Error(`${error.message || 'Unknown error'}`);
          }

          if (insertedMetrics) {
            importedMetrics = insertedMetrics.length;
          }
        } catch (error: unknown) {
          let msg = 'Unknown error';
          if (error instanceof Error) {
            msg = error.message;
          } else if (typeof error === 'object' && error !== null) {
            msg = (error as Record<string, unknown>).message as string || JSON.stringify(error);
          } else {
            msg = String(error);
          }
          console.error('Metrics import failed:', msg);
          throw new Error(`Failed to import metrics: ${msg}`);
        }
      }

      return { importedHabits, importedLogs, importedTasks, importedSummaries, importedMetrics };
    },
    onSuccess: ({ importedHabits, importedLogs, importedTasks, importedSummaries, importedMetrics }) => {
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['all-habits'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['daily-summaries'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });

      const parts = [];
      if (importedHabits > 0) parts.push(`${importedHabits} habits`);
      if (importedLogs > 0) parts.push(`${importedLogs} logs`);
      if (importedTasks > 0) parts.push(`${importedTasks} tasks`);
      if (importedSummaries > 0) parts.push(`${importedSummaries} summaries`);
      if (importedMetrics > 0) parts.push(`${importedMetrics} metrics`);

      toast({
        title: 'Import Successful',
        description: parts.length > 0 
          ? `Imported ${parts.join(', ')}.`
          : 'Data imported successfully.',
      });
    },
    onError: (error: Error) => {
      console.error('Import error:', error);
      toast({
        title: 'Import Failed',
        description: error.message || 'Failed to import data',
        variant: 'destructive',
      });
    },
  });
}
