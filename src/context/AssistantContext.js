import { createContext, useContext } from "react";

export const AssistantContext = createContext();

export const useAssistant = () => useContext(AssistantContext);
