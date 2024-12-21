import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
  Tooltip,
  MenuItem,
} from '@mui/material';
import { Menu as MenuIcon, AccountCircle } from '@mui/icons-material';
import { RootState } from '@/store/store';
import { setToken, setUser, clearAuth } from '@/store/slices/authSlice';
import authService from '@/services/auth.service';
import { toast } from 'react-toastify';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  // Kullanıcı durumuna göre menü öğelerini ayarla
  const menuItems = [
    { title: 'Ana Sayfa', path: '/' },
    { title: 'Terapistler', path: '/therapists' },
    { title: 'Hakkımızda', path: '/about' },
    { title: 'İletişim', path: '/contact' },
  ];

  const authItems = [
    { title: 'Giriş Yap', path: '/login' },
    { title: 'Kayıt Ol', path: '/register' },
  ];

  const userMenuItems = [
    { title: 'Profilim', path: '/profile' },
    { title: 'Randevularım', path: '/appointments' },
    { title: 'Mesajlarım', path: '/messages' },
    { title: 'Ayarlar', path: '/settings' },
  ];

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
    handleCloseNavMenu();
  };

  const handleUserMenuClick = (path: string) => {
    handleCloseUserMenu();
    navigate(path);
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    try {
      await authService.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch(setToken(''));
      dispatch(setUser(null));
      toast.success('Çıkış başarılı!');
      navigate('/');
    } catch (error) {
      toast.error('Çıkış yapılırken bir hata oluştu');
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      dispatch(setUser(JSON.parse(savedUser)));
    }
  }, []);

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo - Desktop */}
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            TERAPIYO
          </Typography>

          {/* Mobil Menü */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {menuItems.map((item) => (
                <MenuItem key={item.path} onClick={() => handleMenuClick(item.path)}>
                  <Typography textAlign="center">{item.title}</Typography>
                </MenuItem>
              ))}
              {!isAuthenticated && authItems.map((item) => (
                <MenuItem key={item.path} onClick={() => handleMenuClick(item.path)}>
                  <Typography textAlign="center">{item.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Logo - Mobile */}
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            TERAPIYO
          </Typography>

          {/* Desktop Menü */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {menuItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => handleMenuClick(item.path)}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {item.title}
              </Button>
            ))}
            {!isAuthenticated && authItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => handleMenuClick(item.path)}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {item.title}
              </Button>
            ))}
          </Box>

          {/* Kullanıcı Menüsü */}
          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? (
              <>
                <Tooltip title="Profil menüsünü aç">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    {user?.avatar ? (
                      <Avatar 
                        alt={user.firstName + ' ' + user.lastName} 
                        src={`${import.meta.env.VITE_API_URL.replace('/api/v1', '')}/${user.avatar}`}
                        sx={{ width: 40, height: 40 }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/default-avatar.png';
                          console.log('Avatar yüklenemedi:', {
                            originalSrc: target.src,
                            avatar: user.avatar,
                            baseUrl: import.meta.env.VITE_API_URL
                          });
                        }}
                      />
                    ) : (
                      <AccountCircle sx={{ color: 'white', fontSize: 40 }} />
                    )}
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {userMenuItems.map((item) => (
                    <MenuItem key={item.path} onClick={() => handleUserMenuClick(item.path)}>
                      <Typography textAlign="center">{item.title}</Typography>
                    </MenuItem>
                  ))}
                  <MenuItem onClick={handleLogout}>
                    <Typography textAlign="center">Çıkış Yap</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : null}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
