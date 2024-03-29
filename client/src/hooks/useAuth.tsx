import { useState, useCallback } from "react";

import { useHistory } from "react-router-dom";

export interface LoginDataInterface {
  token: string | null;
  uuid: string | null;
  gradeBookNumber: string | null;
}

export const localStorageName: string = "authData";

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(null);
  const [uuid, setUUID] = useState<string | null>(null);
  const [gradeBookNumber, setGradeBookNumber] = useState<string | null>(null);

  const history = useHistory();
  const historyLocation: string = history.location.pathname;
  const apiEndpoint =
    "http://" + window.location.host.split(":")[0] + ":5000/api";

  const login = useCallback((responseData: LoginDataInterface) => {
    setToken(responseData?.token);
    setUUID(responseData?.uuid);
    setGradeBookNumber(responseData?.gradeBookNumber);
    localStorage.setItem(localStorageName, JSON.stringify(responseData));
    history.push(historyLocation === "/auth" ? "/" : historyLocation);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUUID(null);
    setGradeBookNumber(null);
    localStorage.removeItem(localStorageName);
    history.go(0);
  }, []);
  return { login, logout, token, uuid, gradeBookNumber, apiEndpoint };
};
