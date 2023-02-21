using MeroHisab.Core.Dto;
using MeroHisab.Core.Entities;
using MeroHisab.Core.Makers.Interface;

namespace MeroHisab.Core.Makers.Implementations
{
    public class ReceiptMaker:IReceiptMaker
    {
        public void Copy(Receipt receipt, AddReceiptDto receipt_dto)
        {
            receipt.ReceiptFrom = receipt_dto.ReceiptFrom;
            receipt.ReceiptTo = receipt_dto.ReceiptTo;
            receipt.Remarks = receipt_dto.Remarks;
            receipt.Amount = receipt_dto.Amount;
            receipt.Discount = receipt_dto.Discount;
            receipt.CustomerName = receipt_dto.CustomerName;
            receipt.TransactionDate = receipt_dto.TransactionDate;
        }
    }
}
