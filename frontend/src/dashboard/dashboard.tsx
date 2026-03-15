import { useEffect, useState } from "react";
import axios from "axios";
import { InfoCard } from '../features/user/ProfilePage'
const API_URL = "https://localhost/api";

interface Profile {
  id: string;
  Firstname: string;
  Lastname: string;
  Username: string;
  profileImage: string;
}

interface Activity {
  id: string;
  title: string;
  categoryName: string;
  participantsCount: number;
  participantsLimit: number;
  isHappened: boolean;
}


const FUN_FACTS = [
  "Honey never spoils — archaeologists found 3,000-year-old honey in Egyptian tombs.",
  "A group of flamingos is called a 'flamboyance'.",
  "Octopuses have three hearts and blue blood.",
  "The Eiffel Tower can be 15 cm taller in summer due to thermal expansion.",
  "Bananas are slightly radioactive due to their potassium content.",
  "Cleopatra lived closer to the Moon landing than to the Great Pyramid.",
  "Wombat poop is cube-shaped.",
];

const CAT_COLORS: Record<string, string> = {
  wellness: "#34d399",
  art: "#a78bfa",
  fitness: "#f97316",
  social: "#38bdf8",
  education: "#facc15",
  learning: "#facc15",
  music: "#f472b6",
  sports: "#fb923c",
};

function InsightRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <p className="text-sm text-zinc-400 w-36 shrink-0 truncate">{label}</p>
      <div className="flex-1 bg-zinc-800 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${max > 0 ? (value / max) * 100 : 0}%`, background: color }}
        />
      </div>
      <p className="text-sm font-semibold w-6 text-right">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [keepers, setKeepers] = useState<any[]>([]);
  const [keepingUp, setKeepingUp] = useState<any[]>([]);
  const [fact, setFact] = useState("");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const date = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  useEffect(() => {
    setFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);

    const fetchData = async () => {
      try {
        const profileRes = await axios.get<Profile>(`${API_URL}/users/profile`, { withCredentials: true });
        const user = profileRes.data;
        setProfile(user);

        const [activitiesRes, keepersRes, keepingUpRes] = await Promise.all([
          axios.get<Activity[]>(`${API_URL}/activities/created-activities/${user.id}`, { withCredentials: true }),
          axios.get(`${API_URL}/keepups/followers/${user.id}`, { withCredentials: true }),
          axios.get(`${API_URL}/keepups/following/${user.id}`, { withCredentials: true }),
        ]);

        setActivities(activitiesRes.data);
        setKeepers(keepersRes.data);
        setKeepingUp(keepingUpRes.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const getJoiners = (a: Activity) => Math.max(0, a.participantsCount - 1);

  const totalReach = activities.reduce((s, a) => s + getJoiners(a), 0);
  const avgAttendees = activities.length ? Math.round(totalReach / activities.length) : 0;
  const topActivity = [...activities].sort((a, b) => getJoiners(b) - getJoiners(a))[0];
  const maxJoined = topActivity ? getJoiners(topActivity) : 1;
  const upcomingCount = activities.filter((a) => !a.isHappened).length;
  const happenedCount = activities.filter((a) => a.isHappened).length;
  const totalSlots = activities.reduce((s, a) => s + Math.max(0, a.participantsLimit - 1), 0);
  const fillRate = totalSlots > 0 ? Math.round((totalReach / totalSlots) * 100) : 0;

  const catMap: Record<string, number> = {};
  activities.forEach((a) => { catMap[a.categoryName] = (catMap[a.categoryName] || 0) + 1; });
  const topCategory = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121212]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-yellow-500 text-lg font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white min-h-screen bg-[#121212] flex justify-center pt-10">
      <div className="flex flex-col gap-10 w-full max-w-4xl px-8 pb-16">

        {/* Header */}
        <div className="flex items-end justify-between border-b border-zinc-800 pb-8">
          <div className="flex flex-col gap-1">
            <p className="text-zinc-500 text-xs uppercase tracking-widest">{greeting}</p>
            <h1 className="text-5xl font-bold">{profile.Firstname}</h1>
            <p className="text-zinc-500 text-sm mt-1">Here's what's happening with your account</p>
          </div>
          <p className="text-zinc-600 text-sm shrink-0">{date}</p>
        </div>

        {/* Fun Fact */}
        <div className="bg-[#1E1E1E] border border-zinc-800 rounded-2xl p-5 flex gap-4 items-start">
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-widest text-zinc-500">Fun Fact of the Day</p>
            <p className="text-sm text-zinc-300 leading-relaxed">{fact}</p>
          </div>
          <button
            onClick={() => setFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)])}
            className="ml-auto text-xs text-zinc-600 hover:text-zinc-400 transition-colors shrink-0"
          >
            shuffle ↻
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-widest text-zinc-500">Your Stats</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InfoCard title="Keepers" value={keepers.length} />
            <InfoCard title="Keeping Up" value={keepingUp.length} />
            <InfoCard title="Activities Created" value={activities.length} />
            <InfoCard title="Upcoming Activities" value={upcomingCount} />
            <InfoCard title="Past Activities" value={happenedCount} />
          </div>
        </div>

        {/* Analytics */}
        {activities.length > 0 && (
          <div className="flex flex-col gap-4">
            <p className="text-xs uppercase tracking-widest text-zinc-500">Activity Insights</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1E1E1E] rounded-2xl p-5 flex flex-col gap-1 border border-zinc-800">
                  <p className="text-xs text-zinc-500">Most Popular</p>
                  <p className="text-lg font-bold truncate">{topActivity?.title || "—"}</p>
                  <p className="text-xs text-zinc-600">{topActivity ? getJoiners(topActivity) : 0} joined</p>
                </div>
                <div className="bg-[#1E1E1E] rounded-2xl p-5 flex flex-col gap-1 border border-zinc-800">
                  <p className="text-xs text-zinc-500">Avg. Attendees</p>
                  <p className="text-3xl font-bold">{avgAttendees}</p>
                  <p className="text-xs text-zinc-600">per activity</p>
                </div>
                <div className="bg-[#1E1E1E] rounded-2xl p-5 flex flex-col gap-1 border border-zinc-800">
                  <p className="text-xs text-zinc-500">Top Category</p>
                  <p className="text-lg font-bold capitalize">{topCategory?.[0] || "—"}</p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold w-fit"
                    style={{
                      background: `${CAT_COLORS[topCategory?.[0]] || "#facc15"}22`,
                      color: CAT_COLORS[topCategory?.[0]] || "#facc15",
                    }}
                  >
                    {topCategory?.[1]} activit{topCategory?.[1] > 1 ? "ies" : "y"}
                  </span>
                </div>
                <div className="bg-[#1E1E1E] rounded-2xl p-5 flex flex-col gap-1 border border-zinc-800">
                  <p className="text-xs text-zinc-500">Fill Rate</p>
                  <p className="text-3xl font-bold">{fillRate}%</p>
                  <p className="text-xs text-zinc-600">of spots filled</p>
                </div>
              </div>

              <div className="bg-[#1E1E1E] rounded-2xl p-5 flex flex-col gap-4 border border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Attendees per Activity</p>
                <div className="flex flex-col gap-3">
                  {[...activities]
                    .sort((a, b) => getJoiners(b) - getJoiners(a))
                    .slice(0, 5)
                    .map((a) => (
                      <InsightRow
                        key={a.id}
                        label={a.title}
                        value={getJoiners(a)}
                        max={Math.max(maxJoined, 1)}
                        color={CAT_COLORS[a.categoryName] || "#facc15"}
                      />
                    ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}