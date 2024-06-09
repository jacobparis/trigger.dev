import { Link, Outlet } from "@remix-run/react";

export default function App() {
  return (
    <div>
      <div>
        <Link to="/good"> Good link </Link>
        <Link to="/bad"> Bad link </Link>
      </div>
      <Outlet />
    </div>
  );
}
