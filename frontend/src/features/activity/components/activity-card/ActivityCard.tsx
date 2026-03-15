import React, { useState, memo, useContext } from 'react';
import { BookmarkIcon, MapPin as MapIcon, Clock as ClockIcon, ChevronRight } from 'lucide-react';
import { useActivityActions } from './useActivityActions';
import { CategoryBadge, ParticipantsCount } from './ActivityUI';
import { KeepUpButton } from './KeepUpButton';
import { div } from 'framer-motion/client';
import { useAuthContext } from '../../../auth/context/AuthProvider';

const formatDate = (scheduledAt: string) =>
  new Date(scheduledAt).toLocaleString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });


const ActivityImage = memo(({ image, isSaved, onSave, category, isMine }: any) => (
  <div className="relative h-48 overflow-hidden bg-gray-900">
    <img src={`https://localhost/uploads/${image}`} className="w-full h-full object-cover" alt="activity" />
    <div className="absolute top-3 left-3 right-3 flex justify-between z-10">
      <CategoryBadge category={category} />
      {
        (!isMine) ? (
      <button
        onClick={(e) => { e.stopPropagation(); onSave(); }}
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110 
        ${isSaved ? 'bg-white text-orange-600' : 'bg-white/30 backdrop-blur-md text-white hover:bg-black/40'}`}
      >
        <BookmarkIcon className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
      </button>
        ) : (
          <></>
        )
      }
    </div>
  </div>
));

const ActivityInfo = memo(({ activity, joinedCount, isFollowing, toggleFollow, isMine }: any) => (
  <div className="px-4 py-3 space-y-4">
    <div>
      <h1 className="text-white text-xl font-black capitalize">{activity.title}</h1>
      <p className="text-gray-400 text-sm-2 mt-1 break-all">{activity.description}</p>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between items-center text-gray-400 text-sm">
        <div className="flex items-center gap-1">
          <ClockIcon className="w-4 h-4 text-orange-500" />
          <span>{formatDate(activity.scheduledAt)}</span>
        </div>
        {
          (isMine) ? (
            <div></div>
          ) : (
          <ParticipantsCount count={joinedCount} />
        )
        }
      </div>
      <div className="flex items-center gap-1 text-gray-400 text-sm">
        <MapIcon className="w-4 h-4 text-blue-500" />
        <span>{activity.location}</span>
      </div>
    </div>
    <div className="flex items-center justify-between pt-2">
      <div className="flex items-center gap-2">
        <img src={`https://localhost${activity.creator.profileImage}`} className="w-7 h-7 rounded-full ring-2 ring-gray-800 object-cover" alt="avatar" />
        <span className="text-white text-sm font-bold">{activity.creator.Firstname} {activity.creator.Lastname}</span>
      </div>
      {
          (isMine) ? (
            (<></>)
          ) : (
          <KeepUpButton creatorId={activity.creator.id} isFollowing={isFollowing} toggleFollow={toggleFollow} />
      )}
    </div>
  </div>
));

export default function ActivityCard({ activity, isFollowing, toggleFollow }: any) {
  const [joinedCount, setJoinedCount] = useState(activity.participantsCount);
  const { isSaved, isJoined, loading, handleSaveToggle, handleJoinLeave } = useActivityActions(activity, setJoinedCount);

  

  return (
    <div className="w-full md:w-[620px] 3xl:w-[720px] rounded-xl overflow-hidden border border-gray-700/50 bg-[#141414]">
      
      <ActivityImage image={activity.image} isSaved={isSaved} onSave={handleSaveToggle} category={activity.categoryName} isMine={activity.isMine} />
      <ActivityInfo activity={activity} joinedCount={joinedCount} isFollowing={isFollowing} toggleFollow={toggleFollow} isMine={activity.isMine} />

      {/* Join section */}
      <div className="px-5 pb-5 pt-2 mt-auto border-t border-gray-800/80">
      {
        (!activity.isMine) ? (
        (activity.isHappened) ? (
          <div className='flex justify-center'>
            <p className='text-red-200 font-semibold'>Out Dated Cant't Join</p>
          </div>
        ) : (
        (!isJoined ? (
          <button
            onClick={() => handleJoinLeave('join')}
            disabled={loading}
            className="group w-full py-2 text-gray-300 font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            Join Activity
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        ) : (
          <div className="flex justify-between items-center w-full px-4">
             <button className="group py-2 text-green-300 hover:text-green-200 font-bold flex items-center gap-2 transition-colors duration-300 active:scale-[0.98]"
              onClick={() => {
                window.location.href = '/dashboard/chat';
              }}
            >
              Open Chat
            </button>

            <button onClick={() => handleJoinLeave('leave')} disabled={loading} className="py-2 text-red-500/80 font-bold hover:text-red-400">
              Leave
            </button>
          </div>
        )))) : (
          <div className="flex justify-center items-center w-full px-4">
             <button className="group py-2 text-green-300 hover:text-green-200 font-bold flex items-center gap-2 transition-colors duration-300 active:scale-[0.98]"
              onClick={() => {
                window.location.href = '/dashboard/chat';
              }}
            >
              Open Chat
            </button>
          </div>
        )
      
      }
      </div>
    </div>
  );
}