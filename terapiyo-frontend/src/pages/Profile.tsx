import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Box,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Language as LanguageIcon,
  AccountCircle
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import { RootState } from '@/store/store';
import { setUser, updateUser } from '@/store/slices/authSlice';
import profileService from '@/services/profile.service';
import { User, UpdateProfileData } from '@/types/auth.types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const Profile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<UpdateProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '',
    notificationSettings: {
      email: true,
      push: true,
      sms: true
    }
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await profileService.getProfile();
        
        // Form state'ini güncelle
        setFormData({
          firstName: response.user.firstName || '',
          lastName: response.user.lastName || '',
          email: response.user.email || '',
          phone: response.user.phone || '',
          avatar: response.user.avatar || '',
          notificationSettings: response.user.notificationSettings || {
            email: true,
            push: true,
            sms: true
          }
        });
        
        // Redux store'u güncelle
        dispatch(setUser(response.user));
      } catch (error) {
        console.error('Profil yüklenirken hata:', error);
        toast.error('Profil bilgileri yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        notificationSettings: user.notificationSettings || {
          email: true,
          push: true,
          sms: true
        }
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (type: 'email' | 'push' | 'sms') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings!,
        [type]: e.target.checked
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await profileService.updateProfile(formData);
      
      // Redux store'u güncelle
      dispatch(setUser(response.user));
      
      // Form state'ini güncelle
      setFormData(response.user);
      
      // Başarı mesajı göster
      toast.success('Profil güncellendi');
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
      toast.error('Profil güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await profileService.updateAvatar(formData);
      console.log('Avatar response:', response);

      // Redux store'u güncelle
      dispatch(setUser(response.user));

      // Form state'ini güncelle
      setFormData(prev => ({
        ...prev,
        avatar: response.avatar
      }));

      // Başarı mesajı göster
      toast.success('Profil fotoğrafı güncellendi');
    } catch (error) {
      console.error('Avatar güncellenirken hata:', error);
      toast.error('Profil fotoğrafı güncellenirken hata oluştu');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading && !editMode) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Sol Taraf - Profil Kartı */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Box position="relative">
                  {formData.avatar ? (
                    <Avatar
                      alt={formData.firstName + ' ' + formData.lastName || 'User Avatar'}
                      src={`${import.meta.env.VITE_API_URL.replace('/api/v1', '')}/${formData.avatar}`}
                      sx={{ 
                        width: 150, 
                        height: 150,
                        border: `4px solid ${theme.palette.primary.main}`,
                        boxShadow: 3
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/default-avatar.png';
                        console.log('Avatar yüklenemedi:', {
                          originalSrc: target.src,
                          avatar: formData.avatar,
                          baseUrl: import.meta.env.VITE_API_URL
                        });
                      }}
                    />
                  ) : (
                    <Avatar sx={{ width: 150, height: 150 }}>
                      <AccountCircle sx={{ fontSize: 80 }} />
                    </Avatar>
                  )}
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="avatar-upload"
                    type="file"
                    onChange={handleAvatarChange}
                  />
                  <label htmlFor="avatar-upload">
                    <IconButton
                      component="span"
                      sx={{
                        position: 'absolute',
                        bottom: 5,
                        right: 5,
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        '&:hover': {
                          backgroundColor: theme.palette.primary.dark,
                        },
                      }}
                    >
                      <PhotoCameraIcon />
                    </IconButton>
                  </label>
                </Box>
                <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
                  {formData.firstName + ' ' + formData.lastName}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {formData.email}
                </Typography>
                <Typography color="textSecondary">
                  {formData.phone}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sağ Taraf - Sekmeler */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons={isMobile ? "auto" : false}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab icon={<PersonIcon />} label="Profil" />
              <Tab icon={<NotificationsIcon />} label="Bildirimler" />
              <Tab icon={<SecurityIcon />} label="Güvenlik" />
              <Tab icon={<LanguageIcon />} label="Tercihler" />
            </Tabs>

            {/* Profil Sekmesi */}
            <TabPanel value={tabValue} index={0}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">Kişisel Bilgiler</Typography>
                      {!editMode ? (
                        <IconButton onClick={() => setEditMode(true)} color="primary">
                          <EditIcon />
                        </IconButton>
                      ) : (
                        <Box>
                          <IconButton type="submit" color="primary" disabled={loading}>
                            <SaveIcon />
                          </IconButton>
                          <IconButton onClick={() => setEditMode(false)} color="error">
                            <CancelIcon />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                    <Divider sx={{ my: 2 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Ad"
                      name="firstName"
                      value={formData.firstName || ''}
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Soyad"
                      name="lastName"
                      value={formData.lastName || ''}
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="E-posta"
                      name="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Telefon"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                  </Grid>
                </Grid>
              </form>
            </TabPanel>

            {/* Bildirimler Sekmesi */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                Bildirim Tercihleri
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notificationSettings?.email}
                    onChange={handleNotificationChange('email')}
                    name="email"
                  />
                }
                label="E-posta Bildirimleri"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notificationSettings?.push}
                    onChange={handleNotificationChange('push')}
                    name="push"
                  />
                }
                label="Push Bildirimleri"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notificationSettings?.sms}
                    onChange={handleNotificationChange('sms')}
                    name="sms"
                  />
                }
                label="SMS Bildirimleri"
              />
            </TabPanel>

            {/* Güvenlik Sekmesi */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Güvenlik Ayarları
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/change-password')}
              >
                Şifre Değiştir
              </Button>
            </TabPanel>

            {/* Tercihler Sekmesi */}
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>
                Uygulama Tercihleri
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {/* Dil seçimi, tema tercihi vb. */}
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
