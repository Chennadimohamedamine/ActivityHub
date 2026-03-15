import { memo } from "react";
import { followUser, unfollowUser } from "../../services/activities.api";

type KeepUpButtonProps = {
  creatorId: string;
  isFollowing: boolean;
  toggleFollow: (creatorId: string) => void;
};

function KeepUpButtonComponent({
  creatorId,
  isFollowing,
  toggleFollow,
}: KeepUpButtonProps) {
  const handleClick = async () => {
    try {
      if (isFollowing) {
        await unfollowUser(creatorId);
      } else {
        await followUser(creatorId);
      }
      toggleFollow(creatorId);

    } catch (err) {
      console.error("Failed to toggle keepup:", err);
    }
  };
  

  return (
    <button
      onClick={handleClick}
      className={`text-sm font-bold transition-colors duration-300 ${
        isFollowing
          ? "text-gray-500 hover:text-gray-400"
          : "text-orange-500 hover:text-orange-400"
      }`}
    >
      {isFollowing ? "Unkeep Up" : "Keep Up"}
    </button>
  );
}

export const KeepUpButton = memo(KeepUpButtonComponent);