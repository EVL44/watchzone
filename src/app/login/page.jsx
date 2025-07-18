import { Suspense } from 'react';
import LoginForm from '@/components/LoginForm';

function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

export default LoginPage;