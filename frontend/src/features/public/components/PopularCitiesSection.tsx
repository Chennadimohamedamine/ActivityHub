import { useState } from "react";

export default function PopularCitiesSection() {
  const [cities] = useState([
    {
      id: 1,
      name: "Casablanca",
      image: "/src/assets/images/casablanca.jpg",
    },
    {
      id: 2,
      name: "Rabat",
      image: "/src/assets/images/rabat.jpg",
    },
    {
      id: 3,
      name: "Paris",
      image: "/src/assets/images/paris.jpg",
    },
    {
      id: 4,
      name: "Madrid",
      image: "/src/assets/images/madrid.jpg",
    },
    {
      id: 5,
      name: "Berlin",
      image: "/src/assets/images/berlin.jpg",
    },
    {
      id: 6,
      name: "London",
      image: "/src/assets/images/london.jpg",
    },
  ]);

  return (
    <section >
      <h2 className="text-3xl md:text-4xl font-black text-white mb-12 text-center">
        Popular Cities on Aclivity Hub
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        {cities.map((city) => (
          <div
            key={city.id}
            className="relative h-40 rounded-2xl overflow-hidden
              border border-white/10 hover:border-[#FFC107]/50
              hover:shadow-lg hover:shadow-[#FFC107]/20
              transition-all duration-300 cursor-pointer"
          >
            {/* City image */}
            <img
              src={city.image}
              alt={city.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* City name */}
            <div className="relative h-full flex items-end p-4">
              <p className="text-lg font-bold text-white">{city.name}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
