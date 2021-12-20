import Link from 'next/link'

export function NavBar() {
    return (
      <div className="flex relative w-full h-16">
        <div
          style={{ fontFamily: "Rokkitt" }}
          className="flex px-4 absolute inset-x-0 top-0 h-16 bg-blue items-center justify-start text-gray-text text-5xl"
        >
          <div className="flex w-1/3">
              Knittern        
          </div>
          <div
            style={{ "font-family": "system-ui, -apple-system" }}
            className="flex justify-between w-1/3 text-2xl items-start tracking-wider"
          >
          </div>
        </div>
      </div>
    );
  }