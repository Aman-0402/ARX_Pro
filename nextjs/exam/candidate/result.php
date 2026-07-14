<?php
include '../config.php';

if (empty($_SESSION['candidate_id'])) {
    die('Invalid session.');
}

$candidateId = (int)$_SESSION['candidate_id'];

/*
|--------------------------------------------------------------------------
| Fetch Latest Result for Candidate
|--------------------------------------------------------------------------
*/
$stmt = $conn->prepare("
    SELECT *
    FROM results
    WHERE candidate_id = ?
    ORDER BY id DESC
    LIMIT 1
");
$stmt->bind_param('i', $candidateId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    die('Result not found.');
}

$row = $result->fetch_assoc();

/*
|--------------------------------------------------------------------------
| Basic Result Data
|--------------------------------------------------------------------------
*/
$score      = (int)$row['score'];
$total      = (int)$row['total'];
$percentage = $total > 0 ? round(($score / $total) * 100, 2) : 0;

// Read status from database (Passed / Failed)
$status = $row['status'] ?? (($percentage >= 60) ? 'Passed' : 'Failed');
$isPassed = strtolower($status) === 'passed';

$passMark = 60;

/*
|--------------------------------------------------------------------------
| Decode Question-wise Details
|--------------------------------------------------------------------------
*/
$details = json_decode($row['details'], true);
if (!is_array($details)) {
    $details = [];
}

/*
|--------------------------------------------------------------------------
| Helper Function: Get Option Text
|--------------------------------------------------------------------------
*/
function getOptionText($conn, $questionId, $optionLetter)
{
    if (empty($optionLetter)) {
        return 'Not Answered';
    }

    $stmt = $conn->prepare("
        SELECT option_a, option_b, option_c, option_d
        FROM questions
        WHERE id = ?
        LIMIT 1
    ");
    $stmt->bind_param('i', $questionId);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($res->num_rows === 0) {
        return $optionLetter;
    }

    $question = $res->fetch_assoc();

    $map = [
        'A' => $question['option_a'],
        'B' => $question['option_b'],
        'C' => $question['option_c'],
        'D' => $question['option_d']
    ];

    return $optionLetter . '. ' . ($map[$optionLetter] ?? $optionLetter);
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Exam Result Analysis</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

<style>
    body {
        background: linear-gradient(135deg, #f8fafc 0%, #eef4ff 100%);
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        color: #1e293b;
    }

    .summary-card {
        border: none;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 20px 45px rgba(15, 23, 42, 0.10);
    }

    .summary-header {
        background: linear-gradient(135deg, #0d6efd, #4f46e5);
        color: #fff;
        text-align: center;
        padding: 40px 30px;
    }

    .summary-header h2 {
        font-weight: 700;
        margin-bottom: 10px;
    }

    .score-circle {
        width: 160px;
        height: 160px;
        border-radius: 50%;
        background: #fff;
        color: #0d6efd;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 25px auto;
        font-size: 2.1rem;
        font-weight: 800;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
    }

    .stats-box {
        background: #ffffff;
        border-radius: 16px;
        padding: 20px;
        text-align: center;
        height: 100%;
        box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
    }

    .stats-box h3 {
        margin: 0;
        font-weight: 800;
        color: #0d6efd;
    }

    .stats-box p {
        margin: 6px 0 0;
        color: #64748b;
        font-weight: 500;
    }

    .analysis-card {
        border: none;
        border-radius: 18px;
        box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
        margin-bottom: 20px;
    }

    .question-title {
        font-weight: 700;
        line-height: 1.6;
        color: #0f172a;
    }

    .status-badge {
        font-size: 0.85rem;
        font-weight: 700;
        padding: 6px 12px;
        border-radius: 999px;
    }

    .answer-box {
        padding: 12px 15px;
        border-radius: 10px;
        margin-bottom: 10px;
    }

    .selected-answer {
        background: #fff7ed;
        border-left: 4px solid #f97316;
    }

    .correct-answer {
        background: #ecfdf5;
        border-left: 4px solid #10b981;
    }

    .progress {
        height: 24px;
        border-radius: 999px;
        overflow: hidden;
    }

    .home-btn {
        border-radius: 12px;
        padding: 14px 40px;
        font-weight: 700;
        box-shadow: 0 8px 20px rgba(13, 110, 253, 0.20);
    }

    @media (max-width: 768px) {
        .score-circle {
            width: 130px;
            height: 130px;
            font-size: 1.8rem;
        }

        .summary-header {
            padding: 30px 20px;
        }
    }
</style>
</head>
<body>

<div class="container py-5">

    <!-- Result Summary -->
    <div class="card summary-card mb-5">
        <div class="summary-header">
            <h2>Exam Result Analysis</h2>
            <p class="mb-0 fs-5">
                <?= htmlspecialchars($_SESSION['candidate_name'] ?? 'Candidate') ?>
            </p>

            <div class="score-circle">
                <?= $score ?> / <?= $total ?>
            </div>

            <h4 class="mb-0">
                <span class="badge <?= $isPassed ? 'bg-success' : 'bg-danger' ?>">
                    <?= htmlspecialchars($status) ?>
                </span>
            </h4>
        </div>

        <div class="card-body p-4">
            <div class="row g-4 mb-4">
                <div class="col-md-3">
                    <div class="stats-box">
                        <h3><?= $score ?></h3>
                        <p>Correct Answers</p>
                    </div>
                </div>

                <div class="col-md-3">
                    <div class="stats-box">
                        <h3><?= $total - $score ?></h3>
                        <p>Incorrect Answers</p>
                    </div>
                </div>

                <div class="col-md-3">
                    <div class="stats-box">
                        <h3><?= $percentage ?>%</h3>
                        <p>Percentage</p>
                    </div>
                </div>

                <div class="col-md-3">
                    <div class="stats-box">
                        <h3><?= $passMark ?>%</h3>
                        <p>Passing Marks</p>
                    </div>
                </div>
            </div>

            <h5 class="mb-2">Performance Overview</h5>
            <div class="progress">
                <div
                    class="progress-bar <?= $isPassed ? 'bg-success' : 'bg-danger' ?>"
                    role="progressbar"
                    style="width: <?= $percentage ?>%;"
                    aria-valuenow="<?= $percentage ?>"
                    aria-valuemin="0"
                    aria-valuemax="100"
                >
                    <?= $percentage ?>%
                </div>
            </div>
        </div>
    </div>

    <!-- Question-wise Analysis Header -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <h3 class="mb-2 mb-md-0">Question-wise Analysis</h3>
        <span class="text-muted">
            Submitted on:
            <?= date('d M Y, h:i A', strtotime($row['submitted_at'])) ?>
        </span>
    </div>

    <!-- Detailed Question Analysis -->
    <?php foreach ($details as $index => $detail): ?>
        <?php
        $questionId = (int)$detail['qid'];
        $selected   = $detail['selected'] ?? '';
        $correct    = $detail['correct'] ?? '';

        // Fetch question text
        $stmt = $conn->prepare("
            SELECT question
            FROM questions
            WHERE id = ?
            LIMIT 1
        ");
        $stmt->bind_param('i', $questionId);
        $stmt->execute();
        $qResult = $stmt->get_result();

        $questionText = $qResult->num_rows
            ? $qResult->fetch_assoc()['question']
            : 'Question not found';

        $isCorrectAnswer = ($selected === $correct);
        ?>

        <div class="card analysis-card">
            <div class="card-body p-4">

                <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-3">
                    <div class="question-title">
                        Q<?= $index + 1 ?>.
                        <?= htmlspecialchars($questionText) ?>
                    </div>

                    <span class="badge status-badge <?= $isCorrectAnswer ? 'bg-success' : 'bg-danger' ?>">
                        <?= $isCorrectAnswer ? 'Correct' : 'Incorrect' ?>
                    </span>
                </div>

                <div class="answer-box selected-answer">
                    <strong>Your Answer:</strong><br>
                    <?= htmlspecialchars(getOptionText($conn, $questionId, $selected)) ?>
                </div>

                <div class="answer-box correct-answer">
                    <strong>Correct Answer:</strong><br>
                    <?= htmlspecialchars(getOptionText($conn, $questionId, $correct)) ?>
                </div>

            </div>
        </div>
    <?php endforeach; ?>

    <!-- Back to Home -->
    <div class="text-center mt-5">
        <a href="../index.php" class="btn btn-primary btn-lg home-btn">
            Back to Home
        </a>
    </div>

</div>

</body>
</html>