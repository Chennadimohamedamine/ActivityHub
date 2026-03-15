import { useEffect, useState } from 'react';
import { getFeedActivities } from '../../activity/services/activities.api';
import ActivityCard from '../../activity/components/activity-card/ActivityCard';
import { Link } from 'react-router-dom';

export default function Feed() {
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
        const data = await getFeedActivities();
        setActivities(data);
        const map: { [key: string]: boolean } = {};
        data.forEach((act: any) => {
          map[act.creator.id] = act.creator.isFollowing;
        });
        setFollowingMap(map);
      } catch (error) {
        console.error('Error fetching activities:', error);
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
        <p className="text-sm font-medium tracking-wide">Loading explore...</p>
      </div>
    );
  }

  return (
    <main className="flex flex-col px-4 md:px-8 mb-10 mt-4 md:mt-10">
      {activities.length === 0 ? (
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
              d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
            />
          </svg>

          <div className="flex flex-col gap-1">
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-100 font-bold">Your feed is empty</h2>
            <p className="text-amber-100/60 text-sm max-w-[450px] leading-relaxed">
              Keep up with creators to see their latest activities in your feed.
            </p>
          </div>
          <Link
            to="/dashboard/explore"
            className="mt-1 px-5 py-2 rounded-full border border-neutral-200/30 text-orange-200 hover:text-orange-100 hover:border-white/25 text-sm font-medium transition-all duration-300"
          >
            Explore creators
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex items-center justify-between lg:px-20">
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-100">
                Latest Activities
              </h1>
              <p className="text-sm text-white/50">
                Latest updates from people you keep up with.
              </p>

            </div>

              <Link
                to="/dashboard/explore"
                className="hidden md:flex items-center gap-1 text-sm font-medium text-white/50 transition-colors hover:text-orange-500/80"
              >
                Discover more
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>

          </div>

          {/* activities grid */}
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