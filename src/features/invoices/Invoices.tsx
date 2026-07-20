import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import {
  BanknoteArrowDown,
  CircleCheck,
  Clock,
  DollarSign,
  Plus,
  TrendingUp,
  X,
} from "lucide-react";
import { Button, Input } from "@base-ui/react";

import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

interface InvoiceItem {
  description: string;
  qty: number;
  price: number;
  tax: number;
}

interface CustomerSnapshot {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

interface Invoice {
  customer: string; 
  customerSnapshot?: CustomerSnapshot | null;
  invoiceNumber?: string;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItem[];
  status: "Paid" | "Pending";
  createdAt?: string;
}

function generateInvoiceNumber(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

function Invoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);



  const showReceipt = selectedIndex !== null;
  const selectedInvoice =
    selectedIndex !== null ? invoices[selectedIndex] : null;


      useEffect(() => {
        const storedInvoices = localStorage.getItem("invoices");

        if (storedInvoices) {
          const parsedInvoices = JSON.parse(storedInvoices).map(
            (invoice: any) => ({
              ...invoice,
              status: (invoice.status === "Pending" ? "Pending" : "Paid") as
                | "Paid"
                | "Pending",
              invoiceNumber: invoice.invoiceNumber || generateInvoiceNumber(),
            }),
          ) as Invoice[];

          setInvoices(parsedInvoices);

          localStorage.setItem("invoices", JSON.stringify(parsedInvoices));
        }
      }, []);

  useEffect(() => {
    document.body.style.overflow = showReceipt ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showReceipt]);

  const toggleStatus = (index: number) => {
    const updatedInvoices = invoices.map((invoice, i) => {
      if (i === index) {
        return {
          ...invoice,
          status: (invoice.status === "Paid" ? "Pending" : "Paid") as
            | "Paid"
            | "Pending",
        };
      }
      return invoice;
    });

    setInvoices(updatedInvoices);
    localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
  };


  const getCustomerName = (invoice: Invoice) =>
    invoice.customerSnapshot?.fullName || invoice.customer;

  const getInvoiceAmount = (invoice: Invoice) => {
    return invoice.items.reduce((total, item) => {
      const subtotal = item.qty * item.price;
      const tax = (subtotal * item.tax) / 100;
      return total + subtotal + tax;
    }, 0);
  };

  const getInvoiceBreakdown = (invoice: Invoice) => {
    const subtotal = invoice.items.reduce(
      (sum, item) => sum + item.qty * item.price,
      0,
    );
    const tax = invoice.items.reduce(
      (sum, item) => sum + (item.qty * item.price * item.tax) / 100,
      0,
    );
    return { subtotal, tax, total: subtotal + tax };
  };

  const totalRevenue = invoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((sum, invoice) => sum + getInvoiceAmount(invoice), 0);

  const pendingAmount = invoices
    .filter((invoice) => invoice.status === "Pending")
    .reduce((sum, invoice) => sum + getInvoiceAmount(invoice), 0);

  const outstanding = pendingAmount;

  const filteredInvoices = invoices
    .map((invoice, originalIndex) => ({ invoice, originalIndex }))
    .filter(({ invoice, originalIndex }) => {
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        (invoice.invoiceNumber || "").toLowerCase().includes(term) ||
        getCustomerName(invoice).toLowerCase().includes(term)
      );
    });

  const dashboardCards = [
    {
      title: "Total Revenue",
      value: `₹ ${totalRevenue.toFixed(2)}`,
      subtitle: "Total billed amount",
      icon: TrendingUp,
    },
    {
      title: "Pending Amount",
      value: `₹ ${pendingAmount.toFixed(2)}`,
      subtitle: "Awaiting payment",
      icon: Clock,
    },
    {
      title: "Paid Invoices",
      value: `₹ ${totalRevenue.toFixed(2)}`,
      subtitle: "Received payments",
      icon: CircleCheck,
    },
    {
      title: "Outstanding",
      value: `₹ ${outstanding.toFixed(2)}`,
      subtitle: "Amount due",
      icon: DollarSign,
    },
  ];

  return (
    <div className="relative">
      <div>
        <Navbar />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between my-6 px-4 py-6 sm:my-[30px] sm:p-[50px]">
        <div>
          <h1 className="font-bold text-2xl sm:text-3xl">Invoices</h1>
          <p className="py-2 sm:py-[10px] text-sm sm:text-base">
            Manage and track your customer billings effortlessly.
          </p>
        </div>
        <div>
          <Button
            className="flex items-center justify-center w-full sm:w-auto bg-[red] text-white px-4 py-3 sm:p-[20px] rounded-2xl"
            onClick={() => navigate("/Invoice")}
          >
            <Plus />
            <div className="px-2 sm:px-[10px]">New Invoice</div>
          </Button>
        </div>
      </div>

      {/* Summary cards: single column on mobile, wraps into a grid from sm up */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-[50px]">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              key={index}
              className="flex border-2 shadow-2xl rounded-2xl justify-between border-black p-5 sm:p-[30px]"
            >
              <div>
                <p className="font-medium text-lg sm:text-xl py-1 sm:py-[5px]">
                  {card.title}
                </p>

                <p className="font-bold py-1 sm:py-[5px] text-2xl sm:text-3xl break-words">
                  {card.value}
                </p>

                <p className="text-sm sm:text-base">{card.subtitle}</p>
              </div>

              <div className="mt-2 sm:mt-[20px] shrink-0">
                <Icon className="size-[28px] sm:size-[40px]" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 sm:px-[50px] py-4 sm:py-[20px]">
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-[44px] sm:h-[30px] px-4 sm:p-[30px] my-4 sm:my-[20px] rounded-2xl border"
          placeholder="Search by invoice number or customer..."
        />
      </div>

      <div className="px-4 sm:px-[60px] pb-8">
        <div className="border-2 rounded-lg overflow-hidden">
          <h1 className="p-3 font-bold">All Invoices</h1>

          <div className="overflow-x-auto">
            <Table className="text-sm sm:text-[16px] min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableCell>Invoice</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Issue Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map(({ invoice, originalIndex }) => {
                    const amount = getInvoiceAmount(invoice);

                    return (
                      <TableRow key={originalIndex}>
                        <TableCell
                          onClick={() => setSelectedIndex(originalIndex)}
                          className="whitespace-nowrap cursor-pointer"
                        >
                          #{invoice.invoiceNumber}
                        </TableCell>

                        <TableCell>{getCustomerName(invoice)}</TableCell>

                        <TableCell className="whitespace-nowrap">
                          {invoice.invoiceDate}
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          ₹ {amount.toFixed(2)}
                        </TableCell>

                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-sm font-medium whitespace-nowrap ${
                              invoice.status === "Paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </TableCell>

                        <TableCell>
                          <button
                            onClick={() => toggleStatus(originalIndex)}
                            className="text-blue-600 hover:underline whitespace-nowrap"
                          >
                            {invoice.status === "Paid"
                              ? "Mark unpaid"
                              : "Mark paid"}
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-5">
                      No invoices found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Receipt modal — now driven by the actual invoice that was clicked */}
      {showReceipt && selectedInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end p-4 sm:p-[20px]">
              <button
                aria-label="Close receipt"
                onClick={() => setSelectedIndex(null)}
              >
                <X />
              </button>
            </div>

            <div className="px-6 sm:px-[60px] pb-8 sm:pb-[50px]">
              <div className="text-center border-b-[5px] border-b-[red] py-6 sm:py-[30px]">
                <h1 className="text-xl text-[red] font-bold">
                  {selectedInvoice.customerSnapshot?.fullName ||
                    getCustomerName(selectedInvoice)}
                </h1>
                {selectedInvoice.customerSnapshot?.address && (
                  <p>{selectedInvoice.customerSnapshot.address}</p>
                )}
                {selectedInvoice.customerSnapshot?.email && (
                  <p className="text-sm text-gray-600">
                    {selectedInvoice.customerSnapshot.email}
                    {selectedInvoice.customerSnapshot.phone
                      ? ` • ${selectedInvoice.customerSnapshot.phone}`
                      : ""}
                  </p>
                )}
              </div>

              <div className="flex justify-between py-6 sm:py-[30px] text-sm sm:text-base">
                <div>#{selectedInvoice.invoiceNumber}</div>
                <div>{selectedInvoice.invoiceDate}</div>
              </div>

              <div className="overflow-x-auto">
                <Table className="text-sm sm:text-[16px] min-w-[320px]">
                  <TableHeader>
                    <TableRow>
                      <TableCell>Item Name</TableCell>
                      <TableCell>QTY</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {selectedInvoice.items.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.qty}</TableCell>
                        <TableCell>
                          ₹{" "}
                          {(
                            item.qty * item.price +
                            (item.qty * item.price * item.tax) / 100
                          ).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {(() => {
                const { subtotal, tax, total } =
                  getInvoiceBreakdown(selectedInvoice);
                return (
                  <>
                    <div className="flex justify-between text-sm sm:text-base pt-4">
                      <div>Subtotal</div>
                      <div>₹ {subtotal.toFixed(2)}</div>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <div>Tax</div>
                      <div>₹ {tax.toFixed(2)}</div>
                    </div>
                    <div className="flex justify-between border-b-[4px] py-4 sm:py-[20px] border-b-[red] font-medium">
                      <div>Total</div>
                      <div>₹ {total.toFixed(2)}</div>
                    </div>
                  </>
                );
              })()}

              <div className="flex justify-between py-4 sm:py-[20px] text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <BanknoteArrowDown />
                  {selectedInvoice.status === "Paid"
                    ? "Paid"
                    : "Pending payment"}
                </div>
                <div>₹ {getInvoiceAmount(selectedInvoice).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Invoices;
