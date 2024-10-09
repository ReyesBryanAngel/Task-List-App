import React, { createContext, useContext, useState } from 'react';
const DataContext = createContext();

export const GlobalDataProvider = ({ children }) => {
    const [taskData, setTaskData] = useState([]);
    const [apiResponse, setApiResponse] = useState(null);
    const [accessToken, setAccessToken] = useState(null);

    return (
        <DataContext.Provider 
          value={{ 
            taskData,
            setTaskData,
            apiResponse,
            setApiResponse,
            accessToken,
            setAccessToken
          }}
        >
          {children}
        </DataContext.Provider>
      );
}

export const useGlobalData = () => {
    return useContext(DataContext);
};