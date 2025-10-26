import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Edit, Info } from '@mui/icons-material';

interface CallDurationChartProps {
  data: any[];
  onEditData: () => void;
  onSaveData?: (chartType: string, newData: any) => void;
  hasUserData: boolean;
}

const CallDurationChart: React.FC<CallDurationChartProps> = ({
  data,
  onEditData,
  onSaveData,
  hasUserData,
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedData, setEditedData] = useState(data);
  const [peakDurationInput, setPeakDurationInput] = useState('12');

  // Reset editedData when data prop changes
  useEffect(() => {
    setEditedData(data);
  }, [data]);

  const handleEditClick = () => {
    if (!hasUserData) {
      onEditData();
      return;
    }
    // Set initial value based on current peak
    const currentPeak = data.find(
      (d) => d.density === Math.max(...data.map((d) => d.density))
    );
    setPeakDurationInput(String(currentPeak?.duration || 12));
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    // Convert input string to number
    const numValue = parseInt(peakDurationInput, 10);
    if (isNaN(numValue) || numValue < 1 || numValue > 30) {
      alert('Please enter a valid number between 1 and 30');
      return;
    }

    // Update the data with new peak duration
    const newData = data.map((item) => ({
      ...item,
      density: Math.exp(-Math.pow((item.duration - numValue) / 4, 2)) * 3,
    }));
    
    // Save to Supabase
    if (onSaveData) {
      await onSaveData('callDuration', newData);
    }
    
    setEditedData(newData);
    setEditDialogOpen(false);
  };

  const currentData = editedData.length > 0 ? editedData : data;
  const peakPoint = currentData.find(
    (d) => d.density === Math.max(...currentData.map((d) => d.density))
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h3" sx={{ mb: 1 }}>
            Call Duration Analysis
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Distribution of call durations showing peak performance metrics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Peak Duration Info">
            <IconButton size="small">
              <Info />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={handleEditClick}
            sx={{
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.light',
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
              },
            }}
          >
            {hasUserData ? 'Edit' : 'Customize'}
          </Button>
        </Box>
      </Box>

      {/* Chart */}
      <Box sx={{ flex: 1, minHeight: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
            <XAxis
              dataKey="duration"
              stroke="#b0b0b0"
              fontSize={12}
              tickFormatter={(value) => `${value}m`}
            />
            <YAxis
              stroke="#b0b0b0"
              fontSize={12}
              label={{ value: 'Density', angle: -90, position: 'insideLeft' }}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333333',
                borderRadius: '8px',
                color: '#ffffff',
              }}
              formatter={(value: any, name: string) => [
                `${value.toFixed(2)}`,
                'Density',
              ]}
              labelFormatter={(label) => `Duration: ${label} minutes`}
            />
            <Line
              type="monotone"
              dataKey="density"
              stroke="#00d4ff"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#00d4ff' }}
            />
            {peakPoint && (
              <ReferenceLine
                x={peakPoint.duration}
                stroke="#ff6b35"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{
                  value: `Peak: ${peakPoint.duration}m`,
                  position: 'top',
                  style: { fill: '#ff6b35', fontSize: '12px' },
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Stats */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'primary.main' }}>
            {peakPoint?.duration || 12}m
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Peak Duration
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'secondary.main' }}>
            {currentData.length}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Data Points
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'primary.light' }}>
            {Math.max(...currentData.map((d) => d.density)).toFixed(2)}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Max Density
          </Typography>
        </Box>
      </Box>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Call Duration Analysis</DialogTitle>
        <DialogContent>
          {/* Show current peak duration */}
          {hasUserData && (
            <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(0, 212, 255, 0.1)', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, mb: 1 }}>
                Current Peak Duration: {peakPoint?.duration || 12} minutes
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                This will be changed to the new value below
              </Typography>
            </Box>
          )}
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Adjust the peak duration to see how it affects the distribution curve.
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Peak Duration (minutes)"
                value={peakDurationInput}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow only numbers and empty string
                  if (value === '' || /^\d+$/.test(value)) {
                    setPeakDurationInput(value);
                  }
                }}
                helperText="Enter a number between 1 and 30"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CallDurationChart;
