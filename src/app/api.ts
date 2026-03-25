import { supabase } from '../lib/supabase';

export const checkHealth = async () => {
  return { status: 'ok', message: 'Supabase client running' };
};

export const signup = async (data: {
  email: string;
  name: string;
  role: string;
  password?: string;
  city?: string;
  industry?: string;
  investmentRange?: string;
}) => {
  if (!data.password) throw new Error('Password is required');
  
  const [firstName, ...lastNameParts] = data.name.split(' ');
  const lastName = lastNameParts.join(' ');

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName || '',
        role: data.role.toUpperCase(),
        industry: data.industry,
        investment_range: data.investmentRange,
        city: data.city,
      }
    }
  });

  if (authError) throw new Error(authError.message);
  
  return { 
    success: true, 
    user: { 
      id: authData.user?.id, 
      email: authData.user?.email, 
      name: data.name, 
      role: data.role.toUpperCase() 
    } 
  };
};

export const login = async (email: string, password?: string) => {
  if (!password) throw new Error('Password is required');
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) throw new Error(authError.message);

  // Fetch from the unified profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError || !profile) {
    // Profile might not exist yet if trigger hasn't fired; use auth metadata
    const meta = authData.user.user_metadata;
    return {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: `${meta?.first_name || ''} ${meta?.last_name || ''}`.trim() || 'User',
        role: meta?.role || 'FOUNDER'
      }
    };
  }

  return { 
    success: true, 
    user: { 
      id: profile.id, 
      email: profile.email, 
      name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User', 
      role: profile.role || 'FOUNDER'
    } 
  };
};

export const fetchUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['FOUNDER', 'INVESTOR'])
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []).map((p: any) => ({
    ...p,
    first_name: p.first_name || 'User',
    last_name: p.last_name || '',
  }));
};

export const fetchUser = async (id: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) throw new Error("User not found");
  return data;
};

export const updateUser = async (id: string, updateData: any) => {
  const { role, industry, investment_range, bio, ...profileData } = updateData;
  
  // Update the profiles table
  if (Object.keys(profileData).length > 0) {
    const { error } = await supabase
      .from('profiles')
      .update({ ...profileData, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(error.message);
  }

  // Update role-specific table
  if (role === 'FOUNDER' || role === 'founder') {
    const founderUpdate: any = {};
    if (industry !== undefined) founderUpdate.industry = industry;
    if (bio !== undefined) founderUpdate.bio = bio;
    if (Object.keys(founderUpdate).length > 0) {
      await supabase.from('founders').update(founderUpdate).eq('id', id);
    }
  } else if (role === 'INVESTOR' || role === 'investor') {
    const investorUpdate: any = {};
    if (investment_range !== undefined) investorUpdate.investment_range = investment_range;
    if (bio !== undefined) investorUpdate.bio = bio;
    if (Object.keys(investorUpdate).length > 0) {
      await supabase.from('investors').update(investorUpdate).eq('id', id);
    }
  }

  // Return updated profile
  const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
  return data;
};

export const deleteProfile = async (id: string) => {
  // Deleting from profiles cascades to founders/investors
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
};

export const fetchAllProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []).map((p: any) => ({
    ...p,
    first_name: p.first_name || 'User',
    last_name: p.last_name || '',
  }));
};

export const fetchGlobalStats = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role');

  if (error) throw new Error(error.message);

  const profiles = data || [];
  const founders = profiles.filter((p: any) => p.role === 'FOUNDER').length;
  const investors = profiles.filter((p: any) => p.role === 'INVESTOR').length;
  
  return {
    total: founders + investors,
    founders,
    investors,
    admins: profiles.filter((p: any) => p.role === 'ADMIN').length,
  };
};

// Simple email masking for sensitive data display
export const maskEmail = (email: string) => {
  if (!email) return '';
  const [user, domain] = email.split('@');
  if (!user || !domain) return email;
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
};
