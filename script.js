// Enhanced Floppy Bird — with sound effects and smoother motion
(function(){

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  const overlay = document.getElementById("overlay");
  const msgEl = document.getElementById("message");
  const scoreEl = document.getElementById("score");

  // --- Sounds ---
  const sndFlap = new Audio("flap.wav");
  const sndHit  = new Audio("hit.wav");
  const sndPoint = new Audio("point.wav");

  // --- Game Constants ---
  const GRAVITY = 0.55;
  const FLAP = -9.5;
  const BIRD_R = 16;

  const PIPE_GAP = 150;
  const PIPE_W = 55;
  const PIPE_SPEED = 2.2;
  const PIPE_TIME = 1400;

  // --- Game State ---
  let bird, pipes, score, best = 0;
  let running = false;
  let gameOver = false;
  let lastPipe = 0, lastTime = 0;

  function newBird(){
    return { x: 100, y: H/2, vy: 0, angle: 0 };
  }

  function reset(){
    bird = newBird();
    pipes = [];
    score = 0;
    running = false;
    gameOver = false;
    msgEl.innerHTML = 'Click or press <strong>Space</strong> to start';
    scoreEl.textContent = "0";
    msgEl.style.display = "block";
    lastPipe = performance.now();
  }

  // --- Spawn Pipe ---
  function spawnPipe(){
    const margin = 60;
    const min = margin + PIPE_GAP/2;
    const max = H - margin - PIPE_GAP/2;
    const center = Math.random() * (max - min) + min;

    pipes.push({ x: W + 20, center });
  }

  // --- Flap ---
  function flap(){
    if (gameOver) return;
    bird.vy = FLAP;
    sndFlap.currentTime = 0;
    sndFlap.play();
    running = true;
    msgEl.style.display = "none";
  }

  // --- Update Movement ---
  function update(dt){
    if (!running) return;

    bird.vy += GRAVITY;
    bird.y += bird.vy;

    bird.angle = Math.max(-0.5, Math.min(1.1, bird.vy * 0.035));

    // Pipes
    const now = performance.now();
    if (now - lastPipe > PIPE_TIME){
      spawnPipe();
      lastPipe = now;
    }

    pipes.forEach(p => p.x -= PIPE_SPEED * (dt / 16.6));
    pipes = pipes.filter(p => p.x > -PIPE_W);

    // Score + collisions
    pipes.forEach(p => {
      if (!p.scored && p.x + PIPE_W < bird.x - BIRD_R){
        p.scored = true;
        score++;
        sndPoint.play();
        scoreEl.textContent = score;
      }

      const gapTop = p.center - PIPE_GAP/2;
      const gapBottom = p.center + PIPE_GAP/2;

      if (bird.x + BIRD_R > p.x && bird.x - BIRD_R < p.x + PIPE_W){
        if (bird.y - BIRD_R < gapTop || bird.y + BIRD_R > gapBottom){
          endGame();
        }
      }
    });

    if (bird.y + BIRD_R > H || bird.y - BIRD_R < 0){
      endGame();
    }
  }

  // --- End Game ---
  function endGame(){
    if (gameOver) return;
    gameOver = true;
    running = false;

    sndHit.play();

    best = Math.max(best, score);
    msgEl.innerHTML = `<div class="game-over">
        <strong>Game Over</strong><br>
        Press <strong>R</strong> to restart
      </div>`;
    msgEl.style.display = "block";
    scoreEl.textContent = `${score}  (best: ${best})`;
  }

  // --- Render Everything ---
  function draw(){
    ctx.clearRect(0,0,W,H);

    // Ground
    ctx.fillStyle = "#5aa0ff";
    ctx.fillRect(0, H - 48, W, 48);

    // Pipes
    pipes.forEach(p=>{
      const top = p.center - PIPE_GAP/2;
      const bottom = p.center + PIPE_GAP/2;

      ctx.fillStyle = "#2d7a3d";
      ctx.fillRect(p.x, 0, PIPE_W, top);
      ctx.fillRect(p.x, bottom, PIPE_W, H - bottom - 48);

      ctx.fillStyle = "#144d20";
      ctx.fillRect(p.x, top - 6, PIPE_W, 6);
      ctx.fillRect(p.x, bottom, PIPE_W, 6);
    });

    // Bird
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.angle);

    ctx.beginPath();
    ctx.fillStyle = "#ffd24d";
    ctx.arc(0,0,BIRD_R,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.arc(6,-4,3,0,Math.PI*2); ctx.fill();

    ctx.fillStyle = "#ff6b2f";
    ctx.beginPath();
    ctx.moveTo(-BIRD_R/2, 2);
    ctx.lineTo(BIRD_R, 0);
    ctx.lineTo(-BIRD_R/2, 10);
    ctx.fill();

    ctx.restore();
  }

  // --- Main Loop ---
  function loop(t){
    const dt = t - lastTime;
    lastTime = t;

    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  // --- Input ---
  window.addEventListener("keydown", e=>{
    if (e.code === "Space") { e.preventDefault(); flap(); }
    if (e.key.toLowerCase() === "r" && gameOver) reset();
  });

  canvas.addEventListener("mousedown", flap);
  canvas.addEventListener("touchstart", e => { e.preventDefault(); flap(); });

  reset();
  requestAnimationFrame(loop);
})();
 r   