import Banner from "@leafygreen-ui/banner";
import { Message } from "./Message";

import styles from "./Chat.module.css";
import { ConversationPayload } from "./useConversation";
import WizardInput from "./ChatInput";

type ChatProps = Pick<ConversationPayload, "messages" | "rateMessage"> & {
  inputText: string;
  setInputText: React.Dispatch<React.SetStateAction<string>>;
};

export default function Chat(props: ChatProps) {
  return (
    <div className={styles.chat}>
      <div className={styles.message_list}>
        {props.messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            rateMessage={props.rateMessage}
          />
        ))}
      </div>
      <Banner variant="warning">
        This is an experimental AI chatbot. All information should be verified
        prior to use.
      </Banner>
      <WizardInput
        showSubmitButton={props.inputText.length > 0}
        placeholder="Ask MongoDB AI a Question"
        value={props.inputText}
        onChange={(e) => {
          props.setInputText(e.target.value);
        }}
      />
    </div>
  );
}
