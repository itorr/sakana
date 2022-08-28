




const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
    set: (searchParams, prop, value) => {
        searchParams.set(prop, value);
        window.history.replaceState(null, null, `?${searchParams.toString()}`);
        return true;
    }
});


const htmlEl = document.documentElement;

let device = String(navigator.userAgent.match(/steam|macos/i)).toLowerCase();

if(
    /iPhone|iPad|iPod/i.test(navigator.userAgent) 
    || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
) device = 'ios';

htmlEl.setAttribute('data-device',device);




// 透明背景
if(params.alpha){
    htmlEl.setAttribute('data-alpha',params.alpha);
}

// 自定义背景色
if(params.background){
    htmlEl.setAttribute('data-alpha',true);
    htmlEl.style.background = params.background;
}


// 元素缩放
const scale = +params.scale || 'auto';
htmlEl.setAttribute('data-scale', scale);

const boxEl = document.body.children[0];

const resize = _=>{
    const { offsetWidth, offsetHeight } = htmlEl;
    const scalc = offsetWidth / offsetHeight;

    const isSuperVertical = scalc < 0.5757;

    htmlEl.setAttribute('data-is-super-vertical',isSuperVertical);

    // 尝试修复部分手机浏览器高度异常的问题
    document.body.style.minHeight = `${window.innerHeight}px`;

    boxEl.style.margin = `0 ${Math.ceil((offsetWidth - 500)/2)}px`;
};

resize();

window.addEventListener('resize',resize);


const voiceButton = document.querySelector('.set-voice');


const toggleVoiceMute = () => {
    let { isMute } = Sakana.Voices;
    isMute = !isMute;

    // 设定静音
    Sakana.setMute(isMute);
    voiceButton.setAttribute(
        'data-active',
        isMute
    );
};

voiceButton.setAttribute(
    'data-active',
    Sakana.Voices.isMute
);

// 启动
const takina = Sakana.init({
    // 启动元素
    el: boxEl,

    // 自定义启动角色
    character: params.v || 'takina',
    
    // 自定义惯性
    inertia: +params.inertia,

    // 自定义衰减
    decay: +params.decay,

    // 自定义启动角度
    r: +params.r,
    // 自定义启动高度
    y: +params.y,

    scale: params.scale,
    translateY: params.translateY,

    onSwitchCharacter(character){
        params.v = character;
    },

    canSwitchCharacter: true
});




// 陀螺仪相关
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

    let or = -gamma / 2;
    // or = or * (alpha > 180?-1:1);
    or = Math.min(maxR,or);
    or = Math.max(-maxR,or);

    // 根据陀螺仪信息 调整归零角度
    takina.setOriginRotate(or);
};
const setOrientationListener = _=>{
    getOrientationPermission(_=>{
        if(window.DeviceOrientationEvent){
            window.addEventListener('deviceorientation', onDeviceOrientation );
        };
    });
};




// 自动模式相关
let magicForceTimerHandle = undefined;
let magicForceFlag = false;

const magicForce = _=>{
    // 获取角色运行状态
    const v = takina.getValue();

    // Add random velocities in the vertical and horizontal directions
    v.t = v.t + (Math.random()-0.5) * 150;
    v.w = v.w + (Math.random()-0.5) * 200;

    // 确保运行
    takina.confirmRunning();


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