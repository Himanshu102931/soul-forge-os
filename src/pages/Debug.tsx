import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function Debug() {
  const { user } = useAuth();
  const [output, setOutput] = useState<string[]>([]);

  const log = (message: string) => {
    setOutput(prev => [...prev, message]);
    console.log(message);
  };

  const runDiagnostics = async () => {
    setOutput([]);
    log('🔍 Starting diagnostics...\n');

    // 1. Check user authentication
    log(`✅ User authenticated: ${user?.email || 'Not logged in'}`);
    log(`   User ID: ${user?.id || 'N/A'}\n`);

    if (!user) {
      log('❌ Not logged in! Please log in first.');
      return;
    }

    // 2. Check profile
    try {
      log('📊 Checking profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        log(`❌ Profile error: ${profileError.message}`);
      } else if (!profile) {
        log('❌ No profile found! Creating one...');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: user.id });
        if (insertError) {
          log(`❌ Failed to create profile: ${insertError.message}`);
        } else {
          log('✅ Profile created!');
        }
      } else {
        log(`✅ Profile exists: Level ${profile.level}, XP ${profile.xp}, HP ${profile.hp}/${profile.max_hp}\n`);
      }
    } catch (err) {
      log(`❌ Profile check failed: ${err}`);
    }

    // 3. Check habits table structure
    try {
      log('📋 Checking habits table structure...');
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .limit(1);

      if (habitsError) {
        log(`❌ Habits query error: ${habitsError.message}`);
        log(`   Code: ${habitsError.code}`);
        log(`   Details: ${habitsError.details}`);
        log(`   Hint: ${habitsError.hint}\n`);
      } else {
        log(`✅ Habits table accessible`);
        if (habits && habits.length > 0) {
          log(`   Sample habit columns: ${Object.keys(habits[0]).join(', ')}\n`);
        } else {
          log(`   No habits found\n`);
        }
      }
    } catch (err) {
      log(`❌ Habits check failed: ${err}\n`);
    }

    // 4. Try to create a test habit
    try {
      log('🧪 Attempting to create test habit...');
      const { data: newHabit, error: createError } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          title: 'TEST HABIT - DELETE ME',
          description: 'Diagnostic test habit',
          frequency_days: [0, 1, 2, 3, 4, 5, 6],
          xp_reward: 10,
          sort_order: 999,
          archived: false,
          is_bad_habit: false,
        })
        .select()
        .single();

      if (createError) {
        log(`❌ CREATE ERROR: ${createError.message}`);
        log(`   Code: ${createError.code}`);
        log(`   Details: ${createError.details}`);
        log(`   Hint: ${createError.hint}\n`);
      } else {
        log(`✅ Test habit created successfully!`);
        log(`   ID: ${newHabit?.id}`);
        log(`   Title: ${newHabit?.title}\n`);

        // Delete test habit
        const { error: deleteError } = await supabase
          .from('habits')
          .delete()
          .eq('id', newHabit.id);

        if (deleteError) {
          log(`⚠️ Failed to delete test habit: ${deleteError.message}`);
        } else {
          log(`✅ Test habit deleted\n`);
        }
      }
    } catch (err) {
      log(`❌ Create habit test failed: ${err}\n`);
    }

    // 5. Check RLS policies
    try {
      log('🔒 Checking RLS policies...');
      const { data: habits, error } = await supabase
        .from('habits')
        .select('id, title')
        .eq('user_id', user.id);

      if (error) {
        log(`❌ RLS check failed: ${error.message}\n`);
      } else {
        log(`✅ RLS policies working - ${habits?.length || 0} habits found\n`);
      }
    } catch (err) {
      log(`❌ RLS test failed: ${err}\n`);
    }

    log('✅ Diagnostics complete!');
  };

  useEffect(() => {
    if (user) {
      runDiagnostics();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">🔧 Debug Dashboard</h1>
        <p className="text-muted-foreground mb-6">
          Diagnostic information for troubleshooting app issues
        </p>

        <Button onClick={runDiagnostics} className="mb-6">
          🔄 Re-run Diagnostics
        </Button>

        <div className="bg-card border border-border rounded-lg p-6">
          <pre className="text-sm font-mono whitespace-pre-wrap">
            {output.join('\n') || 'Click "Re-run Diagnostics" to start...'}
          </pre>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h2 className="font-semibold mb-2">🛠️ Common Issues:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>No profile found:</strong> Try logging out and back in</li>
            <li><strong>RLS policy error:</strong> Database needs migration update</li>
            <li><strong>Column doesn't exist:</strong> Missing migration - contact developer</li>
            <li><strong>Slow loading:</strong> Clear browser cache, check network tab</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
