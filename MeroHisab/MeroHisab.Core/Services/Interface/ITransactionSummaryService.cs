using MeroHisab.Core.Dto;
using System.Threading.Tasks;

namespace MeroHisab.Core.Repository.Interface
{
    public interface ITransactionSummaryService
    {
        Task AddTransaction(TransactionDto transactionDto);
    }
}
