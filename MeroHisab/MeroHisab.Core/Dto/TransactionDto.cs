using MeroHisab.Core.Enums;
using System;
using System.Collections.Generic;

namespace MeroHisab.Core.Dto
{
    public class TransactionDto
    {
        private List<LedgerTransactionDto> _creditLedgers = new List<LedgerTransactionDto>();
        private List<LedgerTransactionDto> _debitLedgers = new List<LedgerTransactionDto>();

        public DateTime TransactionDate { get; set; } = DateTime.Now;

        public string Remarks { get; set; }

        public VoucherType VoucherType { get; set; }

        public int VoucherNo { get; set; }

        public bool IsDebitBased()
        {
            return _debitLedgers.Count == 1;
        }

        public void AddDebitData(LedgerTransactionDto transactionDetailDto)
        {
            _debitLedgers.Add(transactionDetailDto);
        }

        public void AddCreditData(LedgerTransactionDto transactionDetailDto)
        {
            _creditLedgers.Add(transactionDetailDto);
        }

        public List<LedgerTransactionDto> GetCreditLedgers()
        {
            return _creditLedgers;
        }

        public List<LedgerTransactionDto> GetDebitLedgers()
        {
            return _debitLedgers;
        }
        public decimal GetTransactionAmount()
        {
            return CalculateTransactionAmount();
        }

        private decimal CalculateTransactionAmount()
        {
            decimal transactionAmount = 0;
            if (_debitLedgers.Count == _creditLedgers.Count)
            {
                foreach (var ta in _debitLedgers)
                {
                    transactionAmount += ta.Amount;
                    return transactionAmount;
                }
            }
            var dataWithMaximumItem = _debitLedgers.Count > _creditLedgers.Count ? _debitLedgers : _creditLedgers;
            foreach (var da in dataWithMaximumItem)
            {
                transactionAmount += da.Amount;
            }
            return transactionAmount;
        }


        public bool IsTransactionAmountValid()
        {
            decimal drAmount = 0, crAmount = 0;
            foreach (var x in _debitLedgers)
            {
                if (x.Amount < 0)
                    return false;
                drAmount += x.Amount;
            }
            foreach (var y in _creditLedgers)
            {
                if (y.Amount < 0)
                    return false;
                crAmount += y.Amount;
            }
            if (drAmount != crAmount)
                return false;
            return true;

        }

        public bool IsTransactionPerformedValid()
        {
            int debitLedgerCount = _debitLedgers == null ? 0 : _debitLedgers.Count;
            int creditLedgerCount = _creditLedgers == null ? 0 : _creditLedgers.Count;
            if (debitLedgerCount == 0 || creditLedgerCount == 0)
                return false;
            return true;
        }

        public bool IsTransactionDateValid()
        {
            return TransactionDate <=DateTime.Now;
        }
    }
}
