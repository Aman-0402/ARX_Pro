async function startProctoring(){
const video=document.getElementById('cam');
try{
 const stream=await navigator.mediaDevices.getUserMedia({video:true});
 video.srcObject=stream;
}catch(e){ alert('Camera access is required'); location.href='../index.php'; }
if(document.documentElement.requestFullscreen){ document.documentElement.requestFullscreen(); }
let warnings=0;
function warn(msg){ warnings++; alert(msg+' ('+warnings+'/3)'); if(warnings>=3) document.getElementById('examForm').submit(); }
document.addEventListener('visibilitychange', ()=>{ if(document.hidden) warn('Tab switching detected'); });
document.addEventListener('fullscreenchange', ()=>{ if(!document.fullscreenElement) warn('Exited fullscreen'); });
document.addEventListener('contextmenu', e=>e.preventDefault());
}
