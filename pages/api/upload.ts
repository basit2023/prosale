const formidable = require('formidable-serverless');
const fs = require('fs');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req:any, res:any) {
  console.log("I'm hearing from uploadjs");

  const form = new formidable.IncomingForm({
    keepExtensions: true,
    uploadDir: './public/assets', // Make sure this folder exists
  });

  try {
    await new Promise<void>((resolve, reject) => {
      form.parse(req, (err:any, fields:any, files:any) => {
        if (err) {
          console.error('Error parsing form:', err);
          reject(new Error('Internal Server Error'));
          return;
        }

        // Extracting the name of the file
        const fileKeys = Object.keys(files);
        const fileName = fileKeys.length > 0 ? files[fileKeys[0]].name : null;
        if (!fileName) {
          res.status(400).json({ error: 'No file provided' });
          resolve();
          return;
        }

        console.log(`public/assets/${fileName}`);

        // Assuming your public/assets folder exists
        const filePath = `public/assets/${fileName}`;

        // Move the file to the desired folder
        fs.renameSync(files[fileName].path, filePath);

        res.status(200).json({ success: true });
        resolve();
      });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}





// const formidable = require('formidable-serverless');
// const fs = require('fs');

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export default async function handler(req, res) {
//   console.log("I'm hearing from uploadjs");

//   const form = new formidable.IncomingForm({
//     keepExtensions: true,
//     uploadDir: './public/assets', // Make sure this folder exists
//   });

//   form.parse(req, async (err, fields, files) => {
//     if (err) {
//       console.error('Error parsing form:', err);
//       res.status(500).json({ error: 'Internal Server Error' });
//       return;
//     }

//     const { file } = files;
//     const filesData = files
    
//     // Extracting the name of the file
//     const fileName = Object.values(filesData)[0].name;
//     console.log('File name:', fileName);
//     if (!fileName) {
//       res.status(400).json({ error: 'No file provided' });
//       return;
//     }

//     console.log(`public/assets/${fileName}`);

//     // Assuming your public/assets folder exists
//     const filePath = `public/assets/${fileName}`;

//     // Move the file to the desired folder
//     fs.renameSync(file.path, filePath);

//     res.status(200).json({ success: true });
//   });
// }
