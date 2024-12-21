import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Avatar,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  InputAdornment,
  Divider,
  Menu,
  MenuItem,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Send,
  AttachFile,
  Image,
  InsertDriveFile,
  MoreVert,
  Search,
  CheckCircle,
  FiberManualRecord,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'therapist';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  attachment?: {
    type: 'image' | 'file';
    name: string;
    url: string;
  };
}

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  online: boolean;
  messages: Message[];
}

const Messages = () => {
  const theme = useTheme();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageText, setMessageText] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const mockChats: Chat[] = [
    {
      id: 1,
      name: 'Dr. Ayşe Yılmaz',
      avatar: '/therapists/therapist1.jpg',
      lastMessage: 'Randevunuzu onayladım, görüşmek üzere!',
      timestamp: new Date('2023-12-19T14:30:00'),
      unreadCount: 2,
      online: true,
      messages: [
        {
          id: 1,
          text: 'Merhaba, nasıl yardımcı olabilirim?',
          sender: 'therapist',
          timestamp: new Date('2023-12-19T14:25:00'),
          status: 'read',
        },
        {
          id: 2,
          text: 'Randevunuzu onayladım, görüşmek üzere!',
          sender: 'therapist',
          timestamp: new Date('2023-12-19T14:30:00'),
          status: 'delivered',
        },
      ],
    },
    {
      id: 2,
      name: 'Dr. Mehmet Kaya',
      avatar: '/therapists/therapist2.jpg',
      lastMessage: 'Size yardımcı olmak isterim.',
      timestamp: new Date('2023-12-19T10:15:00'),
      unreadCount: 0,
      online: false,
      messages: [
        {
          id: 1,
          text: 'Size yardımcı olmak isterim.',
          sender: 'therapist',
          timestamp: new Date('2023-12-19T10:15:00'),
          status: 'read',
        },
      ],
    },
  ];

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChat) return;

    const newMessage: Message = {
      id: selectedChat.messages.length + 1,
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent',
    };

    selectedChat.messages.push(newMessage);
    setMessageText('');
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleAttachmentClick = () => {
    setAnchorEl(null);
    // Dosya yükleme işlemleri burada yapılacak
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
        py: { xs: 2, md: 4 },
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={3} sx={{ height: 'calc(100vh - 100px)' }}>
          {/* Sol Sohbet Listesi */}
          <Grid item xs={12} md={4} lg={3}>
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                borderRadius: '16px',
                bgcolor: 'white',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Mesajlar
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Sohbet Ara..."
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
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
              </Box>

              <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
                {filteredChats.map((chat) => (
                  <React.Fragment key={chat.id}>
                    <ListItem
                      button
                      selected={selectedChat?.id === chat.id}
                      onClick={() => setSelectedChat(chat)}
                      sx={{
                        px: 2,
                        py: 1.5,
                        '&.Mui-selected': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          variant="dot"
                          sx={{
                            '& .MuiBadge-badge': {
                              bgcolor: chat.online ? '#44b700' : '#bdbdbd',
                              boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                            },
                          }}
                        >
                          <Avatar src={chat.avatar} />
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {chat.name}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.secondary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {chat.lastMessage}
                          </Typography>
                        }
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Typography variant="caption" color="text.secondary">
                          {format(chat.timestamp, 'HH:mm', { locale: tr })}
                        </Typography>
                        {chat.unreadCount > 0 && (
                          <Badge
                            badgeContent={chat.unreadCount}
                            color="primary"
                            sx={{ mt: 0.5 }}
                          />
                        )}
                      </Box>
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Sağ Mesajlaşma Alanı */}
          <Grid item xs={12} md={8} lg={9}>
            {selectedChat ? (
              <Paper
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: '16px',
                  bgcolor: 'white',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Sohbet Başlığı */}
                <Box
                  sx={{
                    p: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: selectedChat.online ? '#44b700' : '#bdbdbd',
                        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                      },
                    }}
                  >
                    <Avatar src={selectedChat.avatar} sx={{ width: 48, height: 48 }} />
                  </Badge>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h6">{selectedChat.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedChat.online ? 'Çevrimiçi' : 'Son görülme: 1 saat önce'}
                    </Typography>
                  </Box>
                  <IconButton sx={{ ml: 'auto' }} onClick={handleMenuOpen}>
                    <MoreVert />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={handleMenuClose}>Sohbeti Sil</MenuItem>
                    <MenuItem onClick={handleMenuClose}>Bildirimleri Kapat</MenuItem>
                  </Menu>
                </Box>

                {/* Mesaj Listesi */}
                <Box
                  sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  {selectedChat.messages.map((message) => (
                    <Box
                      key={message.id}
                      sx={{
                        display: 'flex',
                        justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                      }}
                    >
                      {message.sender === 'therapist' && (
                        <Avatar
                          src={selectedChat.avatar}
                          sx={{ width: 32, height: 32, mr: 1 }}
                        />
                      )}
                      <Box
                        sx={{
                          maxWidth: '70%',
                          bgcolor: message.sender === 'user'
                            ? theme.palette.primary.main
                            : alpha(theme.palette.primary.main, 0.1),
                          color: message.sender === 'user' ? 'white' : 'text.primary',
                          borderRadius: '16px',
                          borderTopLeftRadius: message.sender === 'therapist' ? '4px' : '16px',
                          borderTopRightRadius: message.sender === 'user' ? '4px' : '16px',
                          p: 2,
                        }}
                      >
                        {message.attachment && (
                          <Box sx={{ mb: 1 }}>
                            {message.attachment.type === 'image' ? (
                              <Box
                                component="img"
                                src={message.attachment.url}
                                sx={{
                                  maxWidth: '100%',
                                  borderRadius: '8px',
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  p: 1,
                                  bgcolor: 'background.paper',
                                  borderRadius: '8px',
                                }}
                              >
                                <InsertDriveFile sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                  {message.attachment.name}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        )}
                        <Typography variant="body1">{message.text}</Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            mt: 0.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: message.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                            }}
                          >
                            {format(message.timestamp, 'HH:mm', { locale: tr })}
                          </Typography>
                          {message.sender === 'user' && (
                            <CheckCircle
                              sx={{
                                ml: 0.5,
                                fontSize: 14,
                                color: message.status === 'read'
                                  ? 'rgba(255,255,255,0.9)'
                                  : 'rgba(255,255,255,0.5)',
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* Mesaj Gönderme Alanı */}
                <Box
                  sx={{
                    p: 2,
                    borderTop: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 1,
                  }}
                >
                  <IconButton onClick={handleAttachmentClick}>
                    <AttachFile />
                  </IconButton>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Mesajınızı yazın..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                  >
                    <Send />
                  </IconButton>
                </Box>
              </Paper>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: '16px',
                  bgcolor: 'white',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 4,
                }}
              >
                <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
                  Mesajlaşmaya Başlayın
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Sol taraftan bir sohbet seçerek mesajlaşmaya başlayabilirsiniz.
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Messages;
