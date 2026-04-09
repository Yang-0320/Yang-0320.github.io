window.onload = function () {
    const wrap = document.getElementById('wrap');
    const reflectionWrap = document.getElementById('reflection-wrap');
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    const closeBtn = document.getElementById('close-modal');

    // 🔧 配置项（可自由调整）
    const imgCount = 10;
    const imgWidth = 200;
    const imgHeight = 280;
    let radius = 650; // 圆环半径
    let rotY = 0;     // Y轴旋转角度
    let rotX = -15;   // 🔴 关键修复：初始X轴角度，和CSS保持一致
    let isDrag = false;
    let lastX, lastY;
    let moveX = 0, moveY = 0;
    let inertiaTimer = null;
    let autoRotateTimer = null;

    // 1. 生成原图 + 倒影图
    const imgs = [];
    const reflectionImgs = [];
    for (let i = 1; i <= imgCount; i++) {
        // 生成原图
        const img = document.createElement('img');
        img.src = `img/photo${i}.jpg`;
        wrap.appendChild(img);
        imgs.push(img);

        // 生成倒影图（和原图同路径）
        const refImg = document.createElement('img');
        refImg.src = `img/photo${i}.jpg`;
        reflectionWrap.appendChild(refImg);
        reflectionImgs.push(refImg);
    }

    // 2. 3D 环形布局（同步原图和倒影）
    function arrange() {
        // 布局原图
        imgs.forEach((img, i) => {
            const angle = (i / imgCount) * 360;
            img.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
        });
        // 布局倒影（和原图完全同步）
        reflectionImgs.forEach((img, i) => {
            const angle = (i / imgCount) * 360;
            img.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
        });
    }
    arrange();

    // 3. 更新整体旋转（同步原图和倒影）
    function updateRotate() {
        wrap.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        // 倒影只需要同步Y轴旋转，X轴已经在CSS里固定翻转了
        reflectionWrap.style.transform = `rotateX(180deg) rotateY(${rotY}deg) translateY(320px)`;
    }

    // 4. 拖拽旋转（带惯性）
    function startDrag(e) {
        isDrag = true;
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        lastX = clientX;
        lastY = clientY;
        moveX = 0;
        moveY = 0;
        // 停止自动旋转和惯性
        clearInterval(autoRotateTimer);
        clearInterval(inertiaTimer);
    }

    function moveDrag(e) {
        if (!isDrag) return;
        e.preventDefault();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;

        moveX = clientX - lastX;
        moveY = clientY - lastY;

        rotY += moveX * 0.3;
        rotX -= moveY * 0.2;
        // 限制X轴旋转，防止翻转
        rotX = Math.max(-50, Math.min(50, rotX));

        updateRotate();
        lastX = clientX;
        lastY = clientY;
    }

    function endDrag() {
        isDrag = false;
        // 开启惯性
        inertiaTimer = setInterval(() => {
            moveX *= 0.95;
            moveY *= 0.95;
            rotY += moveX * 0.3;
            rotX -= moveY * 0.2;
            rotX = Math.max(-50, Math.min(50, rotX));
            updateRotate();
            // 速度足够慢时停止惯性，恢复自动旋转
            if (Math.abs(moveX) < 0.1 && Math.abs(moveY) < 0.1) {
                clearInterval(inertiaTimer);
                startAutoRotate();
            }
        }, 16);
    }

    // 5. 自动旋转
    function startAutoRotate() {
        autoRotateTimer = setInterval(() => {
            if (!isDrag) {
                rotY += 0.2;
                updateRotate();
            }
        }, 30);
    }

    // 6. 滚轮缩放
    function onWheel(e) {
        e.preventDefault();
        // 向上滚放大（半径减小），向下滚缩小（半径增大）
        radius += e.deltaY < 0 ? -40 : 40;
        // 限制半径范围
        radius = Math.max(350, Math.min(1100, radius));
        arrange();
    }

    // 7. 点击放大
    wrap.addEventListener('click', e => {
        if (e.target.tagName === 'IMG') {
            modalImg.src = e.target.src;
            modal.style.display = 'flex';
            // 暂停旋转
            clearInterval(autoRotateTimer);
            clearInterval(inertiaTimer);
        }
    });

    // 8. 弹窗关闭
    closeBtn.onclick = () => {
        modal.style.display = 'none';
        startAutoRotate(); // 恢复旋转
    };
    modal.onclick = e => {
        if (e.target === modal) {
            modal.style.display = 'none';
            startAutoRotate();
        }
    };

    // --- 绑定所有事件 ---
    // PC端鼠标事件
    document.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', endDrag);
    // 移动端触摸事件
    document.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', moveDrag, { passive: false });
    document.addEventListener('touchend', endDrag);
    // 滚轮事件
    document.addEventListener('wheel', onWheel, { passive: false });

    // 启动自动旋转
    startAutoRotate();
};