const { app, BrowserWindow } = require('electron');
const axios = require('axios').default;
const notifier = require('node-notifier');
const path = require('path');
const open = require('open');

let lastPostId = '';

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 400,
    webPreferences: {
      nodeIntegration: true
    },
    icon: path.join(__dirname, 'assets/Turnip-Alert.png')
  });

  win.loadFile('index.html');
}

async function callAPI() {
  const ms = 30 * 1000;

  const res = await axios.get(
    'https://www.reddit.com/r/acturnips/new.json?sort=new'
  );

  const data = res.data.data.children[0].data;

  const title = data.title;
  const url = data.url;
  const id = data.id;
  const upperCaseTitle = title.toUpperCase();
  const tag = '[SW]';

  if (upperCaseTitle.includes(tag)) {
    if (lastPostId !== id) {
      alertUser(
        {
          title: 'Turnip Alert',
          message: title,
          icon: path.join(__dirname, 'assets/Turnip.png')
        },
        url,
        id
      );
    }
  }

  setTimeout(callAPI, ms);
}

function startAPI() {
  callAPI();
}

function alertUser(notifyObj, url, id) {
  notifier.notify(notifyObj, function (err, response, metadata) {
    if (!err) {
      lastPostId = id;
    }

    if (metadata.action === 'clicked') {
      open(url, { app: 'chrome' });
    }
  });
}

app.whenReady().then(createWindow).then(startAPI);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
