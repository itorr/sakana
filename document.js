const el = document.querySelector('.main');

const v = {
    r: 40, // 角度
    y: 0, // 高度
    t: 100, // 垂直速度
    w: 20, // 横向速度
    d: 0.995 // 衰减
};


const run = _=>{
    requestAnimationFrame(run);

    let { r,y,t,w,d } = v;

    // console.log(wElastic)

    w = w - r * 2;
    r = r + w * 0.01;
    // r = r % 360;
    v.w = w * d;
    v.r = r;

    t = t - y * 2;
    y = y + t * 0.02;
    v.t = t * d;
    v.y = y;

    const x = v.r * 1;
    el.style.transform = `rotate(${v.r}deg) translateX(${x}px) translateY(${v.y}px)`;
};

requestAnimationFrame(run);