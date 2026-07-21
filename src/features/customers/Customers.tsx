import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { Button, Input } from "@base-ui/react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

interface Customer {
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

const CUSTOMERS_KEY = "customers";

function Customers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>(() =>
    JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || "[]"),
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(CUSTOMERS_KEY);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCustomers(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error("Failed to parse stored customers:", error);
        setCustomers([]);
      }
    }
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return (
      customer.fullName?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query)
    );
  });

  const hasAddress = (customer: Customer) =>
    Boolean(
      customer.street ||
      customer.city ||
      customer.state ||
      customer.zip ||
      customer.country,
    );

  return (
    <div>
      <Navbar />

      {/* Header: stacks on mobile, side-by-side from sm up */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 my-6 px-4 sm:px-8 lg:px-[50px] py-4 sm:py-[30px]">
        <div>
          <h1 className="font-bold text-2xl sm:text-3xl">Customers</h1>
          <p className="py-2 text-sm sm:text-base text-gray-600">
            Manage your customer database and their billing history.
          </p>
        </div>

        <Button
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-[black] text-black w-full sm:w-auto hover:bg-black hover:text-white transition px-4 py-3 sm:p-5 rounded-2xl w-full sm:w-auto"
          onClick={() => {
            localStorage.removeItem("currentCustomerId");
            navigate("/customer/form1");
          }}
        >
          <Plus />
          <span className="px-2 ">Add Customer</span>
        </Button>
      </div>

      {/* Content: fluid margins instead of fixed 200px */}
      <div className="mx-4 sm:mx-8 lg:mx-[100px] xl:mx-[200px] pb-8">
        <Input
          className="w-full p-3 sm:p-4 rounded-full border text-sm sm:text-base"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
        />

        <div className="hidden md:block mt-8 overflow-x-auto border rounded-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Customer Details</TableCell>
                <TableCell>Contact Info</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => {
                  return (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <p className="font-semibold">{customer.fullName}</p>
                      </TableCell>

                      <TableCell>
                        <p>{customer.email}</p>
                        <p>{customer.phone}</p>
                      </TableCell>

                      <TableCell>
                        {hasAddress(customer) ? (
                          <div>
                            <p>{customer.street}</p>
                            <p>
                              {customer.city}, {customer.state}
                            </p>
                            <p>
                              {customer.zip}, {customer.country}
                            </p>
                          </div>
                        ) : (
                          <p className="text-gray-400">No address on file</p>
                        )}
                      </TableCell>

                      <TableCell>
                        <Button
                          onClick={() => navigate("/")}
                          className="gap-2 px-6 py-2 rounded-full border-2 border-[black] text-black w-full sm:w-auto hover:bg-black hover:text-white transition"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No customers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile: stacked cards instead of a cramped table */}
        <div className="md:hidden mt-6 flex flex-col gap-4">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => {
              return (
                <div
                  key={customer.id}
                  className="border rounded-xl p-4 shadow-sm bg-white"
                >
                  <p className="font-semibold text-lg">{customer.fullName}</p>

                  <div className="mt-2 text-sm text-gray-700 space-y-0.5">
                    <p>{customer.email}</p>
                    <p>{customer.phone}</p>
                  </div>

                  <div className="mt-3 text-sm text-gray-600">
                    {hasAddress(customer) ? (
                      <>
                        <p>{customer.street}</p>
                        <p>
                          {customer.city}, {customer.state}
                        </p>
                        <p>
                          {customer.zip}, {customer.country}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-400">No address on file</p>
                    )}
                  </div>

                  <Button
                    onClick={() => navigate("/")}
                    className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded-lg"
                  >
                    View
                  </Button>
                </div>
              );
            })
          ) : (
            <p className="text-center py-8 text-gray-500">No customers found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Customers;
