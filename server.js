const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const PORT=process.env.PORT||3000, ADMIN=process.env.ADMIN_KEY||'change-me';
const DB=path.join(__dirname,'data.json'), PUB=path.join(__dirname,'public');
const load=()=>{try{return JSON.parse(fs.readFileSync(DB))}catch{return{rsvps:[],wishes:[]}}};
const save=d=>fs.writeFileSync(DB,JSON.stringify(d,null,2));
const clean=(s,n=300)=>String(s||'').replace(/[<>]/g,'').trim().slice(0,n);
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg','.ico':'image/x-icon'};
const send=(r,c,o)=>{r.writeHead(c,{'Content-Type':'application/json','Cache-Control':'no-store'});r.end(JSON.stringify(o))};
const body=q=>new Promise(resolve=>{let b='';q.on('data',c=>{b+=c;if(b.length>1e5)q.destroy()});q.on('end',()=>{try{resolve(JSON.parse(b))}catch{resolve({})}})});
const validKey=k=>{const a=Buffer.from(String(k||'')),b=Buffer.from(String(ADMIN||''));return b.length>0&&a.length===b.length&&crypto.timingSafeEqual(a,b)};
http.createServer(async(q,r)=>{
 const u=new URL(q.url,'http://x');
 if(u.pathname==='/api/rsvp'&&q.method==='POST'){const b=await body(q),name=clean(b.name,80);if(!name)return send(r,400,{error:'Please enter your name.'});const d=load();d.rsvps.push({id:Date.now(),name,guests:Math.min(Math.max(+b.guests||1,1),10),attending:b.attending!=='no',at:new Date().toISOString()});save(d);return send(r,200,{ok:true});}
 if(u.pathname==='/api/wishes'){const d=load();if(q.method==='POST'){const b=await body(q),name=clean(b.name,60),msg=clean(b.message);if(!name||!msg)return send(r,400,{error:'Add your name and a message.'});d.wishes.unshift({id:Date.now(),name,message:msg,at:new Date().toISOString()});save(d);return send(r,200,{ok:true});}return send(r,200,d.wishes.slice(0,50));}
 if(u.pathname==='/api/admin'&&q.method==='POST'){
  const b=await body(q); if(b.action==='login') return validKey(b.key)?send(r,200,{ok:true}):send(r,401,{ok:false,error:'Invalid admin key.'});
  if(!validKey(q.headers['x-admin-key']||b.key))return send(r,401,{ok:false,error:'Unauthorized.'});
  const d=load();
  if(b.action==='delete-rsvp'){d.rsvps=d.rsvps.filter(x=>x.id!==Number(b.id));save(d);return send(r,200,{ok:true});}
  if(b.action==='delete-wish'){d.wishes=d.wishes.filter(x=>x.id!==Number(b.id));save(d);return send(r,200,{ok:true});}
  const attending=d.rsvps.filter(x=>x.attending),declined=d.rsvps.filter(x=>!x.attending);return send(r,200,{ok:true,stats:{rsvps:d.rsvps.length,attending:attending.length,declined:declined.length,guests:attending.reduce((a,x)=>a+Number(x.guests||0),0),wishes:d.wishes.length,lastRsvpAt:d.rsvps[0]?.at||null},rsvps:[...d.rsvps].sort((a,b)=>new Date(b.at)-new Date(a.at)),wishes:d.wishes});
 }
 let pathname=u.pathname;
 let base=PUB;
 if(pathname==='/admin'||pathname==='/admin/'){pathname='/admin.html';base=__dirname;}
 let f=path.join(base,pathname==='/'?'index.html':path.normalize(pathname));
 if(!f.startsWith(base)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('Not found')}
 r.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);
}).listen(PORT,()=>console.log('Nikah invitation running at http://localhost:'+PORT+' (local backend)'));
