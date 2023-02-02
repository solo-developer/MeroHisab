using MeroHisab.Core.Exceptions;
using System;

namespace MeroHisab.Core.Entities
{
    public class TransactionDetail : BaseEntity
    {
        private long _ledgerId, _refLedgerId;
        private decimal _drAmount = 0, _crAmount = 0;

        public long TransactionId { get; set; }
        public long LedgerId
        {
            get => _ledgerId;
            set
            {
                if (value < 0)
                    throw new InvalidValueException("The ledger provided is invalid.");
                _ledgerId = value;
            }
        }

        public long RefLedgerId
        {
            get => _refLedgerId;
            set
            {
                if (value < 0)
                    throw new InvalidValueException("The Reference Ledger provided is invalid.");
                _refLedgerId = value;
            }
        }

        public DateTime TransactionDate { get; set; } = DateTime.Now;

        public decimal DrAmount
        {
            get => _drAmount;
            set
            {
                if (value < 0)
                    throw new InvalidValueException("The Debit amount provided is invalid.");
                _drAmount = value;
            }
        }

        public decimal CrAmount
        {
            get => _crAmount;
            set
            {
                if (value < 0)
                    throw new InvalidValueException("The Credit amount provided is invalid.");
                _crAmount = value;
            }
        }

        public decimal Balance { get; set; }

        public bool IsValid()
        {
            if (LedgerId == RefLedgerId)
                return false;
            else
                return true;
        }

    }
}
