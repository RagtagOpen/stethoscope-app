const { app, Menu, shell, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')
const config = require('./config.json')
const env = process.env.NODE_ENV || 'production'

// let changelog
let about

module.exports = function (mainWindow, focusOrCreateWindow, env, log) {
  const { checkForUpdates } = require('./updater')(env, mainWindow, log, false)
  const template = [
    {
      label: 'Edit',
      submenu: [
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' }
      ]
    },
    {
      label: 'Help',
      submenu: config.menu.help.map(({label, link}) => ({
        label,
        click () { shell.openExternal(link) }
      }))
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click () {
            mainWindow && mainWindow.reload()
          }
        },
        {
          label: 'Open Window',
          accelerator: 'CmdOrCtrl+N',
          click () {
            focusOrCreateWindow()
          }
        },
        {
          label: 'Close Window',
          accelerator: 'CmdOrCtrl+W',
          click () {
            if (mainWindow) mainWindow.close()
          }
        }
      ]
    }
  ]

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {role: 'about'},
        {type: 'separator'},
        {
          label: 'Check for Update',
          click (event) {
            checkForUpdates(this, mainWindow, event)
          }
        },
        {role: 'services', submenu: []},
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {role: 'unhide'},
        {type: 'separator'},
        {role: 'quit'}
      ]
    })
  } else if (process.platform === 'win32') {
    template.find(item => item.label === 'Help').submenu.push({type: 'separator'}, {
      label: 'Check for Update',
      click (event) {
        checkForUpdates(this, mainWindow, event)
      }
    },
    {
      label: 'About',
      click (event) {
        showAbout()
      }
    })
  }

  if (process.env.NODE_ENV === 'development') {
    template.push({
      label: 'View',
      submenu: [{
        label: 'Toggle Developer Tools',
        accelerator: 'Alt+Command+I',
        click () { mainWindow.toggleDevTools() }
      }]
    })
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

const showAbout = () => {
  if (!about) {
    about = new BrowserWindow({
      width: 375,
      height: 285,
      resizable: false,
      titleBarStyle: 'hidden',
      maximizable: false,
      fullscreenable: false
    })
    const dir = env === 'production' ? 'build' : 'public'
    about.loadURL(url.format({
      pathname: path.join(__dirname, `/../${dir}/about.html`),
      protocol: 'file:',
      slashes: true
    }))
    about.on('closed', () => {
      about = null
    })
  }
}
