using MeroHisab.Core.Dto;

namespace MeroHisab.Core.Extensions
{
    public static class TransactionDetailDtoExtensions
    {
        public static void AddDebitResponseData(this List<TransactionDetailDto> response_datas, LedgerTransactionDto debit_ledger, LedgerTransactionDto credit_ledger, decimal amount)
        {
            response_datas.Add(new TransactionDetailDto()
            {
                LedgerId = debit_ledger.LedgerId,
                RefLedgerId = credit_ledger.LedgerId,
                DebitAmount = amount,
                CreditAmount = 0
            });
        }

        public static void AddCreditResponseData(this List<TransactionDetailDto> response_datas, LedgerTransactionDto debit_ledger, LedgerTransactionDto credit_ledger, decimal amount)
        {
            response_datas.Add(new TransactionDetailDto()
            {
                LedgerId = credit_ledger.LedgerId,
                RefLedgerId = debit_ledger.LedgerId,
                CreditAmount = amount,
                DebitAmount = 0
            });
        }
    }
}
