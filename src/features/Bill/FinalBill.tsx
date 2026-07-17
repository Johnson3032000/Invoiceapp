import React from 'react'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import { BanknoteArrowDown } from 'lucide-react';

function FinalBill() {
  return (
    <div className="px-[100px] py-[50px]">
      <div className="text-center border-b-[5px] border-b-[red] py-[30px]">
        <h1 className='text-xl text-[red] font-bold'>Hotel Name</h1>
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
        <div> <BanknoteArrowDown/> Pay by cash</div>
        <div>$39.09</div>
      </div>
    </div>
  );
}

export default FinalBill