/**
 * HAPPY CREPE & CHURROS — MAIN SCRIPT (AJUSTE 1)
 * Mairinque / SP • "Onde o crepe é feliz e o churros é irresistível"
 */

(function () {
  'use strict';

  // --- 1. Operational Real-Time Schedule Engine ---
  function initScheduleEngine() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTimeInMinutes = hours * 60 + minutes;

    const openTime = 19 * 60; // 19:00
    const closeTime = 22 * 60 + 30; // 22:30

    // Quarta (3) a Domingo (0)
    const isOpenDay = day === 3 || day === 4 || day === 5 || day === 6 || day === 0;
    const isWithinHours = currentTimeInMinutes >= openTime && currentTimeInMinutes <= closeTime;

    let statusText = '';
    let statusClass = 'dot-pulse';

    if (isOpenDay && isWithinHours) {
      statusText = 'Aberto Agora • Até às 22:30';
      statusClass = 'dot-pulse';
    } else if (isOpenDay && currentTimeInMinutes < openTime) {
      const remainingHours = Math.floor((openTime - currentTimeInMinutes) / 60);
      const remainingMin = (openTime - currentTimeInMinutes) % 60;
      statusText = `Abre hoje às 19:00 (${remainingHours > 0 ? remainingHours + 'h ' : ''}${remainingMin}min)`;
      statusClass = 'dot-pulse';
    } else {
      if (day === 1) {
        statusText = 'Fechado • Abre quarta às 19:00';
      } else if (day === 2) {
        statusText = 'Fechado • Abre amanhã às 19:00';
      } else {
        if (day === 0) {
          statusText = 'Fechado • Abre quarta às 19:00';
        } else {
          statusText = 'Fechado • Abre amanhã às 19:00';
        }
      }
      statusClass = 'dot-closed';
    }

    const navDot = document.getElementById('nav-status-dot');
    const navText = document.getElementById('nav-status-text');
    if (navDot && navText) {
      navDot.className = `status-dot ${statusClass}`;
      navText.textContent = statusText;
    }

    const heroDot = document.getElementById('hero-status-dot');
    const heroText = document.getElementById('hero-status-text');
    if (heroDot && heroText) {
      heroDot.className = `status-dot ${statusClass}`;
      heroText.textContent = statusText;
    }

    const schedDot = document.getElementById('schedule-status-dot');
    const schedText = document.getElementById('schedule-status-text');
    if (schedDot && schedText) {
      schedDot.className = `status-dot ${statusClass}`;
      schedText.textContent = statusText;
    }

    const todayRows = document.querySelectorAll(`.schedule-row[data-day="${day}"]`);
    todayRows.forEach((row) => {
      row.classList.add('active-day');
      const tag = row.querySelector('.schedule-tag-today');
      if (tag) tag.style.display = 'inline-block';
    });
  }

  // --- 2. Gesto de Abertura (One-Shot Signature) ---
  function initOpeningGesture() {
    const burst = document.getElementById('opening-burst');
    if (!burst) return;
    setTimeout(() => {
      burst.remove();
    }, 1100);
  }

  // --- 3. Física de Confeitos/Granulados Reativa ao Scroll (Teto Rigoroso) ---
  function initSprinklesSystem() {
    const canvas = document.getElementById('sprinkles-canvas');
    if (!canvas) return;

    // Check reduced motion & save-data
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSaveData = navigator.connection && navigator.connection.saveData;
    if (prefersReducedMotion || isSaveData) {
      canvas.style.display = 'none';
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Paleta de confeitos da marca
    const sprinkleColors = [
      '#EC388F', // Rosa oficial
      '#FF6BB6', // Rosa claro
      '#F59E0B', // Dourado doce de leite
      '#FBBF24', // Amarelo churro
      '#38BDF8', // Azul suave
      '#FFFFFF', // Baunilha/Açúcar
      '#5C3828'  // Chocolate
    ];

    const particles = [];
    const MAX_PARTICLES = 60; // Teto estrito
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let isLoopRunning = false;
    let idleTimer = null;

    class Sprinkle {
      constructor(x, y, speedY) {
        this.x = x;
        this.y = y;
        this.color = sprinkleColors[Math.floor(Math.random() * sprinkleColors.length)];
        this.width = 3 + Math.random() * 2;
        this.height = 8 + Math.random() * 6; // Formato cilíndrico de confeito
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.15;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = speedY * 0.4 + (Math.random() * 2 + 1);
        this.gravity = 0.12;
        this.life = 1.0;
        this.decay = 0.015 + Math.random() * 0.01;
      }

      update() {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.rotationSpeed;
        this.life -= this.decay;
      }

      draw(c) {
        if (this.life <= 0) return;
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.angle);
        c.globalAlpha = Math.max(0, this.life * 0.9);
        c.fillStyle = this.color;

        // Desenho de confeito tipo pílula arredondada
        c.beginPath();
        c.roundRect
          ? c.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 2)
          : c.rect(-this.width / 2, -this.height / 2, this.width, this.height);
        c.fill();
        c.restore();
      }
    }

    function spawnSprinkles(amount, direction) {
      if (document.hidden) return;
      const spawnCount = Math.min(amount, MAX_PARTICLES - particles.length);
      for (let i = 0; i < spawnCount; i++) {
        const x = Math.random() * window.innerWidth;
        const y = direction > 0 ? -10 : window.innerHeight + 10;
        const speedY = direction > 0 ? 2 + Math.random() * 3 : -(2 + Math.random() * 3);
        particles.push(new Sprinkle(x, y, speedY));
      }
      if (!isLoopRunning) {
        isLoopRunning = true;
        requestAnimationFrame(renderLoop);
      }
    }

    function renderLoop() {
      if (!isLoopRunning) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.life <= 0 || p.y > canvas.height + 30 || p.y < -30) {
          particles.splice(i, 1);
        }
      }

      if (particles.length > 0 && !document.hidden) {
        requestAnimationFrame(renderLoop);
      } else {
        isLoopRunning = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;
      scrollVelocity = Math.abs(delta);

      if (scrollVelocity > 5) {
        const direction = delta > 0 ? 1 : -1;
        const count = Math.min(4, Math.floor(scrollVelocity / 8));
        spawnSprinkles(count, direction);
      }

      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        scrollVelocity = 0;
      }, 250);
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        particles.length = 0;
        isLoopRunning = false;
      }
    });
  }

  // --- 4. Produto 3D Interativo de Sabores Reais em Three.js ---
  function initFlavor3DShowcase() {
    const canvas = document.getElementById('flavor-3d-canvas');
    const viewport = document.getElementById('flavor-3d-viewport');
    const fallback = document.getElementById('flavor-fallback-2d');
    if (!canvas || !viewport || typeof THREE === 'undefined') {
      if (fallback) fallback.style.display = 'flex';
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      if (fallback) fallback.style.display = 'flex';
      canvas.style.display = 'none';
      return;
    }

    // Configurações de Sabores Reais
    const flavors = {
      'duplo-doce-de-leite': {
        name: 'Churros Duplo Doce de Leite',
        price: 'R$ 13',
        desc: 'Massa frita na hora crocante passada no açúcar e canela, com dose dupla de doce de leite cremoso por dentro e na cobertura.',
        bodyColor: 0xDE9B52, // Dourado canela
        toppingColor: 0xD97706, // Doce de leite caramelado
        sprinkleColor: 0xFDE68A
      },
      'nutella': {
        name: 'Churros Nutella',
        price: 'R$ 13',
        desc: 'Churros estaladiço recheado e coberto com legítima Nutella pura de avelã de ponta a ponta.',
        bodyColor: 0xD98E47,
        toppingColor: 0x3A1D13, // Chocolate Nutella
        sprinkleColor: 0xFFFFFF
      },
      'costela-queijo': {
        name: 'Crepe Costela com Queijo',
        price: 'R$ 14',
        desc: 'Massa fina e dourada na chapa com costela bovina desfiada artesanal suculenta e queijo derretido.',
        bodyColor: 0xF5BA67,
        toppingColor: 0xFCD34D, // Queijo derretido
        sprinkleColor: 0xB91C1C
      },
      'romeu-julieta': {
        name: 'Crepe Romeu e Julieta',
        price: 'R$ 9',
        desc: 'O encontro clássico da doçura: goiabada cascão cremosa quente com queijo derretido de dar água na boca.',
        bodyColor: 0xF5B55E,
        toppingColor: 0x9F1239, // Goiabada cascão rubi
        sprinkleColor: 0xFEF08A
      }
    };

    let currentFlavor = 'duplo-doce-de-leite';
    let isSceneInitialized = false;
    let renderer, scene, camera, itemGroup, bodyMesh, toppingMesh, sprinklesGroup;
    let isDragging = false;
    let prevMouseX = 0;
    let isVisibleInViewport = false;
    let animFrameId = null;

    function build3DScene() {
      if (isSceneInitialized) return;
      isSceneInitialized = true;

      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: 'low-power'
        });
        renderer.setSize(viewport.clientWidth, viewport.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      } catch (e) {
        if (fallback) fallback.style.display = 'flex';
        canvas.style.display = 'none';
        return;
      }

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, viewport.clientWidth / viewport.clientHeight, 0.1, 100);
      camera.position.set(0, 0, 7.5);

      // Iluminação de Estúdio Gastronômico
      const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.2);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xFFF1DE, 2.0);
      dirLight.position.set(4, 6, 5);
      scene.add(dirLight);

      const rimLight = new THREE.DirectionalLight(0xEC388F, 1.5);
      rimLight.position.set(-5, -3, -3);
      scene.add(rimLight);

      itemGroup = new THREE.Group();
      scene.add(itemGroup);

      // Corpo estilizado do Churros (cilindro frisado)
      const bodyGeom = new THREE.CylinderGeometry(0.85, 0.85, 3.8, 16, 1);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: flavors[currentFlavor].bodyColor,
        roughness: 0.7,
        metalness: 0.1
      });
      bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
      bodyMesh.rotation.z = Math.PI / 4;
      itemGroup.add(bodyMesh);

      // Cobertura em espiral/relevo generoso
      const toppingGeom = new THREE.TorusGeometry(1.05, 0.28, 16, 40);
      const toppingMat = new THREE.MeshStandardMaterial({
        color: flavors[currentFlavor].toppingColor,
        roughness: 0.25, // Brilho cremoso
        metalness: 0.05
      });
      toppingMesh = new THREE.Mesh(toppingGeom, toppingMat);
      toppingMesh.rotation.x = Math.PI / 2.5;
      toppingMesh.scale.set(1.0, 1.0, 1.4);
      itemGroup.add(toppingMesh);

      // Confeitos sobre a peça
      sprinklesGroup = new THREE.Group();
      const sprinkleGeom = new THREE.BoxGeometry(0.08, 0.22, 0.08);
      const sprinkleMat = new THREE.MeshStandardMaterial({
        color: flavors[currentFlavor].sprinkleColor,
        roughness: 0.3
      });

      for (let i = 0; i < 24; i++) {
        const sm = new THREE.Mesh(sprinkleGeom, sprinkleMat);
        const u = Math.random() * Math.PI * 2;
        const r = 0.95 + Math.random() * 0.25;
        sm.position.set(Math.cos(u) * r, (Math.random() - 0.5) * 2.8, Math.sin(u) * r);
        sm.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
        sprinklesGroup.add(sm);
      }
      itemGroup.add(sprinklesGroup);

      // Eventos de Toque / Arrasto
      function onPointerDown(e) {
        isDragging = true;
        prevMouseX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      }
      function onPointerMove(e) {
        if (!isDragging) return;
        const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        const deltaX = x - prevMouseX;
        prevMouseX = x;
        itemGroup.rotation.y += deltaX * 0.012;
      }
      function onPointerUp() {
        isDragging = false;
      }

      canvas.addEventListener('mousedown', onPointerDown);
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);

      canvas.addEventListener('touchstart', onPointerDown, { passive: true });
      window.addEventListener('touchmove', onPointerMove, { passive: true });
      window.addEventListener('touchend', onPointerUp);

      function render() {
        if (!isVisibleInViewport || document.hidden) return;
        if (!isDragging) {
          itemGroup.rotation.y += 0.006;
          itemGroup.rotation.x = Math.sin(Date.now() * 0.001) * 0.12;
        }
        renderer.render(scene, camera);
        animFrameId = requestAnimationFrame(render);
      }

      render();
    }

    function updateFlavor(flavorKey) {
      if (!flavors[flavorKey]) return;
      currentFlavor = flavorKey;
      const data = flavors[flavorKey];

      // Atualiza 3D Materials
      if (bodyMesh && toppingMesh) {
        bodyMesh.material.color.setHex(data.bodyColor);
        toppingMesh.material.color.setHex(data.toppingColor);
        if (sprinklesGroup) {
          sprinklesGroup.children.forEach((c) => {
            c.material.color.setHex(data.sprinkleColor);
          });
        }
      }

      // Atualiza Textos
      const nameEl = document.getElementById('flavor-display-name');
      const descEl = document.getElementById('flavor-display-desc');
      const ctaBtn = document.getElementById('flavor-order-cta');
      const ctaText = document.getElementById('flavor-order-cta-text');

      if (nameEl) nameEl.textContent = data.name;
      if (descEl) descEl.textContent = data.desc;
      if (ctaText) ctaText.textContent = `Pedir Este Sabor no WhatsApp • ${data.price}`;
      if (ctaBtn) {
        const textMsg = encodeURIComponent(`Olá! Vim pelo site e quero pedir o ${data.name} (${data.price}).`);
        ctaBtn.href = `https://wa.me/5511940804524?text=${textMsg}`;
      }
    }

    // Lazy load Three.js cena quando aproxima da viewport
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              isVisibleInViewport = true;
              if (!isSceneInitialized) build3DScene();
              else if (!animFrameId) render();
            } else {
              isVisibleInViewport = false;
              if (animFrameId) {
                cancelAnimationFrame(animFrameId);
                animFrameId = null;
              }
            }
          });
        },
        { rootMargin: '200px' }
      );
      observer.observe(viewport);
    } else {
      build3DScene();
    }

    // Botões de Seleção de Sabor
    const pillButtons = document.querySelectorAll('.flavor-pill-btn');
    pillButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        pillButtons.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const key = btn.getAttribute('data-flavor');
        updateFlavor(key);
      });
    });
  }

  // --- 5. Parte B: Cardápio Sob Demanda (Acordeão Exclusivo) ---
  function initOnDemandMenu() {
    const triggers = document.querySelectorAll('.menu-cat-trigger');
    const cards = document.querySelectorAll('.menu-cat-card');

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const card = trigger.closest('.menu-cat-card');
        const isAlreadyOpen = card.classList.contains('is-open');

        // Contrato de exclusividade: fecha todas as outras seções
        cards.forEach((c) => {
          c.classList.remove('is-open');
          const btn = c.querySelector('.menu-cat-trigger');
          if (btn) {
            btn.setAttribute('aria-expanded', 'false');
            const actionText = btn.querySelector('.cat-action-text');
            if (actionText) actionText.textContent = 'Ver Sabores';
          }
        });

        // Se não estava aberta, abre a clicada
        if (!isAlreadyOpen) {
          card.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
          const actionText = trigger.querySelector('.cat-action-text');
          if (actionText) actionText.textContent = 'Fechar';
        }
      });
    });

    // Tecla Escape fecha a seção aberta e devolve foco
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openCard = document.querySelector('.menu-cat-card.is-open');
        if (openCard) {
          openCard.classList.remove('is-open');
          const btn = openCard.querySelector('.menu-cat-trigger');
          if (btn) {
            btn.setAttribute('aria-expanded', 'false');
            btn.focus();
            const actionText = btn.querySelector('.cat-action-text');
            if (actionText) actionText.textContent = 'Ver Sabores';
          }
        }
      }
    });
  }

  // --- 6. Mobile Fixed Order Bar (Barra Fixa Não-Intrusiva) ---
  function initMobileOrderBar() {
    const mobileBar = document.getElementById('mobile-order-bar');
    const heroCluster = document.getElementById('hero-cta-cluster');
    const footerCluster = document.getElementById('footer-cta-cluster');

    if (!mobileBar || !heroCluster || !footerCluster) return;

    let isHeroPast = false;
    let isFooterVisible = false;

    function updateBarVisibility() {
      if (window.innerWidth > 768) {
        mobileBar.classList.remove('active');
        return;
      }
      if (isHeroPast && !isFooterVisible) {
        mobileBar.classList.add('active');
      } else {
        mobileBar.classList.remove('active');
      }
    }

    if ('IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          isHeroPast = !e.isIntersecting;
          updateBarVisibility();
        });
      }, { threshold: 0.1 });
      heroObserver.observe(heroCluster);

      const footerObserver = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          isFooterVisible = e.isIntersecting;
          updateBarVisibility();
        });
      }, { threshold: 0.1 });
      footerObserver.observe(footerCluster);
    }

    window.addEventListener('resize', updateBarVisibility, { passive: true });
  }

  // --- 7. Progressive Light Rail Scroll Mechanic ---
  function initProgressiveLightRail() {
    const journeySection = document.getElementById('jornada');
    const railFill = document.getElementById('light-rail-fill');
    const railNode = document.getElementById('light-rail-node');
    const steps = document.querySelectorAll('.journey-step');

    if (!journeySection || !railFill || !railNode || steps.length === 0) return;

    function updateLightRail() {
      const rect = journeySection.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const totalDist = rect.height;
      const currentScroll = viewportHeight * 0.5 - rect.top;
      let progress = currentScroll / totalDist;
      progress = Math.max(0, Math.min(1, progress));

      const percentage = (progress * 100).toFixed(1);
      railFill.style.height = `${percentage}%`;
      railNode.style.top = `${percentage}%`;

      steps.forEach((step) => {
        const stepRect = step.getBoundingClientRect();
        if (stepRect.top < viewportHeight * 0.65) {
          step.classList.add('active');
        } else {
          step.classList.remove('active');
        }
      });
    }

    window.addEventListener('scroll', updateLightRail, { passive: true });
    window.addEventListener('resize', updateLightRail, { passive: true });
    updateLightRail();
  }

  // --- 8. Scroll Reveal (IntersectionObserver com Zero-Lag) ---
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal-init');
    if (reveals.length === 0) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      reveals.forEach((el) => el.classList.add('reveal-active'));
      return;
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('reveal-active');
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -40px 0px', threshold: 0.08 }
      );

      reveals.forEach((el) => observer.observe(el));
    } else {
      reveals.forEach((el) => el.classList.add('reveal-active'));
    }
  }

  // --- Inicialização DOM ---
  function initAll() {
    initScheduleEngine();
    initOpeningGesture();
    initSprinklesSystem();
    initFlavor3DShowcase();
    initOnDemandMenu();
    initMobileOrderBar();
    initProgressiveLightRail();
    initScrollReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
