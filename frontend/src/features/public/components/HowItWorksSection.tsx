import { useState } from "react";
import { UserPlus, CalendarCheck, MessageCircle } from "lucide-react";

export default function HowItWorksSection() {
  const [steps] = useState([
    {
      id: 1,
      title: "Create an account",
      desc: "Sign up for free in just a few seconds",
      icon: UserPlus,
    },
    {
      id: 2,
      title: "Join an activity",
      desc: "Browse and participate in events",
      icon: CalendarCheck,
    },
    {
      id: 3,
      title: "Chat & connect",
      desc: "Engage with participants in real-time",
      icon: MessageCircle,
    },
  ]);

  return (
    <section >
      <h2 className="text-3xl md:text-4xl font-black text-white mb-16 text-center">
        How It Works
      </h2>

      <div className="grid md:grid-cols-3 gap-10">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className="p-8 rounded-2xl
                bg-slate-900/60 backdrop-blur
                border border-white/10
                hover:border-[#FFC107]/50 hover:shadow-lg hover:shadow-[#FFC107]/20
                hover:-translate-y-1 transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#FFC107]/20 text-[#FFC107] mb-4">
                <Icon size={24} />
              </div>

              {/* Step number */}
              <span className="text-[#FFC107] font-black text-lg">
                Step {i + 1}
              </span>

              {/* Title */}
              <h3 className="mt-2 text-xl font-bold text-white">
                {step.title}
              </h3>

              {/* Description */}
              <p className="mt-2 text-gray-400">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
