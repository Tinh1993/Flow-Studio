import './style.css';
import { Client } from '@gradio/client';
import {buildRequest,videoUrl,errorMessage,runRequest,ORIGINS,NEGATIVE} from './api.js';
const $=id=>document.getElementById(id);
$('negative').value=NEGATIVE;
const files={first:null,last:null};const objectUrls={};let active=false,stop=null,runId=0;
function status(text,kind=''){$('status').textContent=text;$('dot').className='dot '+kind;}
function setBusy(b){active=b;$('controls').disabled=b;$('cancel').hidden=!b;$('generate').textContent=b?'Đang xử lý…':'Tạo video ↗';}
for(const id of ['first','last']){
 function clear(){files[id]=null;$(id).value='';if(objectUrls[id])URL.revokeObjectURL(objectUrls[id]);$(id+'-thumb').hidden=true;$(id+'-thumb').removeAttribute('src');$(id+'-remove').hidden=true;}
 $(id+'-remove').onclick=clear;
 $(id).onchange=async()=>{const file=$(id).files[0];if(!file)return;clear();if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>10*1024*1024){status('Chọn ảnh PNG, JPG hoặc WebP không quá 10 MB.','error');return;}try{const bitmap=await createImageBitmap(file);bitmap.close();files[id]=file;objectUrls[id]=URL.createObjectURL(file);$(id+'-thumb').src=objectUrls[id];$(id+'-thumb').hidden=false;$(id+'-remove').hidden=false;status('Đã chọn ảnh.');}catch{status('Tệp ảnh không đọc được. Hãy chọn ảnh khác.','error');}};
}
$('model').onchange=()=>{const mini=$('model').value==='mini';$('hq-settings').hidden=mini;$('mini-settings').hidden=!mini;$('fps-label').hidden=mini;$('canvas-label').hidden=!mini;Object.assign($('duration'),{min:mini?'2':'.5',max:mini?'14':'20.1',step:mini?'1':'.1',value:mini?'6':'3.5'});$('steps').max=mini?'50':'30';$('steps').value=mini?'20':'6';};
for(const btn of document.querySelectorAll('[data-prompt]'))btn.onclick=()=>{$('prompt').value=btn.dataset.prompt;};
function values(){const v={...files};for(const id of ['model','duration','fps','prompt','negative','steps','guidance','seed','variant','canvas','lora'])v[id]=$(id).value;for(const id of ['upscale','random','upsample'])v[id]=$(id).checked;return v;}
async function run(preview){if(active)return;let request;const model=$('model').value;try{request=buildRequest(values(),preview);}catch(e){status(errorMessage(e),'error');return;}
 const id=++runId;setBusy(true);status('Đang kết nối dịch vụ…','busy');$('preview-result').hidden=true;
 if(!preview){$('video').pause();$('video').removeAttribute('src');$('video').load();$('video').hidden=true;$('empty').hidden=false;$('download').hidden=true;}
 let gotResult=false;const timer=setTimeout(()=>{if(id===runId){stop?.();runId++;setBusy(false);status('Đã dừng chờ sau 20 phút. Tác vụ ở dịch vụ có thể vẫn tiếp tục.','error');}},20*60*1000);
 try{await runRequest(Client,model,$('token').value.trim(),request,{
 control:cancel=>{stop=cancel;},
 status:e=>{if(id!==runId||gotResult)return;const position=Number.isFinite(e.position)?` · vị trí ${e.position+1}`:'';status(e.stage==='pending'?`Đang chờ trong hàng đợi${position}`:'Đang xử lý yêu cầu…','busy');},
 data:data=>{if(id!==runId)return;if(preview){$('preview-result').textContent=data.filter(x=>typeof x==='string').join('\n').replaceAll('**','').replace('Output:', 'Kết quả dự kiến:').replace('frames @', 'khung hình ·').replace('fps', 'khung hình/giây')||JSON.stringify(data,null,2);$('preview-result').hidden=false;status('Đã nhận thông số dự kiến.');}else{const url=videoUrl(data,ORIGINS[model]);if(!url)throw Error('Dịch vụ chưa trả đường dẫn video hợp lệ.');$('video').src=url;$('video').hidden=false;$('empty').hidden=true;$('download').href=url;$('download').hidden=false;status('Video đã sẵn sàng.');}gotResult=true;}
 });}catch(e){if(id===runId)status(errorMessage(e),'error');}finally{clearTimeout(timer);if(id===runId){setBusy(false);stop=null;}}
}
$('form').onsubmit=e=>{e.preventDefault();run(false);};$('preview').onclick=()=>run(true);
$('cancel').onclick=()=>{runId++;stop?.();stop=null;setBusy(false);status('Đã dừng chờ. Yêu cầu hủy đã gửi; dịch vụ có thể vẫn đang xử lý.');};
$('video').onerror=()=>status('Không phát được video. Hãy thử mở liên kết tải; tệp trên dịch vụ có thể đã hết hạn.','error');
window.addEventListener('beforeunload',e=>{if(active){e.preventDefault();e.returnValue='';}});

