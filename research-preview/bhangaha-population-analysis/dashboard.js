
/* Interactive research article. All numerical values originate in dashboard-data.js. */
(function(){
  'use strict';
  const d=window.BHANGAHA_DATA;
  if(!d){return;}
  const root=document.querySelector('.bd-page');
  if(!root){return;}
  const byId=id=>document.getElementById(id);
  const langStore='dk-language';
  let lang='en';
  try{if(localStorage.getItem(langStore)==='ne')lang='ne';}catch(e){}
  const state={
    gender:{age:'total',literacy:'total',employment:'total',marital:'total'},
    mode:{age:'count',wards:'count',literacy:'count',employment:'count',marital:'count',migrationReasons:'count',lowActivity:'count'},
    search:{},sort:{},selectedWards:new Set(d.wards.map(w=>w.ward)),kpiExpanded:false,active:'overview'
  };
  const allTabs=Array.from(document.querySelectorAll('.bd-tab[role="tab"]'));
  const allPanels=Array.from(document.querySelectorAll('.bd-panel[role="tabpanel"]'));
  const useLang=(ne,en)=>lang==='ne'?ne:en;
  const TX={
    ne:{explore:'तथ्याङ्क हेर्नुहोस्',report:'पूरा प्रतिवेदन',draft:'अप्रकाशित अनुसन्धान मस्यौदा',published:'प्रकाशन: समीक्षापछि',updated:'अद्यावधिक',author:'लेखक',read:'पढ्ने समय',dataYears:'तथ्याङ्क वर्ष',kpi:'प्रमुख तथ्याङ्क',more:'थप सूचकहरू',less:'कम सूचकहरू',source:'स्रोत',denom:'आधार',value:'संख्या',share:'प्रतिशत',sex:'लैङ्गिक समूह',all:'जम्मा',male:'पुरुष',female:'महिला',count:'संख्या',percent:'प्रतिशत',download:'CSV डाउनलोड',sort:'क्रमबद्ध',search:'खोज्नुहोस्',ward:'वडा',population:'जनसंख्या',noData:'उपलब्ध प्रमाणित तथ्याङ्क छैन',selectWards:'तुलना गर्न वडा छान्नुहोस्',reset:'सबै वडा',empty:'कुनै नतिजा भेटिएन',copy:'खण्डको लिंक कपी',copied:'लिंक कपी भयो',print:'प्रिन्ट',back:'माथि फर्कनुहोस्',noZero:'‘उपलब्ध छैन’ लाई शून्य मानिएको छैन।',chart:'बार चार्ट',status:'तथ्याङ्कको स्थिति',absent:'विदेशमा अनुपस्थित',historical:'ऐतिहासिक तुलना',snapshot:'एक नजर',readMore:'पूरा पाठ र मूल तालिकाहरू तल छ।'},
    en:{explore:'Explore data',report:'Full research report',draft:'Unpublished research draft',published:'Publication: pending review',updated:'Updated',author:'Author',read:'Reading time',dataYears:'Reference years',kpi:'Key indicators',more:'More indicators',less:'Fewer indicators',source:'Source',denom:'Denominator',value:'Count',share:'Share',sex:'Gender',all:'Total',male:'Male',female:'Female',count:'Count',percent:'Percent',download:'Download CSV',sort:'Sort',search:'Search',ward:'Ward',population:'Population',noData:'No verified local figure in the reviewed research',selectWards:'Select wards to compare',reset:'All wards',empty:'No matching records',copy:'Copy section link',copied:'Section link copied',print:'Print',back:'Back to top',noZero:'Missing does not mean zero.',chart:'Bar chart',status:'Data status',absent:'Absent abroad',historical:'Historical comparison',snapshot:'At a glance',readMore:'The full source report and original tables follow.'}
  };
  const t=key=>TX[lang][key]||key;
  const nf=n=>Number(n).toLocaleString(lang==='ne'?'ne-NP':'en-US',{maximumFractionDigits:2});
  const pcf=n=>Number(n).toLocaleString(lang==='ne'?'ne-NP':'en-US',{minimumFractionDigits:1,maximumFractionDigits:2})+'%';
  const esc=v=>String(v===null||v===undefined?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const source=id=>d.sources.find(x=>x.id===id);
  const src=id=>'<a class="bd-source-link" href="#src-'+esc(id)+'" data-source-ref="'+esc(id)+'">'+esc(id)+'</a>';
  const output=(id,html)=>{const e=byId(id);if(e)e.innerHTML=html;};
  function announce(message){
    const node=byId('bd-toast');
    if(!node)return;
    node.textContent=message;node.hidden=false;
    window.clearTimeout(announce.timer);
    announce.timer=window.setTimeout(()=>{node.hidden=true;},2800);
  }
  function sourceFoot(id,year,denominator){
    return '<p class="bd-sourcefoot">'+t('source')+': '+src(id)+' · '+nf(year)+' · '+esc(denominator||'Bhangaha Municipality')+'</p>';
  }
  function numberValue(value,mode,denom){
    return mode==='percent'?pcf(denom?value/denom*100:0):nf(value);
  }
  const colors=['#187f7b','#5d8fba','#b17e5a','#7469a4','#a8aaa4'];
  const schemes={total:'#187f7b',male:'#4e82a5',female:'#b17e6d'};
  function drawBars(entries,opts){
    const max=Math.max(1,...entries.map(x=>Number(x.value)||0));
    return '<div class="bd-bar-list" role="list" aria-label="'+esc(t('chart'))+'">'+entries.map((v,i)=>{
      const pct=Math.max(0,Math.min(100,(Number(v.value)||0)/max*100));
      const col=opts&&opts.palette?colors[i%colors.length]:((opts&&opts.color)||'#187f7b');
      const lab=esc(v.label);
      const shown=esc(v.shown===undefined?nf(v.value):v.shown);
      return '<div class="bd-bar-row" role="listitem" title="'+lab+': '+shown+'"><span class="bd-bar-label">'+lab+'</span><div class="bd-bar-track"><div class="bd-bar-fill" style="width:'+pct.toFixed(3)+'%;background:'+col+'"></div></div><strong class="bd-bar-value">'+shown+'</strong></div>';
    }).join('')+'</div>';
  }
  function setTabs(selected,opts){
    if(!allPanels.some(p=>p.id===selected))selected='overview';
    state.active=selected;
    root.classList.add('bd-ready');
    allTabs.forEach(tab=>{
      const active=tab.dataset.tab===selected;
      tab.setAttribute('aria-selected',String(active));
      tab.tabIndex=active?0:-1;
    });
    allPanels.forEach(panel=>{
      const active=panel.id===selected;
      panel.classList.toggle('bd-active',active);
      panel.setAttribute('aria-hidden',String(!active));
    });
    if(opts&&opts.push){history.pushState(null,'','#'+encodeURIComponent(selected));}
    const activeTab=allTabs.find(tab=>tab.dataset.tab===selected);
    activeTab?.scrollIntoView({inline:'nearest',block:'nearest'});
    if(opts&&opts.scroll){
      const panel=byId(selected);
      panel?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    }
  }
  allTabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>setTabs(tab.dataset.tab,{push:true,scroll:true}));
    tab.addEventListener('keydown',e=>{
      let next;
      if(e.key==='ArrowRight')next=(i+1)%allTabs.length;
      else if(e.key==='ArrowLeft')next=(i-1+allTabs.length)%allTabs.length;
      else if(e.key==='Home')next=0;
      else if(e.key==='End')next=allTabs.length-1;
      else return;
      e.preventDefault();allTabs[next].focus();setTabs(allTabs[next].dataset.tab,{push:true,scroll:false});
    });
  });
  window.addEventListener('hashchange',()=>{
    const name=decodeURIComponent(location.hash.slice(1));
    if(allPanels.some(p=>p.id===name))setTabs(name,{scroll:false});
  });
  document.addEventListener('click',e=>{
    const a=e.target.closest('[data-go-tab]');
    if(a){e.preventDefault();setTabs(a.getAttribute('data-go-tab'),{push:true,scroll:true});return;}
    const cite=e.target.closest('a[data-source-ref]');
    if(cite){
      e.preventDefault();
      const id=cite.dataset.sourceRef;
      setTabs('sources',{push:true,scroll:false});
      const item=byId('src-'+id);
      item?.scrollIntoView({behavior:'smooth',block:'center'});
      item?.focus({preventScroll:true});
    }
    const copier=e.target.closest('[data-copy-panel]');
    if(copier){
      const id=copier.dataset.copyPanel;
      const link=location.origin+location.pathname+'#'+encodeURIComponent(id);
      const done=()=>announce(t('copied'));
      if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(link).then(done,()=>fallbackCopy(link,done));
      else fallbackCopy(link,done);
    }
  });
  function fallbackCopy(value,cb){
    const tArea=document.createElement('textarea');
    tArea.value=value;tArea.style.position='fixed';tArea.style.left='-9999px';document.body.append(tArea);
    tArea.select();try{document.execCommand('copy');cb();}catch(e){}tArea.remove();
  }
  function updateText(){
    document.documentElement.lang=lang;
    document.title=useLang('तथ्याङ्कमा भंगाहा: जनसंख्या, समाज र आर्थिक अवस्था | Deepak Karn','Bhangaha in Numbers: Population, Society & Socioeconomic Insights | Deepak Karn');
    document.querySelectorAll('[data-ne][data-en]').forEach(node=>{
      node.textContent=node.getAttribute('data-'+lang);
    });
    document.querySelectorAll('[data-ne-label][data-en-label]').forEach(node=>{
      node.setAttribute('aria-label',node.getAttribute('data-'+lang+'-label'));
    });
    const toggle=byId('bd-lang');
    if(toggle){toggle.textContent=lang==='ne'?'English':'नेपाली';toggle.setAttribute('aria-label',lang==='ne'?'Switch to English':'नेपालीमा परिवर्तन गर्नुहोस्');}
    const back=byId('bd-backtop');if(back)back.setAttribute('aria-label',t('back'));
    renderAll();
  }
  byId('bd-lang')?.addEventListener('click',()=>{
    lang=lang==='ne'?'en':'ne';
    try{localStorage.setItem(langStore,lang);}catch(e){}
    updateText();
  });
  const menu=byId('bd-menu'),mobile=byId('bd-mobile-menu');
  menu?.addEventListener('click',()=>{
    const opened=menu.getAttribute('aria-expanded')==='true';
    menu.setAttribute('aria-expanded',String(!opened));
    mobile.hidden=opened;
  });
  mobile?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobile.hidden=true;menu.setAttribute('aria-expanded','false');}));
  function renderKPIs(){
    const list=state.kpiExpanded?d.kpis:d.kpis.slice(0,12);
    const tones=['','', '', '', '','', '', '', 'tone-amber','','tone-red','', 'tone-red'];
    output('bd-kpi-grid',list.map((m,i)=>{
      const label=m.label[lang];
      const displayed=m.unit==='percent'?pcf(m.value):nf(m.value);
      const geography=m.geography;
      const warning=m.status==='official_estimate'?(lang==='ne'?' · अनुमान':' · estimate'):'';
      return '<article class="bd-kpi '+(tones[i]||'')+'" title="'+esc(m.note||m.denominator)+'">'+
        '<span class="bd-kpi-label">'+esc(label)+'</span><strong class="bd-kpi-value">'+displayed+'</strong>'+
        '<span class="bd-kpi-source">'+nf(m.year)+warning+' · '+src(m.sourceId)+'</span>'+
        '<details><summary style="font-size:10px;margin-top:8px;color:#5a6b63;cursor:pointer">'+esc(t('denom'))+'</summary><p style="font-size:11px;line-height:1.55;margin:6px 0 0">'+esc(m.denominator)+' · '+esc(geography)+'</p></details></article>';
    }).join(''));
    const btn=byId('bd-kpi-more');
    if(btn){btn.textContent=state.kpiExpanded?t('less'):t('more');btn.setAttribute('aria-expanded',String(state.kpiExpanded));}
  }
  byId('bd-kpi-more')?.addEventListener('click',()=>{state.kpiExpanded=!state.kpiExpanded;renderKPIs();});
  function renderOverview(){
    const pop=d.population;
    const bars=[
      {label:useLang('०–१४ वर्ष','Age 0–14'),value:pop.age0to14,shown:pcf(pop.age0to14/pop.year2021*100)},
      {label:useLang('१५–५९ वर्ष','Age 15–59'),value:pop.age15to59,shown:pcf(pop.age15to59/pop.year2021*100)},
      {label:useLang('६०+ वर्ष','Age 60+'),value:pop.age60plus,shown:pcf(pop.age60plus/pop.year2021*100)}
    ];
    output('bd-overview-ages',drawBars(bars,{palette:true})+sourceFoot('S02',2021,'55,354 '+t('population')));
    output('bd-overview-sex','<div class="bd-segmented" aria-label="'+esc(useLang('महिला र पुरुषको वितरण','Sex distribution'))+'"><span style="width:'+(pop.male2021/pop.year2021*100).toFixed(3)+'%;background:#4e82a5"></span><span style="width:'+(pop.female2021/pop.year2021*100).toFixed(3)+'%;background:#b17e6d"></span></div>'+
      '<div class="bd-legend"><span><b style="background:#4e82a5"></b>'+t('male')+': '+nf(pop.male2021)+' ('+pcf(pop.male2021/pop.year2021*100)+')</span><span><b style="background:#b17e6d"></b>'+t('female')+': '+nf(pop.female2021)+' ('+pcf(pop.female2021/pop.year2021*100)+')</span></div>'+sourceFoot('S01',2021,'55,354 '+t('population')));
  }
  function renderPopulation(){
    const dmax=Math.max(...d.ageGroups.map(x=>Math.max(x.male,x.female)));
    const pyr=d.ageGroups.map(a=>'<div class="bd-pyramid-row" title="'+esc(a.age)+': '+nf(a.male)+' '+t('male')+', '+nf(a.female)+' '+t('female')+'">'+
      '<div class="bd-pyramid-side left"><span style="width:'+(a.male/dmax*100).toFixed(3)+'%"></span></div><div class="bd-pyramid-label">'+esc(a.age)+'</div><div class="bd-pyramid-side right"><span style="width:'+(a.female/dmax*100).toFixed(3)+'%"></span></div></div>').join('');
    output('bd-age-pyramid','<div class="bd-legend"><span><b style="background:#4e82a5"></b>'+t('male')+'</span><span><b style="background:#b17e6d"></b>'+t('female')+'</span></div><div class="bd-pyramid" role="img" aria-label="'+esc(useLang('२०२१ मा पाँचवर्षे उमेर समूहअनुसार महिला र पुरुषको जनसंख्या','Male and female populations by five-year age groups, 2021'))+'">'+pyr+'</div>'+sourceFoot('S02',2021,'all residents, 55,354'));
    const hist=d.population;
    output('bd-pop-history','<div class="bd-history">'+[
      [2011,hist.year2011],[2021,hist.year2021]
    ].map(([year,value])=>'<div><b>'+nf(value)+'</b><div class="column" style="height:'+(value/hist.year2021*102).toFixed(1)+'px"></div><span>'+nf(year)+'</span></div>').join('')+'</div><p class="bd-sourcefoot">'+useLang('हालको स्थानीय सीमा अनुसार पुनःतालिकीकरण भएको २०११ को जनसंख्या प्रयोग गरिएको छ।','2011 values are re-tabulated to the present local boundary.')+' '+src('S01')+'</p>');
  }
  function selectFor(kind){
    if(kind==='wards')return d.wards.filter(x=>state.selectedWards.has(x.ward)).map(x=>Object.assign({label:{ne:'वडा '+x.ward,en:'Ward '+x.ward},total:x.population},x));
    return ({age:d.ageGroups,literacy:d.literacy,marital:d.marital,employment:d.employment,migrationReasons:d.migrationReasons,lowActivity:d.lowActivity})[kind]||[];
  }
  function denominator(kind,gender){
    if(kind==='wards')return d.population.year2021;
    if(kind==='age')return gender==='male'?26734:gender==='female'?28620:55354;
    if(kind==='literacy')return gender==='male'?23414:gender==='female'?25692:49106;
    if(kind==='employment')return gender==='male'?12721:gender==='female'?9774:22495;
    if(kind==='marital')return gender==='male'?20017:gender==='female'?22464:42481;
    if(kind==='migrationReasons')return 4397;
    if(kind==='lowActivity')return 30066;
    return 1;
  }
  function labelFor(kind,row){
    if(kind==='wards')return t('ward')+' '+nf(row.ward);
    if(kind==='age')return row.age;
    return row.label?.[lang]||'';
  }
  function parseRows(kind){
    const gender=state.gender[kind]||'total';
    const denom=denominator(kind,gender);
    const search=(state.search[kind]||'').trim().toLocaleLowerCase();
    let items=selectFor(kind).map(row=>{
      const value=row[gender]===undefined||row[gender]===null?row.total:row[gender];
      const title=labelFor(kind,row);
      return {name:title,value,share:value/denom*100,key:row.ward||row.age||row.id||'',sourceId:row.sourceId,raw:row};
    });
    if(search)items=items.filter(x=>x.name.toLocaleLowerCase().includes(search)||String(x.key).includes(search));
    const opt=state.sort[kind]||{key:kind==='wards'?'value':'original',direction:kind==='wards'?-1:1};
    if(opt.key!=='original'){
      items.sort((a,b)=>{
        const result=opt.key==='name'?a.name.localeCompare(b.name,lang==='ne'?'ne':'en'):opt.key==='key'?String(a.key).localeCompare(String(b.key),'en',{numeric:true}):a.value-b.value;
        return result*opt.direction;
      });
    }
    return {items,denom,gender};
  }
  function drawTable(kind){
    const {items,denom}=parseRows(kind);
    const selected=state.mode[kind]||'count';
    const headers=['name',selected==='percent'?'share':'value',selected==='percent'?'value':'share'];
    const names=[t(kind==='wards'?'ward':'status'),selected==='percent'?t('share'):t('value'),selected==='percent'?t('value'):t('share')];
    const head='<thead><tr>'+headers.map((key,i)=>'<th scope="col"><button type="button" data-table-sort="'+esc(kind)+'" data-sort-key="'+key+'" aria-label="'+esc(useLang('क्रमबद्ध गर्नुहोस्','Sort by')+' '+names[i])+'">'+esc(names[i])+' ⇅</button></th>').join('')+'</tr></thead>';
    const body=items.map(x=>{
      const columns={name:esc(x.name),value:nf(x.value),share:pcf(x.share)};
      return '<tr>'+headers.map((key,i)=>'<td>'+columns[key]+'</td>').join('')+'</tr>';
    }).join('');
    const empty='<tr><td colspan="3">'+esc(t('empty'))+'</td></tr>';
    output('bd-table-'+kind,'<div class="bd-data-table-wrap"><table class="bd-table" data-table-name="'+kind+'"><caption class="bd-sr-only">'+esc(kind)+' ('+nf(denom)+')</caption>'+head+'<tbody>'+(body||empty)+'</tbody></table></div>');
    const vizItems=items.map(x=>({label:x.name,value:selected==='percent'?x.share:x.value,shown:selected==='percent'?pcf(x.share):nf(x.value)}));
    output('bd-bars-'+kind,drawBars(vizItems,{color:kind==='migrationReasons'?'#b18340':kind==='employment'?'#486d99':'#187f7b'}));
    const note=byId('bd-foot-'+kind);
    if(note){const sourceID=({wards:'S04',age:'S02',literacy:'S02',employment:'S02',marital:'S02',migrationReasons:'S02',lowActivity:'S02'})[kind];note.innerHTML=sourceFoot(sourceID,2021,useLang('आधार समूह: ','Denominator: ')+nf(denom));}
  }
  function renderWardChips(){
    const chips=d.wards.map(w=>{
      const active=state.selectedWards.has(w.ward);
      return '<button type="button" data-ward="'+w.ward+'" aria-pressed="'+String(active)+'">'+t('ward')+' '+nf(w.ward)+'</button>';
    }).join('');
    output('bd-ward-chips','<div class="bd-ward-chips" aria-label="'+esc(t('selectWards'))+'">'+chips+'</div>');
    output('bd-ward-summary',useLang('छानिएका वडा: ','Selected wards: ')+nf(state.selectedWards.size)+' / 9 · '+useLang('छानिएको जनसंख्या','Selected population')+': '+nf(d.wards.filter(w=>state.selectedWards.has(w.ward)).reduce((a,x)=>a+x.population,0)));
  }
  function renderPoverty(){
    const p=d.poverty;
    output('bd-poverty-chart',drawBars([
      {label:useLang('गरिबी दर (FGT0)','Poverty headcount (FGT0)'),value:p.headcount,shown:pcf(p.headcount)},
      {label:useLang('गरिबी अन्तर (FGT1)','Poverty gap (FGT1)'),value:p.gap,shown:pcf(p.gap)},
      {label:useLang('गरिबी गहनता (FGT2)','Poverty severity (FGT2)'),value:p.severity,shown:pcf(p.severity)}
    ],{color:'#ad5e57'})+'<p class="bd-note">'+useLang('यो सांख्यिकीय अनुमान हो, प्रत्यक्ष जनगणनामा गरिब गनिएको संख्या होइन। २०२३ को model population ५५,३५१ र २०२१ Census को ५५,३५४ बीच ३ जनाको अन्तर छ।','This is a model estimate, not a direct census enumeration of poor persons. The 2023 model base is 55,351 versus 55,354 residents in Census 2021.')+'</p>'+sourceFoot('S06',2023,'model base 55,351'));
  }
  function integrity(){
    const sums={
      ward:d.wards.reduce((a,r)=>a+r.population,0),
      ages:d.ageGroups.reduce((a,r)=>a+r.total,0),
      male:d.ageGroups.reduce((a,r)=>a+r.male,0),
      female:d.ageGroups.reduce((a,r)=>a+r.female,0),
      marital:d.marital.reduce((a,r)=>a+r.total,0),
      literacy:d.literacy.reduce((a,r)=>a+r.total,0),
      employment:d.employment.reduce((a,r)=>a+r.total,0),
      migration:d.migrationReasons.reduce((a,r)=>a+r.total,0),
      lowActivity:d.lowActivity.reduce((a,r)=>a+r.total,0)
    };
    const ok=sums.ward===55354&&sums.ages===55354&&sums.male===26734&&sums.female===28620&&sums.marital===42481&&sums.literacy===49106&&sums.employment===22495&&sums.migration===4397&&sums.lowActivity===30066;
    const message=ok?useLang('९ वटा मुख्य योग जाँच मिल्यो।','Nine primary reconciliation checks passed.'):useLang('सावधानी: केही योग मिलेनन्।','Warning: a source table does not reconcile.');
    const el=byId('bd-integrity');
    if(el){el.textContent=message;el.setAttribute('data-valid',String(ok));}
  }
  function renderAll(){
    renderKPIs();renderOverview();renderPopulation();
    renderWardChips();
    ['wards','age','literacy','employment','marital','migrationReasons','lowActivity'].forEach(drawTable);
    renderPoverty();integrity();
  }
  document.addEventListener('click',e=>{
    const sort=e.target.closest('[data-table-sort]');
    if(sort){
      const kind=sort.dataset.tableSort,key=sort.dataset.sortKey;
      const old=state.sort[kind]||{key:'original',direction:1};
      state.sort[kind]={key:key==='share'?'value':key,direction:old.key===(key==='share'?'value':key)?-old.direction:1};
      drawTable(kind);
    }
    const ward=e.target.closest('[data-ward]');
    if(ward){
      const id=Number(ward.dataset.ward);
      if(state.selectedWards.has(id))state.selectedWards.delete(id);else state.selectedWards.add(id);
      renderWardChips();drawTable('wards');
    }
    const reset=e.target.closest('[data-ward-reset]');
    if(reset){state.selectedWards=new Set(d.wards.map(x=>x.ward));renderWardChips();drawTable('wards');}
    const csv=e.target.closest('[data-export-table]');
    if(csv)exportTable(csv.dataset.exportTable);
    const print=e.target.closest('[data-print]');
    if(print){
      root.classList.toggle('bd-print-report',print.dataset.print==='report');
      window.print();
    }
  });
  window.addEventListener('afterprint',()=>root.classList.remove('bd-print-report'));
  document.addEventListener('input',e=>{
    const search=e.target.closest('[data-search-table]');
    if(search){state.search[search.dataset.searchTable]=search.value;drawTable(search.dataset.searchTable);}
  });
  document.addEventListener('change',e=>{
    const gender=e.target.closest('[data-gender-table]');
    if(gender){state.gender[gender.dataset.genderTable]=gender.value;drawTable(gender.dataset.genderTable);}
    const mode=e.target.closest('[data-mode-table]');
    if(mode){state.mode[mode.dataset.modeTable]=mode.value;drawTable(mode.dataset.modeTable);}
  });
  function exportTable(kind){
    const table=byId('bd-table-'+kind)?.querySelector('table');
    if(!table)return;
    const lines=Array.from(table.querySelectorAll('tr')).map(tr=>Array.from(tr.querySelectorAll('th,td')).map(el=>'"'+el.textContent.replaceAll('"','""')+'"').join(','));
    const csv='\uFEFF'+lines.join('\r\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='bhangaha-'+kind+'-2021.csv';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  }
  const topButton=byId('bd-backtop');
  topButton?.addEventListener('click',()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
  let framePending=false;
  function queueBackTop(){
    if(framePending)return;framePending=true;
    requestAnimationFrame(()=>{framePending=false;if(topButton)topButton.hidden=window.scrollY<650;});
  }
  window.addEventListener('scroll',queueBackTop,{passive:true});
  window.addEventListener('resize',queueBackTop);
  queueBackTop();
  updateText();
  const start=decodeURIComponent(location.hash.replace(/^#/,''));
  setTabs(allPanels.some(x=>x.id===start)?start:'overview',{scroll:false});
})();
