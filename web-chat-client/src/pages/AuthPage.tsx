import {useState} from 'react';
import {LoginForm} from '../components/auth/LoginForm';
import {RegisterForm} from '../components/auth/RegisterForm';

export function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                        {isLogin ? 'Sign in to your account' : 'Create your account'}
                    </h2>
                </div>
                {isLogin ? <LoginForm/> : <RegisterForm/>}
                <div className="text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-blue-600 hover:text-blue-500"
                    >
                        {isLogin ? 'Need an account? Register' : 'Already have an account? Sign in'}
                    </button>
                </div>
            </div>
        </div>
    );
}