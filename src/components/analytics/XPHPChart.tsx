import { useXPHPTrends } from '@/hooks/useAnalytics';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatDateShort } from '@/lib/time-utils';
import { Zap, Heart } from 'lucide-react';

export function XPHPChart() {
  const { data: trends, isLoading } = useXPHPTrends(30);

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 md:p-6">
        <div className="h-64 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading trends...</div>
        </div>
      </div>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 md:p-6">
        <h3 className="font-semibold mb-4 text-base md:text-lg">XP & HP Trends</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-yellow-500" />
        <h3 className="font-semibold text-base md:text-lg">XP & HP Trends (Last 30 Days)</h3>
      </div>

      <div className="h-64 w-full overflow-x-auto -mx-4 px-4">
        <div className="min-w-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends}>
              <XAxis 
                dataKey="date" 
                tickFormatter={(v) => formatDateShort(v)}
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
              />
              <YAxis 
                yAxisId="left"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                label={{ value: 'XP', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                label={{ value: 'HP', angle: 90, position: 'insideRight', style: { fontSize: 12 } }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'XP') return [value, 'XP'];
                  if (name === 'HP') return [value, 'HP'];
                  return [value, name];
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="line"
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="xp" 
                name="XP"
                stroke="#eab308"
                strokeWidth={2}
                dot={false}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="hp" 
                name="HP"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          <div>
            <div className="text-xs text-muted-foreground">Current XP</div>
            <div className="text-lg font-bold">{trends[trends.length - 1]?.xp || 0}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-500" />
          <div>
            <div className="text-xs text-muted-foreground">Current HP</div>
            <div className="text-lg font-bold">{trends[trends.length - 1]?.hp || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
