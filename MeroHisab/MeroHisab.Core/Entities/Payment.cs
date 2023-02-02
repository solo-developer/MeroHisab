using MeroHisab.Core.Exceptions;
using System;

namespace MeroHisab.Core.Entities
{
    public class Payment : BaseEntity
    {
        private int _paymentTo, _paymentFrom;
        private decimal _amount = 0, _discount = 0;


        public int PaymentTo
        {
            get => _paymentTo;
            set
            {
                if (value <= 0)
                    throw new InvalidValueException("The Id you provided is invalid.");
                _paymentTo = value;
            }
        }

        public int PaymentFrom
        {
            get => _paymentFrom;
            set
            {
                if (value <= 0)
                    throw new InvalidValueException("The Id you provided is invalid.");
                _paymentFrom = value;
            }
        }

        public DateTime TransactionDate { get; set; } = DateTime.Now;

        public DateTime EntryDate { get; set; } = DateTime.Now;

        public decimal Amount
        {
            get => _amount;
            set
            {
                if (value < 0)
                    throw new InvalidValueException("The amount provided is invalid.");
                _amount = value;
            }
        }

        public decimal Discount
        {
            get => _discount;
            set
            {
                if (value < 0)
                    throw new InvalidValueException("The discount provided is invalid.");
                _discount = value;
            }
        }

        public string Remarks { get; set; }

        public string ChequeNo { get; set; }
        public string ChequeDate { get; set; }

        public bool IsCancelled { get; set; } = false;

        public DateTime CancelledDate { get; set; }
    }
}
