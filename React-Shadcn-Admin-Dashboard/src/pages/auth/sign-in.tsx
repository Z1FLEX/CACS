import { UserAuthForm } from './components/user-auth-form'

export default function SignIn() {
  return (
    <div className='relative min-h-svh overflow-hidden bg-slate-50'>
      <div className='pointer-events-none absolute -left-28 -top-24 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl' />
      <div className='pointer-events-none absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl' />

      <div className='grid min-h-svh lg:grid-cols-2'>
        <section className='hidden lg:flex lg:flex-col lg:justify-between lg:border-r lg:border-slate-200 lg:bg-gradient-to-br lg:from-slate-900 lg:to-slate-800 lg:p-14 lg:text-slate-100'>
          <div>
            <p className='text-xs uppercase tracking-[0.22em] text-slate-300'>SCAS</p>
            <h1 className='mt-6 max-w-md text-4xl font-semibold leading-tight'>
              Centralized access control, simplified.
            </h1>
            <p className='mt-4 max-w-md text-sm text-slate-300'>
              Manage users, cards, zones, and permissions in one secure workspace.
            </p>
          </div>
          <p className='text-sm text-slate-400'>Secure Access Platform</p>
        </section>

        <section className='flex items-center justify-center p-6 sm:p-10'>
          <div className='w-full max-w-md rounded-2xl border border-slate-200 bg-white/90 p-7 shadow-xl shadow-slate-200/50 backdrop-blur sm:p-8'>
            <div className='mb-6'>
              <p className='text-xs uppercase tracking-[0.2em] text-slate-500'>Welcome Back</p>
              <h2 className='mt-2 text-3xl font-semibold tracking-tight text-slate-900'>Sign in</h2>
              <p className='mt-2 text-sm text-slate-600'>
                Enter your email and password to access your account.
              </p>
            </div>
            <UserAuthForm />
            <p className='mt-6 text-center text-sm text-slate-500'>
              By signing in, you agree to our{' '}
              <a
                href='/terms'
                className='underline underline-offset-4 transition hover:text-slate-900'
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href='/privacy'
                className='underline underline-offset-4 transition hover:text-slate-900'
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
