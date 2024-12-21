import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Avatar,
  Pagination,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search,
  AccessTime,
  Person,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: {
    name: string;
    avatar: string;
    title: string;
  };
  date: Date;
  readTime: number;
  tags: string[];
}

const Blog = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  // Mock veriler
  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "Anksiyete ile Başa Çıkma Yöntemleri",
      excerpt: "Günlük hayatta karşılaştığımız anksiyete durumlarıyla başa çıkmanın etkili yollarını keşfedin.",
      content: "...",
      image: "/blog/anxiety.jpg",
      category: "Anksiyete",
      author: {
        name: "Dr. Ayşe Yılmaz",
        avatar: "/therapists/therapist1.jpg",
        title: "Klinik Psikolog",
      },
      date: new Date("2023-12-15"),
      readTime: 5,
      tags: ["Anksiyete", "Mental Sağlık", "Stres Yönetimi"],
    },
    {
      id: 2,
      title: "İlişkilerde Sağlıklı İletişim",
      excerpt: "İlişkilerinizde daha sağlıklı iletişim kurmanın püf noktalarını öğrenin.",
      content: "...",
      image: "/blog/communication.jpg",
      category: "İlişkiler",
      author: {
        name: "Dr. Mehmet Kaya",
        avatar: "/therapists/therapist2.jpg",
        title: "Aile Terapisti",
      },
      date: new Date("2023-12-10"),
      readTime: 7,
      tags: ["İlişkiler", "İletişim", "Evlilik"],
    },
  ];

  const categories = [
    "Anksiyete",
    "Depresyon",
    "İlişkiler",
    "Kişisel Gelişim",
    "Mental Sağlık",
    "Stres Yönetimi",
  ];

  const allTags = Array.from(
    new Set(blogPosts.flatMap(post => post.tags))
  );

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
    setPage(1);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags(
      selectedTags.includes(tag)
        ? selectedTags.filter(t => t !== tag)
        : [...selectedTags, tag]
    );
    setPage(1);
  };

  const filteredPosts = blogPosts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || post.category === selectedCategory;
      const matchesTags = selectedTags.length === 0 ||
                         selectedTags.every(tag => post.tags.includes(tag));
      return matchesSearch && matchesCategory && matchesTags;
    });

  return (
    <Box sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Başlık ve Arama */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
            Blog
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Mental sağlık ve kişisel gelişim hakkında faydalı içerikler
          </Typography>
          <TextField
            fullWidth
            placeholder="Blog yazılarında ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ maxWidth: 600 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Kategoriler */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Kategoriler
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {categories.map((category) => (
              <Chip
                key={category}
                label={category}
                onClick={() => handleCategoryClick(category)}
                color={selectedCategory === category ? 'primary' : 'default'}
                sx={{
                  borderRadius: '8px',
                  '&:hover': {
                    bgcolor: selectedCategory === category
                      ? theme.palette.primary.main
                      : alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Etiketler */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Etiketler
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {allTags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onClick={() => handleTagClick(tag)}
                color={selectedTags.includes(tag) ? 'primary' : 'default'}
                variant="outlined"
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

        {/* Blog Yazıları */}
        <Grid container spacing={4}>
          {filteredPosts.map((post) => (
            <Grid item xs={12} md={6} lg={4} key={post.id}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={post.image}
                  alt={post.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Chip
                    label={post.category}
                    size="small"
                    sx={{
                      mb: 2,
                      borderRadius: '8px',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {post.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {post.excerpt}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {post.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: '8px' }}
                      />
                    ))}
                  </Box>

                  <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={post.author.avatar}
                        sx={{ width: 32, height: 32, mr: 1 }}
                      />
                      <Box>
                        <Typography variant="subtitle2">
                          {post.author.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {post.author.title}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTime sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {post.readTime} dk okuma
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {format(post.date, 'd MMM yyyy', { locale: tr })}
                        </Typography>
                      </Box>
                      <Button
                        endIcon={<ArrowForward />}
                        onClick={() => navigate(`/blog/${post.id}`)}
                      >
                        Oku
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Sayfalama */}
        {filteredPosts.length > 0 && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={Math.ceil(filteredPosts.length / 9)}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              size="large"
            />
          </Box>
        )}

        {/* Sonuç Bulunamadı */}
        {filteredPosts.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Aradığınız kriterlere uygun blog yazısı bulunamadı.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Blog;
