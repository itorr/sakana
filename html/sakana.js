/**
 * Sakana!
 * Date: 2022-08-28
 * Author: itorr <https://github.com/itorr>
 * Repository: https://github.com/itorr/sakana
 */
const Sakana = (_=>{
    /* css */
    
    const { log } = console;
    
    // 粘性
    const sticky = 0.1;

    // 最大角度
    const maxR = 60;

    // 最大高度
    const maxY = 110;

    // 截止数值
    const cut = 0.1;

    const chisatoConsoleStyle = 'color:#FED;background-color:#C34;padding:2px 4px;';
    const takinaConsoleStyle = 'color:#CCC;background-color:#235;padding:2px 4px;';

    // 角色们属性
    const Characters = {
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

    // 音效
    const Voices = {
        chisato: new Audio('chinanago.m4a'),
        takina: new Audio('sakana.m4a'),

        isMute: true
    };

    Voices.takina.volume = Voices.chisato.volume = 0.8;
    Voices.takina.muted = Voices.chisato.muted = Voices.isMute;


    const deepCopy = typeof window.structuredClone === 'function'
        ? v => window.structuredClone(v)
        : v => JSON.parse(JSON.stringify(v));

    const loadImage = (src,onOver)=>{
        const el = new Image();
        el.onload = _=> onOver(el);
        el.src = src;
    };

    // 坐标旋转
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
    };

    const init = (options = {})=>{
        const {
            decay, // 衰减
            onSwitchCharacter = _=>{}, // 切换角色回调
            scale = 'auto', // 元素缩放
            translateY = 0, // 元素位移
            strokeStyle = '#182562', // 弹簧颜色
            canSwitchCharacter = false, // 允许换角色
        } = options;

        let {
            el, // 启动元素
            character = 'takina', // 角色
            inertia, // 惯性
            originRotate = 0, // 水平度数
            r, // 初始角度
            y, // 初始高度
        } = options;

        // 兼容字符选择器
        if(el.constructor === String) el = document.querySelector(el);

        if(!el) throw new Error('invalid Element');

        if(!inertia) inertia = 0.08;
        inertia = Math.min(0.5, Math.max(0, inertia))

        const setOriginRotate = or=>originRotate = or;

        let v;

        const boxEl = el;
        boxEl.classList.add('sakana-box');
        boxEl.innerHTML = `<canvas></canvas><div class="sakana-character"></div><div class="sakana-bed"></div>`;
        
        const characterEl = boxEl.querySelector('.sakana-character');
        const bedEl = boxEl.querySelector('.sakana-bed');
        const canvas = boxEl.querySelector('canvas');
        
        
        boxEl.style.transform = `translateY(${translateY||0}) scale(${scale})`;
        
        let running = false;
        
        const width = 500;
        const height = 800;
        const superRes = 1;
        
        const dpr = (window.devicePixelRatio || 1) * superRes;
        const renderWidth = width * dpr;
        const renderHeight = height * dpr;
        canvas.width = renderWidth;
        canvas.height = renderHeight;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        
        const ctx = canvas.getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        
        const draw = _=>{
            
            let { r,y,t,w,d } = v;
            const x = r * 1;
            const _y = y;// - Math.abs(x);
            characterEl.style.transform = `rotate(${r}deg) translateX(${x}px) translateY(${y}px)`;
        
            ctx.clearRect(0,0,width,height);
            ctx.save();
        
            ctx.strokeStyle = strokeStyle;
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
            /*
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
            */
        
        };


        let lastRunUnix = +new Date();
        const defaultFrameUnix = 1000/60;
        const run = _=>{
            if(!running) return;

            const runUnix = +new Date();

            let _inertia = inertia;

            const lastRunUnixDiff = runUnix - lastRunUnix;
            if(lastRunUnixDiff < 16){ // 如果单帧间隔超过 16ms 那就躺平不处理
                _inertia = inertia / defaultFrameUnix * lastRunUnixDiff;
            }
            lastRunUnix = runUnix;
            
            let { r,y,t,w,d } = v;

            w = w - r * 2 - originRotate;
            r = r + w * _inertia * 1.2;
            v.w = w * d;
            v.r = r;

            t = t - y * 2;
            y = y + t * _inertia * 2;
            v.t = t * d;
            v.y = y;

            // 小于一定动作时停止重绘 #20
            if(
                Math.max(
                    Math.abs(v.w),
                    Math.abs(v.r),
                    Math.abs(v.t),
                    Math.abs(v.y),
                ) < cut) return running = false;

            requestAnimationFrame(run);

            draw();
        };





        const move = (x,y)=>{
            let r = x * sticky;

            r = Math.max(-maxR,r);
            r = Math.min(maxR,r);

            y = y * sticky * 2;

            y = Math.max(-maxY,y);
            y = Math.min(maxY,y);

            v.r = r;
            v.y = y;
            v.w = 0;
            v.t = 0;
            draw();
        }

        const onMouseDown = (e) => {
            e.preventDefault();
            running = false;
            const { pageX, pageY } = e;
            const _downPageX = pageX;
            const _downPageY = pageY;

            // 确保通过用户触发事件获得 audio 播放授权
            Voices.takina.muted = Voices.chisato.muted = Voices.isMute;

            v.w = 0;
            v.t = 0;

            const onMouseMove = (e) => {
                const rect = boxEl.getBoundingClientRect();

                const leftCenter = rect.left + rect.width / 2;
                const topCenter = rect.top;

                const { pageX, pageY } = e;

                let x = pageX - leftCenter;
                let y = pageY - _downPageY;
                move(x,y);
            };
            const onMouseUp = (e) => {
                e.preventDefault();
                document.removeEventListener('mousemove',onMouseMove);
                document.removeEventListener('mouseup',onMouseUp);

                running = true;
                playVoice();
                requestAnimationFrame(run);
            };

            document.addEventListener('mousemove',onMouseMove);
            document.addEventListener('mouseup',onMouseUp);
        };
        characterEl.addEventListener('mousedown',onMouseDown);

        const onTouchStart = (e) => {
            e.preventDefault();
            running = false;
            if(!e.touches[0]) return;

            const { pageX, pageY } = e.touches[0];
            const _downPageX = pageX;
            const _downPageY = pageY;

            // 确保通过用户触发事件获得 audio 播放授权
            Voices.takina.muted = Voices.chisato.muted = Voices.isMute;

            v.w = 0;
            v.t = 0;

            const onTouchMove = (e) => {
                if(!e.touches[0]) return;

                const rect = boxEl.getBoundingClientRect();
                // log(rect);
                const leftCenter = rect.left + rect.width / 2;
                const topCenter = rect.top;

                const { pageX, pageY } = e.touches[0];

                let x = pageX - leftCenter;
                let y = pageY - _downPageY;
                move(x,y);
            };
            const onTouchEnd = (e) => {
                document.removeEventListener('touchmove',onTouchMove);
                document.removeEventListener('touchend',onTouchEnd);
                
                running = true;
                playVoice();
                requestAnimationFrame(run);
            }

            document.addEventListener('touchmove',onTouchMove);
            document.addEventListener('touchend',onTouchEnd);
        };
        characterEl.addEventListener('touchstart',onTouchStart);


        const confirmRunning = _=>{
            if(running) return;

            running = true;
            requestAnimationFrame(run);
        };
        const setCharacter = character =>{
            characterEl.setAttribute('data-character',character);
            const characterValue = Characters[character];
            if(!characterValue) return;

            v = deepCopy(characterValue);

            // 自定义衰减
            if(decay) v.d = decay;

            if(r) v.r = r;
            if(r) v.y = y;

            confirmRunning();
        };

        const switchCharacter = v=>{
            if(character === 'chisato'){
                character = 'takina';
            }else{
                character = 'chisato';
            }

            setCharacter(character);

            onSwitchCharacter(character);
        };

        if(canSwitchCharacter){
            boxEl.setAttribute('data-can-switch-character',canSwitchCharacter);
            bedEl.addEventListener('click',e=>{
                e.preventDefault();
                switchCharacter();
            });
        }

        const playVoice = _ => {
            if (Voices.isMute) return;
            // log({ r: v.r, y: v.y })
        
            if (character === 'chisato') {
                if (
                    // 'nice chin~a~na~go~' 经验值
                    Math.abs(v.r) <= 4
                    && Math.abs(v.y) >= 20
                ) {
                    log('%cchin~a~na~go~',chisatoConsoleStyle);
                    Voices.chisato.play();
                };
            } else {
                if (
                    // 'nice sakana~' 经验值
                    v.r >= Characters.takina.r
                    && (Math.abs(v.y) <= 12 || v.r >= 3 * Math.abs(v.y))
                ) {
                    log('%csakana~',takinaConsoleStyle);
                    Voices.takina.play();
                };
            };
        };

        setCharacter(character);

        return {
            setCharacter,
            switchCharacter,
            setOriginRotate,
            confirmRunning,
            pause(){
                running = false;
            },
            play(){
                confirmRunning();
            },
            getValue(){
                return v;
            },
            getRunning(){
                return running;
            }
        }
    };

    const baseURL = 'https://lab.magiconch.com/sakana/';
    const twitterURL = 'https://twitter.com/blue00f4/';
    const githubRepositoryURL = 'https://github.com/itorr/sakana';
    log(
        `%c錦木千束 ${baseURL}?v=chisato`,
        chisatoConsoleStyle,
    );
    log(
        `%c井ノ上たきな ${baseURL}?v=takina`,
        takinaConsoleStyle,
    );
    
    log(
        `%c永续超慢速%c${baseURL}?inertia=0.001&decay=1`,
        chisatoConsoleStyle,
        takinaConsoleStyle,
    );
    
    log(
        '绘: %c大伏アオ %c已取得在网页中使用的非商用授权',
        'font-weight:bold',
        'color:#C34',
    
        twitterURL+'status/1551887529615687680',
        twitterURL+'status/1552066743853813760',
    );
    
    log(
        '微博',
        'https://weibo.com/1197780522/M2xbREtGI',
    );
    log(
        'Github',
        githubRepositoryURL,
    );
    log(
        '问题反馈',
        `${githubRepositoryURL}/issues`,
    );
    

    return {
        init,
        Voices,
        setMute(_isMute){
            Voices.isMute = _isMute;

            Voices.takina.muted = 
            Voices.chisato.muted = _isMute;
        },
        destroy(){
            running = false,
            el.innerHTML = '';
        }
    };
})();


if (typeof module === 'object' && module.exports)
	module.exports = Sakana