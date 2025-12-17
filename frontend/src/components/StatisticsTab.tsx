import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';
import { MetricsSnapshot } from '../api/client';

interface StatisticsTabProps {
    history: MetricsSnapshot[];
}

export default function StatisticsTab({ history }: StatisticsTabProps) {
    // Helper to parse GPU utilization string "45%" -> 45
    const parseGpuUtil = (utilStr?: string): number => {
        if (!utilStr || utilStr === 'N/A') return 0;
        const match = utilStr.match(/(\d+)/);
        return match ? parseFloat(match[1]) : 0;
    };

    // Prepare data for Recharts
    const data = history.map((snapshot, index) => {
        const secondsAgo = (history.length - 1 - index) * 5;
        const lan = snapshot.network.stats?.lan || { rx: 0, tx: 0 };
        const wifi = snapshot.network.stats?.wifi || { rx: 0, tx: 0 };

        return {
            time: `${secondsAgo}s`,
            cpu: snapshot.cpu.usage,
            memory: snapshot.memory.percent,
            disk: snapshot.disk.percent || 0,
            gpu: parseGpuUtil(snapshot.gpu.utilization),
            // Convert bytes to KB/s for better graph readability
            lanRx: lan.rx / 1024,
            lanTx: lan.tx / 1024,
            wifiRx: wifi.rx / 1024,
            wifiTx: wifi.tx / 1024,
        };
    });

    const StatsGraph = ({ title, dataKey, color, domain = [0, 100], unit = '%' }: any) => (
        <Grid item xs={12} md={6}>
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        {title}
                    </Typography>
                    <Box sx={{ height: 250, width: '100%' }}>
                        <ResponsiveContainer>
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="time" stroke="#666" />
                                <YAxis stroke="#666" domain={domain} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1f3a', border: '1px solid #333' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value: number) => [
                                        `${value.toFixed(1)}${unit}`,
                                        title
                                    ]}
                                />
                                <Area
                                    type="linear"
                                    dataKey={dataKey}
                                    stroke={color}
                                    fillOpacity={1}
                                    fill={`url(#color${dataKey})`}
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>
        </Grid>
    );

    const NetworkGraph = ({ title, rxKey, txKey, colorRx, colorTx }: any) => (
        <Grid item xs={12} md={6}>
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        {title} (KB/s)
                    </Typography>
                    <Box sx={{ height: 250, width: '100%' }}>
                        <ResponsiveContainer>
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id={`color${rxKey}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={colorRx} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={colorRx} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id={`color${txKey}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={colorTx} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={colorTx} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="time" stroke="#666" />
                                <YAxis stroke="#666" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1f3a', border: '1px solid #333' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value: number, name: string) => [
                                        `${value.toFixed(1)} KB/s`,
                                        name === rxKey ? 'Download' : 'Upload'
                                    ]}
                                />
                                <Area
                                    type="linear"
                                    dataKey={rxKey}
                                    stroke={colorRx}
                                    fillOpacity={0.6}
                                    fill={`url(#color${rxKey})`}
                                    isAnimationActive={false}
                                    stackId="1"
                                />
                                <Area
                                    type="linear"
                                    dataKey={txKey}
                                    stroke={colorTx}
                                    fillOpacity={0.6}
                                    fill={`url(#color${txKey})`}
                                    isAnimationActive={false}
                                    stackId="2"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>
        </Grid>
    );

    return (
        <Grid container spacing={3}>
            <StatsGraph title="CPU Usage" dataKey="cpu" color="#90caf9" />
            <StatsGraph title="Memory Usage" dataKey="memory" color="#ce93d8" />
            <StatsGraph title="Disk Usage (Total)" dataKey="disk" color="#f48fb1" />
            <StatsGraph title="GPU Utilization" dataKey="gpu" color="#ffab91" />

            <NetworkGraph
                title="LAN Traffic"
                rxKey="lanRx"
                txKey="lanTx"
                colorRx="#4db6ac"
                colorTx="#81c784"
            />
            <NetworkGraph
                title="WiFi Traffic"
                rxKey="wifiRx"
                txKey="wifiTx"
                colorRx="#4fc3f7"
                colorTx="#7986cb"
            />
        </Grid>
    );
}
