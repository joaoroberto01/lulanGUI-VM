const { app, BrowserWindow, shell, dialog, ipcMain, nativeImage, Menu } = require('electron');
const path = require('path');
const { spawn} = require('child_process');
const fs = require('fs');

let window;

//if (!app.isPackaged) {
//    try {
//        require('electron-reloader')(module);
//    } catch {}
//}
const createWindow = () => {
    window = new BrowserWindow({
        width: 1280,
        height: 800,
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
            properties: ['openFile'],
            "filters": [{
                "name": "Arquivos OBJ",
                "extensions": ["obj"]
            }]
        }
        const paths = dialog.showOpenDialogSync(window, options);
        if (paths) {
            return paths[0];
        }
    });

    ipcMain.handle('fs:read', (event, path) => {
        return fs.readFileSync(path, 'utf-8');
    });

    let virtualMachineProcess;
    ipcMain.handle('vm:run', async (event, path) => {
        virtualMachineProcess = spawn('java', ['-jar', 'virtual_machine.jar', path]);

        virtualMachineProcess.stdout.on('data', async (data) => {
            console.log(data.toString());
            if (data.toString().includes('RD')) {
                event.sender.send('vm:on-input-request');
            } else {
                event.sender.send('vm:on-data', data.toString());
            }
        })
        virtualMachineProcess.stderr.on('data', (data) => {
            event.sender.send('vm:on-error', data.toString());
        })
    });

    ipcMain.handle('vm:input', (event, input) => {
        if (!virtualMachineProcess) return;

        virtualMachineProcess.stdin.setEncoding('utf-8');
        virtualMachineProcess.stdin.write(`${input}\n`);
        virtualMachineProcess.stdin.end();
    })
})