import { Blocks, UserRound, DollarSign } from "lucide-react";
import { Button } from "@base-ui/react";
import { useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="flex flex-col md:flex-row justify-between items-center px-6 py-4 shadow-lg gap-4">
      <div className="flex items-center">
        <div className="p-3 rounded-xl bg-black text-white">
          <DollarSign size={24} />
        </div>

        <div className="flex flex-col ml-3">
          <h1 className="font-bold text-xl">Billing</h1>
          <p className="text-sm text-gray-500">Enterprise Edition</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">

        <Button
          onClick={() => navigate("/")}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 transition-all duration-300
            ${
              location.pathname === "/"
                ? "bg-black text-white border-black"
                : "bg-white text-black border-black hover:bg-black hover:text-white"
            }`}
        >
          <Blocks size={20} />
          <span>Invoices</span>
        </Button>

        <Button
          onClick={() => navigate("/customer")}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 transition-all duration-300
            ${
              location.pathname === "/customer"
                ? "bg-black text-white border-black"
                : "bg-white text-black border-black hover:bg-black hover:text-white"
            }`}
        >
          <UserRound size={20} />
          <span>Customer</span>
        </Button>
      </div>
    </nav>
  );
}

export default Navbar;
