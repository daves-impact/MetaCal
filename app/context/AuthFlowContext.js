import { createContext, useMemo, useState } from "react";

export const AuthFlowContext = createContext();

export const AuthFlowProvider = ({ children }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const resetFlow = () => {
    setEmail("");
    setPassword("");
    setAgreeTerms(false);
  };

  const value = useMemo(
    () => ({
      email,
      setEmail,
      password,
      setPassword,
      agreeTerms,
      setAgreeTerms,
      resetFlow,
    }),
    [email, password, agreeTerms],
  );

  return (
    <AuthFlowContext.Provider value={value}>
      {children}
    </AuthFlowContext.Provider>
  );
};
