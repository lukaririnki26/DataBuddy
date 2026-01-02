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

      {/* Sidebar - Fixed */}
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={handleDrawerToggle}
        collapsed={isCollapsed}
        onCollapse={handleCollapseToggle}
        drawerWidth={drawerWidth}
        isMobile={isMobile}
      />

      {/* Main Content Area - Scrollable */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          overflowY: 'auto',
          height: '100vh'
        }}
      >
        {/* Navbar - Scrolls with content */}
        <Navbar
          onMenuClick={handleDrawerToggle}
          drawerWidth={drawerWidth}
          isMobile={isMobile}
        />

        {/* Page Content */}
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
