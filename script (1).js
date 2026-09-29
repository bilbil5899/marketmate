var SES=null;try{SES=JSON.parse(localStorage.getItem("marketmate.session")||"null")}catch(e){}
if(!SES)location.replace("login.html");
var KEY="marketmate.v1."+(SES?SES.email:"tamu"),TK="marketmate.theme",S,view="home",filter="aktif",campFilter="";
function today(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function plus(n){var d=new Date();d.setDate(d.getDate()+n);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function seed(){return{
 camps:[{id:1,name:"Promo Akhir Bulan",goal:"Naikkan penjualan 20%",end:plus(10)},{id:2,name:"Peluncuran Produk Baru",goal:"1.000 pendaftar waiting list",end:plus(24)}],
 tasks:[
  {id:1,title:"Desain feed Instagram promo",camp:1,due:plus(1),pri:"tinggi",done:false},
  {id:2,title:"Tulis caption dan hashtag",camp:1,due:plus(2),pri:"sedang",done:false},
  {id:3,title:"Balas komentar dan DM pelanggan",camp:0,due:today(),pri:"tinggi",done:false},
  {id:4,title:"Riset kompetitor",camp:2,due:plus(5),pri:"rendah",done:true},
  {id:5,title:"Susun laporan performa mingguan",camp:0,due:plus(-1),pri:"sedang",done:false}],
 ideas:[{id:1,title:"Video behind the scenes produksi",date:plus(2),plat:"TikTok",done:false},
  {id:2,title:"Carousel tips memilih produk",date:plus(4),plat:"Instagram",done:false},
  {id:3,title:"Testimoni pelanggan",date:plus(7),plat:"WhatsApp Status",done:false}],
 nid:10}}
try{S=JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){S=null}
if(!S)S={camps:[],tasks:[],ideas:[],nid:1};
try{var th=localStorage.getItem(TK);if(th)document.documentElement.setAttribute("data-theme",th)}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function esc(s){return String(s).replace(/[&<>"']/g,function(m){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]})}
function fd(s){if(!s)return"Tanpa tenggat";var p=s.split("-");var b=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];return+p[2]+" "+b[+p[1]-1]+" "+p[0]}
function cname(id){var c=S.camps.find(function(x){return x.id==id});return c?c.name:""}
function late(t){return!t.done&&t.due&&t.due<today()}
function opts(sel){return'<option value="0">Tanpa campaign</option>'+S.camps.map(function(c){return'<option value="'+c.id+'"'+(c.id==sel?" selected":"")+'>'+esc(c.name)+'</option>'}).join("")}
function taskHTML(t){
 var cn=cname(t.camp);
 return'<div class="task '+t.pri+(t.done?" done":"")+'"><input type="checkbox" aria-label="Selesai" data-a="tog" data-id="'+t.id+'"'+(t.done?" checked":"")+'><div class="t"><b>'+esc(t.title)+'</b><div class="meta"><span class="'+(late(t)?"late":"")+'">'+(late(t)?"Terlambat · ":"")+fd(t.due)+'</span><span>Prioritas '+t.pri+'</span>'+(cn?'<span>'+esc(cn)+'</span>':"")+'</div></div><button class="btn g" data-a="deltask" data-id="'+t.id+'" aria-label="Hapus tugas">Hapus</button></div>'}
function sortT(a){var o={tinggi:0,sedang:1,rendah:2};return a.slice().sort(function(x,y){return(x.due||"9")<(y.due||"9")?-1:(x.due||"9")>(y.due||"9")?1:o[x.pri]-o[y.pri]})}
function home(){
 var open=S.tasks.filter(function(t){return!t.done}),l=open.filter(late).length,td=open.filter(function(t){return t.due==today()}).length,dn=S.tasks.filter(function(t){return t.done}).length;
 var soon=sortT(open).slice(0,5);
 return'<h1>Ringkasan</h1><p class="sub">Semua pekerjaan marketing kamu di satu tempat.</p><div class="stats"><div class="stat"><b>'+open.length+'</b><span>Tugas aktif</span></div><div class="stat"><b>'+td+'</b><span>Tenggat hari ini</span></div><div class="stat warn"><b>'+l+'</b><span>Terlambat</span></div><div class="stat"><b>'+dn+'</b><span>Selesai</span></div></div><div class="box"><h2>Kerjakan berikutnya</h2>'+(soon.length?soon.map(taskHTML).join(""):'<div class="empty">Semua tugas selesai. Tambahkan tugas baru di menu Tugas.</div>')+'</div>'}
function tasks(){
 var list=S.tasks.filter(function(t){return(filter=="semua"||(filter=="aktif"?!t.done:t.done))&&(!campFilter||t.camp==campFilter)});
 return'<h1>Tugas</h1><p class="sub">Catat, urutkan, dan selesaikan tugas berdasarkan prioritas.</p><div class="box"><div class="row"><input type="text" id="nt" placeholder="Tugas baru, misalnya: Buat poster promo" aria-label="Judul tugas"><input type="date" id="nd" value="'+today()+'" aria-label="Tenggat"><select id="np" aria-label="Prioritas"><option value="tinggi">Prioritas tinggi</option><option value="sedang" selected>Prioritas sedang</option><option value="rendah">Prioritas rendah</option></select><select id="nc" aria-label="Campaign">'+opts(0)+'</select><button class="btn p" data-a="addtask">Tambah tugas</button></div></div><div class="tabs">'+["aktif","selesai","semua"].map(function(f){return'<button class="btn" data-a="filter" data-f="'+f+'" aria-pressed="'+(filter==f)+'">'+f[0].toUpperCase()+f.slice(1)+'</button>'}).join("")+'<select id="cf" aria-label="Filter campaign"><option value="">Semua campaign</option>'+S.camps.map(function(c){return'<option value="'+c.id+'"'+(campFilter==c.id?" selected":"")+'>'+esc(c.name)+'</option>'}).join("")+'</select></div>'+(list.length?sortT(list).map(taskHTML).join(""):'<div class="empty">Belum ada tugas di sini.</div>')}
function camp(){
 return'<h1>Campaign</h1><p class="sub">Pantau progres tiap campaign dari tugas yang selesai.</p><div class="box"><div class="row"><input type="text" id="cn" placeholder="Nama campaign" aria-label="Nama campaign"><input type="text" id="cg" placeholder="Target, misalnya: 500 pembeli baru" aria-label="Target"><input type="date" id="ce" value="'+plus(14)+'" aria-label="Berakhir"><button class="btn p" data-a="addcamp">Buat campaign</button></div></div>'+(S.camps.length?'<div class="cgrid">'+S.camps.map(function(c){
  var ts=S.tasks.filter(function(t){return t.camp==c.id}),d=ts.filter(function(t){return t.done}).length,p=ts.length?Math.round(d/ts.length*100):0;
  return'<div class="box" style="margin:0"><div class="row" style="justify-content:space-between"><b>'+esc(c.name)+'</b><button class="btn g" data-a="delcamp" data-id="'+c.id+'" aria-label="Hapus campaign">Hapus</button></div><div class="meta">'+esc(c.goal||"Belum ada target")+'</div><div class="bar" role="progressbar" aria-valuenow="'+p+'" aria-valuemin="0" aria-valuemax="100"><i style="width:'+p+'%"></i></div><div class="meta"><span>'+d+' dari '+ts.length+' tugas selesai ('+p+'%)</span><span>Berakhir '+fd(c.end)+'</span></div></div>'}).join("")+'</div>':'<div class="empty">Belum ada campaign. Buat yang pertama di atas.</div>')}
function cal(){
 var g={};S.ideas.slice().sort(function(a,b){return a.date<b.date?-1:1}).forEach(function(i){(g[i.date]=g[i.date]||[]).push(i)});
 var days=Object.keys(g);
 return'<h1>Jadwal konten</h1><p class="sub">Simpan ide konten dan tentukan kapan serta di mana tayangnya.</p><div class="box"><div class="row"><input type="text" id="it" placeholder="Ide konten, misalnya: Reels unboxing" aria-label="Ide konten"><input type="date" id="id" value="'+plus(3)+'" aria-label="Tanggal tayang"><select id="ip" aria-label="Platform"><option>Instagram</option><option>TikTok</option><option>Facebook</option><option>WhatsApp Status</option><option>YouTube</option></select><button class="btn p" data-a="addidea">Simpan ide</button></div></div>'+(days.length?days.map(function(d){return'<div class="day"><h3>'+fd(d)+'</h3>'+g[d].map(function(i){return'<div class="idea"><input type="checkbox" aria-label="Sudah tayang" data-a="togidea" data-id="'+i.id+'"'+(i.done?" checked":"")+'><div class="t"'+(i.done?' style="text-decoration:line-through;color:var(--muted)"':"")+'>'+esc(i.title)+'</div><span class="tag">'+esc(i.plat)+'</span><button class="btn g" data-a="delidea" data-id="'+i.id+'" aria-label="Hapus ide">Hapus</button></div>'}).join("")+'</div>'}).join(""):'<div class="empty">Belum ada ide konten. Tulis satu di atas.</div>')}
function render(){
 var lo=document.getElementById("logout");if(lo&&SES){lo.textContent="Keluar ("+SES.name.split(" ")[0]+")";lo.title=SES.email}
 var v={home:home,tasks:tasks,camp:camp,cal:cal}[view];
 document.getElementById("main").innerHTML=v();
 document.querySelectorAll(".nav[data-v]").forEach(function(n){if(n.dataset.v==view)n.setAttribute("aria-current","page");else n.removeAttribute("aria-current")});
 document.getElementById("cTasks").textContent=S.tasks.filter(function(t){return!t.done}).length;
 document.getElementById("cCamp").textContent=S.camps.length;
 document.getElementById("cCal").textContent=S.ideas.filter(function(i){return!i.done}).length;
}
function val(id){return document.getElementById(id).value.trim()}
document.addEventListener("click",function(e){
 var n=e.target.closest(".nav[data-v]");if(n){view=n.dataset.v;render();return}
 if(e.target.id=="logout"){try{localStorage.removeItem("marketmate.session")}catch(x){}location.replace("login.html");return}
 if(e.target.id=="theme"){var c=document.documentElement.getAttribute("data-theme")||(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light"),nx=c=="dark"?"light":"dark";document.documentElement.setAttribute("data-theme",nx);try{localStorage.setItem(TK,nx)}catch(x){}return}
 var b=e.target.closest("[data-a]");if(!b)return;var a=b.dataset.a,id=+b.dataset.id;
 if(a=="filter"){filter=b.dataset.f}
 else if(a=="addtask"){var t=val("nt");if(!t){document.getElementById("nt").focus();return}S.tasks.push({id:S.nid++,title:t,camp:+document.getElementById("nc").value,due:val("nd"),pri:val("np"),done:false})}
 else if(a=="deltask"){S.tasks=S.tasks.filter(function(x){return x.id!=id})}
 else if(a=="addcamp"){var m=val("cn");if(!m){document.getElementById("cn").focus();return}S.camps.push({id:S.nid++,name:m,goal:val("cg"),end:val("ce")})}
 else if(a=="delcamp"){S.camps=S.camps.filter(function(x){return x.id!=id});S.tasks.forEach(function(t){if(t.camp==id)t.camp=0});if(campFilter==id)campFilter=""}
 else if(a=="addidea"){var i=val("it");if(!i){document.getElementById("it").focus();return}S.ideas.push({id:S.nid++,title:i,date:val("id"),plat:val("ip"),done:false})}
 else if(a=="delidea"){S.ideas=S.ideas.filter(function(x){return x.id!=id})}
 else return;
 save();render()});
document.addEventListener("change",function(e){
 var el=e.target;
 if(el.id=="cf"){campFilter=el.value;render();return}
 if(el.dataset.a=="tog"){var t=S.tasks.find(function(x){return x.id==el.dataset.id});if(t)t.done=el.checked}
 else if(el.dataset.a=="togidea"){var i=S.ideas.find(function(x){return x.id==el.dataset.id});if(i)i.done=el.checked}
 else return;
 save();render()});
document.addEventListener("keydown",function(e){if(e.key=="Enter"&&e.target.tagName=="INPUT"&&e.target.type=="text"){var b=e.target.closest(".box").querySelector(".btn.p");if(b)b.click()}});
render();
