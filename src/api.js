export const ORIGINS = {hq:'https://someone-in-the-world-highqualityvideogeneration.hf.space',mini:'https://minimaxai-minimax-h3-turbo-lora.hf.space'};
export const NEGATIVE = '色调艳丽, 过曝, 静态, 细节模糊不清, 字幕, 风格, 作品, 画作, 画面, 静止, 整体发灰, 最差质量, 低质量, JPEG压缩残留, 丑陋的, 残缺的, 多余的手指, 画得不好的手部, 画得不好的脸部, 畸形的, 毁容的, 形态畸形的肢体, 手指融合, 静止不动的画面, 杂乱的背景, 三条腿, 背景人很多, 倒着走';
function number(v,min,max,label,integer=false){ const n=Number(v); if(v===''||!Number.isFinite(n)||n<min||n>max||(integer&&!Number.isInteger(n)))throw Error(`${label} phải từ ${min} đến ${max}${integer?' và là số nguyên':''}.`);return n; }
export function buildRequest(v,preview=false){
 if(!ORIGINS[v.model])throw Error('Mô hình không hợp lệ.');
 if((v.model==='hq'||preview)&&!v.first)throw Error('Hãy chọn ảnh bắt đầu.');
 if(preview&&v.model!=='hq')throw Error('Xem thông số chỉ có ở High Quality Video.');
 const duration=number(v.duration,v.model==='hq'?0.5:2,v.model==='hq'?20.1:14,'Thời lượng',v.model==='mini');
 if(v.model==='hq'){
 if(!['16','32','64','128'].includes(String(v.fps)))throw Error('Số khung hình không hợp lệ.');
 const payload={input_image:v.first,duration_seconds:duration,frame_multiplier:Number(v.fps),upscale_output:!!v.upscale};
 if(preview){const n=number(v.variant,0,4,'Preview',true);return {endpoint:n?`/preview_effect_${n}`:'/preview_effect',payload};}
 if(!v.prompt.trim())throw Error('Hãy viết mô tả cho video.');
 return {endpoint:'/generate_video',payload:{...payload,last_image:v.last||null,prompt:v.prompt.trim(),negative_prompt:v.negative,steps:number(v.steps,1,30,'Số bước',true),guidance_scale:number(v.guidance,0,10,'Độ bám sát'),seed:number(v.seed,0,2147483647,'Seed',true),randomize_seed:!!v.random}};
 }
 if(!v.prompt.trim())throw Error('Hãy viết mô tả cho video.');
 if(!['960x544 · 16:9 fast','544x960 · 9:16 fast'].includes(v.canvas)||!['off','larry','lightx'].includes(v.lora))throw Error('Cấu hình MiniMax không hợp lệ.');
 return {endpoint:'/output_video',payload:{in_0:v.prompt.trim(),in_1:v.first||null,in_2:v.last||null,in_3:v.canvas,in_4:duration,in_5:number(v.steps,1,50,'Số bước',true),in_6:number(v.seed,0,2147483647,'Seed',true),in_7:!!v.upsample,in_8:v.lora}};
}
export function videoUrl(data,origin){
 const candidate=Array.isArray(data)?data[0]:data; const file=candidate?.video||candidate;
 const raw=typeof file==='string'?file:file?.url||(file?.path?`${origin}/gradio_api/file=${file.path}`:null);
 if(!raw)return null;
 try{const url=new URL(raw,origin);return url.protocol==='https:'&&url.origin===origin?url.href:null;}catch{return null;}
}
export function errorMessage(e){const raw=String(e?.message||e||'Dịch vụ không trả kết quả.').replace(/hf_[A-Za-z0-9]+/g,'[token]').slice(0,500);if(/quota|exceeded|limit|429/i.test(raw))return 'Dịch vụ đã hết hạn mức hoặc đang giới hạn lượt tạo. Hãy thử lại sau. '+raw;if(/401|403|unauth|token|sign.?in/i.test(raw))return 'Dịch vụ yêu cầu quyền truy cập. Kiểm tra token Hugging Face trong mục Kết nối. '+raw;return raw;}
export async function runRequest(Client,model,token,request,{status=()=>{},data=()=>{},control=()=>{}}={}){
 let client,submission,cancelled=false;
 control(()=>{cancelled=true;Promise.resolve(submission?.cancel()).catch(()=>{});client?.close();});
 try{
 client=await Client.connect(ORIGINS[model],{...(token?{hf_token:token,oauth_token:token}:{}),events:['data','status'],record_history:false});
 if(cancelled)return;
 submission=client.submit(request.endpoint,request.payload);
 let received=false;
 for await(const event of submission){if(cancelled)return;if(event.type==='status'){if(event.stage==='error')throw Error(event.message||event.original_msg||'Dịch vụ báo lỗi.');status(event);}if(event.type==='data'){received=true;data(event.data);}}
 if(!received&&!cancelled)throw Error('Dịch vụ kết thúc nhưng chưa trả kết quả. Hãy thử lại.');
 }finally{client?.close();}
}


