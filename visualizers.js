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
    'Пиковый Эквалайзер', 'Жидкая волна', 'Двойная спираль ДНК',
    'Стрелочные VU-метры', 'Synthwave Grid 80s', 'Метаболы',
    'Сверхмассивная Чёрная Нора', 'Киберпанк Воксели', 'Мандельброт-Мандельбро',
    'Нейросеть', 'Цифровой Глитч'
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
  eqPeaks: [],
  fluidPoints: [],
  dnaPhase: 0,
  vuLeft: 0,
  vuRight: 0,
  gridOffset: 0,
  metaballs: [],
  blackHoleParticles: [],
  blackHoleAccretion: [],
  cyberBuildings: [],
  cyberInit: false,
  fractalTree: [],
  fractalTimer: 0,
  neuralNodes: [],
  neuralInit: false,
  glitchOffset: 0,
  glitchBlocks: [],

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
    this.eqPeaks = new Array(32).fill(0);
    this.fluidPoints = new Array(12).fill(0).map((_, i) => i / 11);
    this.metaballs = new Array(5).fill(0).map(() => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.01,
      vy: (Math.random() - 0.5) * 0.01,
      r: 0.1 + Math.random() * 0.15
    }));
    this.blackHoleAccretion = new Array(60).fill(0).map((_, i) => ({
      angle: Math.random() * Math.PI * 2,
      dist: 0.1 + Math.random() * 0.4,
      speed: 0.002 + Math.random() * 0.004,
      size: 1 + Math.random() * 3
    }));
    this.blackHoleParticles = [];
    this.fractalTree = [];
    this.glitchBlocks = [];
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
      () => this.drawEqualizerPeaks(w, h), () => this.drawFluidWave(w, h),
      () => this.drawDNA(w, h), () => this.drawVuMeter(w, h),
      () => this.draw3DGrid(w, h), () => this.drawMetaballs(w, h),
      () => this.drawBlackHole(w, h), () => this.drawCyberpunkCity(w, h),
      () => this.drawAudioFractal(w, h), () => this.drawNeuralNetwork(w, h),
      () => this.drawGlitchCore(w, h)
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

  drawEqualizerPeaks(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const barCount = 32;
    const step = Math.floor(this.freqData.length / barCount);
    const barWidth = w / barCount;
    const maxBarH = h * 0.75;
    const bass = this.average(this.freqData, 0, 10) / 255;
    for (let i = 0; i < barCount; i++) {
      const v = this.freqData[i * step] / 255;
      const barH = v * maxBarH;
      const x = i * barWidth + 2;
      const y = h - barH - 20;
      const hue = (i / barCount) * 280 + 120;
      ctx.fillStyle = `hsl(${hue},100%,50%)`;
      ctx.shadowColor = `hsl(${hue},100%,50%)`;
      ctx.shadowBlur = 6;
      ctx.fillRect(x, y, barWidth - 4, barH);
      const peakY = y - this.eqPeaks[i] * maxBarH * 0.15;
      ctx.fillStyle = `hsl(${hue},100%,80%)`;
      ctx.fillRect(x, peakY, barWidth - 4, 3 * (w / 1000));
      const targetPeak = v;
      if (targetPeak > this.eqPeaks[i]) {
        this.eqPeaks[i] = targetPeak;
      } else {
        this.eqPeaks[i] -= 0.008 + bass * 0.005;
        if (this.eqPeaks[i] < 0) this.eqPeaks[i] = 0;
      }
    }
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

  drawMetaballs(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 20) / 255;
    const mid = this.average(this.freqData, 20, 80) / 255;
    const scale = w / 1000;
    this.metaballs.forEach((b, i) => {
      const freqIdx = Math.floor((i / this.metaballs.length) * this.freqData.length);
      const v = this.freqData[freqIdx] / 255;
      b.x += b.vx * (1 + v * 2);
      b.y += b.vy * (1 + v * 2);
      b.r = (0.1 + v * 0.15) * (1 + bass * 0.5);
      if (b.x < 0.05 || b.x > 0.95) b.vx *= -1;
      if (b.y < 0.05 || b.y > 0.95) b.vy *= -1;
    });
    const res = 3;
    const cols = Math.ceil(w / res);
    const rows = Math.ceil(h / res);
    const threshold = 1.0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let sum = 0;
        const px = (x + 0.5) * res;
        const py = (y + 0.5) * res;
        this.metaballs.forEach(b => {
          const bx = b.x * w;
          const by = b.y * h;
          const br = b.r * Math.min(w, h);
          const dx = px - bx;
          const dy = py - by;
          const d2 = dx * dx + dy * dy;
          if (d2 > 0) sum += (br * br) / d2;
        });
        if (sum > threshold) {
          const intensity = Math.min((sum - threshold) * 2, 1);
          const hue = (x / cols) * 60 + 160 + mid * 60;
          ctx.fillStyle = `hsla(${hue},100%,${50 + intensity * 30}%,${0.5 + intensity * 0.5})`;
          ctx.fillRect(x * res, y * res, res, res);
        }
      }
    }
    this.metaballs.forEach((b, i) => {
      const bx = b.x * w;
      const by = b.y * h;
      const br = 4 * scale;
      ctx.beginPath();
      ctx.fillStyle = `hsla(${200 + i * 40},100%,80%,0.8)`;
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    });
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

  drawAudioFractal(w, h) {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const bass = this.average(this.freqData, 0, 20) / 255;
    const treble = this.average(this.freqData, 100, 200) / 255;
    const cx = w / 2, cy = h * 0.85;
    const scale = Math.min(w, h) * 0.25;
    this.fractalTimer += 0.02 + bass * 0.05;
    const drawBranch = (x, y, angle, len, depth, maxDepth) => {
      if (depth > maxDepth || len < 2) return;
      const freqIdx = Math.floor((depth / maxDepth) * this.freqData.length);
      const v = this.freqData[Math.min(freqIdx, this.freqData.length - 1)] / 255;
      const endX = x + Math.cos(angle) * len;
      const endY = y + Math.sin(angle) * len;
      const hue = (depth * 30 + this.fractalTimer * 30 + v * 60) % 360;
      const alpha = 1 - depth / maxDepth;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = `hsla(${hue},100%,${50 + v * 30}%,${alpha})`;
      ctx.shadowColor = `hsl(${hue},100%,60%)`;
      ctx.shadowBlur = 5 * alpha;
      ctx.lineWidth = Math.max(0.5, (maxDepth - depth) * (w / 1500));
      ctx.stroke();
      ctx.shadowBlur = 0;
      const branchAngle = 0.4 + v * 0.3 + Math.sin(this.fractalTimer + depth) * 0.2;
      const shrink = 0.7 + v * 0.1;
      drawBranch(endX, endY, angle - branchAngle, len * shrink, depth + 1, maxDepth);
      drawBranch(endX, endY, angle + branchAngle, len * shrink, depth + 1, maxDepth);
      if (depth === maxDepth && treble > 0.4) {
        ctx.beginPath();
        ctx.arc(endX, endY, 3 * (w / 1000) * treble, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue},100%,80%,${treble})`;
        ctx.fill();
      }
    };
    const maxDepth = 8 + Math.floor(bass * 4);
    drawBranch(cx, cy, -Math.PI / 2, scale, 0, maxDepth);
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
    // Обновление активаций
    this.neuralNodes.forEach(node => {
      const freqIdx = Math.floor((node.layer / 4) * this.freqData.length * 0.5 + (node.idx / 8) * this.freqData.length * 0.5);
      const v = this.freqData[Math.min(freqIdx, this.freqData.length - 1)] / 255;
      node.activation += (v - node.activation) * 0.1;
    });
    // Синапсы
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
    // Узлы
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
    // Базовая сетка-фон
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, w, h);
    // RGB-разделение (Chromatic Aberration)
    const offset = kick ? (Math.random() - 0.5) * 30 * scale : (Math.random() - 0.5) * 5 * scale;
    const cx = w / 2, cy = h / 2;
    const size = Math.min(w, h) * 0.3;
    // Красный канал
    ctx.save();
    ctx.translate(offset, 0);
    ctx.strokeStyle = 'rgba(255,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - size, cy - size, size * 2, size * 2);
    ctx.restore();
    // Синий канал
    ctx.save();
    ctx.translate(-offset, 0);
    ctx.strokeStyle = 'rgba(0,0,255,0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - size, cy - size, size * 2, size * 2);
    ctx.restore();
    // Центральная геометрия
    ctx.strokeStyle = `rgba(255,255,255,${0.3 + bass * 0.7})`;
    ctx.lineWidth = Math.max(1, w / 300);
    ctx.strokeRect(cx - size, cy - size, size * 2, size * 2);
    // Пиксельные блоки
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
    // Смещение сканлайнов
    if (kick) {
      const sy = Math.random() * h;
      const sh = (2 + Math.random() * 10) * scale;
      ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.5})`;
      ctx.fillRect(0, sy, w, sh);
      ctx.fillStyle = `rgba(0,255,255,${0.2 + Math.random() * 0.3})`;
      ctx.fillRect(0, sy + sh * 2, w, sh);
    }
    // Центральный импульс
    if (bass > 0.5) {
      const pulse = bass * size * 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(0,100%,50%,${bass})`;
      ctx.lineWidth = Math.max(2, w / 200);
      ctx.stroke();
    }
    // Диагональные линии глитча
    ctx.strokeStyle = `rgba(255,0,80,${0.1 + bass * 0.3})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = Math.random() * h;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y + (Math.random() - 0.5) * 100);
      ctx.stroke();
    }
    // Текстовый артефакт
    ctx.fillStyle = `rgba(0,255,0,${0.2 + bass * 0.3})`;
    ctx.font = `${14 * scale}px monospace`;
    ctx.fillText('ERR://AUDIO_OVERFLOW', 20 * scale, h - 20 * scale);
    ctx.fillText(`BASS=${bass.toFixed(2)}`, 20 * scale, h - 40 * scale);
  }
};
