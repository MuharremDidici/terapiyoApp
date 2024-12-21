import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Avatar,
  Button,
  Chip,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Card,
  CardContent,
  useTheme,
  alpha,
  Tab,
  Tabs,
} from '@mui/material';
import {
  VideoCall,
  Psychology,
  School,
  Language,
  Star,
  AccessTime,
  CalendarToday,
  LocationOn,
  VerifiedUser,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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
      id={`therapist-tabpanel-${index}`}
      aria-labelledby={`therapist-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const TherapistDetail = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const mockTherapist = {
    id: '1',
    name: 'Dr. Ayşe Yılmaz',
    title: 'Klinik Psikolog',
    image: '/therapists/therapist1.jpg',
    rating: 4.9,
    reviewCount: 124,
    sessionCount: 1500,
    experience: 8,
    education: [
      {
        degree: 'Doktora',
        school: 'İstanbul Üniversitesi',
        field: 'Klinik Psikoloji',
        year: '2018',
      },
      {
        degree: 'Yüksek Lisans',
        school: 'Boğaziçi Üniversitesi',
        field: 'Psikoloji',
        year: '2015',
      },
    ],
    specialties: [
      'Anksiyete',
      'Depresyon',
      'İlişki Problemleri',
      'Stres Yönetimi',
      'Travma Sonrası Stres Bozukluğu',
    ],
    languages: ['Türkçe', 'İngilizce'],
    about: 'Merhaba, ben Dr. Ayşe Yılmaz. 8 yıllık klinik deneyimim boyunca, bireylerin ruh sağlığı yolculuklarında onlara eşlik etmekten büyük mutluluk duyuyorum. Her danışanın benzersiz olduğuna inanıyor ve terapi sürecini kişiye özel olarak şekillendiriyorum. Güvenli ve destekleyici bir ortamda, birlikte iyileşme ve gelişme yolculuğuna çıkmak için sizleri bekliyorum.',
    price: 500,
    location: 'İstanbul',
    certificates: [
      'Türk Psikologlar Derneği Üyeliği',
      'EMDR Terapisi Sertifikası',
      'Bilişsel Davranışçı Terapi Sertifikası',
    ],
  };

  const mockReviews = [
    {
      id: 1,
      name: 'Mehmet Y.',
      rating: 5,
      date: '15 Aralık 2023',
      comment: 'Dr. Ayşe Hanım\'ın profesyonel yaklaşımı ve samimi tavırları sayesinde terapiden çok verim aldım. Kendimi daha iyi hissediyorum.',
    },
    {
      id: 2,
      name: 'Zeynep K.',
      rating: 5,
      date: '10 Aralık 2023',
      comment: 'Anksiyete problemlerim için aldığım destek sayesinde hayatım olumlu yönde değişti. Teşekkürler!',
    },
  ];

  const timeSlots = [
    { day: 'Pazartesi', slots: ['09:00', '10:00', '14:00', '15:00'] },
    { day: 'Salı', slots: ['11:00', '13:00', '16:00'] },
    { day: 'Çarşamba', slots: ['09:00', '10:00', '14:00'] },
    { day: 'Perşembe', slots: ['13:00', '14:00', '15:00', '16:00'] },
    { day: 'Cuma', slots: ['10:00', '11:00', '14:00'] },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
        py: { xs: 4, md: 8 },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Sol Profil Kartı */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                bgcolor: 'white',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                position: 'sticky',
                top: 24,
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar
                  src={mockTherapist.image}
                  sx={{
                    width: 160,
                    height: 160,
                    mx: 'auto',
                    mb: 2,
                    border: `4px solid ${theme.palette.primary.main}`,
                  }}
                />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {mockTherapist.name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                  {mockTherapist.title}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    <Star sx={{ color: theme.palette.warning.main, mr: 0.5 }} />
                    <Typography variant="body2">
                      {mockTherapist.rating} ({mockTherapist.reviewCount} değerlendirme)
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  {mockTherapist.specialties.slice(0, 3).map((specialty) => (
                    <Chip
                      key={specialty}
                      label={specialty}
                      size="small"
                      sx={{
                        m: 0.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                      <Psychology sx={{ color: theme.palette.primary.main }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${mockTherapist.sessionCount}+ Seans`}
                    secondary="Tamamlanan Görüşme"
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                      <AccessTime sx={{ color: theme.palette.primary.main }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${mockTherapist.experience} Yıl`}
                    secondary="Deneyim"
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                      <LocationOn sx={{ color: theme.palette.primary.main }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={mockTherapist.location}
                    secondary="Konum"
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                      <Language sx={{ color: theme.palette.primary.main }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={mockTherapist.languages.join(', ')}
                    secondary="Konuşulan Diller"
                  />
                </ListItem>
              </List>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ color: theme.palette.primary.main, textAlign: 'center', mb: 2 }}>
                  {mockTherapist.price} ₺ <Typography component="span" variant="body2" color="text.secondary">/seans</Typography>
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/appointment')}
                  startIcon={<CalendarToday />}
                  sx={{
                    borderRadius: '12px',
                    py: 1.5,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                  }}
                >
                  Randevu Al
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Sağ İçerik Alanı */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: '16px',
                bgcolor: 'white',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                mb: 4,
              }}
            >
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 500,
                  },
                }}
              >
                <Tab label="Hakkında" />
                <Tab label="Değerlendirmeler" />
                <Tab label="Müsait Saatler" />
              </Tabs>

              {/* Hakkında */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ p: 3 }}>
                  <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
                    {mockTherapist.about}
                  </Typography>

                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Eğitim
                  </Typography>
                  <List>
                    {mockTherapist.education.map((edu, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                            <School sx={{ color: theme.palette.primary.main }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                              {edu.degree} - {edu.field}
                            </Typography>
                          }
                          secondary={`${edu.school}, ${edu.year}`}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Typography variant="h6" sx={{ mt: 4, mb: 3, fontWeight: 600 }}>
                    Sertifikalar ve Üyelikler
                  </Typography>
                  <List>
                    {mockTherapist.certificates.map((cert, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                            <VerifiedUser sx={{ color: theme.palette.primary.main }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={cert} />
                      </ListItem>
                    ))}
                  </List>

                  <Typography variant="h6" sx={{ mt: 4, mb: 3, fontWeight: 600 }}>
                    Uzmanlık Alanları
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {mockTherapist.specialties.map((specialty) => (
                      <Chip
                        key={specialty}
                        label={specialty}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          borderRadius: '8px',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </TabPanel>

              {/* Değerlendirmeler */}
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 4,
                      p: 3,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      borderRadius: '12px',
                    }}
                  >
                    <Box sx={{ textAlign: 'center', mr: 4 }}>
                      <Typography variant="h3" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                        {mockTherapist.rating}
                      </Typography>
                      <Rating value={mockTherapist.rating} precision={0.1} readOnly />
                      <Typography variant="body2" color="text.secondary">
                        {mockTherapist.reviewCount} değerlendirme
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ mx: 4 }} />
                    <Box>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        Danışanlarımızın %98'i memnun ayrıldı
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Son 30 günde 28 yeni değerlendirme
                      </Typography>
                    </Box>
                  </Box>

                  {mockReviews.map((review) => (
                    <Card
                      key={review.id}
                      sx={{
                        mb: 2,
                        borderRadius: '12px',
                        boxShadow: 'none',
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                            {review.name[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                              {review.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {review.date}
                            </Typography>
                          </Box>
                          <Rating
                            value={review.rating}
                            readOnly
                            size="small"
                            sx={{ ml: 'auto' }}
                          />
                        </Box>
                        <Typography variant="body2">{review.comment}</Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </TabPanel>

              {/* Müsait Saatler */}
              <TabPanel value={tabValue} index={2}>
                <Box sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 3, color: 'text.secondary' }}>
                    Önümüzdeki 7 gün için müsait saatler
                  </Typography>
                  {timeSlots.map((day, index) => (
                    <Box key={index} sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        {day.day}
                      </Typography>
                      <Grid container spacing={2}>
                        {day.slots.map((time) => (
                          <Grid item xs={6} sm={3} key={time}>
                            <Button
                              fullWidth
                              variant="outlined"
                              onClick={() => navigate('/appointment')}
                              sx={{
                                borderRadius: '12px',
                                py: 1.5,
                                borderColor: theme.palette.primary.main,
                                color: theme.palette.primary.main,
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                },
                              }}
                            >
                              {time}
                            </Button>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ))}
                </Box>
              </TabPanel>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default TherapistDetail;
