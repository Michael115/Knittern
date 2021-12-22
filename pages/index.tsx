import Head from "next/head";
import Image from "next/image";
import { NavBar } from "../components/navbar";
import { PatternCanvas } from "../components/patternCanvas";

export default function Home() {
  return (
    <div className="flex flex-col justify-between min-h-screen">
      <Head>
        <title>Knittern</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col flex-1 p-4 items-center">
        <PatternCanvas width={1080} height={1080} />
      </div>

      <footer className="flex items-center justify-center w-full print:hidden">
        &copy; Michael Gillon {new Date().getFullYear()}
      </footer>
    </div>
  );
}
