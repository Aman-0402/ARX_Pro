<?php
include '../config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $u = $_POST['username'];
    $p = md5($_POST['password']);

    $r = $conn->query("SELECT * FROM admins WHERE username='$u' AND password='$p'");

    if ($r && $r->num_rows) {
        $_SESSION['admin'] = 1;
        header('Location: dashboard.php');
        exit;
    }

    $err = 'Invalid credentials';
}
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Admin Login</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

    <style>
        body {
            min-height: 100vh;
            background:
                linear-gradient(135deg, rgba(13,110,253,0.08), rgba(111,66,193,0.08)),
                radial-gradient(circle at top right, rgba(13,110,253,0.12), transparent 40%),
                #f8fafc;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }

        .login-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }

        .login-card {
            width: 100%;
            max-width: 430px;
            border: none;
            border-radius: 24px;
            overflow: hidden;
            background: rgba(255, 255, 255, 0.96);
            backdrop-filter: blur(10px);
            box-shadow:
                0 20px 60px rgba(15, 23, 42, 0.12),
                0 8px 20px rgba(15, 23, 42, 0.08);
        }

        .login-header {
            background: linear-gradient(135deg, #0d6efd, #6f42c1);
            color: #fff;
            text-align: center;
            padding: 36px 30px 28px;
        }

        .login-icon {
            width: 72px;
            height: 72px;
            margin: 0 auto 16px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.18);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            border: 1px solid rgba(255, 255, 255, 0.25);
        }

        .login-header h2 {
            margin: 0;
            font-size: 1.75rem;
            font-weight: 700;
            letter-spacing: -0.5px;
        }

        .login-header p {
            margin: 8px 0 0;
            font-size: 0.95rem;
            opacity: 0.9;
        }

        .login-body {
            padding: 32px;
        }

        .form-label {
            font-weight: 600;
            color: #334155;
            margin-bottom: 8px;
        }

        .form-control {
            height: 50px;
            border-radius: 12px;
            border: 1px solid #dbe2ea;
            padding: 0 16px;
            font-size: 0.95rem;
            transition: all 0.2s ease;
        }

        .form-control:focus {
            border-color: #0d6efd;
            box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.12);
        }

        .btn-login {
            height: 50px;
            border: none;
            border-radius: 12px;
            background: linear-gradient(135deg, #0d6efd, #6f42c1);
            font-weight: 600;
            font-size: 1rem;
            box-shadow: 0 8px 20px rgba(13, 110, 253, 0.25);
            transition: all 0.25s ease;
        }

        .btn-login:hover {
            transform: translateY(-1px);
            box-shadow: 0 12px 28px rgba(13, 110, 253, 0.3);
        }

        .alert {
            border: none;
            border-radius: 12px;
            font-size: 0.9rem;
        }

        .footer-text {
            margin-top: 22px;
            text-align: center;
            color: #94a3b8;
            font-size: 0.82rem;
        }

        @media (max-width: 576px) {
            .login-body {
                padding: 24px;
            }

            .login-header {
                padding: 30px 24px 24px;
            }

            .login-header h2 {
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>

<div class="login-wrapper">
    <div class="card login-card">
        <div class="login-header">
            <div class="login-icon">🔐</div>
            <h2>Admin Portal</h2>
            <p>Sign in to access the administration dashboard</p>
        </div>

        <div class="login-body">
            <?php if (isset($err)) : ?>
                <div class="alert alert-danger">
                    <?= $err ?>
                </div>
            <?php endif; ?>

            <form method="post">
                <div class="mb-3">
                    <label class="form-label">Username</label>
                    <input
                        type="text"
                        class="form-control"
                        name="username"
                        placeholder="Enter your username"
                        required
                        autofocus>
                </div>

                <div class="mb-4">
                    <label class="form-label">Password</label>
                    <input
                        type="password"
                        class="form-control"
                        name="password"
                        placeholder="Enter your password"
                        required>
                </div>

                <button type="submit" class="btn btn-primary btn-login w-100">
                    Login to Dashboard
                </button>
            </form>

            <div class="footer-text">
                Secure Administrative Access
            </div>
        </div>
    </div>
</div>

</body>
</html>