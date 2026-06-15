export interface Customer {
    id: number;
    username: string | null;
    fullname: string | null;
    address: string | null;
    phonenumber: string | null;
    profile: string | null;
    batch: string | null;
    type: string | null;
    status: string;
    generated_by: string | null; // POS Owner
    last_login_at: string | null;
    created_at: string;
}

export interface Recharge {
    id: number;
    username: string;
    plan_name: string;
    recharged_on: string;
    expiration: string | null;
    status: string;
    method: string | null;
    router_name: string | null;
    type: string;
}

export interface Bandwidth {
    id: number;
    name: string;
    rate_down: number;
    rate_down_unit: 'Kbps' | 'Mbps';
    rate_up: number;
    rate_up_unit: 'Kbps' | 'Mbps';
}

export interface RouterModel {
    id: number;
    name: string;
    ip_address: string;
    username: string;
    api_port: number;
    use_ssl: boolean;
    description: string | null;
}

export interface Pool {
    id: number;
    pool_name: string;
    range_ip: string;
    router_name: string;
}

export interface Plan {
    id: number;
    name: string;
    type: 'Hotspot' | 'PPPOE';
    bandwidth_policy: 'Unlimited' | 'Limited' | null;
    limit_type: 'Time_Limit' | 'Data_Limit' | 'Both_Limit' | null;
    time_limit: number | null;
    time_unit: 'Mins' | 'Hrs' | null;
    data_limit: number | null;
    data_unit: 'MB' | 'GB' | null;
    bandwidth_id: number | null;
    bandwidth?: { id: number; name: string } | null;
    price: number | null;
    data_usage_gb: number;
    daily_quota: number;
    shared_users: number | null;
    validity: number;
    validity_unit: string | null;
    router_name: string | null;
    pool: string | null;
}

export interface Voucher {
    id: number;
    code: string;
    batch: string | null;
    type: 'Hotspot' | 'PPPOE';
    status: string;
    user_status: string;
    generated_by: string | null;
    issued_on: string | null;
    plan?: { id: number; name: string } | null;
}

export interface Transaction {
    id: number;
    invoice: string;
    username: string;
    plan_name: string;
    price: string;
    recharged_on: string;
    expiration: string | null;
    type: string;
}
