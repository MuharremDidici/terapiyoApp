import { Box, Container, Typography, Grid, Card, Avatar } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';

const About = () => {
  const teamMembers = [
    {
      name: 'Dr. Ayşe Yılmaz',
      role: 'Klinik Psikolog',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      description: 'Uzman klinik psikolog, 15+ yıl deneyim'
    },
    {
      name: 'Dr. Mehmet Kaya',
      role: 'Psikiyatrist',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      description: 'Uzman psikiyatrist, 10+ yıl deneyim'
    },
    {
      name: 'Zeynep Demir',
      role: 'Aile Terapisti',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      description: 'Uzman aile terapisti, 8+ yıl deneyim'
    }
  ];

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 100%)',
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h1"
            align="center"
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 800,
              mb: 3
            }}
          >
            Terapiyo Hakkında
          </Typography>
          <Typography
            variant="h5"
            align="center"
            sx={{
              maxWidth: '800px',
              mx: 'auto',
              opacity: 0.9
            }}
          >
            Ruh sağlığı hizmetlerini herkes için erişilebilir kılmak için çalışıyoruz
          </Typography>
        </Container>
      </Box>

      {/* Mission & Vision Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 6 }}>
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: 'primary.main'
                }}
              >
                Misyonumuz
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                Terapiyo olarak misyonumuz, herkesin kaliteli ruh sağlığı hizmetlerine
                erişebilmesini sağlamaktır. Online platformumuz aracılığıyla, uzman
                psikologlarla güvenli ve özel görüşmeler yapabilmeniz için en iyi hizmeti
                sunuyoruz.
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: 'primary.main'
                }}
              >
                Vizyonumuz
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                Ruh sağlığı hizmetlerini herkes için erişilebilir kılarak, toplum
                sağlığına katkıda bulunmayı hedefliyoruz. Teknolojinin gücünü
                kullanarak, kaliteli terapi hizmetlerini evinizin konforunda
                almanızı sağlıyoruz.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
              alt="Team meeting"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 4,
                boxShadow: 3
              }}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Values Section */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 700,
              mb: 6,
              color: 'primary.main'
            }}
          >
            Değerlerimiz
          </Typography>

          <Grid container spacing={4}>
            {[
              {
                icon: <SecurityIcon sx={{ fontSize: 40 }} />,
                title: 'Gizlilik ve Güven',
                description: 'End-to-end şifreli görüşmeler ve %100 gizlilik garantisi'
              },
              {
                icon: <PsychologyIcon sx={{ fontSize: 40 }} />,
                title: 'Profesyonellik',
                description: 'Alanında uzman ve deneyimli psikologlarla çalışıyoruz'
              },
              {
                icon: <AccessTimeIcon sx={{ fontSize: 40 }} />,
                title: 'Erişilebilirlik',
                description: '7/24 size uygun zamanda görüşme imkanı'
              },
              {
                icon: <StarIcon sx={{ fontSize: 40 }} />,
                title: 'Yenilikçilik',
                description: 'Teknolojik gelişmeleri yakından takip ederek sürekli gelişiyoruz'
              }
            ].map((value, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-8px)'
                    }
                  }}
                >
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {value.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {value.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {value.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Team Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: 700,
            mb: 6,
            color: 'primary.main'
          }}
        >
          Ekibimiz
        </Typography>

        <Grid container spacing={4}>
          {teamMembers.map((member, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 4,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)'
                  }
                }}
              >
                <Avatar
                  src={member.image}
                  alt={member.name}
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    boxShadow: 2
                  }}
                />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {member.name}
                </Typography>
                <Typography variant="subtitle1" color="primary.main" gutterBottom>
                  {member.role}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {member.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {[
              { number: '10,000+', text: 'Başarılı Görüşme' },
              { number: '500+', text: 'Uzman Psikolog' },
              { number: '4.9/5', text: 'Memnuniyet Oranı' },
              { number: '50+', text: 'İl Genelinde Hizmet' }
            ].map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      mb: 1
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    {stat.text}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default About;
