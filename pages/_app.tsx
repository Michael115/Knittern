import "tailwindcss/tailwind.css";
import "../public/fonts/font.css";
import { AppProps } from "next/app";

const MyApp = ({ Component, pageProps }: AppProps) => (
  <Component {...pageProps} />
);

export default MyApp;
