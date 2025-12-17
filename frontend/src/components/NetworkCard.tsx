import { Card, CardContent, Typography, Box, Chip } from '@mui/material';

interface NetworkMetrics {
  data?: string;
}

interface NetworkCardProps {
  metrics: NetworkMetrics;
}

export default function NetworkCard({ metrics }: NetworkCardProps) {
  // Parse network data string
  // Format: "LAN: ↓ XXX ↑ XXX | WiFi: ↓ XXX ↑ XXX | TCP: XXX"
  const parseNetworkData = () => {
    if (!metrics.data || metrics.data === 'N/A') {
      return null;
    }

    const result: {
      lan?: { rx: string; tx: string };
      wifi?: { rx: string; tx: string };
      tcp?: string;
    } = {};

    // Extract LAN - split by pipe and parse each section
    // Format: "LAN: ↓ XXX ↑ XXX | WiFi: ↓ XXX ↑ XXX | TCP: XXX"
    const parts = metrics.data.split('|');
    
    for (const part of parts) {
      const trimmed = part.trim();
      
      // Parse LAN section
      if (trimmed.startsWith('LAN')) {
        // Match: "LAN: ↓ XXX ↑ XXX" or "LAN(L): ↓ XXX ↑ XXX"
        const match = trimmed.match(/LAN[^:]*:\s*[^\s]+\s+([^\s]+)\s+[^\s]+\s+([^\s]+)/);
        if (match) {
          result.lan = { rx: match[1].trim(), tx: match[2].trim() };
        }
      }
      
      // Parse WiFi section
      if (trimmed.startsWith('WiFi')) {
        // Match: "WiFi: ↓ XXX ↑ XXX"
        const match = trimmed.match(/WiFi[^:]*:\s*[^\s]+\s+([^\s]+)\s+[^\s]+\s+([^\s]+)/);
        if (match) {
          result.wifi = { rx: match[1].trim(), tx: match[2].trim() };
        }
      }
      
      // Parse TCP section
      if (trimmed.startsWith('TCP')) {
        const match = trimmed.match(/TCP:\s*(\d+)/);
        if (match) {
          result.tcp = match[1];
        }
      }
    }

    // Extract TCP connections
    const tcpMatch = metrics.data.match(/TCP:\s*(\d+)/);
    if (tcpMatch) {
      result.tcp = tcpMatch[1];
    }

    return result;
  };

  const networkData = parseNetworkData();

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Network
        </Typography>

        {networkData ? (
          <Box>
            {networkData.lan && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  LAN
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={`↓ ${networkData.lan.rx}`} color="primary" size="small" />
                  <Chip label={`↑ ${networkData.lan.tx}`} color="secondary" size="small" />
                </Box>
              </Box>
            )}

            {networkData.wifi && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  WiFi
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={`↓ ${networkData.wifi.rx}`} color="primary" size="small" />
                  <Chip label={`↑ ${networkData.wifi.tx}`} color="secondary" size="small" />
                </Box>
              </Box>
            )}

            {networkData.tcp && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  TCP Connections
                </Typography>
                <Chip label={networkData.tcp} />
              </Box>
            )}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {metrics.data || 'No network data available'}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

