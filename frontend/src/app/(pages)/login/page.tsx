import { LoginForm } from "@/components/feature/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="w-full h-screen bg-white flex flex-col font-sans text-neutral-800 relative overflow-hidden">
      {/* Optional subtle decorative element (1% celebration/gaming vibe) */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-14 pb-[34px] px-6 flex flex-col">
        <LoginForm />
      </main>
    </div>
  );
}
