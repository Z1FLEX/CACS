import { UserAuthForm } from './components/user-auth-form'

export default function SignIn() {
  const starRays = [0, 45, 90, 135]

  return (
    <div className='min-h-svh bg-[#ababab] px-4 py-4 font-styrene text-white sm:px-6 sm:py-6 lg:px-8 lg:py-7'>
      <div className='mx-auto flex min-h-[calc(100svh-2rem)] max-w-[1680px] rounded-[2rem] border border-[#161616] bg-black p-3 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:min-h-[calc(100svh-3rem)] sm:rounded-[2.5rem] sm:p-4 lg:min-h-[calc(100svh-3.5rem)] lg:rounded-[3rem]'>
        <div className='grid min-h-full w-full overflow-hidden rounded-[1.6rem] border border-[#111111] bg-black lg:grid-cols-[1.06fr_0.94fr] lg:rounded-[2rem]'>
          <section className='relative hidden border-r border-white/[0.08] lg:block'>
            <div className='absolute inset-0'>
              <div className='absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/[0.07]' />
              <div className='absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/[0.07]' />
              <div className='absolute left-1/2 top-1/2 h-[1px] w-[92%] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white/[0.05]' />
              <div className='absolute left-1/2 top-1/2 h-[1px] w-[92%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-white/[0.05]' />
            </div>

            <div className='relative flex h-full flex-col justify-between p-10 xl:p-12'>
              <p className='text-[1.65rem] font-medium tracking-[-0.04em] text-white'>
                SCAS
              </p>

              <div className='relative mx-auto h-48 w-48 xl:h-56 xl:w-56'>
                {starRays.map((rotation) => (
                  <span
                    key={rotation}
                    className='absolute left-1/2 top-1/2 block h-[4px] rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.25)]'
                    style={{
                      width: rotation % 90 === 0 ? '11rem' : '7.25rem',
                      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                    }}
                  />
                ))}
                {starRays.map((rotation) => (
                  <span
                    key={`${rotation}-stub`}
                    className='absolute left-1/2 top-1/2 block h-[4px] rounded-full bg-white'
                    style={{
                      width: '4.25rem',
                      transform: `translate(-50%, -50%) rotate(${rotation + 22.5}deg)`,
                    }}
                  />
                ))}
                <span className='absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white' />
              </div>

              <p className='text-xs text-white/30'>© SCAS 2026. All rights reserved.</p>
            </div>
          </section>

          <section className='flex min-h-[calc(100svh-4rem)] items-center justify-center p-4 sm:p-6 lg:min-h-0 lg:p-5 xl:p-6'>
            <div className='relative flex h-full min-h-[680px] w-full max-w-[720px] flex-col rounded-[1.85rem] border border-white/[0.06] bg-[#131313] px-6 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:px-8 sm:py-8 lg:px-9 lg:py-9 xl:px-10 xl:py-10'>
              <div className='pointer-events-none absolute left-[-12%] top-1/2 h-[36rem] w-[36rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_0%,_rgba(255,255,255,0.02)_30%,_transparent_65%)] opacity-70' />

              <div className='relative z-10 flex items-start justify-between'>
                <div className='lg:hidden'>
                  <p className='text-lg font-medium tracking-[-0.04em] text-white'>SCAS</p>
                </div>
              </div>

              <div className='relative z-10 mt-20 max-w-[420px] sm:mt-24 lg:mt-32'>
                <h1 className='text-5xl font-medium tracking-[-0.06em] text-white sm:text-6xl'>
                  Login
                </h1>
                <p className='mt-5 max-w-sm text-sm leading-6 text-white/46'>
                  Access your secure workspace with the same SCAS credentials you
                  already use.
                </p>
              </div>

              <div className='relative z-10 mt-12 max-w-[460px] sm:mt-14 lg:mt-16'>
                <UserAuthForm />
              </div>

              <p className='relative z-10 mt-auto pt-10 text-xs leading-5 text-white/34'>
                By signing in, you agree to our{' '}
                <a
                  href='/terms'
                  className='underline underline-offset-4 transition hover:text-white/80'
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href='/privacy'
                  className='underline underline-offset-4 transition hover:text-white/80'
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
