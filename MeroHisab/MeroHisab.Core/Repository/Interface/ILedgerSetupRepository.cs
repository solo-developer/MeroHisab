using MeroHisab.Core.BaseRepository.Interface;
using MeroHisab.Core.Entities;

namespace MeroHisab.Core.Repository.Interface
{
    public interface ILedgerSetupRepository:IBaseRepository<LedgerSetup>
    {
        Task<LedgerSetup> GetByKey(string key);
    }
}
