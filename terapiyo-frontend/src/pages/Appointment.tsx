import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Avatar,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { tr } from 'date-fns/locale';
import {
  AccessTime,
  VideoCall,
  Payment,
  CheckCircle,
  Psychology,
  Star,
} from '@mui/icons-material';

const steps = ['Tarih ve Saat Seçimi', 'Seans Detayları', 'Ödeme'];

const timeSlots = [
  '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

const Appointment = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionType, setSessionType] = useState('video');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit');

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  bgcolor: 'white',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                  <DateCalendar
                    value={selectedDate}
                    onChange={handleDateChange}
                    sx={{
                      width: '100%',
                      '& .MuiPickersDay-root': {
                        borderRadius: '8px',
                      },
                    }}
                  />
                </LocalizationProvider>
              </Paper>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Müsait Saatler
                </Typography>
                <Grid container spacing={2}>
                  {timeSlots.map((time) => (
                    <Grid item xs={6} sm={3} key={time}>
                      <Button
                        fullWidth
                        variant={selectedTime === time ? 'contained' : 'outlined'}
                        onClick={() => setSelectedTime(time)}
                        sx={{
                          borderRadius: '12px',
                          py: 2,
                          borderColor: selectedTime === time ? 'transparent' : theme.palette.primary.main,
                        }}
                      >
                        {time}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      src="/therapists/therapist1.jpg"
                      sx={{ width: 64, height: 64, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Dr. Ayşe Yılmaz
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Klinik Psikolog
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Star sx={{ color: theme.palette.warning.main, mr: 1 }} />
                      <Typography variant="body2">
                        4.9 (124 değerlendirme)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Psychology sx={{ color: theme.palette.primary.main, mr: 1 }} />
                      <Typography variant="body2">
                        1500+ seans tamamlandı
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                    500 ₺ <Typography component="span" variant="body2" color="text.secondary">/seans</Typography>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: '16px',
                  bgcolor: 'white',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
              >
                <FormControl component="fieldset" sx={{ width: '100%', mb: 4 }}>
                  <FormLabel component="legend" sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}>
                    Görüşme Tipi
                  </FormLabel>
                  <RadioGroup
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value)}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: '12px',
                            border: `2px solid ${sessionType === 'video' ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1)}`,
                            cursor: 'pointer',
                          }}
                          onClick={() => setSessionType('video')}
                        >
                          <FormControlLabel
                            value="video"
                            control={<Radio />}
                            label={
                              <Box sx={{ ml: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  Video Görüşme
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Online görüntülü görüşme
                                </Typography>
                              </Box>
                            }
                            sx={{ m: 0 }}
                          />
                        </Paper>
                      </Grid>
                    </Grid>
                  </RadioGroup>
                </FormControl>

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Notlar (İsteğe bağlı)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Terapistinize iletmek istediğiniz notları buraya yazabilirsiniz..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Randevu Özeti
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tarih ve Saat
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {selectedDate?.toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                      {' '}
                      {selectedTime}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Görüşme Tipi
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      Video Görüşme
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Seans Ücreti
                    </Typography>
                    <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
                      500 ₺
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: '16px',
                  bgcolor: 'white',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
              >
                <FormControl component="fieldset" sx={{ width: '100%' }}>
                  <FormLabel component="legend" sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}>
                    Ödeme Yöntemi
                  </FormLabel>
                  <RadioGroup
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: '12px',
                            border: `2px solid ${paymentMethod === 'credit' ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1)}`,
                            cursor: 'pointer',
                          }}
                          onClick={() => setPaymentMethod('credit')}
                        >
                          <FormControlLabel
                            value="credit"
                            control={<Radio />}
                            label={
                              <Box sx={{ ml: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  Kredi/Banka Kartı
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Güvenli ödeme altyapısı
                                </Typography>
                              </Box>
                            }
                            sx={{ m: 0 }}
                          />
                        </Paper>
                      </Grid>
                    </Grid>
                  </RadioGroup>
                </FormControl>

                {paymentMethod === 'credit' && (
                  <Box sx={{ mt: 4 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Kart Üzerindeki İsim"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Kart Numarası"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Son Kullanma Tarihi"
                          placeholder="AA/YY"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="CVV"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Ödeme Özeti
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Seans Ücreti
                    </Typography>
                    <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
                      500 ₺
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Toplam
                    </Typography>
                    <Typography variant="h5" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                      500 ₺
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Ödemeyi tamamlayarak{' '}
                    <Link
                      href="/terms"
                      sx={{
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      kullanım koşullarını
                    </Link>
                    {' '}kabul etmiş olursunuz.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
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
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#1A365D',
              mb: 2,
            }}
          >
            Randevu Oluştur
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#4A5568',
              mb: 4,
            }}
          >
            Size en uygun zamanı seçin ve randevunuzu oluşturun
          </Typography>

          <Stepper
            activeStep={activeStep}
            sx={{
              '& .MuiStepLabel-root .Mui-completed': {
                color: theme.palette.primary.main,
              },
              '& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel': {
                color: theme.palette.primary.main,
              },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          {activeStep !== 0 && (
            <Button
              onClick={handleBack}
              sx={{
                mr: 2,
                borderRadius: '12px',
                textTransform: 'none',
                px: 4,
              }}
            >
              Geri
            </Button>
          )}
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? undefined : handleNext}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              px: 4,
            }}
          >
            {activeStep === steps.length - 1 ? 'Ödemeyi Tamamla' : 'Devam Et'}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Appointment;
