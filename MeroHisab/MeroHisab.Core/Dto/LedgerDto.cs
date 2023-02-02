using MeroHisab.Core.Enums;
using MeroHisab.Core.Exceptions;
using System;

namespace MeroHisab.Core.Dto
{
    public class LedgerDto
    {
        private string _name;
        private decimal _openingBalance;

        
        public int LedgerId { get; set; }

        public string Name {
            get => _name;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new NonEmptyValueException("Ledger name must be provided.");
                _name = value;
            }
        }
        public LedgerGroupType Type { get; set; }

        public string Code { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;
       
        public OpeningBalanceType BalanceType { get; set; }
        public decimal OpeningBalance {
            get => _openingBalance;
            set
            {
                if (value < 0)
                    throw new InvalidValueException("Opening Balance cannot be less than zero.");
                _openingBalance = value;
            }
        }

    }
}
