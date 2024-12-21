import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Rating,
} from '@mui/material';

// Örnek veri
const mockTherapists = [
  {
    id: 1,
    name: 'Dr. Ayşe Yılmaz',
    specialties: ['Anksiyete', 'Depresyon', 'İlişki Sorunları'],
    rating: 4.8,
    reviewCount: 124,
    image: 'https://via.placeholder.com/150',
    price: '400 TL',
  },
  {
    id: 2,
    name: 'Dr. Mehmet Demir',
    specialties: ['Stres Yönetimi', 'Aile Terapisi'],
    rating: 4.6,
    reviewCount: 98,
    image: 'https://via.placeholder.com/150',
    price: '350 TL',
  },
];

const TherapistSearch = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('therapist.findTherapist')}
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="İsim veya uzmanlık alanı ile arayın..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 3 }}
        />
      </Box>

      <Grid container spacing={3}>
        {mockTherapists.map((therapist) => (
          <Grid item xs={12} md={6} key={therapist.id}>
            <Card>
              <Grid container>
                <Grid item xs={4}>
                  <CardMedia
                    component="img"
                    image={therapist.image}
                    alt={therapist.name}
                    sx={{ height: '100%', objectFit: 'cover' }}
                  />
                </Grid>
                <Grid item xs={8}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {therapist.name}
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      {therapist.specialties.map((specialty, index) => (
                        <Chip
                          key={index}
                          label={specialty}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={therapist.rating} precision={0.1} readOnly />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({therapist.reviewCount} değerlendirme)
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {therapist.price} / Seans
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => {}}
                    >
                      {t('appointment.schedule')}
                    </Button>
                  </CardContent>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default TherapistSearch;
