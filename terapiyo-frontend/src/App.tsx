import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import store from './store/store';
import theme from './theme';
import './i18n/config';

// Layout ve sayfa bileşenleri
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TherapistSearch from './pages/TherapistSearch';
import Profile from './pages/Profile';
import TherapistDetail from './pages/TherapistDetail';
import Messages from './pages/Messages';
import VideoCall from './pages/VideoCall';
import Appointments from './pages/Appointments';
import Payment from './pages/Payment';
import Reviews from './pages/Reviews';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
  const queryClient = new QueryClient();

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="App">
            <Router>
              <Layout>
                <ToastContainer />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/therapists" element={<TherapistSearch />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/search" element={<TherapistSearch />} />
                  <Route 
                    path="/profile" 
                    element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/therapist/:id" 
                    element={
                      <PrivateRoute>
                        <TherapistDetail />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/messages" 
                    element={
                      <PrivateRoute>
                        <Messages />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/appointments" 
                    element={
                      <PrivateRoute>
                        <Appointments />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/payment" 
                    element={
                      <PrivateRoute>
                        <Payment />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/reviews" 
                    element={
                      <PrivateRoute>
                        <Reviews />
                      </PrivateRoute>
                    } 
                  />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:id" element={<BlogDetail />} />
                  <Route 
                    path="/video-call" 
                    element={
                      <PrivateRoute>
                        <VideoCall />
                      </PrivateRoute>
                    } 
                  />
                </Routes>
              </Layout>
            </Router>
          </div>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
