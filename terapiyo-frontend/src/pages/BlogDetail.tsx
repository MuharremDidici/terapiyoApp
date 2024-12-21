import React from 'react';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Chip,
  Divider,
  Button,
  useTheme,
  alpha,
} from '@mui/material';
import {
  AccessTime,
  ArrowBack,
  Facebook,
  Twitter,
  LinkedIn,
  WhatsApp,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const BlogDetail = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock veri
  const post = {
    id: 1,
    title: "Anksiyete ile Başa Çıkma Yöntemleri",
    content: `
      <p>Anksiyete, günümüzde birçok insanın yaşadığı yaygın bir mental sağlık sorunudur. Bu yazıda, anksiyete ile başa çıkmanın etkili yöntemlerini ele alacağız.</p>

      <h2>1. Nefes Egzersizleri</h2>
      <p>Derin nefes alma teknikleri, anksiyete semptomlarını hafifletmede oldukça etkilidir. 4-7-8 tekniği gibi yapılandırılmış nefes egzersizleri, vücudunuzu sakinleştirmeye yardımcı olabilir.</p>

      <h2>2. Düzenli Egzersiz</h2>
      <p>Fiziksel aktivite, endorfin salgılanmasını artırarak ruh halinizi iyileştirir ve anksiyete seviyenizi düşürür. Haftada en az 150 dakika orta yoğunlukta egzersiz yapmayı hedefleyin.</p>

      <h2>3. Mindfulness ve Meditasyon</h2>
      <p>Mindfulness uygulamaları, şimdiki ana odaklanmanıza ve endişelerden uzaklaşmanıza yardımcı olur. Günde sadece 10 dakikalık meditasyon bile büyük fark yaratabilir.</p>

      <h2>4. Sağlıklı Uyku Düzeni</h2>
      <p>Kaliteli uyku, mental sağlığınız için çok önemlidir. Düzenli bir uyku programı oluşturun ve uyku hijyeninize dikkat edin.</p>

      <h2>5. Profesyonel Destek Alma</h2>
      <p>Anksiyete ile başa çıkmakta zorlanıyorsanız, bir uzmandan yardım almaktan çekinmeyin. Terapi, anksiyete yönetiminde etkili bir yöntemdir.</p>
    `,
    image: "/blog/anxiety.jpg",
    category: "Anksiyete",
    author: {
      name: "Dr. Ayşe Yılmaz",
      avatar: "/therapists/therapist1.jpg",
      title: "Klinik Psikolog",
      bio: "10 yıllık klinik deneyime sahip uzman psikolog. Anksiyete ve depresyon tedavisi üzerine uzmanlaşmıştır.",
    },
    date: new Date("2023-12-15"),
    readTime: 5,
    tags: ["Anksiyete", "Mental Sağlık", "Stres Yönetimi"],
  };

  if (!post) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5">
          Blog yazısı bulunamadı.
        </Typography>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/blog')}
          sx={{ mt: 2 }}
        >
          Blog'a Dön
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Bölümü */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '300px', md: '400px' },
          bgcolor: 'grey.900',
          mb: 4,
        }}
      >
        <Box
          component="img"
          src={post.image}
          alt={post.title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.6,
          }}
        />
        <Container
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Chip
            label={post.category}
            sx={{
              mb: 2,
              color: 'white',
              bgcolor: alpha(theme.palette.primary.main, 0.8),
            }}
          />
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
            {post.title}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
              <Typography variant="body2">
                {post.readTime} dk okuma
              </Typography>
            </Box>
            <Typography variant="body2">
              {format(post.date, 'd MMM yyyy', { locale: tr })}
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md">
        {/* Yazar Bilgisi */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 4,
            p: 3,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          }}
        >
          <Avatar
            src={post.author.avatar}
            sx={{ width: 64, height: 64, mr: 2 }}
          />
          <Box>
            <Typography variant="h6">
              {post.author.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {post.author.title}
            </Typography>
            <Typography variant="body2">
              {post.author.bio}
            </Typography>
          </Box>
        </Box>

        {/* İçerik */}
        <Box
          sx={{
            '& h2': {
              mt: 4,
              mb: 2,
              fontSize: '1.5rem',
              fontWeight: 600,
            },
            '& p': {
              mb: 2,
              lineHeight: 1.8,
            },
          }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Etiketler */}
        <Box sx={{ my: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Etiketler
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {post.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onClick={() => navigate(`/blog?tag=${tag}`)}
                sx={{ borderRadius: '8px' }}
              />
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Paylaşım Butonları */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Bu Yazıyı Paylaş
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Facebook />}
              sx={{ bgcolor: '#1877F2' }}
            >
              Facebook
            </Button>
            <Button
              variant="contained"
              startIcon={<Twitter />}
              sx={{ bgcolor: '#1DA1F2' }}
            >
              Twitter
            </Button>
            <Button
              variant="contained"
              startIcon={<LinkedIn />}
              sx={{ bgcolor: '#0A66C2' }}
            >
              LinkedIn
            </Button>
            <Button
              variant="contained"
              startIcon={<WhatsApp />}
              sx={{ bgcolor: '#25D366' }}
            >
              WhatsApp
            </Button>
          </Box>
        </Box>

        {/* Geri Dön Butonu */}
        <Box sx={{ textAlign: 'center', pb: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/blog')}
          >
            Blog'a Dön
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default BlogDetail;
