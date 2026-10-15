import { SignupForm } from "@/components/signup-form"
import { BrandMark } from "@/components/brand-mark"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-8 p-6 md:p-10">
      <BrandMark className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-700" />

      <div className="w-full max-w-sm motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-3 motion-safe:delay-100 motion-safe:duration-700">
        <SignupForm />
      </div>
    </div>
  )
}
