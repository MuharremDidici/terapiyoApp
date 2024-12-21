import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tooltip,
  Fade,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  CallEnd,
  ScreenShare,
  StopScreenShare,
  Chat,
  Settings,
  PresentToAll,
  Close,
  Send,
  Timer,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'therapist';
  timestamp: Date;
}

const VideoCall = () => {
  const theme = useTheme();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Merhaba, görüşmeye hoş geldiniz!',
      sender: 'therapist',
      timestamp: new Date(),
    },
  ]);
  const [callDuration, setCallDuration] = useState('00:00');

  // Mock terapist bilgileri
  const therapist = {
    name: 'Dr. Ayşe Yılmaz',
    avatar: '/therapists/therapist1.jpg',
    online: true,
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setMessageText('');
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        bgcolor: '#1a1a1a',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
      }}
    >
      {/* Ana Video Alanı */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Terapist Video */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            bgcolor: '#2a2a2a',
            position: 'relative',
          }}
        >
          {/* Video placeholder */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <Avatar
              src={therapist.avatar}
              sx={{
                width: 120,
                height: 120,
                mb: 2,
                border: `4px solid ${theme.palette.primary.main}`,
              }}
            />
            <Typography variant="h6" sx={{ color: 'white' }}>
              {therapist.name}
            </Typography>
          </Box>
        </Box>

        {/* Kullanıcı Video (küçük) */}
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            right: 32,
            top: 32,
            width: 280,
            height: 158,
            bgcolor: '#2a2a2a',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {/* Video placeholder */}
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: theme.palette.primary.main,
              }}
            >
              SY
            </Avatar>
          </Box>
        </Paper>
      </Box>

      {/* Üst Bilgi Çubuğu */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            sx={{
              '& .MuiBadge-badge': {
                bgcolor: '#44b700',
                boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
              },
            }}
          >
            <Avatar src={therapist.avatar} />
          </Badge>
          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'white' }}>
              {therapist.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Online
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Timer sx={{ color: 'white', mr: 1 }} />
          <Typography variant="body1" sx={{ color: 'white' }}>
            {callDuration}
          </Typography>
        </Box>
      </Box>

      {/* Alt Kontrol Çubuğu */}
      <Paper
        elevation={0}
        sx={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          mb: 4,
          px: 2,
          py: 1.5,
          borderRadius: '16px',
          bgcolor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Tooltip title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'} placement="top">
          <IconButton
            onClick={() => setIsMuted(!isMuted)}
            sx={{
              bgcolor: isMuted ? 'error.main' : 'rgba(255,255,255,0.1)',
              '&:hover': {
                bgcolor: isMuted ? 'error.dark' : 'rgba(255,255,255,0.2)',
              },
            }}
          >
            {isMuted ? (
              <MicOff sx={{ color: 'white' }} />
            ) : (
              <Mic sx={{ color: 'white' }} />
            )}
          </IconButton>
        </Tooltip>

        <Tooltip title={isVideoOff ? 'Kamerayı Aç' : 'Kamerayı Kapat'} placement="top">
          <IconButton
            onClick={() => setIsVideoOff(!isVideoOff)}
            sx={{
              bgcolor: isVideoOff ? 'error.main' : 'rgba(255,255,255,0.1)',
              '&:hover': {
                bgcolor: isVideoOff ? 'error.dark' : 'rgba(255,255,255,0.2)',
              },
            }}
          >
            {isVideoOff ? (
              <VideocamOff sx={{ color: 'white' }} />
            ) : (
              <Videocam sx={{ color: 'white' }} />
            )}
          </IconButton>
        </Tooltip>

        <Tooltip title="Görüşmeyi Sonlandır" placement="top">
          <IconButton
            sx={{
              bgcolor: 'error.main',
              '&:hover': { bgcolor: 'error.dark' },
              mx: 1,
            }}
          >
            <CallEnd sx={{ color: 'white' }} />
          </IconButton>
        </Tooltip>

        <Tooltip title={isScreenSharing ? 'Ekran Paylaşımını Durdur' : 'Ekran Paylaş'} placement="top">
          <IconButton
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            sx={{
              bgcolor: isScreenSharing ? theme.palette.primary.main : 'rgba(255,255,255,0.1)',
              '&:hover': {
                bgcolor: isScreenSharing ? theme.palette.primary.dark : 'rgba(255,255,255,0.2)',
              },
            }}
          >
            {isScreenSharing ? (
              <StopScreenShare sx={{ color: 'white' }} />
            ) : (
              <ScreenShare sx={{ color: 'white' }} />
            )}
          </IconButton>
        </Tooltip>

        <Tooltip title="Sohbet" placement="top">
          <IconButton
            onClick={() => setIsChatOpen(true)}
            sx={{
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
            }}
          >
            <Chat sx={{ color: 'white' }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Ayarlar" placement="top">
          <IconButton
            sx={{
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
            }}
          >
            <Settings sx={{ color: 'white' }} />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Sohbet Drawer */}
      <Drawer
        anchor="right"
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 360 },
            bgcolor: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ flexGrow: 1, color: 'white' }}>
            Sohbet
          </Typography>
          <IconButton onClick={() => setIsChatOpen(false)}>
            <Close sx={{ color: 'white' }} />
          </IconButton>
        </Box>

        {/* Mesaj Listesi */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {message.sender === 'therapist' && (
                <Avatar
                  src={therapist.avatar}
                  sx={{ width: 32, height: 32, mr: 1 }}
                />
              )}
              <Box
                sx={{
                  maxWidth: '70%',
                  bgcolor: message.sender === 'user'
                    ? theme.palette.primary.main
                    : alpha(theme.palette.primary.main, 0.1),
                  color: message.sender === 'user' ? 'white' : 'white',
                  borderRadius: '16px',
                  borderTopLeftRadius: message.sender === 'therapist' ? '4px' : '16px',
                  borderTopRightRadius: message.sender === 'user' ? '4px' : '16px',
                  p: 2,
                }}
              >
                <Typography variant="body1">{message.text}</Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    textAlign: 'right',
                    mt: 0.5,
                    color: message.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.7)',
                  }}
                >
                  {format(message.timestamp, 'HH:mm', { locale: tr })}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Mesaj Yazma Alanı */}
        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            gap: 1,
          }}
        >
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
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white',
                borderRadius: '12px',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
              '& .MuiOutlinedInput-input::placeholder': {
                color: 'rgba(255,255,255,0.5)',
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
          >
            <Send sx={{ color: theme.palette.primary.main }} />
          </IconButton>
        </Box>
      </Drawer>
    </Box>
  );
};

export default VideoCall;
