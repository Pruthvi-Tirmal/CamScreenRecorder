const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');


const createWindow = (width, height) => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: width,
    height: height,
    show: false,
    title: "Electron Screen Recorder",
    icon: 'src/assets/images/brandIcon.ico',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  // show when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  })
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
  // We cannot require the screen module until the app is ready.
  const { screen } = require('electron')

  // Create a window that fills the screen's available work area.
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize;
  createWindow(width, height);

});


// communicating with Renderer process
ipcMain.on('open-menu', (event, inputSources) => {
  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map(source => {
      return {
        label: source.name,
        click: () => event.sender.send('caught-source', source),
      }
    })
  )
  videoOptionsMenu.popup();
})


// opening the dialogBox
ipcMain.on('open-dialog', (e, buffer) => {
  // returns promise
  const getFilePath = async () => {
    const { filePath } = await dialog.showSaveDialog({
      buttonLabel: 'Save Video',
      defaultPath: `vid-SCrec${Date.now()}.webm`
    })
    if (filePath) {
      fs.writeFile(filePath, buffer, () => console.log('video saved successfully !'));
      console.log(filePath);
    }
  }
  getFilePath();

})


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


