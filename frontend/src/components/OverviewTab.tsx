import { Grid, Button, Box } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { MetricsSnapshot } from '../api/client';
import CpuCard from './CpuCard';
import MemoryCard from './MemoryCard';
import DiskCard from './DiskCard';
import NetworkCard from './NetworkCard';
import GpuCard from './GpuCard';
import SystemInfoCard from './SystemInfoCard';
import TopProcessesTable from './TopProcessesTable';

interface OverviewTabProps {
    metrics: MetricsSnapshot;
}

export default function OverviewTab({ metrics }: OverviewTabProps) {
    const handleDownloadReport = () => {
        // Direct link to the backend report endpoint
        // Using localhost:8000 because we are in browser
        window.location.href = 'http://localhost:8000/api/reports/all';
    };

    return (
        <Grid container spacing={3}>
            {/* Download Report Button */}
            <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end">
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadReport}
                    >
                        Download Report (JSONL)
                    </Button>
                </Box>
            </Grid>

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
    );
}
