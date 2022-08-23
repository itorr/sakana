const el = document.querySelector('.main');
const boxEl = document.querySelector('.single-box');
const inertia = 0.1;
const decay = 0.99;
let v = {
    r: 10, // 角度
    y: 0, // 高度
    t: 0, // 垂直速度
    w: 0, // 横向速度
    d: decay // 衰减
};

let runing = true;



const width = Math.min(document.documentElement.offsetWidth,800);
const height = 800;


const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = width;
canvas.height = height;



const rotate = (cx, cy, x, y, angle)=> {
    const radians = (Math.PI / 180) * angle;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const nx = (cos * (x - cx)) + (sin * (y - cy)) + cx;
    const ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return {
        x: nx, 
        y: ny
    };
}


const draw = _=>{
    
    let { r,y,t,w,d } = v;
    const x = r * 1;
    const _y = y;// - Math.abs(x);
    el.style.transform = `rotate(${r}deg) translateX(${x}px) translateY(${y}px)`;

    ctx.clearRect(0,0,width,height);
    ctx.save();

    ctx.strokeStyle = '#182562';
    ctx.lineWidth = 10;

    ctx.beginPath();
    ctx.translate(
        width / 2 ,
        640 // height - 160
    );
    ctx.moveTo(
        0,
        140
    );

    const cx = 0;
    const cy = -100;

    const n = rotate(
        cx,
        cy,
        x,
        -y,
        r
    );

    const nx = n.x;
    const ny = -n.y - 100;
    
    ctx.quadraticCurveTo(
        0,
        75,
        nx,
        ny
    );

    ctx.stroke();
    ctx.restore();

    return;
    // ctx.clearRect(0,0,width,height);
    ctx.save();
    ctx.translate(
        width/2 ,
        height - 160
    );
    ctx.rotate(r/180*Math.PI);
    ctx.translate(
        x,
        _y
    );

    ctx.drawImage(
        sakanaImageEl,
        0,0,
        sakanaImageEl.naturalWidth,
        sakanaImageEl.naturalHeight,

        -150,
        -400,

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

    let { r,y,t,w,d } = v;

    w = w - r * 2;
    r = r + w * inertia;
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
const sticky = 0.1;
const maxR = 60;
const maxY = 110;
const minY = -140;
const move = (x,y)=>{
    let r = x * sticky;

    r = Math.max(-maxR,r);
    r = Math.min(maxR,r);

    y = y * sticky * 2;

    y = Math.max(minY,y);
    y = Math.min(maxY,y);

    v.r = r;
    v.y = y;
    v.w = 0;
    v.t = 0;
    draw();
}
el.onmousedown = e=>{
    e.preventDefault();
    runing = false;
    const { pageX, pageY } = e;
    const _downPageX = pageX;
    const _downPageY = pageY;

    document.onmouseup = e=>{
        e.preventDefault();
        document.onmousemove = null;
        document.onmouseup = null;

        runing = true;
        run();
    };
    document.onmousemove = e=>{
        const rect = boxEl.getBoundingClientRect();

        const leftCenter = rect.left + rect.width / 2;
        const topCenter = rect.top;

        const { pageX, pageY } = e;

        let x = pageX - leftCenter;
        let y = pageY - _downPageY;
        move(x,y);
    };
};

el.ontouchstart = e=>{
    e.preventDefault();
    runing = false;
    if(!e.touches[0]) return;

    const { pageX, pageY } = e.touches[0];
    const _downPageX = pageX;
    const _downPageY = pageY;

    document.ontouchend = e=>{
        document.ontouchmove = null;
        document.ontouchend = null;

        runing = true;
        run();
    };
    document.ontouchmove = e=>{
        if(!e.touches[0]) return;

        const rect = boxEl.getBoundingClientRect();
        // console.log(rect);
        const leftCenter = rect.left + rect.width / 2;
        const topCenter = rect.top;

        const { pageX, pageY } = e.touches[0];

        let x = pageX - leftCenter;
        let y = pageY - _downPageY;
        move(x,y);
    };
};
const getOrientationPermission = onOver=>{
    if (typeof DeviceOrientationEvent['requestPermission'] !== 'function') return onOver();

    DeviceOrientationEvent['requestPermission']().then(permissionState => {
        // console.log({permissionState})
        if(permissionState !== 'granted') return// alert('获取权限失败');
        onOver();
    });
};
const setOrientationListener = _=>{
    getOrientationPermission(_=>{
        if(window.DeviceOrientationEvent){
            let lastPower;
            let lastOriUnix = 0;
            window.addEventListener('deviceorientation', (e)=> {
                const { alpha, beta, gamma } = e;
                const unix = +new Date();
                // if((unix - lastOriUnix) < 50) return;

                lastOriUnix = unix;
                const power = Math.max(
                    // alpha,
                    beta,
                    gamma
                );

                console.log(e,beta,gamma);
                if(lastPower === undefined){
                    lastPower = power;
                }
                const g = power - lastPower;
                const gg = Math.abs(g * 0.5);
                if(Math.abs(v.w) < gg){
                    v.w = (v.w<0?-1:1) * (Math.abs(v.w) + gg);
                }
                lastPower = power;
                // out.innerHTML = g;
            });
        };
    });
};

document.addEventListener('touchstart',setOrientationListener,{once:true})


document.querySelector('.bed').addEventListener('click',e=>{
    e.preventDefault();
    el.classList.toggle('chisato');
})