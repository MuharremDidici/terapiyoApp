import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
  Avatar,
  Rating,
  Chip,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  VideoCall,
  Psychology,
  Security,
  AccessTime,
  Star,
  Groups,
  ArrowForward,
  CheckCircle,
  PlayCircle,
  HelpOutline
} from '@mui/icons-material';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: <VideoCall sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Online Terapi',
      description: 'Evinizin rahatlığında profesyonel destek alın',
    },
    {
      icon: <Psychology sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Uzman Terapistler',
      description: 'Deneyimli ve uzman terapistlerle tanışın',
    },
    {
      icon: <Security sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Güvenli Görüşme',
      description: 'End-to-end şifreli görüntülü görüşme',
    },
  ];

  const testimonials = [
    {
      name: 'Ayşe Y.',
      role: 'Danışan',
      avatar: '/avatars/avatar1.jpg',
      comment: 'Terapiyo sayesinde hayatım değişti. Artık kendimi çok daha iyi hissediyorum.',
      rating: 5,
    },
    {
      name: 'Mehmet K.',
      role: 'Danışan',
      avatar: '/avatars/avatar2.jpg',
      comment: 'Online terapi almak başta tedirgin ediciydi ama şimdi çok memnunum.',
      rating: 5,
    },
    {
      name: 'Zeynep A.',
      role: 'Danışan',
      avatar: '/avatars/avatar3.jpg',
      comment: 'Terapistimle görüşmelerimiz bana çok iyi geliyor. Teşekkürler Terapiyo!',
      rating: 5,
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Mutlu Danışan' },
    { number: '500+', label: 'Uzman Terapist' },
    { number: '50,000+', label: 'Başarılı Seans' },
    { number: '4.9', label: 'Ortalama Puan' },
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Terapist Seçin',
      description: 'Size en uygun terapisti filtreleme seçenekleriyle kolayca bulun',
      icon: <Psychology sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
    },
    {
      step: 2,
      title: 'Randevu Alın',
      description: 'Size uygun tarih ve saati seçerek hemen randevunuzu oluşturun',
      icon: <AccessTime sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
    },
    {
      step: 3,
      title: 'Görüşmeye Başlayın',
      description: 'Güvenli video görüşme ile terapinizi gerçekleştirin',
      icon: <VideoCall sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
    },
  ];

  const faqItems = [
    {
      question: 'Online terapi geleneksel terapiye göre etkili mi?',
      answer: 'Evet, yapılan araştırmalar online terapinin de en az yüz yüze terapi kadar etkili olduğunu göstermektedir. Üstelik ev konforunuzda ve daha esnek bir programla terapi alabilirsiniz.',
    },
    {
      question: 'Görüşmeler ne kadar güvenli?',
      answer: 'Tüm görüşmeler uçtan uca şifreleme ile korunmaktadır. Gizlilik ve güvenlik bizim için en önemli önceliktir.',
    },
    {
      question: 'Terapistler nasıl seçiliyor?',
      answer: 'Tüm terapistlerimiz lisanslı ve deneyimli uzmanlardır. Kapsamlı bir değerlendirme sürecinden geçerek platformumuza katılırlar.',
    },
    {
      question: 'Ödeme nasıl yapılıyor?',
      answer: 'Kredi kartı veya banka kartı ile güvenli ödeme yapabilirsiniz. İsterseniz seans paketleri alarak daha avantajlı fiyatlardan yararlanabilirsiniz.',
    },
  ];

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
          pt: { xs: 8, md: 0 },
          overflow: 'hidden',
        }}
      >
        {/* Decorative Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '50%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(49, 130, 206, 0.05) 0%, rgba(49, 130, 206, 0) 100%)',
            clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)',
          }}
        />

        {/* Content */}
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center" sx={{ minHeight: '100vh', py: 8 }}>
            {/* Left Content */}
            <Grid item xs={12} md={6}>
              <Box>
                <Box sx={{ mb: 4 }}>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#3182CE',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      mb: 2,
                      display: 'block',
                    }}
                  >
                    Online Terapi Platformu
                  </Typography>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                      fontWeight: 800,
                      color: '#1A365D',
                      lineHeight: 1.2,
                      letterSpacing: '-0.02em',
                      mb: 3,
                    }}
                  >
                    Profesyonel Psikolojik Destek
                    <Box
                      component="span"
                      sx={{
                        color: '#3182CE',
                        display: 'block',
                        mt: 1,
                      }}
                    >
                      Artık Çok Kolay
                    </Box>
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '1.25rem',
                      color: '#4A5568',
                      lineHeight: 1.7,
                      mb: 6,
                      maxWidth: '540px',
                    }}
                  >
                    Uzman psikologlarla güvenli ve özel online görüşmeler yapın. 
                    Ruh sağlığınız için profesyonel desteğe bir tık uzaktasınız.
                  </Typography>
                </Box>

                {/* CTA Buttons */}
                <Stack direction="row" spacing={3} sx={{ mb: 8 }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/search')}
                    sx={{
                      bgcolor: '#3182CE',
                      fontSize: '1.125rem',
                      py: 2,
                      px: 6,
                      borderRadius: '12px',
                      textTransform: 'none',
                      boxShadow: '0 4px 6px rgba(49, 130, 206, 0.15)',
                      '&:hover': {
                        bgcolor: '#2B6CB0',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 12px rgba(49, 130, 206, 0.2)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Hemen Başlayın
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/about')}
                    sx={{
                      color: '#3182CE',
                      borderColor: '#3182CE',
                      fontSize: '1.125rem',
                      py: 2,
                      px: 6,
                      borderRadius: '12px',
                      textTransform: 'none',
                      borderWidth: '2px',
                      '&:hover': {
                        borderColor: '#2B6CB0',
                        borderWidth: '2px',
                        bgcolor: 'rgba(49, 130, 206, 0.05)',
                      },
                    }}
                  >
                    Daha Fazla Bilgi
                  </Button>
                </Stack>

                {/* Trust Indicators */}
                <Grid container spacing={4}>
                  {[
                    { number: '10,000+', text: 'Başarılı Görüşme' },
                    { number: '500+', text: 'Uzman Psikolog' },
                    { number: '4.9/5', text: 'Memnuniyet Oranı' }
                  ].map((item, index) => (
                    <Grid item xs={4} key={index}>
                      <Typography
                        sx={{
                          fontSize: { xs: '1.5rem', md: '2rem' },
                          fontWeight: 800,
                          color: '#2D3748',
                          mb: 1,
                          lineHeight: 1,
                        }}
                      >
                        {item.number}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.875rem',
                          color: '#4A5568',
                          fontWeight: 500,
                        }}
                      >
                        {item.text}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>

            {/* Right Content - Feature Cards */}
            <Grid item xs={12} md={6}>
              <Grid container spacing={3}>
                {[
                  {
                    icon: '🔒',
                    title: 'Gizlilik ve Güvenlik',
                    desc: 'End-to-end şifreli görüşmeler ve %100 gizlilik garantisi',
                    color: '#3182CE'
                  },
                  {
                    icon: '👨‍⚕️',
                    title: 'Uzman Psikologlar',
                    desc: 'Alanında deneyimli, lisanslı uzman psikologlar',
                    color: '#38A169'
                  },
                  {
                    icon: '📅',
                    title: 'Esnek Planlama',
                    desc: '7/24 size uygun zamanda görüşme imkanı',
                    color: '#805AD5'
                  },
                  {
                    icon: '💰',
                    title: 'Uygun Fiyatlar',
                    desc: 'Herkes için erişilebilir terapi seçenekleri',
                    color: '#DD6B20'
                  }
                ].map((card, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box
                      sx={{
                        p: 4,
                        height: '100%',
                        bgcolor: '#FFFFFF',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '4px',
                          bgcolor: card.color,
                          transition: 'all 0.3s ease',
                        },
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
                          '&::before': {
                            height: '6px',
                          },
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          bgcolor: `${card.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          mb: 3,
                        }}
                      >
                        {card.icon}
                      </Box>
                      <Typography
                        sx={{
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: '#2D3748',
                          mb: 2,
                        }}
                      >
                        {card.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '1rem',
                          color: '#4A5568',
                          lineHeight: 1.6,
                        }}
                      >
                        {card.desc}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Nasıl Çalışır Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F8FAFC' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              component="span"
              sx={{
                fontSize: '1rem',
                fontWeight: 600,
                color: '#3182CE',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                mb: 2,
                display: 'block',
              }}
            >
              Kolay Kullanım
            </Typography>
            <Typography
              variant="h2"
              align="center"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 800,
                mb: 3,
              }}
            >
              Nasıl Çalışır?
            </Typography>
            <Typography
              sx={{
                fontSize: '1.25rem',
                color: '#4A5568',
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.7,
              }}
            >
              Üç basit adımda profesyonel psikolojik destek almaya başlayın
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                number: '01',
                title: 'Ücretsiz Kayıt',
                desc: 'Hızlı ve kolay bir şekilde hesabınızı oluşturun',
                color: '#3182CE'
              },
              {
                number: '02',
                title: 'Psikolog Seçimi',
                desc: 'Size en uygun psikoloğu seçin ve randevunuzu planlayın',
                color: '#38A169'
              },
              {
                number: '03',
                title: 'Online Görüşme',
                desc: 'Güvenli platformumuzda görüşmenizi gerçekleştirin',
                color: '#805AD5'
              }
            ].map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box
                  sx={{
                    p: 6,
                    height: '100%',
                    bgcolor: '#FFFFFF',
                    borderRadius: '20px',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                      '& .step-number': {
                        transform: 'scale(1.1)',
                        color: step.color,
                      },
                    },
                  }}
                >
                  <Typography
                    className="step-number"
                    sx={{
                      fontSize: '4rem',
                      fontWeight: 900,
                      color: '#E2E8F0',
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      transition: 'all 0.3s ease',
                      lineHeight: 1,
                    }}
                  >
                    {step.number}
                  </Typography>
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: '#2D3748',
                        mb: 3,
                      }}
                    >
                      {step.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '1.125rem',
                        color: '#4A5568',
                        lineHeight: 1.7,
                      }}
                    >
                      {step.desc}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              textAlign: 'center',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 700,
                mb: 3,
              }}
            >
              Hemen Başlayın
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                opacity: 0.9,
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              Size en uygun terapisti bulun ve ilk seansınızı planlayın.
              Profesyonel destek bir tık uzağınızda.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  backgroundColor: 'white',
                  color: theme.palette.primary.main,
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.9),
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Hemen Kaydol
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Giriş Yap
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
