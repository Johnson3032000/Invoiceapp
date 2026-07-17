import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { BanknoteArrowDown, CircleCheck, Clock, DollarSign, Plus, TrendingUp, X } from "lucide-react";
import { Button, Input } from "@base-ui/react";

import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import FinalBill from "../Bill/FinalBill";
import { vi } from "zod/v4/locales";

interface InvoiceItem {
  description: string;
  qty: number;
  price: number;
  tax: number;
}

interface Invoice {
  customer: string;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItem[];
  status: "Paid" | "Pending";
}

function Invoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const[vis, setvis]= useState(true)

  useEffect(() => {
    const storedInvoices = localStorage.getItem("invoices");

    if (storedInvoices) {
      const parsedInvoices = JSON.parse(storedInvoices).map((invoice: any) => ({
        ...invoice,
        status: (invoice.status === "Pending" ? "Pending" : "Paid") as
          | "Paid"
          | "Pending",
      })) as Invoice[];

      setInvoices(parsedInvoices);

      localStorage.setItem("invoices", JSON.stringify(parsedInvoices));
    }
  }, []);

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

  const getInvoiceAmount = (invoice: Invoice) => {
    return invoice.items.reduce((total, item) => {
      const subtotal = item.qty * item.price;
      const tax = (subtotal * item.tax) / 100;
      return total + subtotal + tax;
    }, 0);
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
      const invoiceNumber = `INV-${originalIndex + 1}`;
      return (
        invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        invoice.customer.toLowerCase().includes(search.toLowerCase())
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
      <div style={{ opacity: vis ? 1 : 0.5 }}>
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

            {/* Horizontal scroll wrapper so the table never breaks the layout on small screens */}
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
                            onClick={() => setvis(!vis)}
                            className="whitespace-nowrap"
                          >
                            INV-{originalIndex + 1}
                          </TableCell>

                          <TableCell>{invoice.customer}</TableCell>

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
      </div>
      <div
        className="absolute h-screen top-[10px] left-[950px] bg-[white]"
        style={{ display: vis ? "none" : "block" }}
      >
        <div className="flex justify-between p-[20px]">
          <div></div>
          <div>
            <X onClick={() => setvis(!vis)} />{" "}
          </div>
        </div>
        <div className="px-[100px] py-[50px]">
          <div className="text-center border-b-[5px] border-b-[red] py-[30px]">
            <h1 className="text-xl text-[red] font-bold">Hotel Name</h1>
            <p>Some where in USA</p>
          </div>
          <div className="flex justify-between py-[30px]">
            <div>Order# 44</div>
            <div>07-01-26 01:10 pm</div>
          </div>
          <Table className="text-sm sm:text-[16px] min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableCell>Item Name</TableCell>
                <TableCell>QTY</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              <TableCell>Onion ring</TableCell>
              <TableCell>1</TableCell>
              <TableCell>$32</TableCell>
            </TableBody>
          </Table>
          <div className="flex justify-between">
            <div>Subtotal</div>
            <div>$70.92</div>
          </div>
          <div className="flex justify-between">
            <div>Tax</div>
            <div>&7.09</div>
          </div>
          <div className="flex justify-between border-b-[4px] py-[20px] border-b-[red]">
            <div>Total</div>
            <div>$78.01</div>
          </div>
          <div className="flex justify-between py-[20px]">
            <div>
              {" "}
              <BanknoteArrowDown /> Pay by cash
            </div>
            <div>$39.09</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Invoices;
