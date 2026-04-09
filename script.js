window.onload = function () {
    const wrap = document.getElementById('wrap');
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    const closeBtn = document.getElementById('close-modal');

    const imgCount = 10;
    let radius = 420;
    let rotY = 0;
    let rotX = -15;
    let isDrag = false;
    let lastX, lastY;
    let moveX = 0, moveY = 0;
    let inertiaTimer = null;
    let autoRotateTimer = null;

    const imgs = [];

    // 生成图片
    for (let i = 1; i <= imgCount; i++) {
        const img = document.createElement('img');
        img.src = `img/photo${i}.jpg`;
        wrap.appendChild(img);
        imgs.push(img);
    }

    // 完整圆环布局
    function arrange() {
        imgs.forEach((img, i) => {
            const angle = (360 / imgCount) * i;
            img.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
        });
    }

    function updateRotate() {
        wrap.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    }

    // 拖拽
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

    // 自动旋转（变慢）
    function startAutoRotate() {
        autoRotateTimer = setInterval(() => {
            if (!isDrag) {
                rotY += 0.08;
                updateRotate();
            }
        }, 30);
    }

    // 缩放
    document.addEventListener('wheel', e => {
        e.preventDefault();
        radius += e.deltaY < 0 ? -20 : 20;
        radius = Math.max(220, Math.min(550, radius));
        arrange();
    }, { passive: false });

    // 点击放大
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

    arrange();
    updateRotate();
    startAutoRotate();
};