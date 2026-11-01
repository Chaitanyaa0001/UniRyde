
type AuthVisualProps = {
  mode: "login" | "signup";
};
import Link from "next/link";

export default function AuthVisual({ mode: _mode }: AuthVisualProps) {
  void _mode;
  return (
    <section
      className="relative hidden min-h-screen overflow-hidden bg-[#123B3B] bg-cover bg-center lg:flex lg:w-1/2"
      style={{
        backgroundImage: `
          linear-gradient(
            180deg,
            rgba(8, 30, 32, 0.15),
            rgba(8, 30, 32, 0.88)
          ),
          url('/images/campus-auth.webp')
        `,
      }}
    >
      <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00A5A5] text-2xl text-white">
            🚘
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            UniRyde
          </span>
        </Link>

        {/* Main content */}
        <div className="max-w-lg pb-10">
          <span className="inline-block rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md">
            🎓 Made for university life
          </span>

          <h1 className="mt-7 text-5xl font-bold leading-tight tracking-tight text-white xl:text-6xl">
            Your campus.
            <br />
            Your people.
            <br />
            <span className="text-[#43D5CD]">
              Your ride.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-lg leading-8 text-white/75">
            Connect with fellow students, share your journey,
            save money and make every ride a little more social.
          </p>

          <div className="mt-9 flex items-center gap-4">
            <div className="flex -space-x-3">
              {["C", "A", "R", "S"].map((letter) => (
                <div
                  key={letter}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#174344] bg-[#D7F4EF] text-sm font-bold text-[#176B68]"
                >
                  {letter}
                </div>
              ))}
            </div>

            <p className="text-sm text-white/80">
              Better journeys start together.
            </p>
          </div>
        </div>

        <p className="text-sm text-white/50">
          © 2026 UniRyde. Built for students, by students.
        </p>
      </div>
    </section>
  );
}
