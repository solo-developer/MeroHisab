using MeroHisab.Core.Entities;
using MeroHisab.Core.Repository.Interface;
using SQLite;

namespace MeroHisab.Core.Repository.Implementations
{
    public class ReceiptRepository:BaseRepository<Receipt> , IReceiptRepository
    {
        private SQLiteAsyncConnection db;
        public ReceiptRepository(ISqlite sqlite) : base(sqlite)
        {
            db = sqlite.GetConnection();
        }
    }

}
