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
  Typography
} from '@mui/material';
import {
  BarChart3,
  Upload,
  Download,
  Settings,
  Users,
  Activity,
  Zap,
  Database,
  Menu,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  isClosed: boolean;
  onToggle: () => void;
  drawerWidth: number;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  onClose,
  isClosed,
  onToggle,
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
      overflow: 'hidden'
    }}>
      {/* Logo/Branding */}
      <Box sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: isClosed && !isMobile ? 'center' : 'flex-start',
        gap: 1.5
      }}>
        {!isClosed || isMobile ? (
          <>
            <Box sx={{ position: 'relative', display: 'flex' }}>
              <Database size={32} color={theme.palette.primary.main} />
              <Box sx={{
                position: 'absolute', inset: 0,
                bgcolor: alpha(theme.palette.primary.main, 0.3),
                filter: 'blur(10px)',
                pointerEvents: 'none'
              }} />
            </Box>
            <Typography
              variant="h5"
              fontWeight="900"
              sx={{
                background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              DataBuddy
            </Typography>
          </>
        ) : (
          <Box sx={{ position: 'relative', display: 'flex' }}>
            <Database size={28} color={theme.palette.primary.main} />
            <Box sx={{
              position: 'absolute', inset: 0,
              bgcolor: alpha(theme.palette.primary.main, 0.3),
              filter: 'blur(8px)',
              pointerEvents: 'none'
            }} />
          </Box>
        )}
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Navigation List */}
      <List sx={{
        flex: 1,
        px: 2,
        py: 2,
        overflowY: 'auto',
        overflowX: 'hidden',
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: alpha(theme.palette.common.white, 0.1),
          borderRadius: '3px'
        }
      }}>
        {navigation.map((item) => {
          if (item.adminOnly && user?.role !== 'admin') return null;

          const isActive = location.pathname === item.href ||
            (item.href !== '/dashboard' && location.pathname.startsWith(item.href));

          return (
            <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={isClosed && !isMobile ? item.name : ''} placement="right">
                <ListItemButton
                  component={Link}
                  to={item.href}
                  selected={isActive}
                  onClick={isMobile ? onClose : undefined}
                  sx={{
                    minHeight: 48,
                    justifyContent: isClosed && !isMobile ? 'center' : 'initial',
                    px: 2.5,
                    py: 1.5,
                    borderRadius: '12px',
                    transition: 'all 0.2s',
                    bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
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
                      mr: isClosed && !isMobile ? 0 : 2,
                      justifyContent: 'center',
                      color: isActive ? theme.palette.primary.main : theme.palette.text.secondary
                    }}
                  >
                    <item.icon size={20} />
                  </ListItemIcon>
                  {(!isClosed || isMobile) && (
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
          justifyContent: isClosed ? 'center' : 'flex-end',
        }}>
          <Tooltip title={isClosed ? 'Open Sidebar' : 'Close Sidebar'} placement="right">
            <IconButton
              onClick={onToggle}
              sx={{
                bgcolor: alpha(theme.palette.common.white, 0.05),
                '&:hover': {
                  bgcolor: alpha(theme.palette.common.white, 0.1),
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s'
              }}
            >
              <Menu size={20} />
            </IconButton>
          </Tooltip>
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
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            bgcolor: 'background.paper',
            borderRight: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
          },
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
            willChange: 'width',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
            bgcolor: 'background.paper',
            borderRight: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
            overflowX: 'hidden',
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
