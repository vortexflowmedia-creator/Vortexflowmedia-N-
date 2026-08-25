(() => {
  // ── DYNAMIC ISLAND NAV — SCROLL-DRIVEN (HOME ONLY, reversible, GPU only) ──
  // HOME: circle at top, stays circular while WELCOME TO appears (raw 0.5-0.75), then expands 0.58-0.90
  // OTHER PAGES: static full bar, no animation, no scroll listener
  // Single ease-out cubic throughout, transform+opacity only
  (function(){
    const nav = document.querySelector('.nav');
    const outer = document.getElementById('heroPinOuter');
    const isHome = !!outer;
    if(!nav) return;
    const reduceDI = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduceDI){
      document.documentElement.style.setProperty('--nav-progress','1');
      nav.setAttribute('data-nav-done','1');
      // ensure static visible
      const nl=nav.querySelector('.nav-links'); if(nl){nl.style.opacity='1';nl.style.visibility='visible';}
      const na=nav.querySelector('.nav-actions'); if(na){na.style.opacity='1';na.style.visibility='visible';}
      window.__vortexNavApply = function(){};
      return;
    }
    // Non-home: static full bar, no Dynamic Island, no scroll binding
    if(!isHome){
      document.documentElement.style.setProperty('--nav-progress','1');
      nav.setAttribute('data-nav-done','1');
      // clear any inline that would hide leaking
      const nl=nav.querySelector('.nav-links'), na=nav.querySelector('.nav-actions');
      if(nl){ nl.style.opacity=''; nl.style.transform=''; nl.style.visibility=''; nl.style.pointerEvents='';}
      if(na){ na.style.opacity=''; na.style.transform=''; na.style.visibility=''; na.style.pointerEvents='';}
      nav.querySelectorAll('.nav-links li, .nav-cta').forEach(el=>{el.style.opacity=''; el.style.transform='';});
      window.__vortexNavApply = function(){};
      return;
    }
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
    const easeOutCubic=t=> 1 - Math.pow(1 - t, 3);
    const navLinks = nav.querySelector('.nav-links');
    const navActions = nav.querySelector('.nav-actions');
    const linkItems = navLinks ? Array.from(navLinks.querySelectorAll('li')) : [];
    const cta = navActions ? navActions.querySelector('.nav-cta') : null;
    let ticking=false;
    function isMobileNav(){ return window.matchMedia('(max-width:900px)').matches; }
    function applyNavProgress(raw){
      // HOME ONLY: stays circular while WELCOME TO appears (0.5-0.75), expand 0.68-0.92
      // raw 0 at top of pin, 1 at end of 300vh — same raw as hero, single ease-out cubic
      const t = clamp((raw - 0.68) / 0.24, 0, 1);
      const eased = easeOutCubic(t);
      document.documentElement.style.setProperty('--nav-progress', eased.toFixed(4));
      // Staggered fade/slide — transform + opacity only, single ease-out cubic
      if(!isMobileNav()){
        const linksOpacity = clamp((eased - 0.18) / 0.42, 0, 1);
        const linksY = (1 - linksOpacity) * 8;
        if(navLinks){
          navLinks.style.opacity = String(linksOpacity);
          navLinks.style.transform = `translate3d(0,${linksY.toFixed(2)}px,0)`;
          navLinks.style.pointerEvents = linksOpacity < 0.05 ? 'none' : 'auto';
          navLinks.style.visibility = linksOpacity < 0.045 ? 'hidden' : 'visible';
        }
        if(navActions){
          const actOpacity = clamp((eased - 0.26) / 0.40, 0, 1);
          const actY = (1 - actOpacity) * 8;
          navActions.style.opacity = String(actOpacity);
          navActions.style.transform = `translate3d(0,${actY.toFixed(2)}px,0)`;
          navActions.style.pointerEvents = actOpacity < 0.05 ? 'none' : 'auto';
          navActions.style.visibility = actOpacity < 0.045 ? 'hidden' : 'visible';
        }
        linkItems.forEach((li,i)=>{
          const thresh = 0.24 + i*0.09;
          const span = 0.28;
          const p = clamp((eased - thresh)/span, 0, 1);
          li.style.opacity = String(p);
          li.style.transform = `translate3d(0,${((1-p)*8).toFixed(2)}px,0)`;
        });
        if(cta){
          const p = clamp((eased - 0.64)/0.30, 0, 1);
          cta.style.opacity = String(p);
          cta.style.transform = `translate3d(0,${((1-p)*8).toFixed(2)}px,0)`;
        }
      } else {
        // Mobile: hamburger removed — navLinks hidden via CSS, only bar actions fade
        const actOpacityM = clamp((eased - 0.14) / 0.44, 0, 1);
        const actYM = (1 - actOpacityM) * 8;
        if(navActions){
          navActions.style.opacity = String(actOpacityM);
          navActions.style.transform = `translate3d(0,${actYM.toFixed(2)}px,0)`;
          navActions.style.pointerEvents = actOpacityM < 0.05 ? 'none' : 'auto';
          navActions.style.visibility = actOpacityM < 0.045 ? 'hidden' : 'visible';
        }
        linkItems.forEach(li=>{ li.style.opacity=''; li.style.transform=''; });
        if(cta){
          const pM = clamp((eased - 0.28)/0.42, 0, 1);
          cta.style.opacity = String(pM);
          cta.style.transform = `translate3d(0,${((1-pM)*8).toFixed(2)}px,0)`;
        }
      }
      if(eased >= 0.995) nav.setAttribute('data-nav-done','1');
      else nav.removeAttribute('data-nav-done');
    }
    function onScrollNav(){
      if(ticking) return;
      ticking=true;
      requestAnimationFrame(()=>{
        ticking=false;
        const rect=outer.getBoundingClientRect();
        const total=Math.max(1, outer.offsetHeight - window.innerHeight);
        const raw=clamp(-rect.top/total, 0, 1);
        applyNavProgress(raw);
      });
    }
    // Initial paint: CSS has --nav-progress 0 (circle via html:has(#heroPinOuter)) — sync immediately before first frame
    (function(){
      const rect=outer.getBoundingClientRect();
      const total=Math.max(1, outer.offsetHeight - window.innerHeight);
      const raw=clamp(-rect.top/total,0,1);
      applyNavProgress(raw);
    })();
    window.addEventListener('scroll', onScrollNav, {passive:true});
    window.addEventListener('resize', onScrollNav, {passive:true});
    window.addEventListener('orientationchange', ()=> setTimeout(onScrollNav,200));
    window.__vortexNavApply = applyNavProgress;
  })();

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  if (reduce) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  // TILT CARDS — cursor-reactive 3D (desktop only)
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    const base = (getComputedStyle(card).getPropertyValue('--base') || '').trim() || '0deg';
    // On mobile, let CSS scroll-driven reveal handle transform — don't set perspective inline
    if (isMobile) {
      let glowM = card.querySelector('.tilt-glow');
      if (!glowM) {
        glowM = document.createElement('div');
        glowM.className = 'tilt-glow';
        glowM.setAttribute('aria-hidden','true');
        card.appendChild(glowM);
      }
      return;
    }
    let glow = card.querySelector('.tilt-glow');
    if (!glow) {
      glow = document.createElement('div');
      glow.className = 'tilt-glow';
      glow.setAttribute('aria-hidden','true');
      card.appendChild(glow);
    }
    let raf = 0;
    let tx = 0, ty = 0, mx = 50, my = 50;
    const apply = () => {
      card.style.setProperty('--rx', ty + 'deg');
      card.style.setProperty('--ry', tx + 'deg');
      card.style.setProperty('--mx', mx + '%');
      card.style.setProperty('--my', my + '%');
      card.style.transform = `perspective(1100px) rotate(${base}) rotateX(${ty}deg) rotateY(${tx}deg)`;
      if (glow) {
        glow.style.setProperty('--mx', mx + '%');
        glow.style.setProperty('--my', my + '%');
      }
      const content = card.querySelector('.tilt-content');
      if (content) content.style.transform = `translateZ(${Math.abs(tx)*0.6 + Math.abs(ty)*0.6 + 12}px)`;
    };
    card.addEventListener('mousemove', e => {
      if (isTouch) return;
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const cx = r.width / 2, cy = r.height / 2;
      // limit rotation to ~±7deg
      const ry = ((x - cx) / cx) * 7;
      const rx = ((cy - y) / cy) * 7;
      mx = (x / r.width) * 100;
      my = (y / r.height) * 100;
      tx = ry; ty = rx;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    });
    card.addEventListener('mouseleave', () => {
      tx = 0; ty = 0; mx = 50; my = 50;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform = `perspective(1100px) rotate(${base}) rotateX(0) rotateY(0)`;
        card.style.removeProperty('--rx'); card.style.removeProperty('--ry');
        const c = card.querySelector('.tilt-content');
        if (c) c.style.transform = 'translateZ(0)';
      });
    });
    // initial base
    card.style.transform = `perspective(1100px) rotate(${base})`;
  });

  // MAGNETIC BUTTONS
  const magBtns = document.querySelectorAll('.btn-magnetic, .nav-cta');
  magBtns.forEach(btn => {
    let raf2 = 0;
    btn.addEventListener('mousemove', e => {
      if (isTouch) return;
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const cx = r.width / 2, cy = r.height / 2;
      const dx = (x - cx) * 0.18;
      const dy = (y - cy) * 0.28;
      const mx = (x / r.width) * 100, my = (y / r.height) * 100;
      btn.style.setProperty('--mx', mx + '%');
      btn.style.setProperty('--my', my + '%');
      cancelAnimationFrame(raf2);
      raf2 = requestAnimationFrame(() => {
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });
    });
    btn.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf2);
      btn.style.transform = '';
    });
    btn.addEventListener('mousedown', () => {
      btn.style.transform = 'scale(0.96)';
    });
    btn.addEventListener('mouseup', () => {
      btn.style.transform = '';
    });
  });

  // NAV link subtle lift already via CSS, add tiny purple dot follower
  // HEADING parallax on mouse (very subtle)
  const heroes = document.querySelectorAll('.hero, .section');
  heroes.forEach(sec => {
    const h = sec.querySelector('.h-1, .h-2');
    if (!h) return;
    sec.addEventListener('mousemove', e => {
      if (isTouch) return;
      const r = sec.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      h.style.transform = `translateX(${x * 6}px)`;
    });
    sec.addEventListener('mouseleave', () => { h.style.transform = ''; });
  });

  // PARALLAX for bg-words and orbs (subtle) — scroll-driven, works on both desktop and mobile
  let tick = 0;
  window.addEventListener('scroll', () => {
    if (reduce) return;
    // On touch, use slower tick to keep performant
    const divisor = isTouch ? 2 : 3;
    tick++;
    if (tick % divisor !== 0) return;
    const y = window.scrollY;
    document.querySelectorAll('.bg-word').forEach(el => {
      const speed = isTouch ? 0.06 : 0.08;
      // Mobile: horizontal + vertical parallax for maximalist feel
      if (isMobile) {
        const offset = (y * speed * 0.6) % 20;
        el.style.transform = `translateY(${y * speed * 0.4}px) translateX(${offset}px) rotate(${el.dataset.rot || -3}deg)`;
      } else {
        el.style.transform = `translateY(${y * speed * 0.5}px) rotate(${el.dataset.rot || -3}deg)`;
      }
    });
  }, { passive: true });

  // Discount badge reveal on intersection
  const badgeObs = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('sliced');
        badgeObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.original-wrap').forEach(el => badgeObs.observe(el));

  // ——— MOBILE SCROLL-DRIVEN (≤768px) ———
  if (isMobile) {
    // Ensure price-cut and featured also animate on scroll even if tilt hover disabled
    const mobileRevealObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // trigger price slash inside
          entry.target.querySelectorAll && entry.target.querySelectorAll('.original-wrap').forEach(w => w.classList.add('sliced'));
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.price-cut, .featured-web .bg-feature, .featured-web .ring').forEach(el => {
      el.classList.add('reveal');
      mobileRevealObs.observe(el);
    });

    // Featured Web Designing parallax — decorative layers move independently on scroll
    const featured = document.querySelector('.featured-web');
    if (featured) {
      const bgFeature = featured.querySelector('.bg-feature');
      const rings = featured.querySelectorAll('.ring');
      const priceCut = featured.querySelector('.price-cut');
      let tickF = 0;
      const onScrollFeatured = () => {
        const rect = featured.getBoundingClientRect();
        const vh = window.innerHeight;
        // progress: 0 when below viewport, 1 when centered, 0 when above
        const center = rect.top + rect.height / 2;
        const viewportCenter = vh / 2;
        const dist = Math.abs(center - viewportCenter);
        const progress = Math.max(0, 1 - dist / (vh * 0.7));
        if (bgFeature) bgFeature.style.transform = `translateX(${progress * 18}px) rotate(-3deg)`;
        rings.forEach((r, i) => {
          const dir = i % 2 === 0 ? 1 : -1;
          r.style.transform = `translateX(${progress * dir * 12}px) translateY(${progress * dir * 6}px)`;
        });
        if (priceCut) {
          priceCut.style.transform = `scale(${0.96 + progress * 0.04})`;
          priceCut.style.opacity = `${0.85 + progress * 0.15}`;
        }
        featured.style.setProperty('--glow', progress);
        // subtle glow intensify
        featured.style.boxShadow = `12px 12px 0 var(--deep), 20px 20px 0 rgba(123,47,255,${0.18 + progress * 0.08}), 0 0 ${40 + progress * 30}px rgba(123,47,255,${0.22 + progress * 0.12})`;
      };
      let rafF = 0;
      window.addEventListener('scroll', () => {
        tickF++;
        if (tickF % 2 !== 0) return;
        cancelAnimationFrame(rafF);
        rafF = requestAnimationFrame(onScrollFeatured);
      }, { passive: true });
      // initial
      onScrollFeatured();
      // also observe to trigger visible
      mobileRevealObs.observe(featured);
    }

    // Touch feedback — brief scale/compression + glow pulse
    const touchTargets = document.querySelectorAll('.tilt-card, .btn, .nav-cta, .work-card');
    touchTargets.forEach(el => {
      el.addEventListener('touchstart', () => {
        el.classList.add('touch-active');
        // glow pulse for pricing
        const badge = el.querySelector('.discount-badge');
        if (badge) badge.style.transform = 'rotate(3deg) scale(1.08)';
      }, { passive: true });
      const end = () => {
        setTimeout(() => {
          el.classList.remove('touch-active');
          const badge = el.querySelector('.discount-badge');
          if (badge) badge.style.transform = '';
        }, 180);
      };
      el.addEventListener('touchend', end, { passive: true });
      el.addEventListener('touchcancel', end, { passive: true });
    });

    // Horizontal parallax for service cards as they enter — already handled by CSS left/right, but add subtle text shift
    document.querySelectorAll('.svc-title, .price-main .current').forEach(el => {
      const parent = el.closest('.tilt-card');
      if (!parent) return;
      const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            el.style.transform = 'translateX(0)';
            el.style.transition = 'transform 0.6s var(--ease) 0.2s';
          } else {
            const isEven = Array.from(parent.parentNode.children).indexOf(parent) % 2 === 1;
            el.style.transform = `translateX(${isEven ? '10px' : '-10px'})`;
          }
        });
      }, { threshold: 0.3 });
      // set initial offset
      const isEven = Array.from(parent.parentNode.children).indexOf(parent) % 2 === 1;
      el.style.transform = `translateX(${isEven ? '10px' : '-10px'})`;
      obs.observe(parent);
    });
  }

  // ── PREMIUM MOBILE MENU — polished open/close, scroll-lock, focus trap ──
  (function(){
    const btn = document.getElementById('mMenuBtn');
    const menu = document.getElementById('mMenu');
    if(!btn || !menu) return;
    const panel = menu.querySelector('.m-menu__panel');
    const backdrop = menu.querySelector('.m-menu__backdrop');
    const links = Array.from(menu.querySelectorAll('.m-link'));
    const cta = menu.querySelector('.m-menu__cta');
    const focusable = () => [btn, ...links, cta].filter(Boolean);
    let isOpen = false;
    let lastFocus = null;
    let scrollY = 0;

    function isDesktop(){ return window.matchMedia('(min-width: 901px)').matches; }

    function open(){
      if(isOpen || isDesktop()) return;
      isOpen = true;
      lastFocus = document.activeElement;
      scrollY = window.scrollY || window.pageYOffset;
      btn.classList.add('is-open');
      menu.classList.add('is-open');
      btn.setAttribute('aria-expanded','true');
      menu.setAttribute('aria-hidden','false');
      btn.setAttribute('aria-label','Close menu');
      document.documentElement.classList.add('m-menu-open');
      // prevent background scroll jump — keep position
      document.body.style.top = `-${scrollY}px`;
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      // focus first link after transition
      requestAnimationFrame(()=> requestAnimationFrame(()=>{
        (links[0]||cta||panel).focus?.();
        if(links[0]) links[0].focus();
      }));
      // trap
      document.addEventListener('keydown', onKey);
    }
    function close(restoreFocus){
      if(!isOpen) return;
      isOpen = false;
      btn.classList.remove('is-open');
      menu.classList.remove('is-open');
      btn.setAttribute('aria-expanded','false');
      menu.setAttribute('aria-hidden','true');
      btn.setAttribute('aria-label','Open menu');
      document.documentElement.classList.remove('m-menu-open');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
      document.removeEventListener('keydown', onKey);
      if(restoreFocus !== false){
        (lastFocus||btn).focus?.();
        btn.focus();
      }
    }
    function toggle(){ isOpen ? close() : open(); }
    function onKey(e){
      if(e.key === 'Escape'){ e.preventDefault(); close(); return; }
      if(e.key === 'Tab' && isOpen){
        const f = focusable();
        if(!f.length) return;
        const first = f[0], last = f[f.length-1];
        if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      }
    }
    btn.addEventListener('click', toggle);
    backdrop && backdrop.addEventListener('click', ()=> close());
    links.forEach(a=> a.addEventListener('click', ()=> close(false)));
    if(cta) cta.addEventListener('click', ()=> close(false));
    // close on resize to desktop
    window.addEventListener('resize', ()=>{ if(isDesktop() && isOpen) close(false); }, {passive:true});
    // close on orientation change
    window.addEventListener('orientationchange', ()=>{ if(isOpen) close(false); });
    // swipe down to close on panel (touch)
    let startY=0;
    if(panel){
      panel.addEventListener('touchstart', e=>{ startY = e.touches[0].clientY; }, {passive:true});
      panel.addEventListener('touchend', e=>{
        const dy = e.changedTouches[0].clientY - startY;
        if(dy > 80 && panel.scrollTop < 4) close();
      }, {passive:true});
    }
    // expose for testing
    window.__mMenu = { open, close, toggle, get isOpen(){return isOpen} };
  })();
})();
// ── LOGO CLICK — force fresh Home intro (reload vs hamburger routing) ──
;(()=>{ document.addEventListener('click', function(e){ var a=e.target.closest('a.nav-brand'); if(a && a.getAttribute('href') && a.getAttribute('href').indexOf('index.html')!==-1){ try{ sessionStorage.setItem('vfm_logo_home','1'); }catch(err){} } }); })();
// ── PREMIUM MOBILE MENU — always active (reduced-motion safe, idempotent) ──
;(()=>{ if(window.__mMenu) return;
  const btn=document.getElementById('mMenuBtn'), menu=document.getElementById('mMenu');
  if(!btn||!menu) return;
  const panel=menu.querySelector('.m-menu__panel'), backdrop=menu.querySelector('.m-menu__backdrop');
  const links=Array.from(menu.querySelectorAll('.m-link')), cta=menu.querySelector('.m-menu__cta');
  const focusable=()=>[btn,...links,cta].filter(Boolean);
  let isOpen=false, lastFocus=null, scrollY=0;
  const isDesktop=()=>window.matchMedia('(min-width: 901px)').matches;
  function open(){ if(isOpen||isDesktop()) return; isOpen=true; lastFocus=document.activeElement; scrollY=window.scrollY||window.pageYOffset; btn.classList.add('is-open'); menu.classList.add('is-open'); btn.setAttribute('aria-expanded','true'); menu.setAttribute('aria-hidden','false'); btn.setAttribute('aria-label','Close menu'); document.documentElement.classList.add('m-menu-open'); document.body.style.top=`-${scrollY}px`; document.body.style.position='fixed'; document.body.style.width='100%'; requestAnimationFrame(()=>requestAnimationFrame(()=>{ (links[0]||cta||panel)?.focus?.(); links[0]?.focus(); })); document.addEventListener('keydown', onKey); window.__mMenu.isOpen=true; }
  function close(restoreFocus){ if(!isOpen) return; isOpen=false; btn.classList.remove('is-open'); menu.classList.remove('is-open'); btn.setAttribute('aria-expanded','false'); menu.setAttribute('aria-hidden','true'); btn.setAttribute('aria-label','Open menu'); document.documentElement.classList.remove('m-menu-open'); document.body.style.position=''; document.body.style.top=''; document.body.style.width=''; window.scrollTo(0,scrollY); document.removeEventListener('keydown', onKey); if(restoreFocus!==false){ (lastFocus||btn)?.focus?.(); btn.focus(); } window.__mMenu.isOpen=false; }
  function toggle(){ isOpen?close():open(); }
  function onKey(e){ if(e.key==='Escape'){ e.preventDefault(); close(); return; } if(e.key==='Tab'&&isOpen){ const f=focusable(); if(!f.length) return; const first=f[0], last=f[f.length-1]; if(e.shiftKey&&document.activeElement===first){ e.preventDefault(); last.focus(); } else if(!e.shiftKey&&document.activeElement===last){ e.preventDefault(); first.focus(); } } }
  btn.addEventListener('click', toggle); backdrop&&backdrop.addEventListener('click', ()=>close()); links.forEach(a=>a.addEventListener('click', ()=>close(false))); if(cta) cta.addEventListener('click', ()=>close(false));
  window.addEventListener('resize', ()=>{ if(isDesktop()&&isOpen) close(false); }, {passive:true});
  window.addEventListener('orientationchange', ()=>{ if(isOpen) close(false); });
  let startY=0; if(panel){ panel.addEventListener('touchstart', e=>{ startY=e.touches[0].clientY; }, {passive:true}); panel.addEventListener('touchend', e=>{ const dy=e.changedTouches[0].clientY-startY; if(dy>80&&panel.scrollTop<4) close(); }, {passive:true}); }
  window.__mMenu={open,close,toggle, get isOpen(){return isOpen}, set isOpen(v){isOpen=v}};
})();
