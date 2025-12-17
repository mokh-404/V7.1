import { useState, useEffect } from 'react';
import { Container, Box, Alert, CircularProgress, Typography, Tabs, Tab } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { fetchCurrentMetrics, MetricsSnapshot } from './api/client';
import OverviewTab from './components/OverviewTab';
import StatisticsTab from './components/StatisticsTab';

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
const MAX_HISTORY_POINTS = 60; // Keep last 5 minutes (60 * 5s = 300s)

function App() {
  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null);
  const [history, setHistory] = useState<MetricsSnapshot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);

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

          // Update history
          setHistory(prev => {
            const newHistory = [...prev, response.data!];
            if (newHistory.length > MAX_HISTORY_POINTS) {
              return newHistory.slice(newHistory.length - MAX_HISTORY_POINTS);
            }
            return newHistory;
          });
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

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

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="dashboard tabs" centered>
            <Tab label="Overview" />
            <Tab label="Statistics Graph" />
          </Tabs>
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

        {metrics && currentTab === 0 && <OverviewTab metrics={metrics} />}
        {currentTab === 1 && <StatisticsTab history={history} />}
      </Container>
    </ThemeProvider>
  );
}

export default App;

