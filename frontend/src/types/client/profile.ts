//get 
export interface Profile {
  name: string;
  email: string;
  phone: string | null;
  role: string;
  bio: string;
  birth_date: string;
  gender: string;
  email_is_verified: boolean;
  avt: string;
}

// Update
export interface ProfileParams {
  name: string;
  email: string;
  phone: string;
  bio: string;
  birth_date: string;
  gender: string;
  avt: string;
  current_password?: string;
  new_password?: string;
  confirm_password?: string;
  address?: string | null;
}
