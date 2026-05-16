import { IncomingForm } from 'formidable';
import fs from 'fs';

// Disable Next.js body parser so formidable can handle the stream
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    return res.status(500).json({ error: 'PINATA_JWT not configured' });
  }

  // 1 – Parse the incoming multipart form with formidable
  const form = new IncomingForm({ keepExtensions: true, maxFileSize: 100 * 1024 * 1024 });
  const [fields, files] = await form.parse(req);

  const uploaded = files.file?.[0];
  if (!uploaded) {
    return res.status(400).json({ error: 'No file received' });
  }

  // Extract optional metadata fields
  const description = fields.description?.[0] || '';
  const country = fields.country?.[0] || '';
  const timestamp = fields.timestamp?.[0] || new Date().toISOString();

  try {
    // 2 – Read file into a buffer, wrap in Blob, build native FormData
    const fileBuffer = fs.readFileSync(uploaded.filepath);
    const blob = new Blob([fileBuffer], { type: uploaded.mimetype || 'application/octet-stream' });

    const pinataForm = new FormData(); // Node 18+ global
    pinataForm.append('file', blob, uploaded.originalFilename || 'upload');
    pinataForm.append('pinataMetadata', JSON.stringify({
      name: uploaded.originalFilename || 'upload',
      keyvalues: {
        description,
        country,
        timestamp,
      },
    }));

    const pinataRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}` },
      body: pinataForm,
    });

    const data = await pinataRes.json();

    // Clean up the temp file
    fs.unlink(uploaded.filepath, () => {});

    if (!pinataRes.ok) {
      console.error('Pinata error:', data);
      return res.status(pinataRes.status).json({
        error: data?.error?.reason || data?.error?.details || 'Upload to Pinata failed',
      });
    }

    return res.status(200).json({
      cid: data.IpfsHash,
      name: uploaded.originalFilename || 'upload',
      size: data.PinSize,
      description,
      country,
      timestamp,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: err.message });
  }
}
