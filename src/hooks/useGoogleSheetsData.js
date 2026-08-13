import { useData } from '../context/DataContext';

const useGoogleSheetsData = (explicitCompanyId) => {
  return useData();
};

export default useGoogleSheetsData;
