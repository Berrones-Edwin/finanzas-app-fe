import { GuestGate } from "@/components/auth/guest-gate"
import { RegisterForm } from "@/components/auth/register-form"


export default function RegisterPage() {
  return (
    <GuestGate>
      <RegisterForm />
    </GuestGate>
  )
}
