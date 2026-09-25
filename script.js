import * as THREE from 'three';

window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loader')?.classList.add('hidden');
    }, 1500);
});

const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursorDot) {
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
    }
});

function animateCursor() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    if (cursorRing) {
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';
        cursorRing.style.transform = 'translate(-50%, -50%)';
    }
    if (cursorDot) {
        cursorDot.style.transform = 'translate(-50%, -50%)';
    }
    requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('.interactive, a, button').forEach((el) => {
    el.addEventListener('mouseenter', () => cursorRing?.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursorRing?.classList.remove('hover'));
});

const glyphFallbackMap = {
    '𓂀': '✦',
    '𓋹': '✧',
    '𓃀': '✹',
    '𓊽': '◈',
    '𓆣': '✺',
    '𓊪': '✦'
};

document.querySelectorAll('.glyph-symbol, .section-mark, .quote-mark, .quote-number').forEach((el) => {
    const original = el.textContent || '';
    const replaced = Array.from(original).map((char) => glyphFallbackMap[char] || char).join('');
    if (replaced !== original) {
        el.textContent = replaced;
    }
});

const glyphs = ['𓂀', '𓋹', '𓃀', '𓊽', '𓆣', '𓊪', '★', '✦'];
let lastGlyphTime = 0;

document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastGlyphTime > 100) {
        lastGlyphTime = now;
        const glyph = document.createElement('div');
        glyph.className = 'flying-glyph';
        glyph.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
        glyph.style.left = e.clientX + 'px';
        glyph.style.top = e.clientY + 'px';
        document.body.appendChild(glyph);
        setTimeout(() => glyph.remove(), 2000);
    }
});

const canvas = document.getElementById('hero-canvas');
if (canvas) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 300;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 40;
    }

    for (let i = 0; i < particlesCount; i++) {
        const color = new THREE.Color(Math.random() > 0.5 ? 0xd4af37 : 0x06b6d4);
        colorArray[i * 3] = color.r;
        colorArray[i * 3 + 1] = color.g;
        colorArray[i * 3 + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.12,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    const pyramidGeometry = new THREE.ConeGeometry(2.5, 3.5, 4);
    const pyramidMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.9,
        roughness: 0.2,
        flatShading: true,
        emissive: 0x8b6914,
        emissiveIntensity: 0.3
    });
    const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
    pyramid.position.set(8, -2, -8);
    pyramid.rotation.y = Math.PI / 4;
    scene.add(pyramid);

    const pyramid2 = new THREE.Mesh(
        new THREE.ConeGeometry(1.8, 2.8, 4),
        new THREE.MeshStandardMaterial({
            color: 0x1e3a8a,
            metalness: 0.8,
            roughness: 0.3,
            flatShading: true,
            emissive: 0x0e7490,
            emissiveIntensity: 0.2
        })
    );
    pyramid2.position.set(-8, -3, -5);
    pyramid2.rotation.y = Math.PI / 4;
    scene.add(pyramid2);

    const pointLight = new THREE.PointLight(0xd4af37, 3, 50);
    pointLight.position.set(0, 5, 5);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x06b6d4, 2, 40);
    pointLight2.position.set(-5, 3, 3);
    scene.add(pointLight2);

    scene.add(new THREE.AmbientLight(0x1e3a8a, 0.5));
    camera.position.z = 12;

    let mouse3D = { x: 0, y: 0 };
    document.addEventListener('mousemove', (e) => {
        mouse3D.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse3D.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    function animate3D() {
        requestAnimationFrame(animate3D);
        particlesMesh.rotation.y += 0.0008;
        particlesMesh.rotation.x += 0.0003;
        pyramid.rotation.y += 0.006;
        pyramid2.rotation.y -= 0.008;
        camera.position.x += (mouse3D.x * 3 - camera.position.x) * 0.05;
        camera.position.y += (mouse3D.y * 3 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
    }
    animate3D();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

const counters = document.querySelectorAll('[data-counter]');
const animateCounter = (counter) => {
    const target = Number(counter.getAttribute('data-counter'));
    const increment = target / 60;
    let current = 0;
    const update = () => {
        current += increment;
        if (current < target) {
            counter.textContent = Math.ceil(current);
            requestAnimationFrame(update);
        } else {
            counter.textContent = target + (target >= 1000 ? '+' : '');
        }
    };
    update();
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
        }
    });
});
counters.forEach((c) => observer.observe(c));

document.getElementById('menu-btn')?.addEventListener('click', () => {
    document.getElementById('mobile-menu')?.classList.toggle('hidden');
});

const characterImg = document.getElementById('character-img');
if (characterImg) {
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 15;
        const y = (e.clientY / window.innerHeight - 0.5) * 15;
        characterImg.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
        characterImg.style.transition = 'transform 0.3s ease';
    });
}

const civData = {
    egypt: {
        title: 'الحضارة المصرية القديمة',
        desc: 'رحلة شائقة عبر أهرامات الجيزة ومعابد الكرنك وأبو الهول. نكتشف معًا أسرار الفراعنة، وعلوم الهندسة والطب والفلك التي سبقت عصرها بآلاف السنين.',
        points: ['تأسيس الدولة الفرعونية وتوحيد القطرين', 'بناء الأهرامات وأسرارها', 'الحضارة والعلوم في عصر الفراعنة', 'الديانة المصرية القديمة'],
        color: '#d4af37',
        img: 'https://z-cdn-media.chatglm.cn/files/1cc39a32-07b9-412b-b78f-7f0e667dae5d.png?auth_key=1890257595-7f4a22c4270442abab193a17ee34e134-0-88b7c287be5cae24fed2c4af14e27bcf'
    },
    greek: {
        title: 'الحضارة الإغريقية والرومانية',
        desc: 'عصر الفلسفة والديمقراطية والإمبراطوريات. من أثينا إلى روما، نستكشف ولادة الفكر الفلسقي والنظم السياسية والحضارات التي أسست الحضارة الغربية.',
        points: ['الفلسفة الإغريقية وفلاسفتها', 'الديمقراطية الأثينية', 'الإمبراطورية الرومانية', 'الآداب والفنون الكلاسيكية'],
        color: '#06b6d4',
        img: 'https://z-cdn-media.chatglm.cn/files/667d510c-4dac-4fbb-9a31-50b70b68936f.png?auth_key=1890257595-dadf3cc5098b4cffa0c0d4efe02055de-0-a81b84a4c38e7c43c69ec833762bc4c9'
    },
    islamic: {
        title: 'الحضارة الإسلامية',
        desc: 'رحلة في عصر النهضة الإسلامية، حيث تألق العلماء في الطب والفلك والرياضيات. من بغداد إلى الأندلس، حضارة أنارت العالم لقرون.',
        points: ['الفتوحات الإسلامية', 'العصر الذهبي للعلوم', 'العمارة الإسلامية', 'علماء الحضارة الإسلامية'],
        color: '#f87171',
        img: 'https://z-cdn-media.chatglm.cn/files/61080d63-b98d-4360-a386-4bd682e1369e.png?auth_key=1890257595-b6d6d05f636a43d1b51d60dc553a7958-0-32176ca930a5f24832cdd282109653b2'
    },
    modern: {
        title: 'العصر الحديث',
        desc: 'من عصر النهضة الأوروبية إلى الثورة الصناعية واكتشاف العالم الجديد. نعيش تحولات صناعت العالم الحديث كما نعرفه اليوم.',
        points: ['عصر النهضة الأوروبية', 'الاكتشافات الجغرافية', 'الثورة الصناعية', 'الحربان العالميتان'],
        color: '#60a5fa',
        img: 'https://z-cdn-media.chatglm.cn/files/bc3246ab-9721-4cbb-bb26-2db891805f47.png?auth_key=1890257595-8c917532d10b421db67c5fad278d25ce-0-fc76b8ffb9f4e39f14f1126fe2e75daa'
    }
};

document.querySelectorAll('.civ-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        const civ = btn.getAttribute('data-civ');
        const data = civData[civ];
        const content = document.getElementById('civ-content');

        document.querySelectorAll('.civ-btn').forEach((b) => {
            const item = civData[b.getAttribute('data-civ')];
            b.style.background = 'rgba(255,255,255,0.05)';
            b.style.border = '1px solid ' + item.color;
            b.style.color = item.color;
        });

        btn.style.background = 'linear-gradient(135deg, ' + data.color + ', ' + data.color + ')';
        btn.style.color = '#050810';
        btn.style.border = 'none';

        if (content) {
            content.innerHTML = `
                <div class="grid md:grid-cols-2 gap-8 items-center">
                    <div class="overflow-hidden rounded-2xl gold-frame group">
                        <img src="${data.img}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="${data.title}">
                    </div>
                    <div>
                        <h3 class="font-amiri text-3xl font-bold mb-4 gold-text">${data.title}</h3>
                        <p class="mb-6 leading-relaxed" style="color: rgba(232, 213, 160, 0.85);">${data.desc}</p>
                        <div class="space-y-3">
                            ${data.points.map((p) => `<div class="flex items-center gap-3"><i class="fas fa-circle-check" style="color: ${data.color};"></i><span style="color: var(--papyrus);">${p}</span></div>`).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
    });
});

document.querySelectorAll('.interactive, button').forEach((el) => {
    el.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 800);
    });
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
            document.getElementById('mobile-menu')?.classList.add('hidden');
        }
    });
});
