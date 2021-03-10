const express = require('express');

const app = express();

const chokidar = require('chokidar');
const fs = require('fs');
const fsExtra = require('fs-extra');
const operations = require('./operations');

// require('./model');

function searchByNameAndExtension(fileOrFolder, extension = '') {
  return operations.searchFileOrFolder(fileOrFolder, extension);
}
function getSizeOfFileOrFolder(location) {
  return operations.sizeOfFolder(location);
}
function sortTableByModifier(modifier = 'createdDate', order = 'desc') {
  return operations.sortFilesOrFolder(modifier, order);
}

function renameFileOrFolder(location, name) {
  const originalLocation = location.substring(0, location.lastIndexOf('/'));
  const originalName = location.substring(location.lastIndexOf('/'));
  let newName;

  if (originalName.indexOf('.') > -1) {
    const extension = originalName.split('.')[-1];
    newName = `${originalLocation}/${name}${extension}`;

    if (name.toString().indexOf('.') > -1) {
      if (name.split('.')[-1] === extension) {
        newName = `${originalLocation}/${name}`;
      }
    }
  } else {
    if (name.toString().indexOf('.') > -1) {
      newName = newName.substring(newName.indexOf('.'));
    }
    newName = `${originalLocation}/${name}`;
  }

  return new Promise((resolve, reject) => {
    fs.rename(originalLocation, newName, (err) => {
      if (err) reject(err);
      resolve(newName);
    });
  });
}

async function addNewFolder(location, name = '', source = '') {
  if (fs.existsSync(location) && !(await fs.promises.stat(location)).isFile()) {
    const folderName = name !== '' ? name : Date.parse(new Date());
    const folderPath = `${location}/${folderName}`;
    if (source === '') {
      return new Promise((resolve, reject) => {
        fs.mkdir(folderPath, (err) => {
          if (err) reject(err);
          resolve(folderPath);
        });
      });
    }

    fsExtra.copy(source, location);

    if (name !== '') {
      return renameFileOrFolder(location, name);
    }
    else {
      source = source.substring(source.lastIndexOf('/'));
      return new Promise((resolve) => {
        resolve(`${location}/${source}`);
      });
    }
  }
  else if (!fs.existsSync(location)) {
    return new Promise((resolve) => {
      resolve("folder doesn't exist in that location");
    });
  }
  else {
    return new Promise((resolve) => {
      resolve("can't create a folder as it points to a file");
    });
  }
}

async function addNewFile(location, name = '', file = '') {
  if (fs.existsSync(location) && !(await fs.promises.stat(location)).isFile()) {
    return new Promise((resolve, reject) => {
      const fileName = name !== '' ? name : Date.parse(new Date()).toString();
      let filePath;

      if (name.toString().indexOf('.') > -1) {
        filePath = `${location}/${fileName}`;
      } else {
        filePath = `${location}/${fileName}.txt`;
      }

      if (file === '') {
        fs.close(fs.openSync(`${filePath}`, 'w+'), (err) => {
          if (err) reject(err);
        });
        resolve(filePath);
      } else {
        fs.readFile(file, (err, buffer) => {
          if (err) {
            reject(err);
          }
          fs.writeFile(`${filePath}`, buffer, (err2) => {
            if (err2) {
              reject(err2);
            }
            resolve(filePath);
          });
        });
      }
    });
  }
  else if (!fs.existsSync(location)) {
    return new Promise((resolve) => {
      resolve("file doesn't exist in that location");
    });
  }
  else {
    return new Promise((resolve) => {
      resolve("can't create a file as it points to a file");
    });
  }
}

async function deleteFileOrFolder(location) {
  const isFile = (await fs.promises.stat(location)).isFile();
  if (isFile) {
    return new Promise((resolve, reject) => {
      fs.unlink(location, (err) => {
        if (err) reject(err);
        resolve(true);
      });
    });
  }

  return new Promise((resolve, reject) => {
    try {
      fsExtra.remove(location, (err) => {
        if (err) reject(err);
        resolve(true)
      });
    } catch (e) {
      reject(e);
    }
  });
}

chokidar.watch('./testing-folder').on('all', (event, location) => {
  // console.log(event, locationPath);
  if (event === 'add' || event === 'addDir') {
    operations.insertFileOrFolder(location);
    operations.update(location);
  } else if (event === 'unlink' || event === 'unlinkDir') {
    operations.deleteFileOrFolder(location);
    operations.update(location.substring(0, location.lastIndexOf('/')));
  } else if (event === 'change') {
    operations.update(location);
  }
});

const port = 3000;
if (!module.parent) {
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
}

exports.searchByNameAndExtension = searchByNameAndExtension;
exports.getSizeOfFileOrFolder = getSizeOfFileOrFolder;
exports.sortTableByModifier = sortTableByModifier;
exports.addNewFolder = addNewFolder;
exports.addNewFile = addNewFile;
exports.deleteFileOrFolder = deleteFileOrFolder;
exports.renameFileOrFolder = renameFileOrFolder;
