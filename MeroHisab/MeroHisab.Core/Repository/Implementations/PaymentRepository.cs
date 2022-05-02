using MeroHisab.Core.BaseRepository.Implementations;
using MeroHisab.Core.Entities;
using MeroHisab.Core.Repository.Interface;
using SQLite;

namespace MeroHisab.Core.Repository.Implementations
{
    public class PaymentRepository:BaseRepository<Payment>, IPaymentRepository
    {
        private SQLiteAsyncConnection db;
        public PaymentRepository(ISqlite sqlite) : base(sqlite)
        {
            db = sqlite.GetConnection();
        }
    }
}
