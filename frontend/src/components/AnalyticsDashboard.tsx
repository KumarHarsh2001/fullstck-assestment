import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Fade,
  Button,
} from '@mui/material';
import CallDurationChart from './CallDurationChart';
import SadPathChart from './SadPathChart';
import EmailAuthModal from './EmailAuthModal';
import { supabase } from '../lib/supabase';

interface UserData {
  email: string;
  callDurationData?: any[];
  sadPathData?: any[];
}

const AnalyticsDashboard: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Default data for charts
  const defaultCallDurationData = [
    { duration: 0, density: 0 },
    { duration: 1, density: 0.1 },
    { duration: 2, density: 0.3 },
    { duration: 3, density: 0.8 },
    { duration: 4, density: 1.2 },
    { duration: 5, density: 1.5 },
    { duration: 6, density: 1.8 },
    { duration: 7, density: 2.1 },
    { duration: 8, density: 2.3 },
    { duration: 9, density: 2.5 },
    { duration: 10, density: 2.7 },
    { duration: 11, density: 2.8 },
    { duration: 12, density: 2.9 },
    { duration: 13, density: 2.7 },
    { duration: 14, density: 2.4 },
    { duration: 15, density: 2.0 },
    { duration: 16, density: 1.6 },
    { duration: 17, density: 1.2 },
    { duration: 18, density: 0.8 },
    { duration: 19, density: 0.5 },
    { duration: 20, density: 0.3 },
    { duration: 21, density: 0.2 },
    { duration: 22, density: 0.1 },
    { duration: 23, density: 0.05 },
    { duration: 24, density: 0.02 },
    { duration: 25, density: 0.01 },
  ];

  const defaultSadPathData = [
    { name: 'Technical Issues', value: 35, color: '#ff6b35' },
    { name: 'Agent Unavailable', value: 25, color: '#ff4757' },
    { name: 'Long Wait Times', value: 20, color: '#ffa502' },
    { name: 'Language Barriers', value: 12, color: '#ff6348' },
    { name: 'System Errors', value: 8, color: '#ff3838' },
  ];

  useEffect(() => {
    // Clear user data on refresh to show default charts
    // User must enter their email to see their custom data
    if (localStorage.getItem('userEmail')) {
      localStorage.removeItem('userEmail');
    }
    setIsLoading(false);
  }, []);

  const handleEmailSubmit = async (email: string) => {
    try {
      // Check if user already has data
      const { data: existingData, error: fetchError } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      console.log('Existing data check:', { existingData, fetchError });

      if (existingData && !fetchError) {
        // User has existing data - show it
        console.log('Loading existing user data:', existingData);
        localStorage.setItem('userEmail', email);
        setUserData({
          email,
          callDurationData: existingData.call_duration_data,
          sadPathData: existingData.sad_path_data,
        });
        setShowAuthModal(false);
      } else {
        // New user - create entry with default data
        const { error } = await supabase
          .from('user_analytics')
          .insert({
            email,
            call_duration_data: defaultCallDurationData,
            sad_path_data: defaultSadPathData,
          });

        if (error) {
          console.error('Error saving user data:', error);
          alert('Failed to save your preferences. Please try again.');
          return;
        }

        localStorage.setItem('userEmail', email);
        setUserData({
          email,
          callDurationData: defaultCallDurationData,
          sadPathData: defaultSadPathData,
        });
        setShowAuthModal(false);
      }
    } catch (error) {
      console.error('Error handling email submit:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleEditData = () => {
    // Always show email modal for multi-user support
    // Each edit requires user to provide/confirm their email
    setShowAuthModal(true);
  };

  const handleSaveChartData = async (chartType: string, newData: any) => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      console.error('No email found');
      return;
    }

    try {
      const updates: any = {};
      if (chartType === 'callDuration') {
        updates.call_duration_data = newData;
      } else if (chartType === 'sadPath') {
        updates.sad_path_data = newData;
      }

      const { error } = await supabase
        .from('user_analytics')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('email', email);

      if (error) {
        console.error('Error saving chart data:', error);
        alert('Failed to save changes. Please try again.');
      } else {
        // Refresh user data after save
        const { data } = await supabase
          .from('user_analytics')
          .select('*')
          .eq('email', email)
          .single();

        if (data) {
          setUserData({
            email,
            callDurationData: data.call_duration_data,
            sadPathData: data.sad_path_data,
          });
        }
      }
    } catch (error) {
      console.error('Error saving chart data:', error);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
          }}
        >
          <Typography variant="h3" className="animate-pulse">
            Loading Analytics...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Fade in timeout={800}>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography variant="h1" sx={{ mb: 2 }}>
              Voice Agent Analytics
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.2rem', maxWidth: '600px', mx: 'auto' }}>
              Comprehensive insights into call performance, duration patterns, and failure analysis
              for optimized customer service operations.
            </Typography>
          </Box>

          {/* Charts Grid */}
          <Grid container spacing={4}>
            {/* Call Duration Analysis */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Fade in timeout={1000}>
                <Card sx={{ height: '500px' }}>
                  <CardContent sx={{ height: '100%', p: 3 }}>
                    <CallDurationChart
                      key={`call-duration-${userData?.email || 'default'}`}
                      data={userData?.callDurationData || defaultCallDurationData}
                      onEditData={handleEditData}
                      onSaveData={handleSaveChartData}
                      hasUserData={!!userData}
                    />
                  </CardContent>
                </Card>
              </Fade>
            </Grid>

            {/* Sad Path Analysis */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Fade in timeout={1200}>
                <Card sx={{ height: '500px' }}>
                  <CardContent sx={{ height: '100%', p: 3 }}>
                    <SadPathChart
                      key={`sad-path-${userData?.email || 'default'}`}
                      data={userData?.sadPathData || defaultSadPathData}
                      onEditData={handleEditData}
                      onSaveData={handleSaveChartData}
                      hasUserData={!!userData}
                    />
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          </Grid>

          {/* User Info */}
          {userData && (
            <Fade in timeout={1400}>
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Viewing analytics for: {userData.email}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                  Customize your charts by clicking the "Edit" button
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    localStorage.removeItem('userEmail');
                    setUserData(null);
                    setShowAuthModal(true);
                  }}
                  sx={{ mt: 2 }}
                >
                  Switch User / Enter Email
                </Button>
              </Box>
            </Fade>
          )}
        </Box>
      </Fade>

      {/* Email Authentication Modal */}
      <EmailAuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSubmit={handleEmailSubmit}
      />
    </Container>
  );
};

export default AnalyticsDashboard;
