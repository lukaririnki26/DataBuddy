import React, { useState } from 'react';
import { Box, CssBaseline, useMediaQuery, useTheme } from '@mui/material';
import Navbar from './layout/Navbar';
import Sidebar from './layout/Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  // Check if screen is mobile (sm down)
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State for mobile drawer open/close
  const [mobileOpen, setMobileOpen] = useState(false);

  // State for desktop sidebar - starts OPEN (false = open/wide, true = closed/narrow)
  const [isClosed, setIsClosed] = useState(false);

  // Width constants - when closed it's narrow (80px), when open it's wide (280px)
  const drawerWidth = isClosed ? 80 : 280;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setIsClosed(!isClosed);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />

      {/* Sidebar - Fixed */}
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={handleDrawerToggle}
        isClosed={isClosed}
        onToggle={handleSidebarToggle}
        drawerWidth={drawerWidth}
        isMobile={isMobile}
      />

      {/* Main Content Area - Scrollable */}
      <Box
        component="main"
        key={`main-content-${drawerWidth}`}
        sx={{
          flexGrow: 1,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
          overflowY: 'auto',
          overflowX: 'hidden',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        }}
      >
        {/* Navbar - Scrolls with content */}
        <Navbar
          onMenuClick={handleDrawerToggle}
          drawerWidth={drawerWidth}
          isMobile={isMobile}
        />

        {/* Page Content - Standardized padding and left alignment */}
        <Box sx={{
          flex: 1,
          p: 2,
          width: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
