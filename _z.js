// _z.js — TEMP verification harness: super-zoom + resizable square timer box
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const consoleErrors = [];

function check(name, pass, detail) {
    results.push({ name, pass: !!pass, detail: String(detail) });
    console.log((pass ? 'PASS' : 'FAIL') + ' | ' + name + ' | ' + detail);
}

function capture(win, file) {
    return win.webContents.capturePage().then((img) => {
        fs.writeFileSync(file, img.toPNG());
        console.log('saved ' + file);
    });
}

function hookErrors(win) {
    win.webContents.on('console-message', (...args) => {
        let msg = '';
        let level = 0;
        try {
            if (args[0] && typeof args[0] === 'object' && 'message' in args[0]) {
                msg = String(args[0].message || '');
                level = Number(args[0].level || 0);
            } else {
                level = Number(args[1]);
                msg = String(args[2] || '');
            }
        } catch (e) { /* ignore hook issues */ }
        if (level >= 3 || /Uncaught|TypeError|ReferenceError|SyntaxError/i.test(msg)) {
            consoleErrors.push(msg);
        }
    });
}

const MEASURE = `(function () {
    const box = document.getElementById('timerWindow');
    const r = box.getBoundingClientRect();
    const z = parseFloat(getComputedStyle(document.body).zoom) || 1;
    const feat = document.querySelector('.features').getBoundingClientRect();
    return JSON.stringify({
        w: Math.round(r.width),
        h: Math.round(r.height),
        size: Math.round(r.width / z),
        zoom: z,
        label: (document.getElementById('zoomLevel') || {}).textContent || '',
        savedZoom: localStorage.getItem('egg-timer-zoom'),
        savedBox: localStorage.getItem('egg-timer-box-size'),
        clipped: box.scrollHeight > box.clientHeight + 2,
        maxAvail: (function () {
            const app = document.querySelector('.app');
            const hero = document.querySelector('.hero');
            const main = document.querySelector('.main-content');
            const s = getComputedStyle(app);
            const inner = app.clientWidth - (parseFloat(s.paddingLeft) || 0) - (parseFloat(s.paddingRight) || 0);
            const gap = parseFloat(getComputedStyle(main).columnGap) || 0;
            return Math.max(360, Math.min(720, inner - hero.offsetWidth - gap));
        })(),
        featRight: Math.round(feat.right),
        innerW: window.innerWidth
    });
})()`;

function drag(sel, dx, dy) {
    return `(function () {
        const box = document.getElementById('timerWindow');
        const h = box.querySelector('${sel}');
        if (!h) return JSON.stringify({ err: 'no handle ${sel}' });
        const r = h.getBoundingClientRect();
        const sx = r.left + r.width / 2;
        const sy = r.top + r.height / 2;
        const base = { bubbles: true, cancelable: true, pointerId: 7, isPrimary: true, button: 0 };
        h.dispatchEvent(new PointerEvent('pointerdown', Object.assign({ clientX: sx, clientY: sy }, base)));
        window.dispatchEvent(new PointerEvent('pointermove', Object.assign({ clientX: sx + ${dx}, clientY: sy + ${dy} }, base)));
        window.dispatchEvent(new PointerEvent('pointerup', Object.assign({ clientX: sx + ${dx}, clientY: sy + ${dy} }, base)));
        return JSON.stringify({ ok: true });
    })()`;
}

const CLOSE_WELCOME = `(function () {
    const m = document.getElementById('welcomeModal');
    const b = document.getElementById('welcomeClose');
    if (m && m.classList.contains('active') && b) b.click();
    return true;
})()`;

const KEY = (key) => `document.dispatchEvent(new KeyboardEvent('keydown',{key:'${key}',ctrlKey:true,bubbles:true,cancelable:true})); true;`;
const CLICK = (id) => `document.getElementById('${id}').click(); true;`;

app.whenReady().then(async () => {
    try {
        const win = new BrowserWindow({
            width: 1500,
            height: 950,
            show: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                nodeIntegration: false
            }
        });
        hookErrors(win);
        await win.loadFile('index.html');
        await wait(2000);

        // Snapshot every localStorage entry so user data is restored at the end.
        const snapshot = await win.webContents.executeJavaScript(
            `(function(){ const o={}; for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i); o[k]=localStorage.getItem(k);} return JSON.stringify(o); })()`
        );

        await win.webContents.executeJavaScript(CLOSE_WELCOME);
        await wait(700);

        // 1) Defaults: square ~480, zoom 100%, nothing clipped
        let m = JSON.parse(await win.webContents.executeJavaScript(MEASURE));
        check('default box ~480px', Math.abs(m.size - 480) <= 2, `size=${m.size}`);
        check('default box is square', Math.abs(m.w - m.h) <= 2, `w=${m.w} h=${m.h}`);
        check('default zoom 100%', m.zoom === 1 && m.label === '100%', `zoom=${m.zoom} label=${m.label}`);
        check('nothing clipped at default', !m.clipped, `clipped=${m.clipped}`);
        check('no horizontal overflow at 100%', m.featRight <= m.innerW + 4, `featRight=${m.featRight} innerW=${m.innerW}`);
        await capture(win, '_z0_default.png');

        // 2) Zoom in ×3 → 130%
        await win.webContents.executeJavaScript(CLICK('zoomInBtn') + CLICK('zoomInBtn') + CLICK('zoomInBtn'));
        await wait(500);
        m = JSON.parse(await win.webContents.executeJavaScript(MEASURE));
        check('zoom in x3 → 130%', Math.abs(m.zoom - 1.3) < 0.001 && m.label === '130%', `zoom=${m.zoom} label=${m.label}`);
        check('zoom persisted', m.savedZoom === '1.3', `savedZoom=${m.savedZoom}`);
        check('dashboard fits at 130% (no cut-off)', m.featRight <= m.innerW + 4, `featRight=${m.featRight} innerW=${m.innerW}`);
        await capture(win, '_z1_zoom130.png');

        // 3) Keyboard: Ctrl+0 default, Ctrl+= in
        await win.webContents.executeJavaScript(KEY('0'));
        await wait(400);
        m = JSON.parse(await win.webContents.executeJavaScript(MEASURE));
        check('Ctrl+0 → 100%', m.zoom === 1 && m.label === '100%', `zoom=${m.zoom} label=${m.label}`);

        await win.webContents.executeJavaScript(KEY('='));
        await wait(400);
        m = JSON.parse(await win.webContents.executeJavaScript(MEASURE));
        check('Ctrl+= → 110%', Math.abs(m.zoom - 1.1) < 0.001 && m.label === '110%', `zoom=${m.zoom} label=${m.label}`);

        // 4) Zoom out ×2 → 90%, then Default button → 100%
        await win.webContents.executeJavaScript(CLICK('zoomOutBtn') + CLICK('zoomOutBtn'));
        await wait(400);
        m = JSON.parse(await win.webContents.executeJavaScript(MEASURE));
        check('zoom out x2 → 90%', Math.abs(m.zoom - 0.9) < 0.001 && m.label === '90%', `zoom=${m.zoom} label=${m.label}`);

        await win.webContents.executeJavaScript(CLICK('zoomResetBtn'));
        await wait(400);
        m = JSON.parse(await win.webContents.executeJavaScript(MEASURE));
        check('Default button → 100%', m.zoom === 1 && m.label === '100%', `zoom=${m.zoom} label=${m.label}`);

        // 5) Corner drag +150/+150 → ~630, still square, persisted
        await win.webContents.executeJavaScript(drag('.resize-se', 150, 150));
        await wait(400);
        m = JSON.parse(await win.webContents.executeJavaScript(MEASURE));
        const expCorner = Math.min(480 + 150, m.maxAvail);
        check('corner drag grows box', Math.abs(m.size - expCorner) <= 3, `size=${m.size} expected=${expCorner} maxAvail=${m.maxAvail}`);
        check('still square after drag', Math.abs(m.w - m.h) <= 2, `w=${m.w} h=${m.h}`);
        check('box size persisted', m.savedBox === String(m.size), `savedBox=${m.savedBox} size=${m.size}`);
        check('nothing clipped at 630', !m.clipped, `clipped=${m.clipped}`);
        await capture(win, '_z2_resized630.png');

        // 6) Max clamp: drag +3000 → capped at 720
        await win.webContents.executeJavaScript(drag('.resize-se', 3000, 3000));
        await wait(400);
        m = JSON.parse(await win.webContents.executeJavaScript(MEASURE));
        check('max clamp (= maxAvail, ≤720)', m.size <= 720 && Math.abs(m.size - m.maxAvail) <= 3, `size=${m.size} maxAvail=${m.maxAvail}`);
        check('still square at max', Math.abs(m.w - m.h) <= 2, `w=${m.w} h=${m.h}`);
        await capture(win, '_z3_max720.png');

        // 7) Min clamp: drag −6000 → never below what the content needs
        await win.webContents.executeJavaScript(drag('.resize-se', -6000, -6000));
        await wait(400);
        m = JSON.parse(await win.webContents.executeJavaScript(MEASURE));
        check('min clamp ≥360', m.size >= 359, `size=${m.size}`);
        check('no content clipped at min', !m.clipped, `clipped=${m.clipped}`);
        check('still square at min', Math.abs(m.w - m.h) <= 2, `w=${m.w} h=${m.h}`);

        // 8) Edge handles work too
        let before = m.size;
        await win.webContents.executeJavaScript(drag('.resize-e', 80, 0));
        await wait(350);
        m = JSON.parse(await win.webContents.executeJavaScript(MEASURE));
        const expE = Math.min(before + 80, m.maxAvail);
        check('east edge grows box', Math.abs(m.size - expE) <= 3, `size=${m.size} expected=${expE}`);

        before = m.size;
        await win.webContents.executeJavaScript(drag('.resize-s', 0, 50));
        await wait(350);
        m = JSON.parse(await win.webContents.executeJavaScript(MEASURE));
        const expS = Math.min(before + 50, m.maxAvail);
        check('south edge grows box', Math.abs(m.size - expS) <= 3, `size=${m.size} expected=${expS}`);
        check('square after edge drags', Math.abs(m.w - m.h) <= 2, `w=${m.w} h=${m.h}`);

        // 9) Return to default ~480
        const delta = 480 - m.size;
        await win.webContents.executeJavaScript(drag('.resize-se', delta, delta));
        await wait(400);
        m = JSON.parse(await win.webContents.executeJavaScript(MEASURE));
        check('restored to ~480', Math.abs(m.size - 480) <= 3, `size=${m.size}`);
        await capture(win, '_z4_default_again.png');

        // 10) Small (mobile-sized) window: box stays square + unclipped
        const mwin = new BrowserWindow({
            width: 430,
            height: 900,
            show: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                nodeIntegration: false
            }
        });
        hookErrors(mwin);
        await mwin.loadFile('index.html');
        await wait(3500);
        await mwin.webContents.executeJavaScript(CLOSE_WELCOME);
        await wait(1000);
        await mwin.webContents.executeJavaScript(CLOSE_WELCOME);
        await wait(400);
        const mm = JSON.parse(await mwin.webContents.executeJavaScript(MEASURE));
        check('mobile box square', Math.abs(mm.w - mm.h) <= 2, `w=${mm.w} h=${mm.h}`);
        check('mobile box not tiny', mm.w >= 340, `w=${mm.w}`);
        check('mobile: nothing clipped', !mm.clipped, `clipped=${mm.clipped}`);
        await capture(mwin, '_z5_mobile.png');

        // 11) Restore the user's original localStorage, then close
        await win.webContents.executeJavaScript(
            `(function(){ const o = ${snapshot}; localStorage.clear(); for (const k in o) { localStorage.setItem(k, o[k]); } return true; })()`
        );

        check('zero console errors', consoleErrors.length === 0, consoleErrors.join(' | ') || 'none');

        const failed = results.filter((r) => !r.pass).length;
        console.log('SUMMARY ' + JSON.stringify({ total: results.length, failed }));

        mwin.close();
        win.close();
        app.exit(failed ? 1 : 0);
    } catch (err) {
        console.error('HARNESS ERROR', err);
        app.exit(2);
    }
});




