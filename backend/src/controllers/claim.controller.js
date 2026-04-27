const supabase = require('../services/supabase.service');

const createClaim = async (req, res) => {
  try {
    const { 
      policyId, hospitalId, type, diagnosis, 
      admissionDate, dischargeDate, amountClaimed,
      documents // Array of { url, type }
    } = req.body;

    const userId = req.user.id;

    // Check if policy exists
    const { data: policy, error: policyError } = await supabase
      .from('policies')
      .select('*')
      .eq('id', policyId || req.body.policy_id)
      .single();

    if (policyError || !policy) {
      return res.status(404).json({ message: 'Valid policy not found' });
    }

    const claimNumber = `CLM-${Date.now()}`;

    // 1. Create the claim
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .insert({
        claim_number: claimNumber,
        user_id: type === 'REIMBURSEMENT' ? userId : (policy.user_id || userId),
        policy_id: policyId || req.body.policy_id,
        hospital_id: hospitalId || req.body.hospital_id,
        type: type || req.body.type,
        diagnosis: diagnosis || req.body.diagnosis,
        admission_date: admissionDate || req.body.admission_date || null,
        discharge_date: dischargeDate || req.body.discharge_date || null,
        amount_claimed: parseFloat(amountClaimed || req.body.amount_claimed),
        status: 'SUBMITTED',
      })
      .select()
      .single();

    if (claimError) throw claimError;

    // 2. Add documents if any
    if (documents && documents.length > 0) {
      const docsToInsert = documents.map(doc => ({
        claim_id: claim.id,
        file_url: doc.url,
        file_name: doc.name || 'document',
        document_type: doc.type || 'OTHER'
      }));
      
      const { error: docError } = await supabase.from('documents').insert(docsToInsert);
      if (docError) console.error("Error inserting documents:", docError);
    }

    res.status(201).json({ message: 'Claim submitted successfully', claim });
  } catch (error) {
    console.error('Create claim error:', error);
    res.status(500).json({ message: 'Error creating claim', error: error.message });
  }
};

const getMyClaims = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = supabase
      .from('claims')
      .select('*, policies(*), hospitals(*), user:user_id(name, email)')
      .order('created_at', { ascending: false });

    if (userRole === 'HOSPITAL') {
      // Get the hospital_id for this user
      const { data: profile } = await supabase.from('profiles').select('hospital_id').eq('id', userId).single();
      if (profile?.hospital_id) {
        query = query.eq('hospital_id', profile.hospital_id);
      } else {
        return res.json([]); // No hospital linked
      }
    } else {
      // For CUSTOMERS, filter by user_id
      query = query.eq('user_id', userId);
    }

    const { data: claims, error } = await query;

    if (error) throw error;
    res.json(claims);
  } catch (error) {
    console.error("Fetch Claims Error:", error.message);
    res.status(500).json({ message: `Database Error: ${error.message}` });
  }
};

const getClaimQueue = async (req, res) => {
  try {
    const { data: claims, error } = await supabase
      .from('claims')
      .select('*, user:user_id(name, email), policies(*), hospitals(*)')
      .in('status', ['SUBMITTED', 'UNDER_REVIEW', 'NEED_MORE_INFO'])
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching queue', error: error.message });
  }
};

const getAllClaims = async (req, res) => {
  try {
    const { data: claims, error } = await supabase
      .from('claims')
      .select('*, user:user_id(name, email), policies(*), hospitals(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all claims', error: error.message });
  }
};

const getClaimById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: claim, error } = await supabase
      .from('claims')
      .select(`
        *,
        user:user_id(name, email, phone, address),
        policy:policy_id(*),
        hospital:hospital_id(*),
        documents(*),
        reviews:claim_reviews(
          *,
          reviewer:reviewer_id(name, role)
        ),
        payment:payments(*)
      `)
      .eq('id', id)
      .single();

    if (error || !claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // RBAC check
    const isOwner = claim.user_id === req.user.id;
    const isStaff = ['TPA', 'ADMIN', 'HOSPITAL'].includes(req.user.role);

    if (req.user.role === 'CUSTOMER' && !isOwner) {
      return res.status(403).json({ message: 'Unauthorized. You can only view your own claims.' });
    }
    
    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: 'Unauthorized access.' });
    }

    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching claim details', error: error.message });
  }
};

const updateClaimStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments, comment, amountApproved } = req.body;
    const reviewComment = comments || comment || 'Status updated';
    const reviewerId = req.user.id;
    const reviewerRole = req.user.role;

    // Get current claim
    const { data: claim } = await supabase.from('claims').select('status, amount_approved').eq('id', id).single();
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    // Create review log
    await supabase.from('claim_reviews').insert({
      claim_id: id,
      reviewer_id: reviewerId,
      role: reviewerRole,
      status_before: claim.status,
      status_after: status,
      comments: reviewComment,
    });

    // Update claim
    const updatePayload = {
      status,
      last_status_change_at: new Date(),
    };

    if (amountApproved !== undefined) {
      updatePayload.amount_approved = parseFloat(amountApproved);
    }

    const { data: updatedClaim, error: updateError } = await supabase
      .from('claims')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({ message: `Claim status updated to ${status}`, claim: updatedClaim });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};

module.exports = {
  createClaim,
  getMyClaims,
  getClaimQueue,
  getAllClaims,
  getClaimById,
  updateClaimStatus,
};
