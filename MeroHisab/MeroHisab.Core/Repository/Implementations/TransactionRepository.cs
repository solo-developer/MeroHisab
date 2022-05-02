using MeroHisab.Core.BaseRepository.Implementations;
using MeroHisab.Core.Entities;
using MeroHisab.Core.Repository.Interface;
using SQLite;

namespace MeroHisab.Core.Repository.Implementations
{
    public class TransactionRepository:BaseRepository<TransactionSummary>,ITransactionRepository
    {
        private SQLiteAsyncConnection db;
        public TransactionRepository(ISqlite sqlite) : base(sqlite)
        {
            db = sqlite.GetConnection();
        }

    }
}
