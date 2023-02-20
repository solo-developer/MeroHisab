using MeroHisab.Core.Exceptions;
using System;

namespace MeroHisab.Core.Dto
{
    public class PaymentDto
    {
        private decimal _amount,_discount;
        private long _userId;

        public int PaymentId { get; set; }
        public int PaymentTo { get; set; }
        public int PaymentFrom { get; set; }
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
     
        public bool IsValid()
        {
            if (Amount <= 0 || PaymentFrom <= 0 || PaymentTo <= 0 || Discount < 0)
                return false;
            else
                return true;
        }
    }
}
