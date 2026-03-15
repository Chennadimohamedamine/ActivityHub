export default function SuggestedSection() {
  return (
    <section
      className="relative overflow-hidden rounded-3xl
      bg-gradient-to-r from-[#FFC107]/10 to-[#FFD54F]/10
      border border-[#FFC107]/30 p-14 text-center"
    >
      <h2 className="text-3xl md:text-4xl font-black text-white">
        Prêt à commencer ?
      </h2>

      <p className="mt-4 text-gray-300 max-w-xl mx-auto">
        Rejoignez des milliers de membres et découvrez votre prochaine activité.
      </p>

      <div className="mt-8 flex justify-center gap-4 flex-wrap">
        <button className="px-8 py-3 rounded-xl font-semibold text-slate-900
          bg-gradient-to-r from-[#FFC107] to-[#FFD54F]
          hover:scale-105 transition">
          Explorer les activités
        </button>

        <button className="px-8 py-3 rounded-xl border border-white/20
          hover:border-[#FFC107]/60 transition">
          Créer un événement
        </button>
      </div>
    </section>
  );
}
