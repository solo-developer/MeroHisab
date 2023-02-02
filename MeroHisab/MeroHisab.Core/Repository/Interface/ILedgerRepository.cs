using MeroHisab.Core.BaseRepository.Interface;
using MeroHisab.Core.Entities;
using SQLite;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MeroHisab.Core.Repository.Interface
{
    public interface ILedgerRepository : IBaseRepository<Ledger>
    {
        Task<Ledger> GetByName(string name);
        AsyncTableQuery<Ledger> GetQueryable();
      //  Task<List<Ledger>> getLedgersByLedgerGroup(long ledger_group_id);
        Task<List<Ledger>> GetLedgersUnderAssetsGroup();
        Task<List<Ledger>> GetLedgersUnderIncomeGroup();
        Task<List<Ledger>> GetLedgersUnderExpensesGroup();
        Task<List<Ledger>> GetLedgersUnderLiabilitiesGroup();
    }
}
