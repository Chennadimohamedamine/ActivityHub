import { useState } from 'react';
import {
  saveActivity,
  unSaveActivity,
  joinAnActivity,
  leaveAnActivity,
} from '../../services/activities.api';

export const useActivityActions = (activity: any, setJoinedCount: (val: any) => void) => {
  const [isSaved, setSaved] = useState(activity.isSaved);
  const [isJoined, setIsJoined] = useState(activity.isUserJoined);
  const [loading, setLoading] = useState(false);

  const handleSaveToggle = async () => {
    setSaved(!isSaved);
    try {
      if (isSaved) await unSaveActivity(activity.id);
      else await saveActivity(activity.id);
    } catch (err) {
      console.error('Save error', err);
    }
  };

  const handleJoinLeave = async (action: 'join' | 'leave') => {
    if (loading) return;
    setLoading(true);
    try {
      if (action === 'join') {
        await joinAnActivity(activity.id);
        setIsJoined(true);
        setJoinedCount((prev: number) => prev + 1);
      } else {
        await leaveAnActivity(activity.id);
        setIsJoined(false);
        setJoinedCount((prev: number) => prev - 1);
      }
    } catch (err) {
      console.error(`${action} error`, err);
    } finally {
      setLoading(false);
    }
  };

  return { isSaved, isJoined, loading, handleSaveToggle, handleJoinLeave };
};
