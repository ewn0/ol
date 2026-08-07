/* ============================================================
   LA CARTE 8-BIT INTERACTIVE DE LILLE — Level Select Rétro.
   Permet d'explorer la carte du voyage et de choisir son épisode.
   ============================================================ */

const MapScreen = (() => {

  const LOCATIONS = [
    { id: 1, name: "1. Le parc", desc: "Le parc & le voisin au haut-parleur", x: 0.22, y: 0.82, icon: "🌳" },
    { id: 2, name: "2. Chute de cheveux", desc: "La préparation & brosse à cheveux", x: 0.35, y: 0.70, icon: "💇" },
    { id: 3, name: "3. Les Lys", desc: "L'arrosage du bouquet de lys", x: 0.28, y: 0.55, icon: "🌸" },
    { id: 4, name: "4. Sushis", desc: "Le rush des sushis volants", x: 0.52, y: 0.44, icon: "🍣" },
    { id: 5, name: "5. À pied", desc: "Course folle vers le Beffroi", x: 0.72, y: 0.32, icon: "🏃" },
    { id: 6, name: "6. Déménagement", desc: "Le Tetris du déménagement", x: 0.58, y: 0.20, icon: "📦" },
    { id: 7, name: "7. La fin ? Ou le début", desc: "Le verdict & les retrouvailles", x: 0.80, y: 0.10, icon: "🏠" }
  ];

  let selectedId = 1;

  function drawMap(ctx, w, h) {
    // 1. Fond carte rétro (herbe verte vintage)
    ctx.fillStyle = '#1b4326';
    ctx.fillRect(0, 0, w, h);

    // Texture d'herbe en pixels
    ctx.fillStyle = '#235230';
    for (let x = 0; x < w; x += 20) {
      for (let y = 0; y < h; y += 20) {
        if ((x + y) % 40 === 0) ctx.fillRect(x, y, 4, 4);
      }
    }

    // Rivière bleue sinueuse
    ctx.strokeStyle = '#35d6ed';
    ctx.lineWidth = Math.max(4, w * 0.03);
    ctx.beginPath();
    ctx.moveTo(0, h * 0.9);
    ctx.bezierCurveTo(w * 0.4, h * 0.7, w * 0.1, h * 0.4, w * 0.5, h * 0.3);
    ctx.bezierCurveTo(w * 0.8, h * 0.2, w * 0.6, h * 0.1, w, 0);
    ctx.stroke();

    // 2. Ligne de chemin pointillée reliant les étapes
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    LOCATIONS.forEach((loc, i) => {
      const px = loc.x * w;
      const py = loc.y * h;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // 3. Dessin des nœuds / étapes de la carte
    const completed = (window.Game && Game.getCompletedLevels) ? Game.getCompletedLevels() : new Set();
    LOCATIONS.forEach(loc => {
      const px = loc.x * w;
      const py = loc.y * h;
      const isSelected = loc.id === selectedId;
      const isDone = completed.has(loc.id);

      // Cercle de fond
      ctx.fillStyle = isSelected ? '#ff4d6d' : (isDone ? '#2f9e58' : '#181534');
      ctx.beginPath();
      ctx.arc(px, py, isSelected ? 16 : 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isSelected ? '#ffd166' : (isDone ? '#3ddc84' : '#95a5a6');
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();

      // Numéro / Icône
      ctx.fillStyle = '#ffffff';
      ctx.font = `${isSelected ? '12px' : '10px'} monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(loc.id.toString(), px, py);

      // Badge de complétion
      if (isDone) {
        ctx.fillStyle = '#ffd23f';
        ctx.beginPath();
        ctx.arc(px + 10, py - 10, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#14122b';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#14122b';
        ctx.font = '9px monospace';
        ctx.fillText('✓', px + 10, py - 10);
      }
    });

    // 4. Personnage animé placé sur le nœud sélectionné
    const curLoc = LOCATIONS.find(l => l.id === selectedId);
    if (curLoc) {
      const scale = Math.max(2, Math.floor(w / 70));
      Sprites.drawCentered(ctx, 'player', curLoc.x * w, curLoc.y * h - 22, scale);
    }
  }

  function show() {
    if (window.Achievements) Achievements.setFlag('map_seen');
    if (Game.clearScene) Game.clearScene();
    const stage = document.getElementById('stage');
    const hud = document.getElementById('hud');
    if (hud) hud.classList.add('hidden');

    const s = document.createElement('div');
    s.className = 'scene center-col';
    s.style.justifyContent = 'flex-start';
    s.style.paddingTop = '8px';

    s.innerHTML = `
      <div class="tag" style="margin-bottom:2px">AVENTURE LILLE</div>
      <h2 style="color:var(--yellow);margin-bottom:4px">CARTE DE LILLE 🗺️</h2>
      <div class="map-canvas-box" id="map-canvas-box"></div>
      <div class="map-info-card" id="map-info-card"></div>
      <div style="display:flex;gap:8px;width:100%;max-width:380px;margin-top:8px">
        <button type="button" class="btn ghost" id="map-back" style="flex:1">◄ MENU</button>
        <button type="button" class="btn alt" id="map-play" style="flex:2">JOUER L'ÉPISODE ➔</button>
      </div>
    `;
    stage.appendChild(s);

    const cvBox = s.querySelector('#map-canvas-box');
    const infoCard = s.querySelector('#map-info-card');
    const cvApi = makeCanvas(cvBox);

    function updateInfo() {
      const loc = LOCATIONS.find(l => l.id === selectedId);
      if (!loc) return;
      infoCard.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span style="font-size:12px;color:var(--yellow);font-weight:bold">${loc.icon} ${loc.name}</span>
          <span class="tag" style="margin:0;font-size:8px">ÉPISODE ${loc.id}</span>
        </div>
        <div style="font-size:9px;color:var(--ink);margin-top:4px">${loc.desc}</div>
      `;
      drawMap(cvApi.ctx, cvApi.w, cvApi.h);
    }

    // Gestion du clic sur la carte pour choisir une étape
    cvApi.canvas.addEventListener('pointerdown', e => {
      const rect = cvApi.canvas.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) / rect.width;
      const clickY = (e.clientY - rect.top) / rect.height;

      // Trouver l'étape la plus proche
      let minDistance = Infinity;
      let closestId = selectedId;
      LOCATIONS.forEach(loc => {
        const dx = loc.x - clickX;
        const dy = loc.y - clickY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) {
          minDistance = dist;
          closestId = loc.id;
        }
      });

      if (minDistance < 0.15) {
        selectedId = closestId;
        Sfx.play('click');
        updateInfo();
      }
    });

    const playBtn = s.querySelector('#map-play');
    let playFired = false;
    function doPlay(e) {
      if (playFired) return;
      playFired = true;
      if (e && e.preventDefault) e.preventDefault();
      Sfx.play('click');
      if (window.Game && Game.startLevel) {
        Game.startLevel(selectedId - 1);
      }
      setTimeout(() => { playFired = false; }, 350);
    }
    playBtn.addEventListener('click', doPlay);

    const backBtn = s.querySelector('#map-back');
    let backFired = false;
    function goBack(e) {
      if (backFired) return;
      backFired = true;
      if (e && e.preventDefault) e.preventDefault();
      Sfx.play('click');
      Game.showTitle();
      setTimeout(() => { backFired = false; }, 350);
    }
    backBtn.addEventListener('click', goBack);

    updateInfo();
  }

  const api = { show, LOCATIONS };
  window.MapScreen = api;
  return api;
})();
