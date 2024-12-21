import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Grid,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Button,
  Card,
  CardContent,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  useTheme,
  alpha,
} from '@mui/material';
import {
  CreditCard,
  AccountBalance,
  Lock,
  CheckCircle,
  ContentCopy,
  Receipt,
  ArrowBack,
  ArrowForward,
  Close,
} from '@mui/icons-material';

const steps = ['Ödeme Yöntemi', 'Fatura Bilgileri', 'Onay'];

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'credit-card',
    name: 'Kredi/Banka Kartı',
    icon: <CreditCard />,
    description: 'Tüm kredi ve banka kartları ile güvenli ödeme',
  },
  {
    id: 'bank-transfer',
    name: 'Havale/EFT',
    icon: <AccountBalance />,
    description: 'Banka hesabımıza havale/EFT ile ödeme',
  },
];

const Payment = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState('credit-card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [billingInfo, setBillingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    taxId: '',
    taxOffice: '',
    companyName: '',
  });
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPayment(event.target.value);
  };

  const handleBillingInfoChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setBillingInfo({ ...billingInfo, [field]: event.target.value });
  };

  const handleSubmit = () => {
    // Ödeme işlemleri burada yapılacak
    setSuccessDialogOpen(true);
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const groups = numbers.match(/.{1,4}/g) || [];
    return groups.join(' ').substr(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return numbers.substr(0, 2) + '/' + numbers.substr(2, 2);
    }
    return numbers;
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Ödeme Yöntemi Seçin
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={selectedPayment}
                onChange={handlePaymentMethodChange}
              >
                <Grid container spacing={2}>
                  {paymentMethods.map((method) => (
                    <Grid item xs={12} key={method.id}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: '12px',
                          border: '2px solid',
                          borderColor: selectedPayment === method.id
                            ? theme.palette.primary.main
                            : 'transparent',
                          bgcolor: selectedPayment === method.id
                            ? alpha(theme.palette.primary.main, 0.1)
                            : 'background.paper',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                        }}
                      >
                        <FormControlLabel
                          value={method.id}
                          control={<Radio />}
                          label={
                            <Box sx={{ ml: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                {React.cloneElement(method.icon as React.ReactElement, {
                                  sx: { mr: 1, color: theme.palette.primary.main },
                                })}
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {method.name}
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {method.description}
                              </Typography>
                            </Box>
                          }
                          sx={{ m: 0, width: '100%' }}
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </RadioGroup>
            </FormControl>

            {selectedPayment === 'credit-card' && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Kart Bilgileri
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Kart Numarası"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CreditCard sx={{ color: theme.palette.primary.main }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Kart Üzerindeki İsim"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Son Kullanma Tarihi"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                      placeholder="AA/YY"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="CVV"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substr(0, 3))}
                      type="password"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Lock sx={{ color: theme.palette.primary.main }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {selectedPayment === 'bank-transfer' && (
              <Box sx={{ mt: 4 }}>
                <Alert
                  severity="info"
                  sx={{
                    mb: 3,
                    borderRadius: '12px',
                  }}
                >
                  Havale/EFT bilgilerini kopyalayıp ödemenizi gerçekleştirdikten sonra
                  dekontunuzu yükleyebilirsiniz.
                </Alert>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: '12px',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  }}
                >
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Banka
                        </Typography>
                        <Typography variant="body1">Yapı Kredi Bankası</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Hesap Sahibi
                        </Typography>
                        <Typography variant="body1">Terapiyo Danışmanlık Ltd. Şti.</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          IBAN
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body1" sx={{ mr: 1 }}>
                            TR12 3456 7890 1234 5678 9012 34
                          </Typography>
                          <IconButton size="small">
                            <ContentCopy sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Fatura Bilgileri
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ad Soyad"
                  value={billingInfo.fullName}
                  onChange={handleBillingInfoChange('fullName')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="E-posta"
                  type="email"
                  value={billingInfo.email}
                  onChange={handleBillingInfoChange('email')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefon"
                  value={billingInfo.phone}
                  onChange={handleBillingInfoChange('phone')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Şehir"
                  value={billingInfo.city}
                  onChange={handleBillingInfoChange('city')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adres"
                  multiline
                  rows={3}
                  value={billingInfo.address}
                  onChange={handleBillingInfoChange('address')}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Kurumsal Fatura için doldurunuz
                  </Typography>
                </Divider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Firma Adı"
                  value={billingInfo.companyName}
                  onChange={handleBillingInfoChange('companyName')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vergi Dairesi"
                  value={billingInfo.taxOffice}
                  onChange={handleBillingInfoChange('taxOffice')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Vergi Numarası"
                  value={billingInfo.taxId}
                  onChange={handleBillingInfoChange('taxId')}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Ödeme Özeti
            </Typography>
            <Card
              elevation={0}
              sx={{
                borderRadius: '12px',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                mb: 3,
              }}
            >
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle1">Seans Ücreti</Typography>
                      <Typography variant="subtitle1">500 ₺</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle1">KDV (%18)</Typography>
                      <Typography variant="subtitle1">90 ₺</Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6">Toplam</Typography>
                      <Typography variant="h6" color="primary">
                        590 ₺
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Typography variant="h6" sx={{ mb: 2 }}>
              Ödeme Yöntemi
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1">
                {paymentMethods.find(m => m.id === selectedPayment)?.name}
              </Typography>
              {selectedPayment === 'credit-card' && (
                <Typography variant="body2" color="text.secondary">
                  {cardNumber}
                </Typography>
              )}
            </Box>

            <Typography variant="h6" sx={{ mb: 2 }}>
              Fatura Bilgileri
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Ad Soyad
                </Typography>
                <Typography variant="body1">{billingInfo.fullName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  E-posta
                </Typography>
                <Typography variant="body1">{billingInfo.email}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Adres
                </Typography>
                <Typography variant="body1">
                  {billingInfo.address}, {billingInfo.city}
                </Typography>
              </Grid>
            </Grid>

            <Alert
              severity="info"
              icon={<Lock />}
              sx={{ mt: 3, borderRadius: '12px' }}
            >
              Tüm ödemeleriniz 256-bit SSL sertifikası ile güvence altındadır.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          }}
        >
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
            Ödeme
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {getStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              Geri
            </Button>
            <Button
              variant="contained"
              endIcon={activeStep === steps.length - 1 ? undefined : <ArrowForward />}
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            >
              {activeStep === steps.length - 1 ? 'Ödemeyi Tamamla' : 'Devam Et'}
            </Button>
          </Box>
        </Paper>

        {/* Başarılı Ödeme Dialog */}
        <Dialog
          open={successDialogOpen}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Ödeme Başarılı</Typography>
              <IconButton
                edge="end"
                onClick={() => setSuccessDialogOpen(false)}
              >
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircle
                sx={{
                  fontSize: 64,
                  color: theme.palette.success.main,
                  mb: 2,
                }}
              />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Ödemeniz Başarıyla Tamamlandı
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Randevunuz onaylandı. Faturanız e-posta adresinize gönderilecektir.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              startIcon={<Receipt />}
              onClick={() => setSuccessDialogOpen(false)}
            >
              Faturayı Görüntüle
            </Button>
            <Button
              variant="contained"
              onClick={() => setSuccessDialogOpen(false)}
            >
              Randevularıma Git
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Payment;
