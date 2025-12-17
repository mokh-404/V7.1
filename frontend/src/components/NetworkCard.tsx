import { Card, CardContent, Typography, Box, Chip } from '@mui/material';

interface NetworkMetrics {
  data?: string;
  stats?: {
    lan: { rx: number; tx: number };
    wifi: { rx: number; tx: number };
    tcp: number;
  };
}

interface NetworkCardProps {
  metrics: NetworkMetrics;
}

export default function NetworkCard({ metrics }: NetworkCardProps) {
  // Client-side formatting function
  const formatSpeed = (bytes: number): string => {
    if (bytes < 1024) return `${Math.round(bytes)} B/s`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB/s`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB/s`;
  };

  const stats = metrics.stats;

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Network
        </Typography>

        {stats ? (
          <Box>
            {/* LAN */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                LAN
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={`↓ ${formatSpeed(stats.lan.rx)}`} color="primary" size="small" />
                <Chip label={`↑ ${formatSpeed(stats.lan.tx)}`} color="secondary" size="small" />
              </Box>
            </Box>

            {/* WiFi */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                WiFi
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={`↓ ${formatSpeed(stats.wifi.rx)}`} color="primary" size="small" />
                <Chip label={`↑ ${formatSpeed(stats.wifi.tx)}`} color="secondary" size="small" />
              </Box>
            </Box>

            {/* TCP */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                TCP Connections
              </Typography>
              <Chip label={stats.tcp} />
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {metrics.data || 'Initializing network...'}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

