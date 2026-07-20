
import { Blocks, UserRound, DollarSign } from "lucide-react";
import { Button } from "@base-ui/react";
import { useNavigate } from "react-router-dom";

function Navbar() {
   const navigate = useNavigate();

  return (
    <nav className="flex flex-col md:flex-row justify-between items-center px-6 py-4 shadow-lg gap-4">
      {/* Logo */}
      <div className="flex items-center">
        <div className="p-3 rounded-xl bg-black text-white">
          <DollarSign size={24} />
        </div>

        <div className="flex flex-col ml-3">
          <h1 className="font-bold text-xl">Billing</h1>
          <p className="text-sm text-gray-500">Enterprise Edition</p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <Button onClick={()=> navigate('/')} className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[red] text-white w-full sm:w-auto hover:bg-red-600 transition">
          <Blocks size={20} />
          <span>Invoices</span>
        </Button>

        <Button
          onClick={() => navigate("/customer")}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[blue] text-white w-full sm:w-auto hover:bg-blue-600 transition"
        >
          <UserRound size={20} />
          <span>Customer</span>
        </Button>
      </div>
    </nav>
  );
}

export default Navbar;
