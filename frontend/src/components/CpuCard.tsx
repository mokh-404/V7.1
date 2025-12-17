import { Card, CardContent, Typography, Box, LinearProgress, Chip } from '@mui/material';
import { parseTemperature, getTemperatureColor } from '../api/client';

interface CpuMetrics {
  model: string;
  cores: number;
  usage: number;
  load_avg?: string;
  temperature?: string;
}

interface CpuCardProps {
  metrics: CpuMetrics;
}

export default function CpuCard({ metrics }: CpuCardProps) {
  const temp = parseTemperature(metrics.temperature);
  const tempColor = getTemperatureColor(temp);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          CPU
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {metrics.model}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cores: {metrics.cores}
          </Typography>
          {metrics.load_avg && (
            <Typography variant="body2" color="text.secondary">
              Load Average: {metrics.load_avg}
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Usage</Typography>
            <Typography variant="body2" fontWeight="bold">
              {metrics.usage.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(metrics.usage, 100)}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: 'rgba(255,255,255,0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: metrics.usage > 80 ? '#f44336' : '#4caf50',
              },
            }}
          />
        </Box>

        {metrics.temperature && (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Temperature
            </Typography>
            <Chip
              label={metrics.temperature}
              sx={{
                backgroundColor: tempColor,
                color: '#fff',
                fontWeight: 'bold',
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

