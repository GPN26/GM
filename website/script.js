/* Tiny local browser for the collection. No accounts, tracking, frameworks or external scripts. */
(()=>{
  'use strict';
  const items = Array.isArray(window.GRANDMASTERS) ? window.GRANDMASTERS : [];
  const cards = document.getElementById('cards');
  const search = document.getElementById('search');
  const period = document.getElementById('period');
  const clear = document.getElementById('clear');
  const results = document.getElementById('results');
  const empty = document.getElementById('no-results');
  const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeURL = value => /^https?:\/\//i.test(value || '') ? esc(value) : '#';
  const norm = value => String(value || '').toLocaleLowerCase();
  const number = n => String(n).padStart(2,'0');
  function article(g){
    const f=g.featured || {};
    const clip=g.clipping;
    if(clip && /^assets\/clippings\/[\w./-]+$/i.test(clip.src||'') && clip.permission){
      return `<div class="card-article actual-scan"><img class="scan-image" loading="lazy" src="${esc(clip.src)}" alt="${esc(clip.alt || 'Newspaper clipping')}"><div class="image-credit">${esc(clip.credit || '')}</div></div>`;
    }
    return `<div class="card-article" aria-label="Typeset reference to linked article. Not a scan.">
      <div class="masthead"><span class="masthead-name">${esc(f.publication || 'Historic newspaper')}</span><span class="masthead-date">${esc(f.date || '')}</span></div>
      <h4 class="article-headline">${esc(f.headline || 'The GM milestone')}</h4>
    </div>`;
  }
  function others(g){
    const more=(g.more || []).filter(m=>/^https?:\/\//.test(m.url||''));
    if(!more.length) return '';
    const li=more.map(m=>`<li><a href="${safeURL(m.url)}" target="_blank" rel="noopener noreferrer" lang="${esc(m.language||'')}">${esc(m.title || 'Further reading')} ↗</a>${m.language?`<span class="lang-badge">${esc(m.language)}</span>`:''}<span class="source-pub">${esc(m.publication||'')}</span></li>`).join('');
    return `<details class="extra-details"><summary><span>Other articles &amp; sources <span class="other-count">(${more.length})</span></span><svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m5 7 5 5 5-5"/></svg></summary><ul class="more-list">${li}</ul></details>`;
  }
  function card(g){
    const f=g.featured || {};
    return `<article class="gm-card" id="gm${g.number}" data-name="${esc(g.name)}">
      <div class="card-top"><span class="card-index">GM NO. ${number(g.number)}</span><span class="card-year">${esc(g.year)}</span></div>
      <h3 class="card-title">${esc(g.name)}</h3>
      <a class="article-click" href="${safeURL(f.url)}" target="_blank" rel="noopener noreferrer" aria-label="Open source for ${esc(g.name)}">${article(g)}</a>
      <div class="card-actions">
        <a class="featured-link" href="${safeURL(f.url)}" target="_blank" rel="noopener noreferrer">Read the source<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 15 15 5M6 5h9v9"/></svg></a>
        ${others(g)}
      </div>
    </article>`;
  }
  function inPeriod(g, val){
    const y=Number(g.year); if(val==='all')return true;
    if(val==='1980')return y<2000;
    return Math.floor(y/10)*10===Number(val);
  }
  function render(){
    const query=norm(search.value.trim()),p=period.value;
    const match=items.filter(g=>inPeriod(g,p) && (!query || norm([g.name,g.number,'gm'+g.number,g.year,g.featured?.headline,g.featured?.publication,...(g.more||[]).flatMap(m=>[m.title,m.publication,m.language])].join(' ')).includes(query)));
    cards.innerHTML=match.map(card).join('');
    results.textContent=match.length===items.length?`${items.length} grandmasters`:`${match.length} of ${items.length} grandmasters`;
    empty.hidden=match.length>0;
    clear.hidden=(!query&&p==='all');
    document.getElementById('headcount').textContent=`/ ${items.length}`;
  }
  function clearFilters(){search.value='';period.value='all';render();search.focus()}
  search.addEventListener('input',render);period.addEventListener('change',render);clear.addEventListener('click',clearFilters);
  document.addEventListener('keydown',e=>{if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();search.focus()};if(e.key==='Escape'&&document.activeElement===search){search.value='';render();search.blur()}});
  render();
  document.getElementById('wordmark-count').textContent = items.length;
  if(location.hash&&/^#gm\d+$/.test(location.hash)){
    const el=document.querySelector(location.hash);if(el) requestAnimationFrame(()=>el.scrollIntoView({block:'start'}));
  }
})();
