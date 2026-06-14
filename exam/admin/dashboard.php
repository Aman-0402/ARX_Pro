<?php
include '../config.php';
if (empty($_SESSION['admin'])) die('Access denied');

// Flash Messages
$success = $_SESSION['flash_success'] ?? '';
$error   = $_SESSION['flash_error'] ?? '';

unset($_SESSION['flash_success'], $_SESSION['flash_error']);

// Logout Handler
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: login.php');
    exit;
}

// Handle POST Requests (Post/Redirect/Get Pattern)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Add Question
    if (isset($_POST['action']) && $_POST['action'] === 'add_question') {
        $stmt = $conn->prepare(
            "INSERT INTO questions
            (question, option_a, option_b, option_c, option_d, correct_option)
            VALUES (?, ?, ?, ?, ?, ?)"
        );

        $stmt->bind_param(
            'ssssss',
            $_POST['question'],
            $_POST['a'],
            $_POST['b'],
            $_POST['c'],
            $_POST['d'],
            $_POST['correct']
        );

        if ($stmt->execute()) {
            $_SESSION['flash_success'] = 'Question added successfully.';
        } else {
            $_SESSION['flash_error'] = 'Failed to add question.';
        }

        header('Location: dashboard.php');
        exit;
    }

    // Create Single Voucher
    if (isset($_POST['action']) && $_POST['action'] === 'add_voucher') {
        $code = strtoupper(trim($_POST['voucher_code']));

        if ($code === '') {
            $_SESSION['flash_error'] = 'Voucher code cannot be empty.';
        } else {
            $stmt = $conn->prepare(
                "INSERT IGNORE INTO vouchers (voucher_code, is_active)
                 VALUES (?, 1)"
            );
            $stmt->bind_param('s', $code);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    $_SESSION['flash_success'] = 'Voucher created successfully.';
                } else {
                    $_SESSION['flash_error'] = 'Voucher already exists.';
                }
            } else {
                $_SESSION['flash_error'] = 'Failed to create voucher.';
            }
        }

        header('Location: dashboard.php');
        exit;
    }

    // Generate Mass Vouchers
    if (isset($_POST['action']) && $_POST['action'] === 'generate_mass_vouchers') {
        $quantity = (int)($_POST['voucher_quantity'] ?? 0);

        if ($quantity <= 0) {
            $_SESSION['flash_error'] = 'Please enter a valid number of vouchers.';
        } elseif ($quantity > 10000) {
            $_SESSION['flash_error'] = 'Maximum 10,000 vouchers can be generated at a time.';
        } else {
            $stmt = $conn->prepare(
                "INSERT IGNORE INTO vouchers (voucher_code, is_active)
                 VALUES (?, 1)"
            );

            $generated = 0;
            $attempts = 0;
            $maxAttempts = $quantity * 5; // Prevent infinite loop

            while ($generated < $quantity && $attempts < $maxAttempts) {
                // Generate 15-character uppercase hexadecimal string
                $hex = strtoupper(substr(bin2hex(random_bytes(8)), 0, 15));
                $code = 'ARX-' . $hex;

                $stmt->bind_param('s', $code);
                $stmt->execute();

                if ($stmt->affected_rows > 0) {
                    $generated++;
                }

                $attempts++;
            }

            if ($generated > 0) {
                $_SESSION['flash_success'] =
                    $generated . ' voucher(s) generated successfully.';
            } else {
                $_SESSION['flash_error'] = 'Failed to generate vouchers.';
            }
        }

        header('Location: dashboard.php');
        exit;
    }
}

// Dashboard Statistics
$count = $conn->query("SELECT COUNT(*) AS c FROM questions")->fetch_assoc()['c'];
$totalVouchers = $conn->query("SELECT COUNT(*) AS c FROM vouchers")->fetch_assoc()['c'];
$usedVouchers = $conn->query(
    "SELECT COUNT(*) AS c
     FROM vouchers
     WHERE used_by_candidate_id IS NOT NULL"
)->fetch_assoc()['c'];
$availableVouchers = $totalVouchers - $usedVouchers;

// Recent Vouchers
$vouchers = $conn->query(
    "SELECT *
     FROM vouchers
     ORDER BY id DESC
     LIMIT 20"
);
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Admin Dashboard</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">

<style>
:root {
    --primary: #0d6efd;
    --secondary: #6610f2;
    --success: #198754;
    --warning: #fd7e14;
    --danger: #dc3545;
    --dark: #0f172a;
    --muted: #64748b;
    --border: rgba(255,255,255,0.18);
}

body {
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    background:
        radial-gradient(circle at top right, rgba(13,110,253,0.18), transparent 35%),
        radial-gradient(circle at bottom left, rgba(102,16,242,0.15), transparent 35%),
        linear-gradient(135deg, #f8fafc, #eef2ff);
    min-height: 100vh;
    color: #1e293b;
}

.dashboard-header { margin-bottom: 2rem; }
.dashboard-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--dark);
    margin-bottom: .35rem;
}
.dashboard-subtitle { color: var(--muted); margin: 0; }

.glass-card {
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border);
    border-radius: 22px;
    box-shadow: 0 15px 45px rgba(15, 23, 42, 0.08);
    overflow: hidden;
}

.card-header-custom {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid rgba(15,23,42,0.06);
    background: rgba(255,255,255,0.75);
}

.card-header-custom h5 {
    margin: 0;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: .5rem;
}

.card-body-custom { padding: 1.5rem; }

.stat-card {
    position: relative;
    padding: 1.5rem;
    border-radius: 20px;
    color: #fff;
    overflow: hidden;
    min-height: 130px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.12);
}

.stat-card::after {
    content: "";
    position: absolute;
    top: -20px;
    right: -20px;
    width: 90px;
    height: 90px;
    background: rgba(255,255,255,0.12);
    border-radius: 50%;
}

.stat-card .icon { font-size: 2rem; opacity: 0.9; }
.stat-card .value {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;
    margin-top: .75rem;
}
.stat-card .label {
    margin-top: .35rem;
    opacity: 0.92;
    font-size: .95rem;
}

.gradient-blue { background: linear-gradient(135deg, #0d6efd, #3b82f6); }
.gradient-purple { background: linear-gradient(135deg, #6610f2, #8b5cf6); }
.gradient-green { background: linear-gradient(135deg, #198754, #22c55e); }
.gradient-orange { background: linear-gradient(135deg, #fd7e14, #f59e0b); }

.form-label {
    font-weight: 600;
    color: #334155;
    margin-bottom: .45rem;
}

.input-group-text {
    background: #f8fafc;
    border-right: 0;
    color: #64748b;
}

.form-control,
.form-select {
    border-radius: 12px;
    padding: .8rem 1rem;
}

.input-group .form-control {
    border-left: 0;
    border-radius: 0 12px 12px 0 !important;
}

.input-group .input-group-text {
    border-radius: 12px 0 0 12px !important;
}

.form-control:focus,
.form-select:focus {
    box-shadow: 0 0 0 .2rem rgba(13,110,253,.12);
    border-color: #86b7fe;
}

.btn-modern {
    border: none;
    border-radius: 12px;
    padding: .85rem 1.25rem;
    font-weight: 600;
    transition: all .25s ease;
    text-decoration: none;
}

.btn-modern:hover {
    transform: translateY(-2px);
    color: #fff;
}

.btn-gradient-primary {
    background: linear-gradient(135deg, #0d6efd, #6610f2);
    color: #fff;
}

.btn-gradient-success {
    background: linear-gradient(135deg, #198754, #22c55e);
    color: #fff;
}

.btn-gradient-danger {
    background: linear-gradient(135deg, #dc3545, #ef4444);
    color: #fff;
}

.table-modern thead th {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    font-weight: 700;
    color: #334155;
    padding: 1rem;
}

.table-modern tbody td {
    padding: 1rem;
    vertical-align: middle;
    border-color: #f1f5f9;
}

.table-modern tbody tr:hover { background: #f8fafc; }

.badge-status {
    padding: .45rem .75rem;
    border-radius: 999px;
    font-size: .75rem;
    font-weight: 600;
}

.badge-available {
    background: rgba(25,135,84,.12);
    color: #198754;
}

.badge-used {
    background: rgba(220,53,69,.12);
    color: #dc3545;
}

.alert {
    border: none;
    border-radius: 14px;
}

textarea.form-control {
    min-height: 140px;
    resize: vertical;
}

.footer-note {
    color: #94a3b8;
    font-size: .85rem;
}

@media (max-width: 768px) {
    .dashboard-title { font-size: 1.6rem; }
    .card-body-custom { padding: 1.25rem; }
}
</style>
</head>
<body>

<div class="container py-4 py-lg-5">

    <!-- Header -->
    <div class="dashboard-header d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
        <div>
            <h1 class="dashboard-title">
                <i class="bi bi-speedometer2 me-2 text-primary"></i>
                Admin Dashboard
            </h1>
            <p class="dashboard-subtitle">
                Manage questions, vouchers, and monitor exam resources.
            </p>
        </div>

        <a href="?logout=1" class="btn btn-modern btn-gradient-danger">
            <i class="bi bi-box-arrow-right me-2"></i>
            Logout
        </a>
    </div>

    <!-- Alerts -->
    <?php if ($success): ?>
        <div class="alert alert-success shadow-sm mb-4">
            <i class="bi bi-check-circle-fill me-2"></i>
            <?= htmlspecialchars($success) ?>
        </div>
    <?php endif; ?>

    <?php if ($error): ?>
        <div class="alert alert-danger shadow-sm mb-4">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <?= htmlspecialchars($error) ?>
        </div>
    <?php endif; ?>

    <!-- Stats -->
    <div class="row g-4 mb-4">
        <div class="col-md-6 col-xl-3">
            <div class="stat-card gradient-blue">
                <div class="icon"><i class="bi bi-question-circle"></i></div>
                <div class="value"><?= number_format($count) ?></div>
                <div class="label">Total Questions</div>
            </div>
        </div>

        <div class="col-md-6 col-xl-3">
            <div class="stat-card gradient-purple">
                <div class="icon"><i class="bi bi-ticket-perforated"></i></div>
                <div class="value"><?= number_format($totalVouchers) ?></div>
                <div class="label">Total Vouchers</div>
            </div>
        </div>

        <div class="col-md-6 col-xl-3">
            <div class="stat-card gradient-green">
                <div class="icon"><i class="bi bi-check2-circle"></i></div>
                <div class="value"><?= number_format($availableVouchers) ?></div>
                <div class="label">Available Vouchers</div>
            </div>
        </div>

        <div class="col-md-6 col-xl-3">
            <div class="stat-card gradient-orange">
                <div class="icon"><i class="bi bi-clock-history"></i></div>
                <div class="value"><?= number_format($usedVouchers) ?></div>
                <div class="label">Used Vouchers</div>
            </div>
        </div>
    </div>

    <!-- Forms -->
    <div class="row g-4 mb-4">

        <!-- Add Question -->
        <div class="col-lg-7">
            <div class="glass-card h-100">
                <div class="card-header-custom">
                    <h5>
                        <i class="bi bi-journal-plus text-success"></i>
                        Add New Question
                    </h5>
                </div>
                <div class="card-body-custom">
                    <form method="post">
                        <input type="hidden" name="action" value="add_question">

                        <div class="mb-3">
                            <label class="form-label">Question</label>
                            <textarea name="question" class="form-control" placeholder="Enter the complete question here..." required></textarea>
                        </div>

                        <div class="row g-3">
                            <div class="col-md-6"><label class="form-label">Option A</label><input name="a" class="form-control" required></div>
                            <div class="col-md-6"><label class="form-label">Option B</label><input name="b" class="form-control" required></div>
                            <div class="col-md-6"><label class="form-label">Option C</label><input name="c" class="form-control" required></div>
                            <div class="col-md-6"><label class="form-label">Option D</label><input name="d" class="form-control" required></div>
                        </div>

                        <div class="mt-3 mb-4">
                            <label class="form-label">Correct Option</label>
                            <select name="correct" class="form-select" required>
                                <option value="A">Option A</option>
                                <option value="B">Option B</option>
                                <option value="C">Option C</option>
                                <option value="D">Option D</option>
                            </select>
                        </div>

                        <button class="btn btn-modern btn-gradient-success w-100">
                            <i class="bi bi-save me-2"></i>
                            Save Question
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <!-- Voucher Column -->
        <div class="col-lg-5">

            <!-- Single Voucher -->
            <div class="glass-card mb-4">
                <div class="card-header-custom">
                    <h5>
                        <i class="bi bi-ticket-detailed text-primary"></i>
                        Create Voucher
                    </h5>
                </div>
                <div class="card-body-custom">
                    <form method="post">
                        <input type="hidden" name="action" value="add_voucher">

                        <div class="mb-3">
                            <label class="form-label">Voucher Code</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="bi bi-upc-scan"></i></span>
                                <input name="voucher_code" class="form-control" placeholder="e.g. EXAM-2026-001" required>
                            </div>
                        </div>

                        <button class="btn btn-modern btn-gradient-primary w-100">
                            <i class="bi bi-plus-circle me-2"></i>
                            Create Voucher
                        </button>
                    </form>
                </div>
            </div>

            <!-- Mass Voucher Generator -->
            <div class="glass-card">
                <div class="card-header-custom">
                    <h5>
                        <i class="bi bi-layers text-danger"></i>
                        Generate Mass Vouchers
                    </h5>
                </div>
                <div class="card-body-custom">
                    <form method="post">
                        <input type="hidden" name="action" value="generate_mass_vouchers">

                        <div class="mb-3">
                            <label class="form-label">Number of Vouchers</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="bi bi-123"></i></span>
                                <input type="number" name="voucher_quantity" class="form-control" placeholder="Enter quantity (e.g. 100)" min="1" max="10000" required>
                            </div>
                        </div>

                        <div class="alert alert-light border mb-3">
                            <small>
                                <strong>Format:</strong>
                                <code>ARX-1A2B3C4D5E6F789</code><br>
                                Prefix <strong>ARX-</strong> + 15 uppercase hexadecimal characters.
                            </small>
                        </div>

                        <button class="btn btn-modern btn-gradient-danger w-100">
                            <i class="bi bi-magic me-2"></i>
                            Generate Vouchers
                        </button>
                    </form>

                    <div class="footer-note mt-3 text-center">
                        Maximum 10,000 vouchers can be generated in one batch.
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Vouchers -->
    <div class="glass-card">
        <div class="card-header-custom">
            <h5>
                <i class="bi bi-clock-history text-warning"></i>
                Recent Vouchers
            </h5>
        </div>

        <div class="table-responsive">
            <table class="table table-modern align-middle mb-0">
                <thead>
                    <tr>
                        <th>Voucher Code</th>
                        <th>Status</th>
                        <th>Used At</th>
                    </tr>
                </thead>
                <tbody>
                    <?php while ($row = $vouchers->fetch_assoc()): ?>
                        <tr>
                            <td>
                                <code class="bg-light px-2 py-1 rounded">
                                    <?= htmlspecialchars($row['voucher_code']) ?>
                                </code>
                            </td>
                            <td>
                                <?php if ($row['used_by_candidate_id']): ?>
                                    <span class="badge-status badge-used">Used</span>
                                <?php else: ?>
                                    <span class="badge-status badge-available">Available</span>
                                <?php endif; ?>
                            </td>
                            <td>
                                <?= $row['used_at'] ? htmlspecialchars($row['used_at']) : '<span class="text-muted">—</span>' ?>
                            </td>
                        </tr>
                    <?php endwhile; ?>
                </tbody>
            </table>
        </div>
    </div>

</div>

</body>
</html>