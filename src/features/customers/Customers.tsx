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
  fullName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    sameAddress: boolean;
  };
}

function Customers() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const customerData = localStorage.getItem("customerForm");
    const addressData = localStorage.getItem("newCustomerDraft");

    if (customerData && addressData) {
      const customerForm = JSON.parse(customerData);
      const addressForm = JSON.parse(addressData);

      setCustomer({
        ...customerForm,
        ...addressForm,
      });
    }
  }, []);

  return (
    <div>
      <Navbar />

      <div className="flex justify-between my-[30px] p-[50px]">
        <div>
          <h1 className="font-bold text-3xl">Customers</h1>
          <p className="py-[10px]">
            Manage your customer database and their billing history.
          </p>
        </div>

        <Button
          className="flex bg-blue-600 text-white p-5 rounded-2xl"
          onClick={() => navigate("/customer/form1")}
        >
          <Plus />
          <span className="px-2">Add Customer</span>
        </Button>
      </div>

      <div className="mx-[200px]">
        <Input
          className="w-full p-4 rounded-full border"
          placeholder="Search by name, email or phone..."
        />

        <Table className="mt-8 border rounded-xl">
          <TableHeader>
            <TableRow>
              <TableCell>Customer Details</TableCell>
              <TableCell>Contact Info</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {customer ? (
              <TableRow>
                <TableCell>
                  <div>
                    <p className="font-semibold">{customer.fullName}</p>
                  </div>
                </TableCell>

                <TableCell>
                  <div>
                    <p>{customer.email}</p>
                    <p>{customer.phone}</p>
                  </div>
                </TableCell>

                <TableCell>
                  <div>
                    <p>{customer.address.street}</p>
                    <p>
                      {customer.address.city}, {customer.address.state}
                    </p>
                    <p>
                      {customer.address.zip}, {customer.address.country}
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  <Button onClick={()=> navigate('/')} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                    View
                  </Button>
                </TableCell>
              </TableRow>
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
    </div>
  );
}

export default Customers;
