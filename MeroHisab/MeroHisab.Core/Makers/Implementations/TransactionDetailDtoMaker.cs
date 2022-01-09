using MeroHisab.Core.Dto;
using MeroHisab.Core.Extensions;
using MeroHisab.Core.Makers.Interface;

namespace MeroHisab.Core.Makers.Implementations
{
    public class TransactionDetailDtoMaker : ITransactionDetailDtoMaker
    {
        public List<TransactionDetailDto> GetTransactionDetails(TransactionDto transaction_dto)
        {
            try
            {
                List<TransactionDetailDto> responseDatas = new List<TransactionDetailDto>();

                List<LedgerTransactionDto> debitLedgers = transaction_dto.GetDebitLedgers();
                List<LedgerTransactionDto> creditLedgers = transaction_dto.GetCreditLedgers();

                foreach (var debitLedger in debitLedgers)
                {
                    decimal amountInDebitLedger = debitLedger.Amount;
                    foreach (var creditLedger in creditLedgers.Where(a => a.Amount > 0).ToList())
                    {
                        if (amountInDebitLedger == 0)
                            break;
                        decimal amountInCreditLedger = creditLedger.Amount;

                        decimal transactionAmount = 0;
                        if (amountInDebitLedger <= amountInCreditLedger)
                        {
                            transactionAmount = amountInDebitLedger;
                            creditLedger.Amount -= amountInDebitLedger;
                            amountInDebitLedger = 0;
                        }
                        else
                        {
                            transactionAmount = amountInCreditLedger;

                            amountInDebitLedger -= amountInCreditLedger;
                            creditLedger.Amount = 0;
                        }
                        responseDatas.AddDebitResponseData(debitLedger, creditLedger, transactionAmount);
                    }
                }

                revertDatasToMakeCreditResponseDatas(responseDatas);

                responseDatas.ForEach(a =>
                {
                    a.TransactionDate = transaction_dto.TransactionDate;
                });

                return responseDatas;
            }
            catch (Exception)
            {
                throw;
            }
        }

        private void revertDatasToMakeCreditResponseDatas(List<TransactionDetailDto> responseDatas)
        {
            List<TransactionDetailDto> creditBasedTransactions = new List<TransactionDetailDto>();
            foreach (var responseData in responseDatas)
            {
                creditBasedTransactions.Add(new TransactionDetailDto()
                {
                    CreditAmount = responseData.DebitAmount,
                    DebitAmount = 0,
                    RefLedgerId = responseData.LedgerId,
                    LedgerId = responseData.RefLedgerId,
                });
            }
            responseDatas.AddRange(creditBasedTransactions);
        }
    }
}
