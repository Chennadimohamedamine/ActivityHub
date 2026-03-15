import { useState } from 'react';
import { createActivity } from '../../services/activities.api';
import { useNavigate } from 'react-router-dom';

export const useActivityForm = (onClose: () => void) => {
  // individual states for each input
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [participantsLimit, setParticipantsLimit] = useState(2);
  const [image, setImage] = useState<File | null>(null);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ [key: string]: string }>({});

  const handlePublish = async () => {
    const newError: { [key: string]: string } = {};

    if (!image) newError.image = 'Image is required';
    if (!title) newError.title = 'Title is required';
    if (!description) newError.description = 'Description is required';
    if (!categoryName) newError.categoryName = 'Category is required';
    if (!location) newError.location = 'Location is required';
    if (!date) newError.date = 'Date is required';

    setError(newError);
    if (Object.keys(newError).length) return;

    try {
      setLoading(true);

      await createActivity({
        title,
        description,
        categoryName,
        location,
        scheduledAt: new Date(date).toISOString(),
        image: image!,
        participantsLimit,
      });

      onClose()
    } catch (err: any) {
      setError({
        general: err?.response?.data?.message?.toLowerCase() || 'something went wrong',
      });
    } finally {
      setLoading(false);
      onClose()
      navigate('/dashboard/profile')
    }
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    categoryName,
    setCategoryName,
    location,
    setLocation,
    date,
    setDate,
    participantsLimit,
    setParticipantsLimit,
    image,
    setImage,
    loading,
    error,
    handlePublish,
  };
};
