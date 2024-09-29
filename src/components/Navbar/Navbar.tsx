import Image from "next/image";

export default function Navbar() {
  return (
    <div className="border-grey navbar border-b">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu dropdown-content menu-sm z-[1] mt-3 w-52 rounded-box bg-base-100 p-2 shadow"
          >
            <li>
              <a>Item 1</a>
            </li>
            <li>
              <a>Parent</a>
              <ul className="p-2">
                <li>
                  <a>Submenu 1</a>
                </li>
                <li>
                  <a>Submenu 2</a>
                </li>
              </ul>
            </li>
            <li>
              <a>Item 3</a>
            </li>
          </ul>
        </div>

        <div className="md:hidden">
          <Image src="/l1.png" width={36} height={50} alt="TechWave" />
        </div>

        <div className="hidden md:block">
          <Image src="/l2.png" width={150} height={50} alt="TechWave" />
        </div>
      </div>
      {/* Search Input Fields */}
      <div className="navbar-center">
        <div className="form-control w-40 md:w-[300px] lg:w-[560px]">
          <input
            type="text"
            placeholder="Search"
            className="input input-bordered w-full"
          />
        </div>
      </div>

      <div className="navbar-end">
        <a className="btn bg-primary text-white">Log In</a>
      </div>
    </div>
  );
}
