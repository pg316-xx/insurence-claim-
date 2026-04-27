const supabase = require('../services/supabase.service');

const getMyPolicies = async (req, res) => {
  try {
    const { data: policies, error } = await supabase
      .from('policies')
      .select('*')
      .eq('user_id', req.user.id);
    
    if (error) throw error;
    res.json(policies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching policies', error: error.message });
  }
};

const getPolicyByNumber = async (req, res) => {
  try {
    const { policyNumber } = req.params;
    const { data: policy, error } = await supabase
      .from('policies')
      .select('*, profiles:user_id(name, email)')
      .eq('policy_number', policyNumber)
      .single();

    if (error || !policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching policy', error: error.message });
  }
};

module.exports = {
  getMyPolicies,
  getPolicyByNumber,
};
