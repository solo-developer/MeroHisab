using MeroHisab.Core.Exceptions;
using System;

namespace MeroHisab.Core.Dto
{
    public class AddReceiptDto
    {
        private int _receiptTo, _receiptFrom;
        private decimal _amount, _discount;

        public int ReceiptId { get; set; }
        public int ReceiptTo {
            get => _receiptTo;
            set
            {
                if (value <= 0)
                    throw new InvalidValueException("Receipt To ID is invalid.");
                _receiptTo = value;
            }
        }

        public int ReceiptFrom {
            get => _receiptFrom;
            set
            {
                if (value <= 0)
                    throw new InvalidValueException("Receipt From Id is required.");
                    _receiptFrom = value;
            }
        }

        public DateTime TransactionDate { get; set; } = DateTime.Now;
        public decimal Amount {
            get => _amount;
            set
            {
                if (value < 0)
                    throw new InvalidValueException("Amount is not valid.");
                _amount = value;
            }
        }

        public decimal Discount {
            get => _discount;
            set
            {
                if (value < 0)
                    throw new InvalidValueException("Discount is not valid.");
                _discount = value;
            }
        }

        public string Remarks { get; set; }
        public string CustomerName { get; set; }
       
        public bool IsValid()
        {
            if (Amount <= 0 || ReceiptFrom <= 0 || ReceiptTo <= 0 || Discount < 0)
                return false;
            else
                return true;
        }
    }
}
