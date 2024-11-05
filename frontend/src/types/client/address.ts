export interface Province {
  code: number;
  name: string;
}

export interface District {
  code: number;
  name: string;
}

export interface Ward {
  code: number;
  name: string;
}

export interface Address {
  name: string;
  phone: string;
  province: Province | null;
  district: District | null;
  ward: Ward | null;
  detail: string;
  isDefault: boolean;
}
