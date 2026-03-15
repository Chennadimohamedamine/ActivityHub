import { useState } from "react";
import {
  Laptop,
  Activity,
  Paintbrush,
  Music,
  Briefcase,
  Gamepad,
} from "lucide-react";


export default function ExploreCategoriesSection() {
  const [categories] = useState([
    {
      id: 1,
      title: "Tech",
      icon: Laptop,
      desc: "Workshops, conferences, and meetups for tech enthusiasts.",
    },
    {
      id: 2,
      title: "Sports",
      icon: Activity,
      desc: "Join local sports activities and stay active.",
    },
    {
      id: 3,
      title: "Art",
      icon: Paintbrush,
      desc: "Explore galleries, painting sessions, and creative workshops.",
    },
    {
      id: 4,
      title: "Music",
      icon: Music,
      desc: "Concerts, jam sessions, and music meetups.",
    },
    {
      id: 5,
      title: "Business",
      icon: Briefcase,
      desc: "Networking events and startup gatherings.",
    },
    {
      id: 6,
      title: "Gaming",
      icon: Gamepad,
      desc: "Game nights, tournaments, and online meetups.",
    },
  ]);

  return (
    <section >
      <h2 className="text-3xl md:text-4xl font-black text-white mb-12 text-center">
        Explore Popular Categories
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              className="p-6 rounded-2xl text-center cursor-pointer
              bg-slate-900/60 backdrop-blur border border-white/10
              hover:border-[#FFC107]/50 hover:shadow-lg hover:shadow-[#FFC107]/20
              hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex justify-center mb-3 text-[#FFC107]">
                <Icon size={32} />
              </div>
              <h3 className="font-semibold text-white text-lg">{cat.title}</h3>
              <p className="text-xs text-gray-300 mt-1">{cat.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
