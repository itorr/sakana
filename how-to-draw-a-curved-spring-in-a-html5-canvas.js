// https://stackoverflow.com/questions/41613191/how-to-draw-a-curved-spring-in-a-html5-canvas
function drawSpring(x1, y1, x2, y2, windings, width, offset, col1, col2, lineWidth){
    var x = x2 - x1;
    var y = y2 - y1;
    var dist = Math.sqrt(x * x + y * y);
    
    var nx = x / dist;
    var ny = y / dist;
    ctx.strokeStyle = col1
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    x1 += nx * offset;
    y1 += ny * offset;
    x2 -= nx * offset;
    y2 -= ny * offset;
    var x = x2 - x1;
    var y = y2 - y1;
    var step = 1 / (windings);
    for(var i = 0; i <= 1-step; i += step){  // for each winding
        for(var j = 0; j < 1; j += 0.05){
            var xx = x1 + x * (i + j * step);
            var yy = y1 + y * (i + j * step);
            xx -= Math.sin(j * Math.PI * 2) * ny * width;
            yy += Math.sin(j * Math.PI * 2) * nx * width;
            ctx.lineTo(xx,yy);
        }
    }
    ctx.lineTo(x2, y2);
    ctx.lineTo(x2 + nx * offset, y2 + ny * offset)
    ctx.stroke();

    ctx.strokeStyle = col2
    ctx.lineWidth = lineWidth - 4;
    var step = 1 / (windings);
    ctx.beginPath();
    ctx.moveTo(x1 - nx * offset, y1 - ny * offset);
    ctx.lineTo(x1, y1);
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 + nx * offset, y2 + ny * offset)
    for(var i = 0; i <= 1-step; i += step){  // for each winding
        for(var j = 0.25; j <= 0.76; j += 0.05){
            var xx = x1 + x * (i + j * step);
            var yy = y1 + y * (i + j * step);
            xx -= Math.sin(j * Math.PI * 2) * ny * width;
            yy += Math.sin(j * Math.PI * 2) * nx * width;
            if(j === 0.25){
                ctx.moveTo(xx,yy);
            
            }else{
                ctx.lineTo(xx,yy);
            }
        }
    }
    
    ctx.stroke();
}

function display() { 
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
    ctx.globalAlpha = 1; // reset alpha
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 8;
    drawSpring(
        canvas.width / 2, 10, 
        mouse.x, mouse.y,
        8,
        30,
        10,
        "green","#0C0",10
    );
}



// Boiler plate code from here down and not part of the answer
var w, h, cw, ch, canvas, ctx, mouse, globalTime = 0, firstRun = true;
;(function(){
    const RESIZE_DEBOUNCE_TIME = 100;
    var  createCanvas, resizeCanvas, setGlobals, resizeCount = 0;
    createCanvas = function () {
        const c = document.createElement("canvas");
        const cs = c.style;
        cs.position = "absolute";
        cs.top = 0;
        cs.left = 0;
        cs.zIndex = 1000;
        document.body.appendChild(c);
        return c;
    }
    resizeCanvas = function () {
        if (canvas === undefined) {
            canvas = createCanvas();
        }
        canvas.width = innerWidth;
        canvas.height = innerHeight;
        ctx = canvas.getContext("2d");
        if (typeof setGlobals === "function") {
            setGlobals();
        }
        if (typeof onResize === "function") {
            if(firstRun){
                onResize();
                firstRun = false;
            }else{
                resizeCount += 1;
                setTimeout(debounceResize, RESIZE_DEBOUNCE_TIME);
            }
        }
    }
    function debounceResize() {
        resizeCount -= 1;
        if (resizeCount <= 0) {
            onResize();
        }
    }
    setGlobals = function () {
        cw = (w = canvas.width) / 2;
        ch = (h = canvas.height) / 2;
    }
    mouse = (function () {
        function preventDefault(e) {
            e.preventDefault();
        }
        var mouse = {
            x : 0,
            y : 0,
            w : 0,
            alt : false,
            shift : false,
            ctrl : false,
            buttonRaw : 0,
            over : false,
            bm : [1, 2, 4, 6, 5, 3],
            active : false,
            bounds : null,
            crashRecover : null,
            mouseEvents : "mousemove,mousedown,mouseup,mouseout,mouseover,mousewheel,DOMMouseScroll".split(",")
        };
        var m = mouse;
        function mouseMove(e) {
            var t = e.type;
            m.bounds = m.element.getBoundingClientRect();
            m.x = e.pageX - m.bounds.left;
            m.y = e.pageY - m.bounds.top;
            m.alt = e.altKey;
            m.shift = e.shiftKey;
            m.ctrl = e.ctrlKey;
            if (t === "mousedown") {
                m.buttonRaw |= m.bm[e.which - 1];
            } else if (t === "mouseup") {
                m.buttonRaw &= m.bm[e.which + 2];
            } else if (t === "mouseout") {
                m.buttonRaw = 0;
                m.over = false;
            } else if (t === "mouseover") {
                m.over = true;
            } else if (t === "mousewheel") {
                m.w = e.wheelDelta;
            } else if (t === "DOMMouseScroll") {
                m.w = -e.detail;
            }
            if (m.callbacks) {
                m.callbacks.forEach(c => c(e));
            }
            if ((m.buttonRaw & 2) && m.crashRecover !== null) {
                if (typeof m.crashRecover === "function") {
                    setTimeout(m.crashRecover, 0);
                }
            }
            e.preventDefault();
        }
        m.addCallback = function (callback) {
            if (typeof callback === "function") {
                if (m.callbacks === undefined) {
                    m.callbacks = [callback];
                } else {
                    m.callbacks.push(callback);
                }
            }
        }
        m.start = function (element) {
            if (m.element !== undefined) {
                m.removeMouse();
            }
            m.element = element === undefined ? document : element;
            m.mouseEvents.forEach(n => {
                m.element.addEventListener(n, mouseMove);
            });
            m.element.addEventListener("contextmenu", preventDefault, false);
            m.active = true;
        }
        m.remove = function () {
            if (m.element !== undefined) {
                m.mouseEvents.forEach(n => {
                    m.element.removeEventListener(n, mouseMove);
                });
                m.element.removeEventListener("contextmenu", preventDefault);
                m.element = m.callbacks = undefined;
                m.active = false;
            }
        }
        return mouse;
    })();

    // Clean up. Used where the IDE is on the same page.
    var done = function () {
        window.removeEventListener("resize", resizeCanvas)
        mouse.remove();
        document.body.removeChild(canvas);
        canvas = ctx = mouse = undefined;
    }


    function update(timer) { // Main update loop
        if(ctx === undefined){
            return;
        }
        globalTime = timer;
        display(); // call demo code
        if (!(mouse.buttonRaw & 2)) {
            requestAnimationFrame(update);
        } else {
            done();
        }
    }
    setTimeout(function(){
        resizeCanvas();
        mouse.start(canvas, true);
        mouse.crashRecover = done;
        window.addEventListener("resize", resizeCanvas);
        requestAnimationFrame(update);
    },0);
})();
/** SimpleFullCanvasMouse.js end **/