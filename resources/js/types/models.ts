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
