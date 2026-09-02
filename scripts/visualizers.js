const SimplexNoise = (function() {
  function Grad(x, y, z) { this.x = x; this.y = y; this.z = z; }
  Grad.prototype.dot2 = function(x, y) { return this.x * x + this.y * y; };
  Grad.prototype.dot3 = function(x, y, z) { return this.x * x + this.y * y + this.z * z; };
  var grad3 = [new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0),
    new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1),
    new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)];
  var p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
  var perm = new Array(512);
  var gradP = new Array(512);
  for (var i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
    gradP[i] = grad3[perm[i] % 12];
  }
  function SimplexNoise(seed) { if (seed) this.seed(seed); }
  SimplexNoise.prototype.seed = function(seed) {
    if (seed > 0 && seed < 1) seed *= 65536;
    seed = Math.floor(seed);
    if (seed < 256) seed |= seed << 8;
    for (var i = 0; i < 256; i++) {
      var v = (i & 1) ? p[i] ^ (seed & 255) : p[i] ^ ((seed >> 8) & 255);
      perm[i] = perm[i + 256] = v;
      gradP[i] = gradP[i + 256] = grad3[v % 12];
    }
  };
  SimplexNoise.prototype.noise2D = function(xin, yin) {
    var n0, n1, n2;
    var F2 = 0.5 * (Math.sqrt(3) - 1);
    var s = (xin + yin) * F2;
    var i = Math.floor(xin + s);
    var j = Math.floor(yin + s);
    var G2 = (3 - Math.sqrt(3)) / 6;
    var t = (i + j) * G2;
    var X0 = i - t;
    var Y0 = j - t;
    var x0 = xin - X0;
    var y0 = yin - Y0;
    var i1, j1;
    if (x0 > y0) { i1 = 1; j1 = 0; } else { i1 = 0; j1 = 1; }
    var x1 = x0 - i1 + G2;
    var y1 = y0 - j1 + G2;
    var x2 = x0 - 1 + 2 * G2;
    var y2 = y0 - 1 + 2 * G2;
    var ii = i & 255;
    var jj = j & 255;
    var gi0 = gradP[ii + perm[jj]];
    var gi1 = gradP[ii + i1 + perm[jj + j1]];
    var gi2 = gradP[ii + 1 + perm[jj + 1]];
    var t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) n0 = 0; else { t0 *= t0; n0 = t0 * t0 * gi0.dot2(x0, y0); }
    var t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) n1 = 0; else { t1 *= t1; n1 = t1 * t1 * gi1.dot2(x1, y1); }
    var t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) n2 = 0; else { t2 *= t2; n2 = t2 * t2 * gi2.dot2(x2, y2); }
    return 70 * (n0 + n1 + n2);
  };
  return SimplexNoise;
})();

const Visualizer = {
  canvas: null,
  ctx: null,
  analyser: null,
  freqData: null,
  timeData: null,
  mode: 0,
  modeNames: [
    'Бары', 'Круговая', 'Осциллограф', 'Частицы', 'Тоннель', 'Калейдоскоп',
    'Спираль', 'Сетка', 'Молнии', 'Плазма', 'Звёзды', 'Вихрь',
    'Огонь Winamp', 'Лазерное шоу', 'Матрица', 'Спирограф',
    'Жидкая волна', 'Двойная спираль ДНК',
    'Стрелочные VU-метры', 'Synthwave Grid 80s',
    'Сверхмассивная Чёрная Нора', 'Киберпанк Воксели',
    'Нейросеть', 'Цифровой Глитч',
    'Аврора', 'Частотные Линии', 'Ритм-Квадраты', 'Компас Частот',
    'Капли Дождя', 'Волны Ряби',
    'Радар', 'Звуковые Волны', 'Плазменный Шар', 'Геометрическая Мандала',
    'Фейерверк', 'Голографическая Пирамида', 'Сердцебиение', 'Термальная Карта',
    'Струны', 'Галактика'
  ],
  particles: [],
  rings: [],
  ringTimer: 0,
  bolts: [],
  plasmaBlobs: [],
  starField: [],
  _running: false,
  fireParticles: [],
  laserShapes: [],
  laserTimer: 0,
  matrixDrops: [],
  matrixInit: false,
  spiroPhase: 0,
  fluidPoints: [],
  dnaPhase: 0,
  vuLeft: 0,
  vuRight: 0,
  gridOffset: 0,
  blackHoleParticles: [],
  blackHoleAccretion: [],
  cyberBuildings: [],
  cyberInit: false,
  neuralNodes: [],
  neuralInit: false,
  glitchOffset: 0,
  glitchBlocks: [],
  rainDrops: [],
  rippleRings: [],
  compassBass: 0,
  compassMid: 0,
  compassTreble: 0,
  noise: new SimplexNoise(),
  radarDots: [],
  radarAngle: 0,
  fireworks: [],
  hologramPhase: 0,
  heartbeatPhase: 0,
  thermalGrid: [],
  thermalInit: false,
  stringPlucks: [],
  galaxyStars: [],
  galaxyInit: false,

  init(canvas, analyser) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.analyser = analyser;
    this.freqData = new Uint8Array(analyser.frequencyBinCount);
    this.timeData = new Uint8Array(analyser.fftSize);
    this.resize();
    this._initState();
  },

  _initState() {
    this.fluidPoints = new Array(12).fill(0).map((_, i) => i / 11);
    this.blackHoleAccretion = new Array(60).fill(0).map((_, i) => ({
      angle: Math.random() * Math.PI * 2,
      dist: 0.1 + Math.random() * 0.4,
      speed: 0.002 + Math.random() * 0.004,
      size: 1 + Math.random() * 3
    }));
    this.blackHoleParticles = [];
    this.glitchBlocks = [];
    this.radarDots = [];
    this.fireworks = [];
    this.thermalGrid = [];
    this.thermalInit = false;
    this.stringPlucks = new Array(12).fill(0);
    this.galaxyStars = [];
    this.galaxyInit = false;
  },

  get modeName() {
    return this.modeNames[this.mode];
  },

  nextMode() {
    this.mode = (this.mode + 1) % this.modeNames.length;
    return this.modeName;
  },

  start() {
    if (this._running) return;
    this._running = true;
    this._loop();
  },

  stop() {
    this._running = false;
  },

  resize() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
  },

  _loop() {
    if (!this._running) return;
    requestAnimationFrame(() => this._loop());
    this.draw();
  },

  average(arr, start, end) {
    let sum = 0;
    for (let i = start; i < end; i++) sum += arr[i];
    return sum / (end - start);
  },

  draw() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(5,5,10,0.22)';
    ctx.fillRect(0, 0, w, h);
    if (!this.analyser) return;
    const drawers = [
      () => this.drawBars(w, h), () => this.drawCircular(w, h),
      () => this.drawWave(w, h), () => this.drawParticles(w, h),
      () => this.drawTunnel(w, h), () => this.drawKaleido(w, h),
      () => this.drawSpiral(w, h), () => this.drawGrid(w, h),
      () => this.drawLightning(w, h), () => this.drawPlasma(w, h),
      () => this.drawStars(w, h), () => this.drawVortex(w, h),
      () => this.drawRetroFire(w, h), () => this.drawLaserShow(w, h),
      () => this.drawMatrixRain(w, h), () => this.drawSpirograph(w, h),
      () => this.drawFluidWave(w, h),
      () => this.drawDNA(w, h), () => this.drawVuMeter(w, h),
      () => this.draw3DGrid(w, h),
      () => this.drawBlackHole(w, h), () => this.drawCyberpunkCity(w, h),
      () => this.drawNeuralNetwork(w, h), () => this.drawGlitchCore(w, h),
      () => this.drawAurora(w, h), () => this.drawFreqLines(w, h),
      () => this.drawRhythmSquares(w, h), () => this.drawCompass(w, h),
      () => this.drawRainDrops(w, h), () => this.drawRipple(w, h),
      () => this.drawRadar(w, h), () => this.drawSoundWaves(w, h),
      () => this.drawPlasmaBall(w, h), () => this.drawMandala(w, h),
      () => this.drawFireworks(w, h), () => this.drawHologram(w, h),
      () => this.drawHeartbeat(w, h), () => this.drawThermal(w, h),
      () => this.drawStrings(w, h), () => this.drawGalaxy(w, h)
    ];
    drawers[this.mode]();
  },

  drawBars(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const barCount = 64;
    const step = Math.floor(this.freqData.length / barCount);
    const barWidth = w / barCount;
    const midY = h / 2;
    for (let i = 0; i < barCount; i++) {
      const v = this.freqData[i * step] / 255;
      const barH = v * (h * 0.42);
      const hue = (i / barCount) * 280 + (Date.now() / 30 % 360);
      ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
      ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
      ctx.shadowBlur = 10;
      const x = i * barWidth + 2;
      ctx.fillRect(x, midY - barH, barWidth - 4, barH);
      ctx.fillRect(x, midY, barWidth - 4, barH * 0.6);
    }
    ctx.shadowBlur = 0;
  },

  drawCircular(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const cx = w / 2, cy = h / 2;
    const baseRadius = Math.min(w, h) * 0.16;
    const bars = 90;
    const step = Math.floor(this.freqData.length / bars);
    for (let i = 0; i < bars; i++) {
      const v = this.freqData[i * step] / 255;
      const angle = (i / bars) * Math.PI * 2;
      const len = baseRadius * 0.4 + v * baseRadius * 2.2;
      const x1 = cx + Math.cos(angle) * baseRadius;
      const y1 = cy + Math.sin(angle) * baseRadius;
      const x2 = cx + Math.cos(angle) * (baseRadius + len);
      const y2 = cy + Math.sin(angle) * (baseRadius + len);
      const hue = (i / bars) * 360 + (Date.now() / 20 % 360);
      ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
      ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
      ctx.shadowBlur = 12;
      ctx.lineWidth = Math.max(2, w / 400);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  },

  drawWave(w, h) {
    this.analyser.getByteTimeDomainData(this.timeData);
    const ctx = this.ctx;
    const midY = h / 2;
    ctx.lineWidth = Math.max(2, w / 500);
    ctx.strokeStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    const slice = w / this.timeData.length;
    let x = 0;
    for (let i = 0; i < this.timeData.length; i++) {
      const v = this.timeData[i] / 128 - 1;
      const y = midY + v * (h * 0.38);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      x += slice;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  },

  drawParticles(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 24) / 255;
    const cx = w / 2, cy = h / 2;
    if (bass > 0.45) {
      for (let i = 0; i < 4; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (2 + bass * 14) * (w / 1000);
        this.particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          hue: Math.random() * 360,
          size: (3 + bass * 10) * (w / 1000)
        });
      }
    }
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.012;
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue},100%,60%,${Math.max(p.life, 0)})`;
      ctx.shadowColor = `hsl(${p.hue},100%,60%)`;
      ctx.shadowBlur = 12;
      ctx.arc(p.x, p.y, Math.max(p.size * p.life, 0), 0, Math.PI * 2);
      ctx.fill();
    });
    this.particles = this.particles.filter(p => p.life > 0);
    ctx.shadowBlur = 0;
  },

  drawTunnel(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const mid = this.average(this.freqData, 20, 90) / 255;
    this.ringTimer++;
    if (this.ringTimer > 5) {
      this.ringTimer = 0;
      this.rings.push({
        r: 10,
        hue: (Date.now() / 10) % 360,
        width: (2 + mid * 8) * (w / 1000)
      });
    }
    const cx = w / 2, cy = h / 2;
    const maxR = Math.hypot(w, h) / 2;
    this.rings.forEach(ring => {
      ring.r += (4 + mid * 18) * (w / 1000);
      ctx.beginPath();
      ctx.strokeStyle = `hsla(${ring.hue},100%,60%,${Math.max(1 - ring.r / maxR, 0)})`;
      ctx.shadowColor = `hsl(${ring.hue},100%,60%)`;
      ctx.shadowBlur = 18;
      ctx.lineWidth = ring.width;
      ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
      ctx.stroke();
    });
    this.rings = this.rings.filter(r => r.r < maxR);
    ctx.shadowBlur = 0;
  },

  drawKaleido(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const cx = w / 2, cy = h / 2;
    const segments = 8;
    const barsPerSeg = 20;
    const step = Math.floor(this.freqData.length / barsPerSeg);
    const maxLen = Math.min(w, h) * 0.44;
    for (let s = 0; s < segments; s++) {
      const segAngle = (s / segments) * Math.PI * 2;
      for (let i = 0; i < barsPerSeg; i++) {
        const v = this.freqData[i * step] / 255;
        const angle = segAngle + (i / barsPerSeg) * (Math.PI * 2 / segments);
        const len = 20 + v * maxLen;
        const x1 = cx + Math.cos(angle) * 20;
        const y1 = cy + Math.sin(angle) * 20;
        const x2 = cx + Math.cos(angle) * len;
        const y2 = cy + Math.sin(angle) * len;
        const hue = (s * 45 + i * 4 + Date.now() / 15) % 360;
        ctx.strokeStyle = `hsl(${hue},100%,60%)`;
        ctx.shadowColor = `hsl(${hue},100%,60%)`;
        ctx.shadowBlur = 8;
        ctx.lineWidth = Math.max(2, w / 500);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
    ctx.shadowBlur = 0;
  },

  drawSpiral(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const cx = w / 2, cy = h / 2;
    const arms = 4;
    const points = 80;
    const step = Math.floor(this.freqData.length / points);
    const maxR = Math.min(w, h) * 0.48;
    const rot = Date.now() / 2000;
    for (let a = 0; a < arms; a++) {
      ctx.beginPath();
      for (let i = 0; i < points; i++) {
        const v = this.freqData[i * step] / 255;
        const t = i / points;
        const angle = rot + a * (Math.PI * 2 / arms) + t * Math.PI * 4;
        const r = t * maxR * (0.5 + v * 0.9);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      const hue = (a * 90 + Date.now() / 20) % 360;
      ctx.strokeStyle = `hsl(${hue},100%,60%)`;
      ctx.shadowColor = `hsl(${hue},100%,60%)`;
      ctx.shadowBlur = 14;
      ctx.lineWidth = Math.max(2, w / 450);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  },

  drawGrid(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const cols = 16;
    const rows = 10;
    const cellW = w / cols;
    const cellH = h / rows;
    const bass = this.average(this.freqData, 0, 20) / 255;
    const mid = this.average(this.freqData, 20, 80) / 255;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = Math.floor(((x + y * cols) / (cols * rows)) * this.freqData.length);
        const v = this.freqData[idx] / 255;
        const scale = 0.3 + v * 0.7 + bass * 0.2;
        const cx = (x + 0.5) * cellW;
        const cy = (y + 0.5) * cellH;
        const size = Math.min(cellW, cellH) * 0.35 * scale;
        const hue = (x * 20 + y * 30 + Date.now() / 25) % 360;
        ctx.fillStyle = `hsla(${hue},100%,55%,${0.3 + v * 0.7})`;
        ctx.shadowColor = `hsl(${hue},100%,55%)`;
        ctx.shadowBlur = 8 + mid * 12;
        ctx.beginPath();
        ctx.arc(cx, cy, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.shadowBlur = 0;
  },

  drawLightning(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 18) / 255;
    const cx = w / 2, cy = h / 2;
    if (bass > 0.55 && Math.random() < 0.35) {
      const angle = Math.random() * Math.PI * 2;
      const len = Math.min(w, h) * (0.25 + bass * 0.4);
      this.bolts.push({
        x: cx, y: cy,
        angle, len,
        life: 1,
        hue: 180 + Math.random() * 120,
        segs: 6 + Math.floor(Math.random() * 5)
      });
    }
    this.bolts.forEach(b => {
      b.life -= 0.04;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      let px = b.x, py = b.y;
      const segLen = b.len / b.segs;
      for (let i = 0; i < b.segs; i++) {
        const jitter = (Math.random() - 0.5) * 40 * (w / 1000);
        const a = b.angle + (Math.random() - 0.5) * 0.6;
        px += Math.cos(a) * segLen + jitter;
        py += Math.sin(a) * segLen + jitter;
        ctx.lineTo(px, py);
      }
      ctx.strokeStyle = `hsla(${b.hue},100%,70%,${Math.max(b.life, 0)})`;
      ctx.shadowColor = `hsl(${b.hue},100%,70%)`;
      ctx.shadowBlur = 20;
      ctx.lineWidth = Math.max(1.5, w / 600) * b.life;
      ctx.stroke();
    });
    this.bolts = this.bolts.filter(b => b.life > 0);
    ctx.shadowBlur = 0;
  },

  drawPlasma(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 24) / 255;
    const mid = this.average(this.freqData, 24, 100) / 255;
    const cx = w / 2, cy = h / 2;
    if (this.plasmaBlobs.length < 12) {
      this.plasmaBlobs.push({
        x: cx + (Math.random() - 0.5) * w * 0.6,
        y: cy + (Math.random() - 0.5) * h * 0.6,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        baseR: 30 + Math.random() * 50,
        hue: Math.random() * 360,
        phase: Math.random() * Math.PI * 2
      });
    }
    this.plasmaBlobs.forEach(b => {
      b.x += b.vx * (1 + mid * 3);
      b.y += b.vy * (1 + mid * 3);
      b.phase += 0.05;
      if (b.x < 0 || b.x > w) b.vx *= -1;
      if (b.y < 0 || b.y > h) b.vy *= -1;
      const r = b.baseR * (0.6 + bass * 0.8 + Math.sin(b.phase) * 0.2) * (w / 1000);
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
      g.addColorStop(0, `hsla(${b.hue},100%,65%,0.55)`);
      g.addColorStop(0.5, `hsla(${(b.hue + 40) % 360},100%,50%,0.25)`);
      g.addColorStop(1, `hsla(${b.hue},100%,40%,0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
      ctx.fill();
    });
  },

  drawStars(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 20) / 255;
    const treble = this.average(this.freqData, 100, 200) / 255;
    if (this.starField.length < 80) {
      for (let i = 0; i < 80 - this.starField.length; i++) {
        this.starField.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: Math.random(),
          hue: Math.random() * 360
        });
      }
    }
    const cx = w / 2, cy = h / 2;
    this.starField.forEach(s => {
      s.z -= 0.004 + bass * 0.02;
      if (s.z <= 0) {
        s.x = Math.random() * w;
        s.y = Math.random() * h;
        s.z = 1;
        s.hue = Math.random() * 360;
      }
      const sx = cx + (s.x - cx) / s.z;
      const sy = cy + (s.y - cy) / s.z;
      const size = (1 - s.z) * 4 * (1 + treble) * (w / 1000);
      ctx.beginPath();
      ctx.fillStyle = `hsla(${s.hue},100%,70%,${1 - s.z})`;
      ctx.shadowColor = `hsl(${s.hue},100%,70%)`;
      ctx.shadowBlur = 8;
      ctx.arc(sx, sy, Math.max(size, 0.5), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  },

  drawVortex(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const cx = w / 2, cy = h / 2;
    const layers = 6;
    const points = 48;
    const step = Math.floor(this.freqData.length / points);
    const maxR = Math.min(w, h) * 0.46;
    const rot = Date.now() / 1500;
    for (let L = 0; L < layers; L++) {
      const layerR = maxR * ((L + 1) / layers);
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const v = this.freqData[(i % points) * step] / 255;
        const t = i / points;
        const angle = rot * (1 + L * 0.3) + t * Math.PI * 2 + L * 0.4;
        const r = layerR * (0.7 + v * 0.5);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      const hue = (L * 55 + Date.now() / 18) % 360;
      ctx.strokeStyle = `hsla(${hue},100%,60%,${0.4 + (layers - L) * 0.1})`;
      ctx.shadowColor = `hsl(${hue},100%,60%)`;
      ctx.shadowBlur = 10;
      ctx.lineWidth = Math.max(1.5, w / 500);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  },

  drawRetroFire(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 20) / 255;
    const cols = 80;
    const rows = 40;
    const cellW = w / cols;
    const cellH = h / rows;
    const baseH = Math.floor(rows * (0.3 + bass * 0.7));
    const time = Date.now() / 200;
    for (let x = 0; x < cols; x++) {
      const noise = Math.sin(x * 0.3 + time) * 0.3 + Math.sin(x * 0.7 - time * 1.3) * 0.2;
      const colH = Math.floor(baseH * (0.7 + noise * 0.3));
      for (let y = 0; y < colH; y++) {
        const ty = y / colH;
        const flicker = Math.random() * 0.15;
        let r, g, b;
        if (ty < 0.2) { r = 255; g = 255 - ty * 500; b = 100; }
        else if (ty < 0.5) { r = 255; g = 150 + (0.5 - ty) * 300; b = 50; }
        else { r = 255 * (1 - ty); g = 80 * (1 - ty); b = 20; }
        const alpha = (1 - ty) * 0.8 + flicker;
        ctx.fillStyle = `rgba(${Math.min(255, r)},${Math.min(255, g)},${Math.min(255, b)},${alpha})`;
        ctx.fillRect(x * cellW, h - (y + 1) * cellH, cellW + 1, cellH + 1);
      }
    }
  },

  drawLaserShow(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 18) / 255;
    const cx = w / 2, cy = h / 2;
    this.laserTimer++;
    if (bass > 0.5 && this.laserTimer > 3) {
      this.laserTimer = 0;
      const shapes = ['triangle', 'diamond', 'star', 'hex'];
      this.laserShapes.push({
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        hue: Math.random() * 360,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.15,
        scale: 0.1 + Math.random() * 0.3,
        life: 1,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        x: cx, y: cy
      });
    }
    this.laserShapes.forEach(s => {
      s.rot += s.rotSpeed * (1 + bass * 2);
      s.x += s.vx;
      s.y += s.vy;
      s.life -= 0.015;
      const alpha = Math.max(s.life, 0);
      const size = Math.min(w, h) * s.scale * alpha;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      ctx.strokeStyle = `hsla(${s.hue},100%,70%,${alpha})`;
      ctx.shadowColor = `hsl(${s.hue},100%,70%)`;
      ctx.shadowBlur = 20 * alpha;
      ctx.lineWidth = Math.max(1.5, w / 500);
      ctx.beginPath();
      if (s.shape === 'triangle') {
        for (let i = 0; i < 3; i++) {
          const a = i * Math.PI * 2 / 3 - Math.PI / 2;
          const px = Math.cos(a) * size;
          const py = Math.sin(a) * size;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
      } else if (s.shape === 'diamond') {
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.7, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size * 0.7, 0);
      } else if (s.shape === 'star') {
        for (let i = 0; i < 10; i++) {
          const a = i * Math.PI / 5 - Math.PI / 2;
          const r = i % 2 === 0 ? size : size * 0.4;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
      } else {
        for (let i = 0; i < 6; i++) {
          const a = i * Math.PI / 3;
          const px = Math.cos(a) * size;
          const py = Math.sin(a) * size;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    });
    this.laserShapes = this.laserShapes.filter(s => s.life > 0);
    ctx.shadowBlur = 0;
  },

  drawMatrixRain(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const treble = this.average(this.freqData, 100, 200) / 255;
    const mid = this.average(this.freqData, 40, 100) / 255;
    const cols = Math.floor(w / 18);
    const fontSize = 16 * (w / 1000);
    ctx.font = `${fontSize}px monospace`;
    if (!this.matrixInit || this.matrixDrops.length !== cols) {
      this.matrixDrops = new Array(cols).fill(0).map(() => Math.random() * h);
      this.matrixInit = true;
    }
    for (let i = 0; i < cols; i++) {
      const speed = (1 + treble * 3 + Math.random() * 0.5) * fontSize;
      this.matrixDrops[i] += speed;
      if (this.matrixDrops[i] > h) this.matrixDrops[i] = -fontSize;
      const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ01アイウエオカキクケコ';
      const char = chars[Math.floor(Math.random() * chars.length)];
      const flash = Math.random() < mid * 0.3;
      const green = flash ? 255 : 120 + Math.random() * 100;
      const alpha = 0.5 + mid * 0.5;
      ctx.fillStyle = `rgba(0,${green},${flash ? 200 : 50},${alpha})`;
      ctx.shadowColor = `rgba(0,${green},50,0.5)`;
      ctx.shadowBlur = flash ? 10 : 0;
      ctx.fillText(char, i * 18 * (w / 1000), this.matrixDrops[i]);
    }
    ctx.shadowBlur = 0;
  },

  drawSpirograph(w, h) {
    this.analyser.getByteTimeDomainData(this.timeData);
    const ctx = this.ctx;
    const cx = w / 2, cy = h / 2;
    const scale = Math.min(w, h) * 0.35;
    this.spiroPhase += 0.02;
    const a = 3 + Math.sin(this.spiroPhase) * 1.5;
    const b = 2 + Math.cos(this.spiroPhase * 0.7) * 1;
    const delta = this.spiroPhase * 0.5;
    ctx.beginPath();
    const steps = 800;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps * Math.PI * 2;
      const sampleIdx = Math.floor((i / steps) * this.timeData.length);
      const wave = (this.timeData[sampleIdx] / 128 - 1) * 0.3;
      const x = cx + scale * Math.sin(a * t + delta + wave) * Math.cos(b * t);
      const y = cy + scale * Math.sin(a * t + delta + wave) * Math.sin(b * t);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    const hue = (this.spiroPhase * 50) % 360;
    ctx.strokeStyle = `hsl(${hue},100%,60%)`;
    ctx.shadowColor = `hsl(${hue},100%,60%)`;
    ctx.shadowBlur = 15;
    ctx.lineWidth = Math.max(1.5, w / 600);
    ctx.stroke();
    ctx.shadowBlur = 0;
  },

  drawFluidWave(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 20) / 255;
    const mid = this.average(this.freqData, 20, 80) / 255;
    const cx = w / 2, cy = h / 2;
    const radius = Math.min(w, h) * 0.3 * (1 + bass * 0.4);
    const time = Date.now() / 1000;
    ctx.beginPath();
    const points = 12;
    const coords = [];
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const sampleIdx = Math.floor((i / points) * this.freqData.length);
      const v = this.freqData[sampleIdx] / 255;
      const wave = Math.sin(angle * 3 + time * 2) * 0.1 + v * 0.3 + mid * 0.2;
      const r = radius * (1 + wave);
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      coords.push({x, y});
    }
    ctx.moveTo((coords[0].x + coords[coords.length - 1].x) / 2,
               (coords[0].y + coords[coords.length - 1].y) / 2);
    for (let i = 0; i < coords.length; i++) {
      const next = coords[(i + 1) % coords.length];
      const midX = (coords[i].x + next.x) / 2;
      const midY = (coords[i].y + next.y) / 2;
      ctx.quadraticCurveTo(coords[i].x, coords[i].y, midX, midY);
    }
    ctx.closePath();
    const hue = (time * 30) % 360;
    ctx.fillStyle = `hsla(${hue},100%,55%,0.25)`;
    ctx.strokeStyle = `hsl(${hue},100%,65%)`;
    ctx.shadowColor = `hsl(${hue},100%,65%)`;
    ctx.shadowBlur = 20;
    ctx.lineWidth = Math.max(2, w / 400);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
  },

  drawDNA(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 20) / 255;
    const cx = w / 2, cy = h / 2;
    const scale = Math.min(w, h) * 0.35;
    this.dnaPhase += 0.03 + bass * 0.05;
    const pairs = 20;
    const pairH = (h * 0.7) / pairs;
    const startY = cy - (pairs * pairH) / 2;
    for (let i = 0; i < pairs; i++) {
      const y = startY + i * pairH;
      const t = i / pairs;
      const angle1 = this.dnaPhase + t * Math.PI * 4;
      const angle2 = angle1 + Math.PI;
      const x1 = cx + Math.cos(angle1) * scale * 0.4;
      const x2 = cx + Math.cos(angle2) * scale * 0.4;
      const z1 = Math.sin(angle1);
      const z2 = Math.sin(angle2);
      const size1 = (0.5 + z1 * 0.5) * 8 * (w / 1000);
      const size2 = (0.5 + z2 * 0.5) * 8 * (w / 1000);
      const alpha1 = 0.4 + z1 * 0.6;
      const alpha2 = 0.4 + z2 * 0.6;
      const freqIdx = Math.floor(t * this.freqData.length);
      const v = this.freqData[freqIdx] / 255;
      const bridgeAlpha = v * alpha1 * alpha2;
      if (bridgeAlpha > 0.1) {
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = `hsla(${200 + v * 60},100%,70%,${bridgeAlpha})`;
        ctx.lineWidth = Math.max(1, w / 800) * (0.5 + v);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.fillStyle = `hsla(${160 + t * 80},100%,60%,${alpha1})`;
      ctx.shadowColor = `hsl(${160 + t * 80},100%,60%)`;
      ctx.shadowBlur = 10 * alpha1;
      ctx.arc(x1, y, size1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = `hsla(${280 + t * 60},100%,60%,${alpha2})`;
      ctx.shadowColor = `hsl(${280 + t * 60},100%,60%)`;
      ctx.shadowBlur = 10 * alpha2;
      ctx.arc(x2, y, size2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  },

  drawVuMeter(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const leftVal = this.average(this.freqData, 0, 30) / 255;
    const rightVal = this.average(this.freqData, 30, 60) / 255;
    const scale = w / 1000;
    this.vuLeft += (leftVal - this.vuLeft) * 0.15;
    this.vuRight += (rightVal - this.vuRight) * 0.15;
    const drawMeter = (cx, cy, val, label) => {
      const radius = 80 * scale;
      const startAngle = Math.PI * 0.75;
      const endAngle = Math.PI * 2.25;
      const needleAngle = startAngle + val * (endAngle - startAngle);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 8 * scale;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, startAngle + (endAngle - startAngle) * 0.6);
      ctx.strokeStyle = '#0f0';
      ctx.lineWidth = 6 * scale;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle + (endAngle - startAngle) * 0.6,
              startAngle + (endAngle - startAngle) * 0.85);
      ctx.strokeStyle = '#ff0';
      ctx.lineWidth = 6 * scale;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle + (endAngle - startAngle) * 0.85, endAngle);
      ctx.strokeStyle = '#f00';
      ctx.lineWidth = 6 * scale;
      ctx.stroke();
      for (let i = 0; i <= 10; i++) {
        const a = startAngle + (endAngle - startAngle) * (i / 10);
        const x1 = cx + Math.cos(a) * (radius - 12 * scale);
        const y1 = cy + Math.sin(a) * (radius - 12 * scale);
        const x2 = cx + Math.cos(a) * (radius - 4 * scale);
        const y2 = cy + Math.sin(a) * (radius - 4 * scale);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2 * scale;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(needleAngle) * (radius - 15 * scale),
                 cy + Math.sin(needleAngle) * (radius - 15 * scale));
      ctx.strokeStyle = '#fff';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 5;
      ctx.lineWidth = 3 * scale;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 5 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#aaa';
      ctx.font = `${12 * scale}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(label, cx, cy + radius + 20 * scale);
    };
    drawMeter(w * 0.3, h * 0.5, this.vuLeft, 'LEFT');
    drawMeter(w * 0.7, h * 0.5, this.vuRight, 'RIGHT');
  },

  draw3DGrid(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 20) / 255;
    const mid = this.average(this.freqData, 20, 80) / 255;
    const horizon = h * 0.55;
    const fov = 300 * (w / 1000);
    this.gridOffset = (this.gridOffset + 2 + bass * 8) % 40;
    ctx.fillStyle = `hsla(${280 + bass * 40},80%,10%,0.3)`;
    ctx.fillRect(0, 0, w, h);
    const sunY = horizon - 20 * (w / 1000);
    const sunG = ctx.createLinearGradient(w * 0.4, sunY - 30, w * 0.6, sunY + 30);
    sunG.addColorStop(0, `hsla(${320 + bass * 20},100%,70%,0)`);
    sunG.addColorStop(0.5, `hsla(${340 + bass * 20},100%,60%,${0.3 + bass * 0.4})`);
    sunG.addColorStop(1, `hsla(${320 + bass * 20},100%,70%,0)`);
    ctx.fillStyle = sunG;
    ctx.fillRect(0, sunY - 30, w, 60);
    ctx.strokeStyle = `hsla(${180 + mid * 60},100%,60%,0.6)`;
    ctx.shadowColor = `hsl(${180 + mid * 60},100%,60%)`;
    ctx.shadowBlur = 8;
    ctx.lineWidth = Math.max(1, w / 800);
    for (let i = -10; i <= 10; i++) {
      ctx.beginPath();
      const x = w / 2 + i * 60 * (w / 1000);
      ctx.moveTo(x, horizon);
      const vanishX = w / 2;
      const vanishY = horizon - fov;
      ctx.lineTo(vanishX + (x - vanishX) * 0.02, vanishY);
      ctx.stroke();
    }
    for (let i = 0; i < 15; i++) {
      const z = i * 40 + this.gridOffset;
      const y = horizon + fov * 200 / (z + 50);
      if (y > h) continue;
      const alpha = Math.max(0, 1 - z / 600);
      ctx.strokeStyle = `hsla(${180 + mid * 60},100%,60%,${alpha * 0.6})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    const bars = 16;
    for (let i = 0; i < bars; i++) {
      const freqIdx = Math.floor((i / bars) * 60);
      const v = this.freqData[freqIdx] / 255;
      const barH = v * 80 * (w / 1000);
      const x = w / 2 + (i - bars / 2) * 30 * (w / 1000);
      const y = horizon - barH;
      ctx.fillStyle = `hsla(${200 + i * 10},100%,60%,${0.4 + v * 0.6})`;
      ctx.fillRect(x - 8 * (w / 1000), y, 16 * (w / 1000), barH);
    }
    ctx.shadowBlur = 0;
  },

  drawBlackHole(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 20) / 255;
    const mid = this.average(this.freqData, 20, 100) / 255;
    const cx = w / 2, cy = h / 2;
    const scale = Math.min(w, h) * 0.4;
    const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 2);
    bgGrad.addColorStop(0, `rgba(0,0,0,${0.3 + bass * 0.3})`);
    bgGrad.addColorStop(0.3, `rgba(5,0,15,${0.15 + bass * 0.1})`);
    bgGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);
    this.blackHoleAccretion.forEach(p => {
      p.angle += p.speed * (1 + bass * 3);
      p.dist = Math.max(0.08, p.dist - 0.0003);
      const r = p.dist * scale;
      const x = cx + Math.cos(p.angle) * r;
      const y = cy + Math.sin(p.angle) * r * 0.3;
      const alpha = Math.min(1, p.dist * 2) * (0.5 + mid * 0.5);
      const hue = (p.angle * 50 + Date.now() / 20) % 360;
      const size = p.size * (w / 1000) * (1 + bass);
      ctx.beginPath();
      ctx.fillStyle = `hsla(${hue},100%,70%,${alpha})`;
      ctx.shadowColor = `hsl(${hue},100%,70%)`;
      ctx.shadowBlur = 10 * alpha;
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    });
    if (bass > 0.4) {
      for (let side = -1; side <= 1; side += 2) {
        const jetLen = bass * scale * 1.5;
        const grad = ctx.createLinearGradient(cx, cy, cx, cy + side * jetLen);
        grad.addColorStop(0, `hsla(200,100%,80%,${bass * 0.8})`);
        grad.addColorStop(0.5, `hsla(220,100%,60%,${bass * 0.4})`);
        grad.addColorStop(1, 'hsla(240,100%,40%,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(cx - 3 * (w / 1000), cy, 6 * (w / 1000), side * jetLen);
      }
    }
    if (Math.random() < 0.3 + bass * 0.5) {
      const angle = Math.random() * Math.PI * 2;
      const startDist = 1.5 + Math.random();
      this.blackHoleParticles.push({
        angle, dist: startDist,
        speed: 0.005 + Math.random() * 0.01,
        hue: Math.random() * 60 + 300,
        size: 2 + Math.random() * 3
      });
    }
    this.blackHoleParticles.forEach(p => {
      p.dist -= p.speed * (1 + bass * 2);
      p.angle += p.speed * 2;
      const r = p.dist * scale;
      const x = cx + Math.cos(p.angle) * r;
      const y = cy + Math.sin(p.angle) * r * 0.3;
      const alpha = Math.min(1, p.dist);
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue},100%,70%,${alpha})`;
      ctx.shadowColor = `hsl(${p.hue},100%,70%)`;
      ctx.shadowBlur = 8;
      ctx.arc(x, y, p.size * (w / 1000) * alpha, 0, Math.PI * 2);
      ctx.fill();
    });
    this.blackHoleParticles = this.blackHoleParticles.filter(p => p.dist > 0.08);
    ctx.beginPath();
    ctx.arc(cx, cy, scale * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,0,0,${0.9 + bass * 0.1})`;
    ctx.fill();
    ctx.strokeStyle = `hsla(280,100%,60%,${0.5 + bass * 0.5})`;
    ctx.lineWidth = Math.max(1, w / 500);
    ctx.stroke();
    ctx.shadowBlur = 0;
  },

  drawCyberpunkCity(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 20) / 255;
    const mid = this.average(this.freqData, 20, 100) / 255;
    const scale = w / 1000;
    if (!this.cyberInit || this.cyberBuildings.length === 0) {
      this.cyberBuildings = [];
      const count = 20;
      for (let i = 0; i < count; i++) {
        this.cyberBuildings.push({
          x: (i / count) + (Math.random() - 0.5) * 0.02,
          baseW: 0.03 + Math.random() * 0.04,
          baseH: 0.2 + Math.random() * 0.4,
          hue: Math.random() > 0.5 ? 320 + Math.random() * 40 : 180 + Math.random() * 40,
          windows: Math.floor(Math.random() * 8) + 3
        });
      }
      this.cyberInit = true;
    }
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#050510');
    sky.addColorStop(0.5, `hsla(${280 + bass * 20},60%,15%,1)`);
    sky.addColorStop(1, `hsla(${260 + mid * 20},50%,20%,1)`);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    ctx.beginPath();
    ctx.arc(w * 0.8, h * 0.15, 40 * scale, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${340 + bass * 20},100%,70%,0.3)`;
    ctx.shadowColor = `hsl(${340 + bass * 20},100%,70%)`;
    ctx.shadowBlur = 30;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, h * 0.7, w, h * 0.3);
    [...this.cyberBuildings].sort((a, b) => b.baseH - a.baseH).forEach(b => {
      const bw = b.baseW * w;
      const bh = b.baseH * h * (0.8 + bass * 0.4);
      const bx = b.x * w - bw / 2;
      const by = h * 0.7 - bh;
      ctx.fillStyle = `hsla(${b.hue},60%,10%,0.9)`;
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = `hsla(${b.hue},100%,60%,0.8)`;
      ctx.shadowColor = `hsl(${b.hue},100%,60%)`;
      ctx.shadowBlur = 10;
      ctx.lineWidth = Math.max(1, w / 800);
      ctx.strokeRect(bx, by, bw, bh);
      ctx.shadowBlur = 0;
      for (let wi = 0; wi < b.windows; wi++) {
        const wx = bx + bw * 0.2 + (Math.random() * 0.6) * bw;
        const wy = by + bh * 0.1 + (wi / b.windows) * bh * 0.8;
        const ww = bw * 0.15;
        const wh = bh * 0.08;
        const lit = Math.random() < mid + 0.2;
        ctx.fillStyle = lit ? `hsla(${b.hue},100%,70%,0.9)` : `hsla(${b.hue},30%,30%,0.3)`;
        if (lit) {
          ctx.shadowColor = `hsl(${b.hue},100%,70%)`;
          ctx.shadowBlur = 5;
        }
        ctx.fillRect(wx, wy, ww, wh);
        ctx.shadowBlur = 0;
      }
    });
    if (mid > 0.3) {
      ctx.strokeStyle = `hsla(200,100%,70%,${mid * 0.3})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 30; i++) {
        const rx = Math.random() * w;
        const ry = Math.random() * h;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 10 * scale, ry + 30 * scale);
        ctx.stroke();
      }
    }
  },

  drawNeuralNetwork(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 20) / 255;
    const mid = this.average(this.freqData, 20, 100) / 255;
    const scale = w / 1000;
    if (!this.neuralInit || this.neuralNodes.length === 0) {
      this.neuralNodes = [];
      const layers = 5;
      const nodesPerLayer = [4, 6, 8, 6, 4];
      for (let L = 0; L < layers; L++) {
        for (let n = 0; n < nodesPerLayer[L]; n++) {
          this.neuralNodes.push({
            x: 0.15 + (L / (layers - 1)) * 0.7,
            y: 0.2 + (n / (nodesPerLayer[L] - 1 || 1)) * 0.6,
            layer: L,
            idx: n,
            activation: 0
          });
        }
      }
      this.neuralInit = true;
    }
    this.neuralNodes.forEach(node => {
      const freqIdx = Math.floor((node.layer / 4) * this.freqData.length * 0.5 + (node.idx / 8) * this.freqData.length * 0.5);
      const v = this.freqData[Math.min(freqIdx, this.freqData.length - 1)] / 255;
      node.activation += (v - node.activation) * 0.1;
    });
    ctx.lineWidth = Math.max(0.5, w / 2000);
    for (let i = 0; i < this.neuralNodes.length; i++) {
      const n1 = this.neuralNodes[i];
      for (let j = 0; j < this.neuralNodes.length; j++) {
        const n2 = this.neuralNodes[j];
        if (n2.layer !== n1.layer + 1) continue;
        const pulse = (n1.activation + n2.activation) / 2;
        if (pulse < 0.15) continue;
        const x1 = n1.x * w;
        const y1 = n1.y * h;
        const x2 = n2.x * w;
        const y2 = n2.y * h;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        const hue = 200 + pulse * 100;
        ctx.strokeStyle = `hsla(${hue},100%,60%,${pulse * 0.6})`;
        ctx.shadowColor = `hsl(${hue},100%,60%)`;
        ctx.shadowBlur = pulse * 8;
        ctx.stroke();
      }
    }
    this.neuralNodes.forEach(node => {
      const nx = node.x * w;
      const ny = node.y * h;
      const size = (4 + node.activation * 12) * scale;
      const hue = 200 + node.activation * 120;
      ctx.beginPath();
      ctx.fillStyle = `hsla(${hue},100%,${40 + node.activation * 40}%,${0.3 + node.activation * 0.7})`;
      ctx.shadowColor = `hsl(${hue},100%,60%)`;
      ctx.shadowBlur = 10 * node.activation;
      ctx.arc(nx, ny, size, 0, Math.PI * 2);
      ctx.fill();
      if (node.activation > 0.6) {
        ctx.beginPath();
        ctx.fillStyle = `hsla(${hue},100%,90%,${node.activation})`;
        ctx.arc(nx, ny, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.shadowBlur = 0;
  },

  drawGlitchCore(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 20) / 255;
    const kick = bass > 0.6;
    const scale = w / 1000;
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, w, h);
    const offset = kick ? (Math.random() - 0.5) * 30 * scale : (Math.random() - 0.5) * 5 * scale;
    const cx = w / 2, cy = h / 2;
    const size = Math.min(w, h) * 0.3;
    ctx.save();
    ctx.translate(offset, 0);
    ctx.strokeStyle = 'rgba(255,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - size, cy - size, size * 2, size * 2);
    ctx.restore();
    ctx.save();
    ctx.translate(-offset, 0);
    ctx.strokeStyle = 'rgba(0,0,255,0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - size, cy - size, size * 2, size * 2);
    ctx.restore();
    ctx.strokeStyle = `rgba(255,255,255,${0.3 + bass * 0.7})`;
    ctx.lineWidth = Math.max(1, w / 300);
    ctx.strokeRect(cx - size, cy - size, size * 2, size * 2);
    if (kick || Math.random() < 0.1) {
      for (let i = 0; i < 5 + bass * 10; i++) {
        const bx = Math.random() * w;
        const by = Math.random() * h;
        const bw = (10 + Math.random() * 50) * scale;
        const bh = (5 + Math.random() * 20) * scale;
        const hue = Math.random() * 360;
        ctx.fillStyle = `hsla(${hue},100%,60%,${0.5 + Math.random() * 0.5})`;
        ctx.fillRect(bx, by, bw, bh);
      }
    }
    if (kick) {
      const sy = Math.random() * h;
      const sh = (2 + Math.random() * 10) * scale;
      ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.5})`;
      ctx.fillRect(0, sy, w, sh);
      ctx.fillStyle = `rgba(0,255,255,${0.2 + Math.random() * 0.3})`;
      ctx.fillRect(0, sy + sh * 2, w, sh);
    }
    if (bass > 0.5) {
      const pulse = bass * size * 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(0,100%,50%,${bass})`;
      ctx.lineWidth = Math.max(2, w / 200);
      ctx.stroke();
    }
    ctx.strokeStyle = `rgba(255,0,80,${0.1 + bass * 0.3})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = Math.random() * h;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y + (Math.random() - 0.5) * 100);
      ctx.stroke();
    }
    ctx.fillStyle = `rgba(0,255,0,${0.2 + bass * 0.3})`;
    ctx.font = `${14 * scale}px monospace`;
    ctx.fillText('ERR://AUDIO_OVERFLOW', 20 * scale, h - 20 * scale);
    ctx.fillText(`BASS=${bass.toFixed(2)}`, 20 * scale, h - 40 * scale);
  },

  drawAurora(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const mid = this.average(this.freqData, 10, 100) / 255;
    const time = Date.now() / 1400;
    const bands = 4;
    for (let b = 0; b < bands; b++) {
      const baseY = h * (0.15 + b * 0.15);
      const hue = 140 + b * 40 + mid * 40;
      ctx.beginPath();
      const points = 24;
      for (let i = 0; i <= points; i++) {
        const t = i / points;
        const x = t * w;
        const idx = Math.floor(t * this.freqData.length * 0.4);
        const v = this.freqData[idx] / 255;
        const y = baseY + Math.sin(t * Math.PI * 3 + time + b) * (40 + v * 60) * (h / 1000);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.lineTo(w, 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fillStyle = `hsla(${hue},90%,55%,${0.08 + mid * 0.1})`;
      ctx.fill();
    }
  },

  drawFreqLines(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const lines = 5;
    const points = 32;
    for (let L = 0; L < lines; L++) {
      const bandStart = Math.floor((L / lines) * this.freqData.length * 0.5);
      const bandEnd = Math.floor(((L + 1) / lines) * this.freqData.length * 0.5);
      const baseY = h * (0.2 + L * 0.15);
      const hue = (L * 60 + Date.now() / 40) % 360;
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const t = i / points;
        const idx = bandStart + Math.floor(t * (bandEnd - bandStart));
        const v = this.freqData[Math.min(idx, this.freqData.length - 1)] / 255;
        const x = t * w;
        const y = baseY - v * h * 0.12;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `hsla(${hue},100%,60%,0.8)`;
      ctx.shadowColor = `hsl(${hue},100%,60%)`;
      ctx.shadowBlur = 6;
      ctx.lineWidth = Math.max(1.5, w / 600);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  },

  drawRhythmSquares(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const cols = 8, rows = 5;
    const cellW = w / cols, cellH = h / rows;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = Math.floor(((x + y * cols) / (cols * rows)) * this.freqData.length);
        const v = this.freqData[idx] / 255;
        const pad = cellW * 0.08;
        const scale = 0.5 + v * 0.5;
        const wSize = (cellW - pad * 2) * scale;
        const hSize = (cellH - pad * 2) * scale;
        const cx = x * cellW + cellW / 2;
        const cy = y * cellH + cellH / 2;
        const hue = (x * 30 + y * 40) % 360;
        ctx.fillStyle = `hsla(${hue},90%,55%,${0.25 + v * 0.6})`;
        ctx.fillRect(cx - wSize / 2, cy - hSize / 2, wSize, hSize);
      }
    }
  },

  drawCompass(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 20) / 255;
    const mid = this.average(this.freqData, 20, 100) / 255;
    const treble = this.average(this.freqData, 100, 220) / 255;
    this.compassBass += (bass - this.compassBass) * 0.2;
    this.compassMid += (mid - this.compassMid) * 0.2;
    this.compassTreble += (treble - this.compassTreble) * 0.2;
    const cx = w / 2, cy = h / 2;
    const radius = Math.min(w, h) * 0.35;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = Math.max(1, w / 700);
    ctx.stroke();
    const arms = [
      { val: this.compassBass, hue: 0, rot: 0 },
      { val: this.compassMid, hue: 130, rot: Math.PI * 2 / 3 },
      { val: this.compassTreble, hue: 220, rot: Math.PI * 4 / 3 }
    ];
    const t = Date.now() / 4000;
    arms.forEach(arm => {
      const angle = t + arm.rot;
      const len = radius * (0.2 + arm.val * 0.8);
      const x2 = cx + Math.cos(angle) * len;
      const y2 = cy + Math.sin(angle) * len;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `hsla(${arm.hue},100%,60%,0.9)`;
      ctx.shadowColor = `hsl(${arm.hue},100%,60%)`;
      ctx.shadowBlur = 10;
      ctx.lineWidth = Math.max(2, w / 250);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x2, y2, Math.max(3, w / 200), 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${arm.hue},100%,70%)`;
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  },

  drawRainDrops(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const treble = this.average(this.freqData, 100, 220) / 255;
    if (this.rainDrops.length < 60 && Math.random() < 0.3 + treble * 0.6) {
      this.rainDrops.push({
        x: Math.random() * w,
        y: -10,
        speed: (4 + Math.random() * 6) * (h / 1000),
        hue: 190 + Math.random() * 60,
        size: 2 + Math.random() * 3
      });
    }
    this.rainDrops.forEach(d => {
      d.y += d.speed * (1 + treble * 2);
      ctx.beginPath();
      ctx.fillStyle = `hsla(${d.hue},100%,70%,0.8)`;
      ctx.shadowColor = `hsl(${d.hue},100%,70%)`;
      ctx.shadowBlur = 6;
      ctx.arc(d.x, d.y, d.size * (w / 1000), 0, Math.PI * 2);
      ctx.fill();
    });
    this.rainDrops = this.rainDrops.filter(d => d.y < h + 10);
    ctx.shadowBlur = 0;
  },

  drawRipple(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 24) / 255;
    if (bass > 0.5 && this.rippleRings.length < 6 && Math.random() < 0.5) {
      this.rippleRings.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 4,
        hue: Math.random() * 360,
        life: 1
      });
    }
    this.rippleRings.forEach(r => {
      r.r += (3 + bass * 8) * (w / 1000);
      r.life -= 0.02;
      ctx.beginPath();
      ctx.strokeStyle = `hsla(${r.hue},100%,65%,${Math.max(r.life, 0)})`;
      ctx.lineWidth = Math.max(1.5, w / 400) * Math.max(r.life, 0);
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
    });
    this.rippleRings = this.rippleRings.filter(r => r.life > 0);
  },

  drawRadar(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 20) / 255;
    const cx = w / 2, cy = h / 2;
    const radius = Math.min(w, h) * 0.4;
    const scale = w / 1000;
    ctx.strokeStyle = 'rgba(0,255,100,0.3)';
    ctx.lineWidth = Math.max(1, scale);
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * (i / 4), 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
      ctx.stroke();
    }
    this.radarAngle += 0.02 + bass * 0.03;
    const sweepA = this.radarAngle;
    const grad = ctx.createConicGradient(sweepA, cx, cy);
    grad.addColorStop(0, 'rgba(0,255,100,0)');
    grad.addColorStop(0.7, 'rgba(0,255,100,0)');
    grad.addColorStop(1, 'rgba(0,255,100,0.4)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    if (bass > 0.4 && Math.random() < 0.3) {
      const a = Math.random() * Math.PI * 2;
      const d = 0.2 + Math.random() * 0.7;
      this.radarDots.push({ x: cx + Math.cos(a) * radius * d, y: cy + Math.sin(a) * radius * d, life: 1 });
    }
    this.radarDots.forEach(d => {
      d.life -= 0.02;
      ctx.beginPath();
      ctx.fillStyle = `rgba(0,255,100,${Math.max(d.life, 0)})`;
      ctx.arc(d.x, d.y, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
    });
    this.radarDots = this.radarDots.filter(d => d.life > 0);
  },

  drawSoundWaves(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 20) / 255;
    const mid = this.average(this.freqData, 20, 100) / 255;
    const time = Date.now() / 1000;
    const waves = 6;
    for (let i = 0; i < waves; i++) {
      const baseY = h * (0.3 + (i / waves) * 0.4);
      const hue = (i / waves) * 180 + 160;
      const freqIdx = Math.floor((i / waves) * this.freqData.length * 0.5);
      const v = this.freqData[freqIdx] / 255;
      ctx.beginPath();
      ctx.strokeStyle = `hsla(${hue},100%,60%,${0.4 + v * 0.6})`;
      ctx.shadowColor = `hsl(${hue},100%,60%)`;
      ctx.shadowBlur = 8;
      ctx.lineWidth = Math.max(1.5, w / 500);
      for (let x = 0; x <= w; x += 4) {
        const t = x / w;
        const wave = Math.sin(t * Math.PI * 4 + time * 3 + i) * (20 + v * 40 + bass * 30) * (h / 1000);
        const y = baseY + wave + Math.sin(t * Math.PI * 8 - time * 2) * (10 + mid * 20) * (h / 1000);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  },

  drawPlasmaBall(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 20) / 255;
    const mid = this.average(this.freqData, 20, 100) / 255;
    const cx = w / 2, cy = h / 2;
    const radius = Math.min(w, h) * 0.3;
    const scale = w / 1000;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
    g.addColorStop(0, `hsla(200,100%,50%,${0.1 + bass * 0.2})`);
    g.addColorStop(0.5, `hsla(240,100%,40%,${0.05 + mid * 0.1})`);
    g.addColorStop(1, 'hsla(260,100%,20%,0)');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = `hsla(200,100%,70%,${0.2 + bass * 0.3})`;
    ctx.lineWidth = Math.max(1, scale);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    const bolts = 5 + Math.floor(bass * 8);
    for (let i = 0; i < bolts; i++) {
      const angle = (i / bolts) * Math.PI * 2 + Date.now() / 1000;
      const innerR = radius * 0.15;
      const outerR = radius * (0.6 + Math.random() * 0.4);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
      const segs = 4 + Math.floor(Math.random() * 4);
      for (let s = 1; s <= segs; s++) {
        const t = s / segs;
        const a = angle + (Math.random() - 0.5) * 0.8;
        const r = innerR + (outerR - innerR) * t;
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      ctx.strokeStyle = `hsla(${180 + i * 30},100%,70%,${0.5 + bass * 0.5})`;
      ctx.shadowColor = `hsl(${180 + i * 30},100%,70%)`;
      ctx.shadowBlur = 12;
      ctx.lineWidth = Math.max(1, w / 600);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,240,255,${0.6 + bass * 0.4})`;
    ctx.fill();
  },

  drawMandala(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 20) / 255;
    const cx = w / 2, cy = h / 2;
    const maxR = Math.min(w, h) * 0.45;
    const time = Date.now() / 3000;
    const layers = 5;
    for (let L = 0; L < layers; L++) {
      const sides = 6 + L * 2;
      const r = maxR * ((L + 1) / layers);
      const rot = time * (1 + L * 0.3);
      ctx.beginPath();
      for (let i = 0; i <= sides; i++) {
        const a = rot + (i / sides) * Math.PI * 2;
        const freqIdx = Math.floor((L / layers) * this.freqData.length);
        const v = this.freqData[freqIdx] / 255;
        const rr = r * (1 + v * 0.2);
        const x = cx + Math.cos(a) * rr;
        const y = cy + Math.sin(a) * rr;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      const hue = (L * 60 + Date.now() / 20) % 360;
      ctx.strokeStyle = `hsla(${hue},100%,60%,${0.3 + bass * 0.3})`;
      ctx.shadowColor = `hsl(${hue},100%,60%)`;
      ctx.shadowBlur = 10;
      ctx.lineWidth = Math.max(1, w / 600);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  },

  drawFireworks(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 20) / 255;
    const cx = w / 2, cy = h / 2;
    const scale = w / 1000;
    if (bass > 0.5) {
      const count = 15 + Math.floor(bass * 20);
      const hue = Math.random() * 360;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (2 + Math.random() * 6) * scale;
        this.fireworks.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          hue,
          size: (2 + Math.random() * 3) * scale
        });
      }
    }
    this.fireworks.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05 * scale;
      p.life -= 0.015;
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue},100%,70%,${Math.max(p.life, 0)})`;
      ctx.shadowColor = `hsl(${p.hue},100%,70%)`;
      ctx.shadowBlur = 8;
      ctx.arc(p.x, p.y, p.size * Math.max(p.life, 0), 0, Math.PI * 2);
      ctx.fill();
    });
    this.fireworks = this.fireworks.filter(p => p.life > 0);
    ctx.shadowBlur = 0;
  },

  drawHologram(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 20) / 255;
    const mid = this.average(this.freqData, 20, 100) / 255;
    const cx = w / 2, cy = h / 2;
    const scale = Math.min(w, h) * 0.25;
    const s = w / 1000;
    this.hologramPhase += 0.02 + bass * 0.03;
    const pts = [];
    for (let i = 0; i < 4; i++) {
      const a = this.hologramPhase + (i / 4) * Math.PI * 2;
      pts.push({ x: cx + Math.cos(a) * scale, y: cy + Math.sin(a) * scale * 0.6 - scale * 0.5 });
    }
    ctx.strokeStyle = `hsla(180,100%,60%,${0.4 + bass * 0.4})`;
    ctx.shadowColor = 'hsl(180,100%,60%)';
    ctx.shadowBlur = 15;
    ctx.lineWidth = Math.max(1, w / 500);
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[1].x, pts[1].y);
    ctx.lineTo(pts[2].x, pts[2].y);
    ctx.lineTo(pts[3].x, pts[3].y);
    ctx.closePath();
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const base = pts[i];
      const top = { x: cx + (base.x - cx) * 0.3, y: cy - scale };
      ctx.beginPath();
      ctx.moveTo(base.x, base.y);
      ctx.lineTo(top.x, top.y);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(pts[0].x + (pts[2].x - pts[0].x) * 0.3, pts[0].y - scale * 0.7);
    ctx.lineTo(pts[1].x + (pts[3].x - pts[1].x) * 0.3, pts[1].y - scale * 0.7);
    ctx.lineTo(pts[2].x + (pts[0].x - pts[2].x) * 0.3, pts[2].y - scale * 0.7);
    ctx.lineTo(pts[3].x + (pts[1].x - pts[3].x) * 0.3, pts[3].y - scale * 0.7);
    ctx.closePath();
    ctx.strokeStyle = `hsla(180,100%,70%,${0.3 + mid * 0.3})`;
    ctx.stroke();
    if (Math.random() < 0.1 + bass * 0.3) {
      const sy = cy - scale + Math.random() * scale * 2;
      ctx.fillStyle = `rgba(0,255,255,${0.1 + Math.random() * 0.2})`;
      ctx.fillRect(0, sy, w, (1 + Math.random() * 3) * s);
    }
    ctx.shadowBlur = 0;
  },

  drawHeartbeat(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 20) / 255;
    const cx = w / 2, cy = h / 2;
    const scale = Math.min(w, h) * 0.35;
    this.heartbeatPhase += 0.05 + bass * 0.1;
    const pulse = 1 + Math.sin(this.heartbeatPhase) * 0.15 * (1 + bass);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(pulse, pulse);
    ctx.beginPath();
    for (let t = 0; t <= Math.PI * 2; t += 0.05) {
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      const px = x * scale / 17;
      const py = y * scale / 17;
      t === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = `hsla(350,100%,55%,${0.4 + bass * 0.4})`;
    ctx.shadowColor = 'hsl(350,100%,60%)';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.strokeStyle = `hsla(350,100%,70%,${0.6 + bass * 0.4})`;
    ctx.lineWidth = Math.max(2, w / 400);
    ctx.stroke();
    ctx.restore();
    ctx.shadowBlur = 0;
  },

  drawThermal(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 20) / 255;
    const mid = this.average(this.freqData, 20, 100) / 255;
    const time = Date.now() / 2000;
    const cols = 40;
    const rows = 30;
    const cellW = w / cols;
    const cellH = h / rows;
    if (!this.thermalInit || this.thermalGrid.length !== cols * rows) {
      this.thermalGrid = new Array(cols * rows).fill(0);
      this.thermalInit = true;
    }
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = x + y * cols;
        const freqIdx = Math.floor((x / cols) * this.freqData.length);
        const v = this.freqData[freqIdx] / 255;
        const n = this.noise.noise2D(x * 0.1 + time, y * 0.1 + time * 0.7);
        const val = (n + 1) * 0.5 * 0.3 + v * 0.5 + bass * 0.2;
        this.thermalGrid[idx] += (val - this.thermalGrid[idx]) * 0.1;
        const t = this.thermalGrid[idx];
        let hue, sat, light;
        if (t < 0.25) { hue = 240; sat = 80; light = 10 + t * 100; }
        else if (t < 0.5) { hue = 180; sat = 90; light = 20 + (t - 0.25) * 120; }
        else if (t < 0.75) { hue = 60; sat = 100; light = 30 + (t - 0.5) * 100; }
        else { hue = 0; sat = 100; light = 40 + (t - 0.75) * 80; }
        ctx.fillStyle = `hsla(${hue},${sat}%,${light}%,${0.5 + mid * 0.3})`;
        ctx.fillRect(x * cellW, y * cellH, cellW + 1, cellH + 1);
      }
    }
  },

  drawStrings(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const strings = 12;
    const cx = w / 2;
    const baseY = h * 0.2;
    const len = h * 0.6;
    const spacing = w / (strings + 1);
    for (let i = 0; i < strings; i++) {
      const freqIdx = Math.floor((i / strings) * this.freqData.length);
      const v = this.freqData[freqIdx] / 255;
      const x = spacing * (i + 1);
      this.stringPlucks[i] += (v - this.stringPlucks[i]) * 0.2;
      const pluck = this.stringPlucks[i];
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      const segs = 20;
      for (let s = 1; s < segs; s++) {
        const t = s / segs;
        const wave = Math.sin(t * Math.PI * 8 + Date.now() / 100) * pluck * 20 * (w / 1000);
        ctx.lineTo(x + wave, baseY + t * len);
      }
      ctx.lineTo(x, baseY + len);
      const hue = (i / strings) * 60 + 300;
      ctx.strokeStyle = `hsla(${hue},100%,70%,${0.3 + pluck * 0.7})`;
      ctx.shadowColor = `hsl(${hue},100%,70%)`;
      ctx.shadowBlur = 4 + pluck * 10;
      ctx.lineWidth = Math.max(1, w / 800) * (1 + pluck);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  },

  drawGalaxy(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 20) / 255;
    const mid = this.average(this.freqData, 20, 100) / 255;
    const cx = w / 2, cy = h / 2;
    const scale = Math.min(w, h) * 0.45;
    if (!this.galaxyInit || this.galaxyStars.length < 200) {
      this.galaxyStars = [];
      for (let i = 0; i < 300; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.pow(Math.random(), 2);
        this.galaxyStars.push({
          angle,
          dist,
          speed: 0.002 + (1 - dist) * 0.008,
          hue: Math.random() * 60 + 200,
          size: 1 + Math.random() * 2
        });
      }
      this.galaxyInit = true;
    }
    this.galaxyStars.forEach(s => {
      s.angle += s.speed * (1 + bass * 2);
      const armOffset = Math.sin(s.dist * Math.PI * 3) * 0.3;
      const a = s.angle + armOffset;
      const r = s.dist * scale;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r * 0.6;
      const alpha = (1 - s.dist) * (0.4 + mid * 0.6);
      ctx.beginPath();
      ctx.fillStyle = `hsla(${s.hue},100%,75%,${alpha})`;
      ctx.shadowColor = `hsl(${s.hue},100%,75%)`;
      ctx.shadowBlur = 6 * alpha;
      ctx.arc(x, y, s.size * (w / 1000), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
    ctx.beginPath();
    const coreR = 8 * (w / 1000) * (1 + bass);
    const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3);
    cg.addColorStop(0, `hsla(50,100%,90%,${0.8 + bass * 0.2})`);
    cg.addColorStop(0.5, `hsla(40,100%,70%,${0.4 + bass * 0.2})`);
    cg.addColorStop(1, 'hsla(30,100%,50%,0)');
    ctx.fillStyle = cg;
    ctx.arc(cx, cy, coreR * 3, 0, Math.PI * 2);
    ctx.fill();
  },

};

const canvas = document.getElementById('canvas');
const modeEl = document.getElementById('mode');
let audioCtx, analyser, source;

async function initAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
  } catch (e) {
    console.warn('Mic access denied, using oscillator fallback');
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    gain.gain.value = 0.1;
    osc.connect(gain);
    gain.connect(analyser);
    osc.start();
  }
  Visualizer.init(canvas, analyser);
  Visualizer.start();
  modeEl.textContent = Visualizer.modeName;
}

document.addEventListener('click', () => {
  if (!audioCtx) {
    initAudio();
  } else {
    Visualizer.nextMode();
    modeEl.textContent = Visualizer.modeName;
  }
});

window.addEventListener('resize', () => Visualizer.resize());
