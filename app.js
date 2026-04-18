// ═══════════════════════════════════════════════════════════
//  app.js — Carta para Reboltosa
// ═══════════════════════════════════════════════════════════


// ─────────────────────────────────────────────────────────
//  STARS
// ─────────────────────────────────────────────────────────
const starsCanvas = document.getElementById('stars-c');
const sCtx        = starsCanvas.getContext('2d');
let   starsRunning = true;

function resizeStars() {
  starsCanvas.width  = innerWidth;
  starsCanvas.height = innerHeight;
}
resizeStars();
addEventListener('resize', resizeStars);

const STARS = Array.from({ length: 230 }, () => ({
  x:     Math.random() * innerWidth,
  y:     Math.random() * innerHeight,
  r:     Math.random() * 1.4 + 0.2,
  phase: Math.random() * Math.PI * 2,
  speed: Math.random() * 0.016 + 0.004,
}));

(function animateStars() {
  sCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
  STARS.forEach(s => {
    s.phase += s.speed;
    const a = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(s.phase));
    sCtx.beginPath();
    sCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    sCtx.fillStyle = `rgba(255,255,255,${a})`;
    sCtx.fill();
  });
  if (starsRunning) requestAnimationFrame(animateStars);
})();


// ─────────────────────────────────────────────────────────
//  CONFETTI
// ─────────────────────────────────────────────────────────
const cfCanvas = document.getElementById('cf-canvas');
const cfCtx    = cfCanvas.getContext('2d');
let   particles = [];

function resizeConfetti() { cfCanvas.width = innerWidth; cfCanvas.height = innerHeight; }
resizeConfetti();
addEventListener('resize', resizeConfetti);

const CF_COLORS = ['#ff6b6b','#ffa36c','#ffd93d','#6bcb77','#4d96ff','#d0a8ff','#ff9ff3','#ffffff','#c9963a','#80ffdb'];

function launchConfetti() {
  particles = Array.from({ length: 200 }, () => ({
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
  animateConfetti();
}
function animateConfetti() {
  cfCtx.clearRect(0, 0, cfCanvas.width, cfCanvas.height);
  let alive = false;
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.rot += p.rv;
    if (p.y < cfCanvas.height + 20) { alive = true; p.alpha = Math.max(0, p.alpha - 0.004); }
    else p.alpha = 0;
    cfCtx.save();
    cfCtx.translate(p.x, p.y);
    cfCtx.rotate(p.rot * Math.PI / 180);
    cfCtx.globalAlpha = p.alpha;
    cfCtx.fillStyle   = p.color;
    if (p.circle) { cfCtx.beginPath(); cfCtx.arc(0, 0, p.w / 2, 0, Math.PI * 2); cfCtx.fill(); }
    else cfCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    cfCtx.restore();
  });
  if (alive) requestAnimationFrame(animateConfetti);
}


// ─────────────────────────────────────────────────────────
//  BURBUJAS
// ─────────────────────────────────────────────────────────
const BUBBLE_COLORS = ['#ff6b6b','#ffa36c','#ffd93d','#6bcb77','#4d96ff','#d0a8ff','#ff9ff3','#80ffdb'];

function spawnBubbles() {
  const page = document.getElementById('page');
  for (let i = 0; i < 24; i++) {
    const b  = document.createElement('div');
    b.className = 'bub';
    const sz = Math.random() * 10 + 4;
    b.style.cssText = [
      `left:${Math.random() * 100}%`,
      `width:${sz}px`, `height:${sz}px`,
      `background:${BUBBLE_COLORS[i % BUBBLE_COLORS.length]}`,
      `opacity:${(Math.random() * 0.38 + 0.12).toFixed(2)}`,
      `animation-duration:${(Math.random() * 10 + 7).toFixed(1)}s`,
      `animation-delay:${(Math.random() * 7).toFixed(1)}s`,
    ].join(';');
    page.appendChild(b);
  }
}


// ─────────────────────────────────────────────────────────
//  MENSAJE Y RENDERIZADO DE CARTA
// ─────────────────────────────────────────────────────────
const FULL_MSG = [
  'SUPER FELIZ CUMPLEAÑOS, REBOLTOSA.',
  '',
  '¡Qué maravilloso día para tener el pelo como un arcoíris! Espero que aún lo tengas así. Seguro que hoy será un gran día para ti.',
  '',
  'Mira que me encontré con un asiático que me empezó a hablar en mandarín; solo le entendí que tenía algo para ti. Pensé: "¿Por qué no?" Total, te lo mereces por mantener el primer puesto como experta en Megamente.',
  '',
  'Lo siento si en algún momento no pude felicitarte por mensaje el día de hoy; no sé qué estará pasando en la vida del Zannián del futuro. Yo soy el del 16 de abril.',
  '',
  'En unos días me van a dejar trabajando como profesor para unos celadores; ahora sí puedes decir que estoy viejo. Ya no te enrollo más, que siempre me decías que hablaba mucho.',
  '',
  'Ten un lindo día. Espero que tomen muchas fotos, que Zeus no se enloquezca en tu casa y que tus seres queridos te brinden todo el calor de su amor.',
  '',
  'Muchos éxitos con tu futura empresa, señorita Emprendimientos.',
  '',
  '(sí, usé autocorrector para que quedara bonito; lo bueno es que aún tiene mi esencia)',
].join('\n');

const FIRST_LINE_END = FULL_MSG.indexOf('\n');
const FIRST_STYLE = [
  'font-weight:700','font-size:1.72rem','line-height:2.4rem',
  'display:block','margin-bottom:0.35rem',
  'background:linear-gradient(135deg,#c9963a,#de5a0a)',
  '-webkit-background-clip:text','-webkit-text-fill-color:transparent','background-clip:text',
].join(';');

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function buildHTML(n) {
  const capped    = Math.min(n, FULL_MSG.length);
  const firstPart = FULL_MSG.substring(0, Math.min(capped, FIRST_LINE_END));
  const restPart  = capped > FIRST_LINE_END ? FULL_MSG.substring(FIRST_LINE_END, capped) : '';
  let html = `<span style="${FIRST_STYLE}">${escHtml(firstPart)}</span>`;
  if (restPart) html += escHtml(restPart).replace(/\n/g, '<br>');
  return html;
}

function setDisplay(n, cursor = true) {
  const body = document.getElementById('letter-body');
  const c    = cursor ? '<span class="cursor-blink"></span>' : '';
  body.innerHTML = buildHTML(n) + c;
}


// ─────────────────────────────────────────────────────────
//  AUDIO DE FONDO
//  Pon tu archivo como background.mp3 en la misma carpeta.
// ─────────────────────────────────────────────────────────
const bgAudio = document.getElementById('bg-audio');
bgAudio.volume = 0.55;

let audioDone  = false;
let typingDone = false;

function checkBothDone() {
  if (audioDone && typingDone) revealFinalButtons();
}

function startAudio() {
  bgAudio.play().catch(() => {
    // Autoplay bloqueado o archivo no encontrado → continuar sin audio
    audioDone = true;
    checkBothDone();
  });
}

bgAudio.addEventListener('ended', () => {
  audioDone = true;
  checkBothDone();
});

// Si el audio falla por archivo no encontrado
bgAudio.addEventListener('error', () => {
  audioDone = true;
  checkBothDone();
});


// ─────────────────────────────────────────────────────────
//  TYPING ANIMADO
// ─────────────────────────────────────────────────────────
let typingPos    = 0;
let typingActive = false;
let skipNow      = false;

function startTyping() {
  typingActive = true;
  skipNow      = false;
  setDisplay(0, true);
  type();
}

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
  // Mostrar celebración inmediatamente aunque el audio siga
  const cel = document.getElementById('celebration');
  setTimeout(() => {
    cel.classList.add('show');
    setTimeout(launchConfetti, 350);
  }, 700);
  checkBothDone();
}

function skipAll() {
  if (!typingActive) return;
  skipNow      = true;
  typingActive = false;
  typingPos    = FULL_MSG.length;
  setDisplay(FULL_MSG.length, false);
  document.getElementById('skip-btn').style.display = 'none';
  onTypingDone();
}


// ─────────────────────────────────────────────────────────
//  BOTONES FINALES
// ─────────────────────────────────────────────────────────
function revealFinalButtons() {
  const btns = document.getElementById('final-btns');
  btns.classList.remove('hidden');
}


// ─────────────────────────────────────────────────────────
//  PARTÍCULAS DE TERAPIA (polvo de estrellas lento)
// ─────────────────────────────────────────────────────────
const therapyCanvas = document.getElementById('therapy-canvas');
const tCtx          = therapyCanvas.getContext('2d');
let   therapyRunning = false;

function resizeTherapy() { therapyCanvas.width = innerWidth; therapyCanvas.height = innerHeight; }
resizeTherapy();
addEventListener('resize', resizeTherapy);

const T_PARTICLES = Array.from({ length: 70 }, () => ({
  x:     Math.random() * innerWidth,
  y:     Math.random() * innerHeight,
  r:     Math.random() * 1.0 + 0.2,
  vx:    (Math.random() - 0.5) * 0.18,
  vy:    -(Math.random() * 0.22 + 0.06),
  alpha: Math.random() * 0.25 + 0.05,
  phase: Math.random() * Math.PI * 2,
}));

function animateTherapy() {
  tCtx.clearRect(0, 0, therapyCanvas.width, therapyCanvas.height);
  T_PARTICLES.forEach(p => {
    p.x    += p.vx;
    p.y    += p.vy;
    p.phase += 0.008;
    const a = p.alpha * (0.6 + 0.4 * Math.sin(p.phase));
    if (p.y < -5) p.y = therapyCanvas.height + 5;
    if (p.x < -5) p.x = therapyCanvas.width  + 5;
    if (p.x > therapyCanvas.width + 5) p.x = -5;
    tCtx.beginPath();
    tCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    tCtx.fillStyle = `rgba(200,190,255,${a})`;
    tCtx.fill();
  });
  if (therapyRunning) requestAnimationFrame(animateTherapy);
}


// ─────────────────────────────────────────────────────────
//  SECCIÓN TERAPIA — apertura y formulario
// ─────────────────────────────────────────────────────────
const VALID_DATE = '2026-01-29';

document.getElementById('btn-therapy').addEventListener('click', () => {
  const therapy = document.getElementById('therapy');
  therapy.classList.add('active');

  // Asegurar que el contenido protegido esté oculto por DOM
  const textWrap = document.getElementById('therapy-text-wrap');
  textWrap.style.display = 'none';
  textWrap.classList.remove('visible');

  // Detener el audio del cumpleaños si aún suena
  if (!bgAudio.paused) {
    bgAudio.pause();
    bgAudio.currentTime = 0;
  }

  // Arrancar partículas de terapia
  therapyRunning = true;
  animateTherapy();

  // Scroll al inicio dentro de la sección
  therapy.scrollTop = 0;
});

document.getElementById('btn-close').addEventListener('click', () => {
  window.close();
  // Fallback por si window.close() está bloqueado
  document.body.innerHTML = '<div style="display:flex;height:100vh;align-items:center;justify-content:center;background:#06060f;font-family:Cormorant Garamond,serif;font-style:italic;color:rgba(255,255,255,0.3);font-size:1.2rem;">Puedes cerrar esta pestaña.</div>';
});

document.getElementById('therapy-submit').addEventListener('click', validateDate);
document.getElementById('therapy-date').addEventListener('keydown', e => {
  if (e.key === 'Enter') validateDate();
});

function validateDate() {
  const input = document.getElementById('therapy-date');
  const error = document.getElementById('therapy-error');
  const val   = input.value;

  if (val === VALID_DATE) {
    error.classList.add('hidden');
    input.classList.remove('error-shake');
    showTherapyText();
  } else {
    input.classList.remove('error-shake');
    void input.offsetWidth; // reflow para reiniciar animación
    input.classList.add('error-shake');
    error.classList.remove('hidden');
  }
}

function showTherapyText() {
  const formWrap = document.getElementById('therapy-form-wrap');
  formWrap.classList.add('out');

  const textWrap = document.getElementById('therapy-text-wrap');
  setTimeout(() => {
    // Sacar el form del flujo del DOM para que no afecte el centrado del contenido
    formWrap.style.display = 'none';
    // Restablecer display y mostrar el contenido protegido
    textWrap.style.display = '';
    textWrap.classList.remove('hidden');
    textWrap.classList.add('visible');
    initParaViewer();
    initMediaPlayer();
    // Reproducir audio de fondo de la sección terapia
    startTherapyAudio();
  }, 500);
}

// ─────────────────────────────────────────────────────────
//  AUDIO DE TERAPIA
// ─────────────────────────────────────────────────────────
const therapyAudio = new Audio('audio2.mp3');
therapyAudio.loop   = true;
therapyAudio.volume = 0;

function startTherapyAudio() {
  therapyAudio.currentTime = 0;
  therapyAudio.play().catch(() => {
    // Autoplay bloqueado o archivo no encontrado — continuar sin audio
  });
  // Fade in suave desde 0 hasta 0.55 en ~1.5s
  let vol = 0;
  const fadeIn = setInterval(() => {
    vol = Math.min(vol + 0.03, 0.55);
    therapyAudio.volume = vol;
    if (vol >= 0.55) clearInterval(fadeIn);
  }, 80);
}

// ─────────────────────────────────────────────────────────
//  LIGHTBOX DE VIDEO
// ─────────────────────────────────────────────────────────
function initMediaPlayer() {
  const thumb    = document.getElementById('media-thumb');
  const lightbox = document.getElementById('video-lightbox');
  const video    = document.getElementById('therapy-video');
  const backdrop = document.getElementById('lb-backdrop');
  const closeBtn = document.getElementById('lb-close');

  function openLightbox() {
    lightbox.classList.add('open');
    video.play().catch(() => {});
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    video.pause();
    video.currentTime = 0;
  }

  thumb.addEventListener('click', openLightbox);
  closeBtn.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });
}


const EMOTIONAL_PARAGRAPHS = [
  `Esto fue parte de la terapia, y que tú siguieras leyendo te hace <em class="hl">masoquista</em>, eché.`,

  `Me hubiera gustado decir algo en ese momento, pero me ganó el <em class="hl-key">dolor</em>, acompañado de <em class="hl-key">ira</em> al sentir todo desmoronarse. Sigo confuso; no entiendo cómo pudiste decirme que querías <em class="hl">casarte conmigo</em> y, al día siguiente, <em class="hl-key">cortar la relación</em>.`,

  `Sé que no fui perfecto, pero realmente quería que estuvieras en ese momento tan <em class="hl">vulnerable</em>, así como yo lo estuve para ti antes. Porque sí, estaba <em class="hl">mejorando por ambos</em>, porque tú eras <em class="hl-key">parte de mi futuro</em>. Siento que te aburriste de estar conmigo, que querías salir a rumbear y tener experiencias fuertes.`,

  `En mis recuerdos suelen aparecer lo que creo que eran tus excusas para terminar conmigo, a las cuales siempre les daba una solución. Ese mismo día, las cartas me dijeron que había <em class="hl-key">alguien más en la relación</em>, con quien decidiste irte. Creo que ya sabes quién pienso que es, y más cuando un día de <em class="hl">melancolía</em> vi tu foto en un espejo lleno de stickers, junto a grafitis, sumado a la conexión que tenían.`,

  `Pero aun así, sabes que soy <em class="hl">necio</em>. Decidí dejar esa duda en el aire, porque <em class="hl-key">la mujer que amo</em> no sería así. Me dolió que traicionaras mi confianza al contar algo tan delicado como mi sentir, cuando yo nunca solté palabra sobre tu fragilidad. Todo eso hizo que me llenara de <em class="hl-key">odio</em> hacia ti. Me parecía imposible pensar que quien yo llamaba <em class="hl">mi osita</em> me haría algo así.`,

  `Tus últimas palabras las tomé como el "típico monólogo de chica", pero no me dejé caer, porque ya había decidido mejorar. Aun después de todo ese odio, <em class="hl">el fuego se apaga</em>; y fue ahí cuando mi <em class="hl">corazón de pollo</em> ansiaba que un día aparecieras diciéndome que <em class="hl-key">lo sentías</em>.`,

  `Porque tal vez pienses que no, pero es verdad que <em class="hl-key">aún sigo enamorado</em> de tu <em class="hl">sonrisa que enseña tus encías</em>. Aún siento un leve cosquilleo cuando recuerdo tus <em class="hl">ruidosas carcajadas</em>. Todavía vive en mí la emoción de <em class="hl-key">enamorarme de todo tu cuerpo</em> cuando te veía venir a la lejanía.`,

  `Y sí, ahora es diferente, porque tal vez, sin quererlo, <em class="hl-key">me lastimaste</em>. Pero sé que los humanos podemos cometer <em class="hl">errores</em>, especialmente con quienes <em class="hl">apreciamos</em>.`,

  `Por eso quiero decirte que <em class="hl-declaration">sí</em>,\n<em class="hl-declaration">aún te amo</em>, <em class="hl-name">Gabriela</em>.`,
];

let currentPara = 0;

function initParaViewer() {
  const total   = EMOTIONAL_PARAGRAPHS.length;
  const dotsEl  = document.getElementById('para-dots');
  const prevBtn = document.getElementById('para-prev');
  const nextBtn = document.getElementById('para-next');

  // Crear dots
  dotsEl.innerHTML = '';
  EMOTIONAL_PARAGRAPHS.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(d);
  });

  prevBtn.addEventListener('click', () => goTo(currentPara - 1));
  nextBtn.addEventListener('click', () => goTo(currentPara + 1));

  // Swipe en móvil
  let touchStartX = 0;
  const stage = document.getElementById('para-stage');
  stage.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) goTo(currentPara + (dx < 0 ? 1 : -1));
  });

  renderPara(0, false);
}

function goTo(index) {
  const total = EMOTIONAL_PARAGRAPHS.length;
  if (index < 0 || index >= total) return;

  const paraEl = document.getElementById('para-text');
  paraEl.classList.add('fade-out');
  setTimeout(() => {
    currentPara = index;
    renderPara(index, true);
  }, 380);
}

function renderPara(index, animated) {
  const total   = EMOTIONAL_PARAGRAPHS.length;
  const paraEl  = document.getElementById('para-text');
  const indexEl = document.getElementById('para-index');
  const prevBtn = document.getElementById('para-prev');
  const nextBtn = document.getElementById('para-next');
  const dotsEl  = document.getElementById('para-dots');

  paraEl.innerHTML = EMOTIONAL_PARAGRAPHS[index].replace(/\n/g, '<br>');

  paraEl.className = 'para-text';
  if (index === 0)         paraEl.classList.add('is-intro');
  if (index === total - 1) paraEl.classList.add('is-final');
  if (animated) {
    paraEl.classList.add('fade-in');
    setTimeout(() => paraEl.classList.remove('fade-in'), 600);
  }

  indexEl.textContent = `${index + 1} / ${total}`;
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === total - 1;

  dotsEl.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === index);
  });
}


// ─────────────────────────────────────────────────────────
//  ORQUESTADOR PRINCIPAL
// ─────────────────────────────────────────────────────────
let siteOpened = false;

document.getElementById('open-btn').addEventListener('click', () => {
  if (siteOpened) return;
  siteOpened = true;

  // Apagar estrellas del intro
  starsRunning = false;

  document.getElementById('intro').classList.add('gone');
  document.getElementById('page').classList.add('show');

  spawnBubbles();
  startAudio();

  setTimeout(() => {
    document.getElementById('skip-btn').addEventListener('click', skipAll);
    document.getElementById('letter-body').addEventListener('click', skipAll);
    startTyping();
  }, 950);
});