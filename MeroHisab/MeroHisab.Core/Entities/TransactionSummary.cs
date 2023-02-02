using MeroHisab.Core.Enums;
using MeroHisab.Core.Exceptions;
using System;

namespace MeroHisab.Core.Entities
{
    public class TransactionSummary : BaseEntity
    {
        private decimal _amount = 0;

        public DateTime TransactionDate { get; set; } = DateTime.Now;

        public DateTime EntryDate { get; set; } = DateTime.Now;

        public string Remarks { get; set; }

        public int VoucherNo { get; set; }
        public VoucherType VoucherType { get; set; }
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
    }
}
