
import { useState } from "react";
import landingImage from "../../assets/images/nana.webp";
import LoginModal from "../../features/auth/pages/LoginPage";

export default function PublicHero() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <section className="relative bg-gradient-to-br from-[#141414] via-[#141414] to-[#141414] py-32 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-600/20 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-purple-600/20 blur-3xl rounded-full"></div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-xl text-white">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              Connecting you with communities...
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">
                Finding activities?
              </span>
            </h1>

            <p className="mt-6 text-gray-300">
              Discover activities, events, and communities happening around you.
              Meet people and create unforgettable memories.
            </p>

            <button
              onClick={() => setLoginOpen(true)}
              className="mt-8 px-7 py-3 bg-gradient-to-r from-yellow-400 to-amber-400 text-black font-semibold rounded-xl shadow-lg hover:scale-105 transition"
            >
              Get Started
            </button>
          </div>
        </div>

        <img
          src={landingImage}
          alt="community"
          className="relative mx-auto mt-12 w-[280px] md:absolute md:right-[5%] md:top-1/2 md:-translate-y-1/2 md:w-[420px] xl:w-[400px]"
        />
      </section>
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
      />
    </>
  );
}