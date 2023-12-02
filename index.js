const { app, BrowserWindow, shell, dialog, ipcMain, nativeImage, Menu } = require('electron');
const path = require('path');
const { spawn} = require('child_process');

let window;

const createWindow = () => {
    window = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 700,
        icon: nativeImage.createFromPath(path.join(__dirname, 'app.png')),
        
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    window.loadFile('pages/main.html');
}
//Menu.setApplicationMenu(null);

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

    let virtualMachineProcess;
    ipcMain.handle('vm:load', async (event, path) => {
        if (virtualMachineProcess) {
            virtualMachineProcess.kill();
            virtualMachineProcess = null;
        }
        virtualMachineProcess = spawn('java', ['-jar', 'virtual_machine.jar', path]);

        virtualMachineProcess.stdout.on('data', async (data) => {
            data = data.toString().trim();
            data.split('\n').forEach(item => {
                console.log('on data:', item);
                event.sender.send('vm:on-data', item);
            });
        })
        virtualMachineProcess.stderr.on('data', (data) => {
            console.log('on error:', data.toString());
            event.sender.send('vm:on-error', data.toString());
        })
    });

    ipcMain.handle('vm:run', async (event) => {
        if (!virtualMachineProcess) return;

        virtualMachineProcess.stdin.setEncoding('utf-8');
        virtualMachineProcess.stdin.write(`0\n`);
    });

    ipcMain.handle('vm:step-run', async (event) => {
        if (!virtualMachineProcess) return;

        virtualMachineProcess.stdin.setEncoding('utf-8');
        virtualMachineProcess.stdin.write(`1\n`);
    });

    ipcMain.handle('vm:input', async (event, value) => {
        if (!virtualMachineProcess) return;

        console.log(value);

        virtualMachineProcess.stdin.setEncoding('utf-8');
        virtualMachineProcess.stdin.write(`${value}\n`);
//        virtualMachineProcess.stdin.end();
    })
})