import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  CalendarMonth,
  AccessTime,
  LocationOn,
  VideoCameraFront,
  Cancel,
  Edit,
  Close,
  CheckCircle,
  Warning,
  Schedule,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface Appointment {
  id: number;
  therapistName: string;
  therapistAvatar: string;
  date: Date;
  time: string;
  duration: number;
  type: 'online' | 'office';
  location?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
  price: number;
}

const Appointments = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Mock randevu verileri
  const appointments: Appointment[] = [
    {
      id: 1,
      therapistName: 'Dr. Ayşe Yılmaz',
      therapistAvatar: '/therapists/therapist1.jpg',
      date: new Date('2024-12-22'),
      time: '14:30',
      duration: 50,
      type: 'online',
      status: 'upcoming',
      price: 500,
    },
    {
      id: 2,
      therapistName: 'Dr. Mehmet Kaya',
      therapistAvatar: '/therapists/therapist2.jpg',
      date: new Date('2024-12-25'),
      time: '16:00',
      duration: 50,
      type: 'office',
      location: 'Kadıköy Ofisi, İstanbul',
      status: 'upcoming',
      price: 600,
    },
    {
      id: 3,
      therapistName: 'Dr. Ayşe Yılmaz',
      therapistAvatar: '/therapists/therapist1.jpg',
      date: new Date('2024-12-15'),
      time: '11:00',
      duration: 50,
      type: 'online',
      status: 'completed',
      notes: 'Ev ödevleri verildi.',
      price: 500,
    },
    {
      id: 4,
      therapistName: 'Dr. Mehmet Kaya',
      therapistAvatar: '/therapists/therapist2.jpg',
      date: new Date('2024-12-10'),
      time: '15:30',
      duration: 50,
      type: 'office',
      location: 'Kadıköy Ofisi, İstanbul',
      status: 'cancelled',
      price: 600,
    },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleCancelAppointment = () => {
    // Randevu iptal işlemleri burada yapılacak
    setCancelDialogOpen(false);
  };

  const handleJoinCall = (appointmentId: number) => {
    navigate(`/video-call/${appointmentId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return theme.palette.primary.main;
      case 'completed':
        return theme.palette.success.main;
      case 'cancelled':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Yaklaşan';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Schedule />;
      case 'completed':
        return <CheckCircle />;
      case 'cancelled':
        return <Cancel />;
      default:
        return null;
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (activeTab === 0) return appointment.status === 'upcoming';
    if (activeTab === 1) return appointment.status === 'completed';
    return appointment.status === 'cancelled';
  });

  return (
    <Box sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
          Randevularım
        </Typography>

        {/* Sekmeler */}
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                py: 2,
                fontSize: '1rem',
              },
            }}
          >
            <Tab
              icon={<Schedule sx={{ mr: 1 }} />}
              label="Yaklaşan"
              iconPosition="start"
            />
            <Tab
              icon={<CheckCircle sx={{ mr: 1 }} />}
              label="Tamamlanan"
              iconPosition="start"
            />
            <Tab
              icon={<Cancel sx={{ mr: 1 }} />}
              label="İptal Edilen"
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Randevu Listesi */}
        <Grid container spacing={3}>
          {filteredAppointments.map((appointment) => (
            <Grid item xs={12} md={6} key={appointment.id}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
                onClick={() => handleAppointmentClick(appointment)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={appointment.therapistAvatar}
                      sx={{ width: 56, height: 56, mr: 2 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ mb: 0.5 }}>
                        {appointment.therapistName}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(appointment.status)}
                        label={getStatusText(appointment.status)}
                        size="small"
                        sx={{
                          bgcolor: alpha(getStatusColor(appointment.status), 0.1),
                          color: getStatusColor(appointment.status),
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                    <Typography
                      variant="h6"
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    >
                      {appointment.price} ₺
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarMonth sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body1">
                          {format(appointment.date, 'd MMMM yyyy', { locale: tr })}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body1">
                          {appointment.time} ({appointment.duration} dk)
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {appointment.type === 'online' ? (
                          <VideoCameraFront sx={{ mr: 1, color: 'text.secondary' }} />
                        ) : (
                          <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                        )}
                        <Typography variant="body1">
                          {appointment.type === 'online'
                            ? 'Online Görüşme'
                            : appointment.location}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {appointment.status === 'upcoming' && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                      {appointment.type === 'online' && (
                        <Button
                          variant="contained"
                          startIcon={<VideoCameraFront />}
                          fullWidth
                          onClick={() => handleJoinCall(appointment.id)}
                        >
                          Görüşmeye Katıl
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          setCancelDialogOpen(true);
                        }}
                      >
                        İptal Et
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Randevu Detay Dialog */}
        <Dialog
          open={Boolean(selectedAppointment)}
          onClose={() => setSelectedAppointment(null)}
          maxWidth="sm"
          fullWidth
        >
          {selectedAppointment && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Randevu Detayları</Typography>
                  <IconButton
                    edge="end"
                    onClick={() => setSelectedAppointment(null)}
                  >
                    <Close />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent dividers>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    src={selectedAppointment.therapistAvatar}
                    sx={{ width: 64, height: 64, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                      {selectedAppointment.therapistName}
                    </Typography>
                    <Chip
                      icon={getStatusIcon(selectedAppointment.status)}
                      label={getStatusText(selectedAppointment.status)}
                      size="small"
                      sx={{
                        bgcolor: alpha(getStatusColor(selectedAppointment.status), 0.1),
                        color: getStatusColor(selectedAppointment.status),
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                </Box>

                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Randevu Bilgileri
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Tarih
                    </Typography>
                    <Typography variant="body1">
                      {format(selectedAppointment.date, 'd MMMM yyyy', { locale: tr })}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Saat
                    </Typography>
                    <Typography variant="body1">
                      {selectedAppointment.time} ({selectedAppointment.duration} dk)
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Görüşme Tipi
                    </Typography>
                    <Typography variant="body1">
                      {selectedAppointment.type === 'online' ? 'Online Görüşme' : 'Ofis Görüşmesi'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Ücret
                    </Typography>
                    <Typography variant="body1">
                      {selectedAppointment.price} ₺
                    </Typography>
                  </Grid>
                  {selectedAppointment.location && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Konum
                      </Typography>
                      <Typography variant="body1">
                        {selectedAppointment.location}
                      </Typography>
                    </Grid>
                  )}
                  {selectedAppointment.notes && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Notlar
                      </Typography>
                      <Typography variant="body1">
                        {selectedAppointment.notes}
                      </Typography>
                    </Grid>
                  )}
                </Grid>

                {selectedAppointment.status === 'upcoming' && (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {selectedAppointment.type === 'online' && (
                      <Button
                        variant="contained"
                        startIcon={<VideoCameraFront />}
                        fullWidth
                        onClick={() => handleJoinCall(selectedAppointment.id)}
                      >
                        Görüşmeye Katıl
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      fullWidth
                    >
                      Düzenle
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      fullWidth
                      onClick={() => setCancelDialogOpen(true)}
                    >
                      İptal Et
                    </Button>
                  </Box>
                )}
              </DialogContent>
            </>
          )}
        </Dialog>

        {/* İptal Onay Dialog */}
        <Dialog
          open={cancelDialogOpen}
          onClose={() => setCancelDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Warning sx={{ color: theme.palette.error.main, mr: 1 }} />
              Randevu İptali
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography>
              Bu randevuyu iptal etmek istediğinizden emin misiniz?
              İptal edilen randevular için iade politikası geçerlidir.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelDialogOpen(false)}>
              Vazgeç
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleCancelAppointment}
            >
              İptal Et
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Appointments;
