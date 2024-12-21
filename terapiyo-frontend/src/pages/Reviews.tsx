import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Rating,
  Avatar,
  Button,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  LinearProgress,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Star,
  ThumbUp,
  MoreVert,
  Search,
  Sort,
  Flag,
  Edit,
  Delete,
  Close,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Review {
  id: number;
  therapistId: number;
  therapistName: string;
  therapistAvatar: string;
  userId: number;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: Date;
  likes: number;
  isLiked: boolean;
  isVerified: boolean;
  tags: string[];
}

const Reviews = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('all');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    tags: [] as string[],
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Mock veriler
  const reviews: Review[] = [
    {
      id: 1,
      therapistId: 1,
      therapistName: 'Dr. Ayşe Yılmaz',
      therapistAvatar: '/therapists/therapist1.jpg',
      userId: 1,
      userName: 'Mehmet A.',
      userAvatar: '',
      rating: 5,
      comment: "Çok faydalı bir görüşmeydi. Dr. Ayşe Hanım'ın yaklaşımı ve profesyonelliği gerçekten etkileyiciydi. Kendimi çok rahat hissettim ve sorunlarımla başa çıkmada büyük ilerleme kaydettim.",
      date: new Date('2023-12-15'),
      likes: 12,
      isLiked: false,
      isVerified: true,
      tags: ['Profesyonel', 'Anlayışlı', 'Yardımsever'],
    },
    {
      id: 2,
      therapistId: 1,
      therapistName: 'Dr. Ayşe Yılmaz',
      therapistAvatar: '/therapists/therapist1.jpg',
      userId: 2,
      userName: 'Zeynep K.',
      userAvatar: '',
      rating: 4,
      comment: 'Görüşmelerimiz oldukça verimli geçiyor. Kendisi dinleme konusunda çok iyi ve verdiği öneriler gerçekten işe yarıyor.',
      date: new Date('2023-12-10'),
      likes: 8,
      isLiked: true,
      isVerified: true,
      tags: ['Empatik', 'Çözüm Odaklı'],
    },
  ];

  const availableTags = [
    'Profesyonel',
    'Anlayışlı',
    'Yardımsever',
    'Empatik',
    'Çözüm Odaklı',
    'Güvenilir',
    'Sabırlı',
    'Deneyimli',
  ];

  const handleLikeReview = (reviewId: number) => {
    // Like işlemleri burada yapılacak
  };

  const handleReportReview = (reviewId: number) => {
    // Şikayet işlemleri burada yapılacak
  };

  const handleSubmitReview = () => {
    // Yorum gönderme işlemleri burada yapılacak
    setReviewDialogOpen(false);
  };

  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const filteredReviews = reviews
    .filter(review => {
      const matchesSearch = review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          review.userName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
      const matchesTags = selectedTags.length === 0 ||
                         selectedTags.every(tag => review.tags.includes(tag));
      return matchesSearch && matchesRating && matchesTags;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.date.getTime() - a.date.getTime();
        case 'oldest':
          return a.date.getTime() - b.date.getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  const ratingStats = {
    average: 4.5,
    total: reviews.length,
    distribution: {
      5: 65,
      4: 20,
      3: 10,
      2: 3,
      1: 2,
    },
  };

  return (
    <Box sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Üst Başlık ve İstatistikler */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ mb: 1, color: theme.palette.primary.main }}>
                  {ratingStats.average}
                </Typography>
                <Rating value={ratingStats.average} precision={0.5} readOnly size="large" />
                <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary' }}>
                  {ratingStats.total} değerlendirme
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              {[5, 4, 3, 2, 1].map((rating) => (
                <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ mr: 1, minWidth: 20 }}>
                    {rating}
                  </Typography>
                  <Star sx={{ color: theme.palette.warning.main, mr: 1, fontSize: 20 }} />
                  <Box sx={{ flexGrow: 1, mr: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={ratingStats.distribution[rating as keyof typeof ratingStats.distribution]}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: theme.palette.primary.main,
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ minWidth: 40 }}>
                    {ratingStats.distribution[rating as keyof typeof ratingStats.distribution]}%
                  </Typography>
                </Box>
              ))}
            </Grid>
          </Grid>
        </Paper>

        {/* Filtreler ve Arama */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Yorumlarda ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sıralama</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <Sort />
                  </InputAdornment>
                }
              >
                <MenuItem value="newest">En Yeni</MenuItem>
                <MenuItem value="oldest">En Eski</MenuItem>
                <MenuItem value="highest">En Yüksek Puan</MenuItem>
                <MenuItem value="lowest">En Düşük Puan</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Puan</InputLabel>
              <Select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <Star />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="5">5 Yıldız</MenuItem>
                <MenuItem value="4">4 Yıldız</MenuItem>
                <MenuItem value="3">3 Yıldız</MenuItem>
                <MenuItem value="2">2 Yıldız</MenuItem>
                <MenuItem value="1">1 Yıldız</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => setReviewDialogOpen(true)}
              sx={{ height: '100%' }}
            >
              Değerlendir
            </Button>
          </Grid>
        </Grid>

        {/* Etiketler */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Etiketler
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {availableTags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onClick={() => handleTagSelect(tag)}
                color={selectedTags.includes(tag) ? 'primary' : 'default'}
                sx={{
                  borderRadius: '8px',
                  '&:hover': {
                    bgcolor: selectedTags.includes(tag)
                      ? theme.palette.primary.main
                      : alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Yorumlar Listesi */}
        <Grid container spacing={3}>
          {filteredReviews.map((review) => (
            <Grid item xs={12} key={review.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar
                    src={review.userAvatar}
                    sx={{ width: 48, height: 48, mr: 2 }}
                  >
                    {review.userName.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mr: 1 }}>
                        {review.userName}
                      </Typography>
                      {review.isVerified && (
                        <Chip
                          label="Doğrulanmış Randevu"
                          size="small"
                          color="success"
                          sx={{ height: 24 }}
                        />
                      )}
                    </Box>
                    <Rating value={review.rating} readOnly size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {format(review.date, 'd MMMM yyyy', { locale: tr })}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={{ ml: 1 }}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>

                <Typography variant="body1" sx={{ mb: 2 }}>
                  {review.comment}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {review.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ borderRadius: '8px' }}
                    />
                  ))}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button
                    size="small"
                    startIcon={<ThumbUp />}
                    onClick={() => handleLikeReview(review.id)}
                    sx={{
                      color: review.isLiked ? theme.palette.primary.main : 'text.secondary',
                    }}
                  >
                    Faydalı ({review.likes})
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Flag />}
                    onClick={() => handleReportReview(review.id)}
                    sx={{ color: 'text.secondary' }}
                  >
                    Şikayet Et
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Yorum Yazma Dialog */}
        <Dialog
          open={reviewDialogOpen}
          onClose={() => setReviewDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Değerlendirme Yaz</Typography>
              <IconButton
                edge="end"
                onClick={() => setReviewDialogOpen(false)}
              >
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Puanınız
              </Typography>
              <Rating
                value={newReview.rating}
                onChange={(event, value) => setNewReview({ ...newReview, rating: value || 0 })}
                size="large"
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Yorumunuz"
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Etiketler
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {availableTags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onClick={() => {
                    const tags = newReview.tags.includes(tag)
                      ? newReview.tags.filter(t => t !== tag)
                      : [...newReview.tags, tag];
                    setNewReview({ ...newReview, tags });
                  }}
                  color={newReview.tags.includes(tag) ? 'primary' : 'default'}
                  sx={{ borderRadius: '8px' }}
                />
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReviewDialogOpen(false)}>
              İptal
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmitReview}
              disabled={!newReview.rating || !newReview.comment}
            >
              Gönder
            </Button>
          </DialogActions>
        </Dialog>

        {/* Yorum Menüsü */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => setAnchorEl(null)}>
            <Edit sx={{ mr: 1 }} /> Düzenle
          </MenuItem>
          <MenuItem
            onClick={() => setAnchorEl(null)}
            sx={{ color: theme.palette.error.main }}
          >
            <Delete sx={{ mr: 1 }} /> Sil
          </MenuItem>
        </Menu>
      </Container>
    </Box>
  );
};

export default Reviews;
