import { Box, Button, Card, CardContent, CardMedia, Grid, Typography } from '@mui/material';

export const Home = () => {
  return (
    <Box className="home" sx={{ padding: 4 }}>
      {/* Hero Section */}
      <Box
        component="section"
        className="hero"
        sx={{
          backgroundImage:
            'url(https://cdn.pixabay.com/photo/2023/11/19/06/07/business-8398064_1280.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: 6,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          minHeight: '50vh',
        }}
      >
        <Box className="hero-content" textAlign="center">
          <Typography variant="h2" sx={{ mb: 2 }}>
            Welcome to Stanisław Marek's Master Thesis project - Manage and visualize 3D data after
            processing
          </Typography>
          <Typography variant="h6" sx={{ mb: 4 }}>
            Discover the ultimate platform for managing and post-process your VTK files with ease
            and efficiency.
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
                height="250"
                image="https://cdn.pixabay.com/photo/2022/09/15/05/20/team-7455676_1280.png"
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
                height="250"
                image="https://cdn.pixabay.com/photo/2023/03/01/14/01/tab-7823156_1280.png"
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
                height="250"
                image="https://media.istockphoto.com/id/1173896899/pl/wektor/tarcza-p%C5%82aska-ikona-pixel-perfect-dla-urz%C4%85dze%C5%84-mobilnych-i-sieci-web.jpg?s=2048x2048&w=is&k=20&c=toV6NhBvhtybYQt1YrbGTxGsFZUJPFYOZV5B_lc-SlE="
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
          researchers to manage their VTK files. Our mission is to simplify the post-processing and
          enhance collaboration and productivity. Thanks to our advanced analytics, you can gain
          insights into your data and make informed decisions.
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;
