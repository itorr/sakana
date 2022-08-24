const htmlEl = document.documentElement;

let device = String(navigator.userAgent.match(/steam|macos/i)).toLowerCase();

if(
    /iPhone|iPad|iPod/i.test(navigator.userAgent) 
    || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
) device = 'ios';

htmlEl.setAttribute('data-device',device)



const sticky = 0.1;
const maxR = 60;
const maxY = 110;
const minY = -maxY;

const el = document.querySelector('.main');
const boxEl = document.querySelector('.single-box');
const inertia = 0.1;

const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

if(params.alpha){
    htmlEl.setAttribute('data-alpha',params.alpha);
}


const Values = {
    chisato: {
        r: 1, // 角度
        y: 40, // 高度
        t: 0, // 垂直速度
        w: 0, // 横向速度
        d: 0.99 // 衰减
    },
    takina: {
        r: 12, // 角度
        y: 2, // 高度
        t: 0, // 垂直速度
        w: 0, // 横向速度
        d: 0.988 // 衰减
    }
};

let runing = true;

const deepCopy = v=> JSON.parse(JSON.stringify(v));


el.classList.add(params.v);
let v = deepCopy(Values[params.v] || Values['takina']);

let width;
let height;


const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const resize = _=>{
    width = Math.min(htmlEl.offsetWidth,800);
    height = 800;

    canvas.width = width;
    canvas.height = height;
};

resize();

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
    // loadImage('sakana.png',el=>{
        // sakanaImageEl = el;
        onOver();
    // })
}
let or = 0;
const run = _=>{
    if(!runing) return;

    requestAnimationFrame(run);

    let { r,y,t,w,d } = v;

    w = w - r * 2 - or;
    r = r + w * inertia * 1.2;
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
const canOrientation = !!(
    window.DeviceOrientationEvent 
    && 
    typeof window.DeviceOrientationEvent['requestPermission'] === 'function'
);

htmlEl.setAttribute('data-can-orientation',canOrientation);

const getOrientationPermission = onOver=>{
    if (!canOrientation) return onOver();

    window.DeviceOrientationEvent['requestPermission']().then(permissionState => {
        // console.log({permissionState})
        if(permissionState !== 'granted') return //alert('获取权限失败');

        htmlEl.setAttribute('data-permission-state',true);
        onOver();
    });
};
const setOrientationListener = _=>{
    getOrientationPermission(_=>{
        if(window.DeviceOrientationEvent){
            let lastPower;
            let lastOriUnix = 0;
            window.addEventListener('deviceorientation', (e)=> {
                const { alpha, beta, gamma, acceleration } = e;
                const unix = +new Date();
                // if((unix - lastOriUnix) < 50) return;

                // console.log( { alpha, beta, gamma });

                or = -gamma / 2;
                // or = or * (alpha > 180?-1:1);
                or = Math.min(maxR,or);
                or = Math.max(-maxR,or);
                // console.log({or})
                // out.innerHTML = JSON.stringify({ alpha, beta, gamma },0,2);
                return;

                lastOriUnix = unix;
                const power = Math.max(
                    // alpha,
                    beta,
                    gamma
                );

                // console.log(e,beta,gamma);
                if(lastPower === undefined){
                    lastPower = power;
                }
                const g = power - lastPower;
                const gg = Math.abs(g * 0.5);
                if(Math.abs(v.w) < gg){
                    v.w = (v.w<0?-1:1) * (Math.abs(v.w) + gg);
                }
                lastPower = power;

            });
        };
    });
};

let magicForceTimerHandle = undefined;
let magicForceFlag = false;

const magicForce = _=>{

    // 0.1 probability to Switch Character
    if(Math.random() < 0.1){
        switchValue();
    }else{
        // Add random velocities in the vertical and horizontal directions
        v.t = v.t + (Math.random()-0.5)*150;
        v.w = v.w + (Math.random()-0.5)*200;
    }


    // Set a variable delay between applying magic powers
    magicForceTimerHandle = setTimeout(
        magicForce, 
        Math.random()*3000+2000
    );
};

const triggerMagic = _=>{
    // Flip the status flag
    magicForceFlag = !magicForceFlag;

    htmlEl.setAttribute('data-magic-force',magicForceFlag);
    
    clearTimeout(magicForceTimerHandle);

    // Clear the timer or start a timer based on the new flag
    if (magicForceFlag)
        magicForceTimerHandle = setTimeout(magicForce, Math.random()*1000+500);
};

// setOrientationListener();

const switchValue = _=>{
    el.classList.toggle('chisato');

    if(el.classList.contains('chisato')){
        v = deepCopy(Values['chisato']);
        history.replaceState({},'','?v=chisato');
    }else{
        v = deepCopy(Values['takina']);
        history.replaceState({},'','?v=takina');
    }
}

document.querySelector('.bed').addEventListener('click',e=>{
    e.preventDefault();

    switchValue();
})


window.addEventListener('resize',resize);
