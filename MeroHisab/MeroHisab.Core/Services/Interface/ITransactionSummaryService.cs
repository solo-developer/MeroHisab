using MeroHisab.Core.Dto;

namespace LE.Account.Service.Services.Interface
{
    public interface ITransactionSummaryService
    {
        Task AddTransaction(TransactionDto transactionDto);
    }
}
