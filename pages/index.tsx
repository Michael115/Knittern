import Head from "next/head";
import Image from "next/image";
import { NavBar } from "../components/navbar";
import { PatternCanvas } from "../components/patternCanvas";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Head>
        <title>Knittern</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />

      <div className="flex flex-col relative items-center justify-center w-full flex-1 px-20 text-center">
        <PatternCanvas width={1000} height={1000} />
      </div>

      <footer className="flex items-center justify-center w-full">
        &copy; Michael Gillon {new Date().getFullYear()}
      </footer>
    </div>
  );
}
