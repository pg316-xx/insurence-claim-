const supabase = require('../services/supabase.service');

const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address, hospitalId } = req.body;

    // Sign up via Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: role || 'CUSTOMER',
        },
      },
    });

    if (error) throw error;

    // Profile is automatically created via SQL trigger
    // But we might want to update extra fields if trigger didn't handle them
    if (phone || address || hospitalId) {
      await supabase
        .from('profiles')
        .update({ phone, address, hospital_id: hospitalId })
        .eq('id', data.user.id);
    }

    res.status(201).json({
      message: 'User registered successfully. Please check your email for verification.',
      user: data.user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Fetch profile for role
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      message: 'Login successful',
      token: data.session.access_token,
      user: {
        ...data.user,
        role: profile.role,
        name: profile.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ message: 'Invalid credentials', error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*, hospitals(*)')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    res.json({ user: profile });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
