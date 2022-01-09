using MeroHisab.Core.Exceptions;

namespace MeroHisab.Core.Dto
{
    public class TransactionDetailDto
    {
        private int _ledgerId,_refLedgerId;
        private decimal _debitAmount,_creditAmount;

        public DateTime TransactionDate { get; set; } = DateTime.Now;

        public int LedgerId {
            get => _ledgerId;
            set
            {
                if (value < 0)
                    throw new InvalidValueException("Ledger id is not valid.");
                _ledgerId = value;
            }
        }

        public int RefLedgerId {
            get => _refLedgerId;
            set
            {
                if (value < 0)
                    throw new InvalidValueException("Reference Ledger Id is not valid.");
                _refLedgerId = value;
            }
        }

        public decimal DebitAmount
        {
            get => _debitAmount;
            set
            {
                if (value < 0)
                {
                    throw new InvalidValueException("Debit Amount is not valid.");
                }
                _debitAmount = value;
            }
        }

        public decimal CreditAmount
        {
            get => _creditAmount;
            set
            {
                if (value < 0)
                {
                    throw new InvalidValueException("Credit Amount is not valid.");
                }
                _creditAmount = value;
            }
        }
    }
}
