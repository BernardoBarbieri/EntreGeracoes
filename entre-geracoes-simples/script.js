/* ==========================================================
   GALERIA
   Coloque suas fotos e vídeos na pasta  galeria/
   e liste cada arquivo abaixo. Para adicionar um item novo,
   copie uma linha e troque o nome do arquivo e a legenda.

   foto('arquivo.jpg', 'Legenda opcional')
   video('arquivo.mp4', 'Legenda opcional', 'capa.jpg')  <- capa é opcional
   ========================================================== */
const PASTA = 'galeria/';
const foto  = (arquivo, legenda = '') => ({ src: PASTA + arquivo, title: legenda, video: false });
const video = (arquivo, legenda = '', capa = '') => ({ src: PASTA + arquivo, title: legenda, video: true, poster: capa ? PASTA + capa : '' });

const MEDIA = [
  foto('foto-01.jpg', ''),
  foto('foto-02.jpg', ''),
  foto('foto-03.jpg', ''),
  foto('foto-04.jpg', ''),
  video('video-01.mp4', ''),
  foto('foto-05.jpg', ''),
  foto('foto-06.jpg', ''),
  foto('foto-07.jpg', ''),
  foto('foto-08.jpg', ''),
  foto('foto-09.jpg', ''),
  foto('foto-10.jpg', ''),
  foto('foto-11.jpg', ''),
  foto('foto-12.jpg', ''),
  foto('foto-13.jpg', ''),
  foto('foto-14.jpg', ''),
  foto('foto-15.jpg', ''),
  foto('foto-16.jpg', ''),
  foto('foto-17.jpg', '')
];

const POR_PAGINA = 9;   // quantos itens aparecem a cada clique em "Carregar mais"
const ALTURAS = [220, 300, 260, 340, 240, 320]; // alturas dos espaços vazios (só visual)
const grid = document.getElementById('grid');
const btn = document.getElementById('more');
const count = document.getElementById('count');
let shown = 0;

/* Espaço vazio mostrado enquanto o arquivo ainda não existe na pasta */
function espacoVazio(m, i) {
  const d = document.createElement('div');
  d.className = 'ph';
  d.style.minHeight = ALTURAS[i % ALTURAS.length] + 'px';
  d.innerHTML = '<svg viewBox="0 0 64 64" width="44" height="44" aria-hidden="true"><rect x="6" y="10" width="52" height="44" rx="6" fill="none" stroke="#1B5E44" stroke-width="4"/><circle cx="22" cy="26" r="5" fill="#D4AF37"/><path d="M10 50l16-16 10 10 8-8 12 14z" fill="#7A9B7E"/></svg>'
    + '<strong>Coloque ' + (m.video ? 'o vídeo' : 'a foto') + ' aqui</strong><code></code>';
  d.querySelector('code').textContent = m.src;
  return d;
}

function criarItem(m, i) {
  const f = document.createElement('figure');
  f.className = 'tile';
  let midia;

  if (m.video) {
    midia = document.createElement('video');
    midia.src = m.src;
    midia.controls = true;
    midia.preload = 'none';           // só baixa quando a pessoa der play
    midia.playsInline = true;
    if (m.poster) midia.poster = m.poster;
    midia.setAttribute('aria-label', m.title || 'Vídeo das oficinas');
  } else {
    midia = new Image();
    midia.src = m.src;
    midia.alt = m.title || 'Foto das oficinas do Entre Gerações';
    midia.loading = 'lazy';           // lazy loading nativo do navegador
    midia.decoding = 'async';
  }
  midia.addEventListener('error', () => midia.replaceWith(espacoVazio(m, i)));
  f.appendChild(midia);

  if (m.title) {
    const cap = document.createElement('figcaption');
    cap.textContent = m.title;
    f.appendChild(cap);
  }
  return f;
}

function carregar() {
  MEDIA.slice(shown, shown + POR_PAGINA).forEach((m, k) => grid.appendChild(criarItem(m, shown + k)));
  shown = Math.min(shown + POR_PAGINA, MEDIA.length);
  count.textContent = 'Mostrando ' + shown + ' de ' + MEDIA.length;
  if (shown >= MEDIA.length) btn.hidden = true;
}
btn.addEventListener('click', carregar);
carregar();

/* ---------- Menu no celular ---------- */
const tg = document.querySelector('.toggle');
const mn = document.getElementById('menu');
tg.addEventListener('click', () => {
  const aberto = mn.classList.toggle('open');
  tg.setAttribute('aria-expanded', aberto);
});
mn.addEventListener('click', e => {
  if (e.target.tagName === 'A') { mn.classList.remove('open'); tg.setAttribute('aria-expanded', false); }
});

/* ---------- Formulário ----------
   Por enquanto só mostra a mensagem de agradecimento.
   Para receber as respostas, conecte a um serviço (Formspree, Google Forms...)
   ou a um backend, dentro deste listener. */
document.getElementById('form').addEventListener('submit', e => {
  e.preventDefault();
  const ok = document.getElementById('ok');
  ok.classList.add('show');
  ok.focus();
  e.target.reset();
});
