import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
  Avatar,
  Pagination,
} from '@mui/material';
import {
  Search,
  FilterList,
  LocationOn,
  Language,
  Psychology,
  Star,
  VideoCall,
} from '@mui/icons-material';

interface Therapist {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  sessionCount: number;
  languages: string[];
  price: number;
  location: string;
  image: string;
  available: boolean;
}

const mockTherapists: Therapist[] = [
  {
    id: '1',
    name: 'Dr. Ayşe Yılmaz',
    title: 'Klinik Psikolog',
    specialties: ['Anksiyete', 'Depresyon', 'İlişki Problemleri'],
    rating: 4.9,
    reviewCount: 124,
    sessionCount: 1500,
    languages: ['Türkçe', 'İngilizce'],
    price: 500,
    location: 'İstanbul',
    image: '/therapists/therapist1.jpg',
    available: true,
  },
  {
    id: '2',
    name: 'Dr. Mehmet Kaya',
    title: 'Psikoterapist',
    specialties: ['Travma', 'Stres Yönetimi', 'Aile Terapisi'],
    rating: 4.8,
    reviewCount: 98,
    sessionCount: 1200,
    languages: ['Türkçe'],
    price: 450,
    location: 'Ankara',
    image: '/therapists/therapist2.jpg',
    available: true,
  },
  // Daha fazla terapist eklenebilir
];

const Therapists = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [page, setPage] = useState(1);

  const specialties = ['Anksiyete', 'Depresyon', 'Travma', 'Stres Yönetimi', 'İlişki Problemleri', 'Aile Terapisi'];
  const locations = ['İstanbul', 'Ankara', 'İzmir', 'Bursa'];
  const languages = ['Türkçe', 'İngilizce', 'Almanca', 'Fransızca'];

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
        py: { xs: 4, md: 8 },
      }}
    >
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 800,
              color: '#1A365D',
              mb: 2,
            }}
          >
            Uzman Terapistler
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#4A5568',
              fontWeight: 400,
              maxWidth: '700px',
              mx: 'auto',
            }}
          >
            Alanında uzman ve deneyimli terapistlerimizle tanışın,
            size en uygun olanı seçin.
          </Typography>
        </Box>

        {/* Search and Filter Section */}
        <Box
          sx={{
            mb: 6,
            p: 3,
            bgcolor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Terapist Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: theme.palette.primary.main }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Uzmanlık</InputLabel>
                <Select
                  value={selectedSpecialty}
                  label="Uzmanlık"
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {specialties.map((specialty) => (
                    <MenuItem key={specialty} value={specialty}>
                      {specialty}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Şehir</InputLabel>
                <Select
                  value={selectedLocation}
                  label="Şehir"
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {locations.map((location) => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Dil</InputLabel>
                <Select
                  value={selectedLanguage}
                  label="Dil"
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {languages.map((language) => (
                    <MenuItem key={language} value={language}>
                      {language}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Therapists List */}
        <Grid container spacing={4}>
          {mockTherapists.map((therapist) => (
            <Grid item xs={12} md={6} lg={4} key={therapist.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={therapist.image}
                    alt={therapist.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  {therapist.available && (
                    <Chip
                      label="Müsait"
                      color="success"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: alpha(theme.palette.success.main, 0.9),
                      }}
                    />
                  )}
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    {therapist.name}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {therapist.title}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={therapist.rating} precision={0.1} readOnly size="small" />
                      <Typography variant="body2" sx={{ ml: 1, color: '#4A5568' }}>
                        ({therapist.reviewCount} değerlendirme)
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {therapist.sessionCount}+ seans tamamlandı
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    {therapist.specialties.map((specialty) => (
                      <Chip
                        key={specialty}
                        label={specialty}
                        size="small"
                        sx={{
                          mr: 1,
                          mb: 1,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        }}
                      />
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOn sx={{ fontSize: 20, color: '#4A5568', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {therapist.location}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Language sx={{ fontSize: 20, color: '#4A5568', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {therapist.languages.join(', ')}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                      }}
                    >
                      {therapist.price} ₺
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: '#4A5568', ml: 1 }}
                      >
                        /seans
                      </Typography>
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        px: 3,
                      }}
                    >
                      Randevu Al
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <Pagination
            count={10}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: '8px',
              },
            }}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default Therapists;
