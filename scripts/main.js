const { app, BrowserWindow, Menu, shell, Tray, nativeImage } = require('electron');
const path = require('path');

const NOVA_URL = 'https://nova-ai-weld-nu.vercel.app';
const APP_NAME = 'NOVA — APEX Intelligence';

let mainWindow;
let tray;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: APP_NAME,
    backgroundColor: '#030d10',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    frame: false,
    titleBarStyle: 'hidden',
    show: false,
  });

  // custom title bar overlay
  mainWindow.setTitleBarOverlay({
    color: '#030d10',
    symbolColor: '#00e5ff',
    height: 32,
  });

  mainWindow.loadURL(NOVA_URL);

  // show window when ready to prevent flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // loading screen while NOVA loads
  mainWindow.webContents.on('did-start-loading', () => {
    mainWindow.webContents.executeJavaScript(`
      if (!document.getElementById('electron-loader')) {
        const loader = document.createElement('div');
        loader.id = 'electron-loader';
        loader.style.cssText = 'position:fixed;inset:0;background:#030d10;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:99999;font-family:monospace';
        loader.innerHTML = \`
          <div style="font-size:48px;color:#00e5ff;letter-spacing:16px;margin-bottom:12px">NOVA</div>
          <div style="font-size:11px;color:#3d7a8a;letter-spacing:4px;margin-bottom:32px">APEX INTELLIGENCE · QC-7</div>
          <div style="width:200px;height:2px;background:#071f27;position:relative;overflow:hidden">
            <div style="position:absolute;left:-100%;width:100%;height:100%;background:#00e5ff;animation:load 1.2s ease-in-out infinite"></div>
          </div>
          <style>@keyframes load{0%{left:-100%}100%{left:100%}}</style>
        \`;
        document.body.appendChild(loader);
      }
    `).catch(() => {});
  });

  // open external links in browser not in app
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(NOVA_URL) && !url.startsWith('https://nova-ai-weld-nu.vercel.app')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // minimize to tray instead of closing
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'tray.png'));
  tray = new Tray(icon.resize({ width: 16, height: 16 }));
  tray.setToolTip('NOVA — APEX Intelligence');
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open NOVA', click: () => { mainWindow.show(); mainWindow.focus(); } },
    { type: 'separator' },
    { label: 'Quit', click: () => { isQuitting = true; app.quit(); } },
  ]);
  tray.setContextMenu(contextMenu);
  tray.on('click', () => { mainWindow.show(); mainWindow.focus(); });
}

function createMenu() {
  const template = [
    {
      label: 'NOVA',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => mainWindow.reload() },
        { label: 'Hard Reload', accelerator: 'CmdOrCtrl+Shift+R', click: () => mainWindow.webContents.reloadIgnoringCache() },
        { type: 'separator' },
        { label: 'Minimize to Tray', click: () => mainWindow.hide() },
        { label: 'Quit NOVA', accelerator: 'CmdOrCtrl+Q', click: () => { isQuitting = true; app.quit(); } },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Toggle Fullscreen', accelerator: 'F11', click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()) },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', click: () => mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() + 0.5) },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', click: () => mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() - 0.5) },
        { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0', click: () => mainWindow.webContents.setZoomLevel(0) },
      ],
    },
    {
      label: 'APEX',
      submenu: [
        { label: 'APEX Intelligence Division', click: () => shell.openExternal('https://apex-site.vercel.app') },
        { label: 'Erebus QC-8', click: () => shell.openExternal('https://erebusqc8.vercel.app') },
        { label: 'System Status', click: () => shell.openExternal('https://nova-ai-weld-nu.vercel.app/status.html') },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  createMenu();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => { isQuitting = true; });

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
