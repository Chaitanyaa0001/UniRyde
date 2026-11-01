
import Link from "next/link";

const steps = [
  {
    number: "1",
    icon: "🚘",
    title: "Post or find a carpool",
    description:
      "Owners post a route and departure time; riders browse active carpools.",
  },
  {
    number: "2",
    icon: "🔔",
    title: "Send a request",
    description:
      "Found a ride that fits? Request to join with one tap.",
  },
  {
    number: "3",
    icon: "👤",
    title: "Owner accepts",
    description:
      "The carpool owner reviews requests and accepts who fits.",
  },
  {
    number: "4",
    icon: "💬",
    title: "Chat opens",
    description:
      "Once accepted, a private chat opens to sort out the details.",
  },
];

const benefits = [
  {
    icon: "🎓",
    title: "Students only",
    description:
      "A carpool feed built around campus life, hostels and class schedules.",
  },
  {
    icon: "🤝",
    title: "Split the cost",
    description:
      "Every ride shows how many people are needed so costs divide fairly.",
  },
  {
    icon: "🗓️",
    title: "Flexible timing",
    description:
      "Post rides around lectures, exams and weekend trips.",
  },
  {
    icon: "💬",
    title: "Built-in chat",
    description:
      "Chat opens automatically for every accepted request — no external apps.",
  },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#009F9F] text-lg text-white">
        🚘
      </span>
      <span className="text-lg font-bold tracking-tight text-[#292F3A]">
        UniRyde
      </span>
    </Link>
  );
}

export default function Home() {
  
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-[#292F3A]">

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6">
          <Logo />

          <div className="flex items-center gap-5">
            <Link
              href="/login"
              className="text-sm font-medium transition hover:text-[#009F9F]"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="rounded-xl bg-[#009F9F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#008888]"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">

        {/* Hero Section */}
        <section className="flex min-h-[465px] flex-col items-center justify-center px-6 py-24 text-center">
          <span className="mb-5 rounded-full bg-[#EAF5F5] px-4 py-1 text-xs font-semibold text-[#285B5B]">
            For university students
          </span>

          <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.12] tracking-tight sm:text-6xl">
            Share the ride.{" "}
            <span className="text-[#009F9F]">Split the cost.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-gray-500 sm:text-lg">
            UniRyde helps students post carpools, find rides to campus
            or the airport, and settle every trip with a quick chat.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="flex items-center gap-2 rounded-xl bg-[#009F9F] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#008888]"
            >
              Get started <span>→</span>
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold shadow-sm transition hover:bg-gray-50"
            >
              Login
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-[#F5F9FA] px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">
              How it works
            </h2>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="relative rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="absolute right-5 top-3 text-3xl font-bold text-gray-300">
                    {step.number}
                  </span>

                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5F5F5] text-xl">
                    {step.icon}
                  </div>

                  <h3 className="mb-2 font-semibold">{step.title}</h3>

                  <p className="text-sm leading-6 text-gray-500">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why UniRyde */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">
              Why students ride together
            </h2>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#DDF7F7] text-xl">
                    {benefit.icon}
                  </div>

                  <h3 className="mb-2 font-semibold">{benefit.title}</h3>

                  <p className="text-sm leading-6 text-gray-500">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-gray-200 px-6 py-14 text-center">
          <p className="mb-5 text-base font-medium text-[#009F9F]">
            <span className="mr-2">⌕</span>
            Ready for your next ride?
          </p>

          <Link
            href="/signup"
            className="inline-flex rounded-xl bg-[#009F9F] px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#008888]"
          >
            Create your account
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-[#F5F9FA] px-6 py-7">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 md:flex-row">
          <Logo />
<p className="text-center text-sm text-gray-500">
  &copy; 2026 UniRyde. Built for students, by students.
</p>
          <div className="flex items-center gap-5 text-sm text-gray-500">
            <Link href="/about" className="transition hover:text-[#009F9F]">
              About
            </Link>
            <Link href="/privacy" className="transition hover:text-[#009F9F]">
              Privacy
            </Link>
            <Link href="/contact" className="transition hover:text-[#009F9F]">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
