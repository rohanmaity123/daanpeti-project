import { useContext } from 'react';
import GlobalContext from '../contexts/GlobalStoreContext';

const useGlobalStore = () => useContext(GlobalContext);

export default useGlobalStore;
