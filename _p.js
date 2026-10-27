// _p.js — TEMP probe: welcome modal timeline + what overflows inside the box
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

app.whenReady().then(async () => {
    const win = new BrowserWindow({
        width: 1500,
        height: 950,
        show: true,
        webPreferences: { preload: path.join(__dirname, 'preload.js') }
    });
    await win.loadFile('index.html');

    const snap = async (tag) => {
        const r = await win.webContents.executeJavaScript(`JSON.stringify({
            active: document.getElementById('welcomeModal').classList.contains('active'),
            ready: document.readyState,
            zoom: getComputedStyle(document.body).zoom,
            ov: (function () {
                const b = document.getElementById('timerWindow');
                return { s: b.scrollHeight, c: b.clientHeight, d: b.scrollHeight - b.clientHeight };
            })()
        })`);
        console.log(tag, r);
    };

    await snap('T+0(load)   ');
    await wait(500);  await snap('T+500      ');
    await wait(1500); await snap('T+2000     ');

    const r1 = await win.webContents.executeJavaScript(`(function () {
        const m = document.getElementById('welcomeModal');
        const b = document.getElementById('welcomeClose');
        const before = m.className;
        if (m.classList.contains('active') && b) b.click();
        return JSON.stringify({ hadActive: before.indexOf('active') >= 0, btn: !!b, after: m.className });
    })()`);
    console.log('CLOSE:     ', r1);

    await wait(700); await snap('T+2700     ');

    const detail = await win.webContents.executeJavaScript(`(function () {
        const b = document.getElementById('timerWindow');
        const br = b.getBoundingClientRect();
        const out = [];
        b.querySelectorAll('*').forEach(function (el) {
            const r = el.getBoundingClientRect();
            const db = Math.round(r.bottom - br.bottom);
            const dt = Math.round(br.top - r.top);
            if (db > 1 || dt > 1) out.push((el.id || el.className || el.tagName) + ' bottom+' + db + ' top+' + dt);
        });
        return JSON.stringify({ boxH: Math.round(br.height), sh: b.scrollHeight, ch: b.clientHeight, out: out.slice(0, 12) });
    })()`);
    console.log('OVERFLOW:  ', detail);

    const img = await win.webContents.capturePage();
    fs.writeFileSync('_z6_probe.png', img.toPNG());
    console.log('saved _z6_probe.png');
    app.exit(0);
});
