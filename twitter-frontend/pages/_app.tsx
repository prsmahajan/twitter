import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Montserrat } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google";

const montserrat = Montserrat({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={montserrat.className}>
      <GoogleOAuthProvider clientId="921618517120-lvhqnj79f1mf7gk48kqq47c04kdqe6cj.apps.googleusercontent.com">
        <Component {...pageProps} />;
      </GoogleOAuthProvider>
    </div>
  );
}
