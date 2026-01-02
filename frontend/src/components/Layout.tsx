import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, useMediaQuery, useTheme } from '@mui/material';
import Navbar from './layout/Navbar';
import Sidebar from './layout/Sidebar';

const Layout: React.FC = () => {
  const theme = useTheme();
  // Check if screen is mobile (sm down)
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State for mobile drawer open/close
  const [mobileOpen, setMobileOpen] = useState(false);

  // State for desktop sidebar collapse/expand
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Width constants
  const drawerWidth = isCollapsed ? 80 : 280;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCollapseToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />

      {/* Navbar */}
      <Navbar
        onMenuClick={handleDrawerToggle}
        drawerWidth={drawerWidth}
        isMobile={isMobile}
      />

      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={handleDrawerToggle}
        collapsed={isCollapsed}
        onCollapse={handleCollapseToggle}
        drawerWidth={drawerWidth}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          overflowX: 'hidden',
          position: 'relative'
        }}
      >
        <Toolbar /> {/* Spacer for Fixed Navbar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
