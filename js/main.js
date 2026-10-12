/**
 * HAPPY CREPE & CHURROS — MAIN SCRIPT
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

    // Operation window: 19:00 (1140 min) to 22:30 (1350 min)
    const openTime = 19 * 60; // 19:00
    const closeTime = 22 * 60 + 30; // 22:30

    // Operating days: Wednesday (3), Thursday (4), Friday (5), Saturday (6), Sunday (0)
    const isOpenDay = day === 3 || day === 4 || day === 5 || day === 6 || day === 0;
    const isWithinHours = currentTimeInMinutes >= openTime && currentTimeInMinutes <= closeTime;

    let statusText = '';
    let statusClass = 'dot-pulse'; // green
    let badgeText = '';

    if (isOpenDay && isWithinHours) {
      statusText = 'Aberto Agora • Até às 22:30';
      badgeText = '🟢 ABERTO AGORA • 19:00 às 22:30';
      statusClass = 'dot-pulse';
    } else if (isOpenDay && currentTimeInMinutes < openTime) {
      const remainingHours = Math.floor((openTime - currentTimeInMinutes) / 60);
      const remainingMin = (openTime - currentTimeInMinutes) % 60;
      statusText = `Abre hoje às 19:00 (${remainingHours > 0 ? remainingHours + 'h ' : ''}${remainingMin}min)`;
      badgeText = `🟡 ABRE HOJE ÀS 19:00 • Mairinque`;
      statusClass = 'dot-pulse';
    } else {
      // Closed now
      if (day === 1) {
        statusText = 'Fechado • Abre quarta às 19:00';
      } else if (day === 2) {
        statusText = 'Fechado • Abre amanhã às 19:00';
      } else {
        // Closed late at night on open days
        if (day === 0) {
          statusText = 'Fechado • Abre quarta às 19:00';
        } else {
          statusText = 'Fechado • Abre amanhã às 19:00';
        }
      }
      badgeText = '🔴 FECHADO AGORA • Quarta a Domingo 19h–22h30';
      statusClass = 'dot-closed';
    }

    // Update Navbar pill
    const navDot = document.getElementById('nav-status-dot');
    const navText = document.getElementById('nav-status-text');
    if (navDot && navText) {
      navDot.className = `status-dot ${statusClass}`;
      navText.textContent = statusText;
    }

    // Update Hero pill
    const heroDot = document.getElementById('hero-status-dot');
    const heroText = document.getElementById('hero-status-text');
    if (heroDot && heroText) {
      heroDot.className = `status-dot ${statusClass}`;
      heroText.textContent = statusText;
    }

    // Update Schedule badge
    const schedDot = document.getElementById('schedule-status-dot');
    const schedText = document.getElementById('schedule-status-text');
    if (schedDot && schedText) {
      schedDot.className = `status-dot ${statusClass}`;
      schedText.textContent = statusText;
    }

    // Highlight today's row in the table
    const todayRows = document.querySelectorAll(`.schedule-row[data-day="${day}"]`);
    todayRows.forEach((row) => {
      row.classList.add('active-day');
      const tag = row.querySelector('.schedule-tag-today');
      if (tag) tag.style.display = 'inline-block';
    });
  }

  // --- 2. Progressive Light Rail Scroll Mechanic ---
  function initProgressiveLightRail() {
    const journeySection = document.getElementById('jornada');
    const railFill = document.getElementById('light-rail-fill');
    const railNode = document.getElementById('light-rail-node');
    const steps = document.querySelectorAll('.journey-step');

    if (!journeySection || !railFill || !railNode || steps.length === 0) return;

    function updateLightRail() {
      const rect = journeySection.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Calculate progress across journey section
      const totalDist = rect.height;
      const currentScroll = viewportHeight * 0.5 - rect.top;
      let progress = currentScroll / totalDist;

      progress = Math.max(0, Math.min(1, progress));

      const percentage = (progress * 100).toFixed(1);
      railFill.style.height = `${percentage}%`;
      railNode.style.top = `${percentage}%`;

      // Activate steps as progress reaches them
      steps.forEach((step, index) => {
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

  // --- 3. Interactive Menu Filter & Bag Builder ---
  function initMenuAndBag() {
    const filterButtons = document.querySelectorAll('.menu-tab-btn');
    const menuCards = document.querySelectorAll('.menu-item-card');
    const bagBar = document.getElementById('order-bag-bar');
    const bagBadge = document.getElementById('bag-count-badge');
    const bagTotal = document.getElementById('bag-total-amount');
    const bagCheckoutBtn = document.getElementById('bag-checkout-btn');

    const bag = new Map(); // key: itemName, value: { name, price, qty }

    // Tab Filtering
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const category = btn.getAttribute('data-category');

        menuCards.forEach((card) => {
          const cardCat = card.getAttribute('data-category');
          if (category === 'all' || cardCat === category) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // Add / Remove from Bag
    menuCards.forEach((card) => {
      const addBtn = card.querySelector('[data-action="add"]');
      const name = card.getAttribute('data-name');
      const price = parseFloat(card.getAttribute('data-price')) || 0;

      if (!addBtn || !name) return;

      addBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (bag.has(name)) {
          // Remove
          bag.delete(name);
          addBtn.classList.remove('in-bag');
          addBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Pedir</span>
          `;
        } else {
          // Add
          bag.set(name, { name, price, qty: 1 });
          addBtn.classList.add('in-bag');
          addBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
            <span>No Pedido</span>
          `;
        }

        updateBagDisplay();
      });
    });

    function updateBagDisplay() {
      let count = 0;
      let total = 0;

      bag.forEach((item) => {
        count += item.qty;
        total += item.price * item.qty;
      });

      if (bagBadge) bagBadge.textContent = count;
      if (bagTotal) bagTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

      if (count > 0 && bagBar) {
        bagBar.classList.add('visible');
      } else if (bagBar) {
        bagBar.classList.remove('visible');
      }
    }

    // Checkout via WhatsApp
    if (bagCheckoutBtn) {
      bagCheckoutBtn.addEventListener('click', () => {
        if (bag.size === 0) return;

        let messageLines = [
          'Olá! Montei meu pedido no site do Happy Crepe & Churros:',
          ''
        ];

        let total = 0;
        bag.forEach((item) => {
          const sub = item.price * item.qty;
          total += sub;
          messageLines.push(`• ${item.qty}x ${item.name} — R$ ${sub.toFixed(2).replace('.', ',')}`);
        });

        messageLines.push('');
        messageLines.push(`*Total estimado:* R$ ${total.toFixed(2).replace('.', ',')}`);
        messageLines.push('Gostaria de confirmar o pedido e combinar a entrega/retirada!');

        const encodedMessage = encodeURIComponent(messageLines.join('\n'));
        const targetUrl = `https://wa.me/5511940804524?text=${encodedMessage}`;
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      });
    }
  }

  // --- 4. Scroll Reveal (IntersectionObserver with Zero-Lag Precision) ---
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal-init');
    if (reveals.length === 0) return;

    // Respect reduced motion
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
        {
          rootMargin: '0px 0px -50px 0px',
          threshold: 0.1
        }
      );

      reveals.forEach((el) => observer.observe(el));
    } else {
      // Fallback
      reveals.forEach((el) => el.classList.add('reveal-active'));
    }
  }

  // --- 5. Three.js Lightweight Ambient Embers Canvas ---
  function initAmbientParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      canvas.style.display = 'none';
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 250;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    } catch (e) {
      canvas.style.display = 'none';
      return;
    }

    // Create 45 subtle golden/amber & pink embers
    const particleCount = 45;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);

    const pinkColor = new THREE.Color('#EC388F');
    const amberColor = new THREE.Color('#F59E0B');

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 500;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 500;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

      const mixedColor = Math.random() > 0.5 ? amberColor : pinkColor;
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;

      speeds[i] = 0.2 + Math.random() * 0.35;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material
    const material = new THREE.PointsMaterial({
      size: 4,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let isVisible = true;
    let animationFrameId;

    function animate() {
      if (!isVisible || document.hidden) return;

      const pos = geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3 + 1] -= speeds[i]; // float slowly down
        if (pos[i * 3 + 1] < -250) {
          pos[i * 3 + 1] = 250;
          pos[i * 3] = (Math.random() - 0.5) * 500;
        }
      }
      geometry.attributes.position.needsUpdate = true;
      particles.rotation.y += 0.0003;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    }

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onResize, { passive: true });

    // Pause on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isVisible = false;
        cancelAnimationFrame(animationFrameId);
      } else {
        isVisible = true;
        animate();
      }
    });

    animate();
  }

  // --- 6. Global Escape & Keyboard Handlers ---
  function initKeyboardAccessibility() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Deselect or close open items
        const bagBar = document.getElementById('order-bag-bar');
        if (bagBar && bagBar.classList.contains('visible')) {
          // Hide if desired or dismiss
        }
      }
    });
  }

  // --- Initialize when DOM is ready ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initScheduleEngine();
      initProgressiveLightRail();
      initMenuAndBag();
      initScrollReveal();
      initAmbientParticles();
      initKeyboardAccessibility();
    });
  } else {
    initScheduleEngine();
    initProgressiveLightRail();
    initMenuAndBag();
    initScrollReveal();
    initAmbientParticles();
    initKeyboardAccessibility();
  }
})();
