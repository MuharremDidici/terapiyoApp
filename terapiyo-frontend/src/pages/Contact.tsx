import { Box, Container, Typography, TextField, Button, Grid } from '@mui/material';

const Contact = () => {
  return (
    <Box sx={{ py: { xs: 4, md: 8 } }}>
      <Container maxWidth="md">
        <Typography
          variant="h2"
          align="center"
          sx={{
            fontWeight: 700,
            mb: 6,
            fontSize: { xs: '2rem', md: '3rem' }
          }}
        >
          İletişim
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Bize Ulaşın
            </Typography>
            <Typography variant="body1" paragraph sx={{ mb: 4 }}>
              Sorularınız veya önerileriniz için bize ulaşabilirsiniz. En kısa sürede
              size geri dönüş yapacağız.
            </Typography>
            
            <Typography variant="body1" paragraph>
              <strong>E-posta:</strong> info@terapiyo.com
              <br />
              <strong>Telefon:</strong> +90 (212) XXX XX XX
              <br />
              <strong>Çalışma Saatleri:</strong> Pazartesi - Cuma, 09:00 - 18:00
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box component="form" noValidate sx={{ mt: { xs: 2, md: 0 } }}>
              <TextField
                fullWidth
                label="Ad Soyad"
                margin="normal"
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="E-posta"
                margin="normal"
                required
                type="email"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Mesaj"
                margin="normal"
                required
                multiline
                rows={4}
                sx={{ mb: 3 }}
              />
              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  py: 2,
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                Gönder
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Contact;
