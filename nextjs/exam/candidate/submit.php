<?php include '../config.php'; if(empty($_SESSION['candidate_id'])) die('Invalid');
$qids=$_POST['qid'] ?? []; $score=0; $details=[];
foreach($qids as $qid){
$qid=(int)$qid;
$selected=$_POST['ans'][$qid] ?? '';
$row=$conn->query("SELECT correct_option FROM questions WHERE id=$qid")->fetch_assoc();
$correct=$row['correct_option'] ?? '';
if($selected===$correct) $score++;
$details[]=['qid'=>$qid,'selected'=>$selected,'correct'=>$correct];
}
$total=count($qids); $json=json_encode($details);
$stmt=$conn->prepare("INSERT INTO results(candidate_id,score,total,details) VALUES (?,?,?,?)");
$stmt->bind_param('iiis', $_SESSION['candidate_id'], $score, $total, $json);
$stmt->execute();
$_SESSION['score']=$score; $_SESSION['total']=$total;
header('Location: result.php');
?>