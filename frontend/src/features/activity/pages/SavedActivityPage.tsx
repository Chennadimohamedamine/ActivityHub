import { useEffect, useState } from 'react';
import { getSavedActivities } from '../services/activities.api';
import ActivityCard from '../components/activity-card/ActivityCard';
import { Link } from 'react-router-dom';

export default function SavedActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState<{ [key: string]: boolean }>({});

  const toggleFollow = (creatorId: string) => {
    setFollowingMap((prev) => ({
      ...prev,
      [creatorId]: !prev[creatorId],
    }));
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await getSavedActivities();
        setActivities(data);

        const map: { [key: string]: boolean } = {};
        data.forEach((act: any) => {
          map[act.creator.id] = act.creator.isFollowing;
        });

        setFollowingMap(map);
      } catch (error) {
        console.error('Error fetching saved activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center mt-32 text-gray-500 w-full">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium tracking-wide">Loading saved activities...</p>
      </div>
    );
  }

  return (
    <main className="flex flex-col px-4 md:px-8 mb-10 mt-4 md:mt-10">

      {activities.length === 0 ? (
        /* EMPTY STATE */
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">

          <svg
            className="w-14 h-14 text-orange-200/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 5v14l7-5 7 5V5z"
            />
          </svg>

          <div className="flex flex-col gap-1">
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-100 font-bold">
              No saved activities
            </h2>

            <p className="text-amber-100/60 text-sm max-w-[420px] leading-relaxed">
              Save activities you like to easily find them later.
            </p>
          </div>

          <Link
            to="/dashboard/explore"
            className="mt-1 px-5 py-2 rounded-full border border-neutral-200/30 text-orange-200 hover:text-orange-100 hover:border-white/25 text-sm font-medium transition-all duration-300"
          >
            Explore activities
          </Link>
        </div>
      ) : (
        /* ACTIVITIES */
        <div className="flex flex-col gap-8">

          {/* Header */}
          <div className="flex items-center justify-between">

            <div className="flex flex-col">
              <h1 className="text-xl font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-100">
                Saved Activities
              </h1>

              <p className="text-sm text-white/50">
                {activities.length} saved {activities.length === 1 ? 'activity' : 'activities'}
              </p>
            </div>

            <Link
              to="/dashboard/explore"
              className="hidden md:flex items-center gap-1 text-sm font-medium text-white/50 transition-colors hover:text-orange-500/80"
            >
              Discover more
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>

          </div>

          {/* Grid */}
          <div className="flex gap-6 md:gap-8 flex-wrap items-start justify-center w-full">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isFollowing={followingMap[activity.creator.id]}
                toggleFollow={toggleFollow}
              />
            ))}
          </div>

        </div>
      )}
    </main>
  );
}