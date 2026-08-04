/* ============================================================
   NIVEAU 6 — LE TETRIS DU DÉMÉNAGEMENT
   Remplis le coffre de la voiture avec les cartons et valises.
   ============================================================ */

Game.register((() => {

  /* ---- Textes ---- */
  const T = {
    intro: [
      "Les cartons, les valises, la plante, la guitare...",
      "Tout doit rentrer dans le coffre. C'est du Tetris grandeur nature.",
      "Complète au moins 2 lignes pour valider le chargement !",
    ],
    win:  "Coffre chargé à bloc !\nPas un centimètre perdu.\nEn route !",
    lose: "Ça ne rentre pas...\nLes cartons débordent.\nOn essaie de mieux empiler.",
  };

  const DUREE = 30;
  const OBJECTIF_LIGNES = 2;
  const COLS = 8;
  const ROWS = 12;

  // Shapes representing moving items
  const SHAPES = [
    // I - Grand Carton
    { shape: [[1,1,1,1]], color: '#8b5a2b', label: 'Carton' },
    // O - Bloc Valises
    { shape: [[1,1],[1,1]], color: '#a05a2c', label: 'Valises' },
    // T - Plante
    { shape: [[0,1,0],[1,1,1]], color: '#3ddc84', label: 'Plante' },
    // L - Sacs
    { shape: [[1,0],[1,0],[1,1]], color: '#ffd23f', label: 'Sac' },
    // J - Meuble
    { shape: [[0,1],[0,1],[1,1]], color: '#ff4d6d', label: 'Meuble' },
  ];

  function start(root, api) {
    root.innerHTML = `
      <div class="statusbar">
        <span>Lignes rangées : <b id="lt-score">0</b>/${OBJECTIF_LIGNES}</span>
        <span>Temps : <b id="lt-time">${DUREE}</b>s</span>
      </div>
      <div class="playfield" id="lt-field"></div>
      <div class="tetris-controls">
        <button type="button" class="btn" id="t-left">◄</button>
        <button type="button" class="btn alt" id="t-rot">↻</button>
        <button type="button" class="btn" id="t-right">►</button>
        <button type="button" class="btn hot" id="t-drop">▼</button>
      </div>
    `;

    const field = root.querySelector('#lt-field');
    const scoreEl = root.querySelector('#lt-score');
    const timeEl = root.querySelector('#lt-time');

    const cv = makeCanvas(field);
    api.onCleanup(() => cv.destroy());

    // Grid state: 0 = empty, string = color
    const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

    let scoreLignes = 0;
    let piece = null;
    let dropTimer = 0;
    const dropSpeed = 0.55; // seconds per drop step

    function newPiece() {
      const template = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      piece = {
        shape: template.shape.map(row => [...row]),
        color: template.color,
        x: Math.floor((COLS - template.shape[0].length) / 2),
        y: 0,
      };
      if (collides(piece.x, piece.y, piece.shape)) {
        // Grid full
        return false;
      }
      return true;
    }

    function collides(px, py, shape) {
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            const gx = px + c;
            const gy = py + r;
            if (gx < 0 || gx >= COLS || gy >= ROWS) return true;
            if (gy >= 0 && grid[gy][gx]) return true;
          }
        }
      }
      return false;
    }

    function lockPiece() {
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c]) {
            const gy = piece.y + r;
            const gx = piece.x + c;
            if (gy >= 0 && gy < ROWS) {
              grid[gy][gx] = piece.color;
            }
          }
        }
      }
      api.sfx('catch');
      checkLines();
      if (!newPiece()) {
        // Game Over
        api.lose(T.lose);
      }
    }

    function checkLines() {
      let cleared = 0;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (grid[r].every(cell => cell !== 0)) {
          grid.splice(r, 1);
          grid.unshift(Array(COLS).fill(0));
          cleared++;
          r++; // check same index again
        }
      }
      if (cleared > 0) {
        scoreLignes += cleared;
        scoreEl.textContent = scoreLignes;
        api.arcadePopup(`TRUNK CLEAR +${cleared} !`, 'critical');
      }
    }

    function moveLeft() {
      if (piece && !collides(piece.x - 1, piece.y, piece.shape)) {
        piece.x--;
        api.sfx('click');
      }
    }

    function moveRight() {
      if (piece && !collides(piece.x + 1, piece.y, piece.shape)) {
        piece.x++;
        api.sfx('click');
      }
    }

    function rotatePiece() {
      if (!piece) return;
      const rows = piece.shape.length;
      const cols = piece.shape[0].length;
      const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          rotated[c][rows - 1 - r] = piece.shape[r][c];
        }
      }
      if (!collides(piece.x, piece.y, rotated)) {
        piece.shape = rotated;
        api.sfx('jump');
      }
    }

    function dropFast() {
      if (!piece) return;
      while (!collides(piece.x, piece.y + 1, piece.shape)) {
        piece.y++;
      }
      lockPiece();
    }

    /* --- Key & Touch Handlers --- */
    const onKey = e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); moveLeft(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); moveRight(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); rotatePiece(); }
      else if (e.key === 'ArrowDown' || e.code === 'Space') { e.preventDefault(); dropFast(); }
    };

    window.addEventListener('keydown', onKey);
    api.onCleanup(() => window.removeEventListener('keydown', onKey));

    root.querySelector('#t-left').addEventListener('pointerdown', e => { e.preventDefault(); moveLeft(); });
    root.querySelector('#t-right').addEventListener('pointerdown', e => { e.preventDefault(); moveRight(); });
    root.querySelector('#t-rot').addEventListener('pointerdown', e => { e.preventDefault(); rotatePiece(); });
    root.querySelector('#t-drop').addEventListener('pointerdown', e => { e.preventDefault(); dropFast(); });

    newPiece();

    api.loop((dt, total) => {
      const restant = Math.max(0, DUREE - total);
      timeEl.textContent = Math.ceil(restant);

      dropTimer += dt;
      if (dropTimer >= dropSpeed) {
        dropTimer = 0;
        if (piece) {
          if (!collides(piece.x, piece.y + 1, piece.shape)) {
            piece.y++;
          } else {
            lockPiece();
          }
        }
      }

      draw(total);

      if (scoreLignes >= OBJECTIF_LIGNES) {
        api.win(T.win);
      } else if (restant <= 0) {
        api.lose(T.lose);
      }
    });

    function draw(t) {
      const { ctx, w, h } = cv;

      ctx.fillStyle = '#100e26';
      ctx.fillRect(0, 0, w, h);

      // Car trunk border
      const cellW = Math.floor((w * 0.75) / COLS);
      const cellH = Math.floor((h * 0.92) / ROWS);
      const cellSize = Math.min(cellW, cellH);

      const gridW = COLS * cellSize;
      const gridH = ROWS * cellSize;
      const startX = (w - gridW) / 2;
      const startY = (h - gridH) / 2;

      // Draw trunk frame
      ctx.fillStyle = '#1a183d';
      ctx.fillRect(startX - 6, startY - 6, gridW + 12, gridH + 12);
      ctx.strokeStyle = '#35d6ed';
      ctx.lineWidth = 3;
      ctx.strokeRect(startX - 6, startY - 6, gridW + 12, gridH + 12);

      // Draw Grid cells
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const x = startX + c * cellSize;
          const y = startY + r * cellSize;
          ctx.fillStyle = grid[r][c] ? grid[r][c] : '#14122b';
          ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

          if (grid[r][c]) {
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillRect(x + 2, y + 2, cellSize - 4, 3);
          }
        }
      }

      // Draw Active Piece
      if (piece) {
        for (let r = 0; r < piece.shape.length; r++) {
          for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c]) {
              const gx = piece.x + c;
              const gy = piece.y + r;
              if (gy >= 0) {
                const x = startX + gx * cellSize;
                const y = startY + gy * cellSize;
                ctx.fillStyle = piece.color;
                ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x + 3, y + 3, cellSize - 6, 3);
              }
            }
          }
        }
      }
    }
  }

  return { id: 6, title: 'LE TETRIS DU DÉMÉNAGEMENT', bdCaption: 'Caser 23 cartons dans une Twingo', intro: T.intro, start };
})());
