const getSize = require('get-folder-size');

const sqlCommands = {
  InsertFileOrFolder: 'INSERT INTO folder_list (name, size, type, location, createdDate, modifiedDate) VALUES (\'{{name}}\', {{size}}, \'{{type}}\', \'{{location}}\', \'{{createdDate}}\', \'{{modifiedDate}}\')',
  Update: 'UPDATE folder_list set modifiedDate=\'{{modifiedDate}}\', size={{size}} WHERE location=\'{{location}}\'',
  DeleteFileOrFolder: 'DELETE FROM folder_list WHERE location = \'{{location}}\'',
  SearchFileOrFolderWithExtension: 'SELECT * FROM folder_list WHERE name LIKE \'%{{name}}%\' and name LIKE \'%{{extension}}\'',
  SearchFileOrFolderWithoutExtension: 'SELECT * FROM folder_list WHERE name=\'{{name}}\'',
  SizeOfFolder: 'SELECT size FROM folder_list WHERE location =\'{{location}}\'',
  SortFilesOrFolder: 'SELECT * FROM folder_list ORDER BY {{sortBy}} {{order}}',
};

Object.freeze(sqlCommands);

function stringTemplateParser(expression, valueObj) {
  const templateMatcher = /{{\s?([^{}\s]*)\s?}}/g;
  const text = expression.replace(templateMatcher, (substring, value) => valueObj[value]);
  return text;
}

function folderSize(folder) {
  return new Promise((resolve, reject) => {
    getSize(folder, (err, size) => {
      if (err) reject(err);
      resolve(size);
    });
  });
}

async function getFolderSize(folder) {
  const size = await folderSize(folder);
  return size;
}

exports.stringTemplateParser = stringTemplateParser;
exports.sqlCommands = sqlCommands;
exports.getFolderSize = getFolderSize;
