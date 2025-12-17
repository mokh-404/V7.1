import { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Alert, CircularProgress } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { fetchCurrentMetrics, MetricsSnapshot } from './api/client';
import CpuCard from './components/CpuCard';
import MemoryCard from './components/MemoryCard';
import DiskCard from './components/DiskCard';
import NetworkCard from './components/NetworkCard';
import GpuCard from './components/GpuCard';
import SystemInfoCard from './components/SystemInfoCard';
import TopProcessesTable from './components/TopProcessesTable';

// Dark theme for the dashboard
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#0a0e27',
      paper: '#1a1f3a',
    },
  },
});

const POLL_INTERVAL_MS = 5000; // Poll every 5 seconds

function App() {
  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch metrics immediately
    const fetchMetrics = async () => {
      try {
        setError(null);
        const response = await fetchCurrentMetrics();
        
        if (response.error) {
          setError(response.error);
          setMetrics(null);
        } else if (response.data) {
          setMetrics(response.data);
          setError(null);
        } else {
          // No error but also no data
          setError('No metrics data available');
          setMetrics(null);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error fetching metrics:', err);
        setError(errorMessage);
        setMetrics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    // Set up polling interval
    const interval = setInterval(fetchMetrics, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            System Monitoring Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Real-time system metrics from host
          </Typography>
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Backend Error: {error}
          </Alert>
        )}

        {metrics && (
          <Grid container spacing={3}>
            {/* CPU Card */}
            <Grid item xs={12} md={6}>
              <CpuCard metrics={metrics.cpu} />
            </Grid>

            {/* Memory Card */}
            <Grid item xs={12} md={6}>
              <MemoryCard metrics={metrics.memory} />
            </Grid>

            {/* Disk Card */}
            <Grid item xs={12} md={6}>
              <DiskCard metrics={metrics.disk} />
            </Grid>

            {/* Network Card */}
            <Grid item xs={12} md={6}>
              <NetworkCard metrics={metrics.network} />
            </Grid>

            {/* GPU Card */}
            <Grid item xs={12} md={6}>
              <GpuCard metrics={metrics.gpu} />
            </Grid>

            {/* System Info Card */}
            <Grid item xs={12} md={6}>
              <SystemInfoCard 
                system={metrics.system} 
                alerts={metrics.alerts}
              />
            </Grid>

            {/* Top Processes Table */}
            <Grid item xs={12}>
              <TopProcessesTable processes={metrics.top_processes} />
            </Grid>
          </Grid>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;

