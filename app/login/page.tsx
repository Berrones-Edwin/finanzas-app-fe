import { GuestGate } from "@/components/auth/guest-gate"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <GuestGate>
      <LoginForm />
    </GuestGate>
  )
}
