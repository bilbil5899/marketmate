const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const td=()=>{const d=new Date();return new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
const diff=d=>Math.round((new Date(d)-new Date(td()))/864e5);
const uid=()=>Math.random().toString(36).slice(2,9);
const ls={get(k,f){try{return JSON.parse(localStorage.getItem(k))??f}catch(e){return f}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let mode='login',user=null,D=null,tab='dash',flt='all',err='';

async function hash(e,p){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(e+'|'+p));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function submitAuth(){
  const e=$('#em').value.trim().toLowerCase(),p=$('#pw').value;
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)){err='Format email tidak valid.';return authView()}
  if(p.length<6){err='Password minimal 6 karakter.';return authView()}
  const users=ls.get('mk_users',{}),h=await hash(e,p);
  if(mode==='register'){
    if(users[e]){err='Email sudah terdaftar. Silakan masuk.';return authView()}
    users[e]=h;ls.set('mk_users',users);
  }else if(users[e]!==h){err='Email atau password salah.';return authView()}
  user=e;ls.set('mk_session',e);loadData();err='';appView();
}
function loadData(){D=ls.get('mk_data:'+user,{tasks:[],camps:[],content:[]})}
function save(){ls.set('mk_data:'+user,D)}
function logout(){user=null;ls.set('mk_session',null);authView()}

function authView(){
  $('#root').innerHTML=`<div class="auth"><div class="logo">Market<span>Mate</span></div>
  <p class="muted">Kelola tugas, campaign, dan jadwal konten marketing dalam satu tempat.</p>
  <div class="tabs"><button class="btn ${mode=='login'?'on':''}" onclick="mode='login';err='';authView()">Masuk</button><button class="btn ${mode=='register'?'on':''}" onclick="mode='register';err='';authView()">Daftar</button></div>
  <input id="em" type="email" placeholder="Email" autocomplete="email"><input id="pw" type="password" placeholder="Password (min. 6 karakter)" autocomplete="current-password" onkeydown="if(event.key==='Enter')submitAuth()">
  <div class="err">${esc(err)}</div><button class="btn p" onclick="submitAuth()">${mode=='login'?'Masuk':'Buat Akun'}</button>
  <p class="muted" style="margin-top:14px">Data tersimpan terpisah untuk setiap email di browser ini.</p></div>`;
}

function appView(){
  const T=[['dash','Dashboard'],['tasks','Tugas'],['camps','Campaign'],['content','Jadwal Konten']];
  $('#root').innerHTML=`<header><div class="logo">Market<span>Mate</span></div><div class="sp"></div><span class="muted">${esc(user)}</span><button class="btn" onclick="notif()">🔔 Aktifkan Pengingat</button><button class="btn" onclick="logout()">Keluar</button></header>
  <nav>${T.map(t=>`<button class="btn ${tab==t[0]?'on':''}" onclick="tab='${t[0]}';appView()">${t[1]}</button>`).join('')}</nav><main>${views[tab]()}</main>`;
}
const pr={Tinggi:0,Sedang:1,Rendah:2};
const dl=t=>{if(!t.due)return'';const n=diff(t.due);return n<0?`Terlambat ${-n} hari`:n==0?'Hari ini':n+' hari lagi'};
function taskItem(t){
  const c=D.camps.find(c=>c.id==t.camp);
  return `<div class="item ${t.done?'done':''}"><input type="checkbox" ${t.done?'checked':''} onchange="tog('${t.id}')"><div class="t"><b>${esc(t.title)}</b><br><span class="tag ${t.pri}">${t.pri}</span>${t.due?`<span class="tag" style="${!t.done&&diff(t.due)<0?'color:var(--danger)':''}">${t.due} • ${dl(t)}</span>`:''}${c?`<span class="tag">📣 ${esc(c.name)}</span>`:''}</div><button class="x" onclick="del('tasks','${t.id}')">✕</button></div>`;
}
const views={
dash(){
  const a=D.tasks,d=a.filter(t=>t.done).length,act=a.filter(t=>!t.done),late=act.filter(t=>t.due&&diff(t.due)<0),tdy=act.filter(t=>t.due&&diff(t.due)==0);
  const soon=act.filter(t=>t.due&&diff(t.due)<=3).sort((x,y)=>x.due.localeCompare(y.due));
  return `<div class="stats"><div class="stat"><b>${a.length}</b>Total tugas</div><div class="stat"><b>${d}</b>Selesai</div><div class="stat"><b style="color:var(--warn)">${tdy.length}</b>Deadline hari ini</div><div class="stat"><b style="color:var(--danger)">${late.length}</b>Terlambat</div></div>
  <div class="bar"><i style="width:${a.length?d/a.length*100:0}%"></i></div><p class="muted">Progres keseluruhan: ${a.length?Math.round(d/a.length*100):0}%</p>
  <h2>⏰ Pengingat Deadline (≤ 3 hari)</h2>${soon.map(taskItem).join('')||'<p class="muted">Tidak ada deadline mendesak. 🎉</p>'}
  <h2>📅 Konten Mendatang</h2>${D.content.filter(c=>c.date>=td()).sort((x,y)=>x.date.localeCompare(y.date)).slice(0,3).map(contentItem).join('')||'<p class="muted">Belum ada jadwal konten.</p>'}`;
},
tasks(){
  let l=[...D.tasks].filter(t=>flt=='all'||(flt=='done')==t.done).sort((a,b)=>a.done-b.done||pr[a.pri]-pr[b.pri]||(a.due||'9').localeCompare(b.due||'9'));
  return `<div class="form"><input type="text" id="tt" placeholder="Tugas baru, mis. Desain feed Instagram"><select id="tp"><option>Tinggi</option><option selected>Sedang</option><option>Rendah</option></select><input type="date" id="td"><select id="tc"><option value="">Tanpa campaign</option>${D.camps.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select><button class="btn p" onclick="addTask()">＋ Tambah</button></div>
  <div class="form"><select onchange="flt=this.value;appView()"><option value="all" ${flt=='all'?'selected':''}>Semua</option><option value="act" ${flt=='act'?'selected':''}>Aktif</option><option value="done" ${flt=='done'?'selected':''}>Selesai</option></select><span class="muted" style="align-self:center">Urut: prioritas → deadline</span></div>
  ${l.map(taskItem).join('')||'<p class="muted">Belum ada tugas.</p>'}`;
},
camps(){
  return `<div class="form"><input type="text" id="cn" placeholder="Nama campaign, mis. Promo Ramadan"><input type="text" id="cg" placeholder="Target / platform"><button class="btn p" onclick="addCamp()">＋ Campaign</button></div>
  ${D.camps.map(c=>{const ts=D.tasks.filter(t=>t.camp==c.id),d=ts.filter(t=>t.done).length;return `<div class="item"><div class="t"><b>📣 ${esc(c.name)}</b><br><span class="muted">${esc(c.goal||'')}</span><div class="bar"><i style="width:${ts.length?d/ts.length*100:0}%"></i></div><span class="muted">${d}/${ts.length} tugas selesai</span></div><button class="x" onclick="delCamp('${c.id}')">✕</button></div>`}).join('')||'<p class="muted">Belum ada campaign.</p>'}`;
},
content(){
  return `<div class="form"><input type="date" id="cd" value="${td()}"><select id="cp"><option>Instagram</option><option>TikTok</option><option>WhatsApp</option><option>Facebook</option><option>YouTube</option><option>Blog</option></select><input type="text" id="ci" placeholder="Ide konten, mis. Reels behind the scene"><button class="btn p" onclick="addContent()">＋ Ide</button></div>
  ${[...D.content].sort((a,b)=>a.date.localeCompare(b.date)).map(contentItem).join('')||'<p class="muted">Belum ada ide konten.</p>'}`;
}};
const st=['Ide','Dijadwalkan','Terbit'];
function contentItem(c){return `<div class="item"><div class="t"><b>${esc(c.idea)}</b><br><span class="tag">${c.date}</span><span class="tag">${esc(c.plat)}</span><span class="tag" style="cursor:pointer" onclick="cyc('${c.id}')">${st[c.st]} ↻</span></div><button class="x" onclick="del('content','${c.id}')">✕</button></div>`}

function addTask(){const t=$('#tt').value.trim();if(!t)return;D.tasks.push({id:uid(),title:t,pri:$('#tp').value,due:$('#td').value,camp:$('#tc').value,done:false});save();appView()}
function addCamp(){const n=$('#cn').value.trim();if(!n)return;D.camps.push({id:uid(),name:n,goal:$('#cg').value.trim()});save();appView()}
function addContent(){const i=$('#ci').value.trim();if(!i||!$('#cd').value)return;D.content.push({id:uid(),date:$('#cd').value,plat:$('#cp').value,idea:i,st:0});save();appView()}
function tog(id){const t=D.tasks.find(t=>t.id==id);t.done=!t.done;save();appView()}
function cyc(id){const c=D.content.find(c=>c.id==id);c.st=(c.st+1)%3;save();appView()}
function del(k,id){D[k]=D[k].filter(x=>x.id!=id);save();appView()}
function delCamp(id){if(!confirm('Hapus campaign ini? Tugas terkait tetap ada.'))return;D.tasks.forEach(t=>{if(t.camp==id)t.camp=''});del('camps',id)}
async function notif(){
  if(!('Notification' in window))return alert('Browser tidak mendukung notifikasi.');
  if(await Notification.requestPermission()!=='granted')return alert('Izin notifikasi ditolak.');
  checkNotif(true);
}
function checkNotif(force){
  if(!user||!('Notification' in window)||Notification.permission!=='granted')return;
  const u=D.tasks.filter(t=>!t.done&&t.due&&diff(t.due)<=1);
  if(u.length)new Notification('MarketMate: '+u.length+' deadline mendesak',{body:u.slice(0,3).map(t=>t.title).join(', ')});
  else if(force)new Notification('MarketMate',{body:'Pengingat aktif. Tidak ada deadline mendesak.'});
}
(function init(){
  const s=ls.get('mk_session',null);
  if(s&&ls.get('mk_users',{})[s]){user=s;loadData();appView();checkNotif()}else authView();
  setInterval(()=>{if(user)checkNotif()},36e5);
})();
