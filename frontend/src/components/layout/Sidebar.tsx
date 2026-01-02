import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Divider,
  Toolbar
} from '@mui/material';
import {
  BarChart3,
  Upload,
  Download,
  Settings,
  Users,
  Activity,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onCollapse: () => void;
  drawerWidth: number;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  onClose,
  collapsed,
  onCollapse,
  drawerWidth,
  isMobile
}) => {
  const theme = useTheme();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Data Import', href: '/data/import', icon: Upload },
    { name: 'Data Export', href: '/data/export', icon: Download },
    { name: 'Pipelines', href: '/pipelines', icon: Settings },
    { name: 'Pipeline Builder', href: '/pipelines/builder', icon: Zap },
    { name: 'Monitoring', href: '/monitoring', icon: Activity },
    { name: 'Users', href: '/admin/users', icon: Users, adminOnly: true },
  ];

  const drawerContent = (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      bgcolor: 'background.paper',
      color: 'text.primary',
      overflowX: 'hidden',
    }}>
      {/* Spacer for AppBar */}
      <Toolbar />

      {/* Navigation List */}
      <List sx={{ flex: 1, p: 2, gap: 1, display: 'flex', flexDirection: 'column' }}>
        {navigation.map((item) => {
          if (item.adminOnly && user?.role !== 'admin') return null;

          const isActive = location.pathname === item.href ||
            (item.href !== '/dashboard' && location.pathname.startsWith(item.href));

          return (
            <ListItem key={item.name} disablePadding sx={{ display: 'block' }}>
              <Tooltip title={collapsed && !isMobile ? item.name : ''} placement="right">
                <ListItemButton
                  component={Link}
                  to={item.href}
                  selected={isActive}
                  onClick={isMobile ? onClose : undefined}
                  sx={{
                    minHeight: 48,
                    justifyContent: collapsed && !isMobile ? 'center' : 'initial',
                    px: 2.5,
                    borderRadius: 3,
                    mb: 1,
                    transition: 'all 0.2s',
                    bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.25),
                      }
                    },
                    '&:hover': {
                      bgcolor: alpha(theme.palette.common.white, 0.05),
                      transform: 'scale(1.02)'
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed && !isMobile ? 0 : 3,
                      justifyContent: 'center',
                      color: isActive ? theme.palette.primary.main : theme.palette.text.secondary
                    }}
                  >
                    <item.icon size={20} />
                  </ListItemIcon>
                  {(!collapsed || isMobile) && (
                    <ListItemText
                      primary={item.name}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? 'text.primary' : 'text.secondary',
                        fontSize: '0.9rem'
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      {/* Desktop Collapse Toggle */}
      {!isMobile && (
        <Box sx={{
          p: 2,
          borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'flex-end',
          position: 'sticky',
          bottom: 0,
          bgcolor: 'background.paper',
          zIndex: 10
        }}>
          <IconButton
            onClick={onCollapse}
            sx={{
              bgcolor: alpha(theme.palette.common.white, 0.05),
              '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.1) },
              cursor: 'pointer'
            }}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </IconButton>
        </Box>
      )}
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: 'background.default',
            borderRight: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
            backgroundImage: 'none'
          },
          zIndex: (theme) => theme.zIndex.drawer + 2
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            bgcolor: 'background.default',
            borderRight: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
            overflowX: 'hidden'
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
