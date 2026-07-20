import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import { ArrowLeft, ArrowRight, Mail, Phone, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CUSTOMERS_KEY = "customers";
const CURRENT_CUSTOMER_KEY = "currentCustomerId";

interface CustomerRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  sameAddress?: boolean;
  status: "Draft" | "Complete";
}

function getStoredCustomers(): CustomerRecord[] {
  const stored = localStorage.getItem(CUSTOMERS_KEY);

  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function AddCustomer() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleContinue = () => {
    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim()
    ) {
      alert("Please fill all fields.");
      return;
    }

    let customers = getStoredCustomers();

    const currentCustomerId = localStorage.getItem(CURRENT_CUSTOMER_KEY);

    const existingIndex = currentCustomerId
      ? customers.findIndex((customer) => customer.id === currentCustomerId)
      : -1;


    const isResumingDraft =
      existingIndex !== -1 && customers[existingIndex].status === "Draft";

    if (isResumingDraft) {
      customers[existingIndex] = {
        ...customers[existingIndex],
        ...formData,
      };
    } else {
      const newCustomer: CustomerRecord = {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now().toString(),
        ...formData,
        status: "Draft",
      };

      customers.push(newCustomer);
      localStorage.setItem(CURRENT_CUSTOMER_KEY, newCustomer.id);
    }

    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));

    console.log("Customers:", customers);

    navigate("/customer/form2");
  };

  return (
    <div>
      <Navbar />

      <div className="flex px-[200px] mt-[50px] justify-around my-[30px]">
        <div>
          <h1 className="font-bold text-3xl">New Customer</h1>
          <p>Register a new client to start billing them.</p>
        </div>

        <div className="flex w-[600px] justify-between">
          <div className="flex">
            <div className="w-10 h-10 mx-[10px] mt-[12px] bg-slate-900 text-white rounded-xl flex items-center justify-center">
              1
            </div>

            <div className="mt-[10px]">
              <p>STEP 1</p>
              <p>Personal</p>
            </div>
          </div>

          <div className="flex">
            <div className="w-10 h-10 mx-[10px] mt-[12px] bg-slate-300 rounded-xl flex items-center justify-center">
              2
            </div>

            <div className="mt-[10px]">
              <p>STEP 2</p>
              <p>Address</p>
            </div>
          </div>

          <div className="flex">
            <div className="w-10 h-10 mx-[10px] mt-[12px] bg-slate-300 rounded-xl flex items-center justify-center">
              3
            </div>

            <div className="mt-[10px]">
              <p>STEP 3</p>
              <p>Review</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl bg-white rounded-3xl border shadow-sm p-10">
          <div className="flex items-center gap-2 mb-6">
            <User size={20} />
            <h2 className="text-xl font-semibold">Personal Information</h2>
          </div>

          <hr className="mb-8" />

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>

            <div className="flex items-center border rounded-xl px-4 h-12">
              <User size={18} className="text-gray-400" />

              <input
                type="text"
                name="fullName"
                placeholder="Jane Doe"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full outline-none px-3 text-sm"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>

            <div className="flex items-center border rounded-xl px-4 h-12">
              <Mail size={18} className="text-gray-400" />

              <input
                type="email"
                name="email"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full outline-none px-3 text-sm"
              />
            </div>
          </div>

          <div className="mb-10">
            <label className="block text-sm font-medium mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>

            <div className="flex items-center border rounded-xl px-4 h-12">
              <Phone size={18} className="text-gray-400" />

              <input
                type="tel"
                name="phone"
                placeholder="+1 555 0100"
                value={formData.phone}
                onChange={handleChange}
                className="w-full outline-none px-3 text-sm"
              />
            </div>
          </div>

          <hr className="mb-8" />

          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/customer")}
              className="flex items-center gap-2 text-gray-600 hover:text-black"
            >
              <ArrowLeft size={18} />
              Cancel
            </button>

            <button
              onClick={handleContinue}
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl flex items-center gap-2"
            >
              Continue
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddCustomer;
