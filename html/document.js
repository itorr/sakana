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

// 自定义背景色
if(params.background){
    htmlEl.setAttribute('data-alpha',params.alpha);
    htmlEl.style.background = params.background;
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


const voiceButton = document.querySelector('.set-voice');

const Voices = {
    chisato: new Audio('chinanago.mp3'),
    takina: new Audio('sakana.mp3'),

    isMute: false
};

Voices.takina.volume = Voices.chisato.volume = 0.8;
Voices.takina.muted = Voices.chisato.muted = true;

const toggleVoiceMute = () => {
    Voices.isMute = voiceButton.getAttribute('data-active') !== 'true';
    voiceButton.setAttribute(
        'data-active',
        Voices.isMute
    );
    Voices.takina.muted = Voices.chisato.muted = Voices.isMute;
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
    const { offsetWidth, offsetHeight } = htmlEl;
    width = Math.min(offsetWidth,800);
    height = 800;

    canvas.width = width;
    canvas.height = height;

    const scalc = offsetWidth / offsetHeight;

    const isSuperVertical = scalc < 0.5757;

    htmlEl.setAttribute('data-is-super-vertical',isSuperVertical);
};

resize();

const rotatePoint = (cx, cy, x, y, angle)=> {
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

    const n = rotatePoint(
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

    // 这后面是 canvas 绘制角色部分逻辑，没有做 retina 兼容，目前用的 DOM 节点、暂时屏蔽掉
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

    // 确保通过用户触发事件获得 audio 播放授权
    Voices.takina.muted = Voices.chisato.muted = Voices.isMute;

    document.onmouseup = e=>{
        e.preventDefault();
        document.onmousemove = null;
        document.onmouseup = null;

        runing = true;
        playVoice();
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

    // 确保通过用户触发事件获得 audio 播放授权
    Voices.takina.muted = Voices.chisato.muted = Voices.isMute;

    document.ontouchend = e=>{
        document.ontouchmove = null;
        document.ontouchend = null;

        runing = true;
        playVoice();
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



const playVoice = () => {
    if (Voices.isMute) return;
    // console.log({ r: v.r, y: v.y })

    if (el.classList.contains('chisato')) {
        if (
            // 'nice chin~a~na~go~' 经验值
            Math.abs(v.r) <= 4
            && Math.abs(v.y) >= 20
        ) {
            console.log('nice chin~a~na~go~');
            Voices.chisato.play();
        };
    } else {
        if (
            // 'nice sakana~' 经验值
            v.r >= Values.takina.r
            && (Math.abs(v.y) <= 12 || v.r >= 3 * Math.abs(v.y))
        ) {
            console.log('nice sakana~');
            Voices.takina.play();
        };
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


const onDeviceOrientation = (e)=> {
    const { alpha, beta, gamma, acceleration } = e;

    // console.log( { alpha, beta, gamma });

    or = -gamma / 2;
    // or = or * (alpha > 180?-1:1);
    or = Math.min(maxR,or);
    or = Math.max(-maxR,or);
};
const setOrientationListener = _=>{
    getOrientationPermission(_=>{
        if(window.DeviceOrientationEvent){
            window.addEventListener('deviceorientation', onDeviceOrientation );
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
const triggerMagicLinkEl = document.querySelector('.trigger-magic-link');
const triggerMagic = _=>{
    // Flip the status flag
    magicForceFlag = !magicForceFlag;

    htmlEl.setAttribute('data-magic-force',magicForceFlag);
    triggerMagicLinkEl.setAttribute('data-active',magicForceFlag);
    
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
