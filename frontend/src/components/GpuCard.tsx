import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { parseTemperature, getTemperatureColor } from '../api/client';

interface GPUMetrics {
  name: string;
  memory?: string;
  temperature?: string;
  utilization?: string;
}

interface GpuCardProps {
  metrics: GPUMetrics;
}

export default function GpuCard({ metrics }: GpuCardProps) {
  const temp = parseTemperature(metrics.temperature);
  const tempColor = getTemperatureColor(temp);

  // If GPU name is "N/A", show grayed out card
  if (metrics.name === 'N/A') {
    return (
      <Card sx={{ opacity: 0.6 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
            GPU
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No GPU detected
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          GPU
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {metrics.name}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {metrics.memory && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Memory
              </Typography>
              <Chip label={metrics.memory} />
            </Box>
          )}

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

          {metrics.utilization && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Utilization
              </Typography>
              <Chip label={metrics.utilization} />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

