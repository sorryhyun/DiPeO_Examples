import { useSoundContext } from '../../providers/SoundProvider';

export const useSound = () => {
  const { playSound } = useSoundContext();
  
  return { playSound };
};

export default useSound;