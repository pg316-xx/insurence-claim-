const supabase = require('../services/supabase.service');

const getAllHospitals = async (req, res) => {
  try {
    const { data: hospitals, error } = await supabase.from('hospitals').select('*');
    if (error) throw error;
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hospitals', error: error.message });
  }
};

const getNetworkHospitals = async (req, res) => {
  try {
    const { data: hospitals, error } = await supabase.from('hospitals').select('*').eq('is_network', true);
    if (error) throw error;
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching network hospitals', error: error.message });
  }
};

module.exports = {
  getAllHospitals,
  getNetworkHospitals,
};
