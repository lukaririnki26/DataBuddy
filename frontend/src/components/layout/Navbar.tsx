import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import { useNotifications } from '../../hooks/useNotifications';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  InputBase,
  Menu as MuiMenu,
  MenuItem,
  Badge,
  Avatar,
  Box,
  useTheme,
  alpha,
  Divider,
  ListItemIcon
} from '@mui/material';
import {
  Bell,
  Search,
  Menu,
  User,
  Settings,
  LogOut,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Clock,
  Info,
  Database
} from 'lucide-react';

interface NavbarProps {
  onMenuClick?: () => void;
  drawerWidth: number;
  isMobile: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, drawerWidth, isMobile }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);

  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { notifications, unread, markAsRead, markAllAsRead } = useNotifications({ limit: 10 });

  const isNotificationsOpen = Boolean(notificationsAnchorEl);
  const isUserMenuOpen = Boolean(userMenuAnchorEl);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/pipelines?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const notificationsMenuId = 'primary-search-account-menu-notifications';
  const userMenuId = 'primary-search-account-menu';

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backdropFilter: 'blur(12px)',
        bgcolor: alpha(theme.palette.background.default, 0.8),
        borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
        boxShadow: 'none',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <Menu />
          </IconButton>

          {/* Branding - visible on all screens now that navbar is full width */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 4 }}>
            <Box sx={{ position: 'relative', display: 'flex' }}>
              <Database size={28} color={theme.palette.primary.main} />
              <Box sx={{
                position: 'absolute', inset: 0,
                bgcolor: alpha(theme.palette.primary.main, 0.3),
                filter: 'blur(8px)',
                pointerEvents: 'none'
              }} />
            </Box>
            <Typography variant="h6" fontWeight="bold" sx={{
              display: { xs: 'none', sm: 'block' },
              background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              DataBuddy
            </Typography>
          </Box>

          {/* Search Bar */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              position: 'relative',
              borderRadius: '12px',
              bgcolor: alpha(theme.palette.common.white, 0.05),
              '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.1) },
              mr: 2,
              ml: 0,
              width: '100%',
              display: { xs: 'none', sm: 'block' }, // Hide on very small screens if needed, or adjust
              [theme.breakpoints.up('sm')]: { ml: 1, width: 'auto' },
            }}
          >
            <Box sx={{ p: 1.5, height: '100%', position: 'absolute', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search size={18} color={theme.palette.text.secondary} />
            </Box>
            <InputBase
              placeholder="Universal Research..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                color: 'inherit',
                '& .MuiInputBase-input': {
                  p: 1.5,
                  pl: 5,
                  transition: theme.transitions.create('width'),
                  width: '100%',
                  [theme.breakpoints.up('md')]: { width: '24ch', '&:focus': { width: '32ch' } },
                },
              }}
            />
          </Box>
        </Box>

        {/* Right Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <IconButton
            size="large"
            aria-label={`show ${unread} new notifications`}
            aria-controls={notificationsMenuId}
            aria-haspopup="true"
            onClick={(e) => setNotificationsAnchorEl(e.currentTarget)}
            color="inherit"
          >
            <Badge badgeContent={unread} color="error">
              <Bell size={20} />
            </Badge>
          </IconButton>

          {/* User Profile */}
          <IconButton
            edge="end"
            aria-label="account of current user"
            aria-controls={userMenuId}
            aria-haspopup="true"
            onClick={(e) => setUserMenuAnchorEl(e.currentTarget)}
            color="inherit"
            sx={{ ml: 1, borderRadius: '12px', p: 0.5, border: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}
          >
            <Avatar
              sx={{
                width: 32, height: 32,
                bgcolor: theme.palette.primary.main,
                fontSize: '0.875rem',
                fontWeight: 'bold'
              }}
            >
              {user?.firstName?.[0]}
            </Avatar>
            <Box sx={{ ml: 1.5, mr: 1, display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
              <Typography variant="subtitle2" lineHeight={1.2}>
                {user?.firstName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                {user?.role}
              </Typography>
            </Box>
            <ChevronDown size={14} style={{ marginRight: 8 }} />
          </IconButton>
        </Box>

        {/* User Menu */}
        <MuiMenu
          anchorEl={userMenuAnchorEl}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          id={userMenuId}
          keepMounted
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={isUserMenuOpen}
          onClose={() => setUserMenuAnchorEl(null)}
          PaperProps={{
            sx: {
              mt: 1.5,
              borderRadius: '16px',
              minWidth: 240,
              bgcolor: alpha('#0f172a', 0.95), // Deeper dark for better contrast
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }
          }}
        >
          <Box sx={{ px: 3, py: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
            <Typography variant="subtitle1" fontWeight="bold">{user?.firstName} {user?.lastName}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
            <Box sx={{ mt: 1, display: 'inline-block', px: 1, py: 0.5, bgcolor: alpha(theme.palette.primary.main, 0.2), borderRadius: '6px' }}>
              <Typography variant="caption" color="primary.light" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>
                {user?.role}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ borderColor: alpha(theme.palette.common.white, 0.1) }} />
          <Box sx={{ p: 1 }}>
            <MenuItem onClick={() => { navigate('/profile'); setUserMenuAnchorEl(null); }} sx={{ borderRadius: '8px' }}>
              <ListItemIcon><User size={18} /></ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={() => { navigate('/settings'); setUserMenuAnchorEl(null); }} sx={{ borderRadius: '8px' }}>
              <ListItemIcon><Settings size={18} /></ListItemIcon>
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.light, borderRadius: '8px', mt: 1 }}>
              <ListItemIcon><LogOut size={18} color={theme.palette.error.light} /></ListItemIcon>
              Logout
            </MenuItem>
          </Box>
        </MuiMenu>

        {/* Notifications Menu (Simplified) */}
        <MuiMenu
          anchorEl={notificationsAnchorEl}
          open={isNotificationsOpen}
          onClose={() => setNotificationsAnchorEl(null)}
          PaperProps={{
            sx: {
              mt: 1.5,
              width: 360,
              maxHeight: 480,
              borderRadius: '1rem',
              bgcolor: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`
            }
          }}
        >
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}>
            <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
            {unread > 0 && (
              <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }} onClick={() => markAllAsRead()}>
                Mark all as read
              </Typography>
            )}
          </Box>
          <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No new notifications</Typography>
              </Box>
            ) : (
              notifications.map(n => (
                <MenuItem key={n.id} onClick={() => markAsRead(n.id)} sx={{ whiteSpace: 'normal', py: 1.5, borderLeft: !n.isRead ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent' }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={!n.isRead ? 'bold' : 'normal'}>{n.title}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>{n.message}</Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </Box>
        </MuiMenu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
