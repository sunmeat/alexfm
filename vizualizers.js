const Visualizer = {
  canvas: null,
  ctx: null,
  analyser: null,
  freqData: null,
  timeData: null,
  mode: 0,
  modeNames: [
    'Бары', 'Круговая', 'Осциллограф', 'Частицы', 'Тоннель', 'Калейдоскоп',
    'Спираль', 'Сетка', 'Молнии', 'Плазма', 'Звёзды', 'Вихрь'
  ],
  particles: [],
  rings: [],
  ringTimer: 0,
  bolts: [],
  plasmaBlobs: [],
  starField: [],
  _running: false,

  init(canvas, analyser) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.analyser = analyser;
    this.freqData = new Uint8Array(analyser.frequencyBinCount);
    this.timeData = new Uint8Array(analyser.fftSize);
    this.resize();
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
      () => this.drawBars(w, h),
      () => this.drawCircular(w, h),
      () => this.drawWave(w, h),
      () => this.drawParticles(w, h),
      () => this.drawTunnel(w, h),
      () => this.drawKaleido(w, h),
      () => this.drawSpiral(w, h),
      () => this.drawGrid(w, h),
      () => this.drawLightning(w, h),
      () => this.drawPlasma(w, h),
      () => this.drawStars(w, h),
      () => this.drawVortex(w, h)
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
  }
};
