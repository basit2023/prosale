// pages/api/upload.js

import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req:any, res:any) {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err:any, fields:any, files:any) => {
    if (err) {
      console.error('Error parsing form:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    const { file } = files;

    if (!file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    // Assuming your public/assets folder exists
    const filePath = `public/assets/${file.name}`;

    // Move the file to the desired folder
    fs.renameSync(file.path, filePath);

    res.status(200).json({ success: true });
  });
}
