(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const cine = document.querySelector('.cine');
  const momentos = [...document.querySelectorAll('.momento')];
  const topo = document.querySelector('.topo');
  const track = document.querySelector('.track > span');
  const current = document.querySelector('.current');
  let raf = 0;
  function update() {
    raf = 0;
    const r = cine.getBoundingClientRect();
    const course = Math.max(1, cine.offsetHeight - innerHeight);
    const p = reduce.matches ? 0 : Math.max(0, Math.min(1, -r.top / course));
    const index = Math.min(2, Math.floor(p * 3));
    momentos.forEach((el, i) => {
      el.classList.toggle('ativo', i === index);
      el.inert = i !== index;
      el.setAttribute('aria-hidden', String(i !== index));
    });
    // A rotação e a desmontagem são controladas pela cena WebGL.
    current.textContent = String(index + 1).padStart(2, '0');
    track.style.width = `${33.333 + p * 66.667}%`;
    topo.classList.toggle('rolou', scrollY > 30);
  }
  const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  reduce.addEventListener('change', schedule);
  update();
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visto'); io.unobserve(entry.target); }
    }), { threshold: .12 });
    document.querySelectorAll('.revelar').forEach(el => io.observe(el));
  } else document.querySelectorAll('.revelar').forEach(el => el.classList.add('visto'));

  const menu = document.querySelector('.menu');
  const toggle = document.querySelector('.menu-toggle');
  function closeMenu() { menu.classList.remove('aberto'); toggle.setAttribute('aria-expanded', 'false'); }
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('aberto');
    toggle.setAttribute('aria-expanded', String(open));
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', e => { if (!topo.contains(e.target)) closeMenu(); });

  const dialog = document.querySelector('dialog');
  const form = document.querySelector('#form-contato');
  const status = document.querySelector('.form-status');
  document.querySelectorAll('[data-dialog]').forEach(button => button.addEventListener('click', () => {
    status.textContent = '';
    form.reset();
    dialog.showModal();
    document.body.classList.add('modal-open');
  }));
  document.querySelector('.fechar').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
  dialog.addEventListener('click', e => {
    const box = dialog.getBoundingClientRect();
    if (e.target === dialog && (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom)) dialog.close();
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    status.textContent = `Demonstração concluída: ${form.elements.interesse.value}. Em uma loja real, o atendimento daria continuidade à sua solicitação. Nenhum dado foi enviado.`;
  });
  document.querySelectorAll('[data-ano]').forEach(el => el.textContent = new Intl.DateTimeFormat('pt-BR', {year:'numeric', timeZone:'America/Sao_Paulo'}).format(new Date()));
})();
