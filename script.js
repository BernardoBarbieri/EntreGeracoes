/* ==========================================================
   CONFIGURAÇÃO DA GALERIA
   As imagens serão injetadas dinamicamente no Swiper
   ========================================================== */
const PASTA = '';
const foto  = (arquivo, legenda = '') => ({ src: PASTA + arquivo, title: legenda, video: false });
const video = (arquivo, legenda = '', capa = '') => ({ src: PASTA + arquivo, title: legenda, video: true, poster: capa ? PASTA + capa : '' });

const MEDIA = [
  foto('IMG_20261026_102616414_HDR.jpg', 'Equipe de voluntários e participantes reunidos'),
  foto('IMG_20261026_092049422_HDR.jpg', 'Oficina de arte e memória no pátio'),
  foto('IMG_0117.jpg', 'Kits preparados com carinho para as oficinas'),
  foto('IMG_0146.jpg', 'Alegria e atenção durante a montagem das artes'),
  foto('IMG_0150.jpg', 'Mãos construindo a árvore de Natal'),
  foto('IMG_0167.jpg', 'Foco nos detalhes da colagem'),
  foto('IMG_0184.jpg', 'Troca de afeto e experiências entre gerações'),
  foto('IMG_0137.jpg', 'Mesa de criação a todo vapor'),
  
  // Se manteve os ficheiros originais do iPhone sem converter, mude '.mp4' para '.MOV' abaixo
  video('20261026_095401.mp4', 'Escolhendo os detalhes da obra'),
  video('20261026_095026.mp4', 'O orgulho de assinar a própria arte'),
  video('IMG_8441.mp4', 'Todos engajados e focados na atividade'),
  video('IMG_8444.mp4', 'O cuidado e a delicadeza no acabamento')
];

/* ----------------------------------------------------
   INJETAR SLIDES E INICIAR O SWIPER COVERFLOW
------------------------------------------------------- */
const swiperWrapper = document.getElementById('swiper-wrapper-galeria');

if (swiperWrapper) {
  MEDIA.forEach(m => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    
    if (m.video) {
      slide.innerHTML = `<video src="${m.src}" controls playsinline ${m.poster ? `poster="${m.poster}"` : ''}></video>`;
    } else {
      slide.innerHTML = `<img src="${m.src}" alt="${m.title || 'Galeria Entre Gerações'}" loading="lazy">`;
    }
    swiperWrapper.appendChild(slide);
  });
}

// Inicializa o Swiper 3D usando a biblioteca que importamos no HTML
if (typeof Swiper !== 'undefined') {
  new Swiper(".mySwiper", {
    effect: "coverflow",
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: "auto",
    loop: true,
    autoplay: {
      delay: 2000,
      disableOnInteraction: false,
    },
    coverflowEffect: {
      rotate: 40,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: true,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
}

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

/* ---------- Formulário ---------- */
document.getElementById('form').addEventListener('submit', e => {
  e.preventDefault();
  const ok = document.getElementById('ok');
  ok.classList.add('show');
  ok.focus();
  e.target.reset();
});

/* ---------- EFEITO 3D DO PAINEL DIGITAL (Tilt) ---------- */
document.querySelectorAll('.obra').forEach(obra => {
  const tilt = obra.querySelector('.tilt');
  const limit = 15; // Ângulo máximo da inclinação (15 graus)

  obra.addEventListener('pointermove', (e) => {
    if (!tilt) return;
    
    const rect = obra.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    // Efeito Gravitate (dir = 1)
    const xRot = (py - 0.5) * (limit * 2) * 1;
    const yRot = (px - 0.5) * -(limit * 2) * 1;

    tilt.style.transform = `rotateX(${xRot}deg) rotateY(${yRot}deg) scale3d(1.05, 1.05, 1.05)`;
  });

  obra.addEventListener('pointerleave', () => {
    if (!tilt) return;
    tilt.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  });
});
