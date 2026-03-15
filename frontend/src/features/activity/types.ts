


export type PostModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export type CreateActivityDto = {
  title: string;
  description: string;
  location: string;
  categorie: string;
  
  participantsLimit: number;
  scheduledAt: string;
};

export const CATEGORIES = ["Sports", "Music", "Art", "Tech", "Food", "Travel", "Fitness", "Gaming", "Nature", "Education"];
