const supabase = require('../services/supabase.service');

const uploadDocument = async (req, res) => {
  try {
    const { claimId, documentType } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'claims-docs';
    const filePath = `claims/${claimId}/${Date.now()}-${file.originalname}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) throw error;

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    // Save metadata to database
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        claim_id: claimId,
        file_url: publicUrl,
        document_type: documentType,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    res.status(201).json({ message: 'Document uploaded successfully', document });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
};

const getDocumentsByClaim = async (req, res) => {
  try {
    const { claimId } = req.params;
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('claim_id', claimId);

    if (error) throw error;
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
};

module.exports = {
  uploadDocument,
  getDocumentsByClaim,
};
