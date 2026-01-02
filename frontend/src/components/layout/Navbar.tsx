import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import { useNotifications } from '../../hooks/useNotifications';
import {
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
    <Box
      sx={{
        backdropFilter: 'blur(12px)',
        bgcolor: alpha(theme.palette.background.default, 0.8),
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
            sx={{
              mr: 2,
              display: { md: 'none' },
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              borderRadius: '12px',
              p: 1.5
            }}
          >
            <Menu size={24} />
          </IconButton>

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
            sx={{
              ml: 1,
              borderRadius: '12px',
              p: 1,
              '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.05) }
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: theme.palette.primary.main,
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}
            >
              {user?.firstName?.[0]}
            </Avatar>
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
              minWidth: 260,
              bgcolor: alpha('#0f172a', 0.95), // Deeper dark for better contrast
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }
          }}
        >
          <Box sx={{ px: 3, py: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: theme.palette.primary.main,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                {user?.firstName?.[0]}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" lineHeight={1.3}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {user?.email}
                </Typography>
              </Box>
            </Box>
            <Box sx={{
              display: 'inline-block',
              px: 2,
              py: 0.5,
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              borderRadius: '8px',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
            }}>
              <Typography variant="caption" color="primary.light" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {user?.role}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ borderColor: alpha(theme.palette.common.white, 0.1) }} />
          <Box sx={{ p: 1.5 }}>
            <MenuItem
              onClick={() => { navigate('/profile'); setUserMenuAnchorEl(null); }}
              sx={{
                borderRadius: '10px',
                py: 1.5,
                px: 2,
                mb: 0.5,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1)
                }
              }}
            >
              <ListItemIcon><User size={20} /></ListItemIcon>
              <Typography variant="body2" fontWeight={500}>Profile</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => { navigate('/settings'); setUserMenuAnchorEl(null); }}
              sx={{
                borderRadius: '10px',
                py: 1.5,
                px: 2,
                mb: 0.5,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1)
                }
              }}
            >
              <ListItemIcon><Settings size={20} /></ListItemIcon>
              <Typography variant="body2" fontWeight={500}>Settings</Typography>
            </MenuItem>
          </Box>

          <Divider sx={{ borderColor: alpha(theme.palette.common.white, 0.1) }} />

          <Box sx={{ p: 1.5 }}>
            <MenuItem
              onClick={handleLogout}
              sx={{
                color: theme.palette.error.light,
                borderRadius: '10px',
                py: 1.5,
                px: 2,
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.1)
                }
              }}
            >
              <ListItemIcon><LogOut size={20} color={theme.palette.error.light} /></ListItemIcon>
              <Typography variant="body2" fontWeight={500}>Logout</Typography>
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
    </Box>
  );
};

export default Navbar;
