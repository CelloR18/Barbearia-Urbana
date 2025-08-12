// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navbar');
const header = document.querySelector('header');

menuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
    header.classList.toggle('menu-open');
    menuToggle.innerHTML = nav.classList.contains('active') ? 
        '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
});

// Close mobile menu when clicking on a link
document.querySelectorAll('#navbar ul li a').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
        header.classList.remove('menu-open');
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Back to Top Button
const backToTop = document.querySelector('.back-to-top');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTop.classList.add('active');
    } else {
        backToTop.classList.remove('active');
    }
});

backToTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Update active link
            document.querySelectorAll('#navbar ul li a').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
        }
    });
});

// Form submission with WhatsApp redirect
const contactForm = document.getElementById('appointment-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const service = document.getElementById('service').value;
        const date = document.getElementById('date').value;
        const message = document.getElementById('message').value;
        
        // Simple validation
        if (!name || !phone || !service || !date) {
            alert('Por favor, preencha os campos obrigatórios: Nome, Telefone, Serviço e Data.');
            return;
        }
        
        // Format the message for WhatsApp
        const whatsappMessage = `Olá, gostaria de agendar um horário na Barbearia Urbana:
        
*Nome:* ${name}
*Telefone:* ${phone}
*E-mail:* ${email || 'Não informado'}
*Serviço:* ${service}
*Data preferencial:* ${date}
*Mensagem:* ${message || 'Nenhuma mensagem adicional'}

Aguardo confirmação!`;
        
        // Encode the message for URL
        const encodedMessage = encodeURIComponent(whatsappMessage);
        
        // WhatsApp API link
        const whatsappNumber = '5518996193899'; // Número no formato internacional sem caracteres especiais
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        // Open WhatsApp in a new tab
        window.open(whatsappUrl, '_blank');
        
        // Reset form
        this.reset();
    });
}

// Set min date for appointment to today
const dateInput = document.getElementById('date');
if (dateInput) {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    
    dateInput.min = `${yyyy}-${mm}-${dd}`;
}

// Active link highlighting based on scroll position
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('#navbar ul li a');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (pageYOffset >= (sectionTop - 150)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Initialize animations when elements come into view
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.service-card, .gallery-item, .feature-item');
    
    elements.forEach((element, index) => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.2;
        
        if (elementPosition < screenPosition) {
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        }
    });
};

// Run on load and scroll
window.addEventListener('load', animateOnScroll);
window.addEventListener('scroll', animateOnScroll);

// Gallery lightbox functionality
const galleryItems = document.querySelectorAll('.gallery-item');
if (galleryItems.length > 0) {
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const imgSrc = item.querySelector('img').src;
            const imgAlt = item.querySelector('img').alt;
            
            // Create lightbox
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
                <div class="lightbox-content">
                    <img src="${imgSrc}" alt="${imgAlt}">
                    <span class="close-lightbox">&times;</span>
                    <div class="lightbox-caption">${imgAlt}</div>
                </div>
            `;
            
            document.body.appendChild(lightbox);
            
            // Close lightbox
            const closeBtn = lightbox.querySelector('.close-lightbox');
            closeBtn.addEventListener('click', () => {
                lightbox.remove();
            });
            
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    lightbox.remove();
                }
            });
        });
    });
}

// Service time indicators
const serviceCards = document.querySelectorAll('.service-card');
const serviceTimes = {
    'corte': '45 min',
    'barba': '30 min',
    'corte-barba': '1h 15min',
    'hidratacao': '20 min',
    'pigmentacao': '40 min',
    'sobrancelha': '15 min'
};

serviceCards.forEach(card => {
    const serviceId = card.querySelector('select')?.value || 
                     card.querySelector('.service-info h3')?.textContent.toLowerCase();
    
    if (serviceId && serviceTimes[serviceId]) {
        const timeElement = document.createElement('div');
        timeElement.className = 'service-time';
        timeElement.textContent = serviceTimes[serviceId];
        card.querySelector('.service-image').appendChild(timeElement);
    }
});