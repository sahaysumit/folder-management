const { expect } = require('chai');
const fs = require('fs');
const fsExtra = require("fs-extra");
const {
  searchByNameAndExtension,
  getSizeOfFileOrFolder,
  sortTableByModifier,
  addNewFolder,
  addNewFile,
  deleteFileOrFolder,
  renameFileOrFolder,
} = require('../main');

describe('search file or folder by name and extension', () => {
  it('strict name search', async () => {
    const result = await searchByNameAndExtension('test-file.txt');
    for (let i = 0; i < result.length; i += 1) {
      const { location } = result[i];
      if (!fs.existsSync(location)) {
        console.log(location);
      }
      expect(fs.existsSync(location)).equals(true);
    }
  });

  it('extension search', async () => {
    const result = await searchByNameAndExtension('', 'txt');
    for (let i = 0; i < result.length; i += 1) {
      const { location } = result[i];
      if (!fs.existsSync(location)) {
        console.log(location);
      }
      expect(fs.existsSync(location)).equals(true);
    }
  });

  it('name and extension search', async () => {
    const result = await searchByNameAndExtension('1', 'txt');
    for (let i = 0; i < result.length; i += 1) {
      const { location } = result[i];
      if (!fs.existsSync(location)) {
        console.log(location);
      }
      expect(fs.existsSync(location)).equals(true);
    }
  });
});

describe('get size of folder or file', () => {
  it('size of folder', async () => {
    const result = await getSizeOfFileOrFolder('testing-folder');
    const data = await searchByNameAndExtension('testing-folder');
    expect(data[0].size).equals(result[0].size);
  });

  it('size of file', async () => {
    const result = await getSizeOfFileOrFolder('testing-folder/test-file.txt');
    const data = (await fs.promises.stat('testing-folder/test-file.txt')).size;
    expect(result[0].size).equals(data);
  });

  it('size of non-existing file/folder', async () => {
    const result = await getSizeOfFileOrFolder('testing-folder/abcd1234ijkl');
    const data = (await fs.existsSync('testing-folder/abcd1234ijkl'));
    expect(result).that.eql([]);
    expect(data).equals(false);
  });
});

describe('sort table', () => {
  it('sort by default modifier: createdDate', async () => {
    const result = sortTableByModifier();
    let flag = true;
    for (let i = 0; i < result.length - 1; i += 1) {
      if (new Date(result[i].createdDate) < new Date(result[i + 1].createdDate)) {
        flag = false;
        break;
      }
    }
    expect(flag).equals(true);
  });

  it('sort by name', () => {
    const result = sortTableByModifier('name');
    let flag = true;
    for (let i = 0; i < result.length - 1; i += 1) {
      if (result[i].name < result[i + 1].name) {
        flag = false;
        break;
      }
    }
    expect(flag).equals(true);
  });

  it('sort by name in asc', () => {
    const result = sortTableByModifier('name', 'asc');
    let flag = true;
    for (let i = 0; i < result.length - 1; i += 1) {
      if (result[i].name > result[i + 1].name) {
        flag = false;
        break;
      }
    }
    expect(flag).equals(true);
  });
});

describe('add new folder', async () => {
  let fileName = Date.parse(new Date());
  await beforeEach(async () => {
    if (fs.existsSync('testing-folder/creating-file/1')) {
      await deleteFileOrFolder('testing-folder/creating-file/1');
    }
    if (fs.existsSync('testing-folder/creating-file/1-new-name')) {
      await deleteFileOrFolder('testing-folder/creating-file/1-new-name');
    }
    if(fs.existsSync("testing-folder/creating-file/"+newfileName)){
      await deleteFileOrFolder("testing-folder/creating-file/"+newfileName)
    }
  });
  
  it('add blank folder', async () => {
    const result = await addNewFolder('testing-folder/creating-file');
    const search = await searchByNameAndExtension(result.lastIndexOf('/'));

    let flag = false;
    setTimeout(() => {
      for (let i = 0; i < search.length; i += 1) {
        if (search[i].location === result) {
          flag = true;
          break;
        }
      }
      expect(flag).equals(true);
    }, 100);
  });

  it('add blank folder with name', async () => {
    let add = await addNewFolder('testing-folder/creating-file', fileName);
    console.log("*************");
    console.log("adding");
    console.log(add);
    let flag = false;
    setTimeout(async () => {
      const search = await searchByNameAndExtension(fileName);
      for (let i = 0; i < search.length; i += 1) {
        if (search[i].location === `testing-folder/creating-file/${fileName}`) {
          flag = true;
          break;
        }
      }
      expect(flag).equals(true);
    }, 100);
  });

  it('copy folder without name', async () => {
    const result = await addNewFolder('testing-folder/creating-file', '', 'testing-folder/creating-file/1');
    const search = await searchByNameAndExtension(result.lastIndexOf('/'));
    setTimeout(async () => {
      let flag = false;
      for (let i = 0; i < search.length; i += 1) {
        if (search[i].location === result) {
          flag = true;
          break;
        }
      }
      expect(flag).equals(true);
    }, 100);
  });

  it('copy folder with name', async () => {
    const name = 'copyFolder';

    const result = await addNewFolder('testing-folder/creating-file', name, 'testing-folder/creating-file/1');
    console.log('dddd');
    console.log(result);

    setTimeout(async () => {
      const search = await searchByNameAndExtension(name);
      let flag = false;
      for (let i = 0; i < search.length; i += 1) {
        if (search[i].location === `testing-folder/creating-file/${name}`) {
          flag = true;
          break;
        }
      }
      expect(flag).equals(true);
    }, 100);
  });
});

describe('add new file', async () => {
  await beforeEach(async () => {
    if (fs.existsSync('testing-folder/creating-file/1.txt')) {
      await deleteFileOrFolder('testing-folder/creating-file/1.txt');
    }
  });

  it('add blank file', async () => {
    const result = await addNewFile('testing-folder/creating-file');
    setTimeout(async () => {
      let flag = false;
      const search = await searchByNameAndExtension(result.substring(result.lastIndexOf('/')));
      for (let i = 0; i < search.length; i += 1) {
        if (search[i].location === result) {
          flag = true;
          break;
        }
      }
      expect(flag).equals(true);
    });
  });

  it('add blank file with name', async () => {
    const result = await addNewFile('testing-folder/creating-file', Date.parse(new Date()));
    setTimeout(async () => {
      let flag = false;
      const search = await searchByNameAndExtension(Date.parse(new Date()));
      for (let i = 0; i < search.length; i += 1) {
        if (search[i].location === result) {
          flag = true;
          break;
        }
      }
      expect(flag).equals(true);
    });
  });

  it('copy file with name', async () => {
    const result = await addNewFile('testing-folder/creating-file', 'created-file-copy', 'testing-folder/creating-file/1.txt');
    setTimeout(async () => {
      let flag = false;
      const search = await searchByNameAndExtension(result.substring(result.lastIndexOf('/')));
      for (let i = 0; i < search.length; i += 1) {
        if (search[i].location === result) {
          flag = true;
          break;
        }
      }
      expect(flag).equals(true);
    });
  });
  it('copy file without name', async () => {
    const result = await addNewFile('testing-folder/creating-file', '', 'testing-folder/creating-file/1.txt');
    setTimeout(async () => {
      let flag = false;
      const search = await searchByNameAndExtension(result.substring(result.lastIndexOf('/')));
      for (let i = 0; i < search.length; i += 1) {
        if (search[i].location === result) {
          flag = true;
          break;
        }
      }
      expect(flag).equals(true);
    });
  });
});

describe('delete file or folder', async () => {
   await beforeEach( () => {
    if (fs.existsSync('testing-folder/deleting-file/2.txt')) {
      fs.unlinkSync('testing-folder/deleting-file/2.txt');
    }
    if (fs.existsSync('testing-folder/deleting-file/2')) {
      // deleteFileOrFolder('testing-folder/deleting-file/2');
      fsExtra.removeSync('testing-folder/deleting-file/2');

    }
    if (!fs.existsSync('testing-folder/deleting-file/1.txt')) {
      fs.closeSync(fs.openSync('testing-folder/deleting-file', '1.txt'));
    }
    if (!fs.existsSync('testing-folder/deleting-file/1')) {
      fs.mkdir("testing-folder/deleting-file/1");
    }
  });

  it('folder that exists', async () => {
    const result = await deleteFileOrFolder('testing-folder/deleting-file/1');
    expect(result).equals(true);
    setTimeout(async () => {
      const search = await searchByNameAndExtension('1');
      for (let i = 0; i < search.length; i += 1) {
        expect(search[i].location).not.equals('testing-folder/deleting-file/1');
      }
    }, 100);
  });

  it('file that exists', async () => {
    const result = await deleteFileOrFolder('testing-folder/deleting-file/1.txt');
    expect(result).equals(true);
    setTimeout(async () => {
      const search = await searchByNameAndExtension('1.txt');
      for (let i = 0; i < search.length; i += 1) {
        expect(search[i].location).not.equals('testing-folder/deleting-file/1.txt');
      }
    }, 100);
  });

  it('folder or file that does not exist', async () => {
    let flag = false;
    try {
      await deleteFileOrFolder('testing-file/deleting-file/2');
    } catch (e) {
      try {
        await deleteFileOrFolder('testing-file/deleting-file/2.txt');
      } catch (e2) {
        flag = true;
      }
    }

    expect(flag).equals(true);
  });
});

describe('rename file or folder', () => {
  beforeEach(async () => {
    if (fs.existsSync('testing-folder/renaming-file/2.txt')) {
      await deleteFileOrFolder('testing-folder/renaming-file/2.txt');
    }
    if (fs.existsSync('testing-folder/renaming-file/2')) {
      await deleteFileOrFolder('testing-folder/renaming-file/2');
    }
    if (!fs.existsSync('testing-folder/renaming-file/4.txt')) {
      await addNewFile('testing-folder/renaming-file/4.txt');
    }
    if (!fs.existsSync('testing-folder/renaming-file/4')) {
      await addNewFolder('testing-folder/renaming-file/4');
    }
  });

  it('file that exists', async () => {
    const fileName = Date.parse(new Date());
    await renameFileOrFolder('testing-file/renaming-file/1.txt', `${fileName}.txt`);
    let flag = true;
    setTimeout(async () => {
      const search = await searchByNameAndExtension(fileName);
      for (let i = 0; i < search.length; i += 1) {
        if (search[i].location === `esting-folder/renaming-file/${Date.parse(fileName)}.txt`) {
          flag = true;
        }
      }
      expect(flag).equals(true);
    }, 100);
  });
  it('folder that exists', async () => {
    await renameFileOrFolder('testing-file/renaming-file/1', Date.parse(new Date()));
    setTimeout(async () => {
      const search = await searchByNameAndExtension(Date.parse(new Date()));
      for (let i = 0; i < search.length; i += 1) {
        expect(search[i].location).not.equals('testing-folder/renaming-file/1');
      }
    }, 100);
  });
  it('folder or file that does not exist', async () => {
    let flag = false;
    try {
      await renameFileOrFolder('testing-file/renaming-file/2.txt', 'fail.txt');
    } catch (e) {
      try {
        await renameFileOrFolder('testing-file/renaming-file/2', 'fail');
      } catch (e2) {
        flag = true;
      }
    }
    expect(flag).equals(true);
  });
});
