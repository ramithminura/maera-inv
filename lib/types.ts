export type SupplierType = 'gold' | 'gemstone' | 'findings' | 'other'
export type PurchaseType = 'lot' | 'single'
export type TreatmentType = 'None' | 'Heated' | 'Unheated' | 'Fracture Filled' | 'Beryllium Treated' | 'Other'
export type UserRole = 'admin' | 'staff' | 'sales'

export interface AlloyComponent {
  material: string
  percentage: number
  cost_per_gram_lkr: number
}

export interface Profile {
  id: string
  full_name: string | null
  role: UserRole
  created_at: string
}

export interface Supplier {
  id: string
  name: string
  type: SupplierType
  phone: string | null
  email: string | null
  notes: string | null
  created_at: string
}

export interface GoldPurchase {
  id: string
  purchase_date: string
  supplier_id: string | null
  weight_grams: number
  rate_lkr: number
  rate_usd: number | null
  total_cost_lkr: number
  remaining_grams: number
  notes: string | null
  created_at: string
  suppliers?: { name: string } | null
}

export interface AlloyConfig {
  id: string
  name: string
  gold_percentage: number
  components: AlloyComponent[]
  cost_per_gram_lkr: number
  is_active: boolean
  notes: string | null
  created_at: string
}

export interface GemstoneInventory {
  id: string
  stone_type: string
  shape: string
  shape_other: string | null
  purchase_type: PurchaseType
  total_carats: number
  num_pieces: number
  remaining_carats: number
  remaining_pieces: number
  unit_price_lkr: number
  unit_price_usd: number | null
  total_cost_lkr: number
  clarity: string | null
  colour: string | null
  has_certificate: boolean
  certificate_no: string | null
  treatment: TreatmentType
  treatment_other: string | null
  advisable_selling_price_lkr: number | null
  photos: string[]
  parent_lot_id: string | null
  purchase_date: string
  supplier_id: string | null
  notes: string | null
  created_at: string
  suppliers?: { name: string } | null
}

export interface Settings {
  id: string
  company_name: string
  gold_rate_per_gram_lkr: number
  exchange_rate_lkr_per_usd: number
  gold_low_stock_threshold: number
  updated_at: string
}
