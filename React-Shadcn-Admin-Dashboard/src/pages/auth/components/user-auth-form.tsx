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
    console.log('Submitting form...', data)
    try {
      await authLogin(data.email, data.password)
      console.log('Login successful, navigating to dashboard')
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
    <div className={cn('grid gap-5', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel className='text-slate-700'>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='name@example.com'
                      className='h-11 border-slate-300 bg-white focus-visible:ring-slate-900'
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
                <FormItem className='space-y-1'>
                  <div className='flex items-center justify-between'>
                    <FormLabel className='text-slate-700'>Password</FormLabel>
                    <Link
                      to='/forgot-password'
                      className='text-sm font-medium text-slate-500 transition hover:text-slate-900'
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput
                      placeholder='********'
                      className='h-11 border-slate-300 bg-white focus-visible:ring-slate-900'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='mt-2 h-11 w-full bg-slate-900 text-white hover:bg-slate-800' loading={isLoading}>
              Login
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
