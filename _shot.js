/* TEMP diagnostic: render the app off-screen and capture screenshots.
   Run: npx electron _shot.js   (delete this file after diagnosis) */
const { app, BrowserWindow } = require('electron');
const fs = require('fs');

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

app.whenReady().then(async () => {
    const win = new BrowserWindow({
        width: 1400,
        height: 900,
        show: true,
        x: -4000, // keep it fully off-screen while still painting
        y: -4000,
        webPreferences: { backgroundThrottling: false }
    });

    try {
        await win.loadFile('index.html');
        await wait(3200);

        // Dismiss first-visit welcome modal, then reset to sunset via real UI
        await win.webContents.executeJavaScript(
            "document.getElementById('welcomeClose').click(); true;"
        );
        await wait(1500);
        await win.webContents.executeJavaScript(
            "document.getElementById('themeBtn').click(); true;"
        );
        await wait(700);
        await win.webContents.executeJavaScript(
            "document.querySelector('.theme-option[data-theme=\"sunset\"]').click(); true;"
        );
        await wait(2500);

        let img = await win.webContents.capturePage();
        fs.writeFileSync('_shot_a_default.png', img.toPNG());
        console.log('captured: default');

        await win.webContents.executeJavaScript(
            "document.getElementById('themeBtn').click(); true;"
        );
        await wait(1300);
        img = await win.webContents.capturePage();
        fs.writeFileSync('_shot_b_modal.png', img.toPNG());
        console.log('captured: theme modal open');

        await win.webContents.executeJavaScript(
            "document.querySelector('.theme-option[data-theme=\"forest\"]').click(); true;"
        );
        await wait(2200);
        img = await win.webContents.capturePage();
        fs.writeFileSync('_shot_c_forest.png', img.toPNG());
        console.log('captured: forest theme');
    } catch (err) {
        console.error('SHOT_ERROR', err);
    }

    app.quit();
});
