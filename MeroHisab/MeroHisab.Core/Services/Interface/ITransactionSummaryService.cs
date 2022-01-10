using MeroHisab.Core.Dto;

namespace MeroHisab.Core.Repository.Interface
{
    public interface ITransactionSummaryService
    {
        Task AddTransaction(TransactionDto transactionDto);
    }
}
