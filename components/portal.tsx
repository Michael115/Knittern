import { createPortal } from "react-dom";

export const Portal: React.FC<{}> = ({ children }) => {
  return createPortal(children, document.body);
};
