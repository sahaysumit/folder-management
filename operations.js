const mysql = require('mysql');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const { stringTemplateParser, sqlCommands, getFolderSize } = require('./constants');

const mysqlConnector = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'foldersync',
});

mysqlConnector.connect((err) => {
  if (err) throw err;
});

module.exports = {

  async update(locatio) {
    let location = `${locatio}/`;
    const locationList = [location];
    // return new Promise.all
    while (location.indexOf('/') !== -1) {
      try {
        location = location.substring(0, location.lastIndexOf('/'));
        if (!locationList.includes(location)) {
          await locationList.push(location);

          const size = (await fs.promises.stat(location)).isFile()
            ? (await fs.promises.stat(location)).size : await getFolderSize(location);
          const modifiedDate = moment(fs.statSync(location).mtime).format('YYYY-MM-DD HH:mm:ss');

          await mysqlConnector.query(
            stringTemplateParser(sqlCommands.Update,
              {
                modifiedDate,
                size,
                location,
              }),
            (err, result) => new Promise((resolve, reject) => {
              if (err) reject(err);
              resolve(result);
            }),
          );
        }
      } catch (e) {
        // console.log(e);
      }
    }
  },

  async insertFileOrFolder(location) {
    const size = (await fs.promises.stat(location)).isFile()
      ? (await fs.promises.stat(location)).size : await getFolderSize(location);
    const name = path.basename(location);
    const type = (await fs.promises.stat(location)).isFile() ? 'file' : 'folder';
    const createdDate = moment(fs.statSync(location).birthtime).format('YYYY-MM-DD HH:mm:ss');
    const modifiedDate = moment(fs.statSync(location).mtime).format('YYYY-MM-DD HH:mm:ss');

    return new Promise((resolve, reject) => {
      mysqlConnector.query(
        stringTemplateParser(sqlCommands.InsertFileOrFolder,
          {
            name,
            modifiedDate,
            size,
            location,
            createdDate,
            type,
          }),
        (err, result) => {
          if (err) {
            if (err.code !== 'ER_DUP_ENTRY') {
              reject(err);
            }
          } else if (result.affectedRows === 1) {
            resolve(`Successfully inserted id: ${result.insertId}`);
          }
        },
      );
    });
  },

  deleteFileOrFolder(location) {
    return new Promise((resolve, reject) => {
      mysqlConnector.query(
        stringTemplateParser(sqlCommands.DeleteFileOrFolder,
          {
            location,
          }),
        (err, result) => {
          if (err) reject(err);
          if (result.affectedRows === 1) {
            resolve(`Successfully deleted ${location}`);
          }
        },
      );
    });
  },

  searchFileOrFolder(name, extension = '') {
    return new Promise((resolve, reject) => {
      if (extension === '') {
        mysqlConnector.query(
          stringTemplateParser(sqlCommands.SearchFileOrFolderWithoutExtension,
            {
              name,
            }),
          (err, result) => {
            if (err) reject(err);
            resolve(result);
          },
        );
      } else {
        mysqlConnector.query(
          stringTemplateParser(sqlCommands.SearchFileOrFolderWithExtension,
            {
              name,
              extension,
            }),
          (err, result) => {
            if (err) reject(err);
            resolve(result);
          },
        );
      }
    });
  },

  sizeOfFolder(location) {
    return new Promise((resolve, reject) => {
      mysqlConnector.query(
        stringTemplateParser(sqlCommands.SizeOfFolder,
          {
            location,
          }),
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        },
      );
    });
  },

  sortFilesOrFolder(sortBy = 'createdDate', order = 'desc') {
    return new Promise((resolve, reject) => {
      mysqlConnector.query(
        stringTemplateParser(sqlCommands.SortFilesOrFolder,
          {
            sortBy,
            order,
          }), (err, result) => {
          if (err) reject(err);
          resolve(result);
        },
      );
    });
  },
};
