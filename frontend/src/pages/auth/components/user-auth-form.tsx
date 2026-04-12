import { HTMLAttributes, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/button'
import { PasswordInput } from '@/components/custom/password-input'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'

interface UserAuthFormProps extends HTMLAttributes<HTMLDivElement> { }

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(1, {
      message: 'Please enter your password',
    })
    .min(7, {
      message: 'Password must be at least 7 characters long',
    }),
})

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login: authLogin } = useAuth()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      await authLogin(data.email, data.password)
      toast({
        title: 'Login Successful',
        description: 'Welcome back! Redirecting to dashboard...',
      })
      
      // For now, skip OTP and go directly to dashboard
      // If you want to keep 2FA, uncomment the following lines:
      // setPendingUser({ email: data.email, role: user.role })
      // setTimeout(() => navigate('/otp'), 1000)
      
      setTimeout(() => navigate('/'), 1000)
    } catch (error: any) {
      console.error('Login failed:', error)
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid email or password',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-6'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='space-y-2'>
                  <FormLabel className='text-[0.7rem] font-medium uppercase tracking-[0.08em] text-white/62'>
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='name@example.com'
                      className='h-12 rounded-none border-0 border-b border-white/28 bg-transparent px-0 py-0 text-base tracking-[-0.02em] text-white placeholder:text-white/34 focus-visible:border-white/60 focus-visible:ring-0'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <FormLabel className='text-[0.7rem] font-medium uppercase tracking-[0.08em] text-white/62'>
                      Password
                    </FormLabel>
                    <Link
                      to='/forgot-password'
                      className='text-xs font-medium tracking-[-0.01em] text-white/42 transition hover:text-white/72'
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput
                      placeholder='********'
                      className='h-12 rounded-none border-0 border-b border-white/28 bg-transparent px-0 py-0 pr-11 text-base tracking-[0.2em] text-white placeholder:text-white/34 focus-visible:border-white/60 focus-visible:ring-0'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className='ml-auto mt-6 h-20 w-20 rounded-full border border-black bg-white text-[0.68rem] font-semibold uppercase tracking-[0.04em] text-black shadow-[0_18px_30px_rgba(0,0,0,0.28)] transition hover:bg-white/90'
              loading={isLoading}
            >
              Login
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
