import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

interface ProcessInfo {
  pid?: string;
  user?: string;
  memory_percent?: string;
  command?: string;
}

interface TopProcessesTableProps {
  processes: ProcessInfo[];
}

export default function TopProcessesTable({ processes }: TopProcessesTableProps) {
  // Filter out empty processes and sort by memory percent
  const validProcesses = processes
    .filter(p => p.pid && p.command)
    .sort((a, b) => {
      const memA = parseFloat(a.memory_percent?.replace('%', '') || '0');
      const memB = parseFloat(b.memory_percent?.replace('%', '') || '0');
      return memB - memA;
    })
    .slice(0, 10); // Top 10

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Top Processes (by Memory)
        </Typography>

        <TableContainer component={Paper} sx={{ backgroundColor: 'transparent', mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>PID</TableCell>
                <TableCell>User</TableCell>
                <TableCell align="right">Memory %</TableCell>
                <TableCell>Command</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {validProcesses.length > 0 ? (
                validProcesses.map((process, index) => (
                  <TableRow key={index}>
                    <TableCell>{process.pid}</TableCell>
                    <TableCell>{process.user}</TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        color={
                          parseFloat(process.memory_percent?.replace('%', '') || '0') > 10
                            ? 'error.main'
                            : 'text.primary'
                        }
                        fontWeight="bold"
                      >
                        {process.memory_percent || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {process.command}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No process data available
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

