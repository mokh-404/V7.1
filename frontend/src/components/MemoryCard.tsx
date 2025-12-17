import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface MemoryMetrics {
  total_gb: number;
  used_gb: number;
  free_gb: number;
  percent: number;
}

interface MemoryCardProps {
  metrics: MemoryMetrics;
}

const COLORS = ['#4caf50', '#2196f3'];

export default function MemoryCard({ metrics }: MemoryCardProps) {
  const data = [
    { name: 'Used', value: metrics.used_gb },
    { name: 'Free', value: metrics.free_gb },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Memory
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Box sx={{ width: '200px', height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" gutterBottom>
              Total: {metrics.total_gb.toFixed(2)} GB
            </Typography>
            <Typography variant="body1" gutterBottom>
              Used: {metrics.used_gb.toFixed(2)} GB
            </Typography>
            <Typography variant="body1" gutterBottom>
              Free: {metrics.free_gb.toFixed(2)} GB
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }} color="primary">
              Usage: {metrics.percent.toFixed(1)}%
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

