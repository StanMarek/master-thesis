import { Box, Button, Card, CardContent, CardMedia, Grid, Typography } from '@mui/material';

export const Home = () => {
  return (
    <Box className="home" sx={{ padding: 4 }}>
      {/* Hero Section */}
      <Box
        component="section"
        className="hero"
        sx={{
          backgroundImage: 'url(https://via.placeholder.com/1920x600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: 6,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          minHeight: '100vh',
        }}
      >
        <Box className="hero-content" textAlign="center">
          <Typography variant="h2" sx={{ mb: 2 }}>
            Welcome to Mesh Master Thesis
          </Typography>
          <Typography variant="h6" sx={{ mb: 4 }}>
            Discover the ultimate platform for managing your thesis with ease and efficiency.
          </Typography>
          <Button href="#features" variant="contained" color="secondary" size="large">
            Learn More
          </Button>
        </Box>
      </Box>

      {/* Features Section */}
      <Box component="section" id="features" className="features" sx={{ mt: 8 }}>
        <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
          Features
        </Typography>
        <Grid container spacing={4} className="feature-list">
          <Grid item xs={12} md={4} className="feature-item">
            <Card>
              <CardMedia
                component="img"
                alt="Feature 1"
                height="140"
                image="https://via.placeholder.com/150"
              />
              <CardContent>
                <Typography variant="h5" component="div" sx={{ mb: 1 }}>
                  Collaborative Environment
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Work with your peers and mentors seamlessly with our collaboration tools.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4} className="feature-item">
            <Card>
              <CardMedia
                component="img"
                alt="Feature 2"
                height="140"
                image="https://via.placeholder.com/150"
              />
              <CardContent>
                <Typography variant="h5" component="div" sx={{ mb: 1 }}>
                  Advanced Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gain insights into your progress and performance with powerful analytics.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4} className="feature-item">
            <Card>
              <CardMedia
                component="img"
                alt="Feature 3"
                height="140"
                image="https://via.placeholder.com/150"
              />
              <CardContent>
                <Typography variant="h5" component="div" sx={{ mb: 1 }}>
                  Secure Platform
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your data is protected with industry-standard security measures.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* About Section */}
      <Box component="section" className="about" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          About Us
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 600, margin: '0 auto' }}>
          Mesh Master Thesis is dedicated to providing the best platform for students and
          researchers to manage their thesis work. Our mission is to simplify the process and
          enhance collaboration and productivity.
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;
