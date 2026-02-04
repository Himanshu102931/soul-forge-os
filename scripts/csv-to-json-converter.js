#!/usr/bin/env node

/**
 * CSV to JSON Converter for Life OS Export
 * Converts the CSV backup into the JSON format expected by the import feature
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse CSV file
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const rows = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const row = [];
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

// Find section in CSV
function findSection(rows, sectionName) {
  const startIdx = rows.findIndex(row => row[0] === `=== ${sectionName} ===`);
  if (startIdx === -1) return { headers: [], data: [] };

  const headers = rows[startIdx + 1] || [];
  let endIdx = rows.length;

  for (let i = startIdx + 2; i < rows.length; i++) {
    if (rows[i][0]?.startsWith('===')) {
      endIdx = i;
      break;
    }
  }

  const data = rows.slice(startIdx + 2, endIdx).filter(row => row.some(cell => cell));

  return { headers: headers.filter(h => h), data };
}

// Convert CSV to JSON
function convertCSVtoJSON(csvText) {
  const rows = parseCSV(csvText);

  // Parse PROFILE
  const profileSection = findSection(rows, 'PROFILE');
  let profile = null;

  if (profileSection.data.length > 0) {
    const profileRow = profileSection.data[0];
    profile = {
      level: parseInt(profileRow[0]) || 1,
      xp: parseInt(profileRow[1]) || 0,
      hp: parseInt(profileRow[2]) || 100,
      max_hp: parseInt(profileRow[3]) || 100,
      day_start_hour: parseInt(profileRow[4]) || 4,
    };
  }

  // Parse HABITS
  const habitsSection = findSection(rows, 'HABITS');
  const habits = [];
  const habitTitleToId = {};

  for (const row of habitsSection.data) {
    if (!row[0]) continue;

    const habitId = `habit_${habits.length}`;
    habitTitleToId[row[0]] = habitId;

    // Parse frequency - convert from "Daily" or "1|2|3|4|5|6" to array
    let frequencyDays = [0, 1, 2, 3, 4, 5, 6]; // Default to daily

    if (row[2] && row[2] !== 'Daily') {
      if (row[2].includes('|')) {
        frequencyDays = row[2].split('|').map(d => parseInt(d)).filter(d => !isNaN(d));
      } else if (row[2] === 'Always') {
        frequencyDays = [0, 1, 2, 3, 4, 5, 6];
      }
    }

    habits.push({
      id: habitId,
      title: row[0],
      description: row[4] || null,
      frequency_days: frequencyDays,
      sort_order: habits.length,
      archived: row[5]?.toLowerCase() === 'yes' ? true : false,
      is_bad_habit: row[1]?.toLowerCase() === 'resistance' ? true : false,
      xp_reward: parseInt(row[3]) || 10,
    });
  }

  // Parse HABIT LOGS
  const logsSection = findSection(rows, 'HABIT LOGS');
  const habitLogs = [];

  for (const row of logsSection.data) {
    if (!row[0] || !row[1]) continue;

    const habitTitle = row[0];
    const habitId = habitTitleToId[habitTitle];

    if (!habitId) {
      console.warn(`Warning: Habit "${habitTitle}" not found for log on ${row[1]}`);
      continue;
    }

    // Parse date - convert from DD-MM-YYYY to YYYY-MM-DD
    const dateParts = row[1].split('-');
    if (dateParts.length === 3) {
      const dateStr = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

      habitLogs.push({
        habit_id: habitId,
        date: dateStr,
        status: row[2]?.toLowerCase() || 'skipped',
      });
    }
  }

  // Parse TASKS
  const tasksSection = findSection(rows, 'TASKS');
  const tasks = [];

  for (const row of tasksSection.data) {
    if (!row[0]) continue;

    const completedDate = row[3] ? row[3].split('T')[0] : null;
    const dueDate = row[5] ? row[5].split('-').reverse().join('-') : null;

    tasks.push({
      title: row[0],
      priority: row[1]?.toLowerCase() || 'medium',
      completed: row[2]?.toLowerCase() === 'yes' ? true : false,
      completed_at: completedDate,
      is_for_today: row[4]?.toLowerCase() === 'yes' ? true : false,
      due_date: dueDate,
      archived: row[6]?.toLowerCase() === 'yes' ? true : false,
    });
  }

  // Parse DAILY SUMMARIES
  const summariesSection = findSection(rows, 'DAILY SUMMARIES');
  const dailySummaries = [];

  for (const row of summariesSection.data) {
    if (!row[0]) continue;

    // Convert date from DD-MM-YYYY to YYYY-MM-DD
    const dateParts = row[0].split('-');
    let dateStr = row[0];
    if (dateParts.length === 3) {
      dateStr = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    }

    dailySummaries.push({
      date: dateStr,
      mood_score: row[1] ? parseInt(row[1]) : null,
      notes: row[2] || null,
      xp_earned: parseInt(row[3]) || 0,
      hp_lost: parseInt(row[4]) || 0,
    });
  }

  // Parse METRICS
  const metricsSection = findSection(rows, 'METRICS');
  const metricLogs = [];

  for (const row of metricsSection.data) {
    if (!row[0] || !row[1]) continue;

    // Convert date from DD-MM-YYYY to YYYY-MM-DD
    const dateParts = row[1].split('-');
    let dateStr = row[1];
    if (dateParts.length === 3) {
      dateStr = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    }

    metricLogs.push({
      metric_id: row[0],
      date: dateStr,
      value: parseFloat(row[2]) || 0,
    });
  }

  return {
    version: '1.0',
    profile,
    habits,
    habit_logs: habitLogs,
    tasks,
    daily_summaries: dailySummaries,
    metric_logs: metricLogs,
  };
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const csvPath = process.argv[2] || path.join(__dirname, '..', 'backup.csv');
  const outputPath = process.argv[3] || path.join(__dirname, '..', 'backup.json');

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  try {
    console.log(`📖 Reading CSV from: ${csvPath}`);
    const csvText = fs.readFileSync(csvPath, 'utf-8');

    console.log('🔄 Converting CSV to JSON...');
    const jsonData = convertCSVtoJSON(csvText);

    console.log('💾 Writing JSON to: ' + outputPath);
    fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), 'utf-8');

    console.log('✅ Conversion complete!');
    console.log(`   Profile: Level ${jsonData.profile?.level || 1}, XP: ${jsonData.profile?.xp || 0}`);
    console.log(`   Habits: ${jsonData.habits.length}`);
    console.log(`   Habit Logs: ${jsonData.habit_logs.length}`);
    console.log(`   Tasks: ${jsonData.tasks.length}`);
    console.log(`   Daily Summaries: ${jsonData.daily_summaries.length}`);
    console.log(`   Metric Logs: ${jsonData.metric_logs.length}`);
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    process.exit(1);
  }
}

export { convertCSVtoJSON, parseCSV };
