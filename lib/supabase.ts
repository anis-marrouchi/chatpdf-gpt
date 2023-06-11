import { createClient } from '@supabase/supabase-js'



export type Document = {
  id: string
  name?: string
  url: string
}
export const supabaseClient = (supabaseUrl: string, supabaseKey: string) => {
  // @ts-ignore
  const supabase = createClient(supabaseUrl, supabaseKey)
  return supabase
}
export const uploadToSubabase = async (file: any, supabaseUrl: string, supabaseKey: string, supabaseBucket: string) => {
  // @ts-ignore
  const supabase = supabaseClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .storage
      .from(supabaseBucket)
      .upload(`${Date.now()}.pdf`, file, {
        cacheControl: '3600',
        upsert: false
      })
    if (error) {
      console.log(error)
      return
    }
    return data
  }