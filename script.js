window.onload = function () {
    const wrap = document.getElementById('wrap');
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    const closeBtn = document.getElementById('close-modal');

    const imgCount = 10;

    // 自适应半径：根据屏幕宽度自动调整
    function getRadius() {
        let w = window.innerWidth;
        if (w < 500) return 260;
        if (w < 800) return 340;
        if (w < 1200) return 400;
        return 450;
    }
    let radius = getRadius();

    let rotY = 0;
    let rotX = -15;
    let isDrag = false;
    let lastX, lastY;
    let moveX = 0, moveY = 0;
    let inertiaTimer = null;
    let autoRotateTimer = null;

    const imgs = [];

    for (let i = 1; i <= imgCount; i++) {
        const img = document.createElement('img');
        img.src = `img/photo${i}.jpg`;
        wrap.appendChild(img);
        imgs.push(img);
    }

    function arrange() {
        imgs.forEach((img, i) => {
            const angle = (360 / imgCount) * i;
            img.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
        });
    }

    function updateRotate() {
        wrap.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    }

    function startDrag(e) {
        isDrag = true;
        const x = e.clientX || e.touches[0].clientX;
        const y = e.clientY || e.touches[0].clientY;
        lastX = x; lastY = y;
        moveX = 0; moveY = 0;
        clearInterval(autoRotateTimer);
        clearInterval(inertiaTimer);
    }

    function moveDrag(e) {
        if (!isDrag) return;
        e.preventDefault();
        const x = e.clientX || e.touches[0].clientX;
        const y = e.clientY || e.touches[0].clientY;
        moveX = x - lastX;
        moveY = y - lastY;

        rotY += moveX * 0.15;
        rotX -= moveY * 0.1;
        rotX = Math.max(-30, Math.min(30, rotX));
        updateRotate();
        lastX = x; lastY = y;
    }

    function endDrag() {
        isDrag = false;
        inertiaTimer = setInterval(() => {
            moveX *= 0.9;
            moveY *= 0.9;
            rotY += moveX * 0.15;
            rotX -= moveY * 0.1;
            rotX = Math.max(-30, Math.min(30, rotX));
            updateRotate();
            if (Math.abs(moveX) < 0.5 && Math.abs(moveY) < 0.5) {
                clearInterval(inertiaTimer);
                startAutoRotate();
            }
        }, 16);
    }

    function startAutoRotate() {
        clearInterval(autoRotateTimer);
        autoRotateTimer = setInterval(() => {
            if (!isDrag) {
                rotY += 0.15;
                updateRotate();
            }
        }, 30);
    }

    document.addEventListener('wheel', function(e) {
        e.preventDefault();
        clearInterval(autoRotateTimer);

        radius += e.deltaY < 0 ? -20 : 20;
        let minR = window.innerWidth < 500 ? 180 : 220;
        let maxR = window.innerWidth < 500 ? 380 : 600;
        radius = Math.max(minR, Math.min(maxR, radius));

        arrange();
        setTimeout(() => { if (!isDrag) startAutoRotate(); }, 500);
    }, { passive: false });

    wrap.addEventListener('click', e => {
        if (e.target.tagName === 'IMG') {
            modalImg.src = e.target.src;
            modal.style.display = 'flex';
            clearInterval(autoRotateTimer);
            clearInterval(inertiaTimer);
        }
    });

    closeBtn.onclick = () => { modal.style.display = 'none'; startAutoRotate(); }
    modal.onclick = e => { if (e.target === modal) { modal.style.display = 'none'; startAutoRotate(); } }

    document.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', moveDrag, { passive: false });
    document.addEventListener('touchend', endDrag);

    // 窗口大小改变时自动重排
    window.addEventListener('resize', () => {
        radius = getRadius();
        arrange();
    });

    arrange();
    updateRotate();
    startAutoRotate();
};