import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import {
  Calendar,
  ClipboardList,
  Mail,
  MoveLeft,
  Phone,
  Plus,
  User,
} from "lucide-react";
import { Button } from "@base-ui/react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Input } from "../../components/ui/input";

const DRAFT_KEY = "invoice-draft";
const INVOICES_KEY = "invoices";
const CUSTOMERS_KEY = "customers";

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

function formatAddress(customer: CustomerRecord): string {
  return [
    customer.street,
    customer.city,
    customer.state,
    customer.zip,
    customer.country,
  ]
    .filter(Boolean)
    .join(", ");
}

const lineItemSchema = z.object({
  description: z.string().trim().min(1, "Description is required"),
  qty: z.coerce
    .number()
    .int("Qty must be a whole number")
    .min(1, "Qty must be at least 1"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  tax: z.coerce
    .number()
    .min(0, "Tax cannot be negative")
    .max(100, "Tax cannot exceed 100%"),
});

const invoiceSchema = z
  .object({
    customer: z.string().min(1, "Please select a customer"),
    invoiceDate: z.string().min(1, "Invoice date is required"),
    dueDate: z.string().min(1, "Due date is required"),
    items: z.array(lineItemSchema).min(1, "Add at least one line item"),
  })
  .refine(
    (data) =>
      !data.invoiceDate ||
      !data.dueDate ||
      new Date(data.dueDate) >= new Date(data.invoiceDate),
    {
      message: "Due date must be on or after the invoice date",
      path: ["dueDate"],
    },
  );

type InvoiceFormData = z.infer<typeof invoiceSchema>;
type LineItem = z.infer<typeof lineItemSchema>;
type FieldErrors = Record<string, string>;


interface StoredInvoice extends InvoiceFormData {
  invoiceNumber: string;
  customerSnapshot: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
  } | null;
  createdAt: string;
}

function generateInvoiceNumber(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

const emptyItem = (): LineItem => ({
  description: "",
  qty: 1,
  price: 0,
  tax: 10,
});

const defaultForm: InvoiceFormData = {
  customer: "",
  invoiceDate: "",
  dueDate: "",
  items: [emptyItem()],
};

function CreateInvoice() {
  const navigate = useNavigate();

  const [form, setForm] = useState<InvoiceFormData>(defaultForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loadedDraft, setLoadedDraft] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [submitted, setSubmitted] = useState(false);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        setForm(JSON.parse(raw) as InvoiceFormData);
      }
    } catch (err) {
      console.error("Failed to load invoice draft", err);
    } finally {
      setLoadedDraft(true);
    }
  }, []);

  useEffect(() => {
    setCustomers(getStoredCustomers());
  }, []);

  useEffect(() => {
    if (!loadedDraft) return; 

    setSaveStatus("saving");
    const handle = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
        setSaveStatus("saved");
      } catch (err) {
        console.error("Failed to save invoice draft", err);
      }
    }, 400);

    return () => clearTimeout(handle);
  }, [form, loadedDraft]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === form.customer) ?? null,
    [customers, form.customer],
  );

  const addItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
  };

  const updateItem = (
    index: number,
    field: keyof LineItem,
    value: string | number,
  ) => {
    setForm((prev) => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, items: updated };
    });
  };

  const updateField = (
    field: keyof Omit<InvoiceFormData, "items">,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const subtotal = form.items.reduce(
    (sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0),
    0,
  );

  const taxes = form.items.reduce(
    (sum, item) =>
      sum +
      (Number(item.qty || 0) *
        Number(item.price || 0) *
        Number(item.tax || 0)) /
        100,
    0,
  );

  const total = subtotal + taxes;

  const buildErrorMap = (issues: z.ZodIssue[]): FieldErrors => {
    const map: FieldErrors = {};
    for (const issue of issues) {
      const key = issue.path.join(".");
      if (!map[key]) map[key] = issue.message;
    }
    return map;
  };

  const handleFinalize = () => {
    const result = invoiceSchema.safeParse(form);

    if (!result.success) {
      setErrors(buildErrorMap(result.error.issues));
      setSubmitted(true);
      return;
    }

    setErrors({});

    const customerSnapshot = selectedCustomer
      ? {
          id: selectedCustomer.id,
          fullName: selectedCustomer.fullName,
          email: selectedCustomer.email,
          phone: selectedCustomer.phone,
          address: formatAddress(selectedCustomer),
        }
      : null;

    const record: StoredInvoice = {
      ...result.data,
      invoiceNumber: generateInvoiceNumber(),
      customerSnapshot,
      createdAt: new Date().toISOString(),
    };

    try {
      const raw = localStorage.getItem(INVOICES_KEY);
      const existing: StoredInvoice[] = raw ? JSON.parse(raw) : [];
      localStorage.setItem(INVOICES_KEY, JSON.stringify([...existing, record]));
      localStorage.removeItem(DRAFT_KEY);
      navigate("/");
    } catch (err) {
      console.error("Failed to save invoice", err);
    }
  };

  const itemError = (index: number, field: keyof LineItem) =>
    submitted ? errors[`items.${index}.${field}`] : undefined;

  return (
    <div>
      <div>
        <Navbar />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-8 lg:px-[100px] mt-8">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl">Create Invoice</h1>
          <p className="text-base sm:text-xl my-2">
            Generate a new billing document for your customer.
          </p>
        </div>
        <Button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <MoveLeft size={18} />
          <span>Back to Invoices</span>
        </Button>
      </div>

      <div className="max-w-5xl mx-auto bg-white rounded-xl p-4 sm:p-6 md:p-8 my-6 shadow">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-8">
          <h2 className="flex items-center gap-2 font-bold text-xl">
            <ClipboardList size={22} />
            Create New Invoice
          </h2>
          <span className="text-sm text-gray-400">
            {saveStatus === "saving" && "Saving draft..."}
            {saveStatus === "saved" && "Draft saved"}
          </span>
        </div>

        <div className="mb-6">
          <label className="font-medium">Select Customer</label>

          <select
            className={`w-full border rounded-lg p-3 mt-2 ${
              submitted && errors.customer ? "border-red-500" : ""
            }`}
            value={form.customer}
            onChange={(e) => updateField("customer", e.target.value)}
          >
            <option value="">-- Choose a customer --</option>
            {customers.length === 0 && (
              <option value="" disabled>
                No customers found — add one first
              </option>
            )}
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.fullName}
              </option>
            ))}
          </select>
          {submitted && errors.customer && (
            <p className="text-red-500 text-sm mt-1">{errors.customer}</p>
          )}

          {/* Preview of the selected customer's details, so it's obvious this
              is who the invoice will go to before finalizing. */}
          {selectedCustomer && (
            <div className="mt-3 border rounded-lg p-4 bg-gray-50 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <User size={16} className="text-gray-500 shrink-0" />
                <span className="font-medium truncate">
                  {selectedCustomer.fullName}
                </span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Mail size={16} className="text-gray-500 shrink-0" />
                <span className="truncate">{selectedCustomer.email}</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Phone size={16} className="text-gray-500 shrink-0" />
                <span className="truncate">{selectedCustomer.phone}</span>
              </div>
              {formatAddress(selectedCustomer) && (
                <div className="sm:col-span-3 text-gray-600">
                  {formatAddress(selectedCustomer)}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-5 mb-8">
          <div>
            <label>Invoice Date</label>

            <div
              className={`flex items-center border rounded-lg p-3 mt-2 ${
                submitted && errors.invoiceDate ? "border-red-500" : ""
              }`}
            >
              <Calendar size={18} className="shrink-0" />
              <Input
                type="date"
                className="ml-3 outline-none w-full min-w-0"
                value={form.invoiceDate}
                onChange={(e) => updateField("invoiceDate", e.target.value)}
              />
            </div>
            {submitted && errors.invoiceDate && (
              <p className="text-red-500 text-sm mt-1">{errors.invoiceDate}</p>
            )}
          </div>

          <div>
            <label>Due Date</label>

            <div
              className={`flex items-center border rounded-lg p-3 mt-2 ${
                submitted && errors.dueDate ? "border-red-500" : ""
              }`}
            >
              <Calendar size={18} className="shrink-0" />
              <Input
                type="date"
                className="ml-3 outline-none w-full min-w-0"
                value={form.dueDate}
                onChange={(e) => updateField("dueDate", e.target.value)}
              />
            </div>
            {submitted && errors.dueDate && (
              <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold uppercase">Line Items</h3>

          <button
            onClick={addItem}
            className="flex items-center gap-1 text-blue-600"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Item</span>
          </button>
        </div>

        <div className="border rounded-xl p-4 sm:p-5">
          {/* Column headers only make sense once fields sit side by side */}
          <div className="hidden sm:grid sm:grid-cols-4 gap-4 font-semibold mb-3">
            <div>Description</div>
            <div>Qty</div>
            <div>Price</div>
            <div>Tax %</div>
          </div>

          {submitted && errors.items && (
            <p className="text-red-500 text-sm mb-3">{errors.items}</p>
          )}

          {form.items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 sm:mb-3 pb-4 sm:pb-0 border-b sm:border-b-0 last:border-b-0"
            >
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs text-gray-500 sm:hidden">
                  Description
                </label>
                <Input
                  type="text"
                  placeholder="Enter the item..."
                  className={`border rounded p-2 w-full ${
                    itemError(index, "description") ? "border-red-500" : ""
                  }`}
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                />
                {itemError(index, "description") && (
                  <p className="text-red-500 text-xs mt-1">
                    {itemError(index, "description")}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-500 sm:hidden">Qty</label>
                <Input
                  type="text"
                  className={`border rounded p-2 w-full ${
                    itemError(index, "qty") ? "border-red-500" : ""
                  }`}
                  value={item.qty}
                  onChange={(e) =>
                    updateItem(index, "qty", Number(e.target.value))
                  }
                />
                {itemError(index, "qty") && (
                  <p className="text-red-500 text-xs mt-1">
                    {itemError(index, "qty")}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-500 sm:hidden">Price</label>
                <Input
                  type="text"
                  className={`border rounded p-2 w-full ${
                    itemError(index, "price") ? "border-red-500" : ""
                  }`}
                  value={item.price}
                  onChange={(e) =>
                    updateItem(index, "price", Number(e.target.value))
                  }
                />
                {itemError(index, "price") && (
                  <p className="text-red-500 text-xs mt-1">
                    {itemError(index, "price")}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-500 sm:hidden">Tax %</label>
                <Input
                  type="text"
                  className={`border rounded p-2 w-full ${
                    itemError(index, "tax") ? "border-red-500" : ""
                  }`}
                  value={item.tax}
                  onChange={(e) =>
                    updateItem(index, "tax", Number(e.target.value))
                  }
                />
                {itemError(index, "tax") && (
                  <p className="text-red-500 text-xs mt-1">
                    {itemError(index, "tax")}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Add Item control repeated at the bottom for long lists / mobile
              so people don't have to scroll back up */}
          <button
            onClick={addItem}
            className="flex items-center justify-center gap-1 text-blue-600 w-full border border-dashed rounded-lg py-2 mt-2 sm:hidden"
          >
            <Plus size={18} />
            Add Item
          </button>
        </div>

        <div className="bg-[red] text-white rounded-xl p-5 sm:p-6 mt-8">
          <div className="flex justify-between mb-3 text-sm sm:text-base">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between mb-3 text-sm sm:text-base">
            <span>Taxes</span>
            <span>${taxes.toFixed(2)}</span>
          </div>

          <hr className="my-4" />

          <div className="flex justify-between text-2xl sm:text-3xl font-bold">
            <span>Grand Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={handleFinalize}
          className="mt-8 w-full bg-[red] text-white py-4 rounded-lg font-semibold hover:bg-slate-800"
        >
          Finalize Invoice
        </button>
      </div>
    </div>
  );
}

export default CreateInvoice;
