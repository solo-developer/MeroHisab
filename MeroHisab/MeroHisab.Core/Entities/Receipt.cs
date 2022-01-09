using MeroHisab.Core.Exceptions;

namespace MeroHisab.Core.Entities
{
    public class Receipt : BaseEntity
    {
        private int _receiptTo, _receiptFrom;
        private decimal _amount = 0, _discount = 0;

        public int ReceiptTo
        {
            get => _receiptTo;
            set
            {
                if (value <= 0)
                    throw new InvalidValueException("The receipt To value provided is invalid.");
                _receiptTo = value;

            }
        }

        public int ReceiptFrom
        {
            get => _receiptFrom;
            set
            {
                if (value <= 0)
                    throw new InvalidValueException("The receipt from value provided is invalid.");
                _receiptFrom = value;
            }
        }
        public DateTime TransactionDate { get; set; }
        public DateTime EntryDate { get; set; } = DateTime.Now;

        public decimal Amount
        {
            get => _amount;
            set
            {
                if (value < 0)
                    throw new InvalidValueException("The value provided is invalid.");
                _amount = value;
            }
        }

        public decimal Discount
        {
            get => _discount;
            set
            {
                if (value < 0)
                    throw new InvalidValueException("The value provided is invalid.");
                _discount = value;
            }
        }

        public string Remarks { get; set; }

        public string ChequeDate { get; set; }
        public string ChequeNo { get; set; }
        public string CustomerName { get; set; }

        public bool IsCancelled { get; set; } = false;

        public DateTime CancelledDate { get; set; }

    }
}
