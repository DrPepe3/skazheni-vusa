// Послуги та ціни — з віджета Appointer (id = productId)
const SERVICES = [
    // Перші три — за вибором власника, далі за спаданням ціни
    { id: '132449', title: 'Стрижка (машинка + ножиці)', priceMin: 400, priceMax: 600, duration_min: 60 },
    { id: '132450', title: 'Стрижка + борода', priceMin: 800, priceMax: 900, duration_min: 90 },
    { id: '491918', title: 'Подовжена стрижка (тільки ножиці)', priceMin: 600, priceMax: 700, duration_min: 60 },
    { id: '493260', title: 'Бразильське фарбування (+ стрижка)', priceMin: 2500, priceMax: 2500, duration_min: 120 },
    { id: '491962', title: 'Бразильське фарбування (без стрижки)', priceMin: 2000, priceMax: 2000, duration_min: 120 },
    { id: '132451', title: 'Батько і син (4–11 р.)', priceMin: 850, priceMax: 1050, duration_min: 120 },
    { id: '492707', title: 'Стрижка + борода (військовий)', priceMin: 700, priceMax: 750, duration_min: 90 },
    { id: '132454', title: 'Дитяча стрижка (4–11 р.)', priceMin: 350, priceMax: 550, duration_min: 60 },
    { id: '132452', title: 'Камуфляж (голова / борода)', priceMin: 500, priceMax: 500, duration_min: 30 },
    { id: '132455', title: 'Корекція бороди', priceMin: 400, priceMax: 500, duration_min: 60 },
    { id: '492706', title: 'Стрижка (військовий)', priceMin: 400, priceMax: 500, duration_min: 60 },
    { id: '132457', title: 'Укладання волосся', priceMin: 200, priceMax: 200, duration_min: 30 },
    { id: '509211', title: 'Віск', priceMin: 80, priceMax: 80, duration_min: 30 }
];

// Барбери — з віджета Appointer (id = companyUserId)
const BARBERS = [
    { id: '7765', name: 'Марія', role: 'Амбасадор', photo_url: 'images/barbers/mariia.jpg' },
    { id: '29306', name: 'Данило', role: 'Амбасадор', photo_url: 'images/barbers/danylo.jpg' },
    { id: '28578', name: 'Софія М.', role: 'Амбасадор', photo_url: 'images/barbers/sofia_m.jpg' },
    { id: '28569', name: 'Андріана', role: 'Амбасадор', photo_url: 'images/barbers/andriana.jpg' },
    { id: '28571', name: 'Вікторія', role: 'Барбер', photo_url: 'images/barbers/viktoriia.jpg' },
    { id: '28579', name: 'Ірина', role: 'Молодший барбер', photo_url: 'images/barbers/iryna.jpg' },
    { id: '29407', name: 'Валерія', role: 'Молодший барбер', photo_url: 'https://client.appointer.ua/files/company_user/a/rxt/30f476dfe36be599aec7c4f09dbeab31_companyUserPhoto.jpeg' }
];

// Віджет онлайн-запису закладу (Appointer)
const BOOKING_URL = 'https://widget.client.appointer.ua/uk/skazheni-vusa';
const SERVICES_VISIBLE = 3;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Мобильное меню (гамбургер)
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', String(isExpanded));
            document.body.style.overflow = isExpanded ? 'hidden' : '';
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }

    // 2. Изменение хедера при скролле
    const header = document.querySelector('.site-header');
    const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();

    // 3. Intersection Observer для плавного появления элементов
    // Анимация через класс, а не inline-стили: иначе inline transform перебивает :hover в CSS
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    function animateElement(el) {
        el.classList.add('reveal');
        scrollObserver.observe(el);
    }

    document.querySelectorAll('.section-header, .gallery-item, .about-content, .about-image, .contact-card, .cta-container').forEach(animateElement);

    // Подсветка активного пункта меню при прокрутке
    const navMap = new Map();
    navLinks.forEach(link => {
        const section = document.querySelector(link.getAttribute('href'));
        if (section) navMap.set(section, link);
    });

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(l => l.classList.remove('active'));
                navMap.get(entry.target)?.classList.add('active');
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    navMap.forEach((_, section) => navObserver.observe(section));

    // 4. Lightbox для увеличения фотографий в галерее (с перелистыванием)
    const lightbox = document.getElementById('galleryLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
    let currentIndex = 0;

    function showImage(index) {
        currentIndex = (index + galleryItems.length) % galleryItems.length;
        const item = galleryItems[currentIndex];
        lightboxImg.src = item.getAttribute('data-full-img');
        lightboxImg.alt = item.querySelector('img')?.alt || 'Фото з галереї';
        if (lightboxCounter) lightboxCounter.textContent = `${currentIndex + 1} / ${galleryItems.length}`;
    }

    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            if (!lightbox || !lightboxImg) return;
            showImage(index);
            lightbox.classList.add('active');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            lightboxClose?.focus();
        });
    });

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        galleryItems[currentIndex]?.focus();
        setTimeout(() => { lightboxImg.src = ''; }, 300);
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', () => showImage(currentIndex - 1));
    if (lightboxNext) lightboxNext.addEventListener('click', () => showImage(currentIndex + 1));
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (!lightbox?.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
        if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    });

    // 5. Рендер услуг и барберов
    renderCatalog(animateElement);

    // 6. Модальное окно записи (виджет Appointer в iframe)
    initBookingModal();
});

function initBookingModal() {
    const modal = document.getElementById('bookingModal');
    const frame = document.getElementById('bookingFrame');
    const loader = document.getElementById('bookingLoader');
    const foot = document.getElementById('bookingFoot');
    const external = document.getElementById('bookingExternal');
    const closeBtn = document.getElementById('bookingClose');
    let lastTrigger = null;
    let loadTimer = null;

    // Виджет понимает предвыбор услуги и барбера через query-параметры
    function buildUrl({ serviceId, barberId }) {
        const params = new URLSearchParams();
        if (serviceId) params.set('productId', serviceId);
        if (barberId) params.set('companyUserId', barberId);
        const query = params.toString();
        return query ? `${BOOKING_URL}?${query}` : BOOKING_URL;
    }

    function openModal(options) {
        const url = buildUrl(options);
        if (!modal || !frame) {
            window.open(url, '_blank', 'noopener');
            return;
        }
        external.href = url;
        foot.classList.remove('is-alert');
        loader.classList.remove('is-hidden');
        frame.classList.remove('is-loaded');

        // Если виджет не загрузился — подсвечиваем ссылку «в новой вкладке»
        clearTimeout(loadTimer);
        loadTimer = setTimeout(() => foot.classList.add('is-alert'), 8000);
        frame.onload = () => {
            if (frame.src === 'about:blank') return;
            clearTimeout(loadTimer);
            loader.classList.add('is-hidden');
            frame.classList.add('is-loaded');
        };
        frame.src = url;

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    }

    function closeModal() {
        if (!modal || !modal.classList.contains('active')) return;
        clearTimeout(loadTimer);
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        lastTrigger?.focus();
        // Выгружаем виджет, чтобы при следующем открытии он стартовал заново
        setTimeout(() => {
            if (!modal.classList.contains('active')) frame.src = 'about:blank';
        }, 300);
    }

    window.openBookingModal = openModal;

    closeBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-open-booking]');
        if (!trigger) return;
        lastTrigger = trigger;
        openModal({
            serviceId: trigger.getAttribute('data-service-id'),
            barberId: trigger.getAttribute('data-barber-id')
        });
    });
}

function formatPrice(service) {
    const min = Number(service.priceMin);
    const max = Number(service.priceMax);
    return min === max ? `${min}` : `${min}–${max}`;
}

function renderCatalog(animateElement) {
    const servicesGrid = document.getElementById('servicesGrid');
    const teamGrid = document.getElementById('teamGrid');

    // Рендер услуг
    if (servicesGrid) {
        SERVICES.forEach((service, index) => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'service-card';
            if (index >= SERVICES_VISIBLE) {
                card.classList.add('service-card--extra');
                card.setAttribute('hidden', '');
            }
            card.setAttribute('data-open-booking', '');
            card.setAttribute('data-service-id', service.id);

            card.innerHTML = `
                <div class="service-info">
                    <h3 class="service-name">${escapeHtml(service.title)}</h3>
                    <span class="service-meta"><svg class="icon" aria-hidden="true"><use href="#icon-clock"/></svg>${Number(service.duration_min) || 60} хв</span>
                </div>
                <div class="service-price">${formatPrice(service)}<span class="service-price-cur">грн</span></div>
            `;
            card.style.setProperty('--reveal-delay', `${(index % 3) * 70}ms`);
            servicesGrid.appendChild(card);
            if (index < SERVICES_VISIBLE) {
                animateElement(card);
            }
        });

        if (SERVICES.length > SERVICES_VISIBLE) {
            const toggleWrap = document.createElement('div');
            toggleWrap.className = 'services-toggle-wrap';

            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'btn btn-outline';
            toggleBtn.id = 'servicesToggleBtn';
            toggleBtn.setAttribute('aria-expanded', 'false');
            toggleBtn.setAttribute('aria-controls', 'servicesGrid');
            toggleBtn.textContent = `Показати всі послуги (${SERVICES.length})`;

            toggleWrap.appendChild(toggleBtn);

            const servicesSection = document.getElementById('services');
            const servicesCta = servicesSection?.querySelector('.services-cta');
            if (servicesCta) {
                servicesCta.parentNode.insertBefore(toggleWrap, servicesCta);
            } else {
                servicesGrid.parentNode.appendChild(toggleWrap);
            }

            let isExpanded = false;

            toggleBtn.addEventListener('click', () => {
                isExpanded = !isExpanded;
                toggleBtn.setAttribute('aria-expanded', String(isExpanded));

                const extraCards = servicesGrid.querySelectorAll('.service-card--extra');
                extraCards.forEach(card => {
                    if (isExpanded) {
                        card.removeAttribute('hidden');
                        card.classList.add('is-visible');
                    } else {
                        card.setAttribute('hidden', '');
                        card.classList.remove('is-visible');
                    }
                });

                toggleBtn.textContent = isExpanded ? 'Згорнути' : `Показати всі послуги (${SERVICES.length})`;

                if (!isExpanded) {
                    servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }
    }

    // Рендер барберов
    if (teamGrid) {
        BARBERS.forEach((barber, index) => {
            const card = document.createElement('div');
            card.className = 'team-card';

            card.innerHTML = `
                <div class="team-img-wrap">
                    <img src="${escapeHtml(barber.photo_url)}" alt="${escapeHtml(barber.name)}" loading="lazy">
                </div>
                <div class="team-info">
                    <h3>${escapeHtml(barber.name)}</h3>
                    <p class="team-role">${escapeHtml(barber.role)}</p>
                    <button type="button" class="btn btn-outline btn-sm" data-open-booking data-barber-id="${barber.id}" aria-label="Записатися до майстра ${escapeHtml(barber.name)}">
                        Записатися
                    </button>
                </div>
            `;
            card.style.setProperty('--reveal-delay', `${(index % 4) * 70}ms`);
            teamGrid.appendChild(card);
            animateElement(card);
        });
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
