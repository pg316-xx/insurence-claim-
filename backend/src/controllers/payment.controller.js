const supabase = require('../services/supabase.service');

const getPremiumSchedule = async (req, res) => {
  try {
    const { data: schedule, error } = await supabase
      .from('policy_payments')
      .select('*')
      .eq('user_id', req.user.id)
      .order('due_date', { ascending: true });

    if (error) {
      // If table is missing, return empty array instead of crashing
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return res.json([]);
      }
      throw error;
    }
    res.json(schedule || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching schedule', error: error.message });
  }
};

const payPremium = async (req, res) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({ message: 'Payment ID is required' });

    const { data, error } = await supabase
      .from('policy_payments')
      .update({ 
        status: 'PAID', 
        payment_date: new Date() 
      })
      .eq('id', paymentId)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Premium paid successfully', payment: data });
  } catch (error) {
    res.status(500).json({ message: 'Error processing payment', error: error.message });
  }
};

const recordPayment = async (req, res) => {
  try {
    const { claimId, amount, paymentMode, transactionRef, paidTo } = req.body;
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        claim_id: claimId,
        amount: parseFloat(amount),
        payment_mode: paymentMode,
        transaction_ref: transactionRef,
        paid_to: paidTo,
        status: 'COMPLETED',
        paid_at: new Date()
      })
      .select().single();

    if (paymentError) throw paymentError;
    await supabase.from('claims').update({ status: 'SETTLED' }).eq('id', claimId);
    res.status(201).json({ message: 'Payment recorded', payment });
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

module.exports = {
  recordPayment,
  getPremiumSchedule,
  payPremium
};
