// Initialize Lenis for Smooth Scroll
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
});
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Cursor Logic
const cursorDot = document.querySelector('.cursor-dot');
const cursorCircle = document.querySelector('.cursor-circle');
document.addEventListener('mousemove', (e) => {
    gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0.1 });
    gsap.to(cursorCircle, { x: e.clientX, y: e.clientY, duration: 0.3 });
});

// Magnetic Buttons
const magnets = document.querySelectorAll('.cta-btn, .menu a');
magnets.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        gsap.to(cursorCircle, { scale: 2, backgroundColor: 'rgba(255,255,255,0.1)' });
    });
    btn.addEventListener('mouseleave', () => {
        gsap.to(cursorCircle, { scale: 1, backgroundColor: 'transparent' });
    });
});

// GSAP Reveal Animations
gsap.registerPlugin(ScrollTrigger);

// Hero Reveal
const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.5 } });
tl.to('.hero-title .line', { y: 0, opacity: 1, stagger: 0.2, delay: 0.5 })
    .to('.hero-subtitle', { opacity: 1, duration: 2 }, '-=1')
    .to('#hero-canvas', { opacity: 1, duration: 2 }, '-=2');

// Scroll Animations
gsap.utils.toArray('[data-scroll-section]').forEach(section => {
    gsap.from(section.querySelectorAll('h2, form, .product-item, .statement-text'), {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    });

    // Parallax for Products
    if (section.classList.contains('products')) {
        gsap.to('.product-item.large', {
            y: -100,
            scrollTrigger: {
                trigger: section,
                scrub: 1
            }
        });
        gsap.to('.product-item.small', {
            y: -50,
            scrollTrigger: {
                trigger: section,
                scrub: 1
            }
        });
    }
});


// THREE.JS HERO EFFECT
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
const container = document.getElementById('hero-canvas');
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Load Texture
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('assets/hero-bg.png');

// Create Plane with Shader
const geometry = new THREE.PlaneGeometry(16, 9, 32, 32);
const material = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uTexture: { value: texture },
        uMouse: { value: new THREE.Vector2(0, 0) }
    },
    vertexShader: `
        varying vec2 vUv;
        uniform float uTime;
        uniform vec2 uMouse;
        void main() {
            vUv = uv;
            vec3 pos = position;
            float dist = distance(uv, uMouse);
            // Wave effect based on mouse distance and time
            pos.z += sin(pos.x * 5.0 + uTime) * 0.1;
            pos.z += sin(pos.y * 5.0 + uTime) * 0.1;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D uTexture;
        uniform float uTime;
        void main() {
            vec2 uv = vUv;
            // Slight distortion
            uv.x += sin(uv.y * 10.0 + uTime * 0.5) * 0.005;
            vec4 color = texture2D(uTexture, uv);
            // Darken
            gl_FragColor = vec4(color.rgb * 0.5, 1.0);
        }
    `
});

const plane = new THREE.Mesh(geometry, material);
scene.add(plane);
camera.position.z = 5;

// Mouse Movement for Shader
const mouse = new THREE.Vector2();
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX / window.innerWidth;
    mouse.y = 1.0 - (e.clientY / window.innerHeight);
    material.uniforms.uMouse.value.set(mouse.x, mouse.y);
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    material.uniforms.uTime.value += 0.01;
    renderer.render(scene, camera);
}
animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
