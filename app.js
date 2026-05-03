// ═══════════════════════════════════════════════════════════
//  app.js — Carta para Reboltosa  (optimizado)
// ═══════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────
//  UTILIDAD: resize unificado (debounced, un solo listener)
// ─────────────────────────────────────────────────────────
const resizeCallbacks = [];
let   resizeTimer = null;

addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    resizeCallbacks.forEach(fn => fn());
  }, 120); // 120ms debounce — nadie nota la diferencia en canvas
});

function onResize(fn) { resizeCallbacks.push(fn); fn(); } // registra y ejecuta ya


// ─────────────────────────────────────────────────────────
//  UTILIDAD: pausa global cuando la pestaña va a background
// ─────────────────────────────────────────────────────────
const pausables = []; // { pause, resume }
document.addEventListener('visibilitychange', () => {
  pausables.forEach(p => document.hidden ? p.pause() : p.resume());
});


// ─────────────────────────────────────────────────────────
//  FÁBRICA DE CANVAS DE ESTRELLAS (reutilizable)
//  Retorna { stop } para cancelar el loop cuando ya no se necesita
// ─────────────────────────────────────────────────────────
function makeStarField(canvas, count, color, throttle) {
  // throttle = 1 → 60fps, 2 → 30fps (suficiente para estrellas ambientales)
  const ctx = canvas.getContext('2d', { alpha: true });

  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  onResize(resize);

  const stars = Array.from({ length: count }, () => ({
    x:     Math.random() * canvas.width,
    y:     Math.random() * canvas.height,
    r:     Math.random() * 1.3 + 0.15,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.014 + 0.003,
  }));

  let rafId   = null;
  let running = false;
  let paused  = false;
  let frame   = 0;

  function tick() {
    if (!running) return;
    rafId = requestAnimationFrame(tick);
    frame++;
    if (frame % throttle !== 0) return; // frameskip para 30fps

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.phase += s.speed;
      const a = 0.15 + 0.75 * (0.5 + 0.5 * Math.sin(s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = color.replace('A', a.toFixed(2)); // e.g. "rgba(255,255,255,A)"
      ctx.fill();
    });
  }

  pausables.push({
    pause:  () => { if (running) { cancelAnimationFrame(rafId); rafId = null; paused = true; } },
    resume: () => { if (paused && running) { paused = false; tick(); } },
  });

  return {
    start() { if (!running) { running = true; tick(); } },
    stop()  { running = false; cancelAnimationFrame(rafId); rafId = null;
              ctx.clearRect(0, 0, canvas.width, canvas.height); },
  };
}


// ─────────────────────────────────────────────────────────
//  ESTRELLAS — PANTALLA DE PRIVACIDAD  (80 estrellas, 30fps)
// ─────────────────────────────────────────────────────────
const privacyStars = makeStarField(
  document.getElementById('privacy-stars'), 80, 'rgba(255,255,255,A)', 2
);
privacyStars.start();

document.getElementById('privacy-btn').addEventListener('click', () => {
  const screen = document.getElementById('privacy-screen');
  screen.classList.add('gone');
  privacyStars.stop();
  screen.addEventListener('transitionend', () => screen.remove(), { once: true });
});


// ─────────────────────────────────────────────────────────
//  ESTRELLAS — INTRO  (100 estrellas, 30fps)
// ─────────────────────────────────────────────────────────
const introStars = makeStarField(
  document.getElementById('stars-c'), 100, 'rgba(255,255,255,A)', 2
);
introStars.start();


// ─────────────────────────────────────────────────────────
//  CONFETTI  (solo corre cuando se lanza, se detiene solo)
// ─────────────────────────────────────────────────────────
const cfCanvas = document.getElementById('cf-canvas');
const cfCtx    = cfCanvas.getContext('2d', { alpha: true });
onResize(() => { cfCanvas.width = innerWidth; cfCanvas.height = innerHeight; });

const CF_COLORS = ['#ff6b6b','#ffa36c','#ffd93d','#6bcb77','#4d96ff','#d0a8ff','#ff9ff3','#ffffff','#c9963a','#80ffdb'];
let   cfRafId   = null;
let   particles = [];

function launchConfetti() {
  particles = Array.from({ length: 160 }, () => ({  // 200→160
    x:      Math.random() * innerWidth,
    y:      -15 - Math.random() * 30,
    vx:     (Math.random() - 0.5) * 7,
    vy:     Math.random() * 4.5 + 1.5,
    rot:    Math.random() * 360,
    rv:     (Math.random() - 0.5) * 9,
    w:      Math.random() * 12 + 5,
    h:      Math.random() * 6 + 3,
    color:  CF_COLORS[Math.floor(Math.random() * CF_COLORS.length)],
    alpha:  1,
    gravity: 0.09 + Math.random() * 0.06,
    circle: Math.random() < 0.3,
  }));
  cancelAnimationFrame(cfRafId);
  animateConfetti();
}

function animateConfetti() {
  cfCtx.clearRect(0, 0, cfCanvas.width, cfCanvas.height);
  let alive = false;
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.rot += p.rv;
    if (p.y < cfCanvas.height + 20) {
      alive   = true;
      p.alpha = Math.max(0, p.alpha - 0.0045);
    } else p.alpha = 0;
    if (p.alpha <= 0) continue;
    cfCtx.save();
    cfCtx.translate(p.x, p.y);
    cfCtx.rotate(p.rot * Math.PI / 180);
    cfCtx.globalAlpha = p.alpha;
    cfCtx.fillStyle   = p.color;
    if (p.circle) { cfCtx.beginPath(); cfCtx.arc(0, 0, p.w / 2, 0, Math.PI * 2); cfCtx.fill(); }
    else cfCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    cfCtx.restore();
  }
  if (alive) cfRafId = requestAnimationFrame(animateConfetti);
}


// ─────────────────────────────────────────────────────────
//  BURBUJAS  (CSS puro, ya son GPU-composited)
// ─────────────────────────────────────────────────────────
const BUBBLE_COLORS = ['#ff6b6b','#ffa36c','#ffd93d','#6bcb77','#4d96ff','#d0a8ff','#ff9ff3','#80ffdb'];

function spawnBubbles() {
  const page = document.getElementById('page');
  const frag = document.createDocumentFragment(); // una sola inserción al DOM
  for (let i = 0; i < 18; i++) {                 // 24→18
    const b  = document.createElement('div');
    b.className = 'bub';
    const sz = Math.random() * 10 + 4;
    b.style.cssText = [
      `left:${Math.random() * 100}%`,
      `width:${sz}px`, `height:${sz}px`,
      `background:${BUBBLE_COLORS[i % BUBBLE_COLORS.length]}`,
      `opacity:${(Math.random() * 0.35 + 0.1).toFixed(2)}`,
      `animation-duration:${(Math.random() * 10 + 7).toFixed(1)}s`,
      `animation-delay:${(Math.random() * 7).toFixed(1)}s`,
    ].join(';');
    frag.appendChild(b);
  }
  page.appendChild(frag);
}


// ─────────────────────────────────────────────────────────
//  CARTA — precomputar HTML escapado una sola vez
// ─────────────────────────────────────────────────────────
const FULL_MSG = [
  'SUPER FELIZ CUMPLEAÑOS, REBOLTOSA.',
  '',
  '¡Qué maravilloso día para tener el pelo como un arcoíris! Espero que aún lo tengas así. Seguro que hoy será un gran día para ti; te dije que estaría para apoyarte, en especial hoy, que es un momento tan único por ser tu cumpleaños.',
  '',
  'Mira que me encontré con un asiático que me empezó a hablar en mandarín; solo le entendí que tenía algo para ti. Pensé: "¿Por qué no?" Total, te lo mereces por mantener el primer puesto como experta en monólogos de Megamente.',
  '',
  'Lo siento si en algún momento no pude felicitarte por mensaje el día de hoy; no sé qué estará pasando en la vida del Zannián del futuro. Yo soy el del 16 de abril, mínimo vas a pensar: "Ush, este chino lo tenía planeado hace rato", y sí, sabes cómo soy yo.',
  '',
  'En unos días me van a dejar trabajando como profesor para unos celadores; ahora sí puedes decir que estoy re viejo. Ya no te enrollo más, que siempre me decías que hablaba mucho.',
  '',
  'Ten un lindo día. Espero que tomen muchas fotos, que Zeus no se enloquezca en tu casa y que tus seres queridos te brinden todo el calor de su amor.',
  '',
  'Muchos éxitos con tu futura empresa, señorita Emprendimientos.',
  '',
  'No olvides darte un abrazo a ti misma por lo bien que lo has hecho.',
  '',
  '-Te quiere el estrelloso super ñero ( 💜 ).',
  '',
  '(sí, usé autocorrector para que quedara bonito; lo bueno es que aún tiene mi esencia)',
].join('\n');

const FIRST_LINE_END = FULL_MSG.indexOf('\n');
const FIRST_STYLE    = [
  'font-weight:700','font-size:1.72rem','line-height:2.4rem',
  'display:block','margin-bottom:0.35rem',
  'background:linear-gradient(135deg,#c9963a,#de5a0a)',
  '-webkit-background-clip:text','-webkit-text-fill-color:transparent','background-clip:text',
].join(';');

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// Precomputado una sola vez al cargar
const ESC_FIRST = escHtml(FULL_MSG.substring(0, FIRST_LINE_END));
const ESC_REST  = escHtml(FULL_MSG.substring(FIRST_LINE_END)).replace(/\n/g, '<br>');

// Mapeo fuente-char → REST-html-char (necesario porque \n→<br> alarga el string)
// Se construye una vez: array de posiciones en ESC_REST para cada char fuente
const REST_MAP = (() => {
  const src  = FULL_MSG.substring(FIRST_LINE_END);
  const map  = [0]; // map[i] = cuántos chars html hay antes del i-ésimo char fuente
  let   html = 0;
  for (let i = 0; i < src.length; i++) {
    html += src[i] === '\n' ? 4 : 1; // \n→<br> = 4 chars
    map.push(html);
  }
  return map;
})();

const letterBody = document.getElementById('letter-body');

function setDisplay(n, cursor) {
  const capped  = Math.min(n, FULL_MSG.length);
  const fLen    = Math.min(capped, FIRST_LINE_END);
  const rLen    = Math.max(0, capped - FIRST_LINE_END);
  const first   = ESC_FIRST.substring(0, fLen);
  const rest    = rLen > 0 ? ESC_REST.substring(0, REST_MAP[rLen]) : '';
  const c       = cursor ? '<span class="cursor-blink"></span>' : '';
  letterBody.innerHTML = `<span style="${FIRST_STYLE}">${first}</span>${rest}${c}`;
}


// ─────────────────────────────────────────────────────────
//  AUDIO DE FONDO (carta)
// ─────────────────────────────────────────────────────────
const bgAudio  = document.getElementById('bg-audio');
bgAudio.volume = 0.55;

let audioDone = false;
let typingDone = false;

function checkBothDone() { if (audioDone && typingDone) revealFinalButtons(); }

function hideAudioSkip() {
  const btn = document.getElementById('skip-audio-btn');
  if (btn) btn.classList.add('done');
}

function startAudio() {
  bgAudio.play().catch(() => { audioDone = true; checkBothDone(); hideAudioSkip(); });
}
function skipAudio() {
  if (audioDone) return;
  bgAudio.pause(); bgAudio.currentTime = 0;
  audioDone = true; hideAudioSkip(); checkBothDone();
}

bgAudio.addEventListener('ended', () => { audioDone = true; hideAudioSkip(); checkBothDone(); });
bgAudio.addEventListener('error', () => { audioDone = true; hideAudioSkip(); checkBothDone(); });


// ─────────────────────────────────────────────────────────
//  TYPING — usa setDisplay precomputado
// ─────────────────────────────────────────────────────────
let typingPos    = 0;
let typingActive = false;
let skipNow      = false;

function startTyping() { typingActive = true; skipNow = false; setDisplay(0, true); type(); }

function type() {
  if (skipNow || !typingActive) return;
  if (typingPos >= FULL_MSG.length) {
    typingActive = false;
    setDisplay(FULL_MSG.length, false);
    document.getElementById('skip-btn').style.display = 'none';
    onTypingDone();
    return;
  }
  typingPos++;
  setDisplay(typingPos, true);
  const ch    = FULL_MSG[typingPos - 1];
  const delay = (ch === '.' || ch === ',' || ch === ';') ? 90
              : (ch === '!' || ch === '?')               ? 148
              : ch === '\n'                              ? 215
              : Math.random() * 26 + 16;
  setTimeout(type, delay);
}

function onTypingDone() {
  typingDone = true;
  const sig = document.getElementById('letter-signature');
  if (sig) sig.classList.add('show');
  const cel = document.getElementById('celebration');
  setTimeout(() => { cel.classList.add('show'); setTimeout(launchConfetti, 350); }, 700);
  checkBothDone();
}

function skipAll() {
  if (!typingActive) return;
  skipNow = true; typingActive = false; typingPos = FULL_MSG.length;
  setDisplay(FULL_MSG.length, false);
  document.getElementById('skip-btn').style.display = 'none';
  onTypingDone();
}


// ─────────────────────────────────────────────────────────
//  BOTONES FINALES
// ─────────────────────────────────────────────────────────
function revealFinalButtons() {
  document.getElementById('final-btns').classList.remove('hidden');
}


// ─────────────────────────────────────────────────────────
//  PARTÍCULAS DE TERAPIA  (40 partículas, 30fps)
// ─────────────────────────────────────────────────────────
const therapyCanvas = document.getElementById('therapy-canvas');
const tCtx          = therapyCanvas.getContext('2d', { alpha: true });
onResize(() => { therapyCanvas.width = innerWidth; therapyCanvas.height = innerHeight; });

const T_PARTICLES = Array.from({ length: 40 }, () => ({  // 70→40
  x:     Math.random() * innerWidth,
  y:     Math.random() * innerHeight,
  r:     Math.random() * 1.0 + 0.2,
  vx:    (Math.random() - 0.5) * 0.18,
  vy:    -(Math.random() * 0.22 + 0.06),
  alpha: Math.random() * 0.25 + 0.05,
  phase: Math.random() * Math.PI * 2,
}));

let tRafId      = null;
let tRunning    = false;
let tFrameCount = 0;

pausables.push({
  pause:  () => { cancelAnimationFrame(tRafId); tRafId = null; },
  resume: () => { if (tRunning) animateTherapy(); },
});

function animateTherapy() {
  tRafId = requestAnimationFrame(animateTherapy);
  tFrameCount++;
  if (tFrameCount % 2 !== 0) return; // 30fps

  tCtx.clearRect(0, 0, therapyCanvas.width, therapyCanvas.height);
  for (const p of T_PARTICLES) {
    p.x += p.vx; p.y += p.vy; p.phase += 0.008;
    const a = p.alpha * (0.6 + 0.4 * Math.sin(p.phase));
    if (p.y < -5)                          p.y = therapyCanvas.height + 5;
    if (p.x < -5 || p.x > therapyCanvas.width + 5) p.x = p.x < 0 ? therapyCanvas.width + 5 : -5;
    tCtx.beginPath();
    tCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    tCtx.fillStyle = `rgba(200,190,255,${a.toFixed(2)})`;
    tCtx.fill();
  }
}

function stopTherapyParticles() {
  tRunning = false;
  cancelAnimationFrame(tRafId);
  tRafId = null;
  tCtx.clearRect(0, 0, therapyCanvas.width, therapyCanvas.height);
}


// ─────────────────────────────────────────────────────────
//  SECCIÓN TERAPIA
// ─────────────────────────────────────────────────────────
const VALID_DATE = '2026-01-29';

document.getElementById('btn-therapy').addEventListener('click', () => {
  const therapy = document.getElementById('therapy');
  therapy.classList.add('active');
  // Reset: show warning, hide everything else
  document.getElementById('therapy-warning').style.display = 'flex';
  document.getElementById('therapy-form-wrap').style.display = 'none';
  const textWrap = document.getElementById('therapy-text-wrap');
  textWrap.style.display = 'none';
  textWrap.classList.remove('visible');
  if (!bgAudio.paused) { bgAudio.pause(); bgAudio.currentTime = 0; }
  tRunning = true;
  animateTherapy();
  therapy.scrollTop = 0;
});

// Botón de advertencia → muestra el formulario de fecha
document.getElementById('therapy-warning-btn').addEventListener('click', () => {
  const warning  = document.getElementById('therapy-warning');
  const formWrap = document.getElementById('therapy-form-wrap');
  warning.style.opacity  = '0';
  warning.style.transform = 'translateY(-20px)';
  warning.style.transition = 'opacity 0.6s ease,transform 0.6s ease';
  setTimeout(() => {
    warning.style.display = 'none';
    formWrap.style.display = '';
    formWrap.style.opacity = '0';
    formWrap.style.transform = 'translateY(20px)';
    formWrap.style.transition = 'opacity 0.8s ease,transform 0.8s ease';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      formWrap.style.opacity  = '1';
      formWrap.style.transform = 'translateY(0)';
    }));
  }, 620);
});

document.getElementById('btn-close').addEventListener('click', () => {
  window.close();
  document.body.innerHTML = '<div style="display:flex;height:100vh;align-items:center;justify-content:center;background:#06060f;font-family:Cormorant Garamond,serif;font-style:italic;color:rgba(255,255,255,0.3);font-size:1.2rem;">Puedes cerrar esta pestaña.</div>';
});

document.getElementById('therapy-submit').addEventListener('click', validateDate);
document.getElementById('therapy-date').addEventListener('keydown', e => { if (e.key === 'Enter') validateDate(); });

function validateDate() {
  const input = document.getElementById('therapy-date');
  const error = document.getElementById('therapy-error');
  if (input.value === VALID_DATE) {
    error.classList.add('hidden');
    input.classList.remove('error-shake');
    showTherapyText();
  } else {
    input.classList.remove('error-shake');
    void input.offsetWidth;
    input.classList.add('error-shake');
    error.classList.remove('hidden');
  }
}

function showTherapyText() {
  const formWrap = document.getElementById('therapy-form-wrap');
  formWrap.classList.add('out');
  const textWrap = document.getElementById('therapy-text-wrap');
  setTimeout(() => {
    formWrap.style.display = 'none';
    textWrap.style.display = '';
    textWrap.classList.remove('hidden');
    textWrap.classList.add('visible');
    initParaViewer();
    initMediaPlayer();
    startTherapyAudio();
  }, 500);
}


// ─────────────────────────────────────────────────────────
//  AUDIO DE TERAPIA
// ─────────────────────────────────────────────────────────
const therapyAudio  = new Audio('audio2.mp3');
therapyAudio.loop   = true;
therapyAudio.volume = 0;

function startTherapyAudio() {
  therapyAudio.currentTime = 0;
  therapyAudio.play().catch(() => {});
  let vol = 0;
  const fadeIn = setInterval(() => {
    vol = Math.min(vol + 0.03, 0.55);
    therapyAudio.volume = vol;
    if (vol >= 0.55) clearInterval(fadeIn);
  }, 80);
}


// ─────────────────────────────────────────────────────────
//  LIGHTBOX DE VIDEO (terapia)
// ─────────────────────────────────────────────────────────
function initMediaPlayer() {
  const thumb    = document.getElementById('media-thumb');
  const lightbox = document.getElementById('video-lightbox');
  const video    = document.getElementById('therapy-video');
  const backdrop = document.getElementById('lb-backdrop');
  const closeBtn = document.getElementById('lb-close');

  function openLightbox()  { lightbox.classList.add('open'); video.play().catch(() => {}); }
  function closeLightbox() { lightbox.classList.remove('open'); video.pause(); video.currentTime = 0; }

  thumb.addEventListener('click', openLightbox);
  closeBtn.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); }, { passive: true });
}


// ─────────────────────────────────────────────────────────
//  PÁRRAFOS DE TERAPIA
// ─────────────────────────────────────────────────────────
const EMOTIONAL_PARAGRAPHS = [
  `Esto fue parte de la terapia, y que tú siguieras leyendo te hace <em class="hl">masoquista</em>, eché.`,

  `No sé si vayas a leer esto o si <em class="hl">preferiste olvidarme</em>. Me hubiera gustado decir algo en ese momento, pero me ganó el <em class="hl-key">dolor</em>, acompañado de <em class="hl-key">ira</em> al sentir todo desmoronarse. Sigo confuso; no entiendo cómo pudiste decirme que querías <em class="hl">casarte conmigo</em> y, al día siguiente, <em class="hl-key">cortar la relación</em>. Irónicamente, repetiste conmigo lo que te hicieron a ti.`,

  `Sé que no fui perfecto y que esa última semana fue complicada, pero realmente quería que estuvieras en ese momento tan <em class="hl">vulnerable</em>, así como yo lo estuve para ti antes. Porque sí, estaba <em class="hl">mejorando por ambos</em>, porque tú eras <em class="hl-key">parte de mi futuro</em>. Solo quería que me abrazaras y me dijeras: <em class="hl">"Eres Dios, amor, tú puedes"</em>. Siento que te aburriste de estar conmigo, que querías salir a rumbear y tener experiencias fuertes antes de aceptar que creciste.`,

  `En mis recuerdos suelen aparecer lo que creo que eran tus excusas para terminar conmigo, a las cuales siempre les daba una solución. Ese mismo día, las cartas me dijeron que había <em class="hl-key">alguien más en la relación</em>, con quien decidiste irte. Creo que ya sabes quién pienso que es, porque el día que te dije que me causaba celos y que me encontraba enfermo, preferiste irte con él, y casualmente se quedaron solos los dos. Y más aún cuando, un día de <em class="hl">melancolía</em>, vi tu foto en un espejo lleno de stickers, junto a grafitis, sumado a la conexión de interés que tenían.`,

  `Pero aun así, sabes que soy <em class="hl">necio</em>. Decidí dejar esa duda en el aire, porque <em class="hl-key">la mujer que amo</em> no sería así. Me dolió que traicionaras mi confianza al contar algo tan delicado como mi sentir, cuando te confié eso únicamente a ti. Yo nunca solté palabra sobre tu fragilidad ni sobre tus razones para sentirte agobiada con la vida misma. Todo eso hizo que me llenara de <em class="hl-key">odio</em> hacia ti. Me parecía imposible pensar que quien yo llamaba <em class="hl">mi osita</em> me haría algo así.`,

  `Tus últimas palabras las tomé como el <em class="hl">"típico monólogo de chica"</em>, pero no me dejé caer, porque ya había decidido mejorar. Aun después de todo ese odio, <em class="hl">el fuego se apaga</em>; y fue ahí cuando mi <em class="hl">corazón de pollo</em> ansiaba que un día aparecieras diciéndome que <em class="hl-key">lo sentías</em>.`,

  `Porque tal vez pienses que no, pero <em class="hl-key">realmente te extraño</em>, aun después de lo ocurrido. Es verdad que <em class="hl-key">aún sigo enamorado</em> de tu <em class="hl">sonrisa que enseña tus encías</em>. Aún siento un leve cosquilleo cuando recuerdo tus <em class="hl">ruidosas carcajadas</em>; quedaron plasmados en mí nuestros chistes internos. Todavía vive en mí la emoción de <em class="hl-key">enamorarme de todo tu cuerpo</em> cuando te veía venir a la lejanía, acompañado de ese <em class="hl">saludo de mano errático</em>.`,

  `Y sí, ahora es diferente, porque tal vez, sin quererlo, <em class="hl-key">me lastimaste</em>. Pero sé que los humanos podemos cometer <em class="hl">errores</em>, especialmente con quienes apreciamos. Por esa misma razón es que decido escribir esto, tanto para mí como para ti. Si te parece bien la idea de <em class="hl">enmendar lo que se fracturó</em>, lo único que te pido es una charla sincera para conocer cómo fue tu parte de la historia. Estaré esperando un mensaje entre hoy <em class="hl">27 de junio</em> y mañana <em class="hl">28 de junio</em>; si no llega, lo entenderé como que es mejor mantener la distancia.`,

  `Por eso quiero decirte que <em class="hl-declaration">sí</em>,\n<em class="hl-declaration">aún te amo</em>, <em class="hl-name">Gabriela</em>.`,
];

let currentPara = 0;

function initParaViewer() {
  const total   = EMOTIONAL_PARAGRAPHS.length;
  const dotsEl  = document.getElementById('para-dots');
  const prevBtn = document.getElementById('para-prev');
  const nextBtn = document.getElementById('para-next');

  dotsEl.innerHTML = '';
  const frag = document.createDocumentFragment();
  EMOTIONAL_PARAGRAPHS.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => goTo(i), { passive: true });
    frag.appendChild(d);
  });
  dotsEl.appendChild(frag);

  prevBtn.addEventListener('click', () => goTo(currentPara - 1), { passive: true });
  nextBtn.addEventListener('click', () => goTo(currentPara + 1), { passive: true });

  let touchStartX = 0;
  const stage = document.getElementById('para-stage');
  stage.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) goTo(currentPara + (dx < 0 ? 1 : -1));
  }, { passive: true });

  renderPara(0, false);
}

function goTo(index) {
  if (index < 0 || index >= EMOTIONAL_PARAGRAPHS.length) return;
  const paraEl = document.getElementById('para-text');
  paraEl.classList.add('fade-out');
  setTimeout(() => { currentPara = index; renderPara(index, true); }, 380);
}

function renderPara(index, animated) {
  const total   = EMOTIONAL_PARAGRAPHS.length;
  const paraEl  = document.getElementById('para-text');
  const indexEl = document.getElementById('para-index');
  const prevBtn = document.getElementById('para-prev');
  const nextBtn = document.getElementById('para-next');
  const dotsEl  = document.getElementById('para-dots');

  paraEl.innerHTML  = EMOTIONAL_PARAGRAPHS[index].replace(/\n/g, '<br>');
  paraEl.className  = 'para-text';
  if (index === 0)         paraEl.classList.add('is-intro');
  if (index === total - 1) paraEl.classList.add('is-final');
  if (animated) {
    paraEl.classList.add('fade-in');
    setTimeout(() => paraEl.classList.remove('fade-in'), 600);
  }

  indexEl.textContent = `${index + 1} / ${total}`;
  prevBtn.disabled    = index === 0;
  nextBtn.disabled    = index === total - 1;

  dotsEl.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === index));

  if (index === total - 1) {
    const wrap = document.getElementById('btn-continue-wrap');
    if (wrap) setTimeout(() => wrap.classList.remove('hidden'), 500);
  }
}


// ─────────────────────────────────────────────────────────
//  ESTRELLAS MUSICALES  (80 estrellas, 30fps)
// ─────────────────────────────────────────────────────────
const musicStarField = makeStarField(
  document.getElementById('music-stars'), 80, 'rgba(210,190,255,A)', 2
);


// ─────────────────────────────────────────────────────────
//  BOTÓN CONTINUAR → sección musical
// ─────────────────────────────────────────────────────────
document.getElementById('btn-continue').addEventListener('click', () => {
  // Fade out del audio de terapia
  (function fadeOut() {
    if (therapyAudio.volume > 0.05) {
      therapyAudio.volume = Math.max(0, therapyAudio.volume - 0.06);
      setTimeout(fadeOut, 60);
    } else {
      therapyAudio.pause();
      therapyAudio.currentTime = 0;
      therapyAudio.volume = 0;
    }
  })();

  // Detener partículas de terapia (ya no son visibles)
  stopTherapyParticles();

  const ms      = document.getElementById('music-choice');
  const therapy = document.getElementById('therapy');

  ms.style.opacity       = '0';
  ms.style.pointerEvents = 'none';
  ms.classList.add('active');
  musicStarField.start();

  requestAnimationFrame(() => requestAnimationFrame(() => {
    ms.style.opacity       = '1';
    ms.style.pointerEvents = 'all';
  }));

  setTimeout(() => { therapy.style.display = 'none'; }, 1100);
});


// ─────────────────────────────────────────────────────────
//  REPRODUCTORES DE VIDEOS MUSICALES
// ─────────────────────────────────────────────────────────
function initMusicVideo(videoId, overlayId) {
  const video   = document.getElementById(videoId);
  const overlay = document.getElementById(overlayId);
  const wrap    = overlay.closest('.music-embed-wrap');

  function play() {
    overlay.classList.add('hidden');
    video.controls = true;
    video.play().catch(() => {});
  }

  wrap.addEventListener('click', () => { if (!overlay.classList.contains('hidden')) play(); }, { passive: true });
  video.addEventListener('ended', () => {
    overlay.classList.remove('hidden');
    video.controls    = false;
    video.currentTime = 0;
  });
}

document.getElementById('music-choice').addEventListener('transitionend', function init() {
  initMusicVideo('mv1', 'mv1-overlay');
  initMusicVideo('mv2', 'mv2-overlay');
  this.removeEventListener('transitionend', init);
});


// ─────────────────────────────────────────────────────────
//  SECCIÓN CIERRE — formulario + paginado de odio + imagen final
// ─────────────────────────────────────────────────────────
const CLOSURE_VALID_DATE = '2026-05-02';

// Párrafos con HTML de resaltado (misma estructura que terapia)
const CLOSURE_PARAGRAPHS = [
  // 1 — título + primer párrafo
  `<span style="display:block;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:0.82em;letter-spacing:0.2em;color:rgba(228, 87, 87, 0.93);text-transform:uppercase;margin-bottom:1.2rem;">actualización 2/05/2025 — soy escritor y como escritor te hablaré</span>El día de hoy estaba <em class="cl-hl">feliz</em>, me dije a mi mismo que todo saldría bien, que te abrazaría fuerte y te diría que te cuidaras mucho. Pero apenas te vi supe que <em class="cl-hl-key">la mujer de la cual me enamoré había muerto</em>. Se notaba en tu aspecto físico, en tu manera de actuar y en tu simple presencia. Para empezar, no sé por qué aceptaste la salida si ibas a <em class="cl-hl-key">comportarte conmigo de esa manera</em>, ignorándome en todo momento. Claro que se notó. Me pregunto qué se sentirá tratar como una <em class="cl-hl-fire">basura</em> a una persona que aún después de todo se preocupó porque <em class="cl-hl">te enfermaras por la lluvia</em>.`,

  // 2
  `Créeme que la <em class="cl-hl-key">decepción da lecciones</em>. Créeme que me demostraste lo realmente <em class="cl-hl-fire">dañada</em> que estás, y claro que lo sabía desde que fuimos pareja, pero <em class="cl-hl">quería cuidar y sanar eso de ti</em>. Créeme que esto me duele demasiado, pero…`,

  // 3
  `Si lucifer te mostró el cielo y tú decidiste <em class="cl-hl-key">permanecer en el infierno</em>, entonces no te asustes cuando te encuentres de cara con <em class="cl-hl-fire">satanás</em>. Porque yo ya no voy a permitir que me sigas <em class="cl-hl-key">faltando el respeto</em> de esa forma. Menos mal tú misma te quitaste de tu pedestal para convertirte en <em class="cl-hl-void">una más del montón</em>. Menos mal que tengo el suficiente <em class="cl-hl">amor propio</em> para no tener empatía por ti como tú no la tuviste por mí.`,

  // 4 — coda fría
  `Créeme que esto lo voy a recordar, sabes que cosas podria hacer en contra de ti pero me alegra, <em class="cl-hl-fire">Ser mejor de lo que tu eres</em>.`,
];

let closureCurrentPara = 0;

// — Botón continuar desde la música → cierre
document.getElementById('btn-music-final').addEventListener('click', () => {
  ['mv1','mv2'].forEach(id => {
    const v = document.getElementById(id);
    if (v) { v.pause(); v.currentTime = 0; }
  });
  musicStarField.stop();

  const music   = document.getElementById('music-choice');
  const closure = document.getElementById('closure');

  music.style.transition    = 'opacity 1.2s ease';
  music.style.opacity       = '0';
  music.style.pointerEvents = 'none';

  closure.classList.add('active');
  setTimeout(() => { music.style.display = 'none'; }, 1200);
});

// — Validación de fecha del cierre
document.getElementById('closure-submit').addEventListener('click', validateClosureDate);
document.getElementById('closure-date').addEventListener('keydown', e => {
  if (e.key === 'Enter') validateClosureDate();
});

function validateClosureDate() {
  const input = document.getElementById('closure-date');
  const error = document.getElementById('closure-error');
  if (input.value === CLOSURE_VALID_DATE) {
    error.classList.add('hidden');
    showClosureText();
  } else {
    input.classList.remove('error-shake');
    void input.offsetWidth;
    input.classList.add('error-shake');
    error.classList.remove('hidden');
  }
}

function showClosureText() {
  const formWrap  = document.getElementById('closure-form-wrap');
  const textWrap  = document.getElementById('closure-text-wrap');
  formWrap.style.transition = 'opacity 0.6s ease,transform 0.6s ease';
  formWrap.style.opacity    = '0';
  formWrap.style.transform  = 'translateY(-20px)';
  setTimeout(() => {
    formWrap.style.display = 'none';
    textWrap.classList.remove('hidden');
    textWrap.classList.add('visible');
    initClosureViewer();
  }, 650);
}

// — Visor paginado del texto de odio
function initClosureViewer() {
  const total    = CLOSURE_PARAGRAPHS.length;
  const dotsEl   = document.getElementById('closure-dots');
  const prevBtn  = document.getElementById('closure-prev');
  const nextBtn  = document.getElementById('closure-next');

  dotsEl.innerHTML = '';
  const frag = document.createDocumentFragment();
  CLOSURE_PARAGRAPHS.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'closure-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => closureGoTo(i), { passive: true });
    frag.appendChild(d);
  });
  dotsEl.appendChild(frag);

  prevBtn.addEventListener('click', () => closureGoTo(closureCurrentPara - 1), { passive: true });
  nextBtn.addEventListener('click', () => closureGoTo(closureCurrentPara + 1), { passive: true });

  // Swipe táctil
  let touchStartX = 0;
  const stage = document.getElementById('closure-para-stage');
  stage.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) closureGoTo(closureCurrentPara + (dx < 0 ? 1 : -1));
  }, { passive: true });

  closureRenderPara(0, false);
}

function closureGoTo(index) {
  if (index < 0 || index >= CLOSURE_PARAGRAPHS.length) return;
  const paraEl = document.getElementById('closure-para-text');
  paraEl.classList.add('fade-out');
  setTimeout(() => { closureCurrentPara = index; closureRenderPara(index, true); }, 380);
}

function closureRenderPara(index, animated) {
  const total    = CLOSURE_PARAGRAPHS.length;
  const paraEl   = document.getElementById('closure-para-text');
  const indexEl  = document.getElementById('closure-para-index');
  const prevBtn  = document.getElementById('closure-prev');
  const nextBtn  = document.getElementById('closure-next');
  const dotsEl   = document.getElementById('closure-dots');

  paraEl.innerHTML = CLOSURE_PARAGRAPHS[index];
  paraEl.className = 'closure-para-text';
  if (index === total - 1) paraEl.classList.add('is-final');
  if (animated) {
    paraEl.classList.add('fade-in');
    setTimeout(() => paraEl.classList.remove('fade-in'), 600);
  }

  indexEl.textContent = `${index + 1} / ${total}`;
  prevBtn.disabled    = index === 0;
  nextBtn.disabled    = index === total - 1;
  dotsEl.querySelectorAll('.closure-dot').forEach((d, i) => d.classList.toggle('active', i === index));

  // Al llegar al último párrafo revelar imagen final
  if (index === total - 1) {
    const imgEl = document.getElementById('closure-final-img');
    if (imgEl && imgEl.classList.contains('hidden')) {
      imgEl.classList.remove('hidden');
      requestAnimationFrame(() => requestAnimationFrame(() => imgEl.classList.add('visible')));
    }
  }
}


// ─────────────────────────────────────────────────────────
//  ORQUESTADOR PRINCIPAL
// ─────────────────────────────────────────────────────────
let siteOpened = false;

document.getElementById('open-btn').addEventListener('click', () => {
  if (siteOpened) return;
  siteOpened = true;

  introStars.stop(); // intro stars ya no hacen falta

  document.getElementById('intro').classList.add('gone');
  document.getElementById('page').classList.add('show');

  spawnBubbles();
  startAudio();

  setTimeout(() => {
    document.getElementById('skip-btn').addEventListener('click', skipAll, { passive: true });
    document.getElementById('letter-body').addEventListener('click', skipAll, { passive: true });
    document.getElementById('skip-audio-btn').addEventListener('click', skipAudio, { passive: true });
    startTyping();
  }, 950);
});