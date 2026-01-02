import React from 'react';
import { useTheme, Box, Typography, Button, Container, Grid, Card, CardContent, alpha } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  AutoAwesome as AutoAwesomeIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: theme.palette.background.default, // Use theme background which has the gradient
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background elements - Recreated using Box for consistency */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <Box sx={{
          position: 'absolute', top: '25%', left: '25%', width: 288, height: 288,
          bgcolor: theme.palette.secondary.main, borderRadius: '50%',
          filter: 'blur(80px)', opacity: 0.2, mixBlendMode: 'multiply',
          animation: 'blob 7s infinite'
        }} />
        <Box sx={{
          position: 'absolute', top: '75%', right: '25%', width: 288, height: 288,
          bgcolor: theme.palette.primary.main, borderRadius: '50%',
          filter: 'blur(80px)', opacity: 0.2, mixBlendMode: 'multiply',
          animation: 'blob 7s infinite 2s'
        }} />
        <Box sx={{
          position: 'absolute', bottom: '25%', left: '33%', width: 288, height: 288,
          bgcolor: theme.palette.error.main, borderRadius: '50%',
          filter: 'blur(80px)', opacity: 0.2, mixBlendMode: 'multiply',
          animation: 'blob 7s infinite 4s'
        }} />
      </Box>

      {/* Header */}
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10, py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 40, height: 40,
              background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.secondary.main})`,
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>D</Typography>
            </Box>
            <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary' }}>DataBuddy</Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => navigate('/login')}
            sx={{
              borderRadius: '9999px',
              borderColor: alpha(theme.palette.common.white, 0.2),
              color: 'text.primary',
              '&:hover': {
                borderColor: alpha(theme.palette.common.white, 0.4),
                bgcolor: alpha(theme.palette.common.white, 0.1)
              }
            }}
          >
            Sign In
          </Button>
        </Box>
      </Container>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, py: 15 }}>
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <Typography variant="h1" sx={{
            fontSize: { xs: '3rem', md: '5rem' },
            fontWeight: 800,
            mb: 3,
            lineHeight: 1.1
          }}>
            <Box component="span" sx={{
              background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.secondary.light}, #ec4899)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Transform Data
            </Box>
            <br />
            <Box component="span" sx={{ color: 'text.primary' }}>Into Intelligence</Box>
          </Typography>
          <Typography variant="h5" sx={{
            color: 'text.secondary',
            mb: 6,
            maxWidth: 'md',
            mx: 'auto',
            lineHeight: 1.6
          }}>
            DataBuddy is your AI-powered data management platform that automates workflows,
            ensures data quality, and delivers actionable insights through intelligent pipelines.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                px: 6, py: 2,
                borderRadius: '9999px',
                fontSize: '1.2rem',
                background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.dark})`,
              }}
            >
              Start Building Pipelines
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              sx={{
                px: 6, py: 2,
                borderRadius: '9999px',
                fontSize: '1.2rem',
                borderColor: alpha(theme.palette.common.white, 0.2),
                color: 'text.primary',
                '&:hover': {
                  borderColor: alpha(theme.palette.common.white, 0.4),
                  bgcolor: alpha(theme.palette.common.white, 0.1)
                }
              }}
            >
              Explore Features
            </Button>
          </Box>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={4} id="features" sx={{ mb: 15 }}>
          {[
            {
              title: 'Smart Pipelines',
              desc: 'Build intelligent data processing workflows with drag-and-drop simplicity. Automate processes with AI assistance.',
              icon: <AutoAwesomeIcon sx={{ fontSize: 32, color: 'white' }} />,
              gradient: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.dark})`
            },
            {
              title: 'Real-time Analytics',
              desc: 'Monitor pipeline performance, data quality metrics, and system health with beautiful dashboards.',
              icon: <AnalyticsIcon sx={{ fontSize: 32, color: 'white' }} />,
              gradient: `linear-gradient(to right, ${theme.palette.secondary.light}, ${theme.palette.secondary.dark})`
            },
            {
              title: 'Enterprise Security',
              desc: 'Bank-grade security with role-based access control, audit logs, and encrypted data processing.',
              icon: <SecurityIcon sx={{ fontSize: 32, color: 'white' }} />,
              gradient: `linear-gradient(to right, #f472b6, #ef4444)`
            }
          ].map((feature) => (
            <Grid item xs={12} md={4} key={feature.title}>
              <Card sx={{
                height: '100%',
                bgcolor: alpha(theme.palette.background.paper, 0.03),
                backdropFilter: 'blur(32px)',
                border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
                borderRadius: '2rem',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': {
                  transform: 'translateY(-12px) scale(1.02)',
                  bgcolor: alpha(theme.palette.background.paper, 0.08),
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.1)}`
                }
              }}>
                <CardContent sx={{ p: 5 }}>
                  <Box sx={{
                    width: 72, height: 72, mb: 4, borderRadius: '20px',
                    background: feature.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`
                  }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" fontWeight="900" gutterBottom sx={{ color: 'text.primary', letterSpacing: '-0.02em' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7, opacity: 0.8 }}>
                    {feature.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* CTA Section */}
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <Box sx={{
            background: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
            borderRadius: '3rem',
            p: { xs: 6, md: 10 },
            maxWidth: 'md',
            mx: 'auto'
          }}>
            <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Ready to Revolutionize Your Data Workflow?
            </Typography>
            <Typography variant="h5" sx={{ color: 'text.secondary', mb: 6 }}>
              Join thousands of data professionals who trust DataBuddy.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  px: 6, py: 2,
                  borderRadius: '9999px',
                  background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.dark})`,
                }}
              >
                Get Started Free
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => window.open('https://github.com', '_blank')}
                sx={{
                  px: 6, py: 2,
                  borderRadius: '9999px',
                  borderColor: alpha(theme.palette.common.white, 0.2),
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: alpha(theme.palette.common.white, 0.4),
                    bgcolor: alpha(theme.palette.common.white, 0.1)
                  }
                }}
              >
                View Documentation
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
