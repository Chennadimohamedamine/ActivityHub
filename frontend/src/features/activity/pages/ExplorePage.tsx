import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import ActivityCard from '../components/activity-card/ActivityCard';
import { getSearchedActivities } from '../services/activities.api';
import { useCategories } from '../hooks/useCategories';
import { useAuthContext } from '../../auth/context/AuthProvider';

export default function ExplorePage() {
  const [categoryQuery, setCategoryQuery] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [sortByQuery, setSortByQuery] = useState('');

  const [activities, setActivities] = useState<any[]>([]);

  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState<{ [key: string]: boolean }>({});

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const allCategories = ["All", ...categories];
  const loading = activitiesLoading;

  const toggleFollow = (creatorId: string) => {
    setFollowingMap((prev) => ({
      ...prev,
      [creatorId]: !prev[creatorId],
    }));
  };

  // pagination 
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;
  const [loadingMore, setLoadingMore] = useState(false);

  
  const fetchActivities = async (
  cat = categoryQuery,
  search = searchQuery,
  location = locationQuery,
  sortBy = sortByQuery,
  append = false,
) => {
  try {
    if (append) {
      setLoadingMore(true);
    } else {
      setActivitiesLoading(true);
      setPage(1);
    }

    const currentPage = append ? page + 1 : 1;

    const res = await getSearchedActivities(
      search,
      cat === 'All' ? 'all' : cat,
      location,
      sortBy,
      LIMIT,
      currentPage
    );

    if (append) {
      setActivities(prev => [...prev, ...res.data]);
      setPage(prev => prev + 1);
    } else {
      setActivities(res.data);
    }

    setTotal(Number(res.total));

    const map: { [key: string]: boolean } = append ? { ...followingMap } : {};
    res.data.forEach((act: any) => {
      map[act.creator.id] = act.creator.isFollowing;
    });
    setFollowingMap(map);

  } catch (err) {
    console.error('Error fetching activities:', err);
  } finally {
    setActivitiesLoading(false);
    setLoadingMore(false);
  }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || activitiesLoading) return;
      
      const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
      
      if (bottom && activities.length < total) {
        fetchActivities(categoryQuery, searchQuery, locationQuery, sortByQuery, true);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [activities, total, page]);

  const user = useAuthContext();

  useEffect(() => {
    if (!user.loading) {
      fetchActivities('All', '', '');
    }
  }, [user.user]);

  const [sortOpen, setSortOpen] = useState(false);

  const sortOptions = [
    { label: 'Soonest', value: 'soonest' },
    { label: 'Most Joined', value: 'most_joined' },
    { label: 'Least Joined', value: 'least_joined' },
  ];

  return (
    <div className="flex flex-col items-center pb-20 pt-4 md:pt-4  text-white">
  
      <div className="w-full max-w-5xl px-4 md:px-8 mb-4 flex flex-col items-center text-center">
        <h1 className="text-3xl md:text-4xl lg:text-4xl font-black tracking-tight text-white mb-3">
          Explore{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-100">
            New Activities
          </span>
        </h1>
        <p className="text-amber-50 text-base  font-medium mb-4">
          Discover events created by the community. Join, connect, and experience something new
          today.
        </p>

        {/* Search Bar */}
        <div className=" relative w-full max-w-3xl">
          <div className="flex items-center bg-[#1a1a1a]/80 border border-neutral-500/10 rounded-2xl overflow-hidden shadow-lg focus-within:border-orange-100/10 transition-all">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-[2] px-5 bg-transparent text-white placeholder-neutral-500 focus:outline-none"
            />
            <div className='hidden md:flex'>
            <div className="h-8 w-[2px] bg-neutral-400/20" />
            <input
              type="text"
              placeholder="City or country"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="flex-1 px-4 bg-transparent text-white placeholder-neutral-500 focus:outline-none"
            />
            </div>
            <button
              className="h-12 px-5 flex items-center justify-center bg-orange-100/20 hover:bg-orange-100/30 transition-colors"
              onClick={() => {
                fetchActivities(categoryQuery, searchQuery, locationQuery);
                setPage(1);
              }}
            >
              <Search className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className=" w-full max-w-7xl px-4 md:px-8 mb-2">
        <div className=" flex gap-2.5 overflow-x-auto pb-4 justify-start sm:justify-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {allCategories.map((catName: string, idx: number) => (
            <button
              key={idx}
              onClick={() => {
                setCategoryQuery(catName);
                fetchActivities(catName, searchQuery, locationQuery);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 capitalize ${
                categoryQuery === catName
                  ? 'bg-[#1a1a1a] text-black bg-white '
                  : 'bg-[#1a1a1a] text-neutral-400 border-neutral-800 hover:bg-neutral-700 hover:text-white'
              }`}
            >
              {catName !== 'All' ? "#" : ""} {catName}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full mb-6 flex justify-between px-6 lg:px-40 items-center">
        <div className="relative">
          {/* Trigger */}
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 text-sm font-bold text-white hover:text-orange-400 transition-colors"
          >
            Sort by:{' '}
            <span className="text-orange-400">
              {sortOptions.find((opt) => opt.value === sortByQuery)?.label}
            </span>
            <span className={`transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`}>
              ↓
            </span>
          </button>

          {/* Dropdown */}
          {sortOpen && (
            <div className="absolute LEFT-0 mt-3 w-44 bg-[#111] border border-neutral-800 rounded-xl shadow-lg py-2 z-50">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortByQuery(option.value);
                    setSortOpen(false);
                    fetchActivities(categoryQuery, searchQuery, locationQuery, option.value);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    sortByQuery === option.value
                      ? 'text-orange-400 font-semibold'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-4 flex gap-2 items-center">
          <p className="text-xs tracking-wider text-neutral-400 font-medium">Results:</p>
          <p className="text-xs font-semibold text-white">{total} activities found</p>
        </div>
      </div>

      {/* activities grid */}
      <div className="w-full px-auto p-3 md:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-medium tracking-wide">Loading activities...</p>
          </div>
        ) : activities.length > 0 ? (
          <div className='mx-auto w-full'>
          <div className="flex gap-6 md:gap-8 flex-wrap items-start justify-center w-full">
            {activities.map((activity, index) => (
              <ActivityCard
                key={`${activity.id}-${index}`}
                activity={activity}
                isFollowing={followingMap[activity.creator.id]}
                toggleFollow={toggleFollow}
              />
            ))}
          </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-[#1a1a1a] border border-gray-800 rounded-3xl w-full max-w-3xl mx-auto">
            <Search className="h-10 w-10 mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-gray-300 mb-1.5">No activities found</h3>
            <p className="text-sm max-w-xs text-center mb-5">
              We couldn't find anything matching your search and category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryQuery('All');
                fetchActivities('All', '', '');
              }}
              className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold rounded-xl border border-white/10 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {loadingMore && (
          <div className="flex justify-center flex col items-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className='text-lg'>Loading More Activities ....</p>
          </div>
        )}
      </div>
    </div>
  );
}
