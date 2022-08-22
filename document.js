const el = document.querySelector('.main');
const boxEl = document.querySelector('.single-box');
const inertia = 0.1;
const decay = 0.99;
const v = {
    r: 10, // 角度
    y: 0, // 高度
    t: 0, // 垂直速度
    w: 0, // 横向速度
    d: decay // 衰减
};

let runing = true;


const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const width = 800;
const height = 800;
canvas.width = width;
canvas.height = height;


const draw = _=>{

    let { r,y,t,w,d } = v;
    const x = r * 1;
    const _y = y;// - Math.abs(x);
    el.style.transform = `rotate(${r}deg) translateX(${x}px) translateY(${_y}px)`;

    ctx.clearRect(0,0,width,height);
    ctx.save();
    ctx.translate(
        width/2 ,
        140 + 400 - 40
    );
    ctx.rotate(r/57);
    ctx.translate(
        x,
        _y
    );

    ctx.drawImage(
        sakanaImageEl,
        0,0,
        sakanaImageEl.naturalWidth,
        sakanaImageEl.naturalHeight,

        -sakanaImageEl.naturalWidth/2/2,
        -400 ,

        sakanaImageEl.naturalWidth/2,
        sakanaImageEl.naturalHeight/2
    );

    ctx.restore();

};
const loadImage = (src,onOver)=>{
    const el = new Image();
    el.onload = _=> onOver(el);
    el.src = src;
};
let sakanaImageEl;
const init = onOver=>{
    loadImage('sakana.png',el=>{
        sakanaImageEl = el;
        onOver();
    })
}

const run = _=>{
    if(!runing) return;

    requestAnimationFrame(run);
    // setTimeout(run,200);

    let { r,y,t,w,d } = v;

    // console.log(wElastic)

    w = w - r * 2;
    r = r + w * inertia;
    // r = r % 360;
    v.w = w * d;
    v.r = r;

    t = t - y * 2;
    y = y + t * inertia * 2;
    v.t = t * d;
    v.y = y;
    draw();
};


init(_=>{
    requestAnimationFrame(run);
});

el.onmousedown = e=>{
    runing = false;
    console.log(e);
    const { offsetX, offsetY } = e;
    const { pageX, pageY } = e;
    // console.log({ pageX, pageY });
    const _downPageX = pageX;
    const _downPageY = pageY;
    document.onmouseup = e=>{
        document.onmousemove = null;
        document.onmouseup = null;

        runing = true;
        run();
    };
    document.onmousemove = e=>{
        const rect = boxEl.getBoundingClientRect();
        // console.log(rect);
        const leftCenter = rect.left + rect.width / 2;
        const topCenter = rect.top;

        // console.log(e);

        const { pageX, pageY } = e;

        console.log({ pageX, pageY })

        let x = pageX - leftCenter;
        let y = pageY - _downPageY;
        
        y = y * 0.2;
        y = Math.min(140,y);

        console.log({x,y})
        v.r = x * 0.08;
        v.y = y;
        v.w = 0;
        v.t = 0;
        draw();
    };
};