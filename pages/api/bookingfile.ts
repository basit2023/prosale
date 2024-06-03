import { NextApiRequest, NextApiResponse } from 'next';
const formidable = require('formidable-serverless');
import fs from 'fs';

interface Files {
  [key: string]: {
    name: string;
    path: string;
    // Add other properties if needed
  };
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = new formidable.IncomingForm({
    keepExtensions: true,
    uploadDir: './public/assets/booking_file', // Make sure this folder exists
  });

  try {
    await new Promise<void>((resolve, reject) => {
      form.parse(req, (err: unknown, fields: any, files: Files) => {
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

        console.log(`public/assets/booking_file/${fileName}`);

        // Assuming your public/assets/booking_file folder exists
        const filePath = `public/assets/booking_file/${fileName}`;

        // Move the file to the desired folder
        fs.renameSync(files[fileKeys[0]].path, filePath);

        res.status(200).json({ success: true });
        resolve();
      });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
