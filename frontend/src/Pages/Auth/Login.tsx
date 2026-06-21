import { useState } from 'react';
import type { FormEventHandler } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import InputError from '@/components/InputError';
import InputLabel from '@/components/InputLabel';
import PrimaryButton from '@/components/PrimaryButton';
import TextInput from '@/components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [portal, setPortal] = useState<'staff' | 'customer'>('staff');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        login(username, password, portal)
            .then(() => {
                setProcessing(false);
                if (portal === 'customer') {
                    navigate('/customer/dashboard');
                } else {
                    navigate('/dashboard');
                }
            })
            .catch((err) => {
                setProcessing(false);
                if (err.response && err.response.status === 422) {
                    setErrors(err.response.data.errors || {});
                } else if (err.response && err.response.data && err.response.data.message) {
                    setErrors({ username: [err.response.data.message] });
                } else {
                    setErrors({ username: ['An error occurred. Please try again.'] });
                }
            });
    };

    return (
        <GuestLayout>
            <div className="mb-6 flex rounded-lg bg-muted p-1">
                <button
                    type="button"
                    className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
                        portal === 'staff'
                            ? 'bg-white text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => {
                        setPortal('staff');
                        setErrors({});
                    }}
                >
                    Staff Login
                </button>
                <button
                    type="button"
                    className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
                        portal === 'customer'
                            ? 'bg-white text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => {
                        setPortal('customer');
                        setErrors({});
                    }}
                >
                    Customer Login
                </button>
            </div>

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="username" value="Username" />

                    <TextInput
                        id="username"
                        type="text"
                        name="username"
                        value={username}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <InputError message={errors.username?.[0]} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <InputError message={errors.password?.[0]} className="mt-2" />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton className="ms-4" disabled={processing}>
                        {processing ? 'Logging in...' : 'Log in'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
