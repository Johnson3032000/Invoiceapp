
import Navbar from "../../components/Navbar";
import { ArrowLeft, ArrowRight, Mail, Phone, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

const customerFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required.")
    .min(2, "Full name must be at least 2 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required.")
    .regex(/^\+?[0-9\s\-().]{7,20}$/, "Enter a valid phone number."),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

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

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema as any),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
    },

  });

  const onSubmit = (data: CustomerFormData) => {
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
        ...data,
      };
    } else {
      const newCustomer: CustomerRecord = {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now().toString(),
        ...data,
        status: "Draft",
      };

      customers.push(newCustomer);
      localStorage.setItem(CURRENT_CUSTOMER_KEY, newCustomer.id);
    }

    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));

    console.log("Customers:", customers);

    navigate("/customer/form2");
  };

  const steps = [
    { number: 1, label: "STEP 1", title: "Personal", active: true },
    { number: 2, label: "STEP 2", title: "Address", active: false },
    { number: 3, label: "STEP 3", title: "Review", active: false },
  ];

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
                className={`w-10 h-10 mx-2 sm:mx-[10px] mt-[12px] rounded-xl flex items-center justify-center text-white ${
                  step.active ? "bg-slate-900" : "bg-slate-300"
                }`}
              >
                {step.number}
              </div>

              <div className="mt-[10px]">
                <p className="text-xs sm:text-sm">{step.label}</p>
                <p className="text-sm sm:text-base">{step.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-100 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-4xl bg-white rounded-3xl border shadow-sm p-5 sm:p-8 md:p-10"
          noValidate
        >
          <div className="flex items-center gap-2 mb-6">
            <User size={20} />
            <h2 className="text-xl font-semibold">Personal Information</h2>
          </div>

          <hr className="mb-8" />

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>

            <div
              className={`flex items-center border rounded-xl px-4 h-12 ${
                errors.fullName ? "border-red-500" : ""
              }`}
            >
              <User size={18} className="text-gray-400 shrink-0" />

              <input
                type="text"
                placeholder="Jane Doe"
                {...register("fullName", {
                  onBlur: () => trigger("fullName"),
                })}
                className="w-full min-w-0 outline-none px-3 text-sm"
              />
            </div>
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-500">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>

            <div
              className={`flex items-center border rounded-xl px-4 h-12 ${
                errors.email ? "border-red-500" : ""
              }`}
            >
              <Mail size={18} className="text-gray-400 shrink-0" />

              <input
                type="email"
                placeholder="jane@example.com"
                {...register("email", {
                  onBlur: () => trigger("email"),
                })}
                className="w-full min-w-0 outline-none px-3 text-sm"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="mb-10">
            <label className="block text-sm font-medium mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>

            <div
              className={`flex items-center border rounded-xl px-4 h-12 ${
                errors.phone ? "border-red-500" : ""
              }`}
            >
              <Phone size={18} className="text-gray-400 shrink-0" />

              <input
                type="tel"
                placeholder="+1 555 0100"
                {...register("phone", {
                  onBlur: () => trigger("phone"),
                })}
                className="w-full min-w-0 outline-none px-3 text-sm"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500">
                {errors.phone.message}
              </p>
            )}
          </div>

          <hr className="mb-8" />

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate("/customer")}
              className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 hover:text-black"
            >
              <ArrowLeft size={18} />
              Cancel
            </button>

            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCustomer;
