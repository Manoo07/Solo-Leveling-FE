import { useMemo } from 'react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWeeklyProgress } from '@/hooks/api/useWeeklyProgress';
import { TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface WeeklyProgressChartProps {
  startDate?: Date;
  endDate?: Date;
}

export const WeeklyProgressChart = ({ startDate, endDate }: WeeklyProgressChartProps) => {
  // Format dates for API if provided
  const apiParams = useMemo(() => {
    if (!startDate || !endDate) return undefined;
    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
    };
  }, [startDate, endDate]);

  const { data, isLoading, error } = useWeeklyProgress(apiParams);

  const chartData = useMemo(() => {
    if (!data?.weekData) return [];
    return data.weekData.map(day => ({
      day: day.dayShort,
      date: day.date,
      Total: day.total,
      Completed: day.completed,
      isToday: day.isToday,
      isFuture: day.isFuture,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Weekly Progress
          </CardTitle>
          <CardDescription>This week's completion trend</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Unable to load weekly progress data
          </div>
        </CardContent>
      </Card>
    );
  }

  const summary = data?.summary;

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          Weekly Progress
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {summary ? (
            <span className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1">
              <span className="whitespace-nowrap">{summary.weekStart} to {summary.weekEnd}</span>
              <span className="hidden sm:inline">·</span>
              <span className="whitespace-nowrap">Completion rate: <span className="font-semibold text-foreground">{summary.completionRate}%</span></span>
            </span>
          ) : (
            'This week\'s completion trend'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ResponsiveContainer width="100%" height={280} className="sm:h-[300px]">
          <LineChart 
            data={chartData} 
            margin={{ 
              top: 5, 
              right: 5, 
              left: -20, 
              bottom: 5 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="day" 
              className="text-[10px] sm:text-xs text-muted-foreground"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              tickLine={false}
            />
            <YAxis 
              className="text-[10px] sm:text-xs text-muted-foreground"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              tickLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                color: 'hsl(var(--popover-foreground))',
                fontSize: '12px',
                padding: '8px 10px',
              }}
              labelStyle={{ fontSize: '12px', marginBottom: '4px' }}
              itemStyle={{ fontSize: '11px', padding: '2px 0' }}
              labelFormatter={(value, payload) => {
                const item = payload[0]?.payload;
                return item?.isToday ? `${value} (Today)` : value;
              }}
              formatter={(value: number, name: string) => [value, name === 'Total' ? 'Total Possible' : name]}
            />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '12px',
                fontSize: '11px',
              }}
              iconSize={10}
            />
            <Line
              type="monotone"
              dataKey="Total"
              stroke="#94a3b8"
              strokeWidth={1.5}
              dot={{ fill: '#94a3b8', r: 3 }}
              activeDot={{ r: 5 }}
              name="Total Possible"
            />
            <Line
              type="monotone"
              dataKey="Completed"
              stroke="#10b981"
              strokeWidth={1.5}
              dot={(props) => {
                const { cx, cy, payload } = props;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={payload.isToday ? 5 : 3}
                    fill="#10b981"
                    stroke={payload.isToday ? '#fff' : 'none'}
                    strokeWidth={payload.isToday ? 2 : 0}
                  />
                );
              }}
              activeDot={{ r: 5 }}
              name="Completed"
            />
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>

        {summary && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t">
            <div className="text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Total Possible</p>
              <p className="text-base sm:text-lg font-semibold">{summary.totalPossible}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Completed</p>
              <p className="text-base sm:text-lg font-semibold text-green-600">{summary.totalCompleted}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Active Habits</p>
              <p className="text-base sm:text-lg font-semibold text-blue-600">{summary.activeHabits}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
