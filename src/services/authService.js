import { supabase } from './supabase';
export const signUpCitizen = async (name, email, password, phone) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        phone: phone || null,
      },
    },
  });

  if (error) throw error;

  return data;
};

export const loginCitizen = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", data.user.id)
    .single();

  if (profileError) {
    await supabase.auth.signOut();
    throw profileError;
  }

  if (profile.role !== "citizen") {
    await supabase.auth.signOut();
    throw new Error("This account is not authorized for citizen login.");
  }

  return { user: data.user, profile };
};    
export const loginAdmin = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", data.user.id)
    .single();

  if (profileError) {
    await supabase.auth.signOut();
    throw profileError;
  }

  if (profile.role !== "admin") {
    await supabase.auth.signOut();
    throw new Error("You are not authorized as an admin.");
  }

  return { user: data.user, profile };
};