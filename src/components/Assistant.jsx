import { useAssistant } from "../context/AssistantContext";
import AssistantButton from "./AssistantButon";
import AssistantPanel from "./AssistantPanel";

const Assistant = () => {
    const {isOpen} = useAssistant();

    return(
        <>
            {isOpen && <AssistantPanel />}
            <AssistantButton />
        </>
    )
}

export default Assistant;