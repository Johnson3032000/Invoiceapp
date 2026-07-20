import React, { useEffect, useState } from "react";
import {
  MapPin,
  Building2,
  Send,
  Globe,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

interface AddressData {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  sameAddress: boolean;
}

interface CustomerRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address?: AddressData[];
  status: "Draft" | "Complete";
}

const CUSTOMERS_KEY = "customers";
const CURRENT_CUSTOMER_KEY = "currentCustomerId";

const defaultAddress: AddressData = {
  street: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  sameAddress: true,
};

function getStoredCustomers(): CustomerRecord[] {
  const stored = localStorage.getItem(CUSTOMERS_KEY);

  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse stored customers:", error);
    return [];
  }
}

function AddressInformation() {
  const [address, setAddress] = useState<AddressData>(defaultAddress);
  const navigate = useNavigate();

  useEffect(() => {
    const currentCustomerId = localStorage.getItem(CURRENT_CUSTOMER_KEY);
    if (!currentCustomerId) return;

    const customers = getStoredCustomers();
    const current = customers.find((c) => c.id === currentCustomerId);

    if (current?.address && current.address[0]) {
      setAddress({ ...defaultAddress, ...current.address[0] });
    }
  }, []);

  const saveAddress = (updatedAddress: AddressData) => {
    const currentCustomerId = localStorage.getItem(CURRENT_CUSTOMER_KEY);
    if (!currentCustomerId) return;

    const customers = getStoredCustomers();
    const index = customers.findIndex((c) => c.id === currentCustomerId);

    if (index === -1) return;

    customers[index] = {
      ...customers[index],
      address: [updatedAddress],
    };

    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    const updatedAddress = {
      ...address,
      [name]: type === "checkbox" ? checked : value,
    };

    setAddress(updatedAddress);
    saveAddress(updatedAddress);
  };

  const handleBack = () => {
    saveAddress(address);
    navigate("/customer/form1");
  };

  const handleContinue = () => {
    saveAddress(address);
    navigate("/customer");
  };

  const steps = [
    { number: 1, label: "STEP 1", title: "Personal", state: "done" as const },
    {
      number: 2,
      label: "STEP 2",
      title: "Address",
      state: "active" as const,
    },
    {
      number: 3,
      label: "STEP 3",
      title: "Review",
      state: "upcoming" as const,
    },
  ];

  const stepBadgeClass = (state: "done" | "active" | "upcoming") => {
    if (state === "done") return "bg-slate-900 text-white";
    if (state === "active") return "bg-black text-white";
    return "bg-slate-300 text-black";
  };

  return (
    <div>
      <Navbar />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-around px-4 sm:px-8 lg:px-[100px] xl:px-[200px] mt-8 mb-6">
        <div>
          <h1 className="font-bold text-2xl sm:text-3xl">New Customer</h1>
          <p>Register a new client to start billing them.</p>
        </div>

        <div className="flex w-full lg:w-[600px] justify-between overflow-x-auto">
          {steps.map((step) => (
            <div key={step.number} className="flex shrink-0">
              <div
                className={`w-10 h-10 mx-2 sm:mx-[10px] mt-[12px] rounded-xl flex items-center justify-center font-medium text-sm ${stepBadgeClass(
                  step.state,
                )}`}
              >
                {step.state === "done" ? <Check /> : step.number}
              </div>

              <div className="mt-[10px]">
                <p className="text-xs sm:text-sm">{step.label}</p>
                <p className="text-sm sm:text-base">{step.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-100 flex justify-center items-center p-4 sm:p-6 md:p-8">
        <div className="bg-white w-full max-w-5xl rounded-3xl shadow-lg border border-gray-200 p-5 sm:p-6 md:p-8">
     
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-gray-700" />
            <h2 className="font-bold text-lg">Address Information</h2>
          </div>

          <hr className="mb-8" />

          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-4 h-4 text-gray-500" />
            <p className="uppercase text-sm font-semibold tracking-wider text-gray-600">
              Billing Address
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Street Address <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <MapPin
                className="absolute left-3 top-3.5 text-gray-400"
                size={18}
              />

              <input
                type="text"
                name="street"
                value={address.street}
                onChange={handleChange}
                placeholder="123 Business Way"
                className="w-full border rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                City <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Send
                  className="absolute left-3 top-3.5 text-gray-400"
                  size={17}
                />

                <input
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={handleChange}
                  placeholder="New York"
                  className="w-full border rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                State / Province <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="state"
                value={address.state}
                onChange={handleChange}
                placeholder="NY"
                className="w-full border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                ZIP / PIN Code <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="zip"
                value={address.zip}
                onChange={handleChange}
                placeholder="100001"
                className="w-full border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Country <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Globe
                  className="absolute left-3 top-3.5 text-gray-400"
                  size={18}
                />

                <input
                  type="text"
                  name="country"
                  value={address.country}
                  onChange={handleChange}
                  placeholder="USA"
                  className="w-full border rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 border rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="sameAddress"
                checked={address.sameAddress}
                onChange={handleChange}
                className="w-5 h-5 accent-blue-600 shrink-0"
              />

              <span className="font-medium text-sm">
                Shipping address is the same as billing
              </span>
            </label>
          </div>

          <hr className="my-10" />

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <button
              onClick={handleBack}
              className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 hover:text-black"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <button
              onClick={handleContinue}
              className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800"
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

export default AddressInformation;
