
import Invoices from './features/invoices/Invoices'

import { Routes, Route } from "react-router-dom";
import CreateInvoice from './features/invoices/CreateInvoice';
import AddCustomer from './features/customers/AddCustomer';
import Customers from './features/customers/Customers';
import AddressInformation from './features/customers/AddressInformation';


function App() {

  // localStorage.clear()

  return (
    <div>
      {/* <Customers/>
      <AddCustomer/> */}
      <Routes>
        <Route path="/" element={<Invoices />} />
        <Route path="/Invoice" element={<CreateInvoice />} />
        <Route path="/customer" element={<Customers />} />
        <Route path="/customer/form1" element={<AddCustomer />} />
        <Route path="/customer/form2" element={<AddressInformation />} />
      </Routes>
      {/* <FinalBill/> */}
    </div>
  );
}

export default App