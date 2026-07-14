<?php
include '../config.php';

if (empty($_SESSION['candidate_id'])) {
    die('Invalid session');
}

$res = $conn->query("SELECT * FROM questions ORDER BY RAND() LIMIT 45");
$questions = [];
while ($row = $res->fetch_assoc()) {
    $questions[] = $row;
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Online Proctored Examination</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

<style>
    :root {
        --primary: #0d6efd;
        --primary-dark: #0b5ed7;
        --danger: #dc3545;
        --success: #198754;
        --dark: #0f172a;
        --card-radius: 18px;
        --shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        --shadow-lg: 0 20px 45px rgba(15, 23, 42, 0.12);
    }

    body {
        background: linear-gradient(135deg, #f8fafc 0%, #eef4ff 100%);
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        color: #1e293b;
        min-height: 100vh;
    }

    /* Hide exam until proctoring starts */
    #examContainer {
        display: none;
    }

    /* Instruction card */
    .instruction-card {
        max-width: 900px;
        margin: 40px auto;
        border: none;
        border-radius: 28px;
        box-shadow: var(--shadow-lg);
        overflow: hidden;
    }

    .instruction-header {
        background: linear-gradient(135deg, #0d6efd, #4f46e5);
        color: #fff;
        padding: 35px 40px;
    }

    .instruction-header h2 {
        margin: 0;
        font-weight: 700;
        letter-spacing: 0.3px;
    }

    .instruction-body {
        padding: 40px;
        background: #fff;
    }

    .instruction-list li {
        margin-bottom: 12px;
        font-size: 1rem;
    }

    /* Floating timer */
    .floating-timer {
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 9999;
        background: linear-gradient(135deg, #ffffff, #f8fafc);
        border: 2px solid rgba(220, 53, 69, 0.15);
        border-left: 6px solid var(--danger);
        border-radius: 16px;
        box-shadow: 0 12px 30px rgba(220, 53, 69, 0.12);
        padding: 14px 22px;
        min-width: 170px;
        backdrop-filter: blur(8px);
    }

    .floating-timer .label {
        font-size: 0.78rem;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 2px;
    }

    .floating-timer .time {
        font-size: 2rem;
        font-weight: 800;
        color: var(--danger);
        line-height: 1;
        font-variant-numeric: tabular-nums;
    }

    /* Webcam preview */
    #cam {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 240px;
        height: 180px;
        object-fit: cover;
        border-radius: 18px;
        border: 4px solid #fff;
        background: #000;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
        z-index: 9998;
    }

    /* Main exam content */
    .exam-wrapper {
        max-width: 1000px;
        margin: 0 auto;
        padding-top: 20px;
    }

    .exam-header {
        background: #fff;
        border-radius: var(--card-radius);
        box-shadow: var(--shadow);
        padding: 24px 30px;
        margin-bottom: 24px;
        border: 1px solid #e2e8f0;
    }

    .exam-header h3 {
        margin: 0;
        font-weight: 700;
        color: var(--dark);
    }

    .exam-subtitle {
        color: #64748b;
        margin-top: 4px;
        font-size: 0.95rem;
    }

    /* Question cards */
    .question-card {
        border: none;
        border-radius: var(--card-radius);
        box-shadow: var(--shadow);
        margin-bottom: 24px;
        overflow: hidden;
        transition: all 0.25s ease;
    }

    .question-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 35px rgba(15, 23, 42, 0.10);
    }

    .question-card .card-body {
        padding: 28px;
    }

    .question-number {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: linear-gradient(135deg, #0d6efd, #4f46e5);
        color: #fff;
        font-weight: 700;
        margin-right: 10px;
        font-size: 0.95rem;
    }

    .question-text {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--dark);
        line-height: 1.6;
        margin-bottom: 20px;
    }

    /* Option styling */
    .form-check {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 14px 16px 14px 42px;
        margin-bottom: 12px;
        transition: all 0.2s ease;
    }

    .form-check:hover {
        background: #eff6ff;
        border-color: #93c5fd;
    }

    .form-check-input {
        margin-top: 0.35rem;
    }

    .form-check-input:checked {
        background-color: var(--primary);
        border-color: var(--primary);
    }

    .form-check:has(.form-check-input:checked) {
        background: #eff6ff;
        border-color: var(--primary);
        box-shadow: inset 0 0 0 1px rgba(13, 110, 253, 0.15);
    }

    .form-check-label {
        cursor: pointer;
        width: 100%;
        font-weight: 500;
        color: #334155;
    }

    /* Submit button */
    .submit-btn {
        border: none;
        border-radius: 14px;
        padding: 16px;
        font-size: 1.05rem;
        font-weight: 700;
        background: linear-gradient(135deg, #198754, #157347);
        box-shadow: 0 12px 28px rgba(25, 135, 84, 0.22);
        transition: all 0.25s ease;
    }

    .submit-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 16px 34px rgba(25, 135, 84, 0.28);
    }

    /* Responsive */
    @media (max-width: 992px) {
        #cam {
            width: 180px;
            height: 135px;
        }

        .floating-timer {
            min-width: 145px;
            padding: 12px 18px;
        }

        .floating-timer .time {
            font-size: 1.7rem;
        }
    }

    @media (max-width: 768px) {
        #cam {
            width: 140px;
            height: 105px;
            top: 12px;
            right: 12px;
        }

        .floating-timer {
            top: 12px;
            left: 12px;
            min-width: 125px;
            padding: 10px 14px;
        }

        .floating-timer .time {
            font-size: 1.35rem;
        }

        .instruction-body {
            padding: 25px;
        }

        .question-card .card-body {
            padding: 22px;
        }

        .exam-wrapper {
            padding-top: 10px;
        }
    }
</style>
</head>
<body>

<!-- Instruction Screen -->
<div class="container">
    <div id="instructionScreen" class="card instruction-card">
        <div class="instruction-header">
            <h2>Online Proctored Examination</h2>
        </div>
        <div class="instruction-body">
            <ul class="instruction-list mb-4">
                <li>45 random questions will be displayed.</li>
                <li>Total exam duration is 45 minutes.</li>
                <li>Camera access is mandatory.</li>
                <li>Fullscreen mode is mandatory.</li>
                <li>Tab switching or exiting fullscreen will generate warnings.</li>
                <li>After 3 warnings, the exam will be auto-submitted.</li>
            </ul>

            <div class="form-check mb-4">
                <input class="form-check-input" type="checkbox" id="agreeCheck">
                <label class="form-check-label" for="agreeCheck">
                    I agree to allow camera access and fullscreen monitoring.
                </label>
            </div>

            <button id="startExamBtn" class="btn btn-primary btn-lg w-100 py-3 fw-bold" disabled>
                Start Proctoring & Begin Exam
            </button>
        </div>
    </div>
</div>

<!-- Exam Container -->
<div id="examContainer">
    <!-- Fixed Timer -->
    <div class="floating-timer">
        <div class="label">Time Remaining</div>
        <div id="timer" class="time">45:00</div>
    </div>

    <!-- Webcam -->
    <video id="cam" autoplay muted playsinline></video>

    <div class="container exam-wrapper">
        <div class="exam-header">
            <h3>Excel & Power BI Assessment</h3>
            <div class="exam-subtitle">
                Answer all questions carefully before submitting.
            </div>
        </div>

        <form method="post" action="submit.php" id="examForm">
            <?php foreach ($questions as $i => $q): ?>
                <input type="hidden" name="qid[]" value="<?= $q['id'] ?>">

                <div class="card question-card">
                    <div class="card-body">
                        <div class="question-text">
                            <span class="question-number"><?= $i + 1 ?></span>
                            <?= htmlspecialchars($q['question']) ?>
                        </div>

                        <?php foreach (['A', 'B', 'C', 'D'] as $opt): ?>
                            <?php $field = 'option_' . strtolower($opt); ?>
                            <div class="form-check">
                                <input
                                    class="form-check-input"
                                    type="radio"
                                    name="ans[<?= $q['id'] ?>]"
                                    value="<?= $opt ?>"
                                    id="q<?= $q['id'] . $opt ?>"
                                >
                                <label
                                    class="form-check-label"
                                    for="q<?= $q['id'] . $opt ?>"
                                >
                                    <?= htmlspecialchars($q[$field]) ?>
                                </label>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            <?php endforeach; ?>

            <button type="submit" class="btn submit-btn btn-success w-100 mb-5">
                Submit Exam
            </button>
        </form>
    </div>
</div>

<!-- Keep your existing JavaScript exactly as in your current working version -->

<script>
const agreeCheck = document.getElementById('agreeCheck');
const startExamBtn = document.getElementById('startExamBtn');
const instructionScreen = document.getElementById('instructionScreen');
const examContainer = document.getElementById('examContainer');
const video = document.getElementById('cam');
const examForm = document.getElementById('examForm');
const timerEl = document.getElementById('timer');

let warnings = 0;
let timeRemaining = 45 * 60; // 45 minutes

agreeCheck.addEventListener('change', function () {
    startExamBtn.disabled = !this.checked;
});

startExamBtn.addEventListener('click', async function () {
    try {
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });
        video.srcObject = stream;

        // Request fullscreen
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            await elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            await elem.msRequestFullscreen();
        }

        // Show exam
        instructionScreen.style.display = 'none';
        examContainer.style.display = 'block';

        // Start timer and monitoring
        startTimer();
        setupProctoring();

    } catch (error) {
        alert(
            'Camera access and fullscreen are required to start the exam. ' +
            'Please allow the permissions and try again.'
        );
        console.error(error);
    }
});

function startTimer() {
    const interval = setInterval(() => {
        if (timeRemaining <= 0) {
            clearInterval(interval);
            alert('Time is over. Your exam will be submitted automatically.');
            examForm.submit();
            return;
        }

        const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, '0');
        const seconds = String(timeRemaining % 60).padStart(2, '0');
        timerEl.textContent = `${minutes}:${seconds}`;

        timeRemaining--;
    }, 1000);
}

function addWarning(message) {
    warnings++;

    alert(`${message}\nWarning ${warnings} of 3`);

    if (warnings >= 3) {
        alert('Maximum warnings reached. The exam will now be submitted.');
        examForm.submit();
    }
}

function setupProctoring() {
    // Detect tab switching
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            addWarning('Tab switching detected.');
        }
    });

    // Detect exiting fullscreen
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            addWarning('Fullscreen mode was exited.');
        }
    });

    // Disable right-click
    document.addEventListener('contextmenu', e => e.preventDefault());

    // Disable common shortcuts
    document.addEventListener('keydown', function (e) {
        const blocked =
            e.key === 'F12' ||
            (e.ctrlKey && ['c', 'v', 'x', 'u', 's', 'p'].includes(e.key.toLowerCase()));

        if (blocked) {
            e.preventDefault();
        }
    });
}
</script>

</body>
</html>