/* ==========================================================
   CONFIGURAÇÃO DA GALERIA
   As imagens serão injetadas dinamicamente no Swiper
   ========================================================== */
// Como as fotos estão na raiz do GitHub, a pasta fica vazia
const PASTA = ''; 
const foto  = (arquivo, legenda = '') => ({ src: PASTA + arquivo, title: legenda, video: false });
const video = (arquivo, legenda = '', capa = '') => ({ src: PASTA + arquivo, title: legenda, video: true, poster: capa ? PASTA + capa : '' });

const MEDIA = [
  // Nomes exatos como estão no seu GitHub
  foto('IMG_20261026_102616414_HDR.jpg', 'Equipe de voluntários e participantes reunidos'),
  foto('IMG_20261026_092049422_HDR.jpg', 'Oficina de arte e memória no pátio'),
  foto('IMG_0117.JPG', 'Kits preparados com carinho para as oficinas'),
  foto('IMG_0146.JPG', 'Alegria e atenção durante a montagem das artes'),
  foto('IMG_0150.JPG', 'Mãos construindo a árvore de Natal'),
  foto('IMG_0167.JPG', 'Foco nos detalhes da colagem'),
  foto('IMG_0184.JPG', 'Troca de afeto e experiências entre gerações'),
  foto('IMG_0137.JPG', 'Mesa de criação a todo vapor'),
  
  // Se converteu o vídeo, altere aqui de .MOV para .mp4
  video('IMG_8441.MOV', 'Todos engajados e focados na atividade')
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
    // Setas de navegação ativadas
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
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

/* ---------- Formulário com Envio Automático para E-mail ---------- */
document.getElementById('form').addEventListener('submit', e => {
  e.preventDefault(); // Impede a página de recarregar

  const form = e.target;
  const formData = new FormData(form);
  const ok = document.getElementById('ok');
  const btn = form.querySelector('button[type="submit"]');

  // Efeito visual no botão enquanto processa o envio
  btn.textContent = "A enviar...";
  btn.disabled = true;

  // Envio para o seu e-mail configurado via FormSubmit
  fetch("https://formsubmit.co/ajax/bernardodimingobarbieri@gmail.com", {
      method: "POST",
      body: formData
  })
  .then(response => response.json())
  .then(data => {
      // Quando o envio dá certo, mostra a mensagem e limpa o formulário
      ok.classList.add('show');
      ok.focus();
      form.reset();
      btn.textContent = "Enviar minha opinião";
      btn.disabled = false;
  })
  .catch(error => {
      console.error(error);
      btn.textContent = "Erro ao enviar. Tente de novo.";
      btn.disabled = false;
  });
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
