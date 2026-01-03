import { motion } from 'framer-motion';
import { format, addDays } from 'date-fns';
import { HabitWithStats } from '@/types/habit';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface PerformanceTrendProps {
  habits: HabitWithStats[];
  startDate: Date;
  daysCount?: number;
}

export const PerformanceTrend = ({ habits, startDate, daysCount = 21 }: PerformanceTrendProps) => {
  const data = [];
  
  for (let i = 0; i < daysCount; i++) {
    const date = addDays(startDate, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLabel = format(date, 'MMM d');
    
    let completed = 0;
    habits.forEach(habit => {
      if (habit.completions[dateStr]) {
        completed++;
      }
    });
    
    const rate = habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0;
    
    data.push({
      date: dayLabel,
      day: i + 1,
      rate,
      completed,
      total: habits.length,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg border border-border p-4"
    >
      <h3 className="text-sm font-medium text-foreground mb-4">Daily Performance Trend</h3>
      
      <div className="h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              interval={4}
            />
            <YAxis 
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `${value}%`}
              width={35}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-md p-2 shadow-elevated text-xs">
                      <p className="font-medium text-foreground">{d.date}</p>
                      <p className="text-muted-foreground">
                        {d.completed}/{d.total} habits ({d.rate}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              fill="url(#colorRate)"
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--accent))', strokeWidth: 0, r: 2 }}
              activeDot={{ r: 4, fill: 'hsl(var(--accent))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
