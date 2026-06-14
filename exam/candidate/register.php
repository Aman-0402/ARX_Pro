<?php include '../config.php';
$error = '';

if($_SERVER['REQUEST_METHOD']=='POST'){
    $voucher = trim($_POST['voucher_code']);

    $stmt = $conn->prepare("SELECT id FROM vouchers WHERE voucher_code = ? AND is_active = 1 AND used_by_candidate_id IS NULL");
    $stmt->bind_param('s', $voucher);
    $stmt->execute();
    $result = $stmt->get_result();

    if($result->num_rows === 0){
        $error = 'Invalid or already used voucher code.';
    } else {
        $voucherRow = $result->fetch_assoc();

        $stmt = $conn->prepare("INSERT INTO candidates(name,email) VALUES (?,?)");
        $stmt->bind_param('ss', $_POST['name'], $_POST['email']);
        $stmt->execute();

        $candidate_id = $stmt->insert_id;

        $stmt = $conn->prepare("UPDATE vouchers SET used_by_candidate_id = ?, used_at = NOW() WHERE id = ?");
        $stmt->bind_param('ii', $candidate_id, $voucherRow['id']);
        $stmt->execute();

        $_SESSION['candidate_id'] = $candidate_id;
        $_SESSION['candidate_name'] = $_POST['name'];

        header('Location: exam.php');
        exit;
    }
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Candidate Registration</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">

<style>
    body {
        min-height: 100vh;
        background: linear-gradient(135deg, #0d6efd 0%, #6f42c1 100%);
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    }

    .registration-card {
        border: none;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.18);
        backdrop-filter: blur(10px);
    }

    .card-header-custom {
        background: linear-gradient(135deg, #0d6efd, #6610f2);
        color: #fff;
        padding: 2.5rem 2rem;
        text-align: center;
    }

    .card-header-custom .icon-wrapper {
        width: 80px;
        height: 80px;
        margin: 0 auto 1rem;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.2rem;
        backdrop-filter: blur(8px);
    }

    .card-header-custom h3 {
        font-weight: 700;
        margin-bottom: 0.5rem;
    }

    .card-header-custom p {
        margin: 0;
        opacity: 0.9;
        font-size: 0.95rem;
    }

    .card-body {
        padding: 2.5rem;
    }

    .form-label {
        font-weight: 600;
        color: #495057;
        margin-bottom: 0.5rem;
    }

    .input-group-text {
        background: #f8f9fa;
        border-right: 0;
        color: #6c757d;
    }

    .form-control {
        border-left: 0;
        padding: 0.85rem 1rem;
        font-size: 0.95rem;
        border-radius: 0 12px 12px 0 !important;
    }

    .input-group .input-group-text {
        border-radius: 12px 0 0 12px !important;
    }

    .form-control:focus {
        box-shadow: none;
        border-color: #86b7fe;
    }

    .input-group:focus-within .input-group-text {
        border-color: #86b7fe;
        background: #eef5ff;
        color: #0d6efd;
    }

    .btn-start {
        background: linear-gradient(135deg, #0d6efd, #6610f2);
        border: none;
        border-radius: 12px;
        padding: 0.9rem 1.25rem;
        font-weight: 600;
        font-size: 1rem;
        box-shadow: 0 10px 20px rgba(13, 110, 253, 0.25);
        transition: all 0.3s ease;
    }

    .btn-start:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 28px rgba(13, 110, 253, 0.3);
    }

    .alert {
        border: none;
        border-radius: 12px;
        padding: 0.9rem 1rem;
    }

    .footer-note {
        margin-top: 1.25rem;
        text-align: center;
        color: #6c757d;
        font-size: 0.85rem;
    }

    @media (max-width: 576px) {
        .card-body {
            padding: 2rem 1.5rem;
        }

        .card-header-custom {
            padding: 2rem 1.5rem;
        }
    }
</style>
</head>
<body>

<div class="container py-5 d-flex align-items-center justify-content-center" style="min-height: 100vh;">
    <div class="card registration-card mx-auto" style="max-width: 600px; width: 100%;">
        
        <div class="card-header-custom">
            <div class="icon-wrapper">
                <i class="bi bi-person-vcard"></i>
            </div>
            <h3>Candidate Registration</h3>
            <p>Enter your details and validate your voucher code to begin the exam.</p>
        </div>

        <div class="card-body">

            <?php if($error): ?>
                <div class="alert alert-danger d-flex align-items-center mb-4">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    <span><?= htmlspecialchars($error) ?></span>
                </div>
            <?php endif; ?>

            <form method="post">

                <div class="mb-3">
                    <label class="form-label">Full Name</label>
                    <div class="input-group">
                        <span class="input-group-text">
                            <i class="bi bi-person"></i>
                        </span>
                        <input name="name"
                               class="form-control"
                               placeholder="Enter your full name"
                               required
                               value="<?= isset($_POST['name']) ? htmlspecialchars($_POST['name']) : '' ?>">
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label">Email Address</label>
                    <div class="input-group">
                        <span class="input-group-text">
                            <i class="bi bi-envelope"></i>
                        </span>
                        <input name="email"
                               type="email"
                               class="form-control"
                               placeholder="Enter your email address"
                               required
                               value="<?= isset($_POST['email']) ? htmlspecialchars($_POST['email']) : '' ?>">
                    </div>
                </div>

                <div class="mb-4">
                    <label class="form-label">Voucher Code</label>
                    <div class="input-group">
                        <span class="input-group-text">
                            <i class="bi bi-ticket-perforated"></i>
                        </span>
                        <input name="voucher_code"
                               class="form-control"
                               placeholder="Enter your voucher code"
                               required
                               value="<?= isset($_POST['voucher_code']) ? htmlspecialchars($_POST['voucher_code']) : '' ?>">
                    </div>
                </div>

                <button class="btn btn-primary btn-start w-100">
                    <i class="bi bi-play-circle me-2"></i>
                    Validate Voucher & Start Exam
                </button>
            </form>

            <div class="footer-note">
                Please ensure your details are correct before proceeding.
            </div>
        </div>
    </div>
</div>

</body>
</html>