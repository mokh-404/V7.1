import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';

interface DiskMetrics {
  display?: string;
  percent?: number;
  partitions?: Array<{
    path: string;
    size: string;
    used: string;
    avail: string;
    percent: number;
  }>;
}

interface DiskCardProps {
  metrics: DiskMetrics;
}

export default function DiskCard({ metrics }: DiskCardProps) {
  // Use structured partitions if available, otherwise fallback to basic usage
  const partitions = metrics.partitions || [];

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Disk Usage
        </Typography>

        {partitions.length > 0 ? (
          <Box>
            {partitions.map((disk, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {disk.path} ({disk.size})
                  </Typography>
                  <Typography variant="body2">
                    {disk.used} / {disk.size} ({disk.percent.toFixed(1)}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={disk.percent}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: disk.percent > 90 ? '#f44336' : disk.percent > 70 ? '#ff9800' : '#4caf50',
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        ) : metrics.percent !== undefined ? (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Total Usage</Typography>
              <Typography variant="body2" fontWeight="bold">
                {metrics.percent.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={metrics.percent}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: 'rgba(255,255,255,0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: metrics.percent > 90 ? '#f44336' : '#4caf50',
                },
              }}
            />
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No disk information available
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

