#!/usr/bin/env python3
"""
CSV to JSON Converter for Life OS Export
Converts the CSV backup into JSON format expected by the import feature
"""

import csv
import json
import sys
from datetime import datetime
from pathlib import Path

def parse_frequency(freq_str):
    """Convert frequency string to array of day numbers"""
    if not freq_str or freq_str == 'Daily':
        return [0, 1, 2, 3, 4, 5, 6]
    elif freq_str == 'Always':
        return [0, 1, 2, 3, 4, 5, 6]
    elif '|' in freq_str:
        return [int(d) for d in freq_str.split('|')]
    return [0, 1, 2, 3, 4, 5, 6]

def convert_date(date_str):
    """Convert DD-MM-YYYY to YYYY-MM-DD"""
    if not date_str or len(date_str) < 8:
        return None
    try:
        parts = date_str.split('-')
        if len(parts) == 3:
            return f"{parts[2]}-{parts[1]}-{parts[0]}"
    except:
        pass
    return None

def csv_to_json(csv_path, json_path):
    """Convert CSV export to JSON format"""
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    
    # Initialize output structure
    output = {
        'version': '1.0',
        'profile': None,
        'habits': [],
        'habit_logs': [],
        'tasks': [],
        'daily_summaries': [],
        'metric_logs': []
    }
    
    # Parse sections
    current_section = None
    headers = []
    habit_title_to_id = {}
    
    for i, line in enumerate(lines):
        line = line.strip()
        
        # Section markers
        if '=== PROFILE ===' in line:
            current_section = 'PROFILE'
            headers = []
            continue
        elif '=== HABITS ===' in line:
            current_section = 'HABITS'
            headers = []
            continue
        elif '=== HABIT LOGS ===' in line:
            current_section = 'HABIT_LOGS'
            headers = []
            continue
        elif '=== TASKS ===' in line:
            current_section = 'TASKS'
            headers = []
            continue
        elif '=== DAILY SUMMARIES ===' in line:
            current_section = 'DAILY_SUMMARIES'
            headers = []
            continue
        elif '=== METRICS ===' in line:
            current_section = 'METRICS'
            headers = []
            continue
        
        # Skip empty lines
        if not line:
            continue
        
        # Parse CSV row
        row = []
        in_quotes = False
        current = ''
        
        for j, char in enumerate(line):
            if char == '"':
                if in_quotes and j + 1 < len(line) and line[j + 1] == '"':
                    current += '"'
                else:
                    in_quotes = not in_quotes
            elif char == ',' and not in_quotes:
                row.append(current.strip())
                current = ''
            else:
                current += char
        row.append(current.strip())
        
        # Skip if line is empty or all cells are empty
        if not any(row):
            continue
        
        # Set headers if first data row
        if current_section and not headers and not row[0].startswith('==='):
            headers = row
            continue
        
        # Skip if no headers yet
        if not headers:
            continue
        
        # Parse PROFILE
        if current_section == 'PROFILE' and len(row) >= 5:
            output['profile'] = {
                'level': int(row[0]) if row[0] else 1,
                'xp': int(row[1]) if row[1] else 0,
                'hp': int(row[2]) if row[2] else 100,
                'max_hp': int(row[3]) if row[3] else 100,
                'day_start_hour': int(row[4]) if row[4] else 4,
            }
        
        # Parse HABITS
        elif current_section == 'HABITS' and len(row) >= 5 and row[0]:
            habit_id = f"habit_{len(output['habits'])}"
            habit_title = row[0]
            habit_type = row[1]
            frequency_str = row[2]
            xp_reward = row[3]
            
            habit_title_to_id[habit_title] = habit_id
            
            output['habits'].append({
                'id': habit_id,
                'title': habit_title,
                'description': row[4] if row[4] else None,
                'frequency_days': parse_frequency(frequency_str),
                'sort_order': len(output['habits']),
                'archived': row[5].lower() == 'yes' if row[5] else False,
                'is_bad_habit': habit_type.lower() == 'resistance',
                'xp_reward': int(xp_reward) if xp_reward else 10,
            })
        
        # Parse HABIT LOGS
        elif current_section == 'HABIT_LOGS' and len(row) >= 3 and row[0]:
            habit_title = row[0]
            habit_id = habit_title_to_id.get(habit_title)
            
            if habit_id:
                date = convert_date(row[1])
                if date:
                    output['habit_logs'].append({
                        'habit_id': habit_id,
                        'date': date,
                        'status': row[2].lower() if row[2] else 'skipped',
                    })
        
        # Parse TASKS
        elif current_section == 'TASKS' and len(row) >= 7 and row[0]:
            completed_date = None
            if row[3]:
                completed_date = row[3].split('T')[0]
            
            due_date = convert_date(row[5])
            
            output['tasks'].append({
                'title': row[0],
                'priority': row[1].lower() if row[1] else 'medium',
                'completed': row[2].lower() == 'yes',
                'completed_at': completed_date,
                'is_for_today': row[4].lower() == 'yes' if row[4] else False,
                'due_date': due_date,
                'archived': row[6].lower() == 'yes' if row[6] else False,
            })
        
        # Parse DAILY SUMMARIES
        elif current_section == 'DAILY_SUMMARIES' and row[0]:
            date = convert_date(row[0])
            if date:
                output['daily_summaries'].append({
                    'date': date,
                    'mood_score': int(row[1]) if row[1] else None,
                    'notes': row[2] if row[2] else None,
                    'xp_earned': int(row[3]) if row[3] else 0,
                    'hp_lost': int(row[4]) if row[4] else 0,
                })
        
        # Parse METRICS
        elif current_section == 'METRICS' and len(row) >= 3 and row[0]:
            date = convert_date(row[1])
            if date:
                output['metric_logs'].append({
                    'metric_id': row[0],
                    'date': date,
                    'value': float(row[2]) if row[2] else 0,
                })
    
    # Write JSON
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2)
    
    # Print summary
    print(f"✅ Conversion complete!")
    print(f"   Profile: Level {output['profile'].get('level', 1)}, XP: {output['profile'].get('xp', 0)}")
    print(f"   Habits: {len(output['habits'])}")
    print(f"   Habit Logs: {len(output['habit_logs'])}")
    print(f"   Tasks: {len(output['tasks'])}")
    print(f"   Daily Summaries: {len(output['daily_summaries'])}")
    print(f"   Metric Logs: {len(output['metric_logs'])}")
    print(f"   Output: {json_path}")

if __name__ == '__main__':
    csv_path = sys.argv[1] if len(sys.argv) > 1 else 'backup.csv'
    json_path = sys.argv[2] if len(sys.argv) > 2 else 'backup.json'
    
    if not Path(csv_path).exists():
        print(f"❌ CSV file not found: {csv_path}")
        sys.exit(1)
    
    try:
        csv_to_json(csv_path, json_path)
    except Exception as e:
        print(f"❌ Conversion failed: {e}")
        sys.exit(1)
