<?php
// DB CONNECTION
$conn = new mysqli("localhost", "yibnyzre_arx", "As792002@", "yibnyzre_arx");

$resultData = null;
$message = "";

if (isset($_GET['cert_id'])) {
    $cert_id = $_GET['cert_id'];
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $cert_id = $_POST['cert_id'];
}

if (!empty($cert_id)) {
    $stmt = $conn->prepare("SELECT * FROM certificates WHERE cert_id = ?");
    $stmt->bind_param("s", $cert_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $resultData = $result->fetch_assoc();
    } else {
        $message = "Certificate not found";
    }

    $stmt->close();
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Verify Certificate | ARX Infotech</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="assets/css/style.css">
    <!-- ==============================
         CANONICAL URL (Change per page)
    ================================ -->
    <link rel="canonical" href="https://arxinfo.tech/">
    
    <!-- ==============================
         THEME COLOR
    ================================ -->
    <meta name="theme-color" content="#111827">
    <meta name="msapplication-navbutton-color" content="#111827">
    <meta name="apple-mobile-web-app-status-bar-style" content="#111827">
    
    <!-- ==============================
         FAVICON / ICON PACK
    ================================ -->
    <link rel="icon" type="image/png" sizes="32x32" href="assets/images/favicon-32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="assets/images/favicon-16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="assets/images/apple-touch-icon.png">
    <link rel="shortcut icon" href="assets/images/favicon.ico">
    
    <!-- ==============================
         WEB MANIFEST (PWA)
    ================================ -->
    <link rel="manifest" href="site.webmanifest">
    
    <!-- ==============================
         OPEN GRAPH (Facebook / LinkedIn)
    ================================ -->
    <meta property="og:site_name" content="ARX Infotech">
    <meta property="og:type" content="website">
    <meta property="og:title" content="ARX Infotech | IT Services & Tech Solutions Provider">
    <meta property="og:description"
      content="ARX Infotech delivers managed IT services, cloud migration, cybersecurity, software development and academic automation solutions for businesses and institutions.">
    <meta property="og:url" content="https://arxinfo.tech/">
    <meta property="og:locale" content="en_IN">
    
    <!-- ==============================
         TWITTER SEO
    ================================ -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="ARX Infotech | IT Services & Tech Solutions Provider">
    <meta name="twitter:description"
      content="ARX Infotech provides managed IT support, cloud solutions, software development and digital transformation services.">
    <meta name="twitter:image" content="https://arxinfo.tech/assets/images/og-banner.png">
    
    <!-- ==============================
         EXTRA ADVANCED SEO META
    ================================ -->
    <meta name="language" content="English">
    <meta name="rating" content="General">
    <meta name="distribution" content="Global">
    <meta name="revisit-after" content="7 days">
    
    <!-- ==============================
         PERFORMANCE OPTIMIZATION
    ================================ -->
    <link rel="preconnect" href="https://cdn.jsdelivr.net">
    <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
    
    <link rel="preconnect" href="https://cdnjs.cloudflare.com">
    <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">
    
    <!-- ==============================
         CSS / FRAMEWORKS
    ================================ -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <script src="https://cdn.tailwindcss.com"></script>
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    
    <link rel="stylesheet" href="assets/css/style.css">
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "ARX Infotech",
      "url": "https://arxinfo.tech",
      "logo": "https://arxinfo.tech/assets/images/logo.png",
      "description": "ARX Infotech is an IT service provider offering managed IT support, cloud migration, cybersecurity, software development, and academic automation solutions.",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "2nd Floor, 150, Panchita Bongaon-Bagdh Rd. Street",
        "addressLocality": "Kolkata",
        "addressRegion": "West Bengal",
        "postalCode": "743235",
        "addressCountry": "IN"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-8317818107",
        "contactType": "customer support",
        "areaServed": "IN",
        "availableLanguage": ["English", "Hindi"]
      }
    }
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "ARX Infotech",
      "url": "https://arxinfo.tech",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://arxinfo.tech/?s={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
    </script>
</head>

<body>

<!-- ================= NAVBAR ================= -->
<nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-lg">
    <div class="container">
        <a class="navbar-brand fw-bold text-warning" href="https://arxinfo.tech">
            <div class="logo-img">
              <img src="assets/images/logo.png" alt="ARX Infotech Logo">
            </div>
        </a>

        <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navMenu">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navMenu">
            <ul class="navbar-nav ms-auto">
                <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
                <li class="nav-item"><a class="nav-link" href="about.html">About</a></li>
                <li class="nav-item"><a class="nav-link" href="services.html">Services</a></li>
                <li class="nav-item"><a class="nav-link" href="contact.html">Contact</a></li>
                <li class="nav-item"><a class="nav-link active" href="#">Verify</a></li>
            </ul>
        </div>
    </div>
</nav>

<!-- ================= HERO ================= -->
<section class="hero-section text-white">
    <!-- VIDEO BACKGROUND -->
      <video autoplay muted loop playsinline class="hero-video">
        <source src="assets/video/hero.mp4" type="video/mp4">
      </video>
    <div class="container py-5 text-center">
        <h1 class="fw-bold">Certificate Verification</h1>
        <p class="lead">Verify the authenticity of ARX Infotech issued certificates</p>
    </div>
</section>

<!-- ================= VERIFY SECTION ================= -->
<div class="container py-5">

    <div class="card shadow-lg p-4">

        <h3 class="text-center mb-4">Enter Certificate ID</h3>

        <form method="POST">
            <input type="text" name="cert_id" class="form-control mb-3" placeholder="ARX160320XXXX" required>
            <button class="btn btn-warning w-100">Verify Certificate</button>
        </form>

        <!-- RESULT -->
        <?php if ($resultData): ?>

            <?php if ($resultData['status'] == 'valid'): ?>
                <div class="alert alert-success mt-4">✔ Certificate Verified</div>
            <?php else: ?>
                <div class="alert alert-danger mt-4">❌ Certificate Revoked</div>
            <?php endif; ?>

            <table class="table table-bordered mt-3">
                <tr><th>Name</th><td><?= $resultData['name']; ?></td></tr>
                <tr><th>Program</th><td><?= $resultData['program_name']; ?></td></tr>
                <tr><th>Company</th><td><?= $resultData['company']; ?></td></tr>
                <tr><th>Lead</th><td><?= $resultData['lead_name']; ?></td></tr>
                <tr><th>Coordinator</th><td><?= $resultData['coordinator']; ?></td></tr>
                <tr><th>Issue Date</th><td><?= $resultData['issue_date']; ?></td></tr>
                <tr><th>Status</th><td><?= strtoupper($resultData['status']); ?></td></tr>
            </table>

        <?php elseif ($message): ?>
            <div class="alert alert-danger mt-4"><?= $message; ?></div>
        <?php endif; ?>

    </div>

</div>

<!-- ================= FOOTER ================= -->
<!-- Footer -->
  <footer class="bg-dark text-white pt-5 pb-3">
    <div class="container">
      <div class="row g-4">

        <div class="col-md-4">
          <div class="footer-img">
            <img src="assets/images/logo.png" alt="ARX Infotech Logo">
          </div>
          <p class="text-light footer-description">
            Technology-driven IT services and modern digital solutions for businesses and academic institutions,
            delivering secure systems, scalable software, cloud solutions, and automation platforms to improve
            productivity, efficiency, and long-term growth.
          </p>
        </div>

        <div class="col-md-4">
          <h6 class="fw-bold">Quick Links</h6>
          <ul class="list-unstyled">
            <li><a href="index.html" class="footer-link">Home</a></li>
            <li><a href="about.html" class="footer-link">About</a></li>
            <li><a href="services.html" class="footer-link">Services</a></li>
            <li><a href="contact.html" class="footer-link">Contact</a></li>
          </ul>
        </div>

        <div class="col-md-4">
          <h6 class="fw-bold">Contact</h6>
          <p><i class="fa-solid fa-envelope text-warning"></i> info@arxinfo.tech</p>
          <p><i class="fa-solid fa-phone text-warning"></i> +91 8317818107</p>
          <p><i class="fa-solid fa-location-dot text-warning"></i> 
            1st Floor, 150, Panchita <br>
            Bongaon-Bagdh Rd. Street <br>
            Kolkata, India 743235
          </p>
        </div>

      </div>

      <hr class="border-secondary mt-4">

      <div class="text-center">
        <p class="mb-0 small">
          © <span id="currentYear"></span> ARX Infotech. All Rights Reserved.
        </p>
      </div>
    </div>
  </footer>

<!-- JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

</body>
</html>