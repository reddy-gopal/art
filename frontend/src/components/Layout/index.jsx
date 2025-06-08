import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Badge,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Explore as ExploreIcon,
  ShoppingCart as CartIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  LocalShipping as OrdersIcon,
  Payment as CheckoutIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { logout } from '../../store/slices/authSlice';
import { clearUserData } from '../../store/slices/userSlice';

const drawerWidth = 240;

const Layout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.user);
  const cartItems = useSelector((state) => state.cart?.items || []);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearUserData());
    navigate('/login');
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Explore', icon: <ExploreIcon />, path: '/explore' },
    { 
      text: 'Cart', 
      icon: <Badge badgeContent={cartItems.length} color="error"><CartIcon /></Badge>, 
      path: '/cart' 
    },
    { text: 'Orders', icon: <OrdersIcon />, path: '/orders' },
    { text: 'Create Post', icon: <AddIcon />, path: '/create-post' },
  ];

  const drawer = (
    <Box>
      <Toolbar sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        background: theme.palette.background.paper,
      }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Artloom
        </Typography>
      </Toolbar>
      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              my: 0.5,
              mx: 1,
              borderRadius: 2,
              '&.Mui-selected': {
                backgroundColor: `${theme.palette.primary.main}15`,
                color: theme.palette.primary.main,
                '& .MuiListItemIcon-root': {
                  color: theme.palette.primary.main,
                },
              },
              '&:hover': {
                backgroundColor: `${theme.palette.primary.main}10`,
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: location.pathname === item.path ? 600 : 400,
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        color="inherit"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          transition: 'all 0.3s ease',
          boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.05)' : 'none',
          backdropFilter: 'blur(8px)',
          backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.8)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2, 
                display: { sm: 'none' },
                '&:hover': { transform: 'scale(1.1)' },
                transition: 'transform 0.2s',
              }}
            >
              <MenuIcon />
            </IconButton>

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title="Notifications" arrow>
                <IconButton 
                  color="inherit" 
                  sx={{ 
                    '&:hover': { transform: 'scale(1.1)' },
                    transition: 'transform 0.2s',
                  }}
                >
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title="Account settings" arrow>
                <IconButton 
                  onClick={handleMenu} 
                  sx={{ 
                    p: 0,
                    border: '2px solid transparent',
                    '&:hover': { 
                      border: `2px solid ${theme.palette.primary.main}`,
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <Avatar 
                    alt={profile?.username} 
                    src={profile?.avatar}
                    sx={{ 
                      width: 40, 
                      height: 40,
                    }}
                  />
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                TransitionComponent={Fade}
                sx={{
                  '& .MuiPaper-root': {
                    borderRadius: 2,
                    minWidth: 180,
                    boxShadow: theme.shadows[3],
                  },
                }}
              >
                <MenuItem 
                  onClick={() => {
                    handleClose();
                    navigate('/profile');
                  }}
                  sx={{ 
                    py: 1.5,
                    '&:hover': { backgroundColor: `${theme.palette.primary.main}10` },
                  }}
                >
                  <ListItemIcon>
                    <PersonIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <Typography variant="body2">Profile</Typography>
                </MenuItem>
                <MenuItem 
                  onClick={handleLogout}
                  sx={{ 
                    py: 1.5,
                    '&:hover': { backgroundColor: `${theme.palette.error.main}10` },
                  }}
                >
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <Typography variant="body2" color="error">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: '4px 0 8px rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: '4px 0 8px rgba(0, 0, 0, 0.05)',
              background: theme.palette.background.paper,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          minHeight: '100vh',
          background: theme.palette.background.default,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 