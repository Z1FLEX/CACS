import { HTMLAttributes, useState } from 'react'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/custom/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PinInput, PinInputField } from '@/components/custom/pin-input'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'

interface OtpFormProps extends HTMLAttributes<HTMLDivElement> {}

const formSchema = z.object({
  otp: z.string().min(1, { message: 'Please enter your otp code.' }),
})

// Valid OTP codes for testing
const VALID_OTP_CODES = ['123456', '000000', '111111', '999999', '654321']

export function OtpForm({ className, ...props }: OtpFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [disabledBtn, setDisabledBtn] = useState(true)
  const navigate = useNavigate()
  const { pendingUser, setUser } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { otp: '' },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    console.log('Verifying OTP:', data.otp)

    // Validate OTP
    if (!VALID_OTP_CODES.includes(data.otp)) {
      toast({
        title: 'Invalid OTP',
        description: 'The code you entered is incorrect. Try: 123456',
        variant: 'destructive',
      })
      form.reset()
      setIsLoading(false)
      return
    }

    // OTP verified successfully
    if (pendingUser) {
      setUser(pendingUser)
      toast({
        title: '2FA Verified',
        description: 'You are now logged in!',
      })
      setTimeout(() => {
        form.reset()
        navigate('/')
      }, 1000)
    } else {
      toast({
        title: 'Session Error',
        description: 'Please login again',
        variant: 'destructive',
      })
      setTimeout(() => navigate('/sign-in'), 1000)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <div className='text-xs text-muted-foreground mb-2'>
        <strong>Demo codes:</strong> 123456, 000000, 111111, 999999, 654321
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-2'>
            <FormField
              control={form.control}
              name='otp'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormControl>
                    <PinInput
                      {...field}
                      className='flex h-10 justify-between'
                      onComplete={() => setDisabledBtn(false)}
                      onIncomplete={() => setDisabledBtn(true)}
                    >
                      {Array.from({ length: 6 }, (_, i) => {
                        if (i === 3)
                          return <Separator key={i} orientation='vertical' />
                        return (
                          <PinInputField
                            key={i}
                            component={Input}
                            className={`${form.getFieldState('otp').invalid ? 'border-red-500' : ''}`}
                          />
                        )
                      })}
                    </PinInput>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='mt-2' disabled={disabledBtn} loading={isLoading}>
              Verify
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
