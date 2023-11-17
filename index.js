const { app, BrowserWindow, shell, dialog, ipcMain, nativeImage, Menu } = require('electron');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');

let window;

//if (!app.isPackaged) {
//    try {
//        require('electron-reloader')(module);
//    } catch {}
//}
const createWindow = () => {
    window = new BrowserWindow({
        width: 800,
        height: 600,
        icon: nativeImage.createFromPath(path.join(__dirname, 'app.png')),
        autoHideMenuBar: true,
        
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    window.loadFile('pages/main.html');
}
// Menu.setApplicationMenu(null);

app.whenReady().then(() => {
    createWindow();

    ipcMain.handle('dialog:open', async () => {
        const options = {
            properties: ['openFile']
        }
        const paths = dialog.showOpenDialogSync(window);
        if (paths) {
            return paths[0];
        }
    });

    ipcMain.handle('fs:read', (event, path) => {
        return fs.readFileSync(path, 'utf-8');
    });

    ipcMain.handle('compiler:compile', async (event, path) => {
        let lulangCompiler = spawnSync('java', ['-jar', 'compiler.jar', path]);

        return {
            message: lulangCompiler.stdout.toString(),
            error: lulangCompiler.stderr.toString()
        }
//        if (lulangCompiler.stderr) {
//            return lulangCompiler.stderr.toString();
//        }
//
//        return lulangCompiler.stdout.toString();

        //STREAM FOR VIRTUAL MACHINE
//        lulangCompiler.stdout.on('data', (data) => {
//            console.log(data)
//            window.webContents.send('compiler:on-message', data.toString());
//        });
//
//        lulangCompiler.stderr.on('data', (data) => {
//            console.log(data.toString())
//            window.webContents.send('compiler:on-error', data.toString());
//        });
    });
})