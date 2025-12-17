import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';

interface DiskMetrics {
  display?: string;
  percent?: number;
  info?: string;
}

interface DiskCardProps {
  metrics: DiskMetrics;
}

export default function DiskCard({ metrics }: DiskCardProps) {
  // Parse disk display string if available
  // Format: "Disks: [/path used/total (percent%)] | ..."
  const parseDisks = () => {
    if (!metrics.display || metrics.display === 'N/A') {
      return [];
    }

    const disks: Array<{ path: string; used: string; total: string; percent: number }> = [];
    const regex = /\[([^\]]+)\]/g;
    let match;

    while ((match = regex.exec(metrics.display)) !== null) {
      const diskStr = match[1];
      // Format: "/path used/total (percent%)"
      const parts = diskStr.match(/^([^\s]+)\s+([^\s]+)\/\(([^)]+)\)/);
      if (parts) {
        const [, path, used, total, percentStr] = parts;
        const percent = parseFloat(percentStr.replace('%', ''));
        disks.push({ path, used, total, percent });
      }
    }

    return disks;
  };

  const disks = parseDisks();

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Disk Usage
        </Typography>

        {disks.length > 0 ? (
          <Box>
            {disks.map((disk, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {disk.path}
                  </Typography>
                  <Typography variant="body2">
                    {disk.used} / {disk.total} ({disk.percent.toFixed(1)}%)
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
              <Typography variant="body2">Usage</Typography>
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
            {metrics.display || 'No disk information available'}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

