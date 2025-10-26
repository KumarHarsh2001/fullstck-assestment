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
  Chip,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { Edit, Info } from '@mui/icons-material';

interface SadPathChartProps {
  data: any[];
  onEditData: () => void;
  onSaveData?: (chartType: string, newData: any) => void;
  hasUserData: boolean;
}

const SadPathChart: React.FC<SadPathChartProps> = ({
  data,
  onEditData,
  onSaveData,
  hasUserData,
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedData, setEditedData] = useState(data);

  // Reset editedData when data prop changes
  useEffect(() => {
    setEditedData(data);
  }, [data]);

  const handleEditClick = () => {
    if (!hasUserData) {
      onEditData();
      return;
    }
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    // Save to Supabase
    if (onSaveData) {
      await onSaveData('sadPath', editedData);
    }
    
    setEditDialogOpen(false);
  };

  const handleCategoryChange = (index: number, field: string, value: any) => {
    const newData = [...editedData];
    newData[index] = { ...newData[index], [field]: value };
    setEditedData(newData);
  };

  const currentData = editedData.length > 0 ? editedData : data;
  const totalValue = currentData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalValue) * 100).toFixed(1);
      return (
        <Box
          sx={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333333',
            borderRadius: '8px',
            p: 2,
            color: '#ffffff',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {data.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Count: {data.value}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Percentage: {percentage}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h3" sx={{ mb: 1 }}>
            Sad Path Analysis
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Breakdown of failed customer interactions
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Failure Categories Info">
            <IconButton size="small">
              <Info />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={handleEditClick}
            sx={{
              borderColor: 'secondary.main',
              color: 'secondary.main',
              '&:hover': {
                borderColor: 'secondary.light',
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
              },
            }}
          >
            {hasUserData ? 'Edit' : 'Customize'}
          </Button>
        </Box>
      </Box>

      {/* Chart */}
      <Box sx={{ flex: 1, minHeight: '250px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={currentData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {currentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      {/* Stats */}
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {currentData.map((item, index) => (
            <Chip
              key={index}
              label={`${item.name}: ${item.value}`}
              size="small"
              sx={{
                backgroundColor: item.color,
                color: '#ffffff',
                fontSize: '0.75rem',
              }}
            />
          ))}
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'secondary.main' }}>
            {totalValue}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Total Failed Interactions
          </Typography>
        </Box>
      </Box>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Sad Path Analysis</DialogTitle>
        <DialogContent>
          {/* Show current data info */}
          {hasUserData && (
            <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(255, 107, 53, 0.1)', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 600, mb: 1 }}>
                Current Data: {currentData.length} categories
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Edit the values below to update your chart
              </Typography>
            </Box>
          )}
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Modify the failure categories and their values to reflect your specific data.
          </Typography>
          <Grid container spacing={2}>
            {currentData.map((item, index) => (
              <React.Fragment key={index}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Category Name"
                    value={item.name}
                    onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Count"
                    value={item.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow only numbers
                      if (value === '' || /^\d+$/.test(value)) {
                        const numValue = value === '' ? 0 : parseInt(value, 10);
                        handleCategoryChange(index, 'value', numValue);
                      }
                    }}
                    size="small"
                    helperText="Enter a number"
                  />
                </Grid>
              </React.Fragment>
            ))}
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

export default SadPathChart;
