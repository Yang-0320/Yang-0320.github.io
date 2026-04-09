window.onload = function () {
    const wrap = document.getElementById('wrap');
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    const closeBtn = document.getElementById('close-modal');

    // 配置（手机/电脑双安全）
    const imgCount = 10;
    let radius = 420;        // 初始圆环大小
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

    // ====================== 360°完整球体布局 ======================
    function arrange() {
        imgs.forEach((img, i) => {

            const angle = (360 / imgCount) * i;
            img.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
        });
    }

    // 更新整体旋转
    function updateRotate() {
        wrap.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    }

    // 拖拽逻辑
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

        rotY += moveX * 0.25;
        rotX -= moveY * 0.15;
        // 限制X轴角度，防止翻转
        rotX = Math.max(-35, Math.min(35, rotX));

        updateRotate();
        lastX = x; lastY = y;
    }

    function endDrag() {
        isDrag = false;
        inertiaTimer = setInterval(() => {
            moveX *= 0.93;
            moveY *= 0.93;
            rotY += moveX * 0.25;
            rotX -= moveY * 0.15;
            rotX = Math.max(-35, Math.min(35, rotX));
            updateRotate();
            if (Math.abs(moveX) < 0.1 && Math.abs(moveY) < 0.1) {
                clearInterval(inertiaTimer);
                startAutoRotate();
            }
        }, 16);
    }

    // 自动旋转
    function startAutoRotate() {
        autoRotateTimer = setInterval(() => {
            if (!isDrag) {
                rotY += 0.18;
                updateRotate();
            }
        }, 30);
    }

    // ====================== 不溢出屏幕 ======================
    document.addEventListener('wheel', e => {
        e.preventDefault();
        radius += e.deltaY < 0 ? -30 : 30;
        // 安全范围：最小240，最大550，手机电脑都不会超屏
        radius = Math.max(240, Math.min(550, radius));
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

    // 关闭弹窗
    closeBtn.onclick = () => { modal.style.display = 'none'; startAutoRotate(); }
    modal.onclick = e => {
        if (e.target === modal) { modal.style.display = 'none'; startAutoRotate(); }
    }

    // 事件绑定
    document.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', moveDrag, { passive: false });
    document.addEventListener('touchend', endDrag);

    // 启动
    arrange();
    updateRotate();
    startAutoRotate();
};