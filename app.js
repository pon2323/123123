const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const STORE = 'arz_active_days_web_v1';
let state = {
  promotionDate: todayISO(),
  selected: null,
  days: [],
  history: [],
  settings: { theme:'blue', norm:'03:00:00', autosave:true, autoload:true, sounds:true }
};

window.addEventListener('load', () => {
  setTimeout(()=>$('#splash').classList.add('hide'), 3000);
  load();
  if (!state.days.length) demo();
  bind();
  renderAll();
});

function bind(){
  $$('.nav-btn').forEach(b=>b.onclick=()=>showPage(b.dataset.page));
  $('#promotionDate').onchange=e=>{state.promotionDate=e.target.value; changed();};
  $('#addDay').onclick=addDay;
  $('#deleteDay').onclick=deleteDay;
  $('#clearTable').onclick=clearTable;
  $('#calculate').onclick=calculateAndSaveHistory;
  $('#clearHistory').onclick=()=>{ if(confirm('Очистить историю расчётов?')){state.history=[]; changed(); renderHistory();}};
  $('#exportTxt').onclick=()=>download('ARZ_Report.txt', makeReport(), 'text/plain');
  $('#exportCsv').onclick=()=>download('ARZ_Report.csv', makeCsv(), 'text/csv');
  $('#exportHtml').onclick=()=>download('ARZ_Report.html', makeHtml(), 'text/html');
  $('#copyReport').onclick=async()=>{ await navigator.clipboard.writeText(makeReport()); toast('Отчёт скопирован'); sound(); };
  $('#theme').onchange=e=>{state.settings.theme=e.target.value; applyTheme(); changed();};
  $('#norm').onchange=e=>{state.settings.norm=e.target.value || '03:00:00'; changed(); renderAll();};
  $('#autosave').onchange=e=>{state.settings.autosave=e.target.checked; changed(true);};
  $('#autoload').onchange=e=>{state.settings.autoload=e.target.checked; changed();};
  $('#sounds').onchange=e=>{state.settings.sounds=e.target.checked; changed(); sound();};
  document.addEventListener('keydown', e=>{
    if(e.ctrlKey && e.key.toLowerCase()==='n'){e.preventDefault();addDay();}
    if(e.ctrlKey && e.key==='Delete'){e.preventDefault();deleteDay();}
    if(e.ctrlKey && e.key==='Enter'){e.preventDefault();calculateAndSaveHistory();}
  });
  document.body.addEventListener('click', e=>{ if(e.target.closest('button,.nav-btn,a')) sound(); }, true);
}

function showPage(page){
  $$('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.page===page));
  $$('.page').forEach(p=>p.classList.remove('active'));
  $('#page-'+page).classList.add('active');
  renderAll();
}

function demo(){
  const d = new Date(); d.setDate(d.getDate()-3);
  state.days = [0,1,2,3].map((n,i)=>{const x=new Date(d);x.setDate(d.getDate()+n);return {date:iso(x), time:['03:20:00','02:10:00','04:45:00','03:00:00'][i]};});
}
function todayISO(){return iso(new Date())}
function iso(d){return d.toISOString().slice(0,10)}
function sec(t){ if(!/^\d{2}:\d{2}:\d{2}$/.test(t||'')) return null; const [h,m,s]=t.split(':').map(Number); if(m>59||s>59)return null; return h*3600+m*60+s; }
function hms(total){ total=Math.max(0,Math.round(total||0)); const h=String(Math.floor(total/3600)).padStart(2,'0'); const m=String(Math.floor(total%3600/60)).padStart(2,'0'); const s=String(total%60).padStart(2,'0'); return `${h}:${m}:${s}`; }
function isActive(day){ const v=sec(day.time); return v!==null && v>=sec(state.settings.norm); }
function valid(day){return !!day.date && sec(day.time)!==null}

function renderAll(){
  $('#promotionDate').value=state.promotionDate || todayISO();
  $('#theme').value=state.settings.theme;
  $('#norm').value=state.settings.norm;
  $('#autosave').checked=state.settings.autosave;
  $('#autoload').checked=state.settings.autoload;
  $('#sounds').checked=state.settings.sounds;
  applyTheme(); renderTable(); renderCounts(); renderStats(); renderHistory(); $('#reportPreview').textContent=makeReport();
}
function renderTable(){
  const body=$('#daysBody'); body.innerHTML='';
  state.days.forEach((day,i)=>{
    const tr=document.createElement('tr'); tr.className=state.selected===i?'selected':''; tr.onclick=()=>{state.selected=i;renderTable();};
    const bad=!valid(day);
    tr.innerHTML=`<td><input class="date-input ${!day.date?'invalid':''}" type="date" value="${day.date||''}"></td><td><input class="time-input ${bad?'invalid':''}" inputmode="numeric" placeholder="00:00:00" value="${day.time||''}"></td><td class="${isActive(day)?'status-ok':'status-bad'}">${isActive(day)?'✓ Активен':'✗ Неактивен'}</td>`;
    tr.querySelector('.date-input').onchange=e=>{day.date=e.target.value; changed();renderAll();};
    tr.querySelector('.time-input').oninput=e=>{day.time=e.target.value; changed();renderAll();};
    body.appendChild(tr);
  });
}
function getCounts(){
  const validDays=state.days.filter(valid); const active=validDays.filter(isActive).length; const total=validDays.length; return {active,inactive:total-active,total,percent:total?Math.round(active/total*100):0};
}
function renderCounts(){
  const c=getCounts(); $('#activeCount').textContent=c.active; $('#inactiveCount').textContent=c.inactive; $('#totalCount').textContent=c.total; $('#percentCount').textContent=c.percent+'%';
}
function renderStats(){
  const c=getCounts(); $('#sActive').textContent=c.active; $('#sInactive').textContent=c.inactive; $('#sTotal').textContent=c.total; $('#sPercent').textContent=c.percent+'%'; $('#donutText').textContent=c.percent+'%'; $('#donut').style.background=`conic-gradient(var(--green) 0 ${c.percent}%, var(--red) ${c.percent}% 100%)`;
  const valids=state.days.filter(valid).sort((a,b)=>a.date.localeCompare(b.date)); let la=0,li=0,ca=0,ci=0, times=[];
  valids.forEach(d=>{times.push(sec(d.time)); if(isActive(d)){ca++;ci=0;la=Math.max(la,ca)}else{ci++;ca=0;li=Math.max(li,ci)}});
  $('#longActive').textContent=la+' дней'; $('#longInactive').textContent=li+' дней'; $('#avgTime').textContent=times.length?hms(times.reduce((a,b)=>a+b,0)/times.length):'00:00:00'; $('#maxTime').textContent=times.length?hms(Math.max(...times)):'00:00:00'; $('#minTime').textContent=times.length?hms(Math.min(...times)):'00:00:00';
  $('#calendarHeat').innerHTML=valids.map(d=>`<span title="${d.date} — ${d.time}" class="${isActive(d)?'on':'off'}"></span>`).join('');
}
function renderHistory(){
  const box=$('#historyList'); if(!state.history.length){box.innerHTML='<p>История пока пустая. Нажми «Посчитать активность» на главной.</p>'; return;}
  box.innerHTML=state.history.map((h,i)=>`<div class="history-item"><div><b>${h.created}</b><br><span>Активных: ${h.active} · Неактивных: ${h.inactive} · Процент: ${h.percent}%</span></div><button data-i="${i}">Удалить</button></div>`).join('');
  box.querySelectorAll('button').forEach(b=>b.onclick=()=>{state.history.splice(+b.dataset.i,1); changed(); renderHistory();});
}
function addDay(){
  let date=todayISO(); if(state.days.length){const last=new Date(state.days[state.days.length-1].date||todayISO()); last.setDate(last.getDate()+1); date=iso(last)}
  state.days.push({date,time:'00:00:00'}); state.selected=state.days.length-1; changed(); renderAll(); toast('День добавлен');
}
function deleteDay(){ if(state.selected===null||!state.days[state.selected]){toast('Выбери строку');return;} state.days.splice(state.selected,1); state.selected=null; changed(); renderAll(); }
function clearTable(){ if(confirm('Очистить таблицу?')){state.days=[]; state.selected=null; changed(); renderAll();}}
function calculateAndSaveHistory(){
  if(!state.days.length){alert('Таблица пустая');return;} if(state.days.some(d=>!valid(d))){alert('Есть ошибки в датах или времени. Формат времени строго 00:00:00');return;}
  const c=getCounts(); state.history.unshift({created:new Date().toLocaleString('ru-RU'),...c,report:makeReport()}); state.history=state.history.slice(0,50); changed(); renderAll(); toast('Активность посчитана');
}
function makeReport(){
  const c=getCounts(); const dates=state.days.filter(valid).map(d=>d.date).sort(); const period=dates.length?`${dates[0]} — ${dates[dates.length-1]}`:'нет данных';
  return `ARZ ACTIVE DAYS\n\nСоздатель: Slava_Snake\nДата создания программы: 2026\nДата повышения: ${state.promotionDate||'не указана'}\nПериод: ${period}\nНорматив: ${state.settings.norm}\n\nАктивных дней: ${c.active}\nНеактивных дней: ${c.inactive}\nВсего дней: ${c.total}\nПроцент активности: ${c.percent}%\n\nДетализация:\n${state.days.map(d=>`${d.date||'—'} | ${d.time||'—'} | ${isActive(d)?'Активен':'Неактивен'}`).join('\n')}`;
}
function makeCsv(){return 'Дата;Отыгранное время;Статус\n'+state.days.map(d=>`${d.date};${d.time};${isActive(d)?'Активен':'Неактивен'}`).join('\n')}
function makeHtml(){return `<!doctype html><meta charset="utf-8"><title>ARZ Report</title><pre>${makeReport().replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]))}</pre>`}
function download(name, content, type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();URL.revokeObjectURL(a.href);sound();}
function save(){localStorage.setItem(STORE,JSON.stringify(state));}
function load(){try{const raw=localStorage.getItem(STORE); if(raw){const old=JSON.parse(raw); if(old.settings?.autoload!==false) state={...state,...old,settings:{...state.settings,...old.settings}}}}catch{}}
function changed(force=false){ if(state.settings.autosave||force) save(); }
function applyTheme(){ document.body.classList.toggle('theme-purple',state.settings.theme==='purple'); document.body.classList.toggle('theme-matrix',state.settings.theme==='matrix'); }
function toast(text){const t=document.createElement('div');t.className='toast';t.textContent=text;document.body.appendChild(t);setTimeout(()=>t.remove(),2200)}
function sound(){ if(!state.settings.sounds) return; try{const ctx=new (window.AudioContext||window.webkitAudioContext)(); const o=ctx.createOscillator(); const g=ctx.createGain(); o.type='sine'; o.frequency.value=620; g.gain.value=.035; o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+.045);}catch{} }
