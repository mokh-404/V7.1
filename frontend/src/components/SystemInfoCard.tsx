import { Card, CardContent, Typography, Box, Alert, Divider } from '@mui/material';

interface SystemInfo {
  uptime?: string;
  process_count?: number;
  smart_status?: string;
  smart_health?: string;
  rom_info?: string;
}

interface SystemInfoCardProps {
  system: SystemInfo;
  alerts?: string;
}

export default function SystemInfoCard({ system, alerts }: SystemInfoCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          System Information
        </Typography>

        <Box sx={{ mb: 2 }}>
          {system.uptime && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Uptime
              </Typography>
              <Typography variant="body1">{system.uptime}</Typography>
            </Box>
          )}

          {system.process_count !== undefined && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Process Count
              </Typography>
              <Typography variant="body1">{system.process_count}</Typography>
            </Box>
          )}

          {system.smart_health && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                SMART Health
              </Typography>
              <Typography
                variant="body1"
                color={system.smart_health === 'PASSED' || system.smart_health === 'OK' ? 'success.main' : 'error.main'}
              >
                {system.smart_health}
              </Typography>
            </Box>
          )}

          {system.rom_info && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                ROM/BIOS
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                {system.rom_info}
              </Typography>
            </Box>
          )}
        </Box>

        {alerts && alerts !== 'No alerts.' && (
          <>
            <Divider sx={{ my: 2 }} />
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">{alerts}</Typography>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
}

