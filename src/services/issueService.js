import { supabase } from './supabase';

export const uploadIssueImage = async (file, userId) => {
  const fileName = `${userId}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from('issue-images')
    .upload(fileName, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from('issue-images')
    .getPublicUrl(fileName);

  return data.publicUrl;
};

export const createIssue = async (issueData) => {
  const { data, error } = await supabase
    .from('issues')
    .insert([issueData])
    .select()
    .single();

  if (error) throw error;

  return data;
};

