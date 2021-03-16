const { expect, assert } = require('chai');
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
        console.log("This location does not exist in folder but exists in db: ", location);
      }
      expect(fs.existsSync(location)).equals(true);
    }
  });

  it('extension search', async () => {
    const result = await searchByNameAndExtension('', 'txt');
    for (let i = 0; i < result.length; i += 1) {
      const { location } = result[i];
      if (!fs.existsSync(location)) {
        console.log("This location does not exist in folder but exists in db: ", location);
      }
      expect(fs.existsSync(location)).equals(true);
    }
  });

  it('name and extension search', async () => {
    const result = await searchByNameAndExtension('test', 'txt');
    for (let i = 0; i < result.length; i += 1) {
      const { location } = result[i];
      if (!fs.existsSync(location)) {
        console.log("This location does not exist in folder but exists in db: ", location);
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
    const result = await getSizeOfFileOrFolder('testing-folder/searching-file/test-file.txt');
    const data = (await fs.promises.stat('testing-folder/searching-file/test-file.txt')).size;
    expect(result[0].size).equals(data);
  });

  it('size of non-existing file/folder', async () => {
    const result = await getSizeOfFileOrFolder('testing-folder/abcd1234ijkl');
    const data = (await fs.existsSync('testing-folder/abcd1234ijkl'));
    expect(result).that.eql([]);
    expect(data).equals(false);
  });
});

describe('sort table', async () => {
  it('sort by default modifier: createdDate', async () => {
    const result = await sortTableByModifier();
    let flag = true;
    for (let i = 0; i < result.length - 1; i += 1) {
      expect(new Date(result[i].createdDate) >= new Date(result[i+1].createdDate)).equals(true);
    }
  });

  it('sort by name', async () => {
    const result = await sortTableByModifier('name');
    for (let i = 0; i < result.length - 1; i += 1) {
      expect(result[i].name >= result[i+1].name).equals(true);
    }
  });

  it('sort by name in asc', async () => {
    const result = await sortTableByModifier('name', 'asc');
    let flag = true;
    for (let i = 0; i < result.length - 1; i += 1) {
      expect(result[i].name <= result[i + 1].name).equals(true);
    }
  });
});

describe('add new folder', () => {
  
  it('add blank folder', async () => {
    const result = await addNewFolder('testing-folder/creating-file');
    const folderToSearch = result.substring(result.lastIndexOf('/')+1);
    
    setTimeout(async ()=>{
      const search = await searchByNameAndExtension(folderToSearch);
      for (let i = 0; i < search.length; i += 1) {
        setTimeout(()=>{
          expect(fs.existsSync(search[i].location)).equals(true);
        },100);
      }
    }, 1000);
  });

  it('add blank folder with name', async () => {
    let folderName = "blank-folder";
    if (fs.existsSync('testing-folder/creating-file/'+folderName)) {
       fsExtra.removeSync('testing-folder/creating-file/'+folderName);
    }
    let add = await addNewFolder('testing-folder/creating-file', folderName);
    setTimeout(async () => {
      const search = await searchByNameAndExtension(folderName);
      for (let i = 0; i < search.length; i += 1) {
        setTimeout(()=>{
          expect(fs.existsSync(search[i].location)).equals(true);
        },100);
      }
    }, 1000);
  });

  it('copy folder without name', async () => {
    let folderName = "copy-original-folder";
    if(!fsExtra.existsSync("testing-folder/creating-file/"+folderName)){
      fs.mkdirSync("testing-folder/creating-file/"+folderName);
    }
    const result = await addNewFolder('testing-folder/creating-file', '', 'testing-folder/creating-file/'+folderName);
    setTimeout(async () => {
      const search = await searchByNameAndExtension(result.substring(result.lastIndexOf('/')+1));
      for (let i = 0; i < search.length; i += 1) {
        setTimeout(()=>{
          expect(fs.existsSync(search[i].location)).equals(true);
        },100);
      }
    }, 1000);
  });

  // it('copy folder with name', async () => {
  //   const name = 'copy-folder';
  //   const result = await addNewFolder('testing-folder/creating-file', name, 'testing-folder/creating-file/1');

  //   setTimeout(async () => {
  //     const search = await searchByNameAndExtension(name);
      
  //     for (let i = 0; i < search.length; i += 1) {
  //       setTimeout(()=>{
  //         expect(fs.existsSync(search[i].location)).equals(true);
  //       },100);
  //     }
      
  //   }, 1000);
  // });
});

describe('add new file', () => {
  
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
    let fileName = "new-file"
    const result = await addNewFile('testing-folder/creating-file', fileName);
    setTimeout(async () => {
      let flag = false;
      const search = await searchByNameAndExtension(fileName);
      for (let i = 0; i < search.length; i += 1) {
        if (search[i].location === result) {
          flag = true;
          break;
        }
      }
      expect(flag).equals(true);
    });
  });

  // it('copy file with name', async () => {
  //   const result = await addNewFile('testing-folder/creating-file', 'created-file-copy', 'testing-folder/creating-file/1.txt');
  //   setTimeout(async () => {
  //     let flag = false;
  //     const search = await searchByNameAndExtension(result.substring(result.lastIndexOf('/')));
  //     for (let i = 0; i < search.length; i += 1) {
  //       if (search[i].location === result) {
  //         flag = true;
  //         break;
  //       }
  //     }
  //     expect(flag).equals(true);
  //   });
  // });
  // it('copy file without name', async () => {
  //   const result = await addNewFile('testing-folder/creating-file', '', 'testing-folder/creating-file/1.txt');
  //   setTimeout(async () => {
  //     let flag = false;
  //     const search = await searchByNameAndExtension(result.substring(result.lastIndexOf('/')));
  //     for (let i = 0; i < search.length; i += 1) {
  //       if (search[i].location === result) {
  //         flag = true;
  //         break;
  //       }
  //     }
  //     expect(flag).equals(true);
  //   });
  // });
});

describe('delete file or folder', () => {

  it('folder that exists', async () => {
    let folderName = "new-delete-folder";
    if (!fs.existsSync('testing-folder/deleting-file/'+folderName)) {
      fs.mkdirSync("testing-folder/deleting-file/"+folderName);
    }
    const result = await deleteFileOrFolder('testing-folder/deleting-file/'+folderName);
    const search = await searchByNameAndExtension(folderName);
    expect(result).equals(true);
    expect(search.length).equals(0);
  });

  it('file that exists', async () => {
    let fileName = "new-delete-file.txt";
    if (!fs.existsSync('testing-folder/deleting-file/'+fileName)) {
      fs.closeSync(fs.openSync('testing-folder/deleting-file/'+fileName, 'w+'));
    }
    const result = await deleteFileOrFolder('testing-folder/deleting-file/'+fileName);
    const search = await searchByNameAndExtension(fileName);
    expect(result).equals(true);
    expect(search.length).equals(0);
  });

  it('folder or file that does not exist', async () => {
    let folderName = "not-existing-folder";
    let fileName = "not-existing-file.txt";
    let flag = false;
    try{
      await deleteFileOrFolder('testing-file/deleting-file/'+folderName);
    }
    catch(e){
      try{
        await deleteFileOrFolder('testing-file/deleting-file/'+fileName);
      }
      catch(e2){
        flag = true
      }
    }
    expect(flag).equals(true);

  });
});

// describe('rename file or folder', () => {
//   beforeEach(() => {
//     if (fs.existsSync('testing-folder/renaming-file/2.txt')) {
//       fs.unlinkSync('testing-folder/renaming-file/2.txt');
//     }
//     if (fs.existsSync('testing-folder/renaming-file/2')) {
//       fsExtra.removeSync('testing-folder/renaming-file/2');
//     }
//     if (!fs.existsSync('testing-folder/renaming-file/new-file.txt')) {
//       fs.closeSync(fs.openSync('testing-folder/renaming-file/new-file.txt'));
//     }
//     if (!fs.existsSync('testing-folder/renaming-file/new-folder')) {
//       fs.mkdir('testing-folder/renaming-file/new-folder');
//     }
//   });

//   it('file that exists', async () => {
//     let fileName = "existing-file";
//     await renameFileOrFolder('testing-file/renaming-file/new-file.txt', `${fileName}.txt`);
//     let flag = true;
//     setTimeout(async () => {
//       const search = await searchByNameAndExtension(fileName);
//       for (let i = 0; i < search.length; i += 1) {
//         if (search[i].location === `esting-folder/renaming-file/${Date.parse(fileName)}.txt`) {
//           flag = true;
//         }
//       }
//       expect(flag).equals(true);
//     }, 100);
//   });
//   it('folder that exists', async () => {
//     let folderName = "existing-folder";
//     await renameFileOrFolder('testing-file/renaming-file/new-folder', folderName);
//     setTimeout(async () => {
//       const search = await searchByNameAndExtension(folderName);
//       for (let i = 0; i < search.length; i += 1) {
//         expect(search[i].location).not.equals(`testing-folder/renaming-file/${folderName}`);
//       }
//     }, 100);
//   });
//   it('folder or file that does not exist', async () => {
//     let flag = false;
//     try {
//       await renameFileOrFolder('testing-file/renaming-file/not-existing.txt', 'fail.txt');
//     } catch (e) {
//       try {
//         await renameFileOrFolder('testing-file/renaming-file/not-existing', 'fail');
//       } catch (e2) {
//         flag = true;
//       }
//     }
//     expect(flag).equals(true);
//   });
// });
