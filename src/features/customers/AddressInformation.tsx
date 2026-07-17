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

// Shared draft used across the multi-step "New Customer" wizard.
// Each step reads/writes its own slice (e.g. draft.personal, draft.address)
// so nothing gets wiped out when moving between steps.
const DRAFT_KEY = "newCustomerDraft";

const defaultAddress: AddressData = {
  street: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  sameAddress: true,
};

function AddressInformation() {
  const [address, setAddress] = useState<AddressData>(defaultAddress);
  const navigate = useNavigate();

  // Load any previously saved address info for this draft on mount
  useEffect(() => {
    const storedDraft = localStorage.getItem(DRAFT_KEY);

    if (storedDraft) {
      try {
        const parsedDraft = JSON.parse(storedDraft);

        if (parsedDraft.address) {
          setAddress({ ...defaultAddress, ...parsedDraft.address });
        }
      } catch (error) {
        console.error("Failed to parse saved customer draft:", error);
      }
    }
  }, []);

  const saveAddress = (updatedAddress: AddressData) => {
    const storedDraft = localStorage.getItem(DRAFT_KEY);
    let draft: Record<string, unknown> = {};

    if (storedDraft) {
      try {
        draft = JSON.parse(storedDraft);
      } catch (error) {
        console.error("Failed to parse saved customer draft:", error);
      }
    }

    const updatedDraft = { ...draft, address: updatedAddress };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(updatedDraft));
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
            <div className="w-10 h-10 mx-[10px] mt-[12px] bg-slate-900 text-white rounded-xl flex items-center justify-center font-medium text-sm">
              <Check />
            </div>

            <div className="mt-[10px]">
              <p>STEP 1</p>
              <p>Personal</p>
            </div>
          </div>

          <div className="flex">
            <div className="w-10 h-10 mx-[10px] mt-[12px] bg-[black] text-white rounded-xl flex items-center justify-center font-medium text-sm">
              2
            </div>

            <div className="mt-[10px]">
              <p>STEP 2</p>
              <p>Address</p>
            </div>
          </div>

          <div className="flex">
            <div className="w-10 h-10 mx-[10px] mt-[12px] bg-slate-300 text-black rounded-xl flex items-center justify-center font-medium text-sm">
              3
            </div>

            <div className="mt-[10px]">
              <p>STEP 3</p>
              <p>Review</p>
            </div>
          </div>
        </div>
      </div>

      <div className=" bg-gray-100 flex justify-center items-center p-8">
        <div className="bg-white w-full max-w-5xl rounded-3xl shadow-lg border border-gray-200 p-8">
          {/* Heading */}
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

          <div className="grid md:grid-cols-2 gap-6">
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
                className="w-5 h-5 accent-blue-600"
              />

              <span className="font-medium text-sm">
                Shipping address is the same as billing
              </span>
            </label>
          </div>

          <hr className="my-10" />

          <div className="flex justify-between items-center">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-black"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <button
              onClick={handleContinue}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800"
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
