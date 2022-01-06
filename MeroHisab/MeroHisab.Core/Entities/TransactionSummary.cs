using MeroHisab.Core.Exceptions;

namespace MeroHisab.Core.Entities
{
    public class TransactionSummary
    {
        public class Transaction : BaseEntity
        {
            private decimal _amount = 0;

            public DateTime transaction_date { get; set; } = DateTime.Now;

            public DateTime entry_date { get; set; } = DateTime.Now;

            public string remarks { get; set; }

            public string voucher_no { get; set; }

            public decimal amount
            {
                get => _amount;
                set
                {
                    if (value < 0)
                        throw new InvalidValueException("The amount provided is invalid.");
                    _amount = value;
                }
            }
        }
    }
}
